---
layout: ../../../layouts/Layout.astro
title: "Meta Ads Playbook"
description: "Setup guide for Meta ads on Facebook, Instagram, Messenger, and Audience Network, including Advantage+ campaigns and the Conversions API."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">

[← Ads lab](/lab/ads/)

# Meta Ads Playbook

How to set up, track, and run Meta ads across Facebook, Instagram, Messenger, and Audience Network.

## Account structure

- Own the Business portfolio (Meta Business Suite) yourself. Give agencies partner access instead of handing over accounts.
- Verify your domain in Business settings.
- Keep campaign count low. Fewer campaigns and ad sets give each one more conversion data.
- Use a consistent naming pattern, for example `Geo-Objective-Audience-Offer`.

## Tracking and measurement

- Install the Meta Pixel and the Conversions API. Use the Conversions API Gateway or a server-side integration.
- Send the same `event_id` from the pixel and the server so Meta can deduplicate events.
- Check Event Match Quality in Events Manager. Send hashed email and phone where you have consent.
- Optimize for the event closest to revenue that still fires often enough.
- Confirm events with the Test Events tool before launch.
- Validate results with a holdout, conversion lift, or geo test. Do not rely only on in-platform attribution.

## Campaign types

| Objective | Use it for |
| --- | --- |
| Sales | Purchases and other web or app conversions. Advantage+ sales campaigns automate audience, placement, and creative. |
| Leads | Instant forms, Messenger, calls, or website leads. |
| App promotion | Installs and in-app events. |
| Traffic | Clicks to a site or app when conversions are too rare to optimize for. |
| Engagement | Video views, messages, and post engagement. |
| Awareness | Reach and frequency. |

## Targeting

- Start with Advantage+ audience. Add your customer lists and site visitors as suggestions.
- Use lookalike audiences built from your best customers or highest-value purchasers.
- Use detailed targeting only if it beats broad targeting in a direct test.
- Exclude recent purchasers where repeat purchase is unlikely.
- Leave Advantage+ placements on unless a placement is a brand safety problem.

## Creative

- Supply square (1:1), vertical (4:5 and 9:16), and landscape versions.
- Keep text and logos out of the top and bottom of 9:16 assets so Reels and Stories UI does not cover them.
- Add captions to every video. Many people watch without sound.
- Test several distinct concepts, not small variations of one.
- Review Advantage+ creative enhancements before turning them on. Turn off any that change your brand or claims.
- Keep a shared log of which hooks, offers, and formats won.

## Budget and bidding

- Use Advantage campaign budget to let Meta move spend between ad sets. Use ad set budgets for strict tests.
- An ad set exits the learning phase after about 50 optimization events in a week. Size budgets so each ad set can reach that.
- Start on highest volume or highest value. Add a cost per result goal or ROAS goal only when you have a firm target.
- Avoid large edits while an ad set is learning. Big changes restart learning.

## Review cadence

- **Daily:** spend, delivery errors, and rejected ads.
- **Twice a week:** learning phase status and frequency.
- **Weekly:** creative results; pause losers and add new concepts.
- **Monthly:** lift or holdout results; adjust targets.

## Pre-launch checklist

- [ ] Domain verified.
- [ ] Pixel and Conversions API both firing, with deduplication confirmed in Events Manager.
- [ ] Optimization event selected and receiving data.
- [ ] Catalog connected and synced (if selling products).
- [ ] Custom audiences and exclusions built.
- [ ] Creative in every needed aspect ratio, with captions and safe zones checked.
- [ ] UTM parameters on all URLs.
- [ ] Spending limit or automated rules set for overspend.

</div>
