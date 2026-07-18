# RetouchByJason — Landing Page

Single-page marketing site for RetouchByJason, a professional photo-editing & graphic-design service. Implemented from the Claude Design handoff (`RetouchByJason.dc.html`) as a dependency-free static site.

## Structure

- `index.html` — the full page: header, hero, portfolio, services, process, pricing, FAQ, contact, footer
- `css/styles.css` — design tokens, components, animations, responsive breakpoints (1024 / 860 / 720 / 600 px)
- `js/main.js` — scroll reveals, header shrink + scroll-progress bar, mobile drawer, before/after sliders, hero parallax, magnetic CTA, stat count-up, FAQ accordion
- `assets/` — placeholder stock photos (Pexels, no attribution required); replace with the client's real before/after work

## Run

Any static file server works, e.g.:

```
python -m http.server 8321
```

then open http://localhost:8321/

Fonts (Newsreader, Manrope) load from Google Fonts.
