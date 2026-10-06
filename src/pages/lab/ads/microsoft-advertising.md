---
layout: ../../../layouts/Layout.astro
title: "Microsoft Advertising Playbook"
description: "Setup guide for Microsoft Advertising search, Shopping, Performance Max, and audience ads, including Google Ads import."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">

[← Ads lab](/lab/ads/)

# Microsoft Advertising Playbook

How to set up and run Microsoft Advertising alongside Google Ads. Ads show on Bing, partner sites, and the Microsoft Audience Network.

## Account structure

- Mirror your Google Ads structure and naming so reports line up.
- Import campaigns with Google Import. Schedule the import if you want changes to keep syncing.
- After every import, check bid strategies, budgets, negatives, ad extensions, and URL parameters. Not every setting carries over.
- Set budgets for Microsoft separately. Do not copy Google budgets.

## Tracking and measurement

- Install the Universal Event Tracking (UET) tag on every page. Create conversion goals from it.
- You can import conversion goals from Google Ads, but confirm UET is recording them.
- Turn on enhanced conversions and consent mode for UET where required.
- Send server-side or offline conversions with the Conversions API or offline conversion imports.
- Auto-tagging adds `msclkid` to URLs. Make sure your site and analytics keep it.

## Campaign types

| Type | Use it for |
| --- | --- |
| Search | Text ads on Bing and partner search results. |
| Shopping | Product ads from a Microsoft Merchant Center feed. |
| Performance Max | Automated campaigns across Microsoft search and audience inventory. |
| Audience | Image and native ads on the Microsoft Audience Network. |

## Targeting

- Review search terms weekly. Add negatives.
- Add remarketing and in-market audiences to search campaigns, starting in observation mode.
- Use LinkedIn profile targeting (company, industry, job function) as bid adjustments on search.
- Exclude low-quality publisher sites from audience campaigns.

## Creative

- Reuse Google responsive search ads as a starting point.
- Add Microsoft-specific assets, such as images and action extensions, where they are available.
- Test ad copy against Microsoft search terms. Do not assume Google results carry over.

## Budget and bidding

- Use automated bidding: Maximize conversions, Target CPA, Maximize conversion value, or Target ROAS.
- Expect lower volume than Google. Give automated bidding more time to learn.
- Compare cost per acquisition with Google and move budget toward the cheaper source.

## Review cadence

- **Daily:** spend and disapproved ads.
- **Weekly:** search terms, negatives, and any Google Import errors.
- **Every two weeks:** audience network placements; exclude poor sites.
- **Monthly:** cost per acquisition versus Google; rebalance budgets.

## Pre-launch checklist

- [ ] UET tag verified with UET Tag Helper.
- [ ] Conversion goals recording.
- [ ] Google Import reviewed for unsupported or changed settings.
- [ ] Negatives and audience exclusions applied.
- [ ] Merchant Center feed approved (if running Shopping).
- [ ] Budgets set for Microsoft, not copied from Google.
- [ ] `msclkid` and UTM parameters preserved through to analytics.

</div>
