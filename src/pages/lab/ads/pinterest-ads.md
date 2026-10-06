---
layout: ../../../layouts/Layout.astro
title: "Pinterest Ads Playbook"
description: "Setup guide for Pinterest ads, catalogs and shopping ads, the Pinterest tag, and the Conversions API."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">

[← Ads lab](/lab/ads/)

# Pinterest Ads Playbook

How to set up, track, and run Pinterest ads. People use Pinterest to plan purchases, so ads work best when they look like useful Pins.

## Account structure

- Use a Pinterest business account. Claim your website.
- Give each campaign one objective.
- Keep catalog (shopping) campaigns separate from other campaigns.
- Use a consistent naming pattern, for example `Objective-Audience-Creative-Season`.

## Tracking and measurement

- Install the Pinterest tag directly or through Google Tag Manager. Check it with the Pinterest Tag Helper.
- Add the Conversions API for server-side events. Send a matching event ID from both to deduplicate.
- Map standard events, such as page_visit, add_to_cart, checkout, signup, and lead.
- Set attribution windows on purpose and write them down.
- Add UTM parameters to every destination URL.

## Campaign types

| Objective | Use it for |
| --- | --- |
| Brand awareness | Impressions to a defined audience. |
| Video views | Video reach. |
| Consideration | Clicks to your site. |
| Conversions | Actions tracked by the tag. |
| Catalog sales | Shopping ads from your product catalog. |

Performance+ campaigns automate targeting, bidding, and creative. Test them against a manual campaign.

## Targeting

- Use keyword and interest targeting. Pinterest is search-driven, so keywords matter.
- Build audiences from site visitors, customer lists, and Pin engagers.
- Build actalike (lookalike) audiences from your best customers.
- Start broad and let Pinterest expand targeting, then compare with tighter settings.

## Creative

- Use vertical images and video (2:3 for images, 9:16 or 2:3 for video).
- Show the product in use. Add a short text overlay that says what the Pin is.
- Formats include standard Pins, video, carousel, collections, and shopping ads.
- Keep text and logos away from edges that may be cropped.
- Refresh creative before seasonal peaks. People plan early on Pinterest.

## Budget and bidding

- Use automatic bidding to start. Add a target cost or ROAS goal once results are stable.
- Launch seasonal campaigns weeks before the season, when planning starts.

## Review cadence

- **Daily:** spend and disapproved ads.
- **Weekly:** results by keyword, audience, and creative; add negatives.
- **Every two weeks:** refresh creative.
- **Monthly:** catalog health and compare cost per result with other channels.

## Pre-launch checklist

- [ ] Website claimed.
- [ ] Pinterest tag and Conversions API verified, with deduplication.
- [ ] Catalog uploaded with no critical errors (if selling products).
- [ ] Audiences and exclusions built.
- [ ] Creative in vertical formats with text overlays checked.
- [ ] UTM parameters on all URLs.
- [ ] Budgets set.

</div>
