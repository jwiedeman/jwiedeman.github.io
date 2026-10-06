---
layout: ../../../../layouts/Layout.astro
title: "Schema Markup & Rich Results"
description: "Add structured data so search engines understand your pages and can show them as rich results."
---
# Schema Markup & Rich Results

Schema markup, or structured data, is code that tells search engines what a page contains: a product, article, event, organization, recipe, and so on. Google can use it to show rich results such as product prices, review stars, event dates, and breadcrumbs. Rich results can make a listing stand out and attract more clicks. Google decides which rich results to show, and the list of supported types changes over time.

## How it works

HTML shows what text is on a page, not what it means. "Apple" could be a fruit or a company. Schema markup uses the schema.org vocabulary to state the meaning in a machine-readable way. Structured data does not directly improve rankings. It makes a page eligible for rich results and helps search engines understand it.

Google has narrowed some rich result types. Since 2023, FAQ rich results appear only for a small set of authoritative government and health sites, and HowTo rich results are no longer shown. Check Google's Search Gallery for the current list before you invest in a type.

## How to do it

1. List the content types on your site and match each to a supported schema type, such as Product, Article, Organization, LocalBusiness, Event, Recipe, VideoObject, or BreadcrumbList.
2. Confirm each type is still supported in Google's Search Gallery documentation.
3. Write the markup in JSON-LD, Google's recommended format, inside a script tag on the page.
4. Include all required properties. For a product: name, price, currency, and availability, plus review data if real reviews appear on the page.
5. Test with Google's Rich Results Test and fix all errors. Use the Schema Markup Validator for general schema.org checks.
6. Add the markup to page templates so it is generated from your CMS data, not added page by page.
7. Monitor the rich result reports in Search Console for errors, and filter the Performance report by search appearance to compare clicks.

## What to measure

- **Valid markup coverage**: share of eligible pages with valid, error-free markup, from Search Console rich result reports.
- **Rich result CTR**: click-through rate for pages shown with a rich result, compared with similar pages without one, from the Performance report.
- **Schema errors**: count of pages with errors in Search Console. Each error can block that page's rich result.

## Best practices

- Keep structured data consistent with what users can see on the page.
- Combine types where they fit. A product page can carry Product, BreadcrumbList, and Organization markup.
- Prioritize types Google still shows widely for your content, such as Product, Article, Event, and Video.

## Common pitfalls

- Marking up content that is not visible on the page. This breaks Google's guidelines and can lead to a manual action.
- Adding review markup to reviews you wrote about your own business. Google does not show stars for self-serving reviews.
- Setting it and forgetting it. Supported types change and site updates can break markup, so check Search Console reports monthly.
