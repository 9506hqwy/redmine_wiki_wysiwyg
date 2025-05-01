import { Editor, defaultValueCtx, rootCtx } from '@milkdown/kit/core'
// preset
import { commonmark, hardbreakFilterNodes } from "@milkdown/kit/preset/commonmark";
import { codeBlockComponent, codeBlockConfig } from "@milkdown/kit/component/code-block";
import { gfm } from "@milkdown/kit/preset/gfm";
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
import { setupJsToolBar } from './plugin-jstoolbar';
import { supportLanguages } from './plugin-precode';
import { tableCellView, tableHeaderView } from './plugin-table';
import "./wiki_wysiwyg.css";

var wysiwygEditor = null;

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
  let jstWysiwyg = null;

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
  wysiwygCommit.hidden = true;
  commit.after(wysiwygCommit);

  wysiwygCommit.addEventListener('click', function(e) {
    e.preventDefault();
    editContent.value = wysiwygEditor.action(getMarkdown());
    commit.click();
  });

  const disablewysiwygContent = () => {
    wysiwygTab.classList.remove('selected');

    if (jstWysiwyg != null) {
      jstWysiwyg.remove();
      jstWysiwyg = null;
    }

    wysiwygContent.classList.add('hidden');
    if (wysiwygEditor != null) {
      editContent.value = wysiwygEditor.action(getMarkdown());
      wysiwygEditor.destroy();
      wysiwygEditor = null;
    }

    commit.hidden = false;
    wysiwygCommit.hidden = true;
  };

  const enablewysiwygContent = (e) => {
    e.preventDefault();

    if (e.target.classList.contains('selected')) {
      return;
    }

    commit.hidden = true;
    wysiwygCommit.hidden = false;

    editTab.classList.remove('selected');
    previewTab.classList.remove('selected');
    wysiwygTab.classList.add('selected');

    jst.classList.add('hidden');

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
          const supportedCodeLangs = supportLanguages().map((l) => l.toLowerCase());
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
    jstWysiwyg = setupJsToolBar(wysiwygEditor);
  };

  editTab && editTab.parentNode.addEventListener('click', disablewysiwygContent);
  previewTab && previewTab.parentNode.addEventListener('click', disablewysiwygContent);
  wysiwygTab && wysiwygTab.addEventListener('click', enablewysiwygContent);
});
