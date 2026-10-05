/**
 * Network path + adaptive bitrate simulation.
 *
 * The real <video> element still downloads from NASA, but a simulated buffer
 * sits in front of it. How fast that buffer fills comes from a path model:
 *
 *   viewer location ──(distance over fiber)──> CDN edge or origin
 *        + last-mile connection (bandwidth, latency, packet loss)
 *
 * Round-trip time is propagation (distance / speed of light in fiber, with a
 * routing factor) plus the last mile. Usable throughput is the link speed
 * capped by what one TCP connection can do at that RTT and loss (Mathis et
 * al.), which is why a 25 Mbps GEO satellite link streams like DSL. Each
 * segment request also pays a round trip, and new connections pay DNS + TCP
 * + TLS before the first byte.
 *
 * The same model times analytics beacons to each vendor's collection
 * endpoint, so far-away, lossy, or offline viewers show slow, retried,
 * queued, or dropped hits: the root of most "why don't the vendors agree"
 * questions.
 */

export interface Rendition {
  id: string;
  label: string;
  width: number;
  height: number;
  bitrateKbps: number;
  url: string;
}

/* ------------------------------------------------------------------ */
/* Places                                                             */
/* ------------------------------------------------------------------ */

export interface Place {
  id: string;
  label: string;
  lat: number;
  lon: number;
  /** Extra backhaul latency (ms RTT) for places far from trunk lines. */
  extraMs?: number;
  note?: string;
}

export const LOCATIONS: Place[] = [
  { id: 'seattle', label: 'Seattle, WA (west)', lat: 47.61, lon: -122.33 },
  { id: 'los_angeles', label: 'Los Angeles, CA (west)', lat: 34.05, lon: -118.24 },
  { id: 'chicago', label: 'Chicago, IL (central)', lat: 41.88, lon: -87.63 },
  { id: 'dallas', label: 'Dallas, TX (central)', lat: 32.78, lon: -96.8 },
  { id: 'new_york', label: 'New York, NY (east)', lat: 40.71, lon: -74.01 },
  { id: 'ashburn_dc', label: 'Inside us-east-1, Ashburn VA (same DC as origin)', lat: 39.04, lon: -77.49, note: 'Sits in the same data center as the origin and the Ashburn edge.' },
  { id: 'rural_ne', label: 'Sandhills, Cherry County NE (remote rural)', lat: 42.42, lon: -101.06, extraMs: 28, note: 'Hours from a fiber trunk; traffic backhauls through long copper and radio links.' },
  { id: 'fairbanks', label: 'Fairbanks, AK', lat: 64.84, lon: -147.72, extraMs: 18 },
  { id: 'honolulu', label: 'Honolulu, HI', lat: 21.31, lon: -157.86, extraMs: 6 },
  { id: 'sao_paulo', label: 'São Paulo, Brazil', lat: -23.55, lon: -46.63 },
  { id: 'london', label: 'London, UK', lat: 51.51, lon: -0.13 },
  { id: 'mumbai', label: 'Mumbai, India', lat: 19.08, lon: 72.88 },
  { id: 'sydney', label: 'Sydney, Australia', lat: -33.87, lon: 151.21 },
];

/** CDN edges the player can be routed to. */
export const POPS: Place[] = [
  { id: 'pop_seattle', label: 'Seattle edge', lat: 47.61, lon: -122.33 },
  { id: 'pop_los_angeles', label: 'Los Angeles edge', lat: 34.05, lon: -118.24 },
  { id: 'pop_dallas', label: 'Dallas edge', lat: 32.78, lon: -96.8 },
  { id: 'pop_chicago', label: 'Chicago edge', lat: 41.88, lon: -87.63 },
  { id: 'pop_ashburn', label: 'Ashburn edge', lat: 39.04, lon: -77.49 },
  { id: 'pop_new_york', label: 'New York edge', lat: 40.71, lon: -74.01 },
  { id: 'pop_london', label: 'London edge', lat: 51.51, lon: -0.13 },
  { id: 'pop_sao_paulo', label: 'São Paulo edge', lat: -23.55, lon: -46.63 },
  { id: 'pop_sydney', label: 'Sydney edge', lat: -33.87, lon: 151.21 },
];

/** Origin behind the CDN (cache misses, or "origin only" mode). */
export const ORIGIN: Place = { id: 'origin', label: 'Origin, us-east-1 Ashburn', lat: 39.04, lon: -77.49 };

/* ------------------------------------------------------------------ */
/* Connections                                                        */
/* ------------------------------------------------------------------ */

