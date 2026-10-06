---
layout: ../../../../layouts/Layout.astro
title: "Onsite Personalization"
description: "Change site content based on who the visitor is and what they have done."
---
# Onsite Personalization

Onsite personalization changes what a visitor sees based on who they are and what they have done. A first-time visitor sees a different homepage than a returning customer. A visitor from a Facebook ad sees different copy than one from search. Someone who browsed running shoes sees running shoes, not hiking boots.

## How it works

Most sites show the same page to everyone, whatever they came for. Personalization uses signals you already have (traffic source, location, browsing history, purchase history) to show a more relevant version. Even simple rules, such as different headlines for new and returning visitors, can help. Each rule still needs to be tested.

## How to do it

1. List the signals you have: new or returning, traffic source (UTM), location, device, pages viewed, and purchase history.
2. Pick a content change for each segment. For example:
   - New visitors: reviews and an explainer.
   - Returning non-buyers: recently viewed items.
   - Past customers: related products.
   - Local visitors: local shipping times.
3. Use a personalization tool that swaps content blocks on existing pages (for example Dynamic Yield, Optimizely, VWO, Mutiny, Nosto).
4. Start with simple rules: headline by traffic source, recently viewed items, local shipping info.
5. Keep a control group for each rule. A/B test the personalized version against the default.

## What to measure

- **Personalized vs. default conversion rate**: Conversion rate per segment for the personalized version versus the control.
- **Revenue per visitor**: Total revenue divided by visitors, split by test and control.
- **Segment coverage**: Share of total traffic that receives a personalized experience.

## Best practices

- Start with your three or four largest segments.
- Keep a strong default page for visitors who match no rule.
- Add rules one at a time and confirm each one helps before adding the next.

## Common pitfalls

- Getting too personal. "We noticed you looked at anxiety medication last Thursday" feels like surveillance. Personalize on behavior patterns, not sensitive details.
- Building rules on assumptions. Untested personalization can lower conversion.
- Creating more segments than you can maintain. A few well-built segments beat many weak ones.
