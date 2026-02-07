---
layout: ../../../../layouts/Layout.astro
title: "Cart & Browse Abandonment"
description: "Automated recovery flows that recapture revenue from abandoned carts and browse sessions."
headingTracker: false
---
# Cart & Browse Abandonment

Cart and browse abandonment flows are triggered automations that re-engage shoppers who added items to their cart or viewed products without completing a purchase. Cart abandonment emails recover 5-15% of abandoned carts on average, making them one of the highest-ROI automations in any ecommerce stack. Browse abandonment targets an earlier stage — visitors who showed interest but never added to cart.

## Core Concept

Roughly 70% of online shopping carts are abandoned, and the majority of product page visitors leave without adding anything. These are not lost causes — they are warm prospects who demonstrated purchase intent. Recovery flows work by re-presenting the exact products the shopper engaged with, removing friction, and adding urgency or incentive at the right moment. The key is timing: too early feels pushy, too late and they have moved on.

## Implementation

1. **Cart Abandonment Email 1 (1 hour post-abandon):** Send a clean reminder with product image, name, price, and a direct link back to the cart. No discount yet. Subject line: reference the specific product. This email alone recovers 40-50% of all abandonment revenue.
2. **Cart Abandonment Email 2 (24 hours):** Add social proof — reviews, star ratings, or "X people bought this today." Address common objections like shipping cost and return policy. Still no discount for most brands.
3. **Cart Abandonment Email 3 (48-72 hours):** Introduce an incentive if margin allows — free shipping, 10% off, or a gift with purchase. Include a deadline. This is the last email in the sequence.
4. **Browse Abandonment Email 1 (2-4 hours):** Show the viewed products alongside bestsellers in the same category. Keep messaging softer — "Still looking?" rather than "You forgot something." No discount.
5. **Browse Abandonment Email 2 (24 hours):** Highlight differentiators, comparison content, or buying guides related to the browsed category. Include a CTA to the category page rather than a single product.

## Key Metrics

- **Cart Recovery Rate** — percentage of abandoned carts that convert to orders via the flow; 5-15% is standard, 15%+ is excellent
- **Revenue Per Recipient** — total flow revenue divided by recipients; cart flows should generate $3-$8 per recipient for ecommerce
- **Discount Dependency Rate** — percentage of recoveries that required an incentive; if over 60%, you are training customers to abandon for discounts

## Best Practices

- Dynamically pull the exact cart contents into the email using your ESP's product feed — generic "you left something behind" emails convert 50% less than personalized ones
- Add an SMS touchpoint 30 minutes after abandonment for high-AOV carts (over $100) — SMS has a 90%+ open rate and creates immediacy
- Exclude customers who abandon and then purchase through another channel within your flow window to avoid irrelevant follow-ups
- Test removing the discount entirely from Email 3 — many brands find that urgency messaging alone recovers nearly as much without margin erosion

## Common Pitfalls

- Offering a discount in the first abandonment email — this trains repeat visitors to abandon deliberately and wait for the coupon
- Running the same flow for first-time visitors and returning customers — returning customers need less convincing and more urgency while new visitors need more trust-building
- Not suppressing customers who completed purchase between emails — nothing damages trust faster than "come back to your cart" after someone already bought
