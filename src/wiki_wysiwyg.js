import { Crepe } from "@milkdown/crepe";
import {
  createCodeBlockCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
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
import { callCommand } from '@milkdown/utils';
import "@milkdown/crepe/theme/common/style.css";
import "./wiki_wysiwyg.css";

function setupPreCodeMenu(editor) {
  const menu = document.querySelector('.tab-wysiwyg-elements-precode-menu');
  menu.classList.add('hidden');

  for (const lang of window.userHlLanguages) {
    const text = document.createElement('div');
    text.classList.add('ui-menu-item-wrapper');
    text.innerHTML = lang;

    const item = document.createElement('li');
    item.classList.add('ui-menu-item')
    item.addEventListener('mousedown', function() {
      const l = lang;
      editor.action(callCommand(createCodeBlockCommand.key, l));
    });
    item.appendChild(text);

    menu.appendChild(item);
  }

  document.querySelector('body').appendChild(menu);
  document.addEventListener('mousedown', function() {
    menu.classList.add('hidden');
  })

  return menu;
}

function setupJsToolBar(editor) {
  const strong = document.querySelector('.tab-wysiwyg-elements .jstb_strong');
  strong.addEventListener('click', function() {
    editor.action(callCommand(toggleStrongCommand.key));
  });

  const em = document.querySelector('.tab-wysiwyg-elements .jstb_em');
  em.addEventListener('click', function() {
    editor.action(callCommand(toggleEmphasisCommand.key));
  });

  const del = document.querySelector('.tab-wysiwyg-elements .jstb_del');
  del.addEventListener('click', function() {
    editor.action(callCommand(toggleStrikethroughCommand.key));
  });

  const code = document.querySelector('.tab-wysiwyg-elements .jstb_code');
  code.addEventListener('click', function() {
    editor.action(callCommand(toggleInlineCodeCommand.key));
  });

  const h1 = document.querySelector('.tab-wysiwyg-elements .jstb_h1');
  h1.addEventListener('click', function() {
    editor.action(callCommand(wrapInHeadingCommand.key, 1));
  });

  const h2 = document.querySelector('.tab-wysiwyg-elements .jstb_h2');
  h2.addEventListener('click', function() {
    editor.action(callCommand(wrapInHeadingCommand.key, 2));
  });

  const h3 = document.querySelector('.tab-wysiwyg-elements .jstb_h3');
  h3.addEventListener('click', function() {
    editor.action(callCommand(wrapInHeadingCommand.key, 3));
  });

  const ul = document.querySelector('.tab-wysiwyg-elements .jstb_ul');
  ul.addEventListener('click', function() {
    editor.action(callCommand(wrapInBulletListCommand.key));
  });

  const ol = document.querySelector('.tab-wysiwyg-elements .jstb_ol');
  ol.addEventListener('click', function() {
    editor.action(callCommand(wrapInOrderedListCommand.key));
  });

  // TODO: jstb_tl

  const bq = document.querySelector('.tab-wysiwyg-elements .jstb_bq');
  bq.addEventListener('click', function() {
    editor.action(callCommand(wrapInBlockquoteCommand.key));
  });

  // TODO: jstb_unbq

  const table = document.querySelector('.tab-wysiwyg-elements .jstb_table');
  table.addEventListener('click', function() {
    editor.action(callCommand(insertTableCommand.key));
  });

  const pre = document.querySelector('.tab-wysiwyg-elements .jstb_pre');
  pre.addEventListener('click', function() {
    editor.action(callCommand(createCodeBlockCommand.key));
  });

  const preCodeMenu = setupPreCodeMenu(editor);
  const precode = document.querySelector('.tab-wysiwyg-elements .jstb_precode');
  precode.addEventListener('click', function(e) {
    const rect = e.target.getBoundingClientRect();
    preCodeMenu.style.left = `${rect.x + window.scrollX}px`;
    preCodeMenu.style.top = `${rect.bottom + window.scrollY}px`;
    preCodeMenu.classList.remove('hidden');
  });

  // TODO: jstb_link

  // TODO: jstb_img
}

document.addEventListener('DOMContentLoaded', function() {
  let wysiwygEditor = null;

  const editTab = document.querySelector('div.jstTabs .tab-edit');
  const previewTab = document.querySelector('div.jstTabs .tab-preview');
  const wysiwygTab = document.querySelector('.tab-wysiwyg');
  if (previewTab && wysiwygTab) {
    previewTab.closest('ul').insertBefore(wysiwygTab.parentNode, previewTab.parentNode.nextSibling);
  } else {
    wysiwygTab.style.display = 'none';
  }

  const jst = document.querySelector('div.jstTabs .tab-elements .jstElements');
  const jstWysiwyg = document.querySelector('.tab-wysiwyg-elements .jstElements');
  jstWysiwyg.classList.add('hidden');
  jst.parentNode.after(jstWysiwyg.parentNode);

  const editContent = document.querySelector('#content_text');
  const previewContent = document.querySelector('#preview_content_text');
  const wysiwygContent = document.querySelector('#wysiwyg_content_text');
  if (previewContent && wysiwygContent) {
    previewContent.parentNode.appendChild(wysiwygContent);
  } else {
    wysiwygContent.style.display = 'none';
  }

  const commit = document.querySelector('input[name="commit"]');
  const wysiwygCommit = document.querySelector('input[name="wysiwyg-commit"]');
  wysiwygCommit.classList.add("hidden");
  commit.after(wysiwygCommit);

  wysiwygCommit.addEventListener('click', function(e) {
    e.preventDefault();
    editContent.value = wysiwygEditor.getMarkdown();
    commit.click();
  });

  const disablewysiwygContent = () => {
    wysiwygTab.classList.remove('selected');
    jstWysiwyg.classList.add('hidden');
    wysiwygContent.classList.add('hidden');
    if (wysiwygEditor != null) {
      editContent.value = wysiwygEditor.getMarkdown();
      wysiwygEditor.destroy();
      wysiwygEditor = null;
    }

    commit.classList.remove("hidden");
    wysiwygCommit.classList.add("hidden");
  };

  const enablewysiwygContent = (e) => {
    e.preventDefault();

    if (e.target.classList.contains('selected')) {
      return;
    }

    commit.classList.add("hidden");
    wysiwygCommit.classList.remove("hidden");

    editTab.classList.remove('selected');
    previewTab.classList.remove('selected');
    wysiwygTab.classList.add('selected');

    jst.classList.add('hidden');
    jstWysiwyg.classList.remove('hidden');

    editContent.classList.add('hidden');
    previewContent.classList.add('hidden');
    wysiwygContent.classList.remove('hidden');

    wysiwygContent.innerHTML = '';

    wysiwygEditor = new Crepe({
       root: wysiwygContent,
       defaultValue: editContent.value,
       features: {
          [Crepe.Feature.BlockEdit]: false,
          [Crepe.Feature.Placeholder]: false,
          [Crepe.Feature.Toolbar]: false,
          [Crepe.Feature.Latex]: false,
       }
    });

    setupJsToolBar(wysiwygEditor.editor);

    wysiwygEditor.on((listener) => {
      listener.updated(function() {
        // Use jQuery change method because dispatchEvent does not work expectedly.
        $('#content_text').change();
      });
    });

    wysiwygEditor.create();
  };

  editTab && editTab.parentNode.addEventListener('click', disablewysiwygContent);
  previewTab && previewTab.parentNode.addEventListener('click', disablewysiwygContent);
  wysiwygTab && wysiwygTab.addEventListener('click', enablewysiwygContent);
});
