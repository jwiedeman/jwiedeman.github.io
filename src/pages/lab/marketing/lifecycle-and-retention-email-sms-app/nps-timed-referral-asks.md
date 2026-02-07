---
layout: ../../../../layouts/Layout.astro
title: "NPS-Timed Referral Asks"
description: "Triggering referral requests immediately after customers give positive NPS scores to maximize advocacy."
headingTracker: false
---
# NPS-Timed Referral Asks

NPS-timed referral asks leverage the moment a customer gives you a high Net Promoter Score (9 or 10) to immediately present a referral opportunity. This is the single highest-converting moment to ask for a referral because the customer has just explicitly stated they would recommend you. Converting that stated intent into action while the sentiment is fresh generates 3-5x more referrals than generic referral program emails sent at random times.

## Core Concept

The gap between referral intent and referral action is where most referral programs fail. Surveys show that 83% of satisfied customers say they are willing to refer, but only 29% actually do. The problem is timing — by the time you send a referral email days or weeks later, the emotional peak has passed. NPS-timed referral asks close this gap by presenting the referral mechanism at the exact moment of expressed enthusiasm. The customer just told you they love your product and you respond with "here is an easy way to share it."

## Implementation

1. **Set up NPS survey automation:** Deploy an NPS survey at a meaningful moment — after onboarding completion, after the third purchase, or at 30/90/365-day intervals. Use an in-app survey, email, or SMS. The survey must capture the score in real-time and trigger an immediate follow-up.
2. **Build the branching logic:** Scores of 9-10 (Promoters) trigger the referral ask. Scores of 7-8 (Passives) trigger a "what would make us a 10?" follow-up. Scores of 0-6 (Detractors) trigger a support outreach or feedback collection flow. Each branch should fire within seconds of the response, not hours.
3. **Design the referral ask for Promoters:** The message should arrive within 60 seconds of the NPS submission. Thank them for the score, acknowledge their positive experience, and present the referral with zero friction: a pre-written shareable message, a unique referral link, and a clear reward for both referrer and friend.
4. **Offer a compelling dual-sided incentive:** Give both the referrer and the referred friend a reward. The most effective structures are "$20 for you, $20 for your friend" or "Give a friend their first month free, get a free month yourself." Dual-sided incentives convert 2x better than referrer-only rewards.
5. **Follow up on unused referral links:** If a Promoter received a referral link but has not shared it after 7 days, send a gentle reminder with a different sharing angle — "Share via text," "Post on LinkedIn," or "Forward this email." Many Promoters intend to share but forget.

## Key Metrics

- **Promoter-to-Referrer Conversion Rate** — percentage of NPS Promoters who actually share a referral link; benchmark is 15-25% with an immediate ask vs. 3-5% with a delayed generic email
- **Referral Completion Rate** — percentage of shared referral links that result in a new customer signup or purchase; healthy range is 10-20% of shares
- **Referred Customer LTV** — lifetime value of customers acquired through NPS-timed referrals vs. other channels; referred customers typically have 16-25% higher LTV

## Best Practices

- Make sharing frictionless — pre-populate the referral message, auto-generate the link, and offer multiple sharing channels (email, SMS, social, copy link) in one click
- Show the Promoter their referral impact over time — "You have referred 3 friends who are all still active customers" reinforces the behavior and encourages more referrals
- Customize the referral message based on the product or feature the customer uses most — a referral that says "I use [Product] for [specific use case] and love it" converts better than a generic endorsement
- Send the referral ask as a reply to the NPS survey email (same thread) rather than a separate email — this contextualizes the ask and feels like a natural conversation

## Common Pitfalls

- Asking for referrals from Detractors or Passives — this not only fails to generate referrals but actively annoys customers who just told you they are not fully satisfied
- Delaying the referral ask by more than 24 hours — the emotional peak of a 9 or 10 NPS score decays rapidly. Same-day follow-up is essential; next-day is acceptable; next-week is too late.
- Making the reward too small to motivate action — a 5% discount is not enough to make someone go through the social effort of recommending a product. The incentive needs to feel genuinely generous.