export interface Connection {
  id: string;
  label: string;
  /** Downlink / uplink, kbps. */
  kbps: number;
  upKbps: number;
  /** Last-mile round-trip latency, ms. */
  rttMs: number;
  /** Packet loss, percent. */
  lossPct: number;
  /** Random variation applied each second, as a fraction of throughput. */
  jitter: number;
  /** Random-walk the link speed (flaky mobile). */
  wander?: [number, number];
  /** Performance-enhancing proxy multiplier (satellite ISPs split TCP to hide latency). */
  pep?: number;
}

export const CONNECTIONS: Connection[] = [
  { id: 'unthrottled', label: 'Lab LAN (unthrottled)', kbps: 1_000_000, upKbps: 1_000_000, rttMs: 1, lossPct: 0, jitter: 0 },
  { id: 'datacenter', label: 'Data-center link (10 GbE)', kbps: 10_000_000, upKbps: 10_000_000, rttMs: 0.3, lossPct: 0, jitter: 0 },
  { id: 'fiber', label: 'Fiber 500 Mbps', kbps: 500_000, upKbps: 500_000, rttMs: 4, lossPct: 0, jitter: 0.03 },
  { id: 'cable', label: 'Cable 100 Mbps', kbps: 100_000, upKbps: 10_000, rttMs: 14, lossPct: 0.01, jitter: 0.08 },
  { id: 'dsl', label: 'Rural DSL 3 Mbps', kbps: 3_000, upKbps: 512, rttMs: 38, lossPct: 0.4, jitter: 0.15 },
  { id: '5g', label: '5G 150 Mbps', kbps: 150_000, upKbps: 20_000, rttMs: 25, lossPct: 0.1, jitter: 0.2 },
  { id: 'lte', label: '4G LTE 12 Mbps', kbps: 12_000, upKbps: 4_000, rttMs: 50, lossPct: 0.3, jitter: 0.25 },
  { id: '3g', label: '3G 1.5 Mbps', kbps: 1_500, upKbps: 500, rttMs: 150, lossPct: 1, jitter: 0.3 },
  { id: 'edge', label: '2G EDGE 200 kbps', kbps: 200, upKbps: 80, rttMs: 400, lossPct: 2, jitter: 0.3 },
  { id: 'satellite', label: 'GEO satellite 25 Mbps', kbps: 25_000, upKbps: 3_000, rttMs: 600, lossPct: 0.5, jitter: 0.15, pep: 8 },
  { id: 'starlink', label: 'Starlink (LEO) 100 Mbps', kbps: 100_000, upKbps: 10_000, rttMs: 35, lossPct: 0.2, jitter: 0.25 },
  { id: 'dialup', label: '56k dial-up', kbps: 50, upKbps: 33, rttMs: 150, lossPct: 1, jitter: 0.1 },
  { id: 'flaky', label: 'Flaky mobile (0.3–12 Mbps)', kbps: 6_000, upKbps: 1_500, rttMs: 80, lossPct: 1, jitter: 0.1, wander: [300, 12_000] },
  { id: 'offline', label: 'Offline', kbps: 0, upKbps: 0, rttMs: 0, lossPct: 100, jitter: 0 },
];

/** Back-compat alias: earlier code and play plans call these "profiles". */
export type NetworkProfile = Connection;
export const NETWORK_PROFILES = CONNECTIONS;

/* ------------------------------------------------------------------ */
/* Analytics collection endpoints                                     */
/* ------------------------------------------------------------------ */

const OREGON = { label: 'Oregon (us-west-2)', lat: 45.6, lon: -121.2 };
const VIRGINIA = { label: 'Virginia (us-east-1)', lat: 39.04, lon: -77.49 };
const FRANKFURT = { label: 'Frankfurt', lat: 50.11, lon: 8.68 };
const SINGAPORE = { label: 'Singapore', lat: 1.35, lon: 103.82 };
const SYDNEY = { label: 'Sydney', lat: -33.87, lon: 151.21 };
const SAO_PAULO = { label: 'São Paulo', lat: -23.55, lon: -46.63 };

interface Endpoint {
  host: string;
  /** Candidate regions; anycast/geo-DNS picks the nearest. */
  regions: { label: string; lat: number; lon: number }[];
  /** Library queues and retries failed hits (analytics.js persists to localStorage). */
  retries: boolean;
  serverMs: number;
}

export const ENDPOINTS: Record<string, Endpoint> = {
  ga4: { host: 'region1.google-analytics.com', regions: [OREGON, VIRGINIA, { label: 'Iowa', lat: 41.26, lon: -95.86 }, FRANKFURT, SINGAPORE, SYDNEY, SAO_PAULO], retries: false, serverMs: 8 },
  adobe_aa: { host: 'jfwdemo.sc.omtrdc.net', regions: [OREGON, VIRGINIA, { label: 'London', lat: 51.51, lon: -0.13 }, SINGAPORE, SYDNEY], retries: false, serverMs: 15 },
  adobe_media: { host: 'edge.adobedc.net', regions: [OREGON, VIRGINIA, FRANKFURT, SINGAPORE, SYDNEY], retries: false, serverMs: 20 },
  segment: { host: 'api.segment.io', regions: [OREGON], retries: true, serverMs: 12 },
  tealium: { host: 'collect.tealiumiq.com', regions: [VIRGINIA, OREGON, FRANKFURT, SYDNEY], retries: false, serverMs: 15 },
};

