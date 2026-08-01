# Portfolio — Ishfaq Ahmad Bhat

Personal site and writing archive for **Ishfaq Ahmad Bhat** — Sr. Application Security Engineer at
R1RCM, security researcher, and creator of [KashSec Academy](https://kashsec.vercel.app/).

Static HTML, CSS and vanilla JS. No framework, no build step for the pages themselves, no trackers.

## Run it locally

```bash
python3 -m http.server 8000   # or: npm run dev
```

Open <http://localhost:8000>.

## Structure

```
.
├── index.html          # one-page portfolio: hero, about, skills, projects, experience, contact
├── blog.html           # post index with tag filters
├── post.html           # single post — reads ?p=<slug>, renders the markdown
├── 404.html
├── styles.css          # the whole design system (dark + light themes)
├── main.js             # theme toggle, nav, scroll reveal, shared post-card markup
├── md.js               # small Markdown renderer (escapes raw HTML by design)
├── posts/
│   ├── index.json      # source of truth: every post's metadata
│   └── <slug>.md       # the post body
├── tools/
│   ├── build-feed.js   # posts/index.json → feed.xml + sitemap.xml
│   └── build-og.js     # renders assets/og.png with Playwright
└── vercel.json
```

## Writing a post

1. Add the body at `posts/my-post-slug.md`. A leading `# Title` is optional — it's stripped on
   render because the metadata below owns the title.
2. Add an entry to `posts/index.json`:

```json
{
  "slug": "my-post-slug",
  "title": "The title",
  "summary": "One or two sentences shown on the cards and in the RSS feed.",
  "date": "2026-08-01",
  "tag": "AppSec",
  "readingTime": 7
}
```

   Set `"draft": true` to keep it out of the site and the feed.

3. Regenerate the feed and sitemap:

```bash
npm run build:feed
```

Slugs must match `^[a-z0-9-]+$` — `post.html` refuses anything else, and only ever fetches a slug
that appears in the index.

### Markdown support

Headings (auto-linked ids), bold/italic/strikethrough, inline code, fenced code blocks, links
(external ones get `target="_blank" rel="noopener"`), images, ordered and unordered lists,
blockquotes, tables, horizontal rules.

Raw HTML in a post is **escaped, not rendered**. That's deliberate — a post file can't inject script
into the page.

## Regenerating the social card

`assets/og.png` is generated, not hand-made, so the numbers on it can't go stale:

```bash
npm install     # playwright, dev-only
npm run build:og
```

Without Chromium available the script warns and leaves the existing PNG alone rather than failing.

## Deploying

Vercel, as a static site — no framework preset, no build command required (run `npm run build`
locally and commit the generated `feed.xml` / `sitemap.xml` / `og.png`).

If the domain changes, update `SITE` in `tools/build-feed.js`, the `og:`/`canonical` URLs in the
three HTML pages, and `robots.txt`.

## Licence

Code MIT. Post content © Ishfaq Ahmad Bhat.

## Previous version

The original terminal-styled single-file portfolio is kept at [`legacy/v1-terminal.html`](./legacy/v1-terminal.html) — it is still the version on `main`.
