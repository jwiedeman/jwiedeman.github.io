---
layout: ../../../../layouts/Layout.astro
title: "Dynamic Demand Pricing"
description: "Change prices based on demand signals to fill capacity and earn more when supply is tight."
---
# Dynamic Demand Pricing

Dynamic demand pricing changes prices based on signals such as inventory, time, booking pace, and competitor prices. Airlines, hotels, ride-hailing apps, and many online stores use it. Prices go up when demand is high and down when it is low. Done openly, it fills capacity that would otherwise go unsold and earns more when supply is short.

## How it works

A fixed price is wrong in two directions. When demand is high, it charges less than many buyers would pay. When demand is low, it prices some buyers out. Dynamic pricing narrows both gaps. It needs three parts: demand signals (booking pace, page views, cart activity, stock levels), pricing rules that turn signals into price changes, and systems that update prices across channels without manual work.

## How to do it

1. Choose two or three demand signals you can measure reliably. Examples: stock level and page view velocity for e-commerce; capacity and time to event for services.
2. Write simple rules before using any model. Example: "If stock is below 20% and views are above the 30-day average, raise the price 10%."
3. Set a floor and a ceiling for every price. The floor protects margin. The ceiling protects trust.
4. Run dynamic prices for a test group and static prices for a control group for several weeks.
5. Compare revenue per visitor, conversion, refunds, and satisfaction between the groups.
6. Tell customers why a price is what it is: "Early bird price," "Off-peak rate," "Last 5 seats at this price."

## What to measure

- **Revenue per available unit**: total revenue divided by total available inventory or capacity.
- **Price elasticity by segment**: percentage change in demand divided by percentage change in price, per segment.
- **Fairness perception**: share of surveyed customers who rate your pricing as fair, tracked monthly.

## Best practices

- Start with time-based pricing such as early bird and off-peak rates. Customers already accept these as fair.
- Use dynamic pricing to fill unsold capacity, not to charge loyal customers more.
- Frame higher prices as a choice ("Priority boarding: $29") rather than a penalty ("Surge: 2.1x").

## Common pitfalls

- Hiding how prices work. Customers who learn they paid more than others for no clear reason react badly. Amazon drew criticism in 2000 when shoppers found different prices for the same DVDs.
- Changing prices too often or too much. Volatile prices teach customers to wait instead of buy.
- Underestimating the operating cost. You need live data, maintained rules, monitoring, and trained staff. If you cannot support that, manual price changes may work better.
