---
layout: ../../../../layouts/Layout.astro
title: "Feature-Unlock Invites"
description: "Gating premium features behind invite-a-friend mechanics to drive organic user acquisition."
headingTracker: false
---
# Feature-Unlock Invites

Feature-unlock invites gate access to desirable product features behind a requirement to invite friends. Instead of paying for premium features, users "pay" with referrals. Dropbox pioneered this by gating storage space behind referrals, and modern SaaS products frequently gate advanced features, increased usage limits, or premium templates behind invite counts. The mechanic works because it ties acquisition directly to product value — users are motivated by something they already want.

## Core Concept

Traditional referral programs offer external rewards (cash, credits) that are disconnected from the product experience. Feature-unlock invites are superior because the reward IS the product — users invite friends to get more of what they already love using. This creates a tighter feedback loop: the more someone uses the product, the more they want the locked feature, the more motivated they are to invite, the more new users join and experience the same loop. It is virality built into the product architecture itself.

## Implementation

1. Identify which features to gate by analyzing user behavior data — find features that are highly desired (users attempt to access them), clearly valuable (users who have access use them frequently), but not essential for the core experience (gating a critical feature punishes users and creates resentment instead of motivation).
2. Design the unlock mechanic with clear, visible progress: a persistent UI element showing "Invite 3 friends to unlock [Feature Name]" with a progress bar, a one-click invite flow (email, link copy, or direct messaging), and instant feature activation when the invite threshold is met.
3. Set invite thresholds based on the feature's value and your target viral coefficient — low-value features should require 1-2 invites (easy wins that establish the behavior), medium-value features should require 3-5 invites, and high-value features should require 5-10 invites or offer a paid alternative.
4. Define what counts as a "successful" invite — a clicked link is too easy to game, an account creation is the minimum viable threshold, and an active user (completed onboarding or performed a key action) is the gold standard for preventing gaming while ensuring quality referrals.
5. Always offer a paid bypass option alongside the invite mechanic — some users will prefer to pay rather than invite, and blocking that path leaves revenue on the table while frustrating users who cannot or do not want to share.

## Key Metrics

- **Feature Unlock Rate** — the percentage of users who encounter the gate and successfully complete enough invites to unlock the feature (benchmark: 15-30% for well-designed gates)
- **Invites Sent per User** — the average number of invitations sent by users who encounter the gate, which indicates how desirable the locked feature is and how frictionless the invite flow is
- **Invited User Activation Rate** — the percentage of invited users who sign up AND reach the product's activation milestone, ensuring you are acquiring quality users rather than empty accounts

## Best Practices

- Show a preview or teaser of the locked feature in context — let users see what they are missing (blurred content, a demo mode, a "try once for free" interaction) rather than just telling them it exists behind a lock icon
- Trigger the feature-unlock prompt at moments of high engagement when the user naturally encounters the feature's value — not during onboarding when they have not yet experienced the core product
- Celebrate the unlock moment with a satisfying UX interaction (animation, confetti, congratulations message) to reinforce the behavior and make the user feel accomplished

## Common Pitfalls

- Gating features that are core to the product's basic value proposition, which makes the product feel crippled rather than motivating — if users cannot get value from the product without inviting, they will churn before ever inviting anyone
- Making the invite threshold so high that most users give up — if fewer than 15% of users who encounter the gate ever achieve the unlock, your threshold is too high or the locked feature is not desirable enough
- Not accounting for invite fraud — users will create fake accounts, use burner emails, or invite themselves from alternate devices if the reward is valuable enough; require meaningful actions from invited users before counting them
