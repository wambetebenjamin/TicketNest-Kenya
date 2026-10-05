# Design Source Inspection: `theevent-1.0.0.zip`

Complete audit of the uploaded design source performed before writing any code
(the zip is preserved in the repository root, unmodified).

## Template identity

- **Template:** TheEvent — Conference Event Bootstrap Template
- **Author:** BootstrapMade.com (updated Aug 07 2024, Bootstrap v5.3.3)
- **License:** https://bootstrapmade.com/license/
- **Files:** 142 files, 13,972,773 bytes uncompressed

## Pages / routes found (static HTML)

| File | Purpose | Sections |
| --- | --- | --- |
| `index.html` | One-page site | `#hero` (with about-info block), `#speakers`, `#schedule` (day-1/2/3 tabs), `#venue`, `#hotels`, `#gallery`, `#sponsors`, `#buy-tickets` (pricing rows), `#faq`, newsletter CTA, `#contact`, `#footer` |
| `speaker-details.html` | Speaker profile | breadcrumb, hero, speaker bio, schedule |
| `starter-page.html` | Blank starter | header + section placeholder + footer |
| `forms/contact.php` | PHP email stub | requires pro-version "PHP Email Form" library (not present) |

## Design tokens (`assets/css/main.css`)

**Fonts (Google Fonts, `<link>` + preconnect, ital+wght 100–900, display=swap):**
- `--default-font: "Roboto", system-ui, ...` (body)
- `--heading-font: "Raleway", sans-serif`
- `--nav-font: "Raleway", sans-serif`

**Global colors:**
- `--background-color: #ffffff`
- `--default-color: #2f3138` (body text)
- `--heading-color: #0e1b4d` (deep navy)
- `--accent-color: #f82249` (crimson — buttons, links, underlines)
- `--surface-color: #ffffff`, `--contrast-color: #ffffff`
- `.light-background`: bg `#f2f2f3`, surface `#ffffff`
- `.dark-background`: bg `#000820`, surface `#001553`, text `#ffffff`
- Success `#059652`, error `#df1529`

**Nav colors:** `--nav-color: rgba(255,255,255,.65)`, hover `#ffffff`, dropdown
bg `#ffffff`, dropdown color `#212529`, dropdown hover `#f82249`; scrolled
header bg `rgba(1,8,33,.82)` + `0 0 18px rgba(0,0,0,.1)` shadow.

**Spacing / sizing:**
- Sections: `padding: 60px 0`, `scroll-margin-top: 92px` (76px < 1200px)
- Section titles: `h2 32px/700`, mb 20px, pb 20px, centered `50×3px` accent underline
- Hero: `h2 48px/700` (32px mobile), `p 24px` (18px mobile)
- Nav links: `15px/600` Raleway, 2px accent underline grows on hover (300ms)
- Header CTA: `14px`, `padding 8px 25px`, `border-radius: 50px` (pill)
- Pricing rows: `h3 24px/700`, price `h4 48px` Raleway accent
- Cards: shadow `0 3px 20px -2px rgba(0,0,0,.1)`
- Footer: `h4 16px/600`, `p 14px`, footer-top `color-mix(bg, white 5%)`

**Icon library:** Bootstrap Icons (`bi-*` icon font, woff/woff2). Mapped to
**Lucide** icons in the rebuild per project spec.

## Loading screen (zip)

`<div id="preloader"></div>` + `#preloader:before` spinner: 60×60px circle,
6px border with `accent transparent accent transparent`, 1.5s linear infinite
rotation, removed on `window.load`, container has `transition: all 0.6s ease-out`.
Since the source loader is a bare spinner, the spec's branded loader was built:
logo mark from center, ticket scan animation left-to-right, progress counter to
100%, content fade-in, under 2s, once per session.

## Behaviors (`assets/js/main.js`)

- `.scrolled` class on body after 100px scroll (header bg + shadow)
- Mobile nav toggle (`.mobile-nav-active` body class)
- Preloader removal on load
- Scroll-top button after 100px, smooth scroll
- AOS init: `duration: 600, easing: 'ease-in-out', once: true, mirror: false`
- GLightbox for `.glightbox` elements
- Swiper carousels via `.init-swiper` + JSON config
- PHP email form validation (vendor stub)
- Pure counter (counts up numbers)

## Vendor libraries in zip

Bootstrap 5.3.3 (css/js), Bootstrap Icons, AOS 3.x, GLightbox, Swiper,
php-email-form validator.

## Imagery in zip

`hero-bg.jpg` (1920×1277 concert crowd), `event-gallery-1..8.jpg` (800×600),
`venue-gallery-1..8.jpg`, `speaker-*.jpg` (10), `hotels-1..3.jpg`,
`clients/client-1..8.png`, `logo.png`, `favicon.png`, `apple-touch-icon.png`,
`page-title-bg.webp`, `venue-info-bg.jpg`.

## Absent from zip (built fresh per project spec)

- Cookie consent banner (none in source)
- CAPTCHA of any kind
- Privacy Policy / Terms / Cookie Policy pages
- 404 / 500 pages
- API routes (only a PHP contact stub)
- Environment variable references (none)
- Any application framework (static HTML only — rebuilt as Next.js 14 App Router)

## How the source maps into TicketNest

| Source element | Rebuilt as |
| --- | --- |
| Roboto + Raleway Google Fonts | Same families/weights via Google Fonts `<link>` in root layout |
| Color system variables | Tailwind theme tokens + CSS variables (1:1 values) |
| Pill CTA buttons (radius 50px) | `.tn-btn` classes, same radius and accent |
| Section 60px padding + 50×3 underline titles | `.tn-section` / `.tn-section-title` |
| Dark navy hero with photo | Full-screen hero (spec content) on `#000820` with zip hero photo |
| Scrolled header `rgba(1,8,33,.82)` | Sticky navbar scrolled state |
| AOS 600ms ease-in-out once | `tn-reveal` scroll reveal (plus spec staggers) |
| Bootstrap Icons | Lucide icons (spec requirement) |
