import { toggleMark } from '@milkdown/prose/commands';
import { $command, $markSchema, $remark, $view } from '@milkdown/utils';
import { visit } from 'unist-util-visit';

// [[name|display]]
const innerLinkFormat = '\\[\\[([^ /\\|\\]]+)(\\|([^)\\]]+))?\\]\\]';

// Extended markdown syntax for redmine inner link format.
// Parse markdown text to markdown AST.
export const innerLinkMark = $remark(
  'remarkInnerLink',
  () => () => (ast) => {
    const find = new RegExp(innerLinkFormat, "g");
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

        const name = match[1];
        const diplay = match[3] ? match[3] : name;
        const children = [{ type: 'text', value:diplay }];

        result.push({
          type: 'innerLink',
          href: name,
          children: children,
        });

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

// Schema for innerLink AST.
// https://github.com/Milkdown/milkdown/blob/v7.8.0/packages/transformer/src/utility/types.ts#L57
export const innerLinkSchema = $markSchema('innerLink', (ctx) => ({
  attrs: {
    href: {},
  },
  // Set high priority than linkSchema.
  parseDOM: [
    {
      priority: 100,
      tag: 'a:not([href*="/"])',
      getAttrs: (dom) => ({
        href: dom.getAttribute('href'),
      }),
    },
  ],
  // Use innerLinkMark remark.
  parseMarkdown: {
    match: (node) => node.type === 'innerLink',
    runner: (state, node, markType) => {
      const { href } = node;
      state.openMark(markType, { href });
      state.next(node.children)
      state.closeMark(markType);
    },
  },
  // Render markdown text.
  // AST --(toMarkdown)--> markdown text.
  toMarkdown: {
    match: (mark) => mark.type.name === 'innerLink',
    runner: (state, mark, node) => {
      const md = mark.attrs.href != node.text ? `[[${mark.attrs.href}|${node.text}]]` : `[[${mark.attrs.href}]]`;
      state.withMark(mark, 'text', md);
      // Not execute toMarkdown of node.
      return true;
    },
  },
}))

// View innerLink AST.
export const innerLinkView = $view(
  innerLinkSchema.mark,
  (ctx) => {
    return (mark, view, inline) => {
      const link = document.createElement('a');
      link.href = mark.attrs.href;

      link.addEventListener('click', function(e) {
        e.preventDefault();

        const { dispatch, state } = view;
        const { tr, selection } = state;
        const { $from } = selection;
        const node = $from.parent.child($from.index());
        const curMark = node.marks.find(({ type }) => type === innerLinkSchema.type(ctx));
        const href = window.prompt('Wiki:', curMark.attrs.href);
        if (href && href != curMark.attrs.href) {
          const from = $from.pos - $from.textOffset;
          const to = from + node.nodeSize;
          const markType = innerLinkSchema.type(ctx);
          tr
            .removeMark(from, to, curMark)
            .addMark(from, to, markType.create({ href }))
            .scrollIntoView();
          dispatch(tr);
        }
      });

      return {
        dom: link,
      }
    };
  },
)

// Insert or toggle text <--> innerLink AST.
export const toggleInnerLinkCommand = $command(
  'InnerLink',
  (ctx) =>
    () =>
      (state, dispatch) => {
        const { selection, tr } = state;
        const { $from, $to } = selection;

        if (selection.empty) {
          // Insert new innerLink.
          const href = window.prompt('Wiki:');
          if (href) {
            const markType = innerLinkSchema.type(ctx);
            const from = $from.pos;
            const to = from + href.length;
            tr
              .insertText(href)
              .addMark(from, to, markType.create({ href }));

            if (dispatch) {
              dispatch(tr.scrollIntoView());
              return true;
            }
          }

          return false;
        }

        // Toggle text and innerLink.
        const node = $from.node();
        const href = node.textContent.slice($from.parentOffset, $to.parentOffset);
        return toggleMark(innerLinkSchema.type(ctx), { href })(state, dispatch);
    },
);
