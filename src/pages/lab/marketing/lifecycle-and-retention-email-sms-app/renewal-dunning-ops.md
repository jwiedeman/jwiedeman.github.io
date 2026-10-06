---
layout: ../../../../layouts/Layout.astro
title: "Renewal & Dunning Ops"
description: "Manage subscription renewals and recover failed payments to reduce involuntary churn."
---
# Renewal & Dunning Ops

Renewal and dunning operations are the systems that handle subscription renewals and failed payments. Their job is to prevent involuntary churn: customers who leave because a payment failed, not because they chose to cancel.

## How it works

Most failed payments come from expired cards, insufficient funds, or bank fraud holds. The customer often does not know the payment failed. Dunning fixes this with renewal reminders, well-timed retries, and notices that ask the customer to update their card. A recovered payment keeps a customer who never meant to leave.

## How to do it

1. Send a pre-renewal email before each renewal (for example seven days ahead) with the amount, date, and payment method on file. Check local rules, since some jurisdictions require renewal notices.
2. Turn on your billing provider's automatic card updater (network account updater services) to refresh expired or reissued cards.
3. Configure retries spread over one to two weeks rather than retrying immediately. Use your provider's smart retry feature if it has one.
4. Send dunning emails. Day 0: the payment failed, here is a one-click link to update it. Around day 3: a reminder with the date access will pause. Around day 7: a final notice stating exactly what they will lose.
5. Add an in-app banner for logged-in users with a failed payment, and SMS for customers who consented to it.
6. Keep access during a grace period before downgrading or canceling, so the retries and emails have time to work.

## What to measure

- **Failed payment recovery rate**: failed payments eventually collected, divided by all failed payments.
- **Involuntary churn rate**: subscribers lost to payment failure after all retries, divided by active subscribers, per month.
- **Time to recovery**: median days between first failure and successful payment.

## Best practices

- Make the update page simple: card fields plus the current plan. Use a secure tokenized link so customers do not have to log in first.
- Tell customers specifically what they will lose, for example their saved projects or history.
- Write dunning emails as plain transactional notices with clear subject lines such as "Action required: update your payment method."
- For long-tenured subscribers, test offering a plan change in the final notice.

## Common pitfalls

- Treating failed payments like cancellations by cutting access immediately.
- Making dunning emails look like marketing, so they get ignored.
- Retrying at the same time on consecutive days instead of spacing retries out.
