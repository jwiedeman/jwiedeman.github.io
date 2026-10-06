---
layout: ../../../../layouts/Layout.astro
title: "Synthetic Controls"
description: "Build a weighted blend of untreated markets to estimate what would have happened without a campaign."
---
# Synthetic Controls

The synthetic control method estimates what would have happened in a market without a campaign. It builds a weighted blend of other markets that behaved like the treated market in the past. Use it when you cannot run a clean holdout, for example when leadership will not turn off ads in real markets. Compare actual results to the blend to estimate the campaign's effect.

## How it works

You cannot directly observe what would have happened without the campaign. The synthetic control method, introduced by Abadie and Gardeazabal in 2003, works around this. It takes a pool of "donor" markets where the campaign did not run and finds weights so their blend tracks the treated market closely before the campaign. After launch, the gap between the actual market and the blend is the estimated effect. Unlike a simple before-and-after comparison, this accounts for seasonality, trends, and outside events that hit all markets.

## How to do it

1. Pick the treated market and a pool of 10 to 30 donor markets where the campaign did not run.
2. Collect at least 12 months of pre-campaign data for every market: the outcome (revenue, conversions) and relevant covariates (population, income, seasonality).
3. Compute donor weights that minimize pre-campaign error using a tool such as R's Synth package or Python's SparseSC. Google's CausalImpact package is a related approach.
4. Check that the blend tracks the treated market closely before the campaign. A poor fit means the results will not be reliable.
5. Measure the gap after launch. Get confidence intervals by running the same analysis on each donor market as a placebo.

## What to measure

- **Pre-period fit (RMSPE)**: root mean squared prediction error before the campaign. Lower is better.
- **Causal effect**: the average or cumulative gap between actual and synthetic outcomes after launch.
- **Placebo p-value**: share of donor markets showing a gap as large as the treated market's. A high share means the result is not significant.

## Best practices

- Use a pre-period at least twice as long as the post-period so the blend captures seasonal patterns.
- Run placebo tests on every donor. If the treated market's gap is not unusual, do not trust the result.
- Use the method for large changes (market launches, major campaign shifts, price changes) where the effect should stand out from noise.

## Common pitfalls

- Too few donor markets to build a close match.
- Drawing conclusions from a blend that fit poorly before the campaign.
- Applying it to changes with very small expected effects, which get lost in normal variation.
