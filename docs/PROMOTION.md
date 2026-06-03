# Getting found: SEO + distribution playbook

A reusable checklist for this lab and the rest of the series
(`llm-explain-lab`, `agent-explain-lab`, `llm-improvement-lab`,
`multi-agent-explain-lab`).

## Why the labs are not showing up on Google yet

It is not one thing. It is five, in order of impact:

1. **Google has not been told they exist.** New GitHub Pages sites with no
   inbound links are nearly invisible. Google finds pages by following links;
   nobody links to a brand-new project page, so it never gets crawled. This is
   the biggest and most fixable cause.
2. **They were never submitted to Search Console.** Without submitting the URL
   and the sitemap, you are waiting for Google to stumble onto the site on its
   own. That can take weeks, or never.
3. **They are single-page apps with hash routing.** Everything after `#` in a
   URL (`#/attention`, `#/tools`) is ignored by search engines. So only the
   root page of each lab is a real, indexable URL. The per-chapter content is
   not separately discoverable.
4. **Thin page `<head>`.** If `index.html` only has a `<title>` and no
   description or Open Graph tags, Google has almost nothing to index or show.
   (Fixed in this lab; see `index.html`.)
5. **Zero backlinks = zero authority.** Ranking is mostly about who links to
   you. A new page with no links ranks below everything, even for its own name.

And one practical point: nobody searches `"multi-agent-explain-lab"`. They
search `"how do multi-agent systems work"`. Titles and descriptions must target
the phrases people actually type, not the repo name.

## What is already applied in this repo

- `index.html`: real `<title>`, meta description, keywords, canonical URL,
  Open Graph + Twitter cards (so shared links show the cover image), and
  JSON-LD `LearningResource` structured data.
- `public/og-cover.png`: 1200x630 social preview image.
- `public/sitemap.xml` and `public/robots.txt`.
- Repo description, homepage link, and 15 topics for GitHub search.
- A "Part of a small series" section in the README that cross-links the labs.

Replicate every one of these in the other three labs.

## The playbook (do these in order)

### 1. Google Search Console (highest leverage, do first)
- Go to https://search.google.com/search-console and add each lab as a
  **URL-prefix** property, e.g. `https://lionellau.github.io/multi-agent-explain-lab/`.
- Verify with the **HTML meta tag** method. Google gives you a tag like
  `<meta name="google-site-verification" content="XXedge..." />`. Paste it into
  `index.html` `<head>` (there is a placeholder comment there already), commit,
  let Pages redeploy, then click Verify.
- Submit `sitemap.xml` under **Sitemaps**.
- Use **URL Inspection -> Request Indexing** on each lab's homepage.
- Repeat on **Bing Webmaster Tools** (covers Bing + DuckDuckGo). Bing also lets
  you import the property straight from Google Search Console.

### 2. Build a series hub
- Create a profile/landing page that links to all four labs. Options:
  - A `lionellau.github.io` user site (its own repo named `lionellau.github.io`).
  - Your GitHub **profile README** (`github.com/lionellau/lionellau`), pinned.
- This gives Google one authoritative page that links to every lab, which is
  exactly the crawl entry point that is missing today.
- Pin all four lab repos on your GitHub profile.

### 3. Get real backlinks (this is what moves rankings)
- **Show HN** on Hacker News: one post per lab, titled by what it teaches.
- **Reddit**: r/learnmachinelearning, r/MachineLearning (Saturday self-promo
  thread), r/LocalLLaMA, r/LangChain.
- **dev.to / Medium**: a short post per lab that embeds the live link. These
  index within days and pass a link.
- **LinkedIn + X**: post the OG card; it renders because the meta tags exist.
- **awesome lists**: open a PR adding each lab to relevant `awesome-llm`,
  `awesome-ai-agents`, `awesome-langgraph` style GitHub lists.
- **Tool/community channels**: the LangChain, CrewAI, and MCP Discords and
  forums have "show what you built" channels.

### 4. Cross-link the series everywhere
- Every lab README links to the other three (done here).
- Every lab's in-app footer or an "other labs" link points to the hub.
- Internal links spread crawl coverage and keep people moving between labs.

### 5. Optional, bigger lift: make chapters their own URLs
- The hash router means only the homepage is indexable. To get each chapter
  ranking on its own (e.g. an "attention explained" page), prerender each route
  to a static HTML file with its own `<title>` and description (tools like
  `vite-react-ssg` or a small prerender step). Worth it once a lab gets traffic.

## Reality check on timing

Even after submitting to Search Console, a new site takes roughly 1 to 4 weeks
to index and longer to rank. Submit, share for backlinks, then be patient and
re-share when you add content. Authority compounds across the series: links to
one lab help the hub, which helps the others.
