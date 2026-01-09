---
layout: ../../../layouts/Layout.astro
title: "AI"
headingTracker: false
---
<div class="container">
  <header class="page-header">
    <div class="page-header__meta">
      <span class="section-index">Lab / AI</span>
      <span class="classification classification--accent">Active Research</span>
    </div>
    <h1 class="page-header__title">Artificial Intelligence</h1>
    <p class="page-header__subtitle">Machine Learning & Neural Architectures</p>
  </header>

  <div class="section-header">
    <span class="section-header__title">10 Projects Indexed</span>
    <span class="section-header__line"></span>
  </div>

  <div class="grid">
    <article class="card span-6">
      <div class="label mono">AI-001</div>
      <div>
        <h2><a href="/lab/ai/mini-digits-gan/">Mini Digits GAN</a></h2>
        <p>
          Compact 28×28 handwriting generator distilled from a digit-focused GAN and exported as a single dense decoder.
        </p>
        <ul>
          <li>Softmax-based latent routing keeps inference deterministic for repeated seeds.</li>
          <li>Monochrome glyph basis renders crisply for retro dashboards and HUD mockups.</li>
          <li>Runs entirely on typed arrays—no TensorFlow.js or WebGL runtime required.</li>
        </ul>
        <p><a href="/lab/ai/mini-digits-gan/" class="mono">Access module →</a></p>
      </div>
    </article>
    <article class="card span-6">
      <div class="label mono">AI-002</div>
      <div>
        <h2><a href="/lab/ai/chromatic-orbit-gan/">Chromatic Orbit GAN</a></h2>
        <p>
          64×64 chromatic field generator that blends spiral, radial, and interference bases for psychedelic orbital motifs.
        </p>
        <ul>
          <li>Two-layer latent mixer sculpts coefficients for six handcrafted color basis fields.</li>
          <li>Outputs upscale cleanly for posters, dashboards, or shader inspiration.</li>
          <li>Includes autoplay option for looping gallery reels right in the browser.</li>
        </ul>
        <p><a href="/lab/ai/chromatic-orbit-gan/" class="mono">Access module →</a></p>
      </div>
    </article>
    <article class="card span-6">
      <div class="label mono">AI-003</div>
      <div>
        <h2><a href="/projects/neural-match/">NeuralMatch</a></h2>
        <p>
          Synthetic match-3 game evaluator that trains neural models on heavily augmented puzzle layouts to master tile-matching strategies.
        </p>
        <ul>
          <li>Heavy data augmentation generates thousands of puzzle variants for robust training.</li>
          <li>Browser-first architecture runs entirely on static files—no backend required.</li>
          <li>Part of the NeuralDojo collection of neural playgrounds.</li>
        </ul>
        <p><a href="/projects/neural-match/" class="mono">Launch demo →</a></p>
      </div>
    </article>
    <article class="card span-6">
      <div class="label mono">AI-004</div>
      <div>
        <h2><a href="/projects/neural-go/">NeuralGo</a></h2>
        <p>
          Self-play laboratory where neural networks learn the ancient game of Go through iterative policy improvement and Monte Carlo tree search.
        </p>
        <ul>
          <li>Implements AlphaGo-inspired self-play loops for continuous improvement.</li>
          <li>Visualizes board states, move probabilities, and value predictions in real-time.</li>
          <li>Fully static deployment—runs entirely in your browser.</li>
        </ul>
        <p><a href="/projects/neural-go/" class="mono">Launch demo →</a></p>
      </div>
    </article>
    <article class="card span-6">
      <div class="label mono">AI-005</div>
      <div>
        <h2><a href="/projects/neural-stocks/">NeuralStocks</a></h2>
        <p>
          Market forecasting playground that processes historical prices through a compact MLP with real-time learning visualization.
        </p>
        <ul>
          <li>Live training dashboard shows loss curves and prediction accuracy as the model learns.</li>
          <li>Compact multilayer perceptron architecture optimized for browser performance.</li>
          <li>Educational tool demonstrating neural network fundamentals on financial data.</li>
        </ul>
        <p><a href="/projects/neural-stocks/" class="mono">Launch demo →</a></p>
      </div>
    </article>
    <article class="card span-6">
      <div class="label mono">AI-006</div>
      <div>
        <h2><a href="/lab/ai/foot-traffic-intelligence/">Foot Traffic Intelligence</a></h2>
        <p>
          Multi-modal counting that fuses Wi-Fi probing, camera feeds, and door sensors to quantify movement across venues in near real time.
        </p>
        <ul>
          <li>On-device processing keeps raw imagery private while streaming anonymized vectors to the edge.</li>
          <li>Forecast module predicts surges so staff can stage resources before congestion starts.</li>
          <li>Output dashboards plug into the analytics stack already deployed in the lab.</li>
        </ul>
        <p><a href="/lab/ai/foot-traffic-intelligence/" class="mono">Access module →</a></p>
      </div>
    </article>
    <article class="card span-6">
      <div class="label mono">AI-007</div>
      <div>
        <h2><a href="/lab/ai/mycology-classification/">Mycology Classification</a></h2>
        <p>
          A fine-tuned vision transformer that learns from herbarium scans, macro photography, and spore print imagery to identify fungal species.
        </p>
        <ul>
          <li>Active learning loop requests new labels for ambiguous samples gathered in the field.</li>
          <li>Outputs include toxicity risk bands, look-alike warnings, and habitat metadata.</li>
          <li>Packaging targets a lightweight mobile inference bundle for offline use in forests.</li>
        </ul>
        <p><a href="/lab/ai/mycology-classification/" class="mono">Access module →</a></p>
      </div>
    </article>
    <article class="card span-6">
      <div class="label mono">AI-008</div>
      <div>
        <h2><a href="/projects/phone-agent/">Phone Agent</a></h2>
        <p>
          Raspberry Pi voice agent for landline phones using Markov chain pattern matching and MP3 playback for automated call handling.
        </p>
        <ul>
          <li>YAML rule engine matches caller speech to trigger patterns with fuzzy matching.</li>
          <li>Pre-recorded MP3 responses chained via state machine for natural conversation flow.</li>
          <li>Vosk STT for offline operation—no cloud dependencies or inference required.</li>
        </ul>
        <p><a href="/projects/phone-agent/" class="mono">Launch demo →</a></p>
      </div>
    </article>
    <article class="card span-6">
      <div class="label mono">AI-009</div>
      <div>
        <h2><a href="/lab/ai/mushroom-forecasting-alerts/">Mushroom Forecasting Alerts</a></h2>
        <p>
          Probabilistic growth model that ingests NOAA weather feeds, soil sensors, and phenology logs to forecast which species will fruit within a radius.
        </p>
        <ul>
          <li>Users set distance thresholds and species lists; alerts trigger when humidity and heat align with a species' fruiting profile.</li>
          <li>Spatial tiles combine habitat suitability with recent mycology classification sightings.</li>
          <li>Designed as a "weather-style" notification system that surfaces safe-foraging windows.</li>
        </ul>
        <p><a href="/lab/ai/mushroom-forecasting-alerts/" class="mono">Access module →</a></p>
      </div>
    </article>
    <article class="card span-6">
      <div class="label mono">AI-010</div>
      <div>
        <h2><a href="/projects/pattern-match-learner/">Pattern Match Learner</a></h2>
        <p>
          Interactive neural network that learns to classify 8×8 pixel patterns through stochastic gradient descent.
        </p>
        <ul>
          <li>Watch weights evolve in real-time as the network learns to classify stripes, checkers, and diagonals.</li>
          <li>Draw your own patterns and see live predictions with confidence scores.</li>
          <li>Visualizes loss landscape trajectory and emergent weight structures.</li>
        </ul>
        <p><a href="/projects/pattern-match-learner/" class="mono">Launch demo →</a></p>
      </div>
    </article>
  </div>
</div>
