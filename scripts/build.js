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
const SCRIPTS = ['nastaliq', 'naskh'];

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

function renderMarkdown(src, where, terms) {
  let text = src.replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!text) return '';
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
  for (const m of mathErrors) fail(where, 'mathematics error: ' + m);
  html = html.replace(/\uE000(\d+)\uE001/g, (_, i) => {
    const t = found[Number(i)];
    if (terms && !terms.some((x) => x.en.toLowerCase() === t.en.toLowerCase())) terms.push(t);
    return `<span class="term" tabindex="0" data-en="${esc(t.en)}">${esc(t.ur)}</span>`;
  });
  // A paragraph that holds only an image becomes a figure with a caption.
  html = html.replace(
    /<p><img src="([^"]+)" alt="([^"]*)"\s*\/?><\/p>/g,
    (_, src2, alt) => `<figure><div class="fig"><img src="${src2}" alt="${alt}"></div><figcaption>${alt}</figcaption></figure>`
  );
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

function validate(chapters) {
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
};

function page({ title, root, body, lessonPdf, wide }) {
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
</head>
<body>
<header class="topbar">
  <a class="brand" href="${root}index.html">${esc(book.title)}</a>
  <div class="tools">
    <div class="script-switch" role="group" aria-label="خط">
      <button type="button" data-set-script="nastaliq">نستعلیق</button>
      <button type="button" data-set-script="naskh">نسخ</button>
    </div>
    <button type="button" class="icon-btn" data-toggle-theme aria-label="روشن یا تاریک">
      <span class="i-sun">${ICON.sun}</span><span class="i-moon">${ICON.moon}</span>
    </button>
    ${lessonPdf ? `<a class="pdf-btn" data-pdf="${lessonPdf}" href="${lessonPdf}-nastaliq.pdf" download>${ICON.pdf}<span>PDF</span></a>` : ''}
  </div>
</header>
<main class="${wide ? 'wide' : ''}">
${body}
</main>
<footer class="footer">
  <p><a href="${esc(book.dictionary_url)}">فرہنگِ اصطلاحات</a> · <a href="${esc(book.repo_url)}">اِس کتاب میں حصہ لیں</a></p>
  <p class="en">${esc(book.title_en)} · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> · ${esc(book.disclaimer)}</p>
</footer>
<div class="tip" role="tooltip" hidden></div>
</body>
</html>
`;
}

function lessonHtml(lesson, byId, built) {
  const parts = [];
  const nav = [];
  const terms = [];
  for (const s of SECTIONS) {
    const f = path.join(lesson.dir, 'sections', s.file + '.md');
    if (!fs.existsSync(f)) continue;
    let html = renderMarkdown(fs.readFileSync(f, 'utf8'), path.relative(ROOT, f), terms);
    if (!html) continue;
    if (s.cls === 'examples') html = cards(html, 'example');
    if (s.cls === 'tryit') html = `<div class="card try">${html}</div>`;
    if (s.cls === 'answers') html = `<details class="reveal"><summary>جوابات دیکھیں</summary>${html}</details>`;
    if (s.title) nav.push(`<a href="#${s.cls}">${s.title}</a>`);
    parts.push(`<section class="sec sec-${s.cls}" id="${s.cls}">${s.title ? `<h2>${s.title}</h2>` : ''}\n${html}</section>`);
  }
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
  const credits = [lesson.author && `مصنف: <span class="en">${esc(lesson.author)}</span>`, lesson.reviewer && `نظرِ ثانی: <span class="en">${esc(lesson.reviewer)}</span>`].filter(Boolean).join(' · ');
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
<p class="tagline">${esc(book.tagline)}</p>
<div class="progress" role="img" aria-label="${ready} / ${all.length}"><span style="width:${Math.max(pct, 2)}%"></span></div>
<p class="progress-text">دستیاب اسباق: <span class="num">${ready}</span> / <span class="num">${all.length}</span></p>
</section>
<div class="chapters">
${chaptersHtml}
</div>`;
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
    '@fontsource/noto-nastaliq-urdu/files/noto-nastaliq-urdu-arabic-400-normal.woff2',
    '@fontsource/noto-nastaliq-urdu/files/noto-nastaliq-urdu-arabic-700-normal.woff2',
    '@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-400-normal.woff2',
    '@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-700-normal.woff2',
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
  validate(chapters);
  const all = chapters.flatMap((c) => c.lessons);
  const byId = new Map(all.map((l) => [l.id, l]));
  const toBuild = all.filter((l) => l.status !== 'open');

  const rendered = toBuild.map((l) => [l, lessonHtml(l, byId, toBuild)]);

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
  fs.writeFileSync(path.join(OUT, 'index.html'), page({ title: book.title, root: '', body: indexHtml(chapters), wide: true }));
  for (const [l, html] of rendered) {
    const dir = path.join(OUT, 'lessons', padId(l.id));
    fs.mkdirSync(dir, { recursive: true });
    copyDir(path.join(l.dir, 'figures'), path.join(dir, 'figures'), (n) => /\.(svg|png|jpg|jpeg|webp)$/i.test(n));
    fs.writeFileSync(path.join(dir, 'index.html'), page({
      title: `${l.id} ${l.title} · ${book.title}`,
      root: '../../',
      body: html,
      lessonPdf: `riyazi-${padId(l.id)}`,
    }));
    console.log('page  ', l.id);
  }
  if (WITH_PDF) await buildPdfs(toBuild);
  console.log('site written to site/');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
