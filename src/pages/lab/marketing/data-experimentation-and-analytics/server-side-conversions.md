---
layout: ../../../../layouts/Layout.astro
title: "Server-Side Conversion Tracking"
description: "Send conversion events from your server to ad platforms so tracking holds up when browsers block pixels."
---
# Server-Side Conversion Tracking

Server-side conversion tracking sends conversion events from your server straight to ad platform APIs, such as Meta Conversions API, Google Enhanced Conversions, and TikTok Events API, instead of relying only on browser pixels. Cookie limits, iOS App Tracking Transparency, and ad blockers all reduce what pixels capture. Server-side tracking recovers much of that data, which the platforms use to optimize campaigns.

## How it works

A pixel is JavaScript that runs in the user's browser when a conversion happens. That is becoming less reliable: Safari and Firefox block third-party cookies by default, iOS asks users to opt in to tracking, and ad blockers remove tracking scripts. Server-side tracking sends the event from your backend, which you control, to the platform's server. The browser is not involved, so those blocks do not stop the data. Platforms get better signal for matching, frequency capping, and optimization.

## How to do it

1. Set up each platform's server API and create its credentials (access tokens or API keys).
2. Send the same event ID with both the pixel event and the server event, so the platform can remove duplicates.
3. Hash personal data (email, phone, name) with SHA-256 before sending. The major APIs require this.
4. Send events in near real time. Events delayed by hours are less useful for optimization.
5. Compare server event counts to your own records (database or CRM) and check the match rate in the platform's events manager.

## What to measure

- **Event match rate**: share of server events the platform matches to a user. Read it in the platform's events manager.
- **Conversion recovery**: increase in reported conversions after launch compared with pixel-only tracking.
- **Optimization efficiency**: CPA and ROAS before and after launch.

## Best practices

- Run server-side tracking alongside the pixel, with deduplication, rather than replacing it.
- Send every matching field you can: hashed email, phone, IP address, user agent, and click ID.
- Track every funnel event (page view, add to cart, checkout start, purchase), not only the purchase.

## Common pitfalls

- Skipping deduplication, which double-counts conversions and inflates results.
- Sending unhashed personal data, which breaks platform terms and privacy law.
- Putting it off because it needs engineering time. Each month without it means weaker data for optimization.
