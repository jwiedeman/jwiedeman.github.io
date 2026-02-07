---
layout: ../../../../layouts/Layout.astro
title: "RICE / ICE Prioritization"
description: "Scoring marketing and product initiatives by Reach, Impact, Confidence, Effort — or Impact, Confidence, Ease — to allocate resources rationally."
headingTracker: false
---
# RICE / ICE Prioritization

RICE and ICE are lightweight scoring frameworks that help marketing and product teams prioritize initiatives when there are more ideas than resources. Instead of relying on the loudest voice in the room or gut instinct, these frameworks force teams to evaluate each initiative against consistent criteria and produce a ranked backlog. RICE (Reach, Impact, Confidence, Effort) is more thorough; ICE (Impact, Confidence, Ease) is faster. Both are effective at turning subjective debates into structured conversations.

## Core Concept

The frameworks work by decomposing prioritization into independent dimensions, scoring each, and combining them into a single comparable number. RICE calculates (Reach x Impact x Confidence) / Effort, where Reach is the number of people affected per time period, Impact is the expected effect on the target metric, Confidence is your certainty in the estimates, and Effort is person-months required. ICE simply multiplies Impact x Confidence x Ease (inverse of effort), each scored 1-10. The resulting scores are not precise predictions — they are conversation tools that surface hidden assumptions and make trade-offs explicit.

## Implementation

1. Define the time horizon and target metric before scoring. All initiatives should be evaluated against the same outcome (e.g., "qualified leads generated in Q2") and the same time frame. Without this anchor, scores across initiatives are not comparable.
2. For RICE: Estimate Reach as a concrete number (e.g., 12,000 website visitors per month who will see the change). Score Impact on a predefined scale (3 = massive, 2 = high, 1 = medium, 0.5 = low, 0.25 = minimal). Set Confidence as a percentage (100% = proven by data, 80% = strong evidence, 50% = educated guess, 20% = moonshot). Estimate Effort in person-weeks or person-months.
3. For ICE: Score Impact 1-10 based on expected effect on the target metric. Score Confidence 1-10 based on evidence quality. Score Ease 1-10 based on how quickly the team can execute (10 = one day, 1 = multiple quarters). Multiply all three.
4. Score every candidate initiative in a shared spreadsheet during a team session. Have each stakeholder score independently first, then discuss and reconcile any scores that differ by more than 2 points. The discussion around disagreements is often more valuable than the final number.
5. Rank by score, then apply judgment. The framework output is a starting point, not a mandate. Adjust for strategic dependencies (Initiative B only works if Initiative A ships first), portfolio balance (do not fund 100% high-risk moonshots), and resource constraints (one designer cannot staff three top-ranked projects simultaneously).

## Key Metrics

- **Prioritization accuracy rate** — percentage of top-ranked initiatives that actually moved the target metric by the predicted magnitude, measured retrospectively each quarter to calibrate future scoring
- **Scoring calibration variance** — standard deviation between team members' independent scores, tracked over time to see if the team is converging on shared estimation quality
- **Backlog velocity** — number of scored initiatives completed per quarter, ensuring the prioritization process leads to execution rather than analysis paralysis

## Best Practices

- Calibrate the team by scoring 3-5 completed past initiatives together before scoring new ones. This builds shared understanding of what a "7 Impact" or "80% Confidence" actually means and reduces subjective drift.
- Separate the scoring session from the decision session. Score on Monday, decide on Wednesday. The gap prevents anchoring bias where the first initiative discussed sets the bar for everything after.
- Re-score quarterly. Confidence levels change as you gather data, Effort estimates shift as the team grows, and Reach numbers evolve with your audience. A static backlog score becomes misleading within 90 days.

## Common Pitfalls

- Inflating Confidence scores because the team is emotionally attached to an idea. Institute a rule: Confidence above 80% requires at least one piece of quantitative evidence (past experiment, benchmark data, or customer research). Without evidence, cap it at 50%.
- Using RICE/ICE to score fundamentally different types of work on the same list. Comparing "redesign the homepage" against "hire a content marketer" produces meaningless rankings. Score within categories: campaigns vs. campaigns, infrastructure vs. infrastructure.
- Over-engineering the framework with additional dimensions, weights, and formulas. The power of RICE/ICE is simplicity and speed. If scoring one initiative takes more than 10 minutes, you have added too much complexity and the team will abandon the process.
