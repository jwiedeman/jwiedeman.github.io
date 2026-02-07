---
layout: ../../../../layouts/Layout.astro
title: "Feature Gating"
description: "Gating features behind plans and tiers to drive upgrades while maintaining a satisfying base experience."
headingTracker: false
---
# Feature Gating

Feature gating is the practice of restricting access to specific product features based on the customer's subscription plan, tier, or payment level. It is the mechanical backbone of tiered pricing — the feature gates define what each tier actually means. Done well, gating creates a natural upgrade path where customers move to higher tiers because they genuinely need the gated capability. Done poorly, it creates frustration, perception of being nickeled-and-dimed, and churn to competitors who offer more at the same price.

## Core Concept

Feature gating works because not all features deliver equal value to all users. A solopreneur needs basic email marketing; an enterprise team needs multi-user permissions, advanced analytics, and SSO. Gating allows you to price-discriminate based on value received: customers who get more value pay more, and customers with simpler needs pay less. The critical design principle is that the gate should align with value, not with effort. Gates should feel like a natural consequence of growing needs, not like an artificial wall placed to extract money. The best gates are ones where the customer thinks "Of course that is on the higher tier — I would expect to pay more for that."

## Implementation

1. Categorize every feature in your product into three buckets: core (must be available on every tier to deliver the base value proposition), differentiating (features that separate tiers and drive upgrades), and delight (features that surprise and create loyalty, typically kept free). Aim for 60% core, 30% differentiating, 10% delight.
2. Map differentiating features to natural upgrade triggers. The best gated features are ones that users discover they need as their usage matures: team collaboration features gate at team size, advanced analytics gate at data volume, automation gate at workflow complexity, and integrations gate at ecosystem maturity. Each gated feature should correspond to a measurable moment of growing value.
3. Design the gate experience itself. When a user encounters a gated feature, show them: what the feature does (brief description or screenshot), which tier unlocks it, and a one-click path to upgrade or start a trial of the higher tier. Never show a blank wall or error message — the gate is a marketing moment. Some teams offer a "try this feature for 7 days" preview to let users experience the value before committing.
4. Implement usage-based soft gates where appropriate. Instead of a hard lock ("You cannot use this feature"), consider a trial allowance ("You have 3 free uses of this feature this month — upgrade for unlimited"). Soft gates let users experience the value, which dramatically increases conversion compared to hard gates where the user never sees what they are missing.
5. Monitor gate interaction data: how often users encounter each gate, what percentage click through to the upgrade page, what percentage actually upgrade, and what percentage of users who encounter a gate churn within 30 days. Gates with high encounter rates but low conversion and high churn are actively harmful — they frustrate users without driving revenue.

## Key Metrics

- **Gate encounter rate** — percentage of users on each tier who encounter a feature gate during a given period, indicating whether gated features are relevant to the current user base
- **Gate-to-upgrade conversion rate** — percentage of gate encounters that result in an upgrade, measured per feature to identify which gates are effective upgrade drivers versus which are friction points
- **Post-gate churn rate** — percentage of users who churn within 30 days of encountering a feature gate, compared to users who do not encounter gates, measuring whether gating is pushing users away

## Best Practices

- Gate features that users discover they need, not features that users expect to have. Gating basic functionality (like exporting your own data or using more than one user account) feels punitive. Gating advanced functionality (like custom reporting, API access, or advanced permissions) feels like a natural premium.
- Use "show, don't tell" gates. Instead of a locked icon, show the feature in a read-only or preview mode so the user can see the output (blurred report, sample dashboard, preview of the automated workflow) and understand the value. This converts at 2-3x the rate of a simple lock icon with an upgrade CTA.
- Review and adjust gates quarterly based on the data. If a gated feature has a 0.5% conversion rate and high churn correlation, consider moving it to a lower tier or ungating it entirely. Feature gates are not permanent — they should evolve with your product and market.

## Common Pitfalls

- Gating too many features on the base tier. If free or starter users hit a gate every time they try something new, the base experience feels like a demo, not a product. Keep the base tier genuinely useful for its target user — gates should only appear when that user outgrows the tier.
- Using feature gating as the sole upgrade driver without communicating the overall value of higher tiers. If the only time users hear about the next tier is when they hit a wall, upgrades feel reactive and grudging. Complement gating with proactive communication about the benefits of higher tiers through onboarding, in-app messaging, and email.
- Gating features that create network effects or viral loops. If sharing, collaboration, or referral features are gated, you are throttling your own growth engine. Features that bring in new users should always be free, even if you gate the features that deepen individual usage.
