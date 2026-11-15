# O Level Mathematics in Urdu — Methodology

## 1. What we are building

A free Urdu web textbook for O Level Mathematics (Cambridge 4024, Syllabus D, 2025–27) on GitHub Pages. One web page per lesson, each with its own PDF download. The reader chooses Nastaliq or Naskh, and a light or dark theme. The pages are in Urdu only; the English term appears when the reader taps an Urdu term. No whole-book PDF.

- Repository: https://github.com/aasem/riyazi-olevel
- Site: https://aasem.github.io/riyazi-olevel/
- Writer's guide: `GUIDE.md` in the repository

## 2. Source rule and writing method

We write original Urdu lessons. We do not translate any commercial book.

- **Free to use:** topic lists, mathematical facts, definitions, theorems, standard methods, notation.
- **Not free to use:** a book's wording, worked examples, exercise questions (even with names and numbers changed), figures, feature boxes.
- **Reference books** stay in a private shared folder. No scans or page extracts in the repo, issues or pull requests.
- **Open-licensed sources** (e.g. OpenStax under CC BY) may be translated with credit. Check each licence first.
- **Syllabus:** we use Cambridge's codes and topic names, and write our own objectives. The site says it is independent and not endorsed by Cambridge or any publisher.

Each source has one job:

| Source | Job |
|---|---|
| Syllabus | The checklist. Nothing is missing. |
| D series (New Syllabus Mathematics D1–D3) and other references | The content. What to teach and how deep. |
| Lesson brief (`brief.md`) | The link. Written by the editor for each lesson. |

A lesson brief has three lists: **Read** (chapter and sections of the D book), **Cover** (ideas and methods), **Skills to practise**.

The writer follows five steps:

1. **Read** the pages named in the brief, and one more reference.
2. **Note** keywords only, no sentences: ideas, methods, common mistakes, skills.
3. **Close** the books.
4. **Write** the lesson from the notes.
5. **Check** every item in the brief is covered.

Questions follow one rule: **same skill, new question**. Take a skill from the brief, choose your own numbers and your own Pakistani setting. Never look at a book question while writing one. Every skill gets at least one worked example and three exercise questions.

## 3. Structure

| Level | Urdu | Count | Example |
|---|---|---|---|
| Chapter | باب | 9 | 1 Number |
| Lesson | سبق | 97 | 2.5b Simultaneous linear equations |
| Section | — | 8 per lesson | Worked examples |

- A **lesson** is the unit of work: one author, one pull request, one web page, one PDF.
- Size: about one week of work for one person. A large syllabus subtopic is split (a, b, c) along the D chapters that teach it.
- Lesson ID = syllabus code, plus a letter where a subtopic is split. 68 syllabus subtopics become 97 lessons.
- One repository, one website.

```
content/
  ch1-number/
    chapter.yaml
    1.01a-prime-numbers-hcf-and-lcm/
      brief.md         # Read, Cover, Skills (written by the editor)
      lesson.yaml      # id, title, stage, needs, status, author, reviewer, sources_consulted
      sections/*.md
      figures/
```

## 4. Roles

| Role | Does | Who |
|---|---|---|
| Writer | Outline, draft, fixes. Responsible for correct answers. | Anyone |
| Reviewer | Language, clarity, template | Any other writer |
| Chapter editor | Signs off and merges in one chapter | Writer with 2 published lessons, appointed by the editor |
| Editor | Final authority; writes the briefs; samples chapter editors' merges | Asim |

No one holds two roles on the same lesson.

## 5. Queue rules

The team can be any size. Nothing is assigned to a fixed person or a fixed number of people.

1. All lessons sit in one queue, ordered by stage, then by ID (section 9).
2. A person claims the first unclaimed lesson by commenting "I claim this" on its issue. An editor assigns it.
3. One lesson per person at a time.
4. No activity for 14 days: the claim is removed and the lesson returns to the queue.
5. Before claiming a second lesson, review one lesson by someone else.
6. The editor may move any lesson up the queue.

