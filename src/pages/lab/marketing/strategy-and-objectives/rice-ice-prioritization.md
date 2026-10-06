---
layout: ../../../../layouts/Layout.astro
title: "RICE / ICE Prioritization"
description: "Score initiatives on Reach, Impact, Confidence, and Effort (or Impact, Confidence, Ease) to rank a backlog."
---
# RICE / ICE Prioritization

RICE and ICE are simple scoring frameworks for teams with more ideas than resources. Each initiative is scored on the same criteria, which produces a ranked backlog instead of decisions by gut feel or the loudest voice. RICE (Reach, Impact, Confidence, Effort) is more thorough. ICE (Impact, Confidence, Ease) is faster.

## How it works

Both frameworks split prioritization into separate factors, score each, and combine them into one number.

- **RICE** = (Reach x Impact x Confidence) / Effort. Reach is people affected per period. Impact is the expected effect on the target metric. Confidence is how sure you are of the estimates. Effort is person-months.
- **ICE** = Impact x Confidence x Ease, each scored 1 to 10.

The scores are not predictions. They are a way to expose assumptions and make trade-offs explicit.

## How to do it

1. Set one target metric and one time frame before scoring, for example "qualified leads in Q2." Without this, scores cannot be compared.
2. For RICE, estimate:
   - Reach as a number, such as 12,000 visitors a month who will see the change.
   - Impact on a fixed scale: 3 massive, 2 high, 1 medium, 0.5 low, 0.25 minimal.
   - Confidence as a percentage: 100% proven by data, 80% strong evidence, 50% educated guess, 20% long shot.
   - Effort in person-weeks or person-months.
3. For ICE, score Impact, Confidence, and Ease from 1 to 10 (Ease 10 = one day, 1 = several quarters). Multiply the three.
4. Put every initiative in a shared spreadsheet. Have each person score on their own first, then discuss any scores that differ by more than two points.
5. Rank by score, then apply judgment. Adjust for dependencies (B only works after A ships), balance (do not fund only long shots), and capacity (one designer cannot staff three projects at once).

## What to measure

- **Prioritization accuracy:** each quarter, the share of top-ranked initiatives that moved the target metric by roughly the predicted amount.
- **Scoring spread:** the standard deviation of team members' independent scores per initiative, tracked over time.
- **Backlog throughput:** scored initiatives completed per quarter.

## Best practices

- Calibrate first. Score three to five finished initiatives together so everyone agrees on what "Impact 7" or "80% Confidence" means.
- Score and decide in separate meetings. A gap of a day or two reduces anchoring on the first idea discussed.
- Re-score every quarter. Confidence, effort, and reach all change as you learn.

## Common pitfalls

- Inflating Confidence for favorite ideas. Set a rule: Confidence above 80% needs at least one piece of quantitative evidence, such as a past test or customer research. Without it, cap Confidence at 50%.
- Mixing very different kinds of work in one list. "Redesign the homepage" and "hire a content marketer" do not compare well. Score within categories.
- Adding extra factors, weights, and formulas. The value is speed. If one initiative takes more than 10 minutes to score, simplify.
