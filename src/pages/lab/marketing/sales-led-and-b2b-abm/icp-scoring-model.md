---
layout: ../../../../layouts/Layout.astro
title: "ICP Scoring Model"
description: "Building Ideal Customer Profile scoring models to prioritize accounts most likely to convert and retain."
headingTracker: false
---
# ICP Scoring Model

An ICP scoring model assigns a numerical score to every account in your pipeline and total addressable market based on how closely it matches your Ideal Customer Profile. Rather than treating all leads equally, an ICP score helps sales and marketing focus resources on accounts with the highest probability of closing, the shortest sales cycles, and the greatest long-term revenue potential. Companies with rigorous ICP scoring see 68% higher win rates on scored accounts compared to unscored pipeline.

## Core Concept

Your ideal customer profile is built from the shared characteristics of your best existing customers — not who you hope to sell to, but who actually buys, stays, and expands. An ICP scoring model quantifies these characteristics into weighted attributes (industry, company size, technology stack, growth stage, funding status) and assigns each account a composite score. This score becomes the foundation for account prioritization, marketing spend allocation, and sales territory planning.

## Implementation

1. **Analyze your best customers:** Pull your top 20% of accounts by revenue, retention, and expansion rate. Identify the firmographic, technographic, and behavioral attributes they share. Look for patterns in industry, employee count, annual revenue, technology used, geographic location, and buying triggers.
2. **Define scoring attributes and weights:** Select 8-12 attributes and assign weights based on their correlation with success. Example: Industry match (25 points), Company size 200-2000 employees (20 points), Uses complementary technology (15 points), Series B+ funded (10 points), Growth rate above 20% YoY (10 points), Title match on LinkedIn (10 points), Geographic fit (10 points).
3. **Score your total addressable market:** Apply the model to your full account database and any third-party data sources (ZoomInfo, Clearbit, 6sense). Every account gets a score from 0-100. Sort into tiers: A (80-100), B (60-79), C (40-59), D (below 40).
4. **Validate against historical data:** Back-test your model against closed-won and closed-lost deals from the past 12-24 months. If the model correctly ranks won deals higher than lost deals at least 70% of the time, it is directionally valid. If not, adjust attribute weights.
5. **Operationalize and iterate quarterly:** Integrate the score into your CRM so sales sees it on every account record. Route marketing spend toward A and B accounts. Review model accuracy quarterly by comparing scores against actual pipeline conversion rates, and recalibrate weights as your customer base evolves.

## Key Metrics

- **Score-to-Close Correlation** — the percentage of closed-won deals that came from A-tier accounts; target 60%+ of revenue from top-scored accounts
- **Sales Cycle Length by Tier** — average days to close for each score tier; A-tier accounts should close 30-40% faster than C-tier
- **Model Accuracy Rate** — percentage of back-tested deals where the model correctly predicted the outcome; 70%+ indicates a useful model

## Best Practices

- Weight attributes by their actual predictive power, not gut feeling — run a correlation analysis between each attribute and closed-won outcomes before assigning points
- Include negative scoring attributes — accounts in regulated industries with long procurement cycles, or companies currently in a known vendor contract, should receive point deductions
- Combine firmographic scoring with behavioral intent signals (website visits, content downloads, G2 research) for a hybrid model that captures both fit and timing
- Make the score visible to sales reps in their daily workflow — a score buried in a CRM field no one checks is worthless. Surface it on dashboards, in Slack notifications, and in lead assignment logic.

## Common Pitfalls

- Building the model based on aspirational customers instead of actual customers — if you have never sold to enterprise companies, scoring enterprise accounts as "A-tier" sets sales up for failure
- Using too many attributes — a model with 20+ factors is impossible to maintain and difficult to interpret. Stick to 8-12 high-signal attributes.
- Scoring once and never updating — your ICP evolves as your product expands and your market shifts. A model built 18 months ago may be scoring the wrong profile today.
