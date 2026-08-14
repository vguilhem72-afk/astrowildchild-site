# Astro Wild Child — site (astrowildchild.com)

Marketing + journal site for **Mare Punzalan** (Toronto-based astrologer). Built with Astro 4, Tailwind, MDX, and Decap CMS so Mare can edit posts through a web UI without touching code.

Sibling brand to [Astrodesk](https://astrodesk.astrowildchild.com) — the professional astrology tool Mare uses in-session — and the design tokens are shared so the family reads as one.

---

## Stack

- **Astro 4** — static site, zero JS by default, MDX for rich posts
- **Tailwind 3** — utility layer, but color/type tokens are the source of truth (see `tailwind.config.mjs` + `src/styles/global.css`)
- **@astrojs/mdx** — Markdown + component embedding in posts
- **@astrojs/rss** — auto RSS feed at `/rss.xml`
- **@astrojs/sitemap** — auto sitemap at `/sitemap-index.xml`
- **Decap CMS** — served statically at `/admin/` (GitHub backend, editorial workflow enabled)
- Node LTS + npm

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # → dist/
npm run preview   # serve the production build locally
```

## Directory layout

```
src/
  content/
    config.ts             # Zod schemas for posts + pages
    posts/                # blog posts (Decap CMS writes here)
    pages/                # long-form standalone pages
  layouts/
    Base.astro            # <head>, <Header>, <Footer>
  components/
    Header.astro          # sticky nav
    Footer.astro          # footer + socials
    PostCard.astro        # blog card
    Newsletter.astro      # MailerLite opt-in (form action placeholder)
    CalendlyEmbed.astro   # reusable booking iframe
  pages/
    index.astro           # home
    about.astro
    work-with-me.astro
    astrodesk.astro       # bridge page → astrodesk.astrowildchild.com
    contact.astro
    privacy.astro
    terms.astro
    rss.xml.ts            # RSS feed
    blog/
      index.astro         # first 12 posts + category filters
      [slug].astro        # single post template
      page/[page].astro   # pagination (12 per page)
      category/[category].astro
  styles/
    global.css            # design tokens + base styles + .prose-awc
public/
  admin/                  # Decap CMS
    index.html
    config.yml            # ← edit `repo:` before enabling CMS
  images/uploads/         # Decap writes uploads here
  favicon.svg
  robots.txt
astro.config.mjs
tailwind.config.mjs
```

## Design tokens (never derived at feel)

Match Astrodesk exactly. Defined in `tailwind.config.mjs` (Tailwind colors) and mirrored as CSS vars in `src/styles/global.css`.

```
--night        #0F0818
--night-deep   #07060A
--wine         #2A0D1C
--wine-deep    #1A0A12
--wine-glow    #320F22
--ink          #F5F0EA
--ink-soft     #E8D5A3
--ink-faint    #8B7A6E
--ink-mute     #5A4A54
--gold         #C9A96E
--gold-bright  #E8D5A3
--rose         #C47E8A
--rose-deep    #8B5A78
```

Fonts: **Cormorant Garamond** (serif, headings/quotes) + **Jost** (sans, body/UI). Loaded via Google Fonts with preconnect + `display=swap` in `Base.astro`.

## Content pipeline (WordPress → Astro)

A parallel agent is scraping the WordPress source into:

```
/Users/guilhemvincent/Projects/astrowildchild-migration/content/
```

An import agent will convert those files into `src/content/posts/*.md` matching the Zod schema in `src/content/config.ts`:

```yaml
---
title: string
date: ISO date
author: string           # default "Mare Punzalan"
featured_image: string   # /images/uploads/... or full URL
categories: [string]
tags: [string]
excerpt: string
draft: boolean
---
```

Images should land in `public/images/uploads/` so they resolve at `/images/uploads/...`. Once the import completes:

```bash
npm run build
```

should render all 183 posts, populate the RSS feed, sitemap, and per-category archives.

## Decap CMS

Served at `https://astrowildchild.com/admin/`. Before enabling:

1. Create the GitHub repo and push this project to `main`.
2. Edit `public/admin/config.yml` → replace `OWNER/astrowildchild-site` with the real GitHub path.
3. Set up Netlify Identity **or** a GitHub OAuth proxy (e.g. Netlify's, or `decap-server` for local editing) so Mare can log in.
4. Editorial workflow is enabled — drafts land as PRs, publishing merges to `main`.

For local CMS testing without OAuth:

```bash
npx decap-server        # runs a proxy on :8081
```

Then open `http://localhost:4321/admin/` and it will talk to the local git repo.

## Integrations to wire up (post-launch)

- **MailerLite** — swap the two `PLACEHOLDER` values in `src/components/Newsletter.astro` for the real account/form IDs.
- **Calendly** — set `CALENDLY_URL` in `.env` or edit the default in `src/components/CalendlyEmbed.astro`.
- **Contact form** — currently wired for Netlify Forms (`data-netlify="true"`). If not hosting on Netlify, swap to Formspree or a custom endpoint.
- **Social handles** — update Instagram/TikTok links in `src/components/Footer.astro` (currently `astrowildchild` placeholder).

## Deployment

Static site — build output is `dist/`. Deploys anywhere static (Cloudflare Pages, Netlify, Vercel). Guilhem handles Cloudflare setup + DNS + GitHub repo creation manually.

## Not done in this bootstrap

- Content import (183 posts) — separate agent
- GitHub repo + OAuth for Decap — manual
- MailerLite / Calendly / social handles — need real values
- OG image at `/images/og-default.jpg` — TBD
- Mare's portrait at `/images/mare-portrait.jpg` — TBD (home hero falls back to wine block)
