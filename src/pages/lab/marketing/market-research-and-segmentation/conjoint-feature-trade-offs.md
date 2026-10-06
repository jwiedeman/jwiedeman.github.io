---
layout: ../../../../layouts/Layout.astro
title: "Conjoint Analysis & Feature Trade-Offs"
description: "Use conjoint analysis to learn which features customers value most and what they will pay for them."
---
# Conjoint Analysis & Feature Trade-Offs

Conjoint analysis shows how customers value features by making them choose between realistic product options. If you ask "How important is feature X?", most people say "very important." Conjoint asks them to pick between bundles of features and prices, then works out which attributes actually drive the choice.

## How it works

Every purchase is a set of trade-offs. Customers do not judge features one at a time. They weigh whole packages against a budget and other limits. In a conjoint study, respondents see product profiles that vary in a planned way across attributes such as price, speed, support level, and integrations. They pick the one they prefer. The analysis then estimates a "part-worth utility" for each attribute level. That number tells you how much each feature adds to the choice and what customers will give up to get it.

## How to do it

1. Pick 4 to 6 attributes that matter to the purchase. Give each 2 to 4 levels. Example for a SaaS product: price ($29, $79, $149 per month), onboarding (self-serve, guided, white-glove), integrations (5, 15, 50+), reporting (basic, advanced, custom), and support (email, chat, dedicated CSM).
2. Use a choice-based conjoint (CBC) design. Let your conjoint software generate an efficient set of profiles. Show them in groups of 3 or 4 and ask which one the respondent would buy. Include a "none of these" option.
3. Survey a few hundred respondents from your target market. Recruit from your email list, a panel service, or in-product prompts. Check that the sample matches your real buyer mix.
4. Analyze the results with hierarchical Bayesian estimation, which tools like Sawtooth, Conjointly, and several R packages support. Extract the part-worth utilities and the relative importance of each attribute.
5. Build a market simulator from the results. Enter different configurations and prices to see predicted share of preference. Use it to shape tiers, find the minimum feature set per segment, and estimate the revenue effect of adding or removing a feature.

## What to measure

- **Relative attribute importance**: the share of choice variation explained by each attribute, from the conjoint output.
- **Willingness to pay per feature**: the utility of a feature divided by the utility per dollar of the price attribute.
- **Simulated market share**: predicted share of preference for your configuration versus competitors, read from the simulator.

## Best practices

- Always include price as an attribute. Without it, you learn what people prefer but not what they will pay for.
- Run conjoint before a pricing or packaging change, not after launch.
- Segment the results. Different buyer groups weigh features differently. Latent class analysis can find these groups.

## Common pitfalls

- Too many attributes or levels. Respondents get tired and start picking the cheapest option instead of weighing trade-offs. Stay at 4 to 6 attributes.
- Levels that are too close together. Prices of $49, $59, and $69 do not force a real trade-off. Spread the levels out.
- Treating results as exact predictions. Conjoint shows relative importance, not conversion rates. Use it for direction, then confirm with real-market tests.
