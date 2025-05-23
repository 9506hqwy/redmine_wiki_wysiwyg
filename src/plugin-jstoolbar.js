import {
  createCodeBlockCommand,
  insertImageCommand,
  toggleEmphasisCommand,
  toggleStrongCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInHeadingCommand,
  wrapInOrderedListCommand,
} from "@milkdown/kit/preset/commonmark";
import {
  insertTableCommand,
  toggleStrikethroughCommand,
} from "@milkdown/kit/preset/gfm";
import {
  callCommandAndFocusEditor,
  toggleInlineCodeExCommand,
  unwrapInBlockquoteCommand,
  wrapInTaskListCommand,
} from "./plugin-commands";
import { toggleExternalLinkCommand } from "./plugin-external-link";
import { toggleInnerLinkWikiCommand } from "./plugin-inner-link";
import { setupShowPrecodeMenu } from "./plugin-precode";
import { setupTableEditor } from "./plugin-table";

function getJstb(func) {
  return document.querySelector(
    `div.jstTabs .tab-elements .jstElements .jstb_${func}`,
  );
}

function createButton(func) {
  const b = document.createElement("button");
  b.classList.add(`jstb_${func}`);
  b.type = "button";
  return b;
}

function setupButton(button, editor, command, param = null) {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    editor.action(callCommandAndFocusEditor(command.key, param));
  });
  return button;
}

function setupButtonPrecode(button, editor) {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    setupShowPrecodeMenu(e, editor);
  });
  return button;
}

function setupButtonImg(button, editor, command) {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    const uri = window.prompt("Image:");
    if (uri) {
      editor.action(
        callCommandAndFocusEditor(command.key, { src: uri, alt: uri }),
      );
    }
  });
  return button;
}

function createSep() {
  const s = document.createElement("spane");
  s.classList.add("jstSpacer");
  return s;
}

function appendChildIf(cond, parent, child) {
  if (cond) {
    parent.appendChild(child);
  }
}

function createJsToolBar(editor) {
  const bar = document.createElement("div");
  bar.classList.add("jstElements");

  // decorate text
  appendChildIf(
    getJstb("strong"),
    bar,
    setupButton(createButton("strong"), editor, toggleStrongCommand),
  );
  appendChildIf(
    getJstb("em"),
    bar,
    setupButton(createButton("em"), editor, toggleEmphasisCommand),
  );
  appendChildIf(
    getJstb("del"),
    bar,
    setupButton(createButton("del"), editor, toggleStrikethroughCommand),
  );
  appendChildIf(
    getJstb("code"),
    bar,
    setupButton(createButton("code"), editor, toggleInlineCodeExCommand),
  );

  // heading
  bar.appendChild(createSep());
  appendChildIf(
    getJstb("h1"),
    bar,
    setupButton(createButton("h1"), editor, wrapInHeadingCommand, 1),
  );
  appendChildIf(
    getJstb("h2"),
    bar,
    setupButton(createButton("h2"), editor, wrapInHeadingCommand, 2),
  );
  appendChildIf(
    getJstb("h3"),
    bar,
    setupButton(createButton("h3"), editor, wrapInHeadingCommand, 3),
  );

  // list
  bar.appendChild(createSep());
  appendChildIf(
    getJstb("ul"),
    bar,
    setupButton(createButton("ul"), editor, wrapInBulletListCommand),
  );
  appendChildIf(
    getJstb("ol"),
    bar,
    setupButton(createButton("ol"), editor, wrapInOrderedListCommand),
  );
  appendChildIf(
    getJstb("tl"),
    bar,
    setupButton(createButton("tl"), editor, wrapInTaskListCommand),
  );

  // block
  bar.appendChild(createSep());
  appendChildIf(
    getJstb("bq"),
    bar,
    setupButton(createButton("bq"), editor, wrapInBlockquoteCommand),
  );
  appendChildIf(
    getJstb("unbq"),
    bar,
    setupButton(createButton("unbq"), editor, unwrapInBlockquoteCommand),
  );
  appendChildIf(
    getJstb("table"),
    bar,
    setupButton(createButton("table"), editor, insertTableCommand, {}),
  );
  appendChildIf(
    getJstb("pre"),
    bar,
    setupButton(createButton("pre"), editor, createCodeBlockCommand),
  );
  appendChildIf(
    getJstb("precode"),
    bar,
    setupButtonPrecode(createButton("precode"), editor),
  );

  // link
  bar.appendChild(createSep());
  appendChildIf(
    getJstb("link"),
    bar,
    setupButton(createButton("link"), editor, toggleInnerLinkWikiCommand),
  );
  bar.appendChild(
    setupButton(createButton("extlink"), editor, toggleExternalLinkCommand),
  );
  appendChildIf(
    getJstb("img"),
    bar,
    setupButtonImg(createButton("img"), editor, insertImageCommand),
  );

  return bar;
}

function createJsToolBarItem(editor) {
  const item = document.createElement("li");
  item.classList.add("tab-wysiwyg-elements");
  item.appendChild(createJsToolBar(editor));
  return item;
}

export function setupJsToolBar(editor) {
  const bar = createJsToolBarItem(editor);

  const jst = document.querySelector("div.jstTabs .tab-elements .jstElements");
  jst.parentNode.after(bar);

  setupTableEditor(editor);

  return bar;
}
