---
layout: ../../../layouts/Layout.astro
title: "Snapchat Ads Playbook"
description: "Setup guide for Snapchat ads, AR Lenses, the Snap Pixel, and the Conversions API."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">

[← Ads lab](/lab/ads/)

# Snapchat Ads Playbook

How to set up, track, and run Snapchat ads. Ads are full-screen vertical video, images, and AR Lenses.

## Account structure

- Manage ad accounts in Snapchat Ads Manager under one business account.
- Give each campaign one objective.
- Run AR Lens campaigns separately from video and image ads.
- Use a consistent naming pattern, for example `Objective-Audience-Placement-Flight`.

## Tracking and measurement

- Install the Snap Pixel directly or through Google Tag Manager. Check it with the Snap Pixel Helper.
- Add the Conversions API for server-side events. Send a matching event ID from both to deduplicate.
- Map standard events, such as PAGE_VIEW, VIEW_CONTENT, ADD_CART, START_CHECKOUT, PURCHASE, and SIGN_UP.
- Set attribution windows on purpose and write them down.
- Add UTM parameters to every destination URL.

## Campaign types

| Objective | Use it for |
| --- | --- |
| Awareness and engagement | Reach, video views, and Lens plays. |
| Traffic | Clicks to a site or app. |
| App promotion | Installs and in-app events. |
| Leads | Instant forms or website leads. |
| Sales | Website conversions and catalog sales. |

## Targeting

- Use Snap's lifestyle and interest categories, location, and demographics.
- Upload customer lists and build lookalike audiences from them.
- Build pixel custom audiences for retargeting site visitors and cart abandoners.
- Start broad and use automatic placements unless you have a reason to limit them.

## Creative

- Video: 9:16, 1080 x 1920. Show the brand and product in the first seconds.
- Add captions or on-screen text.
- Collection ads show a main video or image with product tiles below it. Each tile needs its own URL.
- Dynamic product ads build ads from your catalog.
- AR Lenses are built in Lens Studio and go through Snap review. Test them on real devices.

## Budget and bidding

- Use automatic bidding to start. Add a target cost once you know your goal.
- Set daily budgets at the ad set level and a campaign spend cap.

## Review cadence

- **Daily:** spend, delivery, and cost per pixel event.
- **Weekly:** rotate creative and test Lens variants.
- **Monthly:** compare results with analytics and other channels.

## Pre-launch checklist

- [ ] Snap Pixel and Conversions API verified, with deduplication.
- [ ] Custom and lookalike audiences built.
- [ ] Creative in 9:16 with captions.
- [ ] AR Lens tested on target devices and approved (if used).
- [ ] Brand safety and placement settings chosen.
- [ ] UTM parameters on all URLs.
- [ ] Budgets and spend caps set.

</div>
