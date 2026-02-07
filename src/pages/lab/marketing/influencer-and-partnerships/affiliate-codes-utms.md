---
layout: ../../../../layouts/Layout.astro
title: "Affiliate Codes & UTMs"
description: "Setting up influencer affiliate tracking with unique discount codes and UTM parameters for accurate attribution."
headingTracker: false
---
# Affiliate Codes & UTMs

Affiliate codes and UTM parameters are the backbone of influencer marketing attribution. Without them, you are flying blind — unable to determine which creators drive real revenue versus vanity impressions. A well-structured tracking system lets you confidently scale spend toward top performers and cut underperformers before wasting budget.

## Core Concept

The system works on two layers: vanity discount codes (e.g., SARAH15) give influencers something memorable to share verbally in stories and videos, while UTM-tagged links capture the click-level data needed for precise digital attribution. Together, they close the measurement gap between content that drives direct clicks and content that drives code redemptions days later through brand recall.

## Implementation

1. Generate unique discount codes per influencer using a consistent naming convention — format as CREATORNAME + discount percentage (e.g., JAKE20) and set up each code in your e-commerce platform (Shopify, WooCommerce) with proper expiration dates and usage limits.
2. Build UTM-tagged links for each creator using a standardized taxonomy: `utm_source=influencer`, `utm_medium=affiliate`, `utm_campaign=creatorname`, `utm_content=platform-contenttype` (e.g., `utm_content=instagram-reels`) — use a UTM builder template to keep the team consistent.
3. Shorten tracked links through a branded short domain (e.g., go.yourbrand.com/sarah) using tools like Rebrandly or Bitly Enterprise, which preserves UTM data while giving influencers clean URLs they will actually use.
4. Set up a reporting dashboard (Google Analytics 4, Looker, or a spreadsheet synced via Supermetrics) that aggregates both code redemptions from your e-commerce backend and UTM-attributed sessions/conversions from analytics — this gives you the full picture per creator.
5. Reconcile data monthly by comparing code redemptions against UTM-tracked conversions to identify the "dark social" gap — creators whose codes get used heavily but whose links are rarely clicked are driving brand recall, not direct response, and should be evaluated differently.

## Key Metrics

- **Revenue Per Creator** — total attributed revenue (code redemptions + UTM-tracked conversions) per influencer, which directly determines whether to renew, scale, or cut the partnership
- **Code Redemption Rate** — the number of code uses divided by the influencer's estimated reach, indicating how effectively their content drives purchase intent
- **UTM Click-to-Conversion Rate** — the percentage of UTM-tracked clicks that result in a purchase, revealing landing page and funnel performance for influencer traffic specifically

## Best Practices

- Give influencers both a code AND a link, but let them choose which to emphasize — video-first creators on TikTok and YouTube prefer codes (audiences cannot click mid-video), while blog and Twitter creators prefer links
- Set affiliate commission tiers that increase with performance (e.g., 10% base, 15% after 50 sales, 20% after 200 sales) to incentivize creators to keep promoting beyond the initial post
- Implement a 30-day attribution window for code redemptions to capture delayed purchases — most influencer-driven purchases happen 3-14 days after content exposure, not immediately

## Common Pitfalls

- Using identical UTM parameters for multiple creators or campaigns, which makes your analytics data useless — every creator must have a unique `utm_campaign` value at minimum
- Forgetting to exclude influencer discount codes from site-wide promotions and coupon aggregator sites — if a code leaks to RetailMeNot, your attribution data becomes meaningless and you will overpay commissions
- Not communicating tracking requirements clearly in creator briefs — if the influencer uses a naked link instead of your UTM link, you lose all click-level attribution for that post
