---
layout: ../../../../layouts/Layout.astro
title: "Push Notification Cadences"
description: "Set push notification frequency, timing, and content to bring users back without driving opt-outs."
---
# Push Notification Cadences

Push cadence is how often, when, and with what content you send push notifications. Push reaches the lock screen at no media cost, which makes it a strong re-engagement channel. Sent too often, it drives users to turn notifications off or uninstall.

## How it works

Each push can bring a user back or annoy them. The right cadence is the point where one more notification per week still does more good than harm. That point depends on the category. People expect frequent alerts from a news app and far fewer from a fitness app. Find your own limit through testing and stay under it.

## How to do it

1. Audit your current state: notifications per user per week, open rate, opt-out rate, and how volume relates to 7-day retention.
2. Segment by engagement. Daily users, weekly users, and dormant users (no session in 7+ days) each get a different frequency and message type.
3. Rank every notification type. P0: transactional (receipts, security alerts), always send. P1: high-value triggers (a new message, order shipped, goal reached). P2: behavioral nudges (streaks, suggestions). P3: promotional (sales, new features). Set a cap for each level.
4. Time sends to each user's usual activity window. Tools such as OneSignal, Braze, and Airship offer per-user send-time optimization.
5. Test frequency. Give groups different weekly caps (for example, 2, 4, and 7) and compare opens, sessions, opt-outs, and 30-day retention over several weeks.

## What to measure

- **Opt-in rate**: share of users who allow notifications. iOS and Android 13+ both require an explicit permission prompt.
- **Open rate**: taps divided by delivered notifications, per notification type.
- **Opt-out rate**: share of push-enabled users who disable notifications each month.

## Best practices

- Ask for permission in context, after the user has seen value, and say what they will get: "Turn on notifications to know when your order ships." A denied system prompt is hard to recover from.
- Personalize with the user's own data. "You're 1 workout away from your weekly goal" beats "Don't forget to work out."
- Set a global daily cap across all notification types so several campaigns cannot fire at once.

## Common pitfalls

- Sending the same cadence to everyone. Daily users do not need "come back" messages.
- Relying on broadcast promotions instead of messages triggered by what the user did.
- Watching only retention. Opt-out rate rises first. Treat it as the early warning.
