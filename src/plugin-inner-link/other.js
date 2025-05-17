import { InputRule } from "@milkdown/prose/inputrules";
import { $inputRule, $nodeSchema, $remark, $view } from "@milkdown/utils";
import { visit } from "unist-util-visit";

// xxx#yyy or xxx:zzz
const innerLinkFormats = [
  "document#(?<document_id>\\d+)",
  'document:(?<document_name>[^"]+)',
  'document:"(?<document_name>[^"]+)"',
  "news#(?<news_id>\\d+)",
  'news:(?<news_name>[^"]+)',
  'news:"(?<news_name>[^"]+)"',
  "version#(?<version_id>\\d+)",
  'version:(?<version_name>[^"]+)',
  'version:"(?<version_name>[^"]+)"',
  "message#(?<message_id>\\d+)",
  'attachment:(?<attachment_name>[^"]+)',
  'attachment:"(?<attachment_name>[^"]+)"',
  'source:(?<source_name>[^"]+)',
  'source:"(?<source_name>[^"]+)"',
];
const innerLinkOtherFormat = `(^|\\s)(${innerLinkFormats.join("|")})($|\\s)`;

// Extended toMarkdown method  for redmine inner link format.
export const innerLinkOtherHandler = (node, _, state, info) => {
  const exit = state.enter("innerLinkOther");
  const tracker = state.createTracker(info);

  const value = tracker.move(node.value);

  exit();
  return value;
};

