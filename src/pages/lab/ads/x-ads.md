---
layout: ../../../layouts/Layout.astro
title: "X Ads Playbook"
description: "Setup guide for awareness and performance campaigns on X (formerly Twitter), including the X Pixel and Conversions API."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">

[← Ads lab](/lab/ads/)

# X Ads Playbook

How to set up, track, and run ads on X (formerly Twitter).

## Account structure

- Give each campaign one objective. Do not mix objectives.
- Use ad groups to split audiences and creative.
- Use a consistent naming pattern, for example `Objective-Audience-Creative-Flight`.

## Tracking and measurement

- Install the X Pixel directly or through Google Tag Manager. Check it with the X Pixel Helper.
- Add the X Conversions API for server-side events.
- Set attribution windows on purpose and write them down, so reports are read the same way each time.
- Add UTM parameters to every destination URL.

## Campaign types

| Objective | Use it for |
| --- | --- |
| Reach | Impressions to as many people as possible. |
| Video views | Video reach and completion. |
| Engagements | Replies, reposts, and likes. |
| Followers | Account growth. |
| Website traffic | Clicks to your site. |
| Website conversions | Actions tracked by the pixel. |
| App installs | Installs and app re-engagement. |

## Targeting

- Use keyword targeting for topics people post about.
- Use follower look-alikes of relevant accounts.
- Upload custom audiences: site visitors, customer lists, and app users.
- Use conversation or event targeting for planned moments. Approve creative ahead of time.

## Creative

- Formats include image, video, carousel, and website cards.
- Keep copy short. Use one clear call to action.
- Limit hashtags. Each one is a link that takes clicks away from your ad.
- Plan who replies to comments and how fast.

## Budget and bidding

- Bid options include automatic bid, target cost, and maximum bid.
- Set a frequency cap on reach campaigns.
- Set daily and total budgets on every campaign.

## Review cadence

- **Daily:** spend, replies, and sentiment. Escalate problems to communications.
- **Weekly:** results by audience and creative; update brand safety lists.
- **Monthly:** compare cost per result with other channels.

## Pre-launch checklist

- [ ] X Pixel and Conversions API events verified.
- [ ] Attribution windows set and recorded.
- [ ] Custom audiences uploaded.
- [ ] Brand safety controls set: sensitivity settings and keyword or account block lists.
- [ ] Third-party verification set up if required.
- [ ] Reply plan reviewed by communications or legal.
- [ ] Budgets and frequency caps set.

</div>
