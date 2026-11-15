# او لیول ریاضی

O Level Mathematics in Urdu. A free web textbook: one page per lesson, each with its own PDF in Nastaliq or Naskh. Light and dark themes; made for phones and tablets.

**Site:** https://aasem.github.io/riyazi-olevel/

- 9 chapters, 97 lessons, following the topic list of Cambridge O Level Mathematics (Syllabus D) 4024.
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
    1.01a-prime-numbers-hcf-and-lcm/
      brief.md             what to read, cover and practise
      lesson.yaml          id, titles, stage, needs, status, author
      sections/01…08.md    the eight sections
      figures/             TikZ (.tex), SVG or PNG drawn by us
contributors/              contributors.yaml and photos/ (credits page)
scripts/build.js           builds site/ (web pages, PDFs, search, TikZ figures)
scripts/figure-preamble.tex  shared preamble and colours for TikZ figures
scripts/make-issues.js     creates the queue of issues (run once)
.github/workflows/         check on pull requests, publish on merge
```

## Licence

© 2026 Dr. Asim Bakhshi and contributors. Text and figures are licensed under [CC BY-SA 4.0](LICENSE). Contributors are listed in `contributors/contributors.yaml` and on the site.

An independent project. Not endorsed by or affiliated with Cambridge or any publisher.
