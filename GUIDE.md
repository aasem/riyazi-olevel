# Writer's guide

You write one lesson at a time. You need a GitHub account, Git, and a text editor. You do not need to build the website; GitHub does that.

Replace `YOUR-NAME` with your GitHub username everywhere below.

## A. Set up (once)

1. Create a GitHub account: https://github.com/join
2. Install Git: https://git-scm.com/downloads
3. Install Obsidian: https://obsidian.md (VS Code also works)
4. Open https://github.com/aasem/riyazi-olevel and click **Fork**. This makes your own copy.
5. Open a terminal (on Windows: **Git Bash**) and run:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git clone https://github.com/YOUR-NAME/riyazi-olevel.git
cd riyazi-olevel
git remote add upstream https://github.com/aasem/riyazi-olevel.git
```

6. In Obsidian: **Open folder as vault** and choose the `riyazi-olevel` folder. In Settings → Editor, turn on **Right-to-left (RTL)**.

## B. Write a lesson

### 1. Claim

Open **Issues** on GitHub. Take the first lesson that has no one assigned. Comment "I claim this". An editor assigns it to you. Read the brief and its pages, then post your outline (10–15 lines) in the same issue and wait for approval.

### 2. Start a branch

A branch is your private draft. Always start from the latest `main`.

```bash
git checkout main
git pull upstream main
git checkout -b lesson/1.03
```

### 3. Fill `lesson.yaml`

Your lesson folder is named in the issue, for example `content/ch1-number/1.03-powers-and-roots/`. Do not edit `brief.md`.

```yaml
status: draft
author: "YOUR-NAME"
sources_consulted: ["NSM D1 ch.1", "OpenStax Prealgebra 2e"]
```

Do not change `id`, `title_en`, `stage` or `needs`.

The first time, also add yourself to `contributors/contributors.yaml` so you are credited on the site:

```yaml
- github: YOUR-NAME
  name: "آپ کا نام"
  role: "مصنف"
  bio: ""
  photo: ""
```

For a photo, put a square image (at least 400 px) in `contributors/photos/` and write its file name in `photo`.

### 4. Read, note, close, write, check

Open `brief.md` in your lesson folder. It has three lists: **Read**, **Cover**, **Skills to practise**.

1. **Read** the pages named in the brief, and one more reference.
2. **Note** keywords only, no sentences: ideas, methods, common mistakes, skills.
3. **Close** the books.
4. **Write** the eight sections from your notes.
5. **Check** every item in the brief is covered.

For examples and exercises: **same skill, new question**. Take a skill from the brief, choose your own numbers and your own Pakistani setting. Never look at a book question while you write one. Every skill needs at least one worked example and three exercise questions.

### The eight sections

Each file in `sections/` is one section. Write below the comment line. Do not type the section heading; the website adds it.

| File | Write |
|---|---|
| `01-opening.md` | A real situation from Pakistani life. 1–2 paragraphs. |
| `02-objectives.md` | What the student will learn. Bullet list. |
| `03-explanation.md` | The explanation. Use `##` for sub-headings. |
| `04-examples.md` | At least three worked examples. |
| `05-try-it.md` | One question for each example. |
| `06-exercise.md` | Three parts: `## بنیادی`, `## درمیانی`, `## اعلیٰ`. |
| `07-answers.md` | Answers to sections 5 and 6. |
| `08-summary.md` | 4–8 bullet points. |

How to type things:

| You want | You type |
|---|---|
| A term, first time | `[[natural numbers\|قدرتی اعداد]]` (English first, then Urdu) |
| Mathematics in a line | `$x^2 + 1$` |
| Mathematics on its own line | `$$\frac{a}{b}$$` |
| Sub-heading | `## مفرد اعداد` |
| Worked example | `## مثال 1`, then the question, then `**حل:**` and the steps |
| Bullet list | `- پہلا نکتہ` |
| Figure | `![عنوان](figures/name.svg)`; the file is `figures/name.tex` (TikZ) or `figures/name.svg` |
| Table | `\| اردو \| English \|` on one line, `\|---\|---\|` on the next |

Rules:

