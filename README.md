# Jimmy's Coffee — Website

A static website for Jimmy's Coffee (Toronto), built from the brand's own photography,
video, screenshots, and copy.

## Structure
```
index.html      — the whole site (markup, styles, and behavior)
images/         — 29 real photos (locations, menu, products)
videos/         — 2 short clips (hero background, timeline section)
```
No build step, no dependencies, no server required — it's plain HTML/CSS/JS that opens
and works by itself.

## What's included
Home, brand story, "This Is Jimmy," a timeline of the 8 store openings, a full locations
directory with a stylized map and a "find my nearest" button (real geolocation + distance
math), a swipeable seasonal drink menu, a coffee/store showcase with real prices, gift
cards (linked to the real Jimmy's Coffee Square page), catering & events with the real
catering FAQ, a searchable FAQ, a "from the feed" photo grid, an email signup, contact,
and a front-end reservation request flow. Every location photo opens in a full-screen,
swipeable lightbox.

## What this is NOT
This is a front-end only. There's no real database, login system, payment processing,
or admin panel — the reservation and signup forms work (they genuinely open the visitor's
email client, pre-filled), but nothing is saved to a server. Wiring up real email capture
(Mailchimp/Klaviyo) or a real booking system is a separate, future piece of work.

## Hosting on GitHub Pages
1. Create a new GitHub repository (e.g. `jimmys-coffee`), keep it Public.
2. **Add file → Upload files** — drag in `index.html`, the `images` folder, and the
   `videos` folder. Commit.
3. **Settings → Pages** → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
4. Save. Live in about a minute at `https://<your-username>.github.io/jimmys-coffee/`.

## Hosting on Vercel
Drop the whole folder into a new Vercel project (no framework/build settings needed —
it's a static site) and deploy. Vercel will serve `index.html` and the `images`/`videos`
folders as-is.

## QA notes
Before this was handed off, the file was checked for: balanced HTML tags, valid CSS
(parsed with a real CSS parser, zero errors), valid JavaScript (syntax-checked), every
interactive feature exercised in a headless browser with zero runtime errors (lightbox,
map, FAQ search, reservation flow, carousel, forms), every image and video reference
confirmed to resolve to a real file, no duplicate element IDs, and no leftover
placeholder text or debug code.