export interface BeaconTiming {
  endpoint: string;
  distanceKm: number;
  latencyMs: number;
  attempts: number;
  status: 'delivered' | 'slow' | 'retried' | 'queued' | 'dropped';
  newConnection: boolean;
}

/* ------------------------------------------------------------------ */
/* Path math                                                          */
/* ------------------------------------------------------------------ */

const toRad = (d: number) => (d * Math.PI) / 180;
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Light in fiber covers ~200 km/ms; real routes run ~1.6x the great-circle distance. */
const propagationRttMs = (km: number) => (2 * km * 1.6) / 200;

/**
 * Throughput one TCP flow sustains at this RTT and loss, or window-limited when
 * lossless. The Mathis formula models classic Reno; CDNs run CUBIC/BBR, which
 * hold up several times better under (mostly non-congestion) wireless loss.
 */
const MODERN_TCP_FACTOR = 4;
function tcpCapKbps(rttMs: number, lossPct: number, pep = 1) {
  const rttS = Math.max(rttMs, 0.2) / 1000;
  if (lossPct <= 0) return (8 * 16 * 1024 * 1024) / rttS / 1000; // 16 MB autotuned window
  const mssBits = 1460 * 8;
  return ((mssBits / rttS) * (1.22 / Math.sqrt(lossPct / 100)) * pep * MODERN_TCP_FACTOR) / 1000;
}

export interface PathInfo {
  location: Place;
  connection: Connection;
  server: Place;
  serverKind: 'edge' | 'origin';
  routing: string;
  distanceKm: number;
  rttMs: number;
  lossPct: number;
  linkKbps: number;
  throughputKbps: number;
}

const MAX_BUFFER_S = 30;
const START_THRESHOLD_S = 2;
const RESUME_THRESHOLD_S = 3;
const SEGMENT_S = 4;

export class NetworkSim {
  profile: Connection = CONNECTIONS[0];
  location: Place = LOCATIONS[0];
  /** 'auto' = nearest edge, 'origin' = no CDN, or a POP id to force routing. */
  routing = 'auto';
  path!: PathInfo;
  /** Current instantaneous throughput. */
  bandwidthKbps = 0;
  /** Smoothed estimate the ABR logic sees (like a real player's estimator). */
  estimateKbps = 0;
  bufferSeconds = 0;
  private walk = 3000;
  private lastSample = 0;
  /** No data flows until the current request round trips complete. */
  private idleUntil = 0;
  private warm = new Set<string>();

  constructor() {
    this.recompute();
    this.sample(true);
  }

  /* -------------------------- configuration -------------------------- */

  setProfile(id: string) {
    const c = CONNECTIONS.find((x) => x.id === id);
    if (!c) return false;
    this.profile = c;
    this.walk = c.kbps;
    this.recompute();
    return true;
  }

  setLocation(id: string) {
    const l = LOCATIONS.find((x) => x.id === id);
    if (!l) return false;
    this.location = l;
    this.recompute();
    return true;
  }

  setRouting(mode: string) {
    if (mode !== 'auto' && mode !== 'origin' && !POPS.some((p) => p.id === mode)) return false;
    this.routing = mode;
    this.recompute();
    return true;
  }

  private recompute() {
    const loc = this.location;
    const conn = this.profile;
    let server: Place;
    let serverKind: PathInfo['serverKind'] = 'edge';
    if (this.routing === 'origin') {
      server = ORIGIN;
      serverKind = 'origin';
    } else if (this.routing === 'auto') {
      server = POPS.reduce((best, p) => (distanceKm(loc, p) < distanceKm(loc, best) ? p : best), POPS[0]);
    } else {
      server = POPS.find((p) => p.id === this.routing)!;
    }
    const km = distanceKm(loc, server);
    // Origin requests skip the edge cache and pay origin processing time.
    const serverMs = serverKind === 'origin' ? 35 : 2;
    const rttMs = conn.id === 'offline' ? 0 : propagationRttMs(km) + (loc.extraMs ?? 0) + conn.rttMs + serverMs;
    const lossPct = conn.id === 'offline' ? 100 : conn.lossPct + (km > 8000 ? 0.15 : 0);
    const linkKbps = conn.kbps;
    const throughputKbps = conn.id === 'offline' ? 0 : Math.min(linkKbps, tcpCapKbps(rttMs, lossPct, conn.pep));
    this.path = {
      location: loc,
      connection: conn,
      server,
      serverKind,
      routing: this.routing,
      distanceKm: Math.round(km),
      rttMs: Math.round(rttMs * 10) / 10,
      lossPct: Math.round(lossPct * 100) / 100,
      linkKbps,
      throughputKbps: Math.round(throughputKbps),
    };
    this.warm.clear();
    this.sample(true);
  }

