---
layout: ../../../../layouts/Layout.astro
title: "Renewal & Dunning Ops"
description: "Managing subscription renewals and recovering failed payments to reduce involuntary churn."
headingTracker: false
---
# Renewal & Dunning Ops

Renewal and dunning operations are the systems and automations that manage subscription renewals, handle failed payments, and recover billing issues before they result in involuntary churn. Involuntary churn — customers who leave because their payment failed, not because they wanted to cancel — accounts for 20-40% of all subscription churn. A well-built dunning system recovers 50-70% of failed payments, directly protecting recurring revenue without any sales or marketing effort.

## Core Concept

Most failed payments are caused by expired credit cards, insufficient funds, or bank-side fraud holds — not by customer intent to cancel. The customer often does not even know their payment failed. Dunning operations solve this through a combination of pre-renewal reminders, intelligent retry logic, and multi-channel notification sequences that prompt the customer to update their payment information. Every recovered payment is pure incremental revenue because the customer was already committed to the subscription.

## Implementation

1. **Send pre-renewal reminders:** 7 days before a subscription renews, send an email confirming the upcoming charge amount, renewal date, and the payment method on file. This reduces chargebacks, satisfies regulatory requirements in many jurisdictions, and catches expired cards before they fail.
2. **Configure smart payment retry logic:** When a payment fails, do not retry immediately. Schedule retries at optimized intervals — Day 1 (initial failure), Day 3, Day 5, Day 7, and Day 10. Retry in the morning between 6-10 AM in the customer's timezone, when banks are more likely to approve. Some payment processors like Stripe and Recurly offer machine-learning-based retry optimization.
3. **Launch the dunning email sequence:** Email 1 (Day 0, payment failure): Friendly notification that their payment did not go through, with a one-click link to update payment info. Email 2 (Day 3): Reminder with added urgency — "Your account will be paused in X days." Email 3 (Day 7): Final notice with specific consequences — "You will lose access to [feature/content] tomorrow."
4. **Add SMS and in-app notifications:** Payment failure emails often go to spam or get buried. Add an SMS on Day 3 and an in-app banner on login for customers with failed payments. These channels have significantly higher visibility for urgent account issues.
5. **Implement a grace period:** Allow 7-14 days of continued access after a payment failure before downgrading or canceling the account. Cutting access immediately frustrates customers who had no idea their card expired, while a grace period gives dunning flows time to work.

## Key Metrics

- **Failed Payment Recovery Rate** — percentage of failed payments that are eventually collected; best-in-class systems recover 60-70%
- **Involuntary Churn Rate** — percentage of subscribers lost to payment failure after all dunning attempts; target under 1.5% monthly for mature subscription businesses
- **Average Recovery Time** — median number of days between initial failure and successful payment collection; shorter is better, most recoveries happen within 5 days

## Best Practices

- Use a card updater service (Visa Account Updater, Mastercard Automatic Billing Updater) to automatically refresh expired card details before they cause failures — this prevents 20-30% of card-expiry failures silently
- Make the payment update page dead simple — one field for card number, one for expiration, one for CVV, with the current plan details shown. Do not make the customer log in first if possible; use a tokenized link instead.
- Personalize dunning emails with what the customer will lose — "You will lose access to 47 saved workouts" is more motivating than "Your subscription will be canceled"
- Test offering a brief discount or plan change in the final dunning email for long-tenured subscribers — "Stay on our annual plan for 20% off" converts some customers who were passively considering cancellation

## Common Pitfalls

- Treating failed payments like voluntary cancellations — cutting access immediately and sending a "sorry to see you go" email loses customers who had every intention of staying
- Sending dunning emails that look like marketing emails — dunning messages should be transactional in tone, with clear subject lines like "Action required: update your payment method." Branded templates with product promotions get ignored.
- Not retrying failed payments on different days and times — a card that is declined on Monday at 2 PM may succeed on Thursday at 8 AM due to bank processing schedules and account balance changes
