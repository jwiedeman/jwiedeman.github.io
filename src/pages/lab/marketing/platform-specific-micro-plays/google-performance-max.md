---
layout: ../../../../layouts/Layout.astro
title: "Google Performance Max"
description: "Google's Performance Max cross-channel campaign type for automated, full-funnel advertising."
headingTracker: false
---
# Google Performance Max

Performance Max (PMax) is Google's AI-driven campaign type that runs ads across all of Google's inventory — Search, Shopping, Display, YouTube, Discover, Gmail, and Maps — from a single campaign. Advertisers provide creative assets (text, images, videos), audience signals, and conversion goals, and Google's algorithm decides where, when, and to whom to show the ads. For e-commerce brands, PMax has largely replaced standalone Shopping campaigns, and for lead-gen businesses, it offers reach across channels that would previously require 5-6 separate campaigns.

## Core Concept

PMax represents Google's bet that its algorithm can outperform human media buyers in cross-channel allocation. Instead of setting up separate Search, Shopping, Display, and YouTube campaigns with individual budgets and targeting, PMax treats all channels as a single optimization surface. The algorithm moves budget in real time to whichever channel and audience segment is generating the best results against your conversion goal. The advertiser's role shifts from channel-level media buying to providing the algorithm with high-quality inputs: strong creative assets, accurate conversion tracking, and meaningful audience signals that help the algorithm find the right people faster.

## Implementation

1. Ensure your conversion tracking is robust and accurate — PMax optimizes against your conversion events, so garbage tracking in means garbage optimization out; verify enhanced conversions are enabled and server-side tracking is in place
2. Create an asset group with comprehensive creative: 5+ headlines, 5+ long headlines, 5+ descriptions, 15+ images (landscape, square, portrait), and at least 1 video (ideally 3-5 in different lengths); if you do not provide video, Google will auto-generate one, and it will be poor quality
3. Set meaningful audience signals — these are not hard targeting constraints but hints to the algorithm about who to prioritize: add your customer lists, website visitor remarketing lists, and custom intent segments as signals
4. For e-commerce: connect your Merchant Center product feed and create product-specific asset groups with creative tailored to product categories rather than running one generic asset group
5. Monitor the Insights tab weekly for search term insights, audience insights, and asset performance ratings — PMax is a black box, but the Insights tab provides some visibility into where your budget is going

## Key Metrics

- **Conversion value / cost (ROAS)** — the primary efficiency metric; compare PMax ROAS against your blended account ROAS and against individual channel benchmarks
- **New customer acquisition rate** — track whether PMax is finding new customers or just retargeting existing ones; use the new customer acquisition goal setting if available
- **Search term cannibalisation** — monitor whether PMax is absorbing branded search traffic that would have converted organically; check Search terms insights for branded queries

## Best Practices

- Always provide your own high-quality video assets; Google's auto-generated videos are low quality and hurt your brand, and you lose a critical creative lever
- Use multiple asset groups organized by product category or service line, each with tailored creative and audience signals, rather than one catch-all asset group
- Run PMax alongside a dedicated branded Search campaign (exact match on your brand terms) to prevent PMax from claiming credit for branded traffic

## Common Pitfalls

- Launching PMax with minimal creative assets, which gives the algorithm too little to work with and produces generic, low-performing ad combinations
- Not excluding branded search terms (through negative keyword lists at the account level), allowing PMax to spend budget on searches that would have found you organically
- Treating PMax as a set-and-forget campaign — while it is automated, it still requires weekly creative refreshes, audience signal updates, and performance monitoring
