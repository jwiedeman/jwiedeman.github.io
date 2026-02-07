---
layout: ../../../../layouts/Layout.astro
title: "Difference-in-Differences Analysis"
description: "Using the difference-in-differences method for causal inference in marketing."
headingTracker: false
---
# Difference-in-Differences Analysis

Difference-in-differences (DiD) is a statistical method for estimating the causal effect of a marketing intervention by comparing the change in outcomes over time between a group that received the intervention (treatment) and a group that did not (control). By measuring the difference in trends rather than the difference in levels, DiD controls for pre-existing differences between groups and shared time trends, producing more reliable causal estimates than simple before-after comparisons.

## Core Concept

The core insight of DiD is that neither "before vs after" nor "treatment vs control" comparisons alone produce causal estimates. A "before vs after" comparison confounds the intervention's effect with seasonal trends, economic changes, and other time-varying factors. A "treatment vs control" comparison confounds the intervention with pre-existing differences between groups. DiD solves both problems by computing two differences: first, the change over time in the treatment group; second, the change over time in the control group. The difference between these two differences isolates the causal effect. The critical assumption is "parallel trends" — that both groups would have followed the same trajectory in the absence of the intervention.

## Implementation

1. Identify a clear intervention point (campaign launch, price change, new market entry) and establish pre-intervention and post-intervention time periods of equal length (minimum 8-12 weeks each)
2. Define treatment and control groups that were not both exposed to the intervention — geographic markets, customer segments, or product lines where the change was rolled out in some but not others
3. Verify the parallel trends assumption by plotting the outcome variable for both groups during the pre-intervention period — if the trends are not parallel, DiD estimates will be biased
4. Run the DiD regression: outcome = B0 + B1(treatment) + B2(post) + B3(treatment x post) + controls + error, where B3 is the causal effect estimate
5. Conduct robustness checks: test for pre-trend differences, add covariates, try different time windows, and run placebo tests (apply the method at fake intervention dates) to validate the result

## Key Metrics

- **DiD estimate (B3 coefficient)** — the magnitude of the intervention's causal effect on the outcome variable, with standard errors and confidence intervals
- **Parallel trends test p-value** — a formal test of whether pre-intervention trends were statistically parallel; a significant result indicates the assumption is violated
- **Effect persistence** — whether the DiD estimate remains stable when extending the post-intervention window, or whether the effect fades over time

## Best Practices

- Always visually inspect pre-trends before running the regression — a chart of treatment and control outcomes over time reveals parallel trends violations that the formal test might miss
- Include time-varying covariates (seasonality indicators, promotional calendar, competitor activity) to improve precision and control for confounding factors
- Use multiple control groups when available and check whether the DiD estimate is consistent across them — robustness across different controls strengthens confidence in the result

## Common Pitfalls

- Violating the parallel trends assumption, which is the most common and most serious failure mode — if groups were already trending differently before the intervention, the DiD estimate is meaningless
- Using DiD when the intervention was not cleanly applied (partial rollouts, gradual implementation) without adjusting the methodology for staggered treatment timing
- Interpreting a statistically significant DiD estimate as practically meaningful without considering effect size relative to the baseline — a 0.5% lift that costs $500K to produce may be statistically real but economically useless
