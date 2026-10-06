---
layout: ../../../../layouts/Layout.astro
title: "One-Tap & Autofill"
description: "Cut typing with one-tap sign-in, browser autofill, and pre-filled fields."
---
# One-Tap & Autofill

One-tap sign-in and autofill shrink signup, login, and checkout from minutes of typing to a tap or two. Google One Tap, Sign in with Apple, browser autofill, wallet payments, and pre-filled fields all solve the same problem: every field a person types by hand is a chance to quit.

## How it works

Less effort means more completions. One-tap and autofill remove manual typing almost entirely. With Google One Tap, a user signed in to Google can create an account with one tap: no typed email, no new password, no verification step.

## How to do it

1. Add Google One Tap using the Google Identity Services library.
2. Add Sign in with Apple. Apple requires it in iOS apps that offer other third-party logins.
3. Add the correct `autocomplete` attribute to every remaining field, for example `name`, `email`, `street-address`, `cc-number`.
4. Pre-fill any data you already have. If a visitor came from an email link, fill in their email.
5. Ask only for essentials at signup. Collect role, company, and phone later, once the user is active.
6. Add wallet payments at checkout: Apple Pay, Google Pay, Shop Pay, PayPal.

## What to measure

- **Form completion rate**: Share of users who start and submit the form, before and after the change.
- **Time to complete**: Median time from first field focus to submit.
- **One-tap share**: Share of new signups that use one-tap or social login instead of email and password.

## Best practices

- Put one-tap and wallet options above the email and password form.
- Test autofill in Chrome, Safari, Firefox, and Edge, on desktop and mobile. Behavior differs by browser.
- Let new users in right away and verify email in the background, or use the verified email from Google or Apple.

## Common pitfalls

- Using custom input components that hide the attributes browsers rely on, which breaks autofill.
- Forcing email verification before first use after a one-tap signup. This undoes the benefit.
- Testing only on desktop. Typing on a phone is the slowest input, so autofill matters most there.
