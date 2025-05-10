import { toggleMark } from "@milkdown/prose/commands";
import { $command, $markSchema, $remark, $view } from "@milkdown/utils";
import { visit } from "unist-util-visit";

// [[project:name|display]]
const innerLinkWikiFormat =
  "\\[\\[(([^ /:\\]]+):)?([^ /\\|\\]]+)(\\|([^)\\]]+))?\\]\\]";

// Extended toMarkdown method  for redmine inner link format.
export const innerLinkWikiHandler = (node, _, state, info) => {
  const exit = state.enter("innerLinkWiki");
  const tracker = state.createTracker(info);

  let value = tracker.move("[[");

  if (node.project) {
    value += tracker.move(state.safe(node.project, info));
    value += tracker.move(":");
  }

  value += tracker.move(state.safe(node.href, info));

  if (node.href !== node.title) {
    value += tracker.move("|");
    value += tracker.move(
      state.containerPhrasing(node, {
        before: value,
        after: "]]",
        ...tracker.current(),
      }),
    );
  }

  value += tracker.move("]]");

  exit();
  return value;
};

// Extended markdown syntax for redmine inner link format.
// Parse markdown text to markdown AST.
export const innerLinkWikiMark = $remark(
  "remarkInnerLinkWiki",
  () => () => (ast) => {
    const find = new RegExp(innerLinkWikiFormat, "g");
    visit(ast, "text", (node, index, parent) => {
      if (!node.value || typeof node.value !== "string") {
        return;
      }

      const result = [];
      let start = 0;

      find.lastIndex = 0;
      let match = find.exec(node.value);
      while (match) {
        const position = match.index;

        if (start !== position) {
          result.push({
            type: "text",
            value: node.value.slice(start, position),
          });
        }

        const project = match[2];
        const name = match[3];
        const diplay = match[5] ? match[5] : name;
        const children = [{ type: "text", value: diplay }];

        result.push({
          type: "innerLinkWiki",
          href: name,
          project: project ?? null,
          children: children,
        });

        start = position + match[0].length;
        match = find.exec(node.value);
      }

      if (start < node.value.length) {
        result.push({ type: "text", value: node.value.slice(start) });
      }

      parent.children.splice(index, 1, ...result);
      return index + result.length;
    });
  },
);

// Schema for innerLinkWiki AST.
// https://github.com/Milkdown/milkdown/blob/v7.8.0/packages/transformer/src/utility/types.ts#L57
export const innerLinkWikiSchema = $markSchema("innerLinkWiki", (ctx) => ({
  attrs: {
    href: {},
    project: {
      default: null,
    },
  },
  // Set high priority than linkSchema.
  parseDOM: [
    {
      priority: 100,
      tag: 'a:not([href*="/"])',
      getAttrs: (dom) => ({
        href: dom.getAttribute("href"),
        project: dom.dataset.project,
      }),
    },
  ],
  // Use innerLinkWikiMark remark.
  parseMarkdown: {
    match: (node) => node.type === "innerLinkWiki",
    runner: (state, node, markType) => {
      const { href, project } = node;
      state.openMark(markType, { href, project });
      state.next(node.children);
      state.closeMark(markType);
    },
  },
  // Render markdown text.
  // AST --(toMarkdown)--> markdown text.
  toMarkdown: {
    match: (mark) => mark.type.name === "innerLinkWiki",
    runner: (state, mark, node) => {
      state.withMark(mark, "innerLinkWiki", undefined, {
        href: mark.attrs.href,
        project: mark.attrs.project,
        title: node.textContent,
      });
    },
  },
}));

// View innerLinkWiki AST.
export const innerLinkWikiView = $view(innerLinkWikiSchema.mark, (ctx) => {
  return (mark, view, inline) => {
    const link = document.createElement("a");
    link.href = mark.attrs.href;
    link.dataset.project = mark.attrs.project;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const { dispatch, state } = view;
      const { selection } = state;
      const { $from } = selection;
      const node = $from.parent.child($from.index());
      const curMark = node.marks.find(
        ({ type }) => type === innerLinkWikiSchema.type(ctx),
      );
      const title = node.textContent;

      const dialog = setupDialog(
        (e) => updateInnerLinkWiki(e, ctx, state, dispatch, node, curMark),
        (d) => {
          document.getElementById("wysisyg-inner-link-project").value =
            curMark.attrs.project;
          document.getElementById("wysisyg-inner-link-wiki").value =
            curMark.attrs.href;
          document.getElementById("wysisyg-inner-link-title").value = title;
          document.getElementById("wysisyg-inner-link-title").disabled = true;
        },
      );
      dialog.showModal();
    });

    return {
      dom: link,
    };
  };
});

// Insert or toggle text <--> innerLinkWiki AST.
export const toggleInnerLinkWikiCommand = $command(
  "InnerLinkWiki",
  (ctx) => () => (state, dispatch) => {
    const { selection } = state;
    if (selection.empty) {
      // Insert new innerLinkWiki.
      const dialog = setupDialog((e) =>
        insertInnerLinkWiki(e, ctx, state, dispatch),
      );
      dialog.showModal();
      return true;
    }

    // Toggle text and innerLinkWiki.
    const { $from, $to } = selection;
    const node = $from.node();
    const href = node.textContent.slice($from.parentOffset, $to.parentOffset);
    return toggleMark(innerLinkWikiSchema.type(ctx), { href })(state, dispatch);
  },
);

