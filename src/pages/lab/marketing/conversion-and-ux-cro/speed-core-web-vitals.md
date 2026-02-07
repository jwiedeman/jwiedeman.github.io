---
layout: ../../../../layouts/Layout.astro
title: "Speed & Core Web Vitals"
description: "Optimizing page speed and Core Web Vitals to reduce bounce rates and improve conversion performance."
headingTracker: false
---
# Speed & Core Web Vitals

Page speed and Core Web Vitals (CWV) directly impact both conversion rates and search rankings. Google's own data shows that as page load time increases from 1s to 3s, bounce probability increases 32%; from 1s to 5s, it increases 90%. Core Web Vitals — Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS) — are Google's specific metrics for measuring user-perceived performance, and they are a confirmed ranking factor. Faster pages rank higher and convert better.

## Core Concept

Speed optimization is a conversion rate multiplier that affects every other tactic on your site. Your headline, copy, social proof, and CTAs are irrelevant if the page has not loaded yet. Every 100ms of load time improvement translates to measurable conversion gains — Amazon famously found that every 100ms of latency cost them 1% in sales. Core Web Vitals go beyond raw load time to measure what users actually experience: how fast the main content appears (LCP), how responsive the page is to interaction (INP), and how stable the layout is during loading (CLS).

## Implementation

1. Audit your current Core Web Vitals using Google PageSpeed Insights, Chrome DevTools Lighthouse, and the CrUX (Chrome User Experience Report) data in Google Search Console — CrUX provides real-user data (field data) which is more accurate than lab tests, and Search Console shows which URLs fail CWV thresholds.
2. Optimize Largest Contentful Paint (LCP, target under 2.5 seconds) by addressing the most common causes: compress and properly size hero images (use WebP/AVIF format), implement lazy loading for below-fold images, preload the LCP element (hero image or heading font), reduce server response time with CDN and caching, and eliminate render-blocking CSS/JS.
3. Optimize Interaction to Next Paint (INP, target under 200ms) by reducing JavaScript execution time — break up long tasks into smaller async chunks, defer non-critical JavaScript, minimize third-party script impact (tag managers, analytics, chat widgets), and use web workers for heavy computations.
4. Fix Cumulative Layout Shift (CLS, target under 0.1) by setting explicit dimensions on all images and videos (width/height attributes), reserving space for ad slots and dynamic content before they load, preloading fonts with `font-display: swap`, and avoiding dynamically injected content that pushes existing elements around.
5. Implement ongoing monitoring using real-user monitoring (RUM) tools like SpeedCurve, Calibre, or web-vitals.js library — set up alerts for CWV regressions and make performance a part of your deployment process with performance budgets that block deploys if pages exceed thresholds.

## Key Metrics

- **Largest Contentful Paint (LCP)** — measures loading performance; the time until the largest content element (image or text block) is rendered. Target: under 2.5 seconds. This is the metric most directly correlated with user-perceived load speed.
- **Interaction to Next Paint (INP)** — measures responsiveness; the time between a user interaction (click, tap, keypress) and the next visual frame update. Target: under 200ms. Poor INP makes a site feel sluggish and unresponsive.
- **Cumulative Layout Shift (CLS)** — measures visual stability; the total amount of unexpected layout movement during page load. Target: under 0.1. High CLS causes users to accidentally click wrong elements and creates a frustrating, janky experience.

## Best Practices

- Prioritize fixes based on real-user impact — address the CWV metric that fails for the most URLs first, and focus on high-traffic pages (homepage, top landing pages, product pages) before low-traffic ones
- Implement a CDN (Cloudflare, Fastly, AWS CloudFront) for all static assets and consider edge computing for dynamic content — CDN alone can reduce LCP by 30-50% for geographically distributed audiences
- Audit third-party scripts quarterly — analytics tags, chat widgets, A/B testing tools, and social embeds often account for 50-70% of total JavaScript and are the primary cause of INP failures; remove unused scripts and defer loading of non-critical ones

## Common Pitfalls

- Optimizing lab scores (Lighthouse in DevTools) without checking field data (CrUX) — lab tests run on a fast machine with a good connection and do not reflect what real users on real devices actually experience; Google uses field data for ranking decisions
- Adding performance-heavy tools (live chat, personalization engines, multiple analytics scripts) after optimizing without measuring their impact — each new third-party script can undo weeks of optimization work
- Treating speed optimization as a one-time project rather than an ongoing discipline — every new feature, image, script, or design change can regress performance; without automated monitoring and performance budgets, sites get slower over time