## 6. Lesson template (the 8 sections)

1. Opening: a real situation from Pakistani life that needs this idea
2. What you will learn
3. Explanation, from the simplest case upward
4. Worked examples: at least three, rising in difficulty
5. Try it yourself: one question for each example
6. Exercise: basic, intermediate, advanced
7. Answers (folded on the web page; the reader opens them)
8. Summary

Conventions:
- Terms: at first use write `[[english term|اردو اصطلاح]]`. The page shows the Urdu; the English appears on tap or hover. No English in brackets and no term table. The PDF lists the terms at the end automatically.
- Mathematics in `$…$`, left to right.
- Terms come from Takneeki Lughat only. A missing term is added there first.
- Refer to other lessons by link, never "as we saw above".
- Localise: rupees, Pakistani cities, cricket, electricity bills, mobile packages, crops, local names.
- Figures are drawn by us (SVG or PNG).

## 7. Workflow per lesson

`open → claimed → outline → draft → review → signed off → published`

1. Claim the issue. Create branch `lesson/2.05c`. Set `status: draft` in `lesson.yaml`.
2. Read the brief and the pages it names. Post a 10–15 line outline in the issue. Chapter editor approves.
3. Write. Open one pull request that touches only that lesson's folder.
4. Reviewer comments. Writer fixes.
5. Chapter editor sets `status: published` and merges. The build publishes the web page and PDFs.

Done means: every item in the brief covered; template followed; all terms in the dictionary; nothing copied; builds without errors.

## 8. Dictionary clean-up (≈4,150 terms)

Same queue rule: claim one open block, finish it, claim the next. Each block has one issue. A letter with more than 300 terms is split into two halves of its alphabetical list.

| Block | Terms |
|---|---|
| A (first half) | 173 |
| A (second half) | 173 |
| B | 142 |
| C (first half) | 214 |
| C (second half) | 214 |
| D | 265 |
| E | 211 |
| F | 161 |
| G, H | 195 |
| I | 268 |
| J, K, L | 229 |
| M | 193 |
| N | 135 |
| O | 134 |
| P (first half) | 165 |
| P (second half) | 165 |
| Q, R | 263 |
| S (first half) | 214 |
| S (second half) | 214 |
| T | 208 |
| U–Z, 0–9 | 216 |

Check: Urdu spelling; entries with several renderings (propose one); wrong field tags; near-duplicates. Fix obvious errors. Flag (⚑) judgement calls.

Before drafting, each writer confirms their lesson's terms are in the dictionary.

## 9. Stages and the queue (97 lessons)

A **stage** is the order in which lessons are opened for writing. The stage of a lesson is the D book that teaches it.

| Stage | Lessons | Reference |
|---|---|---|
| 1 | 31 | D1 |
| 2 | 30 | D2 |
| 3 | 26 | D3 |
| 4 | 10 | Not in D1–D3. Reference to be named. |

Rules:
- Write Stage 1 first. Open the next stage when most of the current one is published.
- Inside a stage, the queue order is by ID.
- "Read" is the chapter and sections of New Syllabus Mathematics (7th ed.) for that lesson. Chapter 1: 1.1 means chapter 1, section 1.1.
- "Needs" lists the lessons a student must know first. A needed lesson is in the same or an earlier stage.

### Stage 1 (31)

