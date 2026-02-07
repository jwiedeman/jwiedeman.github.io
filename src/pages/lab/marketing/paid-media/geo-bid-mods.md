---
layout: ../../../../layouts/Layout.astro
title: "Geographic Bid Modifiers"
description: "Adjusting bids by geographic location to allocate more spend where performance is strongest."
headingTracker: false
---
# Geographic Bid Modifiers

Geographic bid modifiers let you increase or decrease your ad bids based on the physical location of the user — by country, state, city, zip code, or radius around a point. This is one of the most underused levers in paid media because most advertisers set nationwide campaigns and let the algorithm distribute spend evenly, even when CPA and conversion rates vary dramatically by region. A campaign that's profitably acquiring customers in Texas at $30 CPA might be burning money in New York at $85 CPA — geo-bid mods fix that imbalance.

## Core Concept

Customer acquisition costs vary by geography due to differences in competition density, cost of living, local demand, and audience quality. A $100 CPM in Manhattan reaches people with higher purchase intent for luxury goods but higher costs for everything else. A $25 CPM in a mid-size Midwest city might convert at the same rate for a SaaS product at a quarter of the cost. Geo-bid modifiers let you align your spending with this reality — bidding more aggressively in high-performing regions and pulling back in underperforming ones. This is especially powerful for businesses with varying margins, local inventory, or region-specific demand.

## Implementation

1. **Pull geographic performance data from your existing campaigns** — Export location reports from Google Ads (Campaign > Locations), Meta (Breakdown > Region), or your analytics platform. Look at CPA, ROAS, conversion rate, and conversion volume by state, city, or DMA. You need at least 30 days of data with statistically meaningful conversion volume per geography.
2. **Identify your top and bottom performing regions** — Rank geographies by your primary KPI (CPA or ROAS). You'll typically find that 20-30% of regions drive 60-70% of your profitable conversions, while 10-20% of regions are actively unprofitable. Mark regions as: high-value (bid up), average (no change), low-value (bid down), and exclusion (remove entirely).
3. **Apply bid modifiers in your platform** — In Google Ads, set location bid adjustments from -90% to +900% at the campaign level. On Meta, create separate ad sets for different geo tiers (Meta doesn't support bid modifiers directly, so you segment geographically instead). Start conservative: +20% for top regions, -30% for bottom regions, and iterate from there.
4. **Create geo-specific creative where warranted** — For your top-performing regions, test localized creative that references the city or region. "Portland's #1 rated..." or "Free next-day delivery in the Bay Area" adds relevance that further improves performance in already-strong markets.
5. **Review and adjust monthly** — Geographic performance shifts with seasons, local events, and competitive dynamics. Set a monthly cadence to review geo reports, update modifiers, and test new region tiers. Automate alerts for regions where CPA exceeds your threshold so you catch underperformers quickly.

## Key Metrics

- **CPA by Geography** — The core metric driving your modifier decisions; segment down to the most granular level where you have statistical significance (zip code for local businesses, state/DMA for national)
- **Geo-Modified ROAS vs. Flat ROAS** — Compare your blended ROAS after applying geo modifiers against your pre-optimization baseline to quantify the impact of geographic optimization
- **Spend Distribution vs. Revenue Distribution** — If 40% of your spend goes to a region that produces 15% of your revenue, you've found your biggest optimization opportunity

## Best Practices

- Start with state or DMA-level modifiers before going granular to zip codes — you need enough conversion volume per geography to make statistically valid decisions
- Combine geo-bid mods with dayparting for compound optimization — a region might perform well during business hours but poorly at night, or vice versa
- For ecommerce, factor in shipping costs and delivery times by region; a region with slightly higher CPA but faster delivery might have better LTV

## Common Pitfalls

- Making decisions on insufficient data — A region with 3 conversions last month doesn't have enough volume to justify a bid modifier; set a minimum conversion threshold (20-30) before making adjustments
- Excluding regions entirely when you should just bid down — Removing a geography means you miss the occasional high-value conversion; a -50% to -70% modifier is usually better than a full exclusion unless the region truly has zero viable customers
- Setting modifiers once and never updating — Geography performance is dynamic; the region that was your top performer six months ago may have attracted competitors or undergone market changes
