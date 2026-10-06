---
layout: ../../../../layouts/Layout.astro
title: "Difference-in-Differences Analysis"
description: "Estimate the effect of a marketing change by comparing how a treated group and a control group changed over time."
---
# Difference-in-Differences Analysis

Difference-in-differences (DiD) estimates the effect of a change by comparing how outcomes moved over time in a group that got the change (treatment) and a group that did not (control). Because it compares changes rather than levels, it accounts for existing differences between the groups and for trends that affect both.

## How it works

Neither comparison works alone. Before versus after mixes the effect with seasonality and other changes over time. Treatment versus control mixes the effect with differences that already existed between the groups. DiD takes two differences: the change in the treatment group and the change in the control group. The gap between them is the estimated effect. It depends on one key assumption, called parallel trends: without the change, both groups would have moved the same way.

## How to do it

1. Pick a clear start date for the change (campaign launch, price change, new market). Use equal pre and post periods, at least 8 to 12 weeks each.
2. Choose treatment and control groups where only the treatment group got the change: markets, customer segments, or product lines.
3. Plot the outcome for both groups before the change. If the lines are not roughly parallel, do not trust the estimate.
4. Run the regression: `outcome = B0 + B1(treatment) + B2(post) + B3(treatment × post) + controls + error`. B3 is the effect.
5. Check the result: test for pre-period differences, add covariates, try other time windows, and run placebo tests on fake start dates.

## What to measure

- **DiD estimate (B3)**: the size of the effect, reported with its confidence interval.
- **Pre-trend test**: a test of whether the groups moved differently before the change. A significant result means the assumption fails.
- **Effect persistence**: whether the estimate holds as you extend the post period.

## Best practices

- Always chart the pre-period before running the regression. A chart often shows problems a test misses.
- Add time-based covariates such as seasonality, promotions, and competitor activity.
- Use more than one control group when you can and check that the estimates agree.

## Common pitfalls

- Ignoring non-parallel pre-trends. This is the most common and most serious failure.
- Using basic DiD when the change rolled out at different times in different places. Use a method built for staggered timing.
- Treating a statistically significant result as worthwhile without checking its size against the cost of producing it.
