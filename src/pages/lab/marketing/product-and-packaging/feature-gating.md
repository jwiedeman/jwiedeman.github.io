---
layout: ../../../../layouts/Layout.astro
title: "Feature Gating"
description: "Restrict features by plan so customers upgrade when they need more, while the base plan stays useful."
---
# Feature Gating

Feature gating limits access to certain features based on the customer's plan. The gates define what each pricing tier actually includes. Good gates create an upgrade path: customers move up because they need the gated feature. Bad gates make customers feel nickel-and-dimed and push them to competitors.

## How it works

Not every customer gets the same value from every feature. A solo user needs basic email. An enterprise team needs user permissions, advanced reporting, and SSO. Gating lets you charge more to customers who get more value.

The gate should follow value, not effort. A good gate makes the customer think, "Of course that is on the higher plan."

## How to do it

1. Sort every feature into three groups: core (on every plan), differentiating (separates the plans), and delight (small extras that build loyalty, usually free).
2. Tie each differentiating feature to a growth trigger: collaboration at team size, advanced analytics at data volume, automation at workflow complexity, integrations at tool stack size.
3. Design the gate screen. Show what the feature does, which plan includes it, and a one-click path to upgrade or trial. Never show a blank wall or an error.
4. Use soft gates where they fit. Instead of a hard lock, give a small allowance ("3 free uses this month, upgrade for unlimited") so users see the value first.
5. Log every gate interaction: how often users hit it, how many click through, how many upgrade, and how many churn within 30 days.

## What to measure

- **Gate encounter rate**: percent of users on each plan who hit a given gate in a period.
- **Gate-to-upgrade conversion rate**: upgrades divided by gate encounters, tracked per feature.
- **Post-gate churn rate**: 30-day churn for users who hit a gate versus users who did not.

## Best practices

- Gate features users grow into, not features they expect. Gating data export or a second login feels punitive. Gating custom reports, API access, or advanced permissions feels fair.
- Show the feature instead of a lock icon. A blurred report, sample dashboard, or read-only preview explains the value better than an upgrade button alone.
- Review gates every quarter. If a gate converts poorly and correlates with churn, move the feature down a tier or remove the gate.

## Common pitfalls

- Too many gates on the base plan. If starter users hit a wall every time they try something, the product feels like a demo.
- Relying on gates as the only upgrade message. Explain the value of higher plans during onboarding, in-app, and by email too.
- Gating sharing, collaboration, or referral features. These bring in new users. Keep them free and gate the features that deepen individual use.
