---
layout: ../../../../layouts/Layout.astro
title: "Speed & Core Web Vitals"
description: "Make pages load and respond faster to reduce bounces and meet Google's Core Web Vitals."
---
# Speed & Core Web Vitals

Page speed affects both conversion and search ranking. Google's Core Web Vitals measure what users experience: how fast the main content appears (LCP), how quickly the page responds to input (INP), and how much the layout jumps while loading (CLS). Google uses them as a ranking signal.

## How it works

Speed affects every other tactic on the page. Headlines, reviews, and CTAs do nothing until the page loads. Slow pages lose visitors before they see anything. Core Web Vitals go beyond raw load time to measure what the user actually sees and feels.

## How to do it

1. Check current scores in PageSpeed Insights and the Core Web Vitals report in Google Search Console. Use field data (real users) over lab data where available.
2. Improve LCP (target: under 2.5 seconds):
   - Compress and resize hero images. Use WebP or AVIF.
   - Preload the main hero image or font.
   - Lazy-load images below the fold.
   - Serve static files from a CDN.
   - Remove render-blocking CSS and JavaScript.
3. Improve INP (target: under 200 milliseconds):
   - Break long JavaScript tasks into smaller pieces.
   - Defer scripts that are not needed right away.
   - Remove or delay third-party scripts such as chat widgets and extra tags.
4. Improve CLS (target: under 0.1):
   - Set width and height on all images and videos.
   - Reserve space for ads and late-loading content.
   - Use `font-display: swap` and preload key fonts.
5. Add real-user monitoring (the web-vitals library or a RUM service). Set alerts and performance budgets in your deploy process.

## What to measure

- **Largest Contentful Paint (LCP)**: Time until the largest image or text block renders. Good is under 2.5 seconds.
- **Interaction to Next Paint (INP)**: Delay between a click, tap, or keypress and the next screen update. Good is under 200 milliseconds.
- **Cumulative Layout Shift (CLS)**: Total unexpected layout movement while the page loads. Good is under 0.1.

## Best practices

- Fix the metric that fails on the most URLs first, starting with high-traffic pages.
- Serve static assets from a CDN.
- Review third-party scripts every quarter. Remove unused ones and defer the rest.

## Common pitfalls

- Chasing Lighthouse lab scores without checking field data. Lab tests run on fast hardware. Google ranks on real-user data.
- Adding new tools such as chat or personalization without measuring their cost in speed.
- Treating speed as a one-time project. Without monitoring and budgets, sites slow down over time.
