# O Level Mathematics in Urdu — Methodology

## 1. What we are building

A free Urdu web textbook for O Level Mathematics (Cambridge 4024, Syllabus D, 2025–27) on GitHub Pages. One web page per lesson, each with its own PDF download. The reader chooses Nastaliq or Naskh on the page and in the PDF. No whole-book PDF.

- Repository: https://github.com/aasem/riyazi-olevel
- Site: https://aasem.github.io/riyazi-olevel/
- Writer's guide: `GUIDE.md` in the repository

## 2. Source rule

We write original Urdu lessons. We do not translate any commercial book.

- **Free to use:** topic lists, mathematical facts, definitions, theorems, standard methods, notation.
- **Not free to use:** a book's wording, worked examples, exercise questions (even with names and numbers changed), figures, feature boxes.
- **Method:** read the lesson's topic in two or three references, outline in your own words, close the books, write in Urdu. All examples and exercises are new.
- **Reference books** stay in a private shared folder. No scans or page extracts in the repo, issues or pull requests.
- **Open-licensed sources** (e.g. OpenStax under CC BY) may be translated with credit. Check each licence first.
- **Syllabus:** we use Cambridge's codes and topic names, and write our own objectives. The site says it is independent and not endorsed by Cambridge or any publisher.

## 3. Structure

| Level | Urdu | Count | Example |
|---|---|---|---|
| Chapter | باب | 9 | 1 Number |
| Lesson | سبق | 90 | 2.5c Simultaneous equations |
| Section | — | 9 per lesson | Worked examples |

- A **lesson** is the unit of work: one author, one pull request, one web page, one PDF.
- Size: about one week of work for one person. If it is bigger, split it (a, b, c).
- Lesson ID = syllabus code, plus a letter where a subtopic is split. 68 syllabus subtopics become 90 lessons.
- One repository, one website.

