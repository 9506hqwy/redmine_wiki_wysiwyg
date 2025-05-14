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
