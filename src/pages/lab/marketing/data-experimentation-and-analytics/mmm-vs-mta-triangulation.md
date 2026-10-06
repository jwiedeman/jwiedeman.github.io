---
layout: ../../../../layouts/Layout.astro
title: "MMM vs MTA Triangulation"
description: "Compare marketing mix models, multi-touch attribution, and experiments to get a measurement you can trust."
---
# MMM vs MTA Triangulation

Marketing mix modeling (MMM) and multi-touch attribution (MTA) answer different questions. MMM uses aggregate data over time to estimate each channel's effect on outcomes. MTA uses user-level tracking to split credit for each conversion across touchpoints. Neither is complete on its own. Triangulation compares the two and checks both against incrementality experiments.

## How it works

MMM and MTA fail in different ways. MTA favors lower-funnel touchpoints such as the last click, and it loses data to cookie limits, iOS privacy rules, and cross-device gaps. MMM covers upper-funnel and offline channels that MTA misses, but it works at a high level, updates slowly, and needs a long history of data with real variation in spend. Triangulation treats each model as a hypothesis. Experiments such as geo holdouts and lift studies act as the reference. Where MMM and MTA agree, confidence is high. Where they disagree, run an experiment.

## How to do it

1. Build or buy an MMM that includes all marketing spend, outside factors (seasonality, competitors, economy), and business outcomes. Use it for budget allocation.
2. Keep an MTA model, even a simple linear or position-based one, for day-to-day campaign decisions.
3. Run incrementality experiments each quarter on your largest channels.
4. Build a table with one row per channel showing the MMM, MTA, and experiment estimates side by side. Flag large gaps.
5. Use the experiments to adjust both models: correct MMM coefficients that are too high or low, and change MTA weights where MMM shows upper-funnel effects MTA misses.

## What to measure

- **Model agreement**: share of channels where MMM and MTA estimates are within a set range of each other.
- **Experiment-validated ROAS**: return on ad spend measured by experiments, used as the benchmark.
- **Budget shift**: how much budget moves between channels after triangulation.

## Best practices

- Do not rely on one method. Each one is unreliable on its own.
- Point experiments at the channels where MMM and MTA disagree most.
- Refresh the MMM quarterly so it keeps up with changes in your media mix.

## Common pitfalls

- Using MTA as the truth for budget decisions. It under-credits awareness channels and over-credits retargeting.
- Building an MMM on data with little variation. If a channel never paused or changed much, the model cannot estimate it.
- Treating triangulation as a one-time project instead of an ongoing process.
