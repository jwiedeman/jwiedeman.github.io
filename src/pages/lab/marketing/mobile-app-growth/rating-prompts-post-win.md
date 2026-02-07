---
layout: ../../../../layouts/Layout.astro
title: "Rating Prompts Post-Win"
description: "Strategically prompting app store ratings after positive user experiences to maximize favorable reviews."
headingTracker: false
---
# Rating Prompts Post-Win

Rating prompts post-win is the strategy of triggering app store rating requests immediately after a user experiences a positive moment in your app — completing a milestone, achieving a goal, receiving a compliment, finishing a level, or having a successful interaction. The timing is everything: the same user who would give you 3 stars when randomly prompted during a neutral moment will give you 5 stars when prompted right after a win. This is the single most effective tactic for improving your app's average rating and review volume.

## Core Concept

App store ratings are a critical growth lever — apps with 4.5+ star ratings convert store listing views to installs at 2-3x the rate of apps rated 3.5 or below, and ratings directly influence app store search rankings. The challenge is that unhappy users leave reviews proactively while happy users do not, creating a natural negativity bias. Post-win prompts solve this by catching happy users at their moment of peak satisfaction and channeling that positive emotion directly into a rating. You are not gaming the system — you are simply ensuring your rating reflects the experience of your satisfied users, not just your dissatisfied ones.

## Implementation

1. Identify your app's "win moments" by listing every positive event a user can experience — completing a workout, hitting a savings goal, finishing a lesson, getting a match, receiving positive feedback, earning a badge, reaching a streak milestone, successfully completing a task, or receiving a delivery confirmation.
2. Implement Apple's SKStoreReviewController (iOS) or Google's In-App Review API (Android) to trigger the native rating dialog — these APIs show the system's standard rating prompt, which is more trusted than custom-built prompts and complies with store guidelines. Note that iOS limits display to 3 times per 365-day period per user, so your trigger selection must be strategic.
3. Build a pre-prompt gate that asks "Are you enjoying [App Name]?" before triggering the official store rating dialog — if the user says yes, show the store rating prompt; if they say no, route them to an in-app feedback form instead. This filters unhappy users away from the store review and toward your support team where you can resolve their issue.
4. Configure trigger rules with qualifying conditions: the user must have been active for at least 7 days (ensuring they have real experience to rate), must have completed the win moment in the current session (recency matters), and must not have been prompted in the last 90 days (even though iOS allows every 122 days, less frequent prompting produces higher response quality).
5. Track the impact of each win-moment trigger on rating distribution — some moments produce higher average ratings than others (e.g., post-milestone might average 4.8 stars while post-purchase averages 4.2 stars), and you should prioritize triggers that produce the highest average rating within your limited prompt budget.

## Key Metrics

- **Average Star Rating** — your app's current average rating in the store, tracked weekly, with a target of 4.5+ stars; each 0.1-star improvement produces measurable increases in conversion rate and keyword rankings
- **Rating Prompt Response Rate** — the percentage of users who see the rating prompt and actually submit a rating (benchmark: 15-25% for well-timed post-win prompts, compared to 5-10% for randomly timed prompts)
- **Review Sentiment Ratio** — the ratio of 4-5 star reviews to 1-3 star reviews, which should be at least 4:1 if your win-moment timing is working; a lower ratio indicates your triggers are not selecting truly positive moments

## Best Practices

- Time the prompt to appear 2-5 seconds after the win moment, not immediately — let the user enjoy the positive feeling for a beat before the prompt appears; immediate prompts feel like they interrupt the celebration
- Use the pre-prompt soft-ask ("Enjoying the app?") to both filter sentiment and create a micro-commitment — a user who actively says "Yes, I enjoy this" and then sees the rating dialog is psychologically primed to follow through with a high rating
- Rotate your win-moment triggers across the user lifecycle — prompt after the first major milestone for new users (capturing excitement), after a personal best for active users (capturing pride), and after a loyalty reward for long-term users (capturing appreciation)

## Common Pitfalls

- Prompting for ratings during neutral or negative moments (mid-task, after an error, during a loading screen) which produces low ratings and teaches users to associate your app with annoyance
- Using a custom-built rating dialog instead of the native system API, which violates both Apple and Google store guidelines and can result in your app being flagged or removed
- Showing the rating prompt too frequently, which wastes your limited prompt budget (iOS limits) and annoys users who have already rated or dismissed — always check whether the user has already rated before showing the prompt
