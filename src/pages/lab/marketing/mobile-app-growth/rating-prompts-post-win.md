---
layout: ../../../../layouts/Layout.astro
title: "Rating Prompts Post-Win"
description: "Ask for app store ratings right after users have a good moment in your app."
---
# Rating Prompts Post-Win

Post-win rating prompts ask for a store rating right after something good happens in the app: a goal reached, a lesson finished, a level completed, a delivery confirmed. Timing matters. The same user gives a better rating after a win than during a neutral moment.

## How it works

Ratings affect both store conversion and search ranking. Unhappy users leave reviews on their own. Happy users usually do not. That skews ratings downward. Prompting at a moment of satisfaction gets ratings from the people who are getting value, so the score better reflects the whole user base.

## How to do it

1. List your app's win moments: finishing a workout, hitting a savings goal, completing a lesson, earning a badge, reaching a streak, or a successful order.
2. Use the native APIs: StoreKit's `requestReview` on iOS and the Google Play In-App Review API on Android. Apple shows the prompt at most 3 times per user in 365 days. Google Play applies its own quota. The system may not show the prompt every time you call it.
3. Set trigger rules. Require some tenure (for example, 7 days of use), a win in the current session, and no prompt in the recent past.
4. Do not ask "Are you enjoying the app?" first and only send happy users to the store. Google Play's policy prohibits asking questions before the review card, and both stores discourage review gating. Offer a separate, always-visible feedback option in settings instead.
5. Compare triggers. Track rating volume and average rating after each win moment, and keep the triggers that perform best within the limited prompt budget.

## What to measure

- **Average star rating**: current store rating, tracked weekly in App Store Connect and Play Console.
- **Ratings per prompt request**: new ratings divided by prompt calls, per trigger.
- **Rating distribution**: share of 4 to 5 star ratings versus 1 to 3 star ratings over time.

## Best practices

- Wait a moment after the win before prompting. Let the user see the result first.
- Rotate triggers by lifecycle stage: first milestone for new users, personal bests for active users, loyalty rewards for long-term users.
- Make in-app feedback and support easy to find, so frustrated users have a place to go other than the store.

## Common pitfalls

- Prompting mid-task, after an error, or on a loading screen.
- Building a custom star dialog that mimics the store. Use the native APIs.
- Calling the prompt on every session. It wastes the quota and annoys users.
