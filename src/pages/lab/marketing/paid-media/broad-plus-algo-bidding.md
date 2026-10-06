---
layout: ../../../../layouts/Layout.astro
title: "Broad Targeting + Algorithmic Bidding"
description: "Give the ad platform a wide audience and a clear conversion goal, and let its bidding find the buyers."
---
# Broad Targeting + Algorithmic Bidding

Broad targeting means you set few audience limits and let the platform's bidding system decide who sees your ads. You supply a clear conversion signal and a cost goal. The platform uses signals you cannot target by hand to find likely buyers.

## How it works

Ad platforms see far more about user behavior than their targeting menus expose. Tight interest and demographic layers stop the system from reaching good buyers outside your assumptions. With broad targeting, you tell the platform: "This is the conversion I want and what I will pay for it." The bidding system then bids higher for people likely to convert and lower, or not at all, for everyone else. Examples include Google Smart Bidding with broad match, Meta Advantage+ audiences and Advantage+ sales campaigns, and TikTok's automatic targeting.

## How to do it

1. Check your conversion tracking. Confirm the pixel, server-side API, or SDK fires once per real conversion and passes revenue values.
2. Use your best existing ads and landing page. Only the targeting should change in this test.
3. Build a campaign with minimal limits. On Meta, set country and age only, or use an Advantage+ sales campaign. On Google, use broad match keywords or Performance Max with Smart Bidding. On TikTok, choose automatic or broad targeting.
4. Pick a bid strategy. Use target CPA for lead gen and target ROAS for ecommerce once you have steady conversion volume. Start with "maximize conversions" or "maximize conversion value" if volume is low, then add a target later.
5. Test against your best narrow campaign. Give the broad campaign a share of budget, run it long enough to exit the learning phase, and compare CPA, ROAS, and volume. Scale the winner.

## What to measure

- **CPA over time**: compare CPA during the learning phase with CPA after it ends.
- **Conversion volume at target efficiency**: count conversions delivered at or below your target CPA or above your target ROAS.
- **New vs. returning customers**: check the share of conversions from people who had not bought before.

## Best practices

- Optimize for your most valuable conversion event, such as a purchase or qualified lead, not a page view or add-to-cart.
- Budget enough to exit the learning phase. Each platform publishes its own conversion-volume guidance; check it before launch.
- Keep a separate remarketing or existing-customer setup so prospecting results are not inflated by people who would buy anyway.

## Common pitfalls

- Changing budgets or settings during the learning phase. Big edits restart learning.
- Optimizing for a weak signal. If the goal is time on site, the system will find people who browse and do not buy.
- Removing all structure. Separating prospecting from remarketing still gives the system useful boundaries.
