import { editorViewCtx } from '@milkdown/core';
import { markRule } from '@milkdown/prose';
import { toggleMark } from '@milkdown/prose/commands';
import { $command, $inputRule, $markAttr, $markSchema, $remark } from '@milkdown/utils';
import { visit } from 'unist-util-visit';

// Extended markdown syntax for redmine inner link format.
// Parse markdown text to markdown AST.
export const innerLinkMark = $remark(
  'remarkInnerLink',
  () => () => (ast) => {
    const find = /\[\[([^/\]]+)\]\]/g;
    visit(ast, 'text', (node, index, parent) => {
      if (!node.value || typeof node.value !== 'string') {
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
            type: 'text',
            value: node.value.slice(start, position),
          });
        }

        result.push({ type: 'innerLink', href: match[1] });

        start = position + match[0].length;
        match = find.exec(node.value);
      }

      if (start < node.value.length) {
        result.push({ type: 'text', value: node.value.slice(start) });
      }

      parent.children.splice(index, 1, ...result);
      return index + result.length;
    })
  }
);

// Attribute for innerLink AST.
export const innerLinkAttr = $markAttr('innerLink')

// Schema for innerLink AST.
// https://github.com/Milkdown/milkdown/blob/v7.8.0/packages/transformer/src/utility/types.ts#L57
export const innerLinkSchema = $markSchema('innerLink', (ctx) => ({
  priority: 100,
  attrs: {
    href: {},
  },
  /*
  parseDOM: [
    {
      tag: 'a:not([href*="/"])',
      getAttrs: (dom) => ({
        href: dom.getAttribute('href'),
      }),
    },
  ],
  */
  // Render WYSIWYG.
  // markdown text --(parseMarkdown)--> AST --(toDOM)--> DOM.
  toDOM: (mark) => ['a', { ...ctx.get(innerLinkAttr.key)(mark), ...mark.attrs }],
  // Use innerLinkMark remark.
  parseMarkdown: {
    match: (node) => node.type === 'innerLink',
    runner: (state, node, markType) => {
      const { href } = node;
      state.openMark(markType, { href });
      state.addText(href);
      state.closeMark(markType);
    },
  },
  // Render markdown text.
  // AST --(toMarkdown)--> markdown text.
  toMarkdown: {
    match: (mark) => mark.type.name === 'innerLink',
    runner: (state, mark) => {
      state.withMark(mark, 'text', `[[${mark.attrs.href}]]`);
    },
  },
}))

// Render innerLink AST during typing keyboard.
export const innerLinkRule = $inputRule(
  (ctx) => {
    return markRule(/\[\[([^/\]]+)\]\]/, innerLinkSchema.type(ctx), {
      getAttr: (match) => {
        return {
          href: match[1],
        }
      },
  })}
);

// Toggle text <--> innerLink AST.
export const toggleInnerLinkCommand = $command(
  'InnerLink',
  (ctx) =>
    () => {
      const { state } = ctx.get(editorViewCtx);
      const { selection } = state;
      const { $from, $to } = selection;
      const node = $from.node();
      const href = node.textContent.slice($from.parentOffset, $to.parentOffset);
      return toggleMark(innerLinkSchema.type(ctx), { href })
  },
);
