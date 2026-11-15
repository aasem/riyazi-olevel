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
  { file: '09-terms', cls: 'terms', title: 'اصطلاحات' },
];
const STATUSES = ['open', 'draft', 'published'];
const SCRIPTS = ['nastaliq', 'naskh'];

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

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

function renderMarkdown(src, where) {
  const text = src.replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!text) return '';
  mathErrors.length = 0;
  let html = md.render(text);
  for (const m of mathErrors) fail(where, 'mathematics error: ' + m);
  // A paragraph that holds only an image becomes a figure with a caption.
  html = html.replace(
    /<p><img src="([^"]+)" alt="([^"]*)"\s*\/?><\/p>/g,
    (_, src2, alt) => `<figure><img src="${src2}" alt="${alt}"><figcaption>${alt}</figcaption></figure>`
  );
  // Tables scroll sideways on phones instead of breaking the page.
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
  return html;
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
    if (!l.title_en) fail(l.where, 'title_en is missing');
    if (![1, 2, 3, 4].includes(l.stage)) fail(l.where, 'stage must be 1, 2, 3 or 4');
    if (l.status !== 'open') {
      if (!l.title) fail(l.where, 'title (Urdu) is required once the lesson is draft or published');
      if (!l.author) fail(l.where, 'author is required once the lesson is draft or published');
    }
  }
  for (const l of all) {
    for (const n of l.needs || []) {
      if (!ids.has(String(n))) fail(l.where, `needs "${n}", which is not a lesson id`);
    }
  }
}

// ---------- html ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function page({ title, root, body, lessonPdf }) {
  return `<!DOCTYPE html>
<html lang="ur" dir="rtl" data-script="nastaliq">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
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
    ${lessonPdf ? `<a class="pdf-btn" data-pdf="${lessonPdf}" href="${lessonPdf}-nastaliq.pdf" download>PDF</a>` : ''}
  </div>
</header>
<main>
${body}
</main>
<footer class="footer">
  <p>${esc(book.title)} · <a href="${esc(book.dictionary_url)}">فرہنگِ اصطلاحات</a> · <a href="${esc(book.repo_url)}">GitHub</a></p>
  <p class="en">${esc(book.title_en)}. Licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. ${esc(book.disclaimer)}</p>
</footer>
</body>
</html>
`;
}

function lessonHtml(lesson, byId) {
  const parts = [];
  for (const s of SECTIONS) {
    const f = path.join(lesson.dir, 'sections', s.file + '.md');
    if (!fs.existsSync(f)) continue;
    const html = renderMarkdown(fs.readFileSync(f, 'utf8'), path.relative(ROOT, f));
    if (!html) continue;
    parts.push(`<section class="sec sec-${s.cls}">${s.title ? `<h2>${s.title}</h2>` : ''}\n${html}</section>`);
  }
  const needs = (lesson.needs || []).map(String).map((n) => {
    const t = byId.get(n);
    if (!t) return '';
    const label = `<span class="num">${esc(n)}</span> ${esc(t.title || t.title_en)}`;
    return t.status === 'open' ? `<span class="need">${label}</span>` : `<a class="need" href="../${padId(n)}/index.html">${label}</a>`;
  }).filter(Boolean);
  const credits = [lesson.author && `مصنف: <span class="en">${esc(lesson.author)}</span>`, lesson.reviewer && `نظرِ ثانی: <span class="en">${esc(lesson.reviewer)}</span>`].filter(Boolean).join(' · ');
  return `<article class="lesson">
<header class="lesson-head">
  <p class="crumb">باب <span class="num">${lesson.chapter.chapter}</span>: ${esc(lesson.chapter.title)}</p>
  <h1><span class="num">${esc(lesson.id)}</span> ${esc(lesson.title)}</h1>
  <p class="title-en">${esc(lesson.title_en)}</p>
  ${lesson.status === 'draft' ? '<p class="badge">مسودہ</p>' : ''}
  ${needs.length ? `<p class="needs">پہلے یہ اسباق پڑھیں: ${needs.join('، ')}</p>` : ''}
</header>
${parts.join('\n')}
${credits ? `<p class="credits">${credits}</p>` : ''}
</article>`;
}

function indexHtml(chapters) {
  const all = chapters.flatMap((c) => c.lessons);
  const done = all.filter((l) => l.status === 'published').length;
  const drafts = all.filter((l) => l.status === 'draft').length;
  const chaptersHtml = chapters.map((c) => `<section class="chapter">
<h2><span class="num">${c.chapter}</span> ${esc(c.title)} <span class="title-en">${esc(c.title_en)}</span></h2>
<ol class="lesson-list">
${c.lessons.map((l) => {
    const name = l.title
      ? `<span class="t">${esc(l.title)}</span> <span class="title-en">${esc(l.title_en)}</span>`
      : `<span class="title-en">${esc(l.title_en)}</span>`;
    const inner = `<span class="num">${esc(l.id)}</span> ${name}${l.status === 'draft' ? ' <span class="badge">مسودہ</span>' : ''}`;
    return l.status === 'open'
      ? `<li class="open">${inner}</li>`
      : `<li><a href="lessons/${padId(l.id)}/index.html">${inner}</a></li>`;
  }).join('\n')}
</ol>
</section>`).join('\n');
  return `<section class="hero">
<h1>${esc(book.title)}</h1>
<p>${esc(book.tagline)}</p>
<p class="progress">شائع شدہ اسباق: <span class="num">${done}</span> / <span class="num">${all.length}</span>${drafts ? ` · مسودے: <span class="num">${drafts}</span>` : ''}</p>
</section>
${chaptersHtml}`;
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
        await page.goto('file://' + path.join(dir, 'index.html') + '?script=' + script, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
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

  const rendered = toBuild.map((l) => [l, lessonHtml(l, byId)]);

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
  fs.writeFileSync(path.join(OUT, 'index.html'), page({ title: book.title, root: '', body: indexHtml(chapters) }));
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
