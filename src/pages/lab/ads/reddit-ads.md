---
layout: ../../../layouts/Layout.astro
title: "Reddit Ads Playbook"
description: "Setup guide for Reddit ads, community targeting, comment moderation, the Reddit Pixel, and the Conversions API."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">

[← Ads lab](/lab/ads/)

# Reddit Ads Playbook

How to set up, track, and run Reddit ads. Ads show in feeds and in comment threads, and people can reply to them, so plan for comments.

## Account structure

- Give each campaign one objective.
- Split prospecting and retargeting into separate ad groups.
- Use a consistent naming pattern, for example `Objective-Community-Creative-Version`.

## Tracking and measurement

- Install the Reddit Pixel directly or through Google Tag Manager.
- Add the Reddit Conversions API for server-side events. Send a matching event ID from both to deduplicate.
- Map standard events, such as PageVisit, ViewContent, AddToCart, Purchase, Lead, and SignUp.
- Check events in Events Manager before launch.
- Add UTM parameters to every destination URL.

## Campaign types

| Objective | Use it for |
| --- | --- |
| Brand awareness and reach | Impressions to a defined audience. |
| Traffic | Clicks to your site. |
| Conversions | Actions tracked by the pixel, including catalog sales with dynamic product ads. |
| Video views | Video reach. |
| App installs | Installs and in-app events. |

## Targeting

- Target communities (subreddits) that discuss your category.
- Use keyword targeting to reach people reading related posts.
- Use interest targeting to scale after community targeting works.
- Build custom audiences from site visitors and customer lists, and lookalikes from them.
- Read each community's rules before you advertise there.

## Creative

- Write like a person in the community. Plain, direct copy works better than polished ad language.
- Test text, image, and video posts. Some communities prefer text.
- Keep video short and add on-screen text. Many people watch without sound.
- Decide whether to allow comments. If you allow them, someone must read and answer them.

## Budget and bidding

- Use automatic bidding to start. Move to a cost cap or manual bid when you know your target cost.
- Narrow community targeting can limit delivery. Widen it if the budget does not spend.

## Review cadence

- **Daily:** comments and sentiment. Escalate problems to community or PR teams.
- **Weekly:** results by community and creative; adjust bids and rotate ads.
- **Monthly:** compare cost per result with other channels; review brand safety settings.

## Pre-launch checklist

- [ ] Pixel and Conversions API verified, with deduplication.
- [ ] Rules checked for each target community.
- [ ] Comment moderation owner and escalation steps agreed.
- [ ] Brand safety and suitability settings chosen.
- [ ] UTM parameters on all URLs.
- [ ] Budgets and spend alerts set.

</div>
