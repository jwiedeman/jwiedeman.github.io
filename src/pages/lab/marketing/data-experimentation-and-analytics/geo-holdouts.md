---
layout: ../../../../layouts/Layout.astro
title: "Geo Holdouts"
description: "Turn off a channel in some regions and compare results to measure what that channel actually adds."
---
# Geo Holdouts

A geo holdout test stops a marketing channel in some regions while it keeps running in others, then compares results between the two. It is the closest thing to a controlled experiment for measuring a channel at scale. Attribution models estimate credit. A geo holdout measures what happens when the channel is off.

## How it works

The key measurement question is not "which touchpoint gets credit?" It is "what would have happened if we had not spent this money?" A geo holdout answers it with a real control group. You pause a channel in a set of regions that match the others on population, baseline sales, and seasonality. The difference in outcomes between the two sets is the incremental lift: revenue the channel caused, not just revenue it touched.

## How to do it

1. Pick 10 to 20 regions (DMAs, states, or metros). Use past data to pair regions with similar baseline sales, demographics, and seasonality.
2. Randomly assign one region in each pair to holdout (channel off) and the other to treatment (channel on).
3. Run the test for at least 4 to 8 weeks. Shorter tests lack power. Much longer tests pick up outside noise.
4. Compare conversions, revenue, or your main outcome between holdout and treatment regions, adjusting for baseline differences.
5. Scale the per-region lift to your full footprint. Compare it to what attribution or platform reports claim for the channel.

## What to measure

- **Incremental lift**: percent difference in conversions or revenue between treatment and holdout regions.
- **Incremental CPA (iCPA)**: channel spend divided by incremental conversions, not attributed conversions.
- **Confidence level**: how likely the difference is real rather than noise. Agree on a threshold before the test.

## Best practices

- Match regions on several factors: population, income, past conversion rate, and competition.
- Test one channel at a time so you can tell what caused the result.
- Start with your largest channels, where measurement errors cost the most.

## Common pitfalls

- Using holdout regions that differ too much from treatment regions.
- Ending the test too early and acting on results that are not significant.
- Contamination: national digital ads reaching holdout regions, organic demand shifts, or competitor moves during the test.
