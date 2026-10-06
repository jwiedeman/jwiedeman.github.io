---
layout: ../../../../layouts/Layout.astro
title: "Geographic Pricing"
description: "Set prices by region to match local purchasing power and competition."
---
# Geographic Pricing

Geographic pricing (geo-pricing) sets different prices by country or region. A SaaS plan at $49/month in the United States might be $19/month in India or $35/month in Brazil. The aim is to sell in markets that your home price would shut out, while keeping full price where buyers can pay it. It is common for global SaaS and digital products.

## How it works

Buyers in different countries get the same value from a product but have very different incomes. One global price forces a bad choice: price for high-income markets and lose the rest, or price low and give up revenue where buyers could pay more. Geo-pricing sets a locally sensible price in each market.

## How to do it

1. Group markets into three to five pricing tiers using purchasing power parity data, such as the World Bank's.
2. Set a discount level per tier. Example: full price in tier 1, 60-70% in tier 2, 30-50% in tier 3.
3. Detect country by IP and show the local price automatically on the pricing page.
4. Show prices in local currency. Set fixed local prices and review them on a schedule.
5. Guard against arbitrage. Require a billing address or payment card from the same country as the price.
6. Launch one new tier at a time. Measure signups, conversion, and revenue before expanding.

## What to measure

- **Revenue by pricing tier**: total revenue per tier over time, to confirm growth is new rather than shifted from tier 1.
- **Conversion rate by country**: pricing page conversion before and after localized prices.
- **Arbitrage rate**: share of lower-tier customers whose billing country does not match the price region.

## Best practices

- Call it "pricing for your region," not a discount.
- Consider a lighter plan for some markets instead of only cutting price.
- Review prices at least once a year. Exchange rates and local competitors change.

## Common pitfalls

- Discounting every non-US market. Many high-income countries do not need a discount.
- Broadcasting regional prices. It invites tier 1 buyers to hunt for lower prices. Let location-based pricing pages do the work.
- Ignoring local taxes. VAT, GST, and digital services taxes can raise the final price. Show tax-inclusive prices where that is the local norm or requirement.
