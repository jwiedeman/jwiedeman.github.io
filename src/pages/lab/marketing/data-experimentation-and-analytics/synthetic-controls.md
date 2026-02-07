---
layout: ../../../../layouts/Layout.astro
title: "Synthetic Controls"
description: "Creating synthetic control groups for causal measurement when true holdouts are impractical."
headingTracker: false
---
# Synthetic Controls

The synthetic control method constructs a mathematical "counterfactual" — a prediction of what would have happened in a treated market if no intervention had occurred — by creating a weighted combination of untreated markets that historically behaved like the treated one. When you cannot run a clean holdout (because leadership will not turn off ads in real markets), synthetic controls let you measure the causal impact of a marketing intervention by comparing actual results against this modeled baseline. It is the gold standard for quasi-experimental causal inference in marketing.

## Core Concept

Developed by Abadie and Gardeazabal (2003) and refined for tech applications by Google's CausalImpact package, synthetic controls solve a fundamental measurement problem: you cannot observe what would have happened if you had not run a campaign. The method works by identifying a set of "donor" markets (regions where the intervention did not occur) and computing optimal weights so that a blend of these donors closely matches the treated market's pre-intervention trend. After the intervention, any divergence between the actual outcome and the synthetic control's prediction is attributed to the intervention. Unlike simple before/after comparisons, this method accounts for seasonality, trends, and external factors.

## Implementation

1. Select the treated unit (the market, region, or segment where the campaign ran) and a pool of 10-30 donor units where the intervention did not occur
2. Gather pre-intervention data for all units — at least 12 months of historical performance data on the outcome variable (revenue, conversions, etc.) plus relevant covariates (population, income, seasonality factors)
3. Use the synthetic control algorithm (available in R's Synth package, Python's SparseSC, or Google's CausalImpact) to compute donor weights that minimize pre-intervention prediction error
4. Validate the synthetic control's fit by checking that it closely tracks the treated unit during the pre-intervention period — a poor pre-period fit means the post-period estimates will be unreliable
5. Measure the post-intervention gap between the actual treated unit and the synthetic control; this gap is your estimated causal effect, with confidence intervals derived from placebo tests on donor units

## Key Metrics

- **Pre-period fit (RMSPE)** — root mean squared prediction error during the pre-intervention period; lower values indicate a more reliable synthetic control
- **Post-period causal effect** — the cumulative or average difference between actual and synthetic outcomes after the intervention
- **Placebo test p-value** — run the same analysis on every donor unit; if many donors show gaps as large as the treated unit, the result is not statistically significant

## Best Practices

- Ensure a long pre-intervention period (at least 2x the post-intervention period) to build a stable synthetic control that captures seasonal patterns
- Run placebo tests on all donor units to validate statistical significance — if the treated unit's gap is not exceptional relative to placebos, the result is not reliable
- Use this method for high-impact interventions (market launches, major campaign shifts, pricing changes) where the expected effect is large enough to detect above noise

## Common Pitfalls

- Using too few donor units, which limits the algorithm's ability to construct a close-fitting synthetic control
- Ignoring pre-period fit quality and drawing conclusions from a poorly matched synthetic control, which produces unreliable causal estimates
- Applying synthetic controls to interventions with very small expected effects, where the signal is indistinguishable from the natural variation between actual and synthetic outcomes
