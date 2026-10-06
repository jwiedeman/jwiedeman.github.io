---
layout: ../../../../layouts/Layout.astro
title: "Affiliate Codes & UTMs"
description: "Track influencer sales with a unique discount code and a tagged link for each creator."
---
# Affiliate Codes & UTMs

Give each creator a unique discount code and a UTM-tagged link. Together they show which creators drive sales and which only drive views. With that data you can put more budget behind the creators who sell.

## How it works

Tracking works on two layers. A short code (for example, SARAH15) is easy to say out loud in a video or story. A UTM link records the click and the session in your analytics. Codes catch buyers who remember the creator days later. Links catch buyers who click straight through.

## How to do it

1. Create one discount code per creator in your store platform. Use a fixed pattern such as CREATORNAME + discount (JAKE20), and set an end date and usage limit.
2. Build one UTM link per creator with a fixed scheme: `utm_source=influencer`, `utm_medium=affiliate`, `utm_campaign=creatorname`, `utm_content=platform-format` (for example, `instagram-reels`).
3. Shorten each link on a branded domain (for example, go.yourbrand.com/sarah). Check that the redirect keeps the UTM parameters.
4. Build one report per creator that combines code redemptions from your store with UTM sessions and conversions from analytics.
5. Compare code sales to link sales each month. A creator with many code sales and few clicks drives recall, not clicks. Judge them on total sales, not click data.

## What to measure

- **Revenue per creator**: code revenue plus UTM-attributed revenue, per creator.
- **Code redemption rate**: code uses divided by the creator's estimated reach for the post.
- **Link conversion rate**: purchases divided by clicks on the creator's UTM link.

## Best practices

- Give every creator both a code and a link.
- Let video creators lead with the code. Viewers often cannot click during a video.
- Use commission tiers that rise with sales (for example, 10% base, 15% after 50 sales) so creators keep promoting.
- Count code redemptions for a set window after the post (for example, 30 days) to catch delayed purchases.
- Put the exact link, code, and tracking rules in every creator brief.

## Common pitfalls

- Reusing the same UTM values for several creators. Every creator needs a unique `utm_campaign` at minimum.
- Letting codes leak to coupon sites. Leaked codes inflate attribution and commission payouts.
- Creators posting a plain link instead of the tracked one. You lose click data for that post.
