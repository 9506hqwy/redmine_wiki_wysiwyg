import { defaultKeymap as ie, indentWithTab as le } from "https://cdn.jsdelivr.net/npm/@codemirror/commands@6.8.1/+esm";
import { languages as de } from "https://cdn.jsdelivr.net/npm/@codemirror/language-data@6.5.1/+esm";
import { keymap as ue } from "https://cdn.jsdelivr.net/npm/@codemirror/view@6.36.7/+esm";
import { codeBlockConfig as me, codeBlockComponent as pe } from "https://esm.run/@milkdown/kit@7.8.0/lib/component/code-block.js";
import { listItemBlockConfig as fe, defaultListItemBlockConfig as ye, listItemBlockComponent as he } from "https://esm.run/@milkdown/kit@7.8.0/lib/component/list-item-block.js";
import { editorViewCtx as ke, commandsCtx as we, Editor as ge, rootCtx as be, defaultValueCtx as ve, remarkStringifyOptionsCtx as Le } from "https://esm.run/@milkdown/kit@7.8.0/lib/core.js";
import { clipboard as Ce } from "https://esm.run/@milkdown/kit@7.8.0/lib/plugin/clipboard.js";
import { history as xe } from "https://esm.run/@milkdown/kit@7.8.0/lib/plugin/history.js";
import { indent as Ee } from "https://esm.run/@milkdown/kit@7.8.0/lib/plugin/indent.js";
import { listenerCtx as Ie, listener as Se } from "https://esm.run/@milkdown/kit@7.8.0/lib/plugin/listener.js";
import { toggleInlineCodeCommand as Te, inlineCodeSchema as je, listItemSchema as Me, createCodeBlockCommand as K, toggleStrongCommand as $e, toggleEmphasisCommand as Be, wrapInHeadingCommand as A, wrapInBulletListCommand as qe, wrapInOrderedListCommand as Re, wrapInBlockquoteCommand as He, insertImageCommand as De, hardbreakSchema as _, hardbreakAttr as Ae, commonmark as Ne } from "https://esm.run/@milkdown/kit@7.8.0/lib/preset/commonmark.js";
import { toggleStrikethroughCommand as Oe, insertTableCommand as _e, gfm as Ve } from "https://esm.run/@milkdown/kit@7.8.0/lib/preset/gfm.js";
import { getMarkdown as X } from "https://esm.run/@milkdown/kit@7.8.0/lib/utils.js";
import { minimalSetup as Pe } from "https://cdn.jsdelivr.net/npm/codemirror@6.0.1/+esm";
import { findWrapping as Ue } from "https://esm.run/@milkdown/kit@7.8.0/lib/prose/transform.js";
import { toggleMark as U } from "https://esm.run/@milkdown/prose@7.8.0/lib/commands.js";
import { $command as j, callCommand as h, $view as B, $remark as z, $markSchema as We, $useKeymap as Xe } from "https://cdn.jsdelivr.net/npm/@milkdown/utils@7.8.0/+esm";
import { linkSchema as M, imageSchema as Ye } from "https://cdn.jsdelivr.net/npm/@milkdown/preset-commonmark@7.8.0/+esm";
import { visit as F } from "https://cdn.jsdelivr.net/npm/unist-util-visit@5.0.0/+esm";
import { tableCellSchema as G, tableHeaderSchema as Q, selectColCommand as S, setAlignCommand as N, addColBeforeCommand as Je, deleteSelectedCellsCommand as Y, addColAfterCommand as Ke, selectRowCommand as O, addRowBeforeCommand as ze, addRowAfterCommand as Fe } from "https://cdn.jsdelivr.net/npm/@milkdown/preset-gfm@7.8.0/+esm";
import { isInTable as Ge } from "https://esm.run/@milkdown/prose@7.8.0/lib/tables.js";
const Z = j(
  "ToggleInlineCodeEx",
  (t) => () => (e, n) => {
    const { tr: o, selection: r } = e;
    return r.empty ? U(je.type(t))(e, n) : h(Te.key)(t);
  }
), ee = j(
  "UnwrapInBlockquote",
  (t) => () => (e, n) => {
    const o = e.tr, { $from: r, $to: a } = o.selection, { depth: s } = r;
    if (s < 2)
      return !1;
    const c = r.blockRange(a);
    return o.lift(c, s - 2), n(o.scrollIntoView()), !0;
  }
), te = j(
  "WrapInTaskList",
  (t) => () => (e, n) => {
    const o = e.tr, { $from: r, $to: a } = o.selection, s = r.blockRange(a), c = s && Ue(s, Me.type(t), { checked: !1 });
    return o.wrap(s, c), n(o.scrollIntoView()), !0;
  }
), W = (t, e = null) => (n) => (n.get(ke).focus(), h(t, e)(n)), Qe = B(M.mark, (t) => (e, n, o) => {
  const r = document.createElement("a");
  return r.href = e.attrs.href, r.title = e.attrs.title, r.classList.add("external"), r.addEventListener("click", (a) => {
    a.preventDefault(), a.stopPropagation();
    const { dispatch: s, state: c } = n, { tr: i, selection: d } = c, { $from: l } = d, u = l.parent.child(l.index()), m = u.marks.find(
      ({ type: y }) => y === M.type(t)
    ), f = window.prompt("URL:", m.attrs.href), p = f ? V(f) : void 0;
    if (p && p !== m.attrs.href) {
      const y = l.pos - l.textOffset, L = y + u.nodeSize, C = M.type(t);
      i.removeMark(y, L, m).addMark(y, L, C.create({ ...m.attrs, href: p })).scrollIntoView(), s(i);
    }
  }), {
    dom: r
  };
}), ne = j(
  "ExternalLink",
  (t) => () => (e, n) => {
    const { selection: o, tr: r } = e, { $from: a, $to: s } = o;
    if (o.empty) {
      const l = window.prompt("URL:");
      if (l) {
        const u = M.type(t), m = a.pos, f = m + l.length, p = V(l);
        if (r.insertText(l).addMark(m, f, u.create({ href: p })), n)
          return n(r.scrollIntoView()), !0;
      }
      return !1;
    }
    const i = a.node().textContent.slice(a.parentOffset, s.parentOffset), d = V(i);
    return U(M.type(t), { href: d })(e, n);
  }
);
function V(t) {
  const e = document.createElement("a");
  return e.href = t, e.href;
}
const Ze = B(Ye.node, (t) => (e, n, o, r, a) => {
  const s = document.createElement("img"), c = et(e.attrs.src);
  if (c === e.attrs.src)
    s.src = c;
  else {
    const i = e.attrs.src, d = tt(i);
    if (d)
      s.src = `/attachments/download/${d}/${i}`;
    else {
      const l = nt(i);
      l ? s.src = `/attachments/download/${l}/${i}` : s.src = c;
    }
  }
  return s.alt = e.attrs.alt, s.title = e.attrs.title, {
    dom: s
  };
});
function et(t) {
  const e = document.createElement("a");
  return e.href = t, e.href;
}
function tt(t) {
  const e = document.querySelector(
    `span.existing-attachment:has(input.filename[value="${t}"])`
  );
  if (e) {
    const n = e.querySelector("input.deleted_attachment");
    if (n)
      return n.value;
  }
  return null;
}
function nt(t) {
  for (const e of document.querySelectorAll(
    "span.attachments_form span.attachments_fields span"
  ))
    if (e.querySelector("input.filename").value === t) {
      const o = e.querySelector("a.icon-del");
      return URL.parse(o.href).pathname.split("/").pop().split(".")[0];
    }
  return null;
}
const ot = "\\[\\[(([^ /:\\]]+):)?([^ /\\|\\]]+)(\\|([^)\\]]+))?\\]\\]", rt = (t, e, n, o) => {
  const r = n.enter("innerLink"), a = n.createTracker(o);
  let s = a.move("[[");
  return t.project && (s += a.move(n.safe(t.project, o)), s += a.move(":")), s += a.move(n.safe(t.href, o)), t.href !== t.title && (s += a.move("|"), s += a.move(
    n.containerPhrasing(t, {
      before: s,
      after: "]]",
      ...a.current()
    })
  )), s += a.move("]]"), r(), s;
}, at = z("remarkInnerLink", () => () => (t) => {
  const e = new RegExp(ot, "g");
  F(t, "text", (n, o, r) => {
    if (!n.value || typeof n.value != "string")
      return;
    const a = [];
    let s = 0;
    e.lastIndex = 0;
    let c = e.exec(n.value);
    for (; c; ) {
      const i = c.index;
      s !== i && a.push({
        type: "text",
        value: n.value.slice(s, i)
      });
      const d = c[2], l = c[3], m = [{ type: "text", value: c[5] ? c[5] : l }];
      a.push({
        type: "innerLink",
        href: l,
        project: d ?? null,
        children: m
      }), s = i + c[0].length, c = e.exec(n.value);
    }
    return s < n.value.length && a.push({ type: "text", value: n.value.slice(s) }), r.children.splice(o, 1, ...a), o + a.length;
  });
}), T = We("innerLink", (t) => ({
  attrs: {
    href: {},
    project: {
      default: null
    }
  },
  // Set high priority than linkSchema.
  parseDOM: [
    {
      priority: 100,
      tag: 'a:not([href*="/"])',
      getAttrs: (e) => ({
        href: e.getAttribute("href"),
        project: e.dataset.project
      })
    }
  ],
  // Use innerLinkMark remark.
  parseMarkdown: {
    match: (e) => e.type === "innerLink",
    runner: (e, n, o) => {
      const { href: r, project: a } = n;
      e.openMark(o, { href: r, project: a }), e.next(n.children), e.closeMark(o);
    }
  },
  // Render markdown text.
  // AST --(toMarkdown)--> markdown text.
  toMarkdown: {
    match: (e) => e.type.name === "innerLink",
    runner: (e, n, o) => {
      e.withMark(n, "innerLink", void 0, {
        href: n.attrs.href,
        project: n.attrs.project,
        title: o.textContent
      });
    }
  }
})), st = B(T.mark, (t) => (e, n, o) => {
  const r = document.createElement("a");
  return r.href = e.attrs.href, r.dataset.project = e.attrs.project, r.addEventListener("click", (a) => {
    a.preventDefault(), a.stopPropagation();
    const { dispatch: s, state: c } = n, { selection: i } = c, { $from: d } = i, l = d.parent.child(d.index()), u = l.marks.find(
      ({ type: p }) => p === T.type(t)
    ), m = l.textContent;
    re(
      (p) => lt(p, t, c, s, l, u),
      (p) => {
        document.getElementById("wysisyg-inner-link-project").value = u.attrs.project, document.getElementById("wysisyg-inner-link-wiki").value = u.attrs.href, document.getElementById("wysisyg-inner-link-title").value = m, document.getElementById("wysisyg-inner-link-title").disabled = !0;
      }
    ).showModal();
  }), {
    dom: r
  };
}), oe = j(
  "InnerLink",
  (t) => () => (e, n) => {
    const { selection: o } = e;
    if (o.empty)
      return re(
        (d) => it(d, t, e, n)
      ).showModal(), !0;
    const { $from: r, $to: a } = o, c = r.node().textContent.slice(r.parentOffset, a.parentOffset);
    return U(T.type(t), { href: c })(e, n);
  }
);
function ct(t) {
  const e = document.createElement("span");
  e.classList.add("label"), e.for = "wysisyg-inner-link-project", e.innerText = "Project";
  const n = document.createElement("input");
  n.classList.add("input"), n.placeholder = "project name (optional)", n.id = "wysisyg-inner-link-project", J(n);
  const o = document.createElement("div");
  o.classList.add("box"), o.append(e), o.append(n);
  const r = document.createElement("span");
  r.classList.add("label"), r.for = "wysisyg-inner-link-wiki", r.innerText = "Wiki";
  const a = document.createElement("input");
  a.classList.add("input"), a.placeholder = "wiki name", a.setAttribute("list", "wysisyg-inner-link-wiki-data"), a.id = "wysisyg-inner-link-wiki", J(a);
  const s = document.createElement("datalist");
  s.id = "wysisyg-inner-link-wiki-data";
  const c = document.createElement("div");
  c.classList.add("box"), c.append(r), c.append(a), c.append(s);
  const i = document.createElement("span");
  i.classList.add("label"), i.for = "wysisyg-inner-link-title", i.innerText = "Title";
  const d = document.createElement("input");
  d.classList.add("input"), d.placeholder = "display text (optional)", d.id = "wysisyg-inner-link-title";
  const l = document.createElement("div");
  l.classList.add("box"), l.append(i), l.append(d);
  const u = document.createElement("button");
  u.type = "submit", u.value = "submit", u.innerText = "Ok", u.addEventListener("click", t);
  const m = document.createElement("button");
  m.type = "submit", m.value = "cancel", m.innerText = "Cancel";
  const f = document.createElement("div");
  f.classList.add("box"), f.appendChild(m), f.appendChild(u);
  const p = document.createElement("form");
  p.method = "dialog", p.autocomplete = "off", p.appendChild(o), p.appendChild(c), p.appendChild(l), p.appendChild(f);
  const y = document.createElement("dialog");
  return y.classList.add("wysisyg-inner-link-dialog"), y.appendChild(p), y.addEventListener("close", () => {
    y.remove();
  }), y;
}
function re(t, e = null) {
  const n = ct(t);
  return document.querySelector("body").appendChild(n), e && e(n), n;
}
function it(t, e, n, o) {
  t.stopPropagation();
  const a = document.getElementById("wysisyg-inner-link-wiki").value;
  if (!a)
    return !1;
  const s = document.getElementById("wysisyg-inner-link-project"), c = s.value ? s.value : null, i = document.getElementById("wysisyg-inner-link-title"), d = i.value ? i.value : a, { selection: l, tr: u } = n, { $from: m } = l, f = T.type(e), p = m.pos, y = p + d.length;
  u.insertText(d).addMark(
    p,
    y,
    f.create({ href: a, project: c })
  ), o && o(u.scrollIntoView());
}
function lt(t, e, n, o, r, a) {
  t.stopPropagation();
  const c = document.getElementById("wysisyg-inner-link-wiki").value;
  if (!c)
    return !1;
  const i = document.getElementById("wysisyg-inner-link-project"), d = i.value ? i.value : null, { tr: l, selection: u } = n, { $from: m } = u, f = m.pos - m.textOffset, p = f + r.nodeSize, y = T.type(e);
  l.removeMark(f, p, a).addMark(
    f,
    p,
    y.create({ href: c, project: d })
  ).scrollIntoView(), o(l);
}
function J(t) {
  if (!window.rm)
    return;
  const e = rm.AutoComplete.dataSources.wiki_pages;
  let n = null;
  t.addEventListener("keyup", (o) => {
    o.keyCode >= 37 && o.keyCode <= 40 || (n && window.clearTimeout(n), n = window.setTimeout(dt, 300, o, e));
  });
}
function dt(t, e) {
  const n = t.target.value, o = document.getElementById("wysisyg-inner-link-project");
  if (n && !o.value) {
    const r = {
      method: "GET",
      cache: "no-cache"
    };
    fetch(`${e}${n}`, r).then(ut);
  } else
    ae();
}
function ut(t) {
  t.ok && t.json().then(mt);
}
function mt(t) {
  const e = ae();
  for (const n of t) {
    const o = document.createElement("option");
    o.value = n.label, e.appendChild(o);
  }
}
function ae() {
  const t = document.querySelector("#wysisyg-inner-link-wiki-data");
  return t.innerText = "", t;
}
const pt = [
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
  "yaml"
];
function se() {
  return window.userHlLanguages || pt;
}
function ft(t) {
  const e = document.createElement("ul");
  for (const o of se()) {
    const r = document.createElement("li");
    r.addEventListener("click", () => {
      const s = o;
      t.action(W(K.key, s));
    });
    const a = document.createElement("div");
    a.innerHTML = o, r.appendChild(a), e.appendChild(r);
  }
  const n = document.createElement("div");
  return n.classList.add("wysiwyg-precode-menu"), n.appendChild(e), n;
}
function yt(t, e) {
  t.preventDefault(), t.stopPropagation();
  const n = t.target.getBoundingClientRect(), o = n.x + window.scrollX, r = n.bottom + window.scrollY;
  ht(o, r, e);
}
function ht(t, e, n) {
  P();
  const o = ft(n);
  document.querySelector("body").appendChild(o), document.addEventListener("click", P), o.style.left = `${t}px`, o.style.top = `${e}px`;
}
function P() {
  const t = document.querySelector(".wysiwyg-precode-menu");
  t && (t.remove(), document.removeEventListener("click", P));
}
let k = null;
const kt = (t) => {
  k = t;
}, wt = G.extendSchema((t) => (e) => ({
  ...t(e),
  toMarkdown: {
    match: (o) => o.type.name === "table_cell",
    runner: (o, r) => {
      r.textContent.length === 0 ? o.addNode("text", [], "") : o.openNode("tableCell").next(r.content).closeNode();
    }
  }
})), gt = Q.extendSchema((t) => (e) => ({
  ...t(e),
  toMarkdown: {
    match: (o) => o.type.name === "table_header",
    runner: (o, r) => {
      r.textContent.length === 0 ? o.addNode("text", [], "") : o.openNode("tableCell").next(r.content).closeNode();
    }
  }
})), bt = B(Q.node, (t) => (e, n, o, r, a) => {
  const s = document.createElement("th");
  s.style = `text-align: ${e.attrs.alignment}`;
  const c = document.createElement("p");
  return s.appendChild(c), s.addEventListener(
    "click",
    (i) => Ct(i, o)
  ), {
    dom: s,
    contentDOM: c
  };
}), vt = B(G.node, (t) => (e, n, o, r, a) => {
  const s = document.createElement("td");
  s.style = `text-align: ${e.attrs.alignment}`;
  const c = document.createElement("p");
  return s.appendChild(c), s.addEventListener("click", (i) => It(i, o)), {
    dom: s,
    contentDOM: c
  };
});
function Lt(t, e) {
  const n = document.createElement("span");
  n.classList.add("button"), n.classList.add("left"), n.innerText = "L", n.addEventListener("click", () => {
    k.action(
      h(S.key, { index: t, pos: e() })
    ), k.action(h(N.key, "left"));
  });
  const o = document.createElement("span");
  o.classList.add("button"), o.classList.add("center"), o.innerText = "C", o.addEventListener("click", () => {
    k.action(
      h(S.key, { index: t, pos: e() })
    ), k.action(h(N.key, "center"));
  });
  const r = document.createElement("span");
  r.classList.add("button"), r.classList.add("right"), r.innerText = "R", r.addEventListener("click", () => {
    k.action(
      h(S.key, { index: t, pos: e() })
    ), k.action(h(N.key, "right"));
  });
  const a = document.createElement("div");
  a.classList.add("menu"), a.append(n, o, r);
  const s = document.createElement("div");
  return s.classList.add("wysiwyg-table-menu"), s.classList.add("header"), s.appendChild(a), s;
}
function Ct(t, e) {
  let n = t.target;
  n.tagName !== "TH" && (n = n.closest("th")), t.preventDefault(), t.stopPropagation();
  const o = n.closest("tr"), r = Array.prototype.indexOf.call(o.children, n);
  xt(r, n, e);
}
function xt(t, e, n) {
  R(), H();
  const o = Lt(t, n);
  document.querySelector("body").appendChild(o), document.addEventListener("click", R);
  const r = e.getBoundingClientRect();
  o.style.left = `${r.x + window.scrollX + r.width / 2}px`, o.style.top = `${r.top + window.scrollY}px`;
}
function R() {
  const t = document.querySelector(".wysiwyg-table-menu.header");
  t && (t.remove(), document.removeEventListener("click", R));
}
function Et(t, e, n) {
  const o = document.createElement("span");
  o.classList.add("button"), o.classList.add("add-col-before"), o.innerText = "+", o.addEventListener("click", (u) => {
    u.stopPropagation(), k.action(
      h(S.key, { index: e, pos: n() })
    ), k.action(h(Je.key));
  });
  const r = document.createElement("span");
  r.classList.add("button"), r.classList.add("del-col"), r.innerText = "-", r.addEventListener("click", (u) => {
    k.action(
      h(S.key, { index: e, pos: n() })
    ), k.action(h(Y.key));
  });
  const a = document.createElement("span");
  a.classList.add("button"), a.classList.add("add-col-after"), a.innerText = "+", a.addEventListener("click", (u) => {
    u.stopPropagation(), k.action(
      h(S.key, { index: e, pos: n() })
    ), k.action(h(Ke.key));
  });
  const s = document.createElement("span");
  s.classList.add("button"), s.classList.add("add-row-before"), s.innerText = "+", s.addEventListener("click", (u) => {
    u.stopPropagation(), k.action(
      h(O.key, { index: t, pos: n() })
    ), k.action(h(ze.key));
  });
  const c = document.createElement("span");
  c.classList.add("button"), c.classList.add("del-row"), c.innerText = "-", c.addEventListener("click", (u) => {
    k.action(
      h(O.key, { index: t, pos: n() })
    ), k.action(h(Y.key));
  });
  const i = document.createElement("span");
  i.classList.add("button"), i.classList.add("add-row-before"), i.innerText = "+", i.addEventListener("click", (u) => {
    u.stopPropagation(), k.action(
      h(O.key, { index: t, pos: n() })
    ), k.action(h(Fe.key));
  });
  const d = document.createElement("div");
  d.classList.add("menu"), d.append(
    o,
    r,
    a,
    s,
    c,
    i
  );
  const l = document.createElement("div");
  return l.classList.add("wysiwyg-table-menu"), l.classList.add("row"), l.appendChild(d), l;
}
function It(t, e) {
  let n = t.target;
  n.tagName !== "TD" && (n = n.closest("td")), t.preventDefault(), t.stopPropagation();
  const o = n.closest("tr"), r = Array.prototype.indexOf.call(o.children, n), a = o.closest("tbody"), s = Array.prototype.indexOf.call(a.children, o), c = a.children[0].children[r], i = a.children[s], d = i.children[i.children.length - 1];
  St(s, r, c, d, e);
}
function St(t, e, n, o, r) {
  R(), H();
  const a = Et(t, e, r);
  document.querySelector("body").appendChild(a), document.addEventListener("click", H);
  const s = n.getBoundingClientRect(), c = s.x + window.scrollX, i = s.top + window.scrollY, d = a.children[0].children[0];
  d.style.left = `${c}px`, d.style.top = `${i}px`;
  const l = a.children[0].children[1];
  l.style.left = `${c + s.width / 2}px`, l.style.top = `${i}px`;
  const u = a.children[0].children[2];
  u.style.left = `${c + s.width}px`, u.style.top = `${i}px`;
  const m = o.getBoundingClientRect(), f = m.x + window.scrollX, p = m.top + window.scrollY, y = a.children[0].children[3];
  y.style.left = `${f + m.width}px`, y.style.top = `${p}px`;
  const L = a.children[0].children[4];
  L.style.left = `${f + m.width}px`, L.style.top = `${p + m.height / 2}px`;
  const C = a.children[0].children[5];
  C.style.left = `${f + m.width}px`, C.style.top = `${p + m.height}px`;
}
function H() {
  const t = document.querySelector(".wysiwyg-table-menu.row");
  t && (t.remove(), document.removeEventListener("click", H));
}
function g(t) {
  return document.querySelector(
    `div.jstTabs .tab-elements .jstElements .jstb_${t}`
  );
}
function w(t) {
  const e = document.createElement("button");
  return e.classList.add(`jstb_${t}`), e.type = "button", e;
}
function v(t, e, n, o = null) {
  return t.addEventListener("click", (r) => {
    r.preventDefault(), e.action(W(n.key, o));
  }), t;
}
function Tt(t, e) {
  return t.addEventListener("click", (n) => {
    n.preventDefault(), yt(n, e);
  }), t;
}
function jt(t, e, n) {
  return t.addEventListener("click", (o) => {
    o.preventDefault();
    const r = window.prompt("Image:");
    e.action(
      W(n.key, { src: r, alt: r })
    );
  }), t;
}
function q() {
  const t = document.createElement("spane");
  return t.classList.add("jstSpacer"), t;
}
function b(t, e, n) {
  t && e.appendChild(n);
}
function Mt(t) {
  const e = document.createElement("div");
  return e.classList.add("jstElements"), b(
    g("strong"),
    e,
    v(w("strong"), t, $e)
  ), b(
    g("em"),
    e,
    v(w("em"), t, Be)
  ), b(
    g("del"),
    e,
    v(w("del"), t, Oe)
  ), b(
    g("code"),
    e,
    v(w("code"), t, Z)
  ), e.appendChild(q()), b(
    g("h1"),
    e,
    v(w("h1"), t, A, 1)
  ), b(
    g("h2"),
    e,
    v(w("h2"), t, A, 2)
  ), b(
    g("h3"),
    e,
    v(w("h3"), t, A, 3)
  ), e.appendChild(q()), b(
    g("ul"),
    e,
    v(w("ul"), t, qe)
  ), b(
    g("ol"),
    e,
    v(w("ol"), t, Re)
  ), b(
    g("tl"),
    e,
    v(w("tl"), t, te)
  ), e.appendChild(q()), b(
    g("bq"),
    e,
    v(w("bq"), t, He)
  ), b(
    g("unbq"),
    e,
    v(w("unbq"), t, ee)
  ), b(
    g("table"),
    e,
    v(w("table"), t, _e, {})
  ), b(
    g("pre"),
    e,
    v(w("pre"), t, K)
  ), b(
    g("precode"),
    e,
    Tt(w("precode"), t)
  ), e.appendChild(q()), b(
    g("link"),
    e,
    v(w("link"), t, oe)
  ), e.appendChild(
    v(w("extlink"), t, ne)
  ), b(
    g("img"),
    e,
    jt(w("img"), t, De)
  ), e;
}
function $t(t) {
  const e = document.createElement("li");
  return e.classList.add("tab-wysiwyg-elements"), e.appendChild(Mt(t)), e;
}
function Bt(t) {
  const e = $t(t);
  return document.querySelector("div.jstTabs .tab-elements .jstElements").parentNode.after(e), kt(t), e;
}
const qt = (t, e, n, o) => {
  const r = n.enter("tableHardbreak"), s = n.createTracker(o).move("<br />");
  return r(), s;
}, Rt = z(
  "remarkTableHardbreak",
  () => () => (t) => {
    const e = /^<br\s*\/>$/;
    F(t, "html", (n, o, r) => {
      if (!(!n.value || typeof n.value != "string") && !(r.type !== "tableCell" && r.type !== "tableHeader") && e.exec(n.value))
        return r.children.splice(o, 1, { type: "break", isIntable: !0 }), o + 1;
    });
  }
), Ht = _.extendSchema((t) => (e) => {
  const n = t(e);
  return {
    ...n,
    attrs: {
      isInline: {
        default: !1
      },
      isIntable: {
        default: !1
      }
    },
    parseDOM: [
      {
        priority: 100,
        tag: 'br[data-is-intable="true"]',
        getAttrs: () => ({ isIntable: !0 })
      },
      ...n.parseDOM
    ],
    parseMarkdown: {
      match: (o) => n.parseMarkdown.match(o),
      runner: (o, r, a) => {
        r.isIntable ? o.addNode(a, { isIntable: !0 }) : n.parseMarkdown.runner(o, r, a);
      }
    },
    toMarkdown: {
      match: (o) => n.toMarkdown.match(o),
      runner: (o, r) => {
        r.attrs.isIntable ? o.addNode("tableHardbreak") : n.toMarkdown.runner(o, r);
      }
    }
  };
}), ce = j(
  "InsertTableHardbreak",
  (t) => () => (e, n) => {
    if (!Ge(e))
      return !1;
    const { tr: o } = e;
    return o.setMeta(_.key, !0).replaceSelectionWith(
      _.type(t).create({ isIntable: !0 })
    ), n && n(o.scrollIntoView()), !0;
  }
), Dt = Xe("tableHardbreakKeymap", {
  InsertTableHardbreak: {
    shortcuts: ["Shift-Enter", "Enter"],
    command: (t) => {
      const e = t.get(we);
      return () => e.call(ce.key);
    }
  }
});
let E = null;
document.addEventListener("DOMContentLoaded", () => {
  const t = document.querySelector("div.jstTabs .tab-edit"), e = document.querySelector("div.jstTabs .tab-preview"), n = document.querySelector(".tab-wysiwyg");
  e && n ? e.closest("ul").insertBefore(n.parentNode, e.parentNode.nextSibling) : n.style.display = "none";
  const o = document.querySelector("div.jstTabs .tab-elements .jstElements");
  let r = null;
  const a = document.querySelector("#content_text"), s = document.querySelector("#preview_content_text"), c = document.querySelector("#wysiwyg_content_text");
  s && c ? s.parentNode.appendChild(c) : c.style.display = "none";
  const i = document.querySelector('input[name="commit"]'), d = document.querySelector('input[name="wysiwyg-commit"]');
  d.hidden = !0, i.after(d), d.addEventListener("click", (m) => {
    m.preventDefault(), a.value = E.action(X()), i.click();
  });
  const l = () => {
    n.classList.remove("selected"), r !== null && (r.remove(), r = null), c.classList.add("hidden"), E !== null && (a.value = E.action(X()), E.destroy(), E = null), i.hidden = !1, d.hidden = !0;
  }, u = (m) => {
    m.preventDefault(), !m.target.classList.contains("selected") && (i.hidden = !0, d.hidden = !1, t.classList.remove("selected"), e.classList.remove("selected"), n.classList.add("selected"), o.classList.add("hidden"), a.classList.add("hidden"), s.classList.add("hidden"), c.classList.remove("hidden"), c.innerHTML = "", E = ge.make().config((f) => {
      f.set(be, c), f.set(ve, a.value), f.get(Ie).updated(() => {
        $("#content_text").change();
      }), f.set(fe.key, {
        renderLabel: ({ label: L, listType: C, checked: I, readonly: x }) => I === void 0 ? "" : ye.renderLabel({
          label: L,
          listType: C,
          checked: I,
          readonly: x
        })
      }), f.set(Ae.key, (L) => ({
        "data-type": "hardbreak",
        "data-is-inline": L.attrs.isInline,
        "data-is-intable": L.attrs.isIntable
      }));
      const y = f.get(Le);
      y.handlers.innerLink = rt, y.handlers.tableHardbreak = qt, f.update(me.key, (L) => {
        const C = se().map(
          (x) => x.toLowerCase()
        ), I = [];
        for (const x of de) {
          if (C.includes(x.name.toLocaleLowerCase())) {
            I.push(x);
            continue;
          }
          x.alias.map((D) => D.toLowerCase()).find((D) => C.includes(D)) && I.push(x);
        }
        return {
          ...L,
          extensions: [
            ue.of(ie.concat(le)),
            Pe
          ],
          languages: I
        };
      });
    }).use(Dt).use(pe).use(Ne).use(Ce).use(Ve).use(xe).use(Ee).use(Se).use(he).use(Z).use(ee).use(te).use([at, T, st]).use(oe).use(Qe).use(ne).use(Ze).use([
      wt,
      vt,
      gt,
      bt
    ]).use([Ht, Rt]).use(ce), E.create(), r = Bt(E));
  };
  t == null || t.parentNode.addEventListener("click", l), e == null || e.parentNode.addEventListener("click", l), n == null || n.addEventListener("click", u);
});