| ID | Lesson | Needs | Read |
|---|---|---|---|
| 1.1a | Prime numbers, HCF and LCM | — | D1 Chapter 1: 1.1, 1.3 |
| 1.1b | Integers, rational and real numbers | 1.1a | D1 Chapter 2: 2.1, 2.4 |
| 1.3 | Powers and roots | 1.1a | D1 Chapter 1: 1.2 |
| 1.4 | Fractions, decimals and percentages | 1.1b | D1 Chapter 2: 2.4; D1 Chapter 8: 8.1 |
| 1.5 | Ordering | 1.1b | D1 Chapter 2: 2.1, 2.4 |
| 1.6 | The four operations | 1.1b | D1 Chapter 2: 2.2, 2.3, 2.4 |
| 1.9 | Estimation | 1.4 | D1 Chapter 3: 3.1, 3.2, 3.3, 3.4 |
| 1.11 | Ratio and proportion | 1.4 | D1 Chapter 9: 9.1 |
| 1.12 | Rates | 1.11 | D1 Chapter 9: 9.2, 9.4 |
| 1.13a | Percentages | 1.4 | D1 Chapter 8: 8.1, 8.2 |
| 1.14 | Using a calculator | 1.6 | D1 Chapters 1 to 3 (calculator notes); your calculator's manual |
| 1.15 | Time | — | D1 Chapter 9: 9.3 |
| 2.1 | Introduction to algebra | 1.6 | D1 Chapter 4: 4.1 |
| 2.2a | Simplifying and expanding linear expressions | 2.1 | D1 Chapter 4: 4.2, 4.3 |
| 2.2b | Factorising: common factors | 2.2a | D1 Chapter 4: 4.4 |
| 2.5a | Linear equations | 2.2a | D1 Chapter 5: 5.1, 5.3 |
| 2.6a | Simple inequalities | 2.5a | D1 Chapter 5: 5.4 |
| 2.7 | Sequences | 2.1 | D1 Chapter 7: 7.1, 7.2, 7.3, 7.4 |
| 3.1 | Coordinates | — | D1 Chapter 6: 6.1 |
| 3.2 | Drawing linear graphs | 3.1, 2.1 | D1 Chapter 6: 6.3 |
| 4.1a | Geometrical terms: points, lines and angles | — | D1 Chapter 10: 10.1, 10.2 |
| 4.1b | Geometrical terms: triangles, quadrilaterals and polygons | 4.1a | D1 Chapter 11: 11.1, 11.2, 11.3 |
| 4.1c | Geometrical terms: solids, nets and circles | 4.1a | D1 Chapter 14: 14.2; D3 Chapter 10: 10.1 (parts of a circle only) |
| 4.2 | Geometrical constructions | 4.1a | D1 Chapter 12: 12.1, 12.2, 12.3, 12.4 |
| 4.6a | Angles: at a point, parallel lines, triangles | 4.1a | D1 Chapter 10: 10.2, 10.3; D1 Chapter 11: 11.1 |
| 4.6b | Angles: quadrilaterals and polygons | 4.6a | D1 Chapter 11: 11.2, 11.3 |
| 5.1 | Units of measure | — | D1 Chapter 13: 13.1; D1 Chapter 14: 14.1 |
| 5.2 | Area and perimeter | 5.1, 4.1b | D1 Chapter 13: 13.2, 13.3, 13.4 |
| 5.4a | Surface area and volume: cuboids, prisms, cylinders | 5.2, 4.1c | D1 Chapter 14: 14.3, 14.4, 14.5 |
| 9.1 | Classifying statistical data | — | D1 Chapter 15: 15.1 |
| 9.4 | Statistical charts and diagrams | 9.1 | D1 Chapter 15: 15.2, 15.3, 15.4 |

### Stage 2 (30)

