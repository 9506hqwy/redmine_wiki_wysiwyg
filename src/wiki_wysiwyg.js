import { Editor, defaultValueCtx, rootCtx } from '@milkdown/kit/core'
// preset
import {
  commonmark,
  hardbreakFilterNodes,
  createCodeBlockCommand,
  insertImageCommand,
  toggleEmphasisCommand,
  toggleStrongCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInHeadingCommand,
  wrapInOrderedListCommand,
} from "@milkdown/kit/preset/commonmark";
import { codeBlockComponent, codeBlockConfig } from "@milkdown/kit/component/code-block";
import {
  gfm,
  insertTableCommand,
  toggleStrikethroughCommand,
} from "@milkdown/kit/preset/gfm";
// component
import { listItemBlockComponent, listItemBlockConfig, defaultListItemBlockConfig } from "@milkdown/kit/component/list-item-block";
// plugin
import { clipboard } from '@milkdown/kit/plugin/clipboard'
import { history } from '@milkdown/kit/plugin/history'
import { indent } from '@milkdown/kit/plugin/indent'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
// other
import { minimalSetup } from "codemirror";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { languages } from "@codemirror/language-data";
import { keymap } from '@codemirror/view'
import { getMarkdown } from '@milkdown/kit/utils'
// local
import {
  callCommandAndFocusEditor,
  toggleInlineCodeExCommand,
  unwrapInBlockquoteCommand,
  wrapInTaskListCommand,
} from './plugin-commands';
import {
  innerLinkMark,
  innerLinkSchema,
  innerLinkView,
  toggleInnerLinkCommand,
} from './plugin-inner-link';
import { externalLinkView, toggleExternalLinkCommand } from './plugin-external-link';
import { imageView } from './plugin-image';
import { setupShowPrecodeMenu } from './plugin-precode';
import { tableCellView, tableHeaderView, setupTableEditor } from './plugin-table';
import "./wiki_wysiwyg.css";

var wysiwygEditor = null;

function setupJsToolBar() {
  const strong = document.querySelector('.tab-wysiwyg-elements .jstb_strong');
  strong.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(toggleStrongCommand.key));
  });

  const em = document.querySelector('.tab-wysiwyg-elements .jstb_em');
  em.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(toggleEmphasisCommand.key));
  });

  const del = document.querySelector('.tab-wysiwyg-elements .jstb_del');
  del.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(toggleStrikethroughCommand.key));
  });

  const code = document.querySelector('.tab-wysiwyg-elements .jstb_code');
  code.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(toggleInlineCodeExCommand.key));
  });

  const h1 = document.querySelector('.tab-wysiwyg-elements .jstb_h1');
  h1.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(wrapInHeadingCommand.key, 1));
  });

  const h2 = document.querySelector('.tab-wysiwyg-elements .jstb_h2');
  h2.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(wrapInHeadingCommand.key, 2));
  });

  const h3 = document.querySelector('.tab-wysiwyg-elements .jstb_h3');
  h3.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(wrapInHeadingCommand.key, 3));
  });

  const ul = document.querySelector('.tab-wysiwyg-elements .jstb_ul');
  ul.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(wrapInBulletListCommand.key));
  });

  const ol = document.querySelector('.tab-wysiwyg-elements .jstb_ol');
  ol.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(wrapInOrderedListCommand.key));
  });

  const tl = document.querySelector('.tab-wysiwyg-elements .jstb_tl');
  tl.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(wrapInTaskListCommand.key));
  });

  const bq = document.querySelector('.tab-wysiwyg-elements .jstb_bq');
  bq.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(wrapInBlockquoteCommand.key));
  });

  const unbq = document.querySelector('.tab-wysiwyg-elements .jstb_unbq');
  unbq.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(unwrapInBlockquoteCommand.key));
  });

  const table = document.querySelector('.tab-wysiwyg-elements .jstb_table');
  table.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(insertTableCommand.key, {}));
  });

  const pre = document.querySelector('.tab-wysiwyg-elements .jstb_pre');
  pre.addEventListener('click', function() {
    // TODO: recover focus to current position.
    wysiwygEditor.action(callCommandAndFocusEditor(createCodeBlockCommand.key, ''));
  });

  const precode = document.querySelector('.tab-wysiwyg-elements .jstb_precode');
  precode.addEventListener('click', function(e) {
    // TODO: Add undo support when existing block is changed to code block.
    setupShowPrecodeMenu(e, wysiwygEditor);
  });

  const link = document.querySelector('.tab-wysiwyg-elements .jstb_link');
  link.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(toggleInnerLinkCommand.key));
  });

  const extlink = document.querySelector('.tab-wysiwyg-elements .jstb_extlink');
  extlink.addEventListener('click', function() {
    wysiwygEditor.action(callCommandAndFocusEditor(toggleExternalLinkCommand.key));
  });

  const img = document.querySelector('.tab-wysiwyg-elements .jstb_img');
  img.addEventListener('click', function() {
    const uri = window.prompt('Image:');
    wysiwygEditor.action(callCommandAndFocusEditor(insertImageCommand.key, { src: uri, alt: uri }));
  });
}

