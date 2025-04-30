import { createCodeBlockCommand } from "@milkdown/kit/preset/commonmark";
import { callCommand } from '@milkdown/utils';

function createPrecodeMenu(editor) {
  const menu = document.createElement('ul');

  for (const lang of window.userHlLanguages) {
    const item = document.createElement('li');
    item.addEventListener('click', function() {
      const l = lang;
      editor.action(callCommand(createCodeBlockCommand.key, l));
    });

    const text = document.createElement('div');
    text.innerHTML = lang;
    item.appendChild(text);

    menu.appendChild(item);
  }

  const menuBlock = document.createElement('div');
  menuBlock.classList.add('wysiwyg-precode-menu');
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
    document.querySelector('body').appendChild(menu);
    document.addEventListener('click', removePrecodeMenu);

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
}

function removePrecodeMenu() {
  const menu = document.querySelector('.wysiwyg-precode-menu');
  if (menu) {
    menu.remove();
    document.removeEventListener('click', removePrecodeMenu);
  }
}