| ID | Lesson | Needs | Read |
|---|---|---|---|
| 1.2a | Sets: language and notation | 1.1b | D2 Chapter 14: 14.1, 14.2 |
| 1.2b | Sets: Venn diagrams, union and intersection | 1.2a | D2 Chapter 14: 14.3, 14.4, 14.5 |
| 2.2c | Expanding and factorising quadratic expressions | 2.2b | D2 Chapter 3: 3.1, 3.2, 3.3 |
| 2.2d | Special identities and factorising by grouping | 2.2c | D2 Chapter 4: 4.1, 4.2, 4.3, 4.4 |
| 2.3 | Algebraic fractions | 2.2c | D2 Chapter 6: 6.1, 6.2, 6.3 |
| 2.5b | Simultaneous linear equations | 2.5a | D2 Chapter 2: 2.5, 2.6, 2.7 |
| 2.5c | Quadratic equations: factorisation | 2.2c | D2 Chapter 5: 5.1, 5.2 |
| 2.5f | Formulae and changing the subject | 2.5a | D1 Chapter 5: 5.2; D2 Chapter 6: 6.4 |
| 2.8 | Proportion | 1.11, 2.5a | D2 Chapter 1: 1.1 to 1.6 |
| 2.9a | Travel and conversion graphs | 3.2, 1.12 | D1 Chapter 6: 6.4; D2 Chapter 2: 2.2 |
| 2.10a | Graphs of quadratic functions | 3.2, 2.2c | D2 Chapter 5: 5.3; D3 Chapter 1: 1.6 |
| 2.12a | Functions and function notation | 2.1 | D1 Chapter 6: 6.2; D2 Chapter 7: 7.1, 7.2 |
| 3.3 | Gradient of linear graphs | 3.2 | D2 Chapter 2: 2.1, 2.3 |
| 4.3 | Scale drawings | 4.2, 1.11 | D2 Chapter 8: 8.3 |
| 4.4a | Congruence and similarity | 4.1b, 1.11 | D2 Chapter 8: 8.1, 8.2; D3 Chapter 11 |
| 4.5 | Symmetry | 4.1b | D2 Chapter 13: 13.1, 13.2, 13.3, 13.4 |
| 5.4b | Surface area and volume: pyramids, cones, spheres | 5.4a, 6.1 | D2 Chapter 12: 12.1, 12.2, 12.3 |
| 5.5 | Compound shapes and parts of shapes | 5.4a | D1 Chapter 14: 14.6; D2 Chapter 12: 12.4 |
| 6.1 | Pythagoras' theorem | 1.3, 4.1b | D2 Chapter 10: 10.1, 10.2, 10.3 |
| 6.2a | Right-angled triangles: sine, cosine, tangent | 6.1 | D2 Chapter 11: 11.1, 11.2, 11.3 |
| 7.1a | Transformations: reflection and translation | 3.1 | D2 Chapter 9: 9.1, 9.3 |
| 7.1b | Transformations: rotation | 7.1a | D2 Chapter 9: 9.2 |
| 7.1c | Transformations: enlargement | 7.1a, 4.4a | D2 Chapter 8: 8.3 |
| 8.1 | Introduction to probability | 1.4 | D2 Chapter 15: 15.1, 15.2, 15.3 |
| 8.2 | Relative and expected frequencies | 8.1 | D2 Chapter 15: 15.4 |
| 9.2 | Interpreting statistical data | 9.4, 9.3a | D1 Chapter 15: 15.5, 15.6; D2 Chapter 16: 16.1 |
| 9.3a | Averages and range | 9.1 | D2 Chapter 17: 17.1, 17.2, 17.3, 17.4 |
| 9.3b | Mean of grouped data | 9.3a | D2 Chapter 17: 17.1, 17.4 |
| 9.5 | Scatter diagrams | 9.4, 3.1 | D2 Chapter 16: 16.4 |
| 9.7 | Histograms | 9.4 | D2 Chapter 16: 16.5, 16.6 |

### Stage 3 (26)

