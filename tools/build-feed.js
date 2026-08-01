#!/usr/bin/env node
/*
 * Generates feed.xml and sitemap.xml from posts/index.json.
 *
 * The post index is the single source of truth for what's published; keeping
 * the feed and the sitemap hand-written meant they went stale the moment a
 * post was added. Run `npm run build` after editing posts/index.json.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://ishfaqbhat.vercel.app';
const AUTHOR = 'Ishfaq Ahmad Bhat';
const EMAIL = 'bhatishfaq966@gmail.com';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const posts = JSON.parse(readFileSync(join(root, 'posts/index.json'), 'utf8'))
  .filter((p) => !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

/* ---- feed.xml ---- */
const rfc822 = (iso) => new Date(iso + 'T09:00:00Z').toUTCString();
const built = posts.length ? rfc822(posts[0].date) : new Date().toUTCString();

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(AUTHOR)} — Writing</title>
  <link>${SITE}/blog.html</link>
  <description>Security writeups, research notes and thoughts on teaching security.</description>
  <language>en</language>
  <lastBuildDate>${built}</lastBuildDate>
  <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
${posts.map((p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${SITE}/post.html?p=${encodeURIComponent(p.slug)}</link>
    <guid isPermaLink="false">${SITE}/post/${esc(p.slug)}</guid>
    <pubDate>${rfc822(p.date)}</pubDate>
    <author>${esc(EMAIL)} (${esc(AUTHOR)})</author>
${p.tag ? `    <category>${esc(p.tag)}</category>\n` : ''}    <description>${esc(p.summary)}</description>
  </item>`).join('\n')}
</channel>
</rss>
`;
writeFileSync(join(root, 'feed.xml'), feed);

/* ---- sitemap.xml ---- */
const pages = [
  { loc: `${SITE}/`, pri: '1.0' },
  { loc: `${SITE}/blog.html`, pri: '0.8' },
  ...posts.map((p) => ({
    loc: `${SITE}/post.html?p=${encodeURIComponent(p.slug)}`,
    pri: '0.6',
    lastmod: p.date,
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((u) => `  <url>
    <loc>${esc(u.loc)}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <priority>${u.pri}</priority>
  </url>`).join('\n')}
</urlset>
`;
writeFileSync(join(root, 'sitemap.xml'), sitemap);

console.log(`feed.xml + sitemap.xml written (${posts.length} posts)`);
