# ریاضی: او لیول

O Level Mathematics in Urdu. A free web textbook: one page per lesson, each with its own PDF in Nastaliq or Naskh.

**Site:** https://aasem.github.io/riyazi-olevel/

- 9 chapters, 90 lessons, following the topic list of Cambridge O Level Mathematics (Syllabus D) 4024.
- Every lesson is written from scratch in Urdu by a volunteer. Nothing is translated from a commercial book.
- Terms come from the [English–Urdu Dictionary of Scientific and Technical Terms](https://aasem.github.io/takneeki-lughat/).

## Take part

1. Read [GUIDE.md](GUIDE.md).
2. Open **Issues**, take the first unassigned lesson, comment "I claim this".
3. Write, push, open a pull request.

How the project is organised: [METHODOLOGY.md](METHODOLOGY.md).

## Layout

```
book.yaml                  site title and links
content/
  ch1-number/
    chapter.yaml
    1.01-types-of-number/
      lesson.yaml          id, titles, stage, needs, status, author
      sections/01…09.md    the nine sections
      figures/             SVG or PNG drawn by us
scripts/build.js           builds site/ (web pages and PDFs)
scripts/make-issues.js     creates the queue of issues (run once)
.github/workflows/         check on pull requests, publish on merge
```

## Licence

© 2026 the contributors. Text and figures are licensed under [CC BY-SA 4.0](LICENSE).

An independent project. Not endorsed by or affiliated with Cambridge or any publisher.
