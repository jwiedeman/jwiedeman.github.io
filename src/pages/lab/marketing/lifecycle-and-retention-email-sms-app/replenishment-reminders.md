---
layout: ../../../../layouts/Layout.astro
title: "Replenishment Reminders"
description: "Automated reminders timed to reach customers just before they run out of a consumable product."
---
# Replenishment Reminders

Replenishment reminders are automated messages timed to arrive just before a customer runs out of a consumable product. They suit anything that gets used up: supplements, skincare, coffee, pet food, cleaning supplies. Good timing makes the message feel like a convenience, not a sales email.

## How it works

Every consumable has a typical usage cycle: the number of days between purchase and running out. Calculate that cycle from order data and product size, and you can remind customers right when they are about to reorder. Because the message solves a real need, it reads as service rather than promotion.

## How to do it

1. Calculate the reorder interval for each product from repeat purchase data. Use the median interval, not the mean, to limit the effect of outliers.
2. Build a time-delay automation that starts at each purchase of the product. Scale the delay by quantity: three units means roughly three times the delay.
3. Send the first reminder about a week before the expected run-out date. Include a one-click reorder button with the same product and quantity already loaded.
4. If they have not reordered by the expected run-out date, send a second reminder. Optionally add a small incentive such as free shipping.
5. After a customer has reordered the same product several times, offer a subscription option.
6. Stop the flow for anyone who reorders before the reminder goes out.

## What to measure

- **Replenishment conversion rate**: reminder recipients who reorder within the flow window, divided by recipients.
- **Timing accuracy**: difference between the predicted run-out date and the actual reorder date, reviewed each quarter.
- **Subscription conversion rate**: repeat reorderers who start a subscription after the offer.

## Best practices

- Use product-specific cycles. A 60-count bottle of daily vitamins has a clear cycle. A broad category like "skincare" does not.
- Add a "Not yet, remind me later" button that pushes the reminder back one or two weeks. It also tells you the customer's real usage pace.
- Use SMS for the run-out reminder for customers who consented to texts.
- Show the exact previous order (size, flavor, quantity) so the customer can reorder without searching.

## Common pitfalls

- Using one cycle for every customer. After the first reorder, let each customer's actual behavior set their timing.
- Sending reminders for durable goods. A backpack does not run out.
- Reminding customers who already reordered.
