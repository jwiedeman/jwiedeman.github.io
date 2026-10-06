---
layout: ../../../../layouts/Layout.astro
title: "Feature Flag Experiments"
description: "Use feature flags to roll out, test, and switch off features without a new app store release."
---
# Feature Flag Experiments

Feature flags (also called toggles or remote config) turn features on or off for chosen users without shipping new code or a new app build. You can A/B test features, roll them out gradually, turn off a broken feature at once, and tailor the experience by segment from a dashboard.

## How it works

Without flags, a new feature reaches every user at once. If it breaks, you need a new release and another app review. With flags, the feature's code checks a remote setting before it runs. Release and visibility become separate. You can go from 1% of users to 10%, 50%, and 100%, with a kill switch at every step.

## How to do it

1. Pick a flag platform such as LaunchDarkly, Statsig, Firebase Remote Config, or Unleash (self-hostable). Add its SDK, initialize it at launch, and wrap new features in flag checks.
2. Set naming and lifecycle rules. Use descriptive names like `new_checkout_flow_v2`. Tag each flag by type: release, experiment, ops, or permission. Define when and how flags get removed.
3. For a rollout, start at a small percentage. Watch crash rate, error rate, and engagement for a day or two. Step up to 10%, 25%, 50%, and 100%, checking metrics at each step. Roll back if anything gets worse.
4. For an A/B test, split users randomly into control and treatment. Make assignment sticky so each user always sees the same variant. Send exposure events to your analytics tool.
5. Before each experiment, write down the hypothesis, the primary metric, the sample size, and the duration.

## What to measure

- **Rollback rate**: share of rollouts that had to be reversed.
- **Experiment velocity**: experiments completed per month.
- **Experiment win rate**: share of tests where treatment beats control on the primary metric.

## Best practices

- Put every new feature behind a flag, not just risky ones.
- Alert automatically on crash, error, or engagement changes within the flagged group.
- Remove flags soon after a feature is fully rolled out and stable.

## Common pitfalls

- Letting stale flags pile up. Nobody knows what they do, and the code gets fragile. Set a removal deadline.
- Calling tests early or with too few users. Use a sample size calculator and wait for significance.
- Using flags as permanent access control. Use a proper authorization system for that.
