---
layout: ../../../../layouts/Layout.astro
title: "In-App Messaging"
description: "Messages shown inside the product to drive feature adoption, upgrades, and retention."
---
# In-App Messaging

In-app messages reach users while they are using your product, through banners, modals, tooltips, slideouts, or embedded cards. They can react to what the user is doing right now, which email and push cannot.

## How it works

In-app messaging connects marketing to the product experience. A tooltip shown next to an unused feature is more useful than an email about that feature sent days later. The value is context: the right message at the right moment in the workflow, without getting in the way.

## How to do it

1. Map key user actions and non-actions to message types. Use tooltips for feature discovery, modals for major announcements and upgrade prompts, banners for status and promotions, and slideouts for surveys.
2. Give every message a specific behavioral trigger, such as "created a fifth report" or "reached 80% of plan limit."
3. Define the audience with product usage data, for example new users in their first week, active users who have never tried a feature, or free users near a limit. Add plan or account data for B2B.
4. Choose the least disruptive format that works. Never show a modal during checkout, editing, or another active task.
5. Set frequency caps: for example, at most one modal per session and a cooldown before a dismissed message can return.
6. Coordinate with email, push, and SMS in one messaging platform so users do not get the same prompt on two channels.

## What to measure

- **Impression-to-action rate**: users who take the target action after seeing the message, divided by users who saw it.
- **Feature adoption rate**: targeted users who try the feature within seven days of seeing the message.
- **Dismissal rate**: users who close the message without engaging, divided by users who saw it.

## Best practices

- Trigger on behavior, not on calendar days since signup.
- Escalate gradually: start with a badge or dot, then a tooltip, and use a modal only for critical messages.
- Test timing. An upgrade prompt shown before a user hits a limit can perform very differently from one shown after.
- Use a "Show me" button that takes the user straight to the feature, not a link to a help article.

## Common pitfalls

- Using in-app space for ads. Users learn to ignore every message, including useful ones.
- Showing beginner tooltips to experienced users. Segment by usage.
- Prompting users to do something they already did after an email. It makes the product look broken.
