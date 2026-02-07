---
layout: ../../../../layouts/Layout.astro
title: "Meta Conversions API (CAPI)"
description: "Implementing Meta's server-side Conversions API for reliable event tracking and optimization."
headingTracker: false
---
# Meta Conversions API (CAPI)

The Meta Conversions API (CAPI) is a server-to-server integration that sends conversion events directly from your backend to Meta's servers, bypassing the browser entirely. As browser-based pixel tracking loses accuracy due to iOS App Tracking Transparency, ad blockers, and cookie restrictions, CAPI has become essential for maintaining the data quality Meta needs to optimize ad delivery. Advertisers who implement CAPI alongside their pixel typically recover 15-30% of lost conversion events and see meaningful improvements in campaign optimization and targeting accuracy.

## Core Concept

The Meta Pixel fires in the user's browser, making it vulnerable to ad blockers (which strip the tracking script), Safari ITP (which limits cookie lifespan to 7 days), and iOS ATT (which lets users opt out of tracking). CAPI sends the same events from your server, which you control completely. When both pixel and CAPI fire for the same event with a shared event ID, Meta deduplicates them and uses whichever signal arrives. This redundancy means you capture events even when the browser-side signal fails. Beyond signal recovery, CAPI enables passing richer data (hashed customer emails, phone numbers, lifetime value) that improves audience matching quality and enables advanced optimization like value-based bidding.

## Implementation

1. Choose your integration method: direct API integration (requires engineering resources but offers maximum control), a partner integration (Shopify, WooCommerce, or Segment connectors that configure CAPI automatically), or Meta's Gateway (a self-hosted server that acts as a proxy)
2. Map your conversion events to the Meta standard events taxonomy: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Lead, CompleteRegistration — send all relevant funnel events, not just the final conversion
3. Implement event deduplication by generating a unique event_id for each conversion and sending it via both the pixel and CAPI — Meta will deduplicate based on this ID to prevent double-counting
4. Hash all PII (email, phone, first name, last name, zip code) using SHA-256 before sending — include as many matching parameters as possible to maximize Meta's ability to match the event to a user profile
5. Validate the implementation in Meta Events Manager: check the Event Match Quality score (target 6.0+), verify deduplication is working (deduplicated events should show in the Events Overview), and confirm event counts match your internal records

## Key Metrics

- **Event Match Quality (EMQ) score** — Meta's 1-10 score indicating how well your server events match to Meta user profiles; higher scores mean better optimization signal; target 6.0 minimum, 8.0+ is excellent
- **Redundant event coverage** — the percentage of conversion events captured by CAPI that the pixel missed, quantifying the signal recovery value of the implementation
- **Campaign CPA improvement** — track the before/after change in cost per acquisition once CAPI is fully implemented, isolating the optimization benefit of improved signal quality

## Best Practices

- Send events in real-time or within minutes of the conversion — Meta prioritizes timely events for optimization; events sent hours later lose attribution value
- Include the maximum number of customer parameters in each event (hashed email, phone, external ID, city, state, zip, country, click_id) to maximize match quality
- Test CAPI first on your highest-spend campaigns where signal degradation has the most budget impact, then roll out to all campaigns

## Common Pitfalls

- Implementing CAPI without deduplication, which causes Meta to count every conversion twice and makes campaign reporting and optimization unreliable
- Sending only the Purchase event via CAPI while leaving upper-funnel events (ViewContent, AddToCart) on pixel-only — Meta uses the full funnel for optimization, and partial CAPI coverage limits the benefit
- Setting up CAPI and assuming it is working without ongoing monitoring — integration issues (API errors, missing parameters, deduplication failures) degrade silently and must be checked in Events Manager regularly
