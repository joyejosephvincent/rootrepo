# Sociyaal website

Static multi-page site (no build step). Open `index.html`, or upload the whole folder to any host (Netlify, Vercel, GitHub Pages, cPanel).

Pages: index, services, 9 service pages (`service-*.html`), portfolio, 4 portfolio category pages (`portfolio-*.html`), project, blog, 3 articles, team, contact (enquiry), 404.

## Make the enquiry form deliver email
Open `js/main.js` and paste a form-service URL (for example a Formspree endpoint) into `CONFIG.endpoint`.
Until then, visitors get an enquiry summary with Email, WhatsApp and Copy buttons. The page never claims a message was sent unless the service accepted it.

## Replace sample content
- Portfolio tiles and the Journal articles are sample copy. Swap in real case studies and posts.
- Testimonials, stats, services, plans, email and phone come from the previous sociyaal.com content.
- Colours are CSS variables at the top of `css/style.css` (`--purple`, `--yellow`, `--ink`).

## Theme, font, photos
- Light/dark: the round yellow floating button (bottom right) toggles the theme and remembers the choice. First visit follows the device setting.
- Font: add licensed `Dystopian.woff2` to `fonts/` (see fonts/README.txt). It is the primary font for headings and body.
- Founders and team: add photos to `assets/team/` (see the README there), then edit names and roles in `team.html`.

## Fonts and client logos
- Primary font Dystopian (headings), secondary Manrope (body, free from Google Fonts), DM Mono for small labels.
- Client logo marquee: add files to `assets/clients/` (see the README there). Edit the logo list in `index.html`.

## Before launch
- Confirm the testimonial wording and names with each client, and confirm the performance figures (2.1M reach, 4.8x ROAS, 800+ creators, 14L+ ad spend) with verified reporting periods.

## About video box
In `index.html`, find `class="video" data-yt=""` and paste a YouTube link into `data-yt` (watch, youtu.be or shorts links all work). Optional poster photo: save `assets/about-poster.jpg`. Until a link is set, the box shows "coming soon".
(In `build/build.py`, the same setting is `VIDEO_URL`.)

## Logo
The primary logo is `assets/logo.svg` (purple circle, transparent corners) and is used in the header, mobile menu, footer and as the favicon (`assets/favicon.svg`). To change it later, replace those files with the same names. `assets/logo-square.svg` is the full yellow-background version for social profiles.

## v2 additions
- **Logos**: `assets/logo.svg` shows in light mode, `assets/logo-dark.svg` in dark mode (header). The footer and mobile menu always use the dark version. Replace either file with your own, keeping the name.
- **Instagram link**: every floating reel/photo on the service and portfolio pages opens `https://www.instagram.com/sociyaal/`. If the handle differs, find and replace that address across the `.html` files.
- **Floating photos on service/portfolio pages**: drop images in `assets/media/` named `<page>-1.jpg` ... `-5.jpg` (for example `social-media-1.jpg`, `portfolio-brand-identity-3.jpg`). Missing files show brand artwork. Portfolio case-study slots read `assets/portfolio/<category>-1.jpg` ... `-3.jpg`.
- **Testimonials**: 18 in total, auto-scrolling until a small photo is clicked. Entries 04 to 18 are SAMPLE copy: replace with real, approved quotes. Small photos: `assets/testimonials/t-01.jpg` ... `t-18.jpg` (square).
- **Hero floating logos**: the five chips in the hero are plain HTML in `index.html` (`class="fl-logo"`). Swap the inline SVG for any brand logo.

## v2.1
- **Client logo strip** ("Good brands deserve great stories"): now shows the Sociyaal wordmark (`assets/logo-wordmark-*.svg`, made from the supplied logo.svg in yellow, ink, purple and white) on solid colour boxes with small clipart. To go back to real client logos, replace the `.lslot` boxes in `index.html`.
- **Hero social icons** are outline only; Meta uses a double-stroke (tube) outline.

## v3 changes
- **Logos**: `assets/logo.png` (purple wordmark, light mode) and `assets/logo-dark.png` (yellow wordmark, dark mode, footer and menu). Header, footer, mobile menu use them on every page.
- **Hero icons**: Google Ads and Spotify chips added (`fl-logo l6`, `l7` in `index.html`).
- **Brand strip**: 12 dummy brands (Dailee, Agnee, JoyeLabs, Idealcameras, Nuvora, Brewmark, Kaveri Foods, Urbanstitch, Zenfit, Skyloom, Greenleaf, Pixelhaus) in `assets/clients/*.svg`. Replace each file with the real client logo, same name.
- **About**: second photo box. Save a photo as `assets/about-photo-2.jpg` (4:5 works best); until then artwork shows.
