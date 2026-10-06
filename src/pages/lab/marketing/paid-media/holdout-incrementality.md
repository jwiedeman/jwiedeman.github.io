---
layout: ../../../../layouts/Layout.astro
title: "Holdout & Incrementality Testing"
description: "Measure how many conversions your ads actually cause by keeping a control group from seeing them."
---
# Holdout & Incrementality Testing

Holdout testing answers one question: how many of these conversions would have happened without the ad? Platform attribution takes credit for conversions that were going to happen anyway. A holdout test splits the audience into a group that sees ads and a group that does not, then compares their conversion rates.

## How it works

Attribution models, including last-click and data-driven, show correlation, not cause. If someone sees a retargeting ad and then buys, the platform counts it, even if they had already decided to buy. A holdout test is a randomized experiment, so it isolates cause.

Example: the holdout group converts at 5% and the exposed group at 7%. The ads added 2 percentage points, a 40% lift over baseline. About 5 of every 7 exposed conversions (71%) would have happened anyway.

## How to do it

1. Pick what to test. Start with high spend where you suspect over-crediting. Retargeting and brand search are common first tests.
2. Split the audience at random into an exposed group and a holdout group. Make sure the holdout truly sees no ads.
3. Use a native tool where you can: Meta Conversion Lift or Google Conversion Lift. Otherwise, run a geo holdout: pause ads in matched markets and keep them running in similar ones.
4. Calculate the sample size before launch, based on your baseline conversion rate and the smallest lift you want to detect. Run until you reach it.
5. Calculate lift: (exposed conversion rate − holdout conversion rate) ÷ holdout conversion rate.
6. Calculate incremental CPA: ad spend ÷ (exposed conversions − conversions expected without ads).
7. Move budget toward campaigns with high incremental lift, even if their reported CPA looks worse.

## What to measure

- **Incremental lift**: the percentage increase in conversion rate of the exposed group over the holdout.
- **Incremental CPA (iCPA)**: ad spend divided by incremental conversions only.
- **Lift by channel**: incremental lift for each channel tested, compared side by side.

## Best practices

- Test retargeting first. It is where over-crediting is most common.
- For geo holdouts, match markets on population, demographics, and past conversion rates.
- Re-run tests on a regular schedule. Lift changes as your brand, competitors, and audience change.
- For a channel-level view across all spend, consider a media mix model such as Meta's Robyn or Google's Meridian, calibrated with your lift tests.

## Common pitfalls

- A holdout too small to produce a readable result. Size it from the sample-size math, not by habit.
- Contamination. If holdout users still see your ads elsewhere, the test is invalid.
- Ignoring results you do not like. A low-lift campaign is still costing you money.
