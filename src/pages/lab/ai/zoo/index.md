---
layout: ../../../../layouts/Layout.astro
title: "AI Zoo"
description: "Searchable museum of browser-ready GAN exhibits with inline generators."
---

<h1>AI Zoo</h1>
<p class="mono">A living catalog of generative adversarial networks engineered to run fully in the browser with no GPU dependencies.</p>

<section class="zoo-controls">
  <label class="mono" for="zoo-search">Filter exhibits</label>
  <input
    id="zoo-search"
    type="search"
    placeholder="Search by model, dataset, or tag"
    autocomplete="off"
    data-zoo-search
  />
  <p class="zoo-subtext">All results update instantly. Tags and descriptions are indexed in the filter.</p>
</section>

<div class="grid zoo-grid" data-zoo-grid>
  <article
    class="card span-6 zoo-card"
    data-zoo-card
    data-title="Mini Digits GAN"
    data-tags="digits handwriting mnist cpu lightweight"
  >
    <div class="label mono">GAN-001</div>
    <div>
      <h2><a href="/lab/ai/zoo/mini-digits-gan/">Mini Digits GAN</a></h2>
      <p>
        Compact 28×28 handwriting generator distilled from a digit-focused GAN and exported as a single dense decoder.
      </p>
      <ul>
        <li>Softmax-based latent routing keeps inference deterministic for repeated seeds.</li>
        <li>Monochrome glyph basis renders crisply for retro dashboards and HUD mockups.</li>
        <li>Runs entirely on typed arrays—no TensorFlow.js or WebGL runtime required.</li>
      </ul>
      <p class="mono">Tags: digits · handwriting · cpu-only</p>
    </div>
  </article>
  <article
    class="card span-6 zoo-card"
    data-zoo-card
    data-title="Chromatic Orbit GAN"
    data-tags="color art spiral interference cpu"
  >
    <div class="label mono">GAN-002</div>
    <div>
      <h2><a href="/lab/ai/zoo/chromatic-orbit-gan/">Chromatic Orbit GAN</a></h2>
      <p>
        64×64 chromatic field generator that blends spiral, radial, and interference bases for psychedelic orbital motifs.
      </p>
      <ul>
        <li>Two-layer latent mixer sculpts coefficients for six handcrafted color basis fields.</li>
        <li>Outputs upscale cleanly for posters, dashboards, or shader inspiration.</li>
        <li>Includes autoplay option for looping gallery reels right in the browser.</li>
      </ul>
      <p class="mono">Tags: generative-art · color · cpu-only</p>
    </div>
  </article>
</div>

<p class="zoo-empty mono" data-zoo-empty hidden>No exhibits match your search. Try a broader term or clear the filter.</p>

<section class="zoo-roadmap">
  <h2>Roadmap</h2>
  <p>
    Upcoming curation waves will add browser-tuned CycleGAN image translators, lightweight audio GANs, and interpretability
    overlays that surface intermediate feature maps for every exhibit.
  </p>
</section>

<script type="module">
  const searchInput = document.querySelector('[data-zoo-search]');
  const cards = Array.from(document.querySelectorAll('[data-zoo-card]'));
  const emptyState = document.querySelector('[data-zoo-empty]');

  const normalize = (value) => value.toLowerCase().trim();

  const filterCards = () => {
    const rawQuery = searchInput ? searchInput.value : '';
    const query = normalize(rawQuery ?? '');
    let visibleCount = 0;

    cards.forEach((card) => {
      const title = card.getAttribute('data-title') ?? '';
      const tags = card.getAttribute('data-tags') ?? '';
      const text = `${title} ${tags} ${card.textContent ?? ''}`.toLowerCase();
      const match = query.length === 0 || text.includes(query);
      card.toggleAttribute('hidden', !match);
      if (match) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  filterCards();
</script>
