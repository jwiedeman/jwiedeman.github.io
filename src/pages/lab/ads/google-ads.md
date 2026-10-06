---
layout: ../../../layouts/Layout.astro
title: "Google Ads Playbook"
description: "Setup checklist and review cadence for Google Ads Search, Performance Max, and Display."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">
  <p class="supertitle mono">Lab / Advertising</p>
  <h1>Google Ads Playbook</h1>
  <p class="intro">This playbook covers account structure, conversion tracking, and the optimization routine for Google Ads Search, Performance Max, and Display campaigns.</p>

  <section>
    <h2>Account structure</h2>
    <p>Build a modular campaign structure so each conversion signal is traceable and budgets can move without pausing campaigns.</p>
    <ul>
      <li>Separate Search, Performance Max, and Display into separate campaign groups with shared budgets and naming syntax: <span class="mono">[LOB]-[Geo]-[Objective]-[Stage]</span>.</li>
      <li>Use campaign experiments for incremental testing; reserve 10% of budget for test variants.</li>
      <li>Pin hero assets in responsive formats only when compliance demands; otherwise let Google rotate them.</li>
    </ul>
  </section>

  <section>
    <h2>Audience and keyword architecture</h2>
    <p>Blend automation and manual controls so search intent and audience signals reinforce each other.</p>
    <ul>
      <li>Adopt match-type pods: <strong>Exact</strong> pods for high-value queries, <strong>Phrase</strong> pods for discovery, and <strong>Broad</strong> pods with smart bidding for scale.</li>
      <li>Layer first-party audiences and Customer Match lists into every campaign as observation segments.</li>
      <li>Supply Performance Max with high-quality audience signals (remarketing lists, custom segments, product feeds) to cut ramp-up time.</li>
    </ul>
  </section>

  <section>
    <h2>Creative assets</h2>
    <p>Ensure each campaign has enough assets for Google’s combinatorial systems while retaining brand consistency.</p>
    <ul>
      <li>Responsive Search Ads: 12 headlines, 4 descriptions, include keyword variants, proof points, and compliance copy.</li>
      <li>Performance Max: provide at least 5 images, 5 logos, 5 headlines, 4 descriptions, and 1 short-form video or auto-generated video approval.</li>
      <li>Display: supply 1:1, 4:5, and 1.91:1 image ratios plus HTML5 creative when rich interactions are required.</li>
    </ul>
  </section>

  <section>
    <h2>Tracking and measurement</h2>
    <p>Keep bid automation anchored to high-fidelity conversions.</p>
    <ul>
      <li>Route conversions through Google Tag Manager or the gtag interface with <strong>enhanced conversions</strong> enabled when policy allows.</li>
      <li>Define primary vs secondary actions in the conversion manager so Smart Bidding optimizes toward the correct objective.</li>
      <li>Deploy offline conversion imports (OCI) for sales stages beyond the site. Automate the upload via Google Ads API or Zapier.</li>
    </ul>
  </section>

  <section>
    <h2>Review cadence</h2>
    <p>Schedule recurring reviews so spend and performance stay within agreed targets.</p>
    <ul>
      <li><strong>Daily:</strong> Check spend, policy issues, and sudden CPC spikes.</li>
      <li><strong>Weekly:</strong> Search term analysis with negative keyword sync across match-type pods.</li>
      <li><strong>Bi-weekly:</strong> Asset performance rating review, rotating in new creatives for “Low” rated elements.</li>
      <li><strong>Monthly:</strong> Performance Max placement and listing group audits. Adjust budgets across campaign groups based on MER (marketing efficiency ratio).</li>
    </ul>
  </section>

  <section>
    <h2>Pre-launch checklist</h2>
    <ul>
      <li>All conversions verified in Google Tag Assistant and testing environment.</li>
      <li>Audiences synced: Customer Match, remarketing pools, and data segments refreshed within last 30 days.</li>
      <li>Negative keyword lists, brand safety exclusions, and placement lists applied.</li>
      <li>Budget pacing dashboards wired into Looker Studio or preferred BI tool.</li>
    </ul>
  </section>
</div>
