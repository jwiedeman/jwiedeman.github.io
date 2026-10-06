---
layout: ../../../../layouts/Layout.astro
title: "Meta Conversions API (CAPI)"
description: "Send conversion events from your server to Meta so ad optimization does not depend on the browser alone."
---
# Meta Conversions API (CAPI)

The Meta Conversions API (CAPI) sends conversion events from your server straight to Meta. Browser tracking loses events to ad blockers, Safari's cookie limits, and iOS App Tracking Transparency. Running CAPI next to the Meta Pixel recovers many of those events and gives Meta better data to optimize delivery.

## How it works

The Pixel runs in the browser, so blockers, cookie limits, and tracking opt-outs can stop it. CAPI sends the same events from a server you control. When the Pixel and CAPI both send an event with the same event_id, Meta deduplicates them and keeps one. CAPI can also pass more matching data, such as hashed email and phone, and values like order total, which helps Meta match events to people and supports value-based bidding.

## How to do it

1. Pick an integration: a direct API build, a platform partner integration (for example Shopify or WooCommerce), or the Conversions API Gateway.
2. Map your events to Meta standard events: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Lead, CompleteRegistration. Send the whole funnel, not just the final conversion.
3. Generate a unique event_id for each event and send it from both the Pixel and CAPI so Meta can deduplicate.
4. Hash customer data (email, phone, first name, last name, zip) with SHA-256 before sending. Include as many match keys as you lawfully can, plus the fbp and fbc values when available.
5. Check Events Manager: review Event Match Quality, confirm deduplication is working, and compare event counts with your own order records.

## What to measure

- **Event Match Quality (EMQ)**: Meta's score for each event in Events Manager. Higher means events match to people more reliably.
- **Events added by CAPI**: server events not seen by the Pixel, as a share of total events.
- **CPA before and after**: cost per acquisition for comparable periods before and after launch.

## Best practices

- Send events in real time or within minutes of the action.
- Include every customer parameter you have consent to send, hashed where required.
- Start on your highest-spend conversion paths, then extend to the rest.
- Check Events Manager diagnostics on a schedule.

## Common pitfalls

- Skipping deduplication, which double-counts conversions.
- Sending only Purchase through CAPI and leaving upper-funnel events on the Pixel alone.
- Assuming the integration still works. Errors and missing parameters fail quietly.
