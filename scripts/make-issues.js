#!/usr/bin/env node
/*
 * make-issues.js — creates the queue on GitHub: one issue per lesson and one per dictionary block.
 * Run once by the editor. Needs the GitHub CLI (https://cli.github.com), logged in with `gh auth login`.
 *
 *   node scripts/make-issues.js --dry-run   show what would be created
 *   node scripts/make-issues.js             create labels and issues
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execFileSync } = require('child_process');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.resolve(__dirname, '..');
const book = yaml.load(fs.readFileSync(path.join(ROOT, 'book.yaml'), 'utf8'));

function gh(args) {
  if (DRY) { console.log('gh ' + args.map((a) => (/\s/.test(a) ? JSON.stringify(a.split('\n')[0]) : a)).join(' ')); return; }
  execFileSync('gh', args, { stdio: 'inherit', cwd: ROOT });
}

const key = (id) => { const m = /^(\d+)\.(\d+)([a-z]?)$/.exec(id); return [Number(m[1]), Number(m[2]), m[3]]; };
const lessons = [];
for (const c of fs.readdirSync(path.join(ROOT, 'content'))) {
  const cdir = path.join(ROOT, 'content', c);
  if (!fs.statSync(cdir).isDirectory()) continue;
  for (const l of fs.readdirSync(cdir)) {
    const f = path.join(cdir, l, 'lesson.yaml');
    if (!fs.existsSync(f)) continue;
    const y = yaml.load(fs.readFileSync(f, 'utf8'));
    lessons.push({ ...y, id: String(y.id), folder: `content/${c}/${l}` });
  }
}
// Queue order: stage, then id.
lessons.sort((a, b) => a.stage - b.stage || key(a.id)[0] - key(b.id)[0] || key(a.id)[1] - key(b.id)[1] || key(a.id)[2].localeCompare(key(b.id)[2]));

const BLOCKS = ['A (first half)', 'A (second half)', 'B', 'C (first half)', 'C (second half)', 'D', 'E', 'F', 'G, H', 'I', 'J, K, L', 'M', 'N', 'O',
  'P (first half)', 'P (second half)', 'Q, R', 'S (first half)', 'S (second half)', 'T', 'U–Z, 0–9'];

const labels = [['lesson', '14532d'], ['dictionary', 'c9962b'], ['stage-1', 'bfdadc'], ['stage-2', 'bfd4f2'], ['stage-3', 'd4c5f9'], ['stage-4', 'f9d0c4']];
for (const [name, color] of labels) gh(['label', 'create', name, '--color', color, '--force']);

for (const l of lessons.filter((x) => x.status === 'open')) {
  const body = [
    `**Lesson ${l.id}: ${l.title_en}**`,
    '',
    `- Stage: ${l.stage}`,
    `- Needs: ${(l.needs || []).join(', ') || 'none'}`,
    `- Folder: \`${l.folder}\``,
    '',
    'To claim this lesson, comment "I claim this". An editor will assign it to you.',
    'Then post your outline (10–15 lines) here before you start writing.',
    '',
    `Guide: ${book.repo_url}/blob/main/GUIDE.md`,
  ].join('\n');
  gh(['issue', 'create', '--title', `Lesson ${l.id}: ${l.title_en}`, '--label', `lesson,stage-${l.stage}`, '--body', body]);
}

for (const b of BLOCKS) {
  const body = [
    `**Dictionary clean-up: ${b}**`,
    '',
    `Dictionary: ${book.dictionary_url}`,
    '',
    'Check: Urdu spelling; entries with several renderings (propose one); wrong field tags; near-duplicates.',
    'Fix obvious errors. Flag (⚑) judgement calls.',
    '',
    'To claim this block, comment "I claim this".',
  ].join('\n');
  gh(['issue', 'create', '--title', `Dictionary: ${b}`, '--label', 'dictionary', '--body', body]);
}