// Extended markdown syntax for redmine inner link format.
// Parse markdown text to markdown AST.
export const innerLinkOtherMark = $remark(
  "remarkInnerLinkOther",
  () => () => (ast) => {
    const find = new RegExp(innerLinkOtherFormat, "g");
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
          start = position + ws.length;
        }

        const rawText = match[2];
        const linkData = getLinkTarget(match);
        if (linkData) {
          result.push(linkData);
          start += rawText.length;
        }

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

// Schema for innerLinkOther AST.
// https://github.com/Milkdown/milkdown/blob/v7.8.0/packages/transformer/src/utility/types.ts#L57
export const innerLinkOtherSchema = $nodeSchema("innerLinkOther", (ctx) => ({
  content: "text*",
  group: "inline",
  inline: true,
  atom: true,
  attrs: {
    kind: {},
    id: {
      default: null,
    },
    name: {
      default: null,
    },
  },
  // Set high priority than text.
  parseDOM: [
    {
      priority: 50,
      tag: "a[data-innerlink_type]",
      getAttrs: (dom) => ({
        kind: dom.dataset.innerlink_type,
        id: dom.dataset.innerlink_id,
        name: dom.dataset.innerlink_name,
      }),
    },
  ],
  // Use innerLinkOtherMark remark.
  parseMarkdown: {
    match: (node) => node.type === "innerLinkOther",
    runner: (state, node, nodeType) => {
      const { innerLinkType, innerLinkId, innerLinkName, innerLinkText } = node;
      state.addNode(
        nodeType,
        {
          kind: innerLinkType,
          id: innerLinkId,
          name: innerLinkName,
        },
        [state.schema.text(innerLinkText)],
      );
    },
  },
  // Render markdown text.
  // AST --(toMarkdown)--> markdown text.
  toMarkdown: {
    match: (node) => node.type.name === "innerLinkOther",
    runner: (state, node) => {
      state.addNode("innerLinkOther", undefined, node.textContent, {
        kind: node.attrs.kind,
        id: node.attrs.id,
        name: node.attrs.name,
      });
    },
  },
}));

// View innerLinkOther AST.
export const innerLinkOtherView = $view(innerLinkOtherSchema.node, (ctx) => {
  return (node, view, getPos) => {
    const link = document.createElement("a");
    link.classList.add(node.attrs.kind);
    link.dataset.innerlink_type = node.attrs.kind;
    link.dataset.innerlink_id = node.attrs.id;
    link.dataset.innerlink_name = node.attrs.name;
    link.innerText = node.textContent;

    if (node.attrs.name) {
      link.innerText = node.attrs.name;
    } else if (node.attrs.id) {
      fetchLinkTarget(node.attrs, (response) => {
        if (response.ok) {
          if (/json/.exec(response.headers.get("content-type"))) {
            response.json().then((data) => {
              const { dispatch, state } = view;
              const { tr } = state;
              switch (node.attrs.kind) {
                case "news":
                  tr.setNodeAttribute(getPos(), "name", data.news.title);
                  break;
                case "version":
                  tr.setNodeAttribute(getPos(), "name", data.version.name);
                  break;
              }

              dispatch(tr);
            });
          } else {
            response.text().then((data) => {
              const doc = Document.parseHTMLUnsafe(data);
              const title = doc.querySelector("#content h2");
              const { dispatch, state } = view;
              const { tr } = state;
              switch (node.attrs.kind) {
                case "document":
                  tr.setNodeAttribute(getPos(), "name", title.innerText);
                  break;
                case "message":
                  tr.setNodeAttribute(getPos(), "name", title.innerText);
                  break;
              }

              dispatch(tr);
            });
          }
        }
      });
    }

    return {
      dom: link,
    };
  };
});

// Input innerLinkOther Rule.
export const innerLinkOtherRule = $inputRule(
  (ctx) =>
    new InputRule(
      new RegExp(`(^|\\s)(${innerLinkFormats.join("|")})(\\s)$`),
      (state, match, start, end) => {
        const [matched, header] = match;
        if (matched) {
          const linkData = getLinkTarget(match);
          const from = start + header.length;
          const { tr } = state;
          tr.delete(from, end);
          tr.insert(
            from,
            innerLinkOtherSchema.type(ctx).create(
              {
                kind: linkData.innerLinkType,
                id: linkData.innerLinkId,
                name: linkData.innerLinkName,
              },
              state.schema.text(linkData.innerLinkText),
            ),
          );
          tr.insertText(match[match.length - 1]);
          return tr;
        }

        return null;
      },
    ),
);

function getLinkTarget(match) {
  const rawText = match[2];
  if (match.groups.document_id) {
    return {
      type: "innerLinkOther",
      innerLinkType: "document",
      innerLinkId: match.groups.document_id,
      innerLinkText: rawText,
    };
  }

  if (match.groups.document_name) {
    return {
      type: "innerLinkOther",
      innerLinkType: "document",
      innerLinkName: match.groups.document_name,
      innerLinkText: rawText,
    };
  }

  if (match.groups.news_id) {
    return {
      type: "innerLinkOther",
      innerLinkType: "news",
      innerLinkId: match.groups.news_id,
      innerLinkText: rawText,
    };
  }

  if (match.groups.news_name) {
    return {
      type: "innerLinkOther",
      innerLinkType: "news",
      innerLinkName: match.groups.news_name,
      innerLinkText: rawText,
    };
  }

  if (match.groups.version_id) {
    return {
      type: "innerLinkOther",
      innerLinkType: "version",
      innerLinkId: match.groups.version_id,
      innerLinkText: rawText,
    };
  }

  if (match.groups.version_name) {
    return {
      type: "innerLinkOther",
      innerLinkType: "version",
      innerLinkName: match.groups.version_name,
      innerLinkText: rawText,
    };
  }

  if (match.groups.message_id) {
    return {
      type: "innerLinkOther",
      innerLinkType: "message",
      innerLinkId: match.groups.message_id,
      innerLinkText: rawText,
    };
  }

  if (match.groups.attachment_name) {
    return {
      type: "innerLinkOther",
      innerLinkType: "attachment",
      innerLinkName: match.groups.attachment_name,
      innerLinkText: rawText,
    };
  }

  if (match.groups.source_name) {
    return {
      type: "innerLinkOther",
      innerLinkType: "source",
      innerLinkName: match.groups.source_name,
      innerLinkText: rawText,
    };
  }

  console.log(`ERROR: ${match}`);
  return null;
}

function fetchLinkTarget(node, callback) {
  let url;
  switch (node.kind) {
    case "document":
      url = `/documents/${node.id}`;
      break;
    case "news":
      url = `/news/${node.id}.json`;
      break;
    case "version":
      url = `/versions/${node.id}.json`;
      break;
    case "message":
      // TODO: board_id
      url = `/boards/:board_id/topics/${node.id}`;
      return;
  }
  const option = {
    method: "GET",
    cache: "no-cache",
  };
  fetch(url, option).then(callback);
}
