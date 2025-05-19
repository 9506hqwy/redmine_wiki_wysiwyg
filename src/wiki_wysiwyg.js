import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { languages } from "@codemirror/language-data";
import { keymap } from "@codemirror/view";
import {
  codeBlockComponent,
  codeBlockConfig,
} from "@milkdown/kit/component/code-block";
import {
  defaultListItemBlockConfig,
  listItemBlockComponent,
  listItemBlockConfig,
} from "@milkdown/kit/component/list-item-block";
import {
  Editor,
  defaultValueCtx,
  remarkStringifyOptionsCtx,
  rootCtx,
} from "@milkdown/kit/core";
import { clipboard } from "@milkdown/kit/plugin/clipboard";
import { history } from "@milkdown/kit/plugin/history";
import { indent } from "@milkdown/kit/plugin/indent";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { commonmark, hardbreakAttr } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { getMarkdown } from "@milkdown/kit/utils";
import { minimalSetup } from "codemirror";
import {
  toggleInlineCodeExCommand,
  unwrapInBlockquoteCommand,
  wrapInTaskListCommand,
} from "./plugin-commands";
import {
  externalLinkView,
  toggleExternalLinkCommand,
} from "./plugin-external-link";
import { imageView } from "./plugin-image";
import {
  innerLinkIssueHandler,
  innerLinkIssueMark,
  innerLinkIssueRule,
  innerLinkIssueSchema,
  innerLinkIssueSlash,
  innerLinkIssueSlashPlugin,
  innerLinkOtherHandler,
  innerLinkOtherMark,
  innerLinkOtherRule,
  innerLinkOtherSchema,
  innerLinkOtherView,
  innerLinkUserHandler,
  innerLinkUserMark,
  innerLinkUserRule,
  innerLinkUserSchema,
  innerLinkUserSlash,
  innerLinkUserSlashPlugin,
  innerLinkUserView,
  innerLinkWikiHandler,
  innerLinkWikiMark,
  innerLinkWikiSchema,
  innerLinkWikiView,
  toggleInnerLinkWikiCommand,
} from "./plugin-inner-link";
import { setupJsToolBar } from "./plugin-jstoolbar";
import { supportLanguages } from "./plugin-precode";
import {
  tableCellExSchema,
  tableCellView,
  tableHeaderExSchema,
  tableHeaderView,
} from "./plugin-table";
import {
  hardbreakExSchema,
  insertTableHardbreakCommand,
  tableHardbreakHandler,
  tableHardbreakKeymap,
  tableHardbreakMark,
} from "./plugin-table-hardbreak";
import "./wiki_wysiwyg.css";

