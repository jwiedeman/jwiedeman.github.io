/**
 * Network + adaptive bitrate simulation.
 *
 * The real <video> element still downloads from NASA, but a simulated buffer
 * sits in front of it: it fills at the chosen network speed and drains as
 * content plays. When it runs dry the player stalls on purpose, which is how
 * the trainer produces startup delay, rebuffers, and ABR switches on demand.
 */

export interface NetworkProfile {
  id: string;
  label: string;
  kbps: number;
  /** Random variation applied each second, as a fraction of kbps. */
  jitter: number;
  /** Request latency added to startup. */
  latencyMs: number;
  /** Random-walk the bandwidth (for the "flaky" profile). */
  wander?: [number, number];
}

export const NETWORK_PROFILES: NetworkProfile[] = [
  { id: 'unthrottled', label: 'Unthrottled', kbps: 50000, jitter: 0, latencyMs: 0 },
  { id: 'fiber', label: 'Fiber 25 Mbps', kbps: 25000, jitter: 0.05, latencyMs: 20 },
  { id: 'cable', label: 'Cable 6 Mbps', kbps: 6000, jitter: 0.1, latencyMs: 40 },
  { id: 'lte', label: '4G 3 Mbps', kbps: 3000, jitter: 0.2, latencyMs: 80 },
  { id: '3g', label: '3G 1.2 Mbps', kbps: 1200, jitter: 0.25, latencyMs: 200 },
  { id: 'edge', label: '2G 300 kbps', kbps: 300, jitter: 0.3, latencyMs: 500 },
  { id: 'flaky', label: 'Flaky (0.3–8 Mbps)', kbps: 3000, jitter: 0.1, latencyMs: 120, wander: [300, 8000] },
  { id: 'offline', label: 'Offline', kbps: 0, jitter: 0, latencyMs: 0 },
];

export interface Rendition {
  id: string;
  label: string;
  width: number;
  height: number;
  bitrateKbps: number;
  url: string;
}

const MAX_BUFFER_S = 30;
const START_THRESHOLD_S = 2;
const RESUME_THRESHOLD_S = 3;

export class NetworkSim {
  profile: NetworkProfile = NETWORK_PROFILES[0];
  /** Current instantaneous bandwidth. */
  bandwidthKbps = this.profile.kbps;
  /** Smoothed estimate the ABR logic sees (like a real player's estimator). */
  estimateKbps = this.profile.kbps;
  bufferSeconds = 0;
  private walk = 3000;
  private lastSample = 0;

  setProfile(id: string) {
    const p = NETWORK_PROFILES.find((x) => x.id === id);
    if (!p) return false;
    this.profile = p;
    this.walk = p.kbps;
    this.sample(true);
    return true;
  }

  /** Re-sample bandwidth roughly once a second. */
  sample(force = false) {
    const now = performance.now();
    if (!force && now - this.lastSample < 1000) return;
    this.lastSample = now;
    const p = this.profile;
    let base = p.kbps;
    if (p.wander) {
      this.walk *= Math.exp((Math.random() - 0.5) * 0.9);
      this.walk = Math.min(p.wander[1], Math.max(p.wander[0], this.walk));
      base = this.walk;
    }
    this.bandwidthKbps = Math.max(0, base * (1 + (Math.random() * 2 - 1) * p.jitter));
    this.estimateKbps = force ? this.bandwidthKbps : this.estimateKbps * 0.7 + this.bandwidthKbps * 0.3;
  }

  /** Drop what is buffered (seek, rendition switch). */
  flush(keepSeconds = 0) {
    this.bufferSeconds = Math.min(this.bufferSeconds, keepSeconds);
  }

  /**
   * Advance the model. Returns 'stall' when playback must stop for data and
   * 'ready' when a stalled/starting player has enough buffered to go.
   */
  tick(dt: number, opts: { playing: boolean; rate: number; bitrateKbps: number; waiting: boolean; startup: boolean }) {
    this.sample();
    if (this.bufferSeconds < MAX_BUFFER_S && opts.bitrateKbps > 0) {
      this.bufferSeconds += dt * (this.bandwidthKbps / opts.bitrateKbps);
    }
    if (opts.playing) this.bufferSeconds -= dt * opts.rate;
    this.bufferSeconds = Math.min(MAX_BUFFER_S, Math.max(0, this.bufferSeconds));

    if (opts.playing && this.bufferSeconds <= 0) return 'stall' as const;
    const threshold = opts.startup ? START_THRESHOLD_S : RESUME_THRESHOLD_S;
    if (opts.waiting && this.bufferSeconds >= threshold) return 'ready' as const;
    return 'ok' as const;
  }

  /**
   * ABR choice: highest rendition under 80% of the estimate. Step up only with
   * a healthy buffer; step down at once when the buffer is draining.
   */
  chooseRendition(renditions: Rendition[], currentId: string): Rendition {
    const sorted = [...renditions].sort((a, b) => a.bitrateKbps - b.bitrateKbps);
    const budget = this.estimateKbps * 0.8;
    let pick = sorted[0];
    for (const r of sorted) if (r.bitrateKbps <= budget) pick = r;
    const current = sorted.find((r) => r.id === currentId) ?? pick;
    if (pick.bitrateKbps > current.bitrateKbps && this.bufferSeconds < 8) return current;
    return pick;
  }
}
