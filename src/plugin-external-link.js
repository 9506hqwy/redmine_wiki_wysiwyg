import { linkSchema } from "@milkdown/preset-commonmark";
import { toggleMark } from "@milkdown/prose/commands";
import { $command, $view } from "@milkdown/utils";

// View link AST.
export const externalLinkView = $view(linkSchema.mark, (ctx) => {
  return (mark, view, inline) => {
    const link = document.createElement("a");
    link.href = mark.attrs.href;
    link.title = mark.attrs.title;
    link.classList.add("external");

    link.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const { dispatch, state } = view;
      const { tr, selection } = state;
      const { $from } = selection;
      const node = $from.parent.child($from.index());
      const curMark = node.marks.find(
        ({ type }) => type === linkSchema.type(ctx),
      );
      const uri = window.prompt("URL:", curMark.attrs.href);
      const href = uri ? toUrl(uri) : undefined;
      if (href && href !== curMark.attrs.href) {
        const from = $from.pos - $from.textOffset;
        const to = from + node.nodeSize;
        const markType = linkSchema.type(ctx);
        tr.removeMark(from, to, curMark)
          .addMark(from, to, markType.create({ ...curMark.attrs, href }))
          .scrollIntoView();
        dispatch(tr);
      }
    });

    return {
      dom: link,
    };
  };
});

// Insert or toggle text <--> link AST.
export const toggleExternalLinkCommand = $command(
  "ExternalLink",
  (ctx) => () => (state, dispatch) => {
    const { selection, tr } = state;
    const { $from, $to } = selection;

    if (selection.empty) {
      // Insert new link.
      const uri = window.prompt("URL:");
      if (uri) {
        const markType = linkSchema.type(ctx);
        const from = $from.pos;
        const to = from + uri.length;
        const href = toUrl(uri);
        tr.insertText(uri).addMark(from, to, markType.create({ href }));

        if (dispatch) {
          dispatch(tr.scrollIntoView());
          return true;
        }
      }

      return false;
    }

    // Toggle text and link.
    const node = $from.node();
    const uri = node.textContent.slice($from.parentOffset, $to.parentOffset);
    const href = toUrl(uri);
    return toggleMark(linkSchema.type(ctx), { href })(state, dispatch);
  },
);

function toUrl(value) {
  const a = document.createElement("a");
  a.href = value;
  return a.href;
}
