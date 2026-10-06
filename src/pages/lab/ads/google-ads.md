---
layout: ../../../layouts/Layout.astro
title: "Google Ads Playbook"
description: "Setup checklist and review cadence for Google Ads Search, Performance Max, Demand Gen, and Shopping."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">

[← Ads lab](/lab/ads/)

# Google Ads Playbook

How to set up, track, and run Google Ads Search, Performance Max, Demand Gen, and Shopping campaigns.

## Account structure

- Use one account per business or brand. Use a manager account (MCC) to group them.
- Give every campaign the same naming pattern, for example `Brand-Geo-Type-Goal`.
- Keep brand and non-brand search in separate campaigns so their budgets and results stay apart.
- Use campaign experiments to test bid strategies and landing pages before rolling them out.

## Tracking and measurement

- Install the Google tag directly or through Google Tag Manager.
- Turn on enhanced conversions for web. For lead businesses, use enhanced conversions for leads to import offline outcomes.
- Mark one or two conversion actions as primary. Set everything else to secondary so bidding does not optimize toward it.
- Set conversion values, even estimated ones, if you plan to use value-based bidding.
- In the EEA and UK, implement consent mode v2.
- Link Google Analytics 4 and Merchant Center to the account.

## Campaign types

| Type | Use it for |
| --- | --- |
| Search | Capturing people who search for what you sell. |
| Performance Max | One campaign across Search, Shopping, YouTube, Display, Discover, Gmail, and Maps. Best with a product feed or strong conversion data. |
| Demand Gen | Image and video ads on YouTube, Discover, and Gmail to create demand. |
| Shopping | Product listing ads from a Merchant Center feed, when you want more control than Performance Max gives. |
| Video | YouTube reach and awareness. |
| Display | Remarketing and reach on the Google Display Network. |

## Targeting

- Search: start with exact and phrase match on proven terms. Use broad match only with Smart Bidding and good conversion data.
- Review search terms every week. Add negatives to shared negative keyword lists.
- Upload Customer Match lists and remarketing lists. Add them to campaigns as observation audiences or Performance Max audience signals.
- In Performance Max, add brand exclusions and account-level negative keywords where needed.
- Set location targeting to "presence" (people in the location) unless you want people interested in it.

## Creative

- Responsive search ads take up to 15 headlines and 4 descriptions. Fill most of them with distinct messages.
- Pin headlines only when legal or compliance requires it.
- Add sitelinks, callouts, structured snippets, and images at the account or campaign level.
- Performance Max: fill each asset group with images, logos, headlines, descriptions, and at least one video you made. If you supply no video, Google may generate one.
- Replace assets rated "Low" after they have enough impressions.

## Budget and bidding

- Start new campaigns on Maximize conversions or Maximize conversion value. Add a target CPA or target ROAS once results are stable.
- Google can spend up to twice the daily budget on a single day. Monthly spend stays at or below the daily budget times 30.4.
- Rule of thumb: change budgets and targets in small steps (about 20% at a time) so bidding does not restart learning.
- Give Smart Bidding a week or two after a major change before judging it.

## Review cadence

- **Daily:** spend, disapproved ads, and policy issues.
- **Weekly:** search terms, negatives, and budget pacing.
- **Every two weeks:** asset ratings and ad copy tests.
- **Monthly:** Performance Max channel and listing group reports; move budget between campaigns based on cost per result.

## Pre-launch checklist

- [ ] Conversions verified in Tag Assistant and showing in the conversions table.
- [ ] Primary and secondary conversion actions set.
- [ ] Enhanced conversions and consent mode working.
- [ ] Customer Match and remarketing lists uploaded and populated.
- [ ] Negative keyword lists and brand exclusions applied.
- [ ] Location, language, and ad schedule settings checked.
- [ ] Final URLs load and carry the right UTM or auto-tagging parameters.
- [ ] Budget and bid strategy match the plan.

</div>
