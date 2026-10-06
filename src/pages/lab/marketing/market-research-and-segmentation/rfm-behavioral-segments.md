---
layout: ../../../../layouts/Layout.astro
title: "RFM Behavioral Segments"
description: "Group customers by how recently, how often, and how much they buy, then market to each group differently."
---
# RFM Behavioral Segments

RFM segmentation groups customers by three behaviors: how recently they bought (Recency), how often they buy (Frequency), and how much they spend (Monetary). It sorts people by what they do, not who they are, so each segment maps directly to an action. It is a long-standing direct marketing method and adapts to e-commerce, SaaS, and subscriptions.

## How it works

Past behavior is a good predictor of future behavior. Someone who bought yesterday, buys weekly, and spends a lot needs different treatment from someone who bought once six months ago. Score each customer from 1 to 5 on R, F, and M. Then group the scores into named segments such as "Champions" (5-5-5), "At Risk" (1-4-4), and "New Customers" (5-1-1). No complex modeling is required.

## How to do it

1. Pull three fields per customer: date of last purchase, number of purchases in a set period (often 12 months), and total revenue in that period. For SaaS with few transactions, use logins or a key action instead of purchases.
2. Score each field 1 to 5 by quintile. The most recent 20% get R=5, the next 20% get R=4, and so on. Repeat for F and M. Each customer now has a score such as 5-4-3.
3. Group scores into named segments. Common ones: Champions, Loyal, Potential Loyalists, New, At Risk, Hibernating, and Lost. Adjust the groupings to your business.
4. Assign one action per segment. Champions get referral asks. Potential Loyalists get onboarding and usage nudges. At Risk gets a win-back offer. Lost gets one last attempt, then suppression. Write this down as a playbook.
5. Automate scoring weekly or monthly in your CRM, CDP, or a SQL job. Sync segments to email, ad audiences, and customer success tools.

## What to measure

- **Segment migration rate**: share of customers moving up or down a segment each month.
- **Revenue by segment**: share of total revenue from each segment, to see how concentrated it is.
- **Win-back conversion rate**: share of At Risk or Hibernating customers who buy again after a targeted campaign.

## Best practices

- Match the time window to your purchase cycle. Consumables might use 6 months. Furniture might use 24.
- Give recency the most weight when prioritizing campaigns. Recent buyers are usually the most responsive.
- Add one more dimension, such as product category or channel preference, to make segments more specific.

## Common pitfalls

- Scoring once and never updating. Champions from six months ago may have churned. Recalculate on a schedule.
- Ignoring New Customers because F and M are low. They just arrived. Onboard them toward Loyal and Champion.
- Using RFM as your only model. It misses needs, company size, and motivation. Two customers with the same score can need very different things.
