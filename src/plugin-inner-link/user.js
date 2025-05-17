import { editorViewCtx } from "@milkdown/kit/core";
import { SlashProvider } from "@milkdown/kit/plugin/slash";
import { slashFactory } from "@milkdown/plugin-slash";
import { InputRule } from "@milkdown/prose/inputrules";
import { $inputRule, $nodeSchema, $remark, $view } from "@milkdown/utils";
import { visit } from "unist-util-visit";

// @xxx
const innerLinkUserFormat = "(^|\\s)(@[^\\s]+)($|\\s)";

// Extended toMarkdown method for redmine inner link format.
export const innerLinkUserHandler = (node, _, state, info) => {
  const exit = state.enter("innerLinkUser");
  const tracker = state.createTracker(info);

  const value = tracker.move(`@${node.login}`);

  exit();
  return value;
};

// Extended markdown syntax for redmine inner link format.
// Parse markdown text to markdown AST.
export const innerLinkUserMark = $remark(
  "remarkInnerLinkUser",
  () => () => (ast) => {
    const find = new RegExp(innerLinkUserFormat, "g");
    visit(ast, "text", (node, index, parent) => {
      if (!node.value || typeof node.value !== "string") {
        return;
      }

      const result = [];
      let start = 0;

      find.lastIndex = 0;
      let match = find.exec(node.value);
      while (match) {
        const position = match.index;

        if (start !== position) {
          result.push({
            type: "text",
            value: node.value.slice(start, position),
          });
        }

        const ws = match[1];
        if (ws) {
          result.push({
            type: "text",
            value: ws,
          });
        }

        const login = match[2];

        result.push({
          type: "innerLinkUser",
          login: login.slice(1), // remove "@"
        });

        start = position + ws.length + login.length;
        match = find.exec(node.value);
      }

      if (start < node.value.length) {
        result.push({ type: "text", value: node.value.slice(start) });
      }

      parent.children.splice(index, 1, ...result);
      return index + result.length;
    });
  },
);

// Schema for innerLinkUser AST.
// https://github.com/Milkdown/milkdown/blob/v7.10.1/packages/transformer/src/utility/types.ts#L47
export const innerLinkUserSchema = $nodeSchema("innerLinkUser", (ctx) => ({
  group: "inline",
  inline: true,
  atom: true,
  attrs: {
    login: {},
    name: {
      default: null,
    },
  },
  // Set high priority than text.
  parseDOM: [
    {
      priority: 100,
      tag: 'a[data-innerlink_type="user"]',
      getAttrs: (dom) => ({
        login: dom.dataset.login,
        name: dom.innerText,
      }),
    },
  ],
  // Use innerLinkUserMark remark.
  parseMarkdown: {
    match: (node) => node.type === "innerLinkUser",
    runner: (state, node, nodeType) => {
      const { login } = node;
      state.addNode(nodeType, { login });
    },
  },
  // Render markdown text.
  // AST --(toMarkdown)--> markdown text.
  toMarkdown: {
    match: (node) => node.type.name === "innerLinkUser",
    runner: (state, node) => {
      state.addNode("innerLinkUser", undefined, undefined, {
        login: node.attrs.login,
        name: node.attrs.name,
      });
    },
  },
}));

// View innerLinkUser AST.
export const innerLinkUserView = $view(innerLinkUserSchema.node, (ctx) => {
  return (node, view, getPos) => {
    const link = document.createElement("a");
    link.classList.add("user");
    link.classList.add("user-mention");
    link.dataset.innerlink_type = "user";
    link.dataset.login = node.attrs.login;
    link.innerText = `@${node.attrs.name ?? node.attrs.login}`;

    if (!node.attrs.name) {
      fetchUser(node.attrs.login, (response) => {
        if (response.ok) {
          response.json().then((data) => {
            for (const user of data) {
              if (user.login === node.attrs.login) {
                const { dispatch, state } = view;
                const { tr } = state;
                tr.setNodeAttribute(getPos(), "name", user.name);
                dispatch(tr);
              }
            }
          });
        }
      });
    }

    return {
      dom: link,
    };
  };
});

