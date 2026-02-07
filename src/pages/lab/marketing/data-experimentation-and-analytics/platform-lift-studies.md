---
layout: ../../../../layouts/Layout.astro
title: "Platform Lift Studies"
description: "Running platform-native brand and conversion lift studies to measure ad effectiveness."
headingTracker: false
---
# Platform Lift Studies

Platform lift studies are controlled experiments offered natively by ad platforms (Meta, Google, TikTok, LinkedIn) that measure the true incremental impact of your ads by comparing a randomly selected exposed group against a holdout group that sees no ads (or a public service announcement instead). Unlike attribution models that assign credit after the fact, lift studies answer the causal question: "Did seeing this ad actually change behavior?" They are the most accessible incrementality measurement tool available to most marketing teams.

## Core Concept

Lift studies work by applying randomized controlled trial methodology within the ad platform's ecosystem. The platform randomly splits your target audience into a test group (sees your ad) and a control group (sees nothing or a placebo ad). After the campaign runs, the platform measures the difference in a key outcome — brand awareness (brand lift), purchase consideration (search lift), or actual conversions (conversion lift) — between the two groups. The difference is the incremental lift, and because the groups were randomly assigned, confounding variables are controlled. This makes lift studies far more reliable than last-click or even multi-touch attribution for answering "did this campaign work?"

## Implementation

1. Determine the study type based on your campaign objective: brand lift for awareness campaigns (measures recall, favorability, consideration), conversion lift for performance campaigns (measures incremental purchases, signups, or leads)
2. Meet the platform's minimum requirements — Meta conversion lift typically requires at least $30K spend over 2+ weeks; Google brand lift requires minimum impression thresholds; plan spend accordingly
3. Set up the study in the platform's measurement tools (Meta Experiments, Google Brand Lift, TikTok Brand Lift) before the campaign launches — most studies must be configured during campaign creation, not retrofitted
4. Run the campaign for the full study duration without making major changes to targeting, creative, or budget that could compromise the test's validity
5. Analyze results by comparing the outcome metric between test and control groups; calculate the cost per incremental conversion (not cost per attributed conversion) and compare this to your efficiency benchmarks

## Key Metrics

- **Incremental lift percentage** — the percentage increase in the target outcome (brand recall, conversions) caused by ad exposure
- **Cost per incremental result** — total spend divided by incremental outcomes, which is always higher than cost per attributed result and represents the true cost of acquisition
- **Statistical significance** — the confidence level that the measured lift is real; most platforms require 90% confidence before reporting results as conclusive

## Best Practices

- Run lift studies on your highest-spend campaigns first — inaccurate measurement on a $500K/month campaign is far more costly than on a $5K/month campaign
- Compare lift study results against platform-reported attribution to identify the gap between attributed and incremental performance — this gap is your measurement inflation
- Use lift study results to calibrate your attribution model: if Meta reports 2x more conversions than the lift study validates, apply a 0.5x deflator to ongoing attributed reporting

## Common Pitfalls

- Ending the study too early because initial results look conclusive — underpowered studies produce unreliable results, and platforms need minimum exposure to generate statistical significance
- Making creative or targeting changes mid-study, which confounds the test and makes it impossible to determine which version of the campaign was measured
- Running lift studies on small audiences or low-spend campaigns where the expected lift is too small to detect with statistical confidence