- Books closed while you write. Every sentence, example and question is your own.
- Reference books stay on your computer. Never upload pages, scans or screenshots.
- The reader sees only the Urdu term; the English appears when they tap it. Do not write English in brackets.
- Use terms from the dictionary: https://aasem.github.io/takneeki-lughat/ . If a term is missing, add it there first.
- All numbers and symbols go inside `$…$`.
- No HTML. No pictures taken from books or websites.
- Solve every question yourself. You are responsible for the answers.

Look at lesson 1.1a (`content/ch1-number/1.01a-prime-numbers-hcf-and-lcm/`) as the model.

### Figures

1. Draw the figure yourself. Never copy, trace or screenshot a figure from a book or website.
2. Preferred: TikZ. Create a text file such as `figures/factor-tree-60.tex` that holds only `\begin{tikzpicture} … \end{tikzpicture}`. You do not need LaTeX on your computer: GitHub compiles it. Colours you can use: `accent`, `gold`, `ink`, `soft`, `paper`, `negative`, `muted`. See the two examples in lessons 1.1a and 1.1b.
3. Also accepted: an SVG from GeoGebra (File → Download as → SVG) or diagrams.net (File → Export as → SVG), or a PNG at least 1200 px wide. Dark lines on a white or transparent background.
4. Put only numbers and letters inside the figure; Urdu goes in the caption.
5. Name the file in lowercase English with hyphens and save it in your lesson's `figures/` folder.
6. In the section file, on its own line with an empty line above and below, always with the `.svg` name: `![عنوان اردو میں](figures/factor-tree-60.svg)`
7. Caption: every figure needs one. Write a short phrase with no full stop, and do not type the number. The page adds "شکل 1:", "شکل 2:" in order. In your text, write "شکل 1 دیکھیں".
8. Size: all TikZ figures are shown at one fixed scale, so the lettering matches the text. Draw at natural size, at most 12 cm wide, and do not use `scale` to enlarge the picture.
9. Check the figure in the preview: light theme, dark theme and PDF. If a TikZ file has an error, the check names the file and the line.

### 5. Save your work to GitHub

```bash
git status
git add content/ contributors/
git commit -m "Lesson 1.3: first draft"
git push -u origin lesson/1.03
```

- `status` shows what changed. Only your lesson folder (and `contributors/` the first time) should appear.
- `add` and `commit` save a snapshot on your computer.
- `push` uploads it to your fork.

Commit and push as often as you like. After the first push, plain `git push` is enough.

### 6. Open a pull request

1. Open your fork on GitHub. Click the yellow **Compare & pull request** button.
2. Base repository: `aasem/riyazi-olevel`, base: `main`.
3. Title: `Lesson 1.3: Powers and roots`. Fill in the checklist.
4. Click **Create pull request**.

GitHub now checks your lesson. A green tick means it builds. A red cross means there is an error; click **Details** to read it. To see your page, open the **Checks** tab → **Check lesson** → download **preview**, unzip it and open `index.html`.

### 7. Fix review comments

Edit the same files, then:

```bash
git add content/
git commit -m "Lesson 1.3: fix review comments"
git push
```

The pull request updates by itself. Do not open a second one.

### 8. After it is merged

```bash
git checkout main
git pull upstream main
git branch -d lesson/1.03
```

Your lesson is now on the website. Review one lesson by someone else, then claim your next one.

## C. Editors

Review a pull request:

1. **Files changed**: only one lesson folder should be touched, plus the writer's entry in `contributors/`.
2. **Checks**: must be green. Download **preview** to read the page and the PDF.
3. Comment, or **Approve**.
4. Before merging, change `status: draft` to `status: published` in `lesson.yaml` (edit the file in the pull request).
5. **Squash and merge**. The site rebuilds in about two minutes.

Build on your own computer (optional; needs Node.js 20+, Chrome, and for TikZ figures TeX Live with `pdflatex` and `pdftocairo`):

```bash
npm install
npm run check        # validate only
npm run build        # web pages in site/
npm run build:pdf    # web pages and PDFs
```

Then open `site/index.html`.

Common problems:

| Problem | Fix |
|---|---|
| `mathematics error` in the check | A `$` is missing, or a LaTeX command is misspelt. The message names the file. |
| `title (Urdu) is required` | Fill `title` in `lesson.yaml`. |
| Push is rejected | Run `git pull upstream main`, then push again. |
| Merge conflict | Ask an editor. Do not delete your folder. |
| Wrong file changed | `git checkout main -- path/to/file`, then commit. |
