import { commandsCtx } from "@milkdown/kit/core";
import { hardbreakSchema } from "@milkdown/kit/preset/commonmark";
import { isInTable } from "@milkdown/prose/tables";
import { $command, $remark, $useKeymap } from "@milkdown/utils";
import { visit } from "unist-util-visit";

// `hardbreak` is disabled in table in default.
// https://github.com/Milkdown/milkdown/blob/v7.10.0/packages/plugins/preset-commonmark/src/plugin/hardbreak-filter-plugin.ts#L7
//
// `hardbreak` is replaced whitespace in table.
// https://github.com/syntax-tree/mdast-util-to-markdown/blob/2.1.2/lib/handle/break.js#L19

// Extended toMarkdown method for `hardbreak` in table.
export const tableHardbreakHandler = (node, _, state, info) => {
  const exit = state.enter("tableHardbreak");
  const tracker = state.createTracker(info);

  const value = tracker.move("<br />");

  exit();
  return value;
};

// Extended markdown syntax for `hardbreak` in table.
// Parse markdown text to markdown AST.
export const tableHardbreakMark = $remark(
  "remarkTableHardbreak",
  () => () => (ast) => {
    const find = /^<br\s*\/>$/;
    visit(ast, "html", (node, index, parent) => {
      if (!node.value || typeof node.value !== "string") {
        return;
      }

      if (parent.type !== "tableCell" && parent.type !== "tableHeader") {
        return;
      }

      if (!find.exec(node.value)) {
        return;
      }

      parent.children.splice(index, 1, { type: "break", isIntable: true });
      return index + 1;
    });
  },
);

// Schema for `hardbreak` in table.
export const hardbreakExSchema = hardbreakSchema.extendSchema((prev) => {
  return (ctx) => {
    const baseSchema = prev(ctx);
    return {
      ...baseSchema,
      attrs: {
        isInline: {
          default: false,
        },
        isIntable: {
          default: false,
        },
      },
      parseDOM: [
        {
          priority: 100,
          tag: 'br[data-is-intable="true"]',
          getAttrs: () => ({ isIntable: true }),
        },
        ...baseSchema.parseDOM,
      ],
      parseMarkdown: {
        match: (node) => baseSchema.parseMarkdown.match(node),
        runner: (state, node, type) => {
          if (node.isIntable) {
            state.addNode(type, { isIntable: true });
          } else {
            baseSchema.parseMarkdown.runner(state, node, type);
          }
        },
      },
      toMarkdown: {
        match: (node) => baseSchema.toMarkdown.match(node),
        runner: (state, node) => {
          if (node.attrs.isIntable) {
            state.addNode("tableHardbreak");
          } else {
            baseSchema.toMarkdown.runner(state, node);
          }
        },
      },
    };
  };
});

// Insert `hardbreak` in table.
export const insertTableHardbreakCommand = $command(
  "InsertTableHardbreak",
  (ctx) => () => (state, dispatch) => {
    if (!isInTable(state)) {
      return false;
    }

    const { tr } = state;
    tr.setMeta(hardbreakSchema.key, true).replaceSelectionWith(
      hardbreakSchema.type(ctx).create({ isIntable: true }),
    );

    if (dispatch) {
      dispatch(tr.scrollIntoView());
    }

    return true;
  },
);

// Keymap for `hardbreak` in table.
export const tableHardbreakKeymap = $useKeymap("tableHardbreakKeymap", {
  InsertTableHardbreak: {
    shortcuts: ["Shift-Enter", "Enter"],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx);
      return () => commands.call(insertTableHardbreakCommand.key);
    },
  },
});