| ID | Lesson | Needs | Read |
|---|---|---|---|
| 1.7 | Indices I | 1.3 | D3 Chapter 4: 4.1, 4.2, 4.3 |
| 1.8 | Standard form | 1.7 | D3 Chapter 4: 4.5 |
| 1.10 | Limits of accuracy | 1.9 | D3 Chapter 3: 3.4 |
| 1.13b | Percentages: profit, loss, discount and interest | 1.13a | D3 Chapter 5: 5.1, 5.2, 5.3, 5.4 |
| 1.16 | Money | 1.11 | D3 Chapter 5: 5.5 |
| 2.2e | Completing the square | 2.2d | D3 Chapter 1: 1.1 |
| 2.4 | Indices II | 1.7 | D3 Chapter 4: 4.2, 4.4 |
| 2.5d | Quadratic equations: completing the square and the formula | 2.2e, 2.5c | D3 Chapter 1: 1.1, 1.2, 1.5 |
| 2.5e | Fractional equations | 2.3, 2.5d | D3 Chapter 1: 1.4 |
| 2.6b | Linear inequalities: solving and problems | 2.6a | D3 Chapter 3: 3.1, 3.2, 3.3 |
| 2.9b | Speed-time graphs and rates of change | 2.9a, 3.3 | D3 Chapter 7: 7.4, 7.5 |
| 2.10b | Graphs of cubic, reciprocal and exponential functions | 2.10a, 2.4 | D3 Chapter 7: 7.1, 7.2, 7.3 |
| 2.10c | Solving equations graphically and gradients of curves | 2.10b | D3 Chapter 1: 1.3; D3 Chapter 7: 7.4 |
| 2.12b | Inverse and composite functions | 2.12a, 2.5f | D3 Chapter 2: 2.1, 2.2 |
| 3.4 | Length and midpoint | 3.1, 6.1 | D3 Chapter 6: 6.2 |
| 3.5 | Equations of linear graphs | 3.3 | D2 Chapter 2: 2.4; D3 Chapter 6: 6.1, 6.3 |
| 3.6 | Parallel lines | 3.5 | D3 Chapter 6: 6.4 |
| 3.7 | Perpendicular lines | 3.6 | D3 Chapter 6: 6.4 |
| 4.4b | Areas and volumes of similar figures | 4.4a | D3 Chapter 12: 12.1, 12.2 |
| 4.7 | Circle theorems I | 4.6a, 4.1c | D3 Chapter 13: 13.2 |
| 4.8 | Circle theorems II | 4.7 | D3 Chapter 13: 13.1 |
| 5.3 | Circles, arcs and sectors | 5.2 | D3 Chapter 10: 10.1, 10.2 |
| 6.2b | Right-angled triangles: elevation, depression and bearings | 6.2a | D2 Chapter 11: 11.4; D3 Chapter 9: 9.1, 9.2 |
| 6.3a | Sine rule | 6.2a | D3 Chapter 8: 8.1, 8.3 |
| 6.3b | Cosine rule and area of a triangle | 6.3a | D3 Chapter 8: 8.2, 8.4 |
| 6.4 | Pythagoras and trigonometry in 3D | 6.2b | D3 Chapter 9: 9.3 |

### Stage 4 (10)

| ID | Lesson | Needs | Read |
|---|---|---|---|
| 1.17 | Exponential growth and decay | 1.13b | — |
| 1.18 | Surds | 1.7 | — |
| 2.6c | Inequalities in two variables and regions | 2.6b, 3.5 | — |
| 2.11 | Sketching curves | 2.10b, 2.5d | — |
| 7.2 | Vectors in two dimensions | 7.1a | — |
| 7.3 | Magnitude of a vector | 7.2, 6.1 | — |
| 7.4 | Vector geometry | 7.3 | — |
| 8.3a | Combined events: sample spaces and Venn diagrams | 8.1, 1.2b | — |
| 8.3b | Combined events: tree diagrams | 8.3a | — |
| 9.6 | Cumulative frequency diagrams | 9.3b | — |

## 10. Walkthrough: writing lesson 1.1b

Do this once yourself to see exactly what a student does. Lesson 1.1a is the finished model; keep it open beside you.

### A. Set up (once)

