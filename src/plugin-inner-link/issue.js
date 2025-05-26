import { editorViewCtx } from "@milkdown/kit/core";
import { SlashProvider } from "@milkdown/kit/plugin/slash";
import { slashFactory } from "@milkdown/plugin-slash";
import { InputRule } from "@milkdown/prose/inputrules";
import { $inputRule, $markSchema, $remark } from "@milkdown/utils";
import { visit } from "unist-util-visit";

// #xxx
const innerLinkIssueFormat = "(^|\\s)(#\\d+)($|\\s)";

// Extended toMarkdown method  for redmine inner link format.
export const innerLinkIssueHandler = (node, _, state, info) => {
  const exit = state.enter("innerLinkIssue");
  const tracker = state.createTracker(info);

  const value = tracker.move(
    state.containerPhrasing(node, { ...tracker.current() }),
  );

  exit();
  return value;
};

// Extended markdown syntax for redmine inner link format.
// Parse markdown text to markdown AST.
export const innerLinkIssueMark = $remark(
  "remarkInnerLinkIssue",
  () => () => (ast) => {
    const find = new RegExp(innerLinkIssueFormat, "g");
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

        const issue_id = match[2];

        result.push({
          type: "innerLinkIssue",
          issue_id,
        });

        start = position + ws.length + issue_id.length;
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

// Schema for innerLinkIssue AST.
// https://github.com/Milkdown/milkdown/blob/v7.8.0/packages/transformer/src/utility/types.ts#L57
export const innerLinkIssueSchema = $markSchema("innerLinkIssue", (ctx) => ({
  // Set high priority than text.
  parseDOM: [
    {
      priority: 100,
      tag: 'span[data-innerlink_type="issue"]',
    },
  ],
  // View innerLinkIssue AST.
  // AST --> DOM
  toDOM: (mark) => ["a", { "data-innerlink_type": "issue" }],
  // Use innerLinkIssueMark remark.
  parseMarkdown: {
    match: (node) => node.type === "innerLinkIssue",
    runner: (state, node, markType) => {
      const { issue_id } = node;
      state.openMark(markType, { issue_id });
      state.addText(issue_id);
      state.closeMark(markType);
    },
  },
  // Render markdown text.
  // AST --(toMarkdown)--> markdown text.
  toMarkdown: {
    match: (mark) => mark.type.name === "innerLinkIssue",
    runner: (state, mark, node) => {
      state.withMark(mark, "innerLinkIssue");
    },
  },
}));

// Input innerLinkIssue Rule.
export const innerLinkIssueRule = $inputRule(
  (ctx) =>
    new InputRule(/(^|\s)(#\d+)(\s)$/, (state, match, start, end) => {
      const [matched, header, issue_id, tailer] = match;
      if (matched) {
        const { tr } = state;
        tr.addMark(
          start + header.length,
          end,
          innerLinkIssueSchema.type(ctx).create(),
        );
        tr.insertText(tailer);
        tr.removeMark(end, end + tailer.length);
        return tr;
      }

      return null;
    }),
);

// Auto-Complete innerLinkIssue.
export const innerLinkIssueSlash = slashFactory("innerLinkIssue");

export const innerLinkIssueSlashPlugin = (ctx) => {
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
    for (const issue of data) {
      const itemIdx = index.toString();
      const item = document.createElement("li");
      item.dataset.index = index;
      item.dataset.issue_id = issue.value;
      item.innerText = issue.label;
      item.addEventListener("mousemove", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setHighlight(itemIdx);
      });
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        insertIssueId(ctx.get(editorViewCtx), e.target);
      });

      list.appendChild(item);

      index += 1;
    }

    setHighlight("0");
  }

  function openCompleteList(opened) {
    ctx.update(innerLinkIssueSlash.key, (spec) => ({
      ...spec,
      opened,
    }));
  }

  function insertIssueId(view, item) {
    const { dispatch, state } = view;
    const { selection, tr } = state;
    const { $from } = selection;

    const text = item.dataset.issue_id;
    const start = $from.pos;
    const from = start - prompt.length;
    const to = from + text.length;
    tr.delete(from, start);
    tr.insertText(`${text} `).addMark(
      from - 1,
      to,
      innerLinkIssueSchema.type(ctx).create(),
    );
    tr.removeMark(to, to + 1);

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
      if (!getAutoCompleteUrl()) {
        return false;
      }

      const matched = /#(\d*)$/.exec(this.getContent(view));
      if (!matched) {
        openCompleteList(false);
        return false;
      }

      prompt = matched[1];
      openCompleteList(true);
      return true;
    },
  });

  provider.onShow = () => {
    const baseUrl = getAutoCompleteUrl();
    const option = {
      method: "GET",
      cache: "no-cache",
    };
    fetch(`${baseUrl}${prompt}`, option).then(onReceiveList);
  };

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
        if (!ctx.get(innerLinkIssueSlash.key).opened) {
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
          insertIssueId(view, cur);
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

function getAutoCompleteUrl() {
  if (window.rm && rm.AutoComplete.dataSources.issues) {
    return rm.AutoComplete.dataSources.issues;
  }

  const textarea = document.querySelector("textarea#content_text");
  if (textarea?.dataset.issuesUrl) {
    return textarea.dataset.issuesUrl;
  }

  return null;
}
