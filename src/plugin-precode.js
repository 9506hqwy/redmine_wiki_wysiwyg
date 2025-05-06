import { createCodeBlockCommand } from "@milkdown/kit/preset/commonmark";
import { callCommandAndFocusEditor } from "./plugin-commands";

const defaultLanguages = [
  "c",
  "cpp",
  "csharp",
  "css",
  "diff",
  "go",
  "groovy",
  "html",
  "java",
  "javascript",
  "objc",
  "perl",
  "php",
  "python",
  "r",
  "ruby",
  "sass",
  "scala",
  "shell",
  "sql",
  "swift",
  "xml",
  "yaml",
];

export function supportLanguages() {
  return window.userHlLanguages || defaultLanguages;
}

function createPrecodeMenu(editor) {
  const menu = document.createElement("ul");

  for (const lang of supportLanguages()) {
    const item = document.createElement("li");
    item.addEventListener("click", () => {
      const l = lang;
      editor.action(callCommandAndFocusEditor(createCodeBlockCommand.key, l));
    });

    const text = document.createElement("div");
    text.innerHTML = lang;
    item.appendChild(text);

    menu.appendChild(item);
  }

  const menuBlock = document.createElement("div");
  menuBlock.classList.add("wysiwyg-precode-menu");
  menuBlock.appendChild(menu);

  return menuBlock;
}

export function setupShowPrecodeMenu(e, editor) {
  e.preventDefault();
  e.stopPropagation();

  const rect = e.target.getBoundingClientRect();
  const left = rect.x + window.scrollX;
  const top = rect.bottom + window.scrollY;

  showPrecodeMenu(left, top, editor);
}

function showPrecodeMenu(left, top, editor) {
  removePrecodeMenu();

  const menu = createPrecodeMenu(editor);
  document.querySelector("body").appendChild(menu);
  document.addEventListener("click", removePrecodeMenu);

  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
}

function removePrecodeMenu() {
  const menu = document.querySelector(".wysiwyg-precode-menu");
  if (menu) {
    menu.remove();
    document.removeEventListener("click", removePrecodeMenu);
  }
}
