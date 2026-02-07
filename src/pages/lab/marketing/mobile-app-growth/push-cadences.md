---
layout: ../../../../layouts/Layout.astro
title: "Push Notification Cadences"
description: "Optimizing push notification frequency, timing, and content to drive engagement without causing opt-outs."
headingTracker: false
---
# Push Notification Cadences

Push notification cadence optimization is the practice of finding the right frequency, timing, and content strategy for push notifications that maximizes engagement (app opens, actions taken) while minimizing negative outcomes (notification opt-outs, uninstalls). Push notifications are one of the most powerful re-engagement channels — they reach users on their lock screen with zero media cost — but they are also the fastest way to lose users when overused. Getting the cadence right is the difference between a retention engine and a churn accelerator.

## Core Concept

Every push notification exists in tension between two outcomes: bringing a user back into the app (positive) and annoying them into disabling notifications or uninstalling (negative). The optimal cadence is the frequency at which the marginal value of one more notification per week is still positive. This varies dramatically by app category — a news app can send 5-10 notifications per day because users expect real-time updates, while a fitness app sending more than 3-4 per week will see opt-out spikes. The key is to find your specific threshold and stay below it.

## Implementation

1. Establish a baseline by auditing your current push notification volume, timing, and performance — calculate your current notifications per user per week, opt-out rate, open rate per notification, and the correlation between notification volume and 7-day retention to understand where you stand.
2. Segment users into push notification cohorts based on engagement level: highly active users (daily sessions) can tolerate higher frequency, moderately active users (weekly sessions) need moderate frequency, and dormant users (no sessions in 7+ days) need carefully crafted re-engagement messages at low frequency.
3. Build a notification priority framework that categorizes every notification type: P0 (transactional, always send — purchase confirmations, security alerts), P1 (high-value triggers — someone messaged them, their order shipped, their goal was reached), P2 (behavioral nudges — streak reminders, activity suggestions), P3 (promotional — sales, new features, content recommendations). Set frequency caps per priority level.
4. Optimize send times using your app's session data — identify when each user is most likely to open the app (their natural usage window) and schedule notifications 15-30 minutes before that window. Tools like OneSignal, Braze, and Airship offer "Intelligent Delivery" features that automate per-user send-time optimization.
5. Run frequency experiments by creating test groups with different weekly notification caps (e.g., 2 per week vs. 4 per week vs. 7 per week) and measuring the impact on open rate, app sessions, opt-out rate, and 30-day retention over a 4-week period — this reveals your specific optimal frequency threshold.

## Key Metrics

- **Push Opt-In Rate** — the percentage of users who allow push notifications (benchmark: 50-60% on Android where it is default-on, 40-50% on iOS where users must explicitly opt in), which determines the size of your push-reachable audience
- **Open Rate per Notification** — the percentage of delivered notifications that are tapped (benchmark: 5-15% depending on category and personalization), which measures content relevance and timing accuracy
- **Opt-Out Rate** — the percentage of push-enabled users who disable notifications per month (target: below 2% monthly), which is the critical health metric that signals whether you are over-notifying

## Best Practices

- Ask for push permission at a contextual moment, not during onboarding — on iOS, the permission prompt is a one-shot opportunity; trigger it after the user has experienced value and in a context where the notification's benefit is obvious ("Enable notifications to get updates when your order ships")
- Personalize notification content with the user's name, their specific data, or their recent activity — "Sarah, you're 1 workout away from your weekly goal" outperforms "Don't forget to work out today" by 2-3x on open rate
- Implement a global frequency cap (e.g., maximum 4 notifications per user per day across all notification types) that prevents notification stacking from multiple triggered campaigns firing simultaneously

## Common Pitfalls

- Treating all users identically with the same notification cadence — a user who opens your app daily does not need a daily "come back" notification, while a user who has not opened in 2 weeks needs a different approach than both; segment by engagement level
- Sending purely promotional notifications (sales, new features) without behavioral triggers — notifications that are relevant to the user's specific context and actions get 3-5x higher open rates than broadcast promotions
- Not monitoring opt-out rates as a leading indicator of notification fatigue — by the time you see retention drop, you have already lost a significant portion of your push-reachable audience; opt-out rate spikes are the early warning signal