document.addEventListener("DOMContentLoaded", () => {
  let jstWysiwyg = null;
  let wysiwygEditor = null;
  let wysiwygTimer = null;

  const wysiwygTab = initWysiwygTab();
  const wysiwygContent = initWysiwygContent();

  const commit = document.querySelector('input[name="commit"]');
  const wysiwygCommit = document.querySelector('input[name="wysiwyg-commit"]');
  wysiwygCommit.hidden = true;
  commit.after(wysiwygCommit);

  wysiwygCommit.addEventListener("click", (e) => {
    e.preventDefault();
    setContent(wysiwygEditor);
    commit.click();
  });

  const disableWysiwygContent = () => {
    wysiwygTab.classList.remove("selected");

    if (jstWysiwyg !== null) {
      jstWysiwyg.remove();
      jstWysiwyg = null;
    }

    wysiwygContent.classList.add("hidden");
    if (wysiwygEditor !== null) {
      setContent(wysiwygEditor);
      wysiwygEditor.destroy();
      wysiwygEditor = null;
    }

    commit.hidden = false;
    wysiwygCommit.hidden = true;
  };

  const enableWysiwygContent = (e) => {
    e.preventDefault();

    if (e.target.classList.contains("selected")) {
      return;
    }

    commit.hidden = true;
    wysiwygCommit.hidden = false;

    initTabs();
    wysiwygTab.classList.add("selected");

    initContents();
    wysiwygContent.classList.remove("hidden");

    wysiwygContent.innerHTML = "";

    wysiwygEditor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, wysiwygContent);

        const content = document.querySelector("#content_text");
        ctx.set(defaultValueCtx, content.value);

        const listener = ctx.get(listenerCtx);
        listener.updated(() => {
          // Use jQuery change method because dispatchEvent does not work expectedly.
          $("#content_text").change();

          if (wysiwygTimer) {
            window.clearTimeout(wysiwygTimer);
          }

          wysiwygTimer = window.setTimeout(() => {
            if (wysiwygEditor) {
              setContent(wysiwygEditor);
            }
          }, 300);
        });

        ctx.set(listItemBlockConfig.key, {
          renderLabel: ({ label, listType, checked, readonly }) => {
            if (checked === null) {
              return "";
            }
            return defaultListItemBlockConfig.renderLabel({
              label,
              listType,
              checked,
              readonly,
            });
          },
        });

        ctx.set(hardbreakAttr.key, (node) => {
          return {
            "data-type": "hardbreak",
            "data-is-inline": node.attrs.isInline,
            "data-is-intable": node.attrs.isIntable,
          };
        });

        const options = ctx.get(remarkStringifyOptionsCtx);
        options.handlers.innerLinkIssue = innerLinkIssueHandler;
        options.handlers.innerLinkOther = innerLinkOtherHandler;
        options.handlers.innerLinkUser = innerLinkUserHandler;
        options.handlers.innerLinkWiki = innerLinkWikiHandler;
        options.handlers.tableHardbreak = tableHardbreakHandler;

        ctx.update(codeBlockConfig.key, (defaultConfig) => {
          const supportedCodeLangs = supportLanguages().map((l) =>
            l.toLowerCase(),
          );
          const supportedLanguages = [];
          for (const lang of languages) {
            if (supportedCodeLangs.includes(lang.name.toLocaleLowerCase())) {
              supportedLanguages.push(lang);
              continue;
            }

            const alias = lang.alias.map((l) => l.toLowerCase());
            if (alias.find((a) => supportedCodeLangs.includes(a))) {
              supportedLanguages.push(lang);
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

        ctx.set(innerLinkIssueSlash.key, innerLinkIssueSlashPlugin(ctx));
        ctx.set(innerLinkUserSlash.key, innerLinkUserSlashPlugin(ctx));
      })
      // order the plugins by priority.
      .use([tableHardbreakKeymap, tableHardbreakMark])
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
      .use([innerLinkIssueMark, innerLinkIssueRule, innerLinkIssueSchema])
      .use(innerLinkIssueSlash)
      .use([
        innerLinkOtherMark,
        innerLinkOtherRule,
        innerLinkOtherSchema,
        innerLinkOtherView,
      ])
      .use([
        innerLinkUserMark,
        innerLinkUserRule,
        innerLinkUserSchema,
        innerLinkUserView,
      ])
      .use(innerLinkUserSlash)
      .use([innerLinkWikiMark, innerLinkWikiSchema, innerLinkWikiView])
      .use(toggleInnerLinkWikiCommand)
      .use(externalLinkView)
      .use(toggleExternalLinkCommand)
      .use(imageView)
      .use([
        tableCellExSchema,
        tableCellView,
        tableHeaderExSchema,
        tableHeaderView,
      ])
      .use(hardbreakExSchema)
      .use(insertTableHardbreakCommand);

    wysiwygEditor.create();
    jstWysiwyg = setupJsToolBar(wysiwygEditor);
  };

  setupDisableButton(disableWysiwygContent);
  wysiwygTab?.addEventListener("click", enableWysiwygContent);
});

function initTabs() {
  for (const tab of document.querySelectorAll('div.jstTabs a[class*="tab-"]')) {
    tab.classList.remove("selected");
  }

  const jst = document.querySelector("div.jstTabs .tab-elements .jstElements");
  jst.classList.add("hidden");
}

function initWysiwygTab() {
  const previewTab = document.querySelector("div.jstTabs .tab-preview");
  const wysiwygTab = document.querySelector(".tab-wysiwyg");
  if (previewTab && wysiwygTab) {
    previewTab
      .closest("ul")
      .insertBefore(wysiwygTab.parentNode, previewTab.parentNode.nextSibling);
  } else {
    wysiwygTab.style.display = "none";
  }

  return wysiwygTab;
}

function initContents() {
  for (const content of document.querySelectorAll("div.jstEditor > *")) {
    content.classList.add("hidden");
  }
}

function initWysiwygContent() {
  const previewContent = document.querySelector("#preview_content_text");
  const wysiwygContent = document.querySelector("#wysiwyg_content_text");
  if (previewContent && wysiwygContent) {
    previewContent.parentNode.appendChild(wysiwygContent);
  } else {
    wysiwygContent.style.display = "none";
  }

  return wysiwygContent;
}

function setContent(editor) {
  const content = document.querySelector("#content_text");
  content.value = editor.action(getMarkdown());
}

function setupDisableButton(callback) {
  for (const tab of document.querySelectorAll('div.jstTabs a[class*="tab-"]')) {
    if (!tab.classList.contains("tab-wysiwyg")) {
      tab.parentNode.addEventListener("click", callback);
    }
  }
}
