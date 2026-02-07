---
layout: ../../../../layouts/Layout.astro
title: "Geo Holdouts"
description: "Using geographic holdout regions to measure the true incremental impact of marketing spend."
headingTracker: false
---
# Geo Holdouts

Geo holdout testing is an incrementality measurement technique where you withhold marketing activity from a set of geographic regions while continuing to advertise in others, then compare business outcomes between the two groups. It is the closest thing to a controlled experiment available for measuring the true causal impact of a marketing channel at scale. Unlike attribution models that estimate credit, geo holdouts directly measure what happens when you turn a channel off.

## Core Concept

The fundamental question in marketing measurement is not "which touchpoint gets credit?" but "what would have happened if we had not spent this money?" Geo holdouts answer this by creating a real-world control group. By pausing all advertising for a specific channel in a set of matched markets (similar in demographics, baseline sales, and seasonality), you can observe the actual difference in outcomes between exposed and unexposed regions. The difference is the incremental lift — the revenue your marketing actually caused, rather than the revenue it merely touched.

## Implementation

1. Select 10-20 geographic regions (DMAs, states, or metro areas) and use historical data to match them into pairs with similar baseline performance, demographics, and seasonality patterns
2. Randomly assign one region from each pair to the holdout group (no advertising) and one to the treatment group (advertising continues as normal)
3. Run the test for 4-8 weeks minimum — shorter tests lack statistical power, and longer tests risk other variables contaminating the results
4. Measure the difference in conversion rate, revenue, or your primary business outcome between holdout and treatment regions, controlling for any pre-existing baseline differences
5. Calculate the incremental contribution of the channel by extrapolating the per-region lift to your full footprint, then compare this to the attributed contribution from your MTA or platform reporting

## Key Metrics

- **Incremental lift percentage** — the percentage increase in conversions or revenue in treatment regions versus holdout regions, representing the channel's true causal impact
- **Incremental cost per acquisition (iCPA)** — total spend on the channel divided by the incremental conversions it drove (not total attributed conversions), which is the real efficiency measure
- **Statistical confidence level** — the probability that the observed difference is real rather than random noise; target 90% confidence minimum before making budget decisions

## Best Practices

- Match holdout and treatment regions on multiple dimensions (population size, income level, historical conversion rate, competitive intensity) to minimize confounding variables
- Test one channel at a time to isolate its specific impact — testing multiple channels simultaneously makes it impossible to disentangle individual contributions
- Run holdouts on your largest-spend channels first, where even a small measurement error translates to significant budget misallocation

## Common Pitfalls

- Choosing holdout regions that are too different from treatment regions, which introduces confounds that invalidate the results
- Running the test for too short a period, which produces results that lack statistical significance and lead to incorrect conclusions
- Contamination from organic demand, cross-region spillover (customers in holdout regions seeing ads on national digital platforms), or competitor activity shifts during the test window