document.addEventListener('DOMContentLoaded', function() {
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
    editContent.value = wysiwygEditor.action(getMarkdown());
    commit.click();
  });

  const disablewysiwygContent = () => {
    wysiwygTab.classList.remove('selected');
    jstWysiwyg.classList.add('hidden');
    wysiwygContent.classList.add('hidden');
    if (wysiwygEditor != null) {
      editContent.value = wysiwygEditor.action(getMarkdown());
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

    wysiwygEditor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, wysiwygContent);

        ctx.set(defaultValueCtx, editContent.value);

        const listener = ctx.get(listenerCtx);
        listener.updated(function() {
          // Use jQuery change method because dispatchEvent does not work expectedly.
          $('#content_text').change();
        });

        ctx.set(listItemBlockConfig.key, {
          renderLabel: ({ label, listType, checked, readonly }) => {
            if (checked == null) {
              return '';
            }
             return defaultListItemBlockConfig.renderLabel({label, listType, checked, readonly});
          },
        });

        // Not support break in table.
        //ctx.set(hardbreakFilterNodes.key, ['code_block']);

        ctx.update(codeBlockConfig.key, (defaultConfig) => {
          const supportedCodeLangs = window.userHlLanguages.map((l) => l.toLowerCase());
          const supportedLanguages = [];
          for (const lang of languages) {
            if (supportedCodeLangs.includes(lang.name.toLocaleLowerCase())) {
              supportedLanguages.push(lang);
              continue;
            }

            const alias = lang.alias.map((l) => l.toLowerCase());
            if (alias.find((a) => supportedCodeLangs.includes(a))) {
              supportedLanguages.push(lang);
              continue;
            }
          }

          return {
            ...defaultConfig,
            extensions: [
              keymap.of(defaultKeymap.concat(indentWithTab)),
              minimalSetup,
            ],
            languages: supportedLanguages,
          };
        });
      })
      .use(codeBlockComponent)
      .use(commonmark)
      .use(clipboard)
      .use(gfm)
      .use(history)
      .use(indent)
      .use(listener)
      .use(listItemBlockComponent)
      .use(toggleInlineCodeExCommand)
      .use(unwrapInBlockquoteCommand)
      .use(wrapInTaskListCommand)
      .use([innerLinkMark, innerLinkSchema, innerLinkView])
      .use(toggleInnerLinkCommand)
      .use(externalLinkView)
      .use(toggleExternalLinkCommand)
      .use(imageView)
      .use([tableCellView, tableHeaderView]);

    wysiwygEditor.create();
    setupTableEditor(wysiwygEditor);
  };

  setupJsToolBar();

  editTab && editTab.parentNode.addEventListener('click', disablewysiwygContent);
  previewTab && previewTab.parentNode.addEventListener('click', disablewysiwygContent);
  wysiwygTab && wysiwygTab.addEventListener('click', enablewysiwygContent);
});