// Input innerLinkUser Rule.
export const innerLinkUserRule = $inputRule(
  (ctx) =>
    new InputRule(/(^|\s)(@[^\s]+)(\s)$/, (state, match, start, end) => {
      const [matched, header, mention, tailer] = match;
      if (matched) {
        const from = start + header.length;
        const login = mention.slice(1); // remove "@"
        const { tr } = state;
        tr.delete(from, end);
        tr.insert(from, innerLinkUserSchema.type(ctx).create({ login: login }));
        tr.insertText(tailer);
        return tr;
      }

      return null;
    }),
);

// Auto-Complete innerLinkUser.
export const innerLinkUserSlash = slashFactory("innerLinkUser");

export const innerLinkUserSlashPlugin = (ctx) => {
  const content = document.createElement("div");
  content.classList.add("tribute-container");

  const list = document.createElement("ul");
  content.appendChild(list);

  let prompt = "";

  function onReceiveList(response) {
    if (response.ok) {
      response.json().then(onComplete);
    }
  }

  function onComplete(data) {
    list.innerText = "";

    let index = 0;
    for (const user of data) {
      const itemIdx = index.toString();
      const item = document.createElement("li");
      item.dataset.index = index;
      item.dataset.login = user.login;
      item.innerText = user.name;
      item.addEventListener("mousemove", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setHighlight(itemIdx);
      });
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        insertUserId(ctx.get(editorViewCtx), e.target);
      });

      list.appendChild(item);

      index += 1;
    }

    setHighlight("0");
  }

  function openCompleteList(opened) {
    ctx.update(innerLinkUserSlash.key, (spec) => ({
      ...spec,
      opened,
    }));
  }

  function insertUserId(view, item) {
    const { dispatch, state } = view;
    const { selection, tr } = state;
    const { $from } = selection;

    const start = $from.pos;
    const from = start - prompt.length - 1; // - "@"
    tr.delete(from, start);
    tr.insert(
      from,
      innerLinkUserSchema
        .type(ctx)
        .create({ login: item.dataset.login, name: item.innerText }),
    );
    tr.insertText(" ");

    dispatch(tr.scrollIntoView());
    provider.hide();
  }

  function setHighlight(index) {
    for (const i of list.childNodes) {
      if (i.dataset.index === index) {
        i.classList.add("highlight");
      } else {
        i.classList.remove("highlight");
      }
    }
  }

  const provider = new SlashProvider({
    content,
    shouldShow(view, prevState) {
      if (!window.rm) {
        return false;
      }

      if (!rm.AutoComplete.dataSources.users) {
        return false;
      }

      const matched = /@([^\s+])$/.exec(this.getContent(view));
      if (!matched) {
        openCompleteList(false);
        return false;
      }

      prompt = matched[1];
      openCompleteList(true);
      return true;
    },
  });

  provider.onShow = () => fetchUser(prompt, onReceiveList);

  return {
    view: (view) => ({
      update: (updatedView, prevState) => {
        provider.update(updatedView, prevState);
      },
      destroy: () => {
        provider.destroy();
        content.remove();
      },
    }),
    props: {
      handleKeyDown: (view, event) => {
        if (!ctx.get(innerLinkUserSlash.key).opened) {
          return false;
        }

        if (
          event.keyCode !== 13 &&
          event.keyCode !== 38 &&
          event.keyCode !== 40
        ) {
          return false;
        }

        const cur = list.querySelector("li.highlight");
        if (event.keyCode === 13) {
          insertUserId(view, cur);
          return true;
        }

        const itemIdx = Number.parseInt(cur.dataset.index);
        let nextIdx = event.keyCode === 38 ? itemIdx - 1 : itemIdx + 1;
        if (nextIdx < 0) {
          nextIdx = list.childNodes.length - 1;
        } else if (nextIdx >= list.childNodes.length) {
          nextIdx = 0;
        }

        setHighlight(nextIdx.toString());
        return true;
      },
    },
    opened: false,
  };
};

function fetchUser(prompt, callback) {
  if (!window.rm) {
    return;
  }

  if (!rm.AutoComplete.dataSources.users) {
    return;
  }

  const baseUrl = rm.AutoComplete.dataSources.users;
  const option = {
    method: "GET",
    cache: "no-cache",
  };
  fetch(`${baseUrl}${prompt}`, option).then(callback);
}