```
content/
  ch1-number/
    chapter.yaml
    1.01-types-of-number/
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
| Editor | Final authority; samples chapter editors' merges | Asim |

No one holds two roles on the same lesson.

## 5. Queue rules

The team can be any size. Nothing is assigned to a fixed person or a fixed number of people.

1. All lessons sit in one queue, ordered by stage, then by ID (section 9).
2. A person claims the first unclaimed lesson by commenting "I claim this" on its issue. An editor assigns it.
3. One lesson per person at a time.
4. No activity for 14 days: the claim is removed and the lesson returns to the queue.
5. Before claiming a second lesson, review one lesson by someone else.
6. The editor may move any lesson up the queue.

## 6. Lesson template (the 9 sections)

1. Opening: a real situation from Pakistani life that needs this idea
2. What you will learn
3. Explanation, from the simplest case upward
4. Worked examples: at least three, rising in difficulty
5. Try it yourself: one question after each example
6. Exercise: basic, intermediate, advanced
7. Answers
8. Summary
9. Terms in this lesson: Urdu with English, linked to the dictionary

Conventions:
- Urdu term in bold, English in brackets at first use (students sit the paper in English).
- Mathematics in `$…$`, left to right.
- Terms come from Takneeki Lughat only. A missing term is added there first.
- Refer to other lessons by link, never "as we saw above".
- Localise: rupees, Pakistani cities, cricket, electricity bills, mobile packages, crops, local names.
- Figures are drawn by us (SVG or PNG).

## 7. Workflow per lesson

`open → claimed → outline → draft → review → signed off → published`

1. Claim the issue. Create branch `lesson/2.05c`. Set `status: draft` in `lesson.yaml`.
2. Post a 10–15 line outline in the issue. Chapter editor approves.
3. Write. Open one pull request that touches only that lesson's folder.
4. Reviewer comments. Writer fixes.
5. Chapter editor sets `status: published` and merges. The build publishes the web page and PDFs.

Done means: template followed; all terms in the dictionary; nothing copied; builds without errors.

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

## 9. Stages and the queue (90 lessons)

A **stage** is the order in which lessons are opened for writing.

| Stage | Lessons | Meaning |
|---|---|---|
| 1 | 26 | Foundations. Needs only primary-school arithmetic or other Stage 1 lessons. |
| 2 | 26 | Builds on Stage 1. |
| 3 | 27 | Builds on Stage 2. |
| 4 | 11 | Most advanced. Builds on Stage 3. |

Rules:
- Write Stage 1 first. Open the next stage when most of the current one is published.
- "Needs" lists the lessons a student must know first. The writer links to them.
- A needed lesson is in an earlier stage or the same stage. If it is not published yet, the link is added at review.
- Inside a stage, the queue order is by ID.

### Stage 1 (26)

| ID | Lesson | Needs |
|---|---|---|
| 1.1 | Types of number | — |
| 1.3 | Powers and roots | 1.1 |
| 1.4 | Fractions, decimals and percentages | — |
| 1.5 | Ordering | 1.4 |
| 1.6 | The four operations | 1.4 |
| 1.9 | Estimation | 1.4 |
| 1.11 | Ratio and proportion | 1.4 |
| 1.13a | Percentages: basics, increase and decrease | 1.4 |
| 1.14 | Using a calculator | 1.6 |
| 1.15 | Time | — |
| 1.16 | Money | 1.4 |
| 2.1 | Introduction to algebra | 1.6 |
| 2.2a | Simplifying and expanding | 2.1 |
| 2.5a | Forming and solving linear equations | 2.2a |
| 3.1 | Coordinates | — |
| 3.2 | Drawing linear graphs | 3.1, 2.1 |
| 4.1a | Geometrical terms: lines and angles | — |
| 4.1b | Geometrical terms: triangles, quadrilaterals, polygons | 4.1a |
| 4.1c | Geometrical terms: solids, nets, circles | 4.1a |
| 4.2 | Geometrical constructions | 4.1a |
| 4.6a | Angles: at a point, parallel lines, triangles | 4.1a |
| 5.1 | Units of measure | — |
| 5.2 | Area and perimeter | 5.1, 4.1b |
| 9.1 | Classifying statistical data | — |
| 9.2 | Interpreting statistical data | 9.1 |
| 9.4 | Statistical charts and diagrams | 9.1 |

### Stage 2 (26)

| ID | Lesson | Needs |
|---|---|---|
| 1.2a | Sets: language and notation | 1.1 |
| 1.2b | Sets: Venn diagrams | 1.2a |
| 1.7 | Indices I | 1.3 |
| 1.8 | Standard form | 1.7 |
| 1.12 | Rates | 1.11 |
| 1.13b | Percentages: reverse percentages and interest | 1.13a |
| 2.2b | Factorising: common factors and grouping | 2.2a |
| 2.5c | Simultaneous linear equations | 2.5a |
| 2.6a | Linear inequalities and the number line | 2.5a |
| 2.7 | Sequences | 2.1 |
| 2.8 | Proportion | 1.11, 2.5a |
| 2.9a | Travel and conversion graphs | 3.2, 1.12 |
| 3.3 | Gradient of linear graphs | 3.2 |
| 3.4 | Length and midpoint | 3.1, 6.1 |
| 3.5 | Equations of linear graphs | 3.3 |
| 4.3 | Scale drawings | 4.2, 1.11 |
| 4.5 | Symmetry | 4.1b |
| 4.6b | Angles: polygons | 4.6a |
| 5.3 | Circles, arcs and sectors | 5.2 |
| 5.4a | Surface area and volume: cuboids, prisms, cylinders | 5.2, 4.1c |
| 6.1 | Pythagoras' theorem | 1.3, 4.1b |
| 7.1a | Transformations: reflection and translation | 3.1 |
| 7.1b | Transformations: rotation | 7.1a |
| 8.1 | Introduction to probability | 1.4 |
| 8.2 | Relative and expected frequencies | 8.1 |
| 9.3a | Averages and spread: ungrouped data | 9.2 |

### Stage 3 (27)

| ID | Lesson | Needs |
|---|---|---|
| 1.10 | Limits of accuracy | 1.9 |
| 1.17 | Exponential growth and decay | 1.13b |
| 2.2c | Factorising quadratics and completing the square | 2.2b |
| 2.3 | Algebraic fractions | 2.2c |
| 2.4 | Indices II | 1.7 |
| 2.5b | Fractional equations | 2.3, 2.5a |
| 2.5d | Quadratic equations: factorisation | 2.2c |
| 2.5e | Quadratic equations: completing the square and the formula | 2.5d |
| 2.5f | Changing the subject of a formula | 2.5a |
| 2.6b | Inequalities in two variables and regions | 2.6a, 3.5 |
| 2.9b | Speed–time graphs | 2.9a, 3.3 |
| 2.10a | Graphs of functions: tables and drawing | 3.2, 2.4 |
| 3.6 | Parallel lines | 3.5 |
| 3.7 | Perpendicular lines | 3.6 |
| 4.4 | Similarity | 4.1a, 1.11 |
| 4.7 | Circle theorems I | 4.6a, 4.1c |
| 5.4b | Surface area and volume: pyramids, cones, spheres | 5.4a, 6.1 |
| 5.5 | Compound shapes and parts of shapes | 5.3, 5.4a |
| 6.2a | Right-angled triangles: sine, cosine, tangent | 6.1 |
| 6.2b | Right-angled triangles: applications | 6.2a |
| 7.1c | Transformations: enlargement | 7.1a, 4.4 |
| 7.2 | Vectors in two dimensions | 7.1a |
| 7.3 | Magnitude of a vector | 7.2, 6.1 |
| 8.3a | Combined events: sample spaces and Venn diagrams | 8.1, 1.2b |
| 8.3b | Combined events: tree diagrams | 8.3a |
| 9.3b | Averages and spread: grouped data | 9.3a |
| 9.5 | Scatter diagrams | 9.4, 3.3 |

### Stage 4 (11)

| ID | Lesson | Needs |
|---|---|---|
| 1.18 | Surds | 1.7 |
| 2.10b | Graphs of functions: solving equations and gradients | 2.10a |
| 2.11 | Sketching curves | 2.10a, 2.5e |
| 2.12 | Functions | 2.5f |
| 4.8 | Circle theorems II | 4.7 |
| 6.3a | Sine rule | 6.2a |
| 6.3b | Cosine rule and area of a triangle | 6.3a |
| 6.4 | Pythagoras and trigonometry in 3D | 6.2b |
| 7.4 | Vector geometry | 7.3 |
| 9.6 | Cumulative frequency diagrams | 9.3b |
| 9.7 | Histograms | 9.3b |

## 10. Start

1. Editor publishes lesson 1.1 as the model.
2. Everyone: GitHub setup, one dictionary block, then claim a Stage 1 lesson.
3. After the first batch is published, review the process and adjust.

## 11. Decisions

- Repository `riyazi-olevel`; site title "ریاضی: او لیول".
- Licence: CC BY-SA 4.0, same as the dictionary.
- Script: Nastaliq and Naskh, chosen by the reader.
- Topics not covered in D1–D3: decide the reference when those lessons come up.
