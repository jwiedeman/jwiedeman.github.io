---
layout: ../../../../layouts/Layout.astro
title: "Free Shipping Threshold"
description: "Offer free shipping above a set order value to raise average order value."
---
# Free Shipping Threshold

A free shipping threshold is the order value a customer must reach to get free shipping. "Free shipping on orders over $50" is the usual form. Unexpected extra costs, including shipping, are a leading reason shoppers abandon carts in Baymard Institute's checkout research. A threshold also gives customers a reason to add one more item.

## How it works

Paying $7 shipping on a $35 order feels like paying for nothing. Adding a $15 item to reach $50 and get free shipping feels like a win, even though the customer spends more. The gap between the cart total and the threshold also prompts "What else can I add?", which leads shoppers to browse more of the catalog.

## How to do it

1. Plot the distribution of order values for the last 90 days and find the median.
2. Set a starting threshold a little above the median, close enough that one more item reaches it.
3. Model the economics: extra order value per qualifying order minus the shipping cost you absorb. Check that your margins cover it.
4. Show the threshold site-wide and add a progress message in the cart: "You are $12 away from free shipping."
5. Suggest add-on products priced to close the gap when a customer is close.
6. Test two or three threshold levels with separate customer groups. Pick the one with the highest revenue per visitor.

## What to measure

- **Threshold reach rate**: orders at or above the threshold divided by all orders.
- **AOV lift**: average order value after launch compared with the prior period or a control group.
- **Cart abandonment rate**: carts started minus orders completed, divided by carts started, before and after launch.

## Best practices

- Keep a paid shipping option below the threshold. Some customers only want one item.
- Test the threshold against flat-rate shipping and free shipping on everything. If AOV is already high, building shipping into prices may work better.
- Adjust the threshold by season. Raise it when people already spend more. Lower it in slow periods.

## Common pitfalls

- Setting the threshold too high. If most customers would need several more items to reach it, it motivates no one.
- Ignoring returns. Filler items added to hit the threshold may come back. Track their return rate separately.
- Revealing the threshold only at checkout. Show it on the homepage, product pages, and site header so customers can plan.
