import {
  addColAfterCommand,
  addColBeforeCommand,
  addRowAfterCommand,
  addRowBeforeCommand,
  deleteSelectedCellsCommand,
  selectColCommand,
  selectRowCommand,
  setAlignCommand,
  tableCellSchema,
  tableHeaderSchema,
} from "@milkdown/preset-gfm";
import { $view, callCommand } from "@milkdown/utils";

let wysiwygEditor = null;

export const setupTableEditor = (editor) => {
  wysiwygEditor = editor;
};

// Extend tableCellSchema.
// https://github.com/Milkdown/milkdown/blob/v7.8.0/packages/transformer/src/utility/types.ts#L47
export const tableCellExSchema = tableCellSchema.extendSchema((prev) => {
  return (ctx) => {
    const baseSchema = prev(ctx);
    return {
      ...baseSchema,
      toMarkdown: {
        match: (node) => node.type.name === "table_cell",
        runner: (state, node) => {
          if (node.textContent.length === 0) {
            // Add empty string when content is only `ProseMirror-trailingBreak`,
            // because `ProseMirror-trailingBreak` is `<br />` HTML inline content.
            //
            // `ProseMirror-trailingBreak` is inserted.
            // https://github.com/ProseMirror/prosemirror-view/blob/1.39.1/src/viewdesc.ts#L1386
            state.addNode("text", [], "");
          } else {
            state.openNode("tableCell").next(node.content).closeNode();
          }
        },
      },
    };
  };
});

// Extend tableHeaderSchema.
export const tableHeaderExSchema = tableHeaderSchema.extendSchema((prev) => {
  return (ctx) => {
    const baseSchema = prev(ctx);
    return {
      ...baseSchema,
      toMarkdown: {
        match: (node) => node.type.name === "table_header",
        runner: (state, node) => {
          if (node.textContent.length === 0) {
            // Add empty string when content is only `ProseMirror-trailingBreak`,
            // because `ProseMirror-trailingBreak` is `<br />` HTML inline content.
            //
            // `ProseMirror-trailingBreak` is inserted.
            // https://github.com/ProseMirror/prosemirror-view/blob/1.39.1/src/viewdesc.ts#L1386
            state.addNode("text", [], "");
          } else {
            state.openNode("tableCell").next(node.content).closeNode();
          }
        },
      },
    };
  };
});

// View table header AST.
export const tableHeaderView = $view(tableHeaderSchema.node, (ctx) => {
  return (node, view, getPos, decorations, innerDecorations) => {
    const header = document.createElement("th");
    header.style = `text-align: ${node.attrs.alignment}`;

    const data = document.createElement("p");
    header.appendChild(data);
    header.addEventListener("click", (e) =>
      setupShowTableHeaderMenu(e, getPos),
    );

    return {
      dom: header,
      contentDOM: data,
    };
  };
});

// View table cell AST.
export const tableCellView = $view(tableCellSchema.node, (ctx) => {
  return (node, view, getPos, decorations, innerDecorations) => {
    const cell = document.createElement("td");
    cell.style = `text-align: ${node.attrs.alignment}`;

    const data = document.createElement("p");
    cell.appendChild(data);
    cell.addEventListener("click", (e) => setupShowTableRowMenu(e, getPos));

    return {
      dom: cell,
      contentDOM: data,
    };
  };
});

function createTableHeaderMenu(column, getPos) {
  const left = document.createElement("span");
  left.classList.add("button");
  left.classList.add("left");
  left.innerText = "L";
  left.addEventListener("click", () => {
    wysiwygEditor.action(
      callCommand(selectColCommand.key, { index: column, pos: getPos() }),
    );
    wysiwygEditor.action(callCommand(setAlignCommand.key, "left"));
  });

  const center = document.createElement("span");
  center.classList.add("button");
  center.classList.add("center");
  center.innerText = "C";
  center.addEventListener("click", () => {
    wysiwygEditor.action(
      callCommand(selectColCommand.key, { index: column, pos: getPos() }),
    );
    wysiwygEditor.action(callCommand(setAlignCommand.key, "center"));
  });

  const right = document.createElement("span");
  right.classList.add("button");
  right.classList.add("right");
  right.innerText = "R";
  right.addEventListener("click", () => {
    wysiwygEditor.action(
      callCommand(selectColCommand.key, { index: column, pos: getPos() }),
    );
    wysiwygEditor.action(callCommand(setAlignCommand.key, "right"));
  });

  const menu = document.createElement("div");
  menu.classList.add("menu");
  menu.append(left, center, right);

  const menuBox = document.createElement("div");
  menuBox.classList.add("wysiwyg-table-menu");
  menuBox.classList.add("header");
  menuBox.appendChild(menu);

  return menuBox;
}

function setupShowTableHeaderMenu(e, getPos) {
  let cell = e.target;
  if (cell.tagName !== "TH") {
    cell = cell.closest("th");
  }

  e.preventDefault();
  e.stopPropagation();

  const row = cell.closest("tr");
  const index = Array.prototype.indexOf.call(row.children, cell);

  showTableHeaderMenu(index, cell, getPos);
}

function showTableHeaderMenu(colmn, header, getPos) {
  removeTableHeaderMenu();
  removeTableRowMenu();

  const menu = createTableHeaderMenu(colmn, getPos);
  document.querySelector("body").appendChild(menu);
  document.addEventListener("click", removeTableHeaderMenu);

  const rect = header.getBoundingClientRect();
  menu.style.left = `${rect.x + window.scrollX + rect.width / 2}px`;
  menu.style.top = `${rect.top + window.scrollY}px`;
}

function removeTableHeaderMenu() {
  const menu = document.querySelector(".wysiwyg-table-menu.header");
  if (menu) {
    menu.remove();
    document.removeEventListener("click", removeTableHeaderMenu);
  }
}