function createDialog(submitFunc) {
  // project
  const projectLabel = document.createElement("span");
  projectLabel.classList.add("label");
  projectLabel.for = "wysisyg-inner-link-project";
  projectLabel.innerText = "Project";

  const projectInput = document.createElement("input");
  projectInput.classList.add("input");
  projectInput.placeholder = "project name (optional)";
  projectInput.id = "wysisyg-inner-link-project";
  setupAutoComplete(projectInput);

  const projectBox = document.createElement("div");
  projectBox.classList.add("box");
  projectBox.append(projectLabel);
  projectBox.append(projectInput);

  // wiki
  const wikiLabel = document.createElement("span");
  wikiLabel.classList.add("label");
  wikiLabel.for = "wysisyg-inner-link-wiki";
  wikiLabel.innerText = "Wiki";

  const wikiInput = document.createElement("input");
  wikiInput.classList.add("input");
  wikiInput.placeholder = "wiki name";
  wikiInput.setAttribute("list", "wysisyg-inner-link-wiki-data");
  wikiInput.id = "wysisyg-inner-link-wiki";
  setupAutoComplete(wikiInput);

  const wikiData = document.createElement("datalist");
  wikiData.id = "wysisyg-inner-link-wiki-data";

  const wikiBox = document.createElement("div");
  wikiBox.classList.add("box");
  wikiBox.append(wikiLabel);
  wikiBox.append(wikiInput);
  wikiBox.append(wikiData);

  // title
  const titleLabel = document.createElement("span");
  titleLabel.classList.add("label");
  titleLabel.for = "wysisyg-inner-link-title";
  titleLabel.innerText = "Title";

  const titleInput = document.createElement("input");
  titleInput.classList.add("input");
  titleInput.placeholder = "display text (optional)";
  titleInput.id = "wysisyg-inner-link-title";

  const titleBox = document.createElement("div");
  titleBox.classList.add("box");
  titleBox.append(titleLabel);
  titleBox.append(titleInput);

  // button
  const okButton = document.createElement("button");
  okButton.type = "submit";
  okButton.value = "submit";
  okButton.innerText = "Ok";
  okButton.addEventListener("click", submitFunc);

  const cancelButton = document.createElement("button");
  cancelButton.type = "submit";
  cancelButton.value = "cancel";
  cancelButton.innerText = "Cancel";

  const opBox = document.createElement("div");
  opBox.classList.add("box");
  opBox.appendChild(cancelButton);
  opBox.appendChild(okButton);

  // form
  const form = document.createElement("form");
  form.method = "dialog";
  form.autocomplete = "off";
  form.appendChild(projectBox);
  form.appendChild(wikiBox);
  form.appendChild(titleBox);
  form.appendChild(opBox);

  // dialog
  const dialog = document.createElement("dialog");
  dialog.classList.add("wysisyg-inner-link-dialog");
  dialog.appendChild(form);
  dialog.addEventListener("close", () => {
    dialog.remove();
  });

  return dialog;
}

function setupDialog(submitFunc, setupFunc = null) {
  const dialog = createDialog(submitFunc);
  document.querySelector("body").appendChild(dialog);

  if (setupFunc) {
    setupFunc(dialog);
  }

  return dialog;
}

function insertInnerLinkWiki(e, ctx, state, dispatch) {
  e.stopPropagation();

  const wiki = document.getElementById("wysisyg-inner-link-wiki");
  const wikiName = wiki.value;
  if (!wikiName) {
    return false;
  }

  const project = document.getElementById("wysisyg-inner-link-project");
  const projectText = project.value ? project.value : null;

  const title = document.getElementById("wysisyg-inner-link-title");
  const titleText = title.value ? title.value : wikiName;

  const { selection, tr } = state;
  const { $from } = selection;

  const markType = innerLinkWikiSchema.type(ctx);
  const from = $from.pos;
  const to = from + titleText.length;
  tr.insertText(titleText).addMark(
    from,
    to,
    markType.create({ href: wikiName, project: projectText }),
  );

  if (dispatch) {
    dispatch(tr.scrollIntoView());
  }
}

function updateInnerLinkWiki(e, ctx, state, dispatch, node, mark) {
  e.stopPropagation();

  const wiki = document.getElementById("wysisyg-inner-link-wiki");
  const wikiName = wiki.value;
  if (!wikiName) {
    return false;
  }

  const project = document.getElementById("wysisyg-inner-link-project");
  const projectText = project.value ? project.value : null;

  const { tr, selection } = state;
  const { $from } = selection;
  const from = $from.pos - $from.textOffset;
  const to = from + node.nodeSize;
  const markType = innerLinkWikiSchema.type(ctx);
  tr.removeMark(from, to, mark)
    .addMark(
      from,
      to,
      markType.create({ href: wikiName, project: projectText }),
    )
    .scrollIntoView();
  dispatch(tr);
}

function setupAutoComplete(element) {
  if (!window.rm) {
    return;
  }

  const baseUrl = rm.AutoComplete.dataSources.wiki_pages;
  let timer = null;

  element.addEventListener("keyup", (e) => {
    if (e.keyCode >= 37 && e.keyCode <= 40) {
      return;
    }

    if (timer) {
      window.clearTimeout(timer);
    }

    timer = window.setTimeout(completeList, 300, e, baseUrl);
  });
}

function completeList(e, baseUrl) {
  const q = e.target.value;
  const project = document.getElementById("wysisyg-inner-link-project");
  if (q && !project.value) {
    const option = {
      method: "GET",
      cache: "no-cache",
    };
    fetch(`${baseUrl}${q}`, option).then(onReceiveList);
  } else {
    clearWikiInput();
  }
}

function onReceiveList(response) {
  if (response.ok) {
    response.json().then(onComplete);
  }
}

function onComplete(data) {
  const list = clearWikiInput();
  for (const wiki of data) {
    const option = document.createElement("option");
    option.value = wiki.label;
    list.appendChild(option);
  }
}

function clearWikiInput() {
  const list = document.querySelector("#wysisyg-inner-link-wiki-data");
  list.innerText = "";
  return list;
}
