---
layout: ../../../layouts/Layout.astro
title: "Amazon Ads Deployment Brief"
description: "Operating procedure for Sponsored Ads, DSP, and retail readiness on Amazon."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">
  <p class="supertitle mono">Lab / Ads Platform Manual</p>
  <h1>Amazon Ads Deployment Brief</h1>
  <p class="intro">Amazon Ads thrives when retail operations and media work in lockstep. This brief ensures the product detail page, inventory, and DSP activations stay synchronized.</p>

  <section>
    <h2>Retail readiness</h2>
    <ul>
      <li>Confirm Buy Box ownership above 95% for promoted ASINs.</li>
      <li>Product detail pages must include 6+ images, enhanced A+ content, and at least 25 reviews (4+ star average).</li>
      <li>Inventory minimum: 30 days cover for each ASIN; coordinate with supply chain to avoid stock-outs.</li>
    </ul>
  </section>

  <section>
    <h2>Sponsored Ads structure</h2>
    <ul>
      <li>Separate campaigns for Sponsored Products (automatic vs manual), Sponsored Brands, and Sponsored Display.</li>
      <li>Manual campaigns: use keyword match type pods (Exact, Phrase, Broad) with shared negative keyword lists.</li>
      <li>Sponsored Brands: build landing pages in Stores and utilize video placements where available.</li>
    </ul>
  </section>

  <section>
    <h2>DSP architecture</h2>
    <ul>
      <li>Construct separate orders for Prospecting, Remarketing, and Loyalty with unique frequency caps.</li>
      <li>Leverage Amazon Marketing Cloud (AMC) audiences for high-value segments.</li>
      <li>Deploy third-party measurement pixels via Sizmek container when using external verification.</li>
    </ul>
  </section>

  <section>
    <h2>Measurement and reporting</h2>
    <ul>
      <li>Use Amazon Attribution tags for off-Amazon media driving to Amazon store pages.</li>
      <li>Pull search term reports and DSP delivery reports weekly; surface insights to merchandising teams.</li>
      <li>Feed AMC queries into BI dashboards for path-to-purchase and halo analysis.</li>
    </ul>
  </section>

  <section>
    <h2>Optimization cadence</h2>
    <ul>
      <li><strong>Daily:</strong> Monitor retail health (inventory, Buy Box, pricing) and pause ads if stock dips below threshold.</li>
      <li><strong>Weekly:</strong> Adjust bids by placement type (Top of Search, Product Pages) and update negative keywords.</li>
      <li><strong>Monthly:</strong> Evaluate DSP reach/frequency, update AMC segments, and refresh creative assets.</li>
    </ul>
  </section>

  <section>
    <h2>Pre-launch checklist</h2>
    <ul>
      <li>Sponsored Ads tracking templates tested; budgets allocated per ASIN priority.</li>
      <li>DSP creatives approved and trafficking complete via Amazon Ad Console.</li>
      <li>Inventory, pricing, and promotions aligned with campaign calendar.</li>
      <li>Attribution and AMC reporting dashboards configured for stakeholders.</li>
    </ul>
  </section>
</div>
