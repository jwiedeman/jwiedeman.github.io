---
layout: ../../../../layouts/Layout.astro
title: "Programmatic SEO"
description: "Generate many useful pages from structured data and a template, one page per specific search."
---
# Programmatic SEO

Programmatic SEO means generating many pages from a dataset and a template instead of writing each page by hand. Zapier's integration pages, Nomad List's city pages, and Tripadvisor's location pages are well-known examples. Each page targets one specific, low-volume search, and together they reach a large number of searches.

## How it works

Specific searches such as "Slack and Trello integration" or "cost of living in Lisbon" each have little volume, but there are a great many of them. Combining a template with structured data lets you build a page for each. Each page must still be useful on its own. It needs real data, such as prices, reviews, steps, or calculations, not just a swapped keyword. Pages that differ only by a name are treated as low-value doorway pages.

## How to do it

1. Find a dataset you can combine into many unique pages: tool + tool, service + city, product vs. product, or template + industry.
2. Check search demand for a sample of about 50 combinations before building anything.
3. Design a template where every section pulls in data specific to that page, such as setup steps, prices, stats, or reviews.
4. Store the data in a database or CMS and generate pages from it, at build time for static sites or with server rendering and caching for dynamic sites.
5. Generate a unique title tag, meta description, H1, and URL for every page.
6. Launch a pilot batch of 100-500 pages first.
7. Add the pages to an XML sitemap and link related pages to each other, for example cities in the same state.
8. Create hub pages that group related pages, such as "All cities in California," and link them from navigation.
9. Review a random sample of pages by hand. If any look thin, add data or sections to the template before scaling.
10. Track indexing and traffic in Search Console, then expand to more combinations once the pilot works.

## What to measure

- **Indexation rate**: indexed pages divided by submitted pages, from the Search Console page indexing report.
- **Traffic per page**: average monthly organic sessions per generated page, from analytics.
- **Quality score**: monthly hand review of 20 random pages, each rated 1-5 for usefulness and uniqueness.

## Best practices

- Add at least one section per page that is not purely templated, such as reviews, written summaries for top pages, or calculated insights.
- Use hub pages and internal links so crawlers can reach every page.
- Confirm the pilot pages get indexed, rank, and convert before generating thousands more.

## Common pitfalls

- Pages that differ only by a keyword. Search engines often decline to index them.
- Generating more pages than search engines will crawl. Large sets on a new or small site may be only partly crawled; use sitemaps and internal links to guide crawlers.
- Building for combinations nobody searches for. Validate demand first.
