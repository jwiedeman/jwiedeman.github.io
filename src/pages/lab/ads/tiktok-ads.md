---
layout: ../../../layouts/Layout.astro
title: "TikTok Ads Playbook"
description: "Setup guide for TikTok ads, Spark Ads, creator content, the TikTok Pixel, and the Events API."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">

[← Ads lab](/lab/ads/)

# TikTok Ads Playbook

How to set up, track, and run TikTok ads. Results depend mostly on a steady supply of new video.

## Account structure

- Manage ad accounts inside TikTok Business Center.
- Give each campaign one objective and one optimization event.
- Use a consistent naming pattern, for example `Objective-Audience-Offer-Version`.

## Tracking and measurement

- Install the TikTok Pixel directly or through Google Tag Manager.
- Add the Events API for server-side events. Send the same `event_id` from both so TikTok can deduplicate.
- Turn on advanced matching to send hashed email and phone where you have consent.
- Map standard events, such as ViewContent, AddToCart, PlaceAnOrder, CompletePayment, and SubmitForm.
- Test events in Events Manager before launch.
- Check results with a lift study or holdout when spend is large enough.

## Campaign types

| Objective | Use it for |
| --- | --- |
| Reach | Awareness at the lowest cost per impression. |
| Traffic | Clicks to a site or app. |
| Video views | Views of a specific video. |
| Community interaction | Follows and profile visits. |
| App promotion | Installs and in-app events. |
| Lead generation | Instant forms or website leads. |
| Sales | Website conversions and catalog sales. |

Smart+ campaigns automate targeting, bidding, and creative selection. Test them against a manual campaign.

## Targeting

- Start broad. TikTok finds buyers from creative and conversion signals.
- Add custom audiences (site visitors, customer lists, video viewers) for retargeting and exclusions.
- Build lookalike audiences from purchasers or high-value leads.
- Use interest and behavior targeting only if it beats broad in a test.

## Creative

- Shoot vertical 9:16 video that looks native to TikTok.
- Show the product or the main point in the first seconds.
- Use captions and on-screen text. Keep text out of the areas covered by the app UI.
- Use Spark Ads to run organic posts from your account or from creators. Collect authorization codes from creators.
- Find creators through TikTok One or an agency. Put usage rights and their duration in the contract.
- Plan new creative every week. Ads wear out fast.

## Budget and bidding

- Bid strategies include maximum delivery, cost cap, and minimum ROAS.
- An ad group needs about 50 conversions in a week to exit the learning phase. Size budgets for that, or optimize for a higher-volume event.
- Avoid large edits during learning.

## Review cadence

- **Daily:** spend, learning status, and cost per result.
- **Weekly:** creative results (hook rate, watch time); replace weak ads.
- **Monthly:** lift results and creator performance.

## Pre-launch checklist

- [ ] Pixel and Events API firing, with deduplication confirmed.
- [ ] Optimization event receiving data.
- [ ] Custom audiences and exclusions built.
- [ ] At least several weeks of creative ready.
- [ ] Creator usage rights documented and Spark Ads codes collected.
- [ ] Captions and safe zones checked.
- [ ] UTM parameters on all URLs.
- [ ] Budgets and spend alerts set.

</div>