1. Install Git (https://git-scm.com/downloads) and Obsidian (https://obsidian.md).
2. Open a terminal (Windows: Git Bash):

```bash
git clone https://github.com/aasem/riyazi-olevel.git
cd riyazi-olevel
```

3. In Obsidian: **Open folder as vault** → choose `riyazi-olevel`. Settings → Editor → turn on **Right-to-left (RTL)**.

Students fork first and clone their fork (see `GUIDE.md`). You own the repository, so you clone it directly.

### B. Read and note

1. Open `content/ch1-number/1.01b-integers-rational-and-real-numbers/brief.md`.
2. Read what it names: D1 Chapter 2, sections 2.1 and 2.4.
3. On paper, write keywords only: negative numbers, number line, rational = a/b, terminating and recurring decimals, irrational (√2, π), real numbers, reciprocal.
4. Close the book.

### C. Start a branch

```bash
git checkout main
git pull origin main
git checkout -b lesson/1.01b
```

### D. Fill `lesson.yaml`

In the lesson folder, change two lines and add your sources:

```yaml
status: draft
author: "aasem"
sources_consulted: ["NSM D1 ch.2"]
```

### E. Write the eight sections

Open each file in `sections/` and write below the comment line. Do not type the section heading.

**`01-opening.md`**: one or two paragraphs.

```
جنوری کی ایک صبح سکردو میں درجۂ حرارت $-8$ ڈگری سینٹی گریڈ ہے اور کراچی میں $24$ ڈگری۔
```

**`02-objectives.md`**: a bullet list.

```
اِس سبق کے بعد آپ:

- صحیح اعداد کو عددی خط پر دکھا سکیں گے۔
- ناطق اور غیر ناطق اعداد میں فرق کر سکیں گے۔
```

**`03-explanation.md`**: sub-headings with `##`, terms with `[[english|اردو]]`, a figure.

```
## صحیح اعداد

قدرتی اعداد، صفر اور منفی اعداد مل کر [[integers|صحیح اعداد]] بناتے ہیں:

$$\dots,\ -3,\ -2,\ -1,\ 0,\ 1,\ 2,\ 3,\ \dots$$

![عددی خط پر صحیح اعداد](figures/number-line.svg)
```

The file `figures/number-line.svg` is already in the folder.

**`04-examples.md`**: each example starts with `## مثال 1`.

```
## مثال 1

$0.75$ کو کسر کی صورت میں لکھیں۔

**حل:**

$$0.75 = \frac{75}{100} = \frac{3}{4}$$
```

**`05-try-it.md`**: one numbered question for each example.

```
1. $0.4$ کو کسر کی صورت میں لکھیں۔
```

**`06-exercise.md`**: three parts, questions numbered through.

```
## بنیادی

1. $-3$، $0$ اور $5$ کو عددی خط پر دکھائیں۔

## درمیانی

2. بتائیں کہ $\sqrt{9}$ ناطق ہے یا غیر ناطق۔

## اعلیٰ

3. $\frac{5}{8}$ کا مقلوب معلوم کریں اور اُسے اعشاریہ میں لکھیں۔
```

**`07-answers.md`**: two parts.

```
## خود کیجیے

1. $\frac{2}{5}$

## مشق

2. ناطق، کیونکہ $\sqrt{9} = 3$
3. $\frac{8}{5} = 1.6$
```

**`08-summary.md`**: four to eight bullets.

Before you finish, tick every line of `brief.md`: each Cover item is explained, and each skill has one worked example and three exercise questions.

### F. Save and send

```bash
git status
git add content/
git commit -m "Lesson 1.1b: first draft"
git push -u origin lesson/1.01b
```

`git status` should list only files in the 1.1b folder.

### G. Pull request, check, preview

1. Open https://github.com/aasem/riyazi-olevel. Click the yellow **Compare & pull request** button. Title: `Lesson 1.1b: Integers, rational and real numbers`. Click **Create pull request**.
2. Wait about two minutes for **Check lesson**.
   - Green tick: it builds.
   - Red cross: click **Details**. The message names the file and the problem, for example a missing `$`. Fix it, then `git add content/`, `git commit -m "Fix"`, `git push`.
3. To see the page: **Checks** tab → **Check lesson** → **preview** (download). Unzip and open `index.html`. Try both scripts, the dark theme, a term, and the PDF.

### H. Publish

1. In the pull request, open **Files changed**, edit `lesson.yaml`, and change `status: draft` to `status: published`. Commit.
2. Click **Squash and merge**.
3. After about two minutes the lesson is live at https://aasem.github.io/riyazi-olevel/.
4. On your computer:

```bash
git checkout main
git pull origin main
git branch -d lesson/1.01b
```
