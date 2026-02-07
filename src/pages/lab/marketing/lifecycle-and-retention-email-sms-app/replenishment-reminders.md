---
layout: ../../../../layouts/Layout.astro
title: "Replenishment Reminders"
description: "Timed automated reminders that prompt customers to reorder consumable products before they run out."
headingTracker: false
---
# Replenishment Reminders

Replenishment reminders are automated messages timed to reach customers just before they are likely to run out of a consumable product. For brands selling anything that gets used up — supplements, skincare, coffee, pet food, cleaning supplies — these flows generate predictable recurring revenue and can drive repeat purchase rates above 40%. The timing precision is what separates a helpful nudge from an annoying sales email.

## Core Concept

Every consumable product has an average consumption cycle — the typical number of days between purchase and depletion. By calculating this cycle from order data and product size, you can send a reminder at the exact moment a customer is thinking about reordering but has not yet done so. The message arrives as a convenience rather than a promotion, which is why replenishment emails see conversion rates of 10-15%, far above standard campaign benchmarks.

## Implementation

1. **Calculate consumption cycles:** Analyze repeat purchase intervals for each product or category. For a 30-day supply of vitamins, the reorder window is day 23-27. For a 12oz bag of coffee consumed by an average household, it is day 10-14. Use median intervals, not averages, to avoid skew from outliers.
2. **Set up the trigger:** Build a time-delay automation that fires X days after the original purchase (or after the last replenishment purchase). The trigger should account for quantity — if someone bought three bags instead of one, triple the delay.
3. **Craft the reminder email (Day X-7 before depletion):** Lead with convenience, not promotion. "Your [product] is probably running low" with a one-click reorder button pre-loaded with the same product and quantity. Include the original order details so the customer does not have to remember what they bought.
4. **Send a follow-up (Day X, estimated depletion):** If they did not reorder, send a second reminder with a small incentive — free shipping or a 5% loyalty discount. Mention that the product is in stock and can ship today.
5. **Offer subscription conversion (After 3rd replenishment):** Once a customer has reordered the same product three times, present a subscribe-and-save option with a 10-15% discount. At this point, the habit is established and subscription is a natural upgrade.

## Key Metrics

- **Replenishment Conversion Rate** — percentage of reminder recipients who reorder; benchmark is 10-15% for well-timed reminders
- **Average Reorder Interval Accuracy** — how closely your predicted depletion date matches actual reorder behavior; track and refine quarterly
- **Subscription Conversion Rate** — percentage of repeat reorderers who convert to a subscription after the third purchase; target 15-25%

## Best Practices

- Build product-specific consumption data rather than using generic timing — a 60-count bottle of daily vitamins has a knowable cycle, but "skincare" does not since usage frequency varies widely
- Include a "Not yet? Remind me later" button that pushes the reminder out by 7 or 14 days — this captures data on actual consumption pace and prevents unsubscribes
- Use SMS for the day-of-depletion reminder — a text message with a one-tap reorder link converts at 2-3x the rate of email for time-sensitive replenishment
- Show the customer's purchase history in the email so they can reorder their exact configuration (size, flavor, quantity) without navigating the site

## Common Pitfalls

- Using the same replenishment cycle for all customers — a household of four uses dish soap faster than a single person. Let actual reorder data override your assumptions after the first purchase.
- Sending reminders for non-consumable products — replenishment logic does not apply to durable goods. A customer who bought a backpack does not need a "running low?" email.
- Failing to suppress customers who already reordered — if someone bought more before your reminder, sending it anyway makes your brand look out of touch and erodes trust in your automation