function createTableRowMenu(row, column, getPos) {
  const addColBefore = document.createElement("span");
  addColBefore.classList.add("button");
  addColBefore.classList.add("add-col-before");
  addColBefore.innerText = "+";
  addColBefore.addEventListener("click", (e) => {
    e.stopPropagation();
    wysiwygEditor.action(
      callCommand(selectColCommand.key, { index: column, pos: getPos() }),
    );
    wysiwygEditor.action(callCommand(addColBeforeCommand.key));
  });

  const delCol = document.createElement("span");
  delCol.classList.add("button");
  delCol.classList.add("del-col");
  delCol.innerText = "-";
  delCol.addEventListener("click", (e) => {
    wysiwygEditor.action(
      callCommand(selectColCommand.key, { index: column, pos: getPos() }),
    );
    wysiwygEditor.action(callCommand(deleteSelectedCellsCommand.key));
  });

  const addColAfter = document.createElement("span");
  addColAfter.classList.add("button");
  addColAfter.classList.add("add-col-after");
  addColAfter.innerText = "+";
  addColAfter.addEventListener("click", (e) => {
    e.stopPropagation();
    wysiwygEditor.action(
      callCommand(selectColCommand.key, { index: column, pos: getPos() }),
    );
    wysiwygEditor.action(callCommand(addColAfterCommand.key));
  });

  const addRowBefore = document.createElement("span");
  addRowBefore.classList.add("button");
  addRowBefore.classList.add("add-row-before");
  addRowBefore.innerText = "+";
  addRowBefore.addEventListener("click", (e) => {
    e.stopPropagation();
    wysiwygEditor.action(
      callCommand(selectRowCommand.key, { index: row, pos: getPos() }),
    );
    wysiwygEditor.action(callCommand(addRowBeforeCommand.key));
  });

  const delRow = document.createElement("span");
  delRow.classList.add("button");
  delRow.classList.add("del-row");
  delRow.innerText = "-";
  delRow.addEventListener("click", (e) => {
    wysiwygEditor.action(
      callCommand(selectRowCommand.key, { index: row, pos: getPos() }),
    );
    wysiwygEditor.action(callCommand(deleteSelectedCellsCommand.key));
  });

  const addRowAfter = document.createElement("span");
  addRowAfter.classList.add("button");
  addRowAfter.classList.add("add-row-after");
  addRowAfter.innerText = "+";
  addRowAfter.addEventListener("click", (e) => {
    e.stopPropagation();
    wysiwygEditor.action(
      callCommand(selectRowCommand.key, { index: row, pos: getPos() }),
    );
    wysiwygEditor.action(callCommand(addRowAfterCommand.key));
  });

  const menu = document.createElement("div");
  menu.classList.add("menu");
  menu.append(
    addColBefore,
    delCol,
    addColAfter,
    addRowBefore,
    delRow,
    addRowAfter,
  );

  const menuBox = document.createElement("div");
  menuBox.classList.add("wysiwyg-table-menu");
  menuBox.classList.add("row");
  menuBox.appendChild(menu);

  return menuBox;
}

function setupShowTableRowMenu(e, getPos) {
  let cell = e.target;
  if (cell.tagName !== "TD") {
    cell = cell.closest("td");
  }

  e.preventDefault();
  e.stopPropagation();

  const row = cell.closest("tr");
  const columnIdx = Array.prototype.indexOf.call(row.children, cell);

  const table = row.closest("tbody");
  const rowIdx = Array.prototype.indexOf.call(table.children, row);

  const headerCell = table.children[0].children[columnIdx];

  const menu = table.children[rowIdx];
  const lastRowCell = menu.children[menu.children.length - 1];

  showTableRowMenu(rowIdx, columnIdx, headerCell, lastRowCell, getPos);
}

function showTableRowMenu(row, column, headerCell, lastRowCell, getPos) {
  removeTableHeaderMenu();
  removeTableRowMenu();

  const menu = createTableRowMenu(row, column, getPos);
  document.querySelector("body").appendChild(menu);
  document.addEventListener("click", removeTableRowMenu);

  const headerRect = headerCell.getBoundingClientRect();
  const headerX = headerRect.x + window.scrollX;
  const headerY = headerRect.top + window.scrollY;

  const addColBefore = menu.children[0].children[0];
  addColBefore.style.left = `${headerX}px`;
  addColBefore.style.top = `${headerY}px`;

  const delCol = menu.children[0].children[1];
  delCol.style.left = `${headerX + headerRect.width / 2}px`;
  delCol.style.top = `${headerY}px`;

  const addColAfter = menu.children[0].children[2];
  addColAfter.style.left = `${headerX + headerRect.width}px`;
  addColAfter.style.top = `${headerY}px`;

  const cellRect = lastRowCell.getBoundingClientRect();
  const cellX = cellRect.x + window.scrollX;
  const cellY = cellRect.top + window.scrollY;

  const addRowBefore = menu.children[0].children[3];
  addRowBefore.style.left = `${cellX + cellRect.width}px`;
  addRowBefore.style.top = `${cellY}px`;

  const delRow = menu.children[0].children[4];
  delRow.style.left = `${cellX + cellRect.width}px`;
  delRow.style.top = `${cellY + cellRect.height / 2}px`;

  const addRowAfter = menu.children[0].children[5];
  addRowAfter.style.left = `${cellX + cellRect.width}px`;
  addRowAfter.style.top = `${cellY + cellRect.height}px`;
}

function removeTableRowMenu() {
  const menu = document.querySelector(".wysiwyg-table-menu.row");
  if (menu) {
    menu.remove();
    document.removeEventListener("click", removeTableRowMenu);
  }
}
