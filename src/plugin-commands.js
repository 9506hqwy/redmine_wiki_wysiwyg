import { editorViewCtx } from "@milkdown/kit/core";
import {
  inlineCodeSchema,
  listItemSchema,
  toggleInlineCodeCommand,
} from "@milkdown/kit/preset/commonmark";
import { findWrapping } from "@milkdown/kit/prose/transform";
import { toggleMark } from "@milkdown/prose/commands";
import { $command, callCommand } from "@milkdown/utils";

export const toggleInlineCodeExCommand = $command(
  "ToggleInlineCodeEx",
  (ctx) => () => (state, dispatch) => {
    const { tr, selection } = state;

    if (!selection.empty) {
      return callCommand(toggleInlineCodeCommand.key)(ctx);
    }

    return toggleMark(inlineCodeSchema.type(ctx))(state, dispatch);
  },
);

export const unwrapInBlockquoteCommand = $command(
  "UnwrapInBlockquote",
  (ctx) => () => (state, dispatch) => {
    const tr = state.tr;

    const { $from, $to } = tr.selection;
    const { depth } = $from;
    if (depth < 2) {
      return false;
    }

    const range = $from.blockRange($to);
    tr.lift(range, depth - 2);

    dispatch(tr.scrollIntoView());

    return true;
  },
);

export const wrapInTaskListCommand = $command(
  "WrapInTaskList",
  (ctx) => () => (state, dispatch) => {
    const tr = state.tr;

    const { $from, $to } = tr.selection;
    const range = $from.blockRange($to);

    const wrapping =
      range &&
      findWrapping(range, listItemSchema.type(ctx), { checked: false });

    tr.wrap(range, wrapping);

    dispatch(tr.scrollIntoView());

    return true;
  },
);

export const callCommandAndFocusEditor = (command, payload = null) => {
  return (ctx) => {
    ctx.get(editorViewCtx).focus();
    return callCommand(command, payload)(ctx);
  };
};
