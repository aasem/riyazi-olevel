#!/usr/bin/env node
/*
 * build.js — turns content/ into the website in site/.
 *
 *   node scripts/build.js --check   validate only (used on pull requests)
 *   node scripts/build.js           build web pages
 *   node scripts/build.js --pdf     build web pages + one PDF per lesson per script
 *
 * A lesson is built when its status is "draft" or "published".
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const MarkdownIt = require('markdown-it');
const mdKatex = require('@vscode/markdown-it-katex').default;

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'site');
const ARGS = new Set(process.argv.slice(2));
const CHECK_ONLY = ARGS.has('--check');
const WITH_PDF = ARGS.has('--pdf');

const book = yaml.load(fs.readFileSync(path.join(ROOT, 'book.yaml'), 'utf8'));

// Fixed section order and Urdu headings. Writers do not type these headings.
const SECTIONS = [
  { file: '01-opening', cls: 'opening', title: null },
  { file: '02-objectives', cls: 'objectives', title: 'آپ کیا سیکھیں گے' },
  { file: '03-explanation', cls: 'explanation', title: 'وضاحت' },
  { file: '04-examples', cls: 'examples', title: 'حل شدہ مثالیں' },
  { file: '05-try-it', cls: 'tryit', title: 'خود کیجیے' },
  { file: '06-exercise', cls: 'exercise', title: 'مشق' },
  { file: '07-answers', cls: 'answers', title: 'جوابات' },
  { file: '08-summary', cls: 'summary', title: 'خلاصہ' },
];
const STATUSES = ['open', 'draft', 'published'];
const SCRIPTS = ['nastaliq', 'naskh', 'amiri'];

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- markdown ----------
// Collect every mathematics error (missing brace, misspelt command) instead of letting it pass silently.
const katex = require('katex');
const mathErrors = [];
const katexRender = katex.renderToString;
katex.renderToString = (tex, opts) => {
  try {
    return katexRender(tex, { ...opts, throwOnError: true });
  } catch (e) {
    mathErrors.push(e.message.split('\n')[0]);
    return katexRender(tex, { ...opts, throwOnError: false });
  }
};

const md = new MarkdownIt({ html: false, linkify: false, typographer: false })
  .use(mdKatex, { throwOnError: false });

// Writers use ## for sub-headings; the page already has h1 (lesson) and h2 (section).
md.core.ruler.push('shift_headings', (state) => {
  for (const t of state.tokens) {
    if (t.type === 'heading_open' || t.type === 'heading_close') {
      const level = Math.min(Math.max(Number(t.tag.slice(1)), 2) + 1, 5);
      t.tag = 'h' + level;
    }
  }
});

// A term is written [[english term|اردو اصطلاح]]. The page shows the Urdu; the English appears on tap or hover.
const TERM = /\[\[([^\[\]|\n]+)\|([^\[\]|\n]+)\]\]/g;

// A figure is a line on its own: ![caption](figures/name.svg). It gets a number and a caption in one fixed format.
const FIGURE = /^!\[([^\]\n]*)\]\((figures\/[^)\s]+)\)[ \t]*$/gm;

function renderMarkdown(src, where, terms, counter) {
  let text = src.replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!text) return '';
  const figures = [];
  text = text.replace(FIGURE, (_, caption, file) => {
    figures.push({ caption: caption.trim(), file });
    return `\n\n\uE002${figures.length - 1}\uE003\n\n`;
  });
  const found = [];
  text = text.replace(TERM, (_, en, ur) => {
    found.push({ en: en.trim(), ur: ur.trim() });
    return `\uE000${found.length - 1}\uE001`;
  });
  if (/\[\[|\]\]/.test(text.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*\$/g, ''))) {
    fail(where, 'a term is not written correctly. Use [[english term|اردو اصطلاح]]');
  }
  mathErrors.length = 0;
  let html = md.render(text);
  html = html.replace(/<p>\uE002(\d+)\uE003<\/p>/g, (_, i) => {
    const f = figures[Number(i)];
    const n = counter ? ++counter.figures : Number(i) + 1;
    if (!f.caption) fail(where, `figure "${f.file}" has no caption. Write ![caption](${f.file})`);
    const caption = md.renderInline(f.caption.replace(/[۔.]\s*$/, ''));
    return `<figure id="fig-${n}"><div class="fig"><img src="${f.file}" alt="${esc(f.caption)}"></div>`
      + `<figcaption><span class="fig-label">شکل <span class="num">${n}</span>:</span> ${caption}</figcaption></figure>`;
  });
  for (const m of mathErrors) fail(where, 'mathematics error: ' + m);
  html = html.replace(/\uE000(\d+)\uE001/g, (_, i) => {
    const t = found[Number(i)];
    if (terms && !terms.some((x) => x.en.toLowerCase() === t.en.toLowerCase())) terms.push(t);
    return `<span class="term" tabindex="0" data-en="${esc(t.en)}">${esc(t.ur)}</span>`;
  });
  // Tables scroll sideways on phones instead of breaking the page.
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
  return html;
}

// Each "## مثال 1" block (an h3 after rendering) becomes one card.
function cards(html, cls) {
  const parts = html.split(/(?=<h3>)/);
  return parts.map((p) => (p.startsWith('<h3>') ? `<div class="card ${cls}">${p}</div>` : p)).join('\n');
}

// ---------- load content ----------
function idKey(id) {
  const m = /^(\d+)\.(\d+)([a-z]?)$/.exec(id);
  return m ? [Number(m[1]), Number(m[2]), m[3]] : [99, 99, ''];
}
function cmpId(a, b) {
  const x = idKey(a), y = idKey(b);
  return x[0] - y[0] || x[1] - y[1] || x[2].localeCompare(y[2]);
}
// 2.5c -> 2.05c (used in folder names, URLs and PDF names)
function padId(id) {
  const [c, n, l] = idKey(id);
  return `${c}.${String(n).padStart(2, '0')}${l}`;
}

function loadAll() {
  const chapters = [];
  for (const dir of fs.readdirSync(CONTENT).sort()) {
    const cdir = path.join(CONTENT, dir);
    const cy = path.join(cdir, 'chapter.yaml');
    if (!fs.existsSync(cy)) continue;
    const chapter = yaml.load(fs.readFileSync(cy, 'utf8'));
    chapter.lessons = [];
    for (const ldir of fs.readdirSync(cdir).sort()) {
      const lpath = path.join(cdir, ldir);
      const ly = path.join(lpath, 'lesson.yaml');
      if (!fs.existsSync(ly)) continue;
      const where = path.relative(ROOT, ly);
      let lesson;
      try {
        lesson = yaml.load(fs.readFileSync(ly, 'utf8'));
      } catch (e) {
        fail(where, 'cannot read YAML: ' + e.message.split('\n')[0]);
        continue;
      }
      lesson.dir = lpath;
      lesson.where = where;
      lesson.id = String(lesson.id);
      lesson.chapter = chapter;
      chapter.lessons.push(lesson);
    }
    chapter.lessons.sort((a, b) => cmpId(a.id, b.id));
    chapters.push(chapter);
  }
  chapters.sort((a, b) => a.chapter - b.chapter);
  return chapters;
}

function validate(chapters, people) {
  const ids = new Map();
  const all = chapters.flatMap((c) => c.lessons);
  for (const l of all) {
    if (!/^\d+\.\d+[a-z]?$/.test(l.id)) fail(l.where, `bad id "${l.id}"`);
    if (ids.has(l.id)) fail(l.where, `id ${l.id} is also used in ${ids.get(l.id)}`);
    ids.set(l.id, l.where);
    if (!path.basename(l.dir).startsWith(padId(l.id) + '-')) fail(l.where, `folder name must start with ${padId(l.id)}-`);
    if (!STATUSES.includes(l.status)) fail(l.where, `status must be one of: ${STATUSES.join(', ')}`);
    if (!l.title) fail(l.where, 'title (Urdu) is missing');
    if (!l.title_en) fail(l.where, 'title_en is missing');
    if (![1, 2, 3, 4].includes(l.stage)) fail(l.where, 'stage must be 1, 2, 3 or 4');
    if (l.status !== 'open' && !l.author) fail(l.where, 'author is required once the lesson is draft or published');
    for (const who of [l.author, l.reviewer]) {
      if (l.status !== 'open' && who && !people.has(String(who).toLowerCase())) {
        fail(l.where, `"${who}" is not in contributors/contributors.yaml. Add yourself there`);
      }
    }
  }
  for (const l of all) {
    for (const n of l.needs || []) {
      if (!ids.has(String(n))) fail(l.where, `needs "${n}", which is not a lesson id`);
    }
  }
}

// ---------- html ----------
const ICON = {
  sun: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

const SCRIPT_SWITCH = `<div class="script-switch" role="group" aria-label="خط">
      <button type="button" data-set-script="nastaliq">نستعلیق</button>
      <button type="button" data-set-script="naskh">نسخ</button>
      <button type="button" data-set-script="amiri">امیری</button>
    </div>`;

// The book's contents: a frame beside the lesson on wide screens, a drawer on phones and tablets.
function sideNav(chapters, root, current) {
  return chapters.map((c) => {
    const open = current && current.chapter === c;
    return `<details${open ? ' open' : ''}>
<summary><span class="ch-num num">${c.chapter}</span><span>${esc(c.title)}</span></summary>
<ol>
${c.lessons.map((l) => {
    const inner = `<span class="num">${esc(l.id)}</span><span class="t">${esc(l.title)}</span>`;
    if (l.status === 'open') return `<li class="open">${inner}</li>`;
    return `<li${l === current ? ' class="current"' : ''}><a href="${root}lessons/${padId(l.id)}/index.html"${l === current ? ' aria-current="page"' : ''}>${inner}</a></li>`;
  }).join('\n')}
</ol>
</details>`;
  }).join('\n');
}

function page({ title, root, body, lessonPdf, layout, chapters, current, toc }) {
  return `<!DOCTYPE html>
<html lang="ur" dir="rtl" data-script="nastaliq">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${root}assets/katex/katex.min.css">
<link rel="stylesheet" href="${root}assets/style.css">
<script src="${root}assets/site.js"></script>
<script defer src="${root}assets/search-index.js"></script>
</head>
<body data-root="${root}">
<header class="topbar">
  <div class="tb-start">
    <button type="button" class="icon-btn menu-btn" data-toggle-nav aria-label="فہرست">${ICON.menu}</button>
    <a class="brand" href="${root}index.html">${esc(book.title)}</a>
  </div>
  <div class="tools">
    <button type="button" class="icon-btn" data-open-search aria-label="تلاش">${ICON.search}</button>
    <span class="hide-sm">${SCRIPT_SWITCH}</span>
    <button type="button" class="icon-btn" data-toggle-theme aria-label="روشن یا تاریک">
      <span class="i-sun">${ICON.sun}</span><span class="i-moon">${ICON.moon}</span>
    </button>
    ${lessonPdf ? `<a class="pdf-btn" data-pdf="${lessonPdf}" href="${lessonPdf}-nastaliq.pdf" download>${ICON.pdf}<span>PDF</span></a>` : ''}
  </div>
</header>
<div class="shell shell-${layout}">
  <aside class="side" aria-label="فہرست">
    <div class="side-top"><strong>فہرست</strong><span class="show-sm">${SCRIPT_SWITCH}</span></div>
    <nav class="book-nav">
${sideNav(chapters, root, current)}
    <p class="side-link"><a href="${root}contributors/index.html">شرکائے کار</a></p>
    </nav>
  </aside>
  <main>
${body}
  </main>
  ${toc ? `<aside class="toc" aria-label="اِس سبق میں"><strong>اِس سبق میں</strong>${toc}</aside>` : ''}
</div>
<div class="backdrop" data-close-nav></div>
<div class="search" hidden>
  <div class="search-box" role="dialog" aria-label="تلاش">
    <div class="search-row">
      ${ICON.search}
      <input type="text" inputmode="search" placeholder="سبق یا اصطلاح تلاش کریں" autocomplete="off" aria-label="تلاش">
      <button type="button" class="icon-btn" data-close-search aria-label="بند کریں">${ICON.close}</button>
    </div>
    <ol class="results"></ol>
  </div>
</div>
<footer class="footer">
  <p>© <span class="num">${esc(book.copyright_year)}</span> ${esc(book.copyright_holder)} اور <a href="${root}contributors/index.html">شرکائے کار</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" class="en">CC BY-SA 4.0</a></p>
  <p><a href="${esc(book.dictionary_url)}">فرہنگِ اصطلاحات</a> · <a href="${esc(book.repo_url)}">اِس کتاب میں حصہ لیں</a></p>
  <p class="small">${esc(book.disclaimer_ur)}</p>
  <p class="en small">© ${esc(book.copyright_year)} ${esc(book.copyright_holder_en)} and contributors. Licensed under CC BY-SA 4.0. ${esc(book.disclaimer)}</p>
</footer>
<div class="tip" role="tooltip" hidden></div>
</body>
</html>
`;
}

function personLink(username, people, root) {
  const p = people.get(String(username).toLowerCase());
  return p ? `<a href="${root}contributors/index.html#${esc(p.github)}">${esc(p.name)}</a>` : `<span class="en">${esc(username)}</span>`;
}

function lessonHtml(lesson, byId, built, people) {
  const parts = [];
  const nav = [];
  const terms = [];
  const counter = { figures: 0 };
  for (const s of SECTIONS) {
    const f = path.join(lesson.dir, 'sections', s.file + '.md');
    if (!fs.existsSync(f)) continue;
    let html = renderMarkdown(fs.readFileSync(f, 'utf8'), path.relative(ROOT, f), terms, counter);
    if (!html) continue;
    if (s.cls === 'examples') html = cards(html, 'example');
    if (s.cls === 'tryit') html = `<div class="card try">${html}</div>`;
    if (s.cls === 'answers') html = `<details class="reveal"><summary>جوابات دیکھیں</summary>${html}</details>`;
    if (s.title) nav.push(`<a href="#${s.cls}">${s.title}</a>`);
    parts.push(`<section class="sec sec-${s.cls}" id="${s.cls}">${s.title ? `<h2>${s.title}</h2>` : ''}\n${html}</section>`);
  }
  lesson.terms = terms;
  const body = parts.join('\n');
  for (const m of body.matchAll(/<img src="(figures\/[^"]+)"/g)) {
    const f = path.join(lesson.dir, m[1]);
    if (!fs.existsSync(f) && !fs.existsSync(f.replace(/\.svg$/, '.tex'))) fail(lesson.where, `figure "${m[1]}" is not in the figures folder`);
  }
  for (const t of tikzFiles(lesson)) compileTikz(t, null);
  lesson.toc = nav.join('');
  // English terms cannot pop up on paper, so the PDF gets a list of them at the end.
  if (terms.length) {
    parts.push(`<section class="sec sec-terms print-only"><h2>اصطلاحات</h2><div class="table-wrap"><table><tbody>
${terms.map((t) => `<tr><td>${esc(t.ur)}</td><td class="en">${esc(t.en)}</td></tr>`).join('\n')}
</tbody></table></div></section>`);
  }
  const needs = (lesson.needs || []).map(String).map((n) => {
    const t = byId.get(n);
    if (!t) return '';
    const label = `<span class="num">${esc(n)}</span> ${esc(t.title)}`;
    return t.status === 'open' ? `<span class="need">${label}</span>` : `<a class="need" href="../${padId(n)}/index.html">${label}</a>`;
  }).filter(Boolean);
  const i = built.indexOf(lesson);
  const prev = built[i - 1], next = built[i + 1];
  const link = (l, cls, label) => l
    ? `<a class="${cls}" href="../${padId(l.id)}/index.html"><small>${label}</small><span><span class="num">${esc(l.id)}</span> ${esc(l.title)}</span></a>`
    : '<span></span>';
  const credits = [lesson.author && `مصنف: ${personLink(lesson.author, people, '../../')}`, lesson.reviewer && `نظرِ ثانی: ${personLink(lesson.reviewer, people, '../../')}`].filter(Boolean).join(' · ');
  return `<article class="lesson">
<header class="lesson-head">
  <p class="crumb"><a href="../../index.html">باب <span class="num">${lesson.chapter.chapter}</span> · ${esc(lesson.chapter.title)}</a></p>
  <h1 title="${esc(lesson.title_en)}"><span class="lesson-num num">${esc(lesson.id)}</span>${esc(lesson.title)}</h1>
  ${lesson.status === 'draft' ? '<p class="badge">مسودہ</p>' : ''}
  ${needs.length ? `<p class="needs">پہلے یہ پڑھیں: ${needs.join(' ')}</p>` : ''}
</header>
${nav.length > 1 ? `<nav class="sec-nav" aria-label="اِس سبق میں">${nav.join('')}</nav>` : ''}
${parts.join('\n')}
${credits ? `<p class="credits">${credits}</p>` : ''}
<nav class="pager">${link(prev, 'prev', 'پچھلا سبق')}${link(next, 'next', 'اگلا سبق')}</nav>
</article>`;
}

function indexHtml(chapters) {
  const all = chapters.flatMap((c) => c.lessons);
  const ready = all.filter((l) => l.status !== 'open').length;
  const pct = Math.round((100 * ready) / all.length);
  const chaptersHtml = chapters.map((c) => {
    const n = c.lessons.filter((l) => l.status !== 'open').length;
    return `<section class="chapter">
<h2 title="${esc(c.title_en)}"><span class="ch-num num">${c.chapter}</span><span class="ch-title">${esc(c.title)}</span><span class="ch-count num">${n}/${c.lessons.length}</span></h2>
<ol class="lesson-list">
${c.lessons.map((l) => {
    const inner = `<span class="num">${esc(l.id)}</span><span class="t">${esc(l.title)}</span>${l.status === 'draft' ? '<span class="badge">مسودہ</span>' : ''}`;
    return l.status === 'open'
      ? `<li class="open" title="${esc(l.title_en)}">${inner}</li>`
      : `<li title="${esc(l.title_en)}"><a href="lessons/${padId(l.id)}/index.html">${inner}</a></li>`;
  }).join('\n')}
</ol>
</section>`;
  }).join('\n');
  return `<section class="hero">
<h1>${esc(book.title)}</h1>
<p class="subtitle">${esc(book.subtitle)}</p>
<p class="tagline">${esc(book.tagline)}</p>
<button type="button" class="hero-search" data-open-search>${ICON.search}<span>سبق یا اصطلاح تلاش کریں</span></button>
<div class="progress" role="img" aria-label="${ready} / ${all.length}"><span style="width:${Math.max(pct, 2)}%"></span></div>
<p class="progress-text">دستیاب اسباق: <span class="num">${ready}</span> / <span class="num">${all.length}</span></p>
</section>
<div class="chapters">
${chaptersHtml}
</div>`;
}

// ---------- contributors ----------
function loadPeople() {
  const f = path.join(ROOT, 'contributors', 'contributors.yaml');
  const list = fs.existsSync(f) ? yaml.load(fs.readFileSync(f, 'utf8')) || [] : [];
  const people = new Map();
  for (const p of list) {
    if (!p || !p.github || !p.name) { fail('contributors/contributors.yaml', 'every entry needs github and name'); continue; }
    if (p.photo && !fs.existsSync(path.join(ROOT, 'contributors', 'photos', p.photo))) {
      fail('contributors/contributors.yaml', `photo "${p.photo}" of ${p.github} is not in contributors/photos/`);
    }
    people.set(String(p.github).toLowerCase(), p);
  }
  return people;
}

function contributorsHtml(people, all) {
  const cardsHtml = [...people.values()].map((p) => {
    const g = String(p.github).toLowerCase();
    const wrote = all.filter((l) => l.status !== 'open' && String(l.author || '').toLowerCase() === g);
    const reviewed = all.filter((l) => l.status !== 'open' && String(l.reviewer || '').toLowerCase() === g);
    const list = (ls) => ls.map((l) => `<a class="need" href="../lessons/${padId(l.id)}/index.html"><span class="num">${esc(l.id)}</span> ${esc(l.title)}</a>`).join(' ');
    const initial = esc(String(p.name).replace(/^ڈاکٹر\s+/, '').trim().charAt(0));
    return `<article class="person" id="${esc(p.github)}">
<div class="avatar">${p.photo ? `<img src="photos/${esc(p.photo)}" alt="">` : `<span>${initial}</span>`}</div>
<div class="person-body">
  <h2>${esc(p.name)}</h2>
  <p class="role">${esc(p.role || '')} · <a class="en" href="https://github.com/${esc(p.github)}">@${esc(p.github)}</a></p>
  ${p.bio ? `<p>${esc(p.bio)}</p>` : ''}
  ${wrote.length ? `<p class="needs">تحریر: ${list(wrote)}</p>` : ''}
  ${reviewed.length ? `<p class="needs">نظرِ ثانی: ${list(reviewed)}</p>` : ''}
</div>
</article>`;
  }).join('\n');
  return `<section class="hero"><h1>شرکائے کار</h1><p class="tagline">یہ کتاب اِن لوگوں کی محنت سے بن رہی ہے۔</p></section>
<div class="people">
${cardsHtml}
</div>`;
}

// ---------- search ----------
function searchIndex(all) {
  return all.map((l) => ({
    i: l.id,
    t: l.title,
    e: l.title_en,
    c: l.chapter.title,
    u: l.status === 'open' ? '' : `lessons/${padId(l.id)}/index.html`,
    k: (l.terms || []).map((t) => [t.ur, t.en]),
  }));
}

// ---------- TikZ figures ----------
// figures/name.tex holds one tikzpicture. It is compiled to figures/name.svg on the site.
const { execFileSync } = require('child_process');
const crypto = require('crypto');
const os = require('os');
const PREAMBLE = fs.readFileSync(path.join(__dirname, 'figure-preamble.tex'), 'utf8');
const FIG_CACHE = path.join(ROOT, '.cache', 'figures');
// Every TikZ figure is shown at the same scale, so its lettering is the size of the mathematics in the text.
const FIG_PX_PER_PT = 2;

function compileTikz(texFile, outSvg) {
  const body = fs.readFileSync(texFile, 'utf8');
  // The page is cut to the size of the picture, with a 3pt margin.
  const doc = `${PREAMBLE}
\\begin{document}
\\newsavebox\\figbox
\\sbox\\figbox{${body.trim()}}
\\pdfpagewidth=\\dimexpr\\wd\\figbox+6pt\\relax
\\pdfpageheight=\\dimexpr\\ht\\figbox+\\dp\\figbox+6pt\\relax
\\pdfhorigin=3pt \\pdfvorigin=3pt
\\shipout\\vbox{\\hbox{\\box\\figbox}}
\\end{document}
`;
  const key = crypto.createHash('sha1').update(doc + FIG_PX_PER_PT).digest('hex');
  const cached = path.join(FIG_CACHE, key + '.svg');
  if (!fs.existsSync(cached)) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fig-'));
    try {
      fs.writeFileSync(path.join(tmp, 'fig.tex'), doc);
      try {
        execFileSync('pdflatex', ['-interaction=nonstopmode', '-halt-on-error', 'fig.tex'], { cwd: tmp, stdio: 'pipe', timeout: 120000 });
      } catch (e) {
        if (e.code === 'ENOENT') throw new Error('pdflatex not found. Install TeX Live (with TikZ), or push and let GitHub build the figure.');
        const log = String(e.stdout || '');
        const what = log.split('\n').find((l) => l.startsWith('!')) || '! LaTeX error';
        const at = /^l\.(\d+)/m.exec(log);
        const first = doc.slice(0, doc.indexOf('\\sbox')).split('\n').length;   // the line where the figure's own text starts
        fail(path.relative(ROOT, texFile), what.slice(2) + (at ? ` (near line ${Math.max(Number(at[1]) - first + 1, 1)} of the figure)` : ''));
        return false;
      }
      try {
        execFileSync('pdftocairo', ['-svg', 'fig.pdf', 'fig.svg'], { cwd: tmp, stdio: 'pipe' });
      } catch (e) {
        if (e.code === 'ENOENT') throw new Error('pdftocairo not found. Install poppler-utils.');
        throw e;
      }
      fs.mkdirSync(FIG_CACHE, { recursive: true });
      const svg = fs.readFileSync(path.join(tmp, 'fig.svg'), 'utf8')
        .replace(/width="([\d.]+)(?:pt)?" height="([\d.]+)(?:pt)?"/, (_, w, h) => `width="${Math.round(w * FIG_PX_PER_PT)}" height="${Math.round(h * FIG_PX_PER_PT)}"`);
      fs.writeFileSync(cached, svg);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }
  if (outSvg) {
    fs.mkdirSync(path.dirname(outSvg), { recursive: true });
    fs.copyFileSync(cached, outSvg);
  }
  return true;
}

function tikzFiles(lesson) {
  const d = path.join(lesson.dir, 'figures');
  return fs.existsSync(d) ? fs.readdirSync(d).filter((n) => n.endsWith('.tex')).map((n) => path.join(d, n)) : [];
}

// ---------- files ----------
function copyDir(src, dst, filter = () => true) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d, filter);
    else if (filter(e.name)) fs.copyFileSync(s, d);
  }
}

function copyAssets() {
  const A = path.join(OUT, 'assets');
  copyDir(path.join(__dirname, 'assets'), A);
  const nm = path.join(ROOT, 'node_modules');
  fs.mkdirSync(path.join(A, 'katex'), { recursive: true });
  fs.copyFileSync(path.join(nm, 'katex/dist/katex.min.css'), path.join(A, 'katex/katex.min.css'));
  copyDir(path.join(nm, 'katex/dist/fonts'), path.join(A, 'katex/fonts'), (n) => n.endsWith('.woff2'));
  const fonts = [
    '@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff2',
    '@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff2',
  ];
  fs.mkdirSync(path.join(A, 'fonts'), { recursive: true });
  for (const f of fonts) fs.copyFileSync(path.join(nm, f), path.join(A, 'fonts', path.basename(f)));
}

function findChrome() {
  const c = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  return c.find((p) => fs.existsSync(p));
}

async function buildPdfs(lessons) {
  const exe = findChrome();
  if (!exe) throw new Error('Chrome not found. Install Chrome or set CHROME_PATH.');
  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({ executablePath: exe, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    for (const l of lessons) {
      const dir = path.join(OUT, 'lessons', padId(l.id));
      for (const script of SCRIPTS) {
        const page = await browser.newPage();
        await page.goto('file://' + path.join(dir, 'index.html') + '?script=' + script + '&theme=light', { waitUntil: 'load' });
        await page.evaluate(() => {
          document.querySelectorAll('details').forEach((d) => { d.open = true; });
          return document.fonts.ready;
        });
        await page.pdf({
          path: path.join(dir, `riyazi-${padId(l.id)}-${script}.pdf`),
          format: 'A4',
          printBackground: true,
          margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' },
          displayHeaderFooter: true,
          headerTemplate: '<span></span>',
          footerTemplate: `<div style="width:100%;font-size:8pt;color:#666;text-align:center;font-family:sans-serif">${esc(book.title_en)} · ${esc(l.id)} · <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
        });
        await page.close();
      }
      console.log('pdf   ', l.id);
    }
  } finally {
    await browser.close();
  }
}

// ---------- main ----------
(async () => {
  const chapters = loadAll();
  const people = loadPeople();
  validate(chapters, people);
  const all = chapters.flatMap((c) => c.lessons);
  const byId = new Map(all.map((l) => [l.id, l]));
  const toBuild = all.filter((l) => l.status !== 'open');

  const rendered = toBuild.map((l) => [l, lessonHtml(l, byId, toBuild, people)]);

  if (errors.length) {
    console.error(`\n${errors.length} problem(s):`);
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
  }
  console.log(`checked ${all.length} lessons: ${toBuild.length} to build, ${all.length - toBuild.length} open`);
  if (CHECK_ONLY) return;

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  copyAssets();
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  fs.writeFileSync(path.join(OUT, 'assets', 'search-index.js'), 'window.RIYAZI_INDEX = ' + JSON.stringify(searchIndex(all)) + ';\n');
  fs.writeFileSync(path.join(OUT, 'index.html'), page({ title: `${book.title} · ${book.subtitle}`, root: '', body: indexHtml(chapters), layout: 'wide', chapters }));
  fs.mkdirSync(path.join(OUT, 'contributors'), { recursive: true });
  copyDir(path.join(ROOT, 'contributors', 'photos'), path.join(OUT, 'contributors', 'photos'), (n) => /\.(png|jpg|jpeg|webp)$/i.test(n));
  fs.writeFileSync(path.join(OUT, 'contributors', 'index.html'), page({ title: `شرکائے کار · ${book.title}`, root: '../', body: contributorsHtml(people, all), layout: 'wide', chapters }));
  for (const [l, html] of rendered) {
    const dir = path.join(OUT, 'lessons', padId(l.id));
    fs.mkdirSync(dir, { recursive: true });
    copyDir(path.join(l.dir, 'figures'), path.join(dir, 'figures'), (n) => /\.(svg|png|jpg|jpeg|webp)$/i.test(n));
    for (const t of tikzFiles(l)) compileTikz(t, path.join(dir, 'figures', path.basename(t, '.tex') + '.svg'));
    fs.writeFileSync(path.join(dir, 'index.html'), page({
      title: `${l.id} ${l.title} · ${book.title}`,
      root: '../../',
      body: html,
      lessonPdf: `riyazi-${padId(l.id)}`,
      layout: 'lesson',
      chapters,
      current: l,
      toc: l.toc,
    }));
    console.log('page  ', l.id);
  }
  if (WITH_PDF) await buildPdfs(toBuild);
  console.log('site written to site/');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
