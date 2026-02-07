---
layout: ../../../../layouts/Layout.astro
title: "Broad Targeting + Algorithmic Bidding"
description: "Leveraging broad audience targeting with algorithm-driven bid strategies to let platform ML find your best customers."
headingTracker: false
---
# Broad Targeting + Algorithmic Bidding

Broad targeting combined with algorithmic bidding flips the traditional paid media model on its head. Instead of manually narrowing audiences with layered interest and demographic filters, you give the platform's machine learning algorithm a wide audience and a clear conversion signal, then let it figure out who to show your ads to. When done correctly, this approach often outperforms hyper-targeted campaigns because the algorithm has access to thousands of behavioral signals you could never manually replicate.

## Core Concept

Platform algorithms (Meta's Advantage+, Google's Smart Bidding, TikTok's auto-targeting) process billions of data points about user behavior, purchase history, and content engagement that aren't available in the targeting interface. When you restrict your audience too tightly, you limit the algorithm's ability to find high-value users outside your assumptions. Broad targeting with algorithmic bidding essentially says: "Here's my conversion event and my target cost — find the people most likely to convert at that cost." The algorithm then optimizes bids in real-time, bidding higher for users with strong intent signals and lower (or not at all) for low-probability users.

## Implementation

1. **Ensure your conversion tracking is bulletproof** — The algorithm is only as good as the signal you feed it. Verify your pixel, CAPI (Conversions API), or SDK is firing correctly on your true conversion event. If you're optimizing for purchases, make sure revenue values pass through accurately. Bad data in means bad optimization out.
2. **Start with a proven creative and landing page** — Don't test broad targeting with untested creative. Use your best-performing ads so the algorithm gets clean signal on what works. The variable you're testing is the targeting, not the creative.
3. **Set up a broad campaign with minimal targeting restrictions** — On Meta, this means selecting your country and age range only (or using Advantage+ Shopping campaigns). On Google, use Performance Max or broad match keywords with Smart Bidding. On TikTok, select broad targeting within your ad group. Remove interest and behavior layers.
4. **Choose the right algorithmic bid strategy** — For ecommerce, use target ROAS once you have 50+ conversions per week. For lead gen, use target CPA. If you're below those volume thresholds, start with "maximize conversions" to build data, then switch to target-based bidding once the algorithm has learned.
5. **Run a structured test against your best narrow campaign** — Allocate 20-30% of budget to the broad campaign alongside your existing targeted campaigns. Compare CPA, ROAS, and conversion volume over 2-3 weeks (enough time for the algorithm to exit learning phase). Scale the winner.

## Key Metrics

- **Cost Per Acquisition (CPA) During vs. After Learning Phase** — Track how CPA changes as the algorithm accumulates data; initial CPA will be high but should stabilize and often beat manual targeting within 1-2 weeks
- **Conversion Volume at Target Efficiency** — Broad targeting should deliver more total conversions at similar or better CPA; if efficiency is the same but volume doubles, the strategy is working
- **Audience Overlap Rate** — Check how much the algorithm's actual delivery overlaps with your manually targeted audiences using platform audience insights; low overlap means it found valuable users you were missing

## Best Practices

- Feed the algorithm your highest-value conversion event — optimizing for purchases or qualified leads beats optimizing for add-to-carts or page views, even if the volume is lower
- Give the algorithm enough budget to exit learning phase; Meta recommends 50 conversions per week per ad set, Google needs 30+ conversions per month per campaign
- Use broad targeting for prospecting campaigns but keep tight remarketing campaigns running separately — the algorithm is best at finding new customers, not closing warm audiences

## Common Pitfalls

- Panicking during the learning phase — CPA will spike in the first 3-7 days as the algorithm explores; cutting budget or making changes during this period resets learning and guarantees poor results
- Using broad targeting with a weak conversion signal — If you're optimizing for a micro-conversion like "time on site" instead of actual purchases, the algorithm will find people who browse but never buy
- Removing all structure — Some manual segmentation still helps; separating prospecting from remarketing and separating creative themes into distinct ad sets gives the algorithm useful structure while keeping audiences broad