  /* ----------------------------- sampling ---------------------------- */

  /** Re-sample throughput roughly once a second. */
  sample(force = false) {
    const now = performance.now();
    if (!force && now - this.lastSample < 1000) return;
    this.lastSample = now;
    const c = this.profile;
    let base = this.path?.throughputKbps ?? c.kbps;
    if (c.wander) {
      this.walk *= Math.exp((Math.random() - 0.5) * 0.9);
      this.walk = Math.min(c.wander[1], Math.max(c.wander[0], this.walk));
      base = Math.min(this.walk, tcpCapKbps(this.path?.rttMs ?? c.rttMs, this.path?.lossPct ?? c.lossPct));
    }
    this.bandwidthKbps = Math.max(0, base * (1 + (Math.random() * 2 - 1) * c.jitter));
    this.estimateKbps = force ? this.bandwidthKbps : this.estimateKbps * 0.7 + this.bandwidthKbps * 0.3;
  }

  /**
   * Drop what is buffered (seek, rendition switch). A new request has to make
   * round trips before data flows: 'new' = DNS + TCP + TLS (3 RTT), 'reuse' = 1 RTT.
   */
  flush(keepSeconds = 0, setup: 'new' | 'reuse' = 'reuse') {
    this.bufferSeconds = Math.min(this.bufferSeconds, keepSeconds);
    const rtts = setup === 'new' ? 3 : 1;
    this.idleUntil = performance.now() + this.path.rttMs * rtts;
  }

  /**
   * Advance the model. Returns 'stall' when playback must stop for data and
   * 'ready' when a stalled/starting player has enough buffered to go.
   */
  tick(dt: number, opts: { playing: boolean; rate: number; bitrateKbps: number; waiting: boolean; startup: boolean }) {
    this.sample();
    const flowing = performance.now() >= this.idleUntil && this.bandwidthKbps > 0;
    if (flowing && this.bufferSeconds < MAX_BUFFER_S && opts.bitrateKbps > 0) {
      // Each segment costs one round trip plus its transfer time.
      const transferS = (SEGMENT_S * opts.bitrateKbps) / this.bandwidthKbps;
      const perSegmentS = this.path.rttMs / 1000 + transferS;
      this.bufferSeconds += dt * (SEGMENT_S / perSegmentS);
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

  /* ------------------------------ beacons ---------------------------- */

  /**
   * Time one analytics request from this viewer to a vendor's collection
   * endpoint. New connections pay DNS + TCP + TLS; later hits reuse them.
   */
  beacon(vendor: string, bytes: number): BeaconTiming | null {
    const ep = ENDPOINTS[vendor];
    if (!ep) return null;
    const loc = this.location;
    const conn = this.profile;
    const region = ep.regions.reduce((best, r) => (distanceKm(loc, r) < distanceKm(loc, best) ? r : best), ep.regions[0]);
    const km = Math.round(distanceKm(loc, region));
    const endpoint = `${ep.host} · ${region.label}`;
    if (conn.id === 'offline') {
      return { endpoint, distanceKm: km, latencyMs: 0, attempts: 1, status: ep.retries ? 'queued' : 'dropped', newConnection: false };
    }
    const rtt = propagationRttMs(km) + (loc.extraMs ?? 0) + conn.rttMs;
    const fresh = !this.warm.has(vendor);
    this.warm.add(vendor);
    const setupMs = fresh ? 3 * rtt : 0;
    const uploadMs = (bytes * 8) / Math.max(1, conn.upKbps);
    const jitterMs = rtt * conn.jitter * Math.random();
    let latency = setupMs + rtt + uploadMs + ep.serverMs + jitterMs;
    // A request fails when loss stalls it past the library's timeout.
    const failChance = Math.min(0.6, (conn.lossPct / 100) * (6 + Math.ceil(bytes / 1460)));
    let attempts = 1;
    let status: BeaconTiming['status'] = 'delivered';
    if (Math.random() < failChance) {
      if (ep.retries) {
        attempts = 2;
        latency += 1000 + rtt * 2; // backoff, then a second try on a warm connection
        status = 'retried';
      } else {
        status = 'dropped';
      }
    }
    if (status === 'delivered' && latency > 2000) status = 'slow';
    return { endpoint, distanceKm: km, latencyMs: Math.round(latency), attempts, status, newConnection: fresh };
  }
}
