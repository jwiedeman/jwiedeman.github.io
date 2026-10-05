/**
 * Canonical event model for the mock player.
 *
 * Every interaction produces one canonical event. Destination mappers
 * (mappers.ts) translate it into vendor shapes, so the player only has to
 * describe what happened once.
 */

export type EventCategory =
  | 'session'
  | 'playback'
  | 'progress'
  | 'seek'
  | 'buffer'
  | 'quality'
  | 'ad'
  | 'ui'
  | 'device'
  | 'error'
  | 'slate'
  | 'chapter'
  | 'engagement'
  | 'gate'
  | 'identity';

export type PlayerState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'seeking'
  | 'ad'
  | 'ended'
  | 'held'
  | 'error';

export interface PlayerContext {
  name: string;
  version: string;
  state: PlayerState;
  formFactor: string;
  orientation: 'portrait' | 'landscape';
  fullscreen: boolean;
  pip: boolean;
  miniPlayer: boolean;
  theater: boolean;
  muted: boolean;
  volume: number;
  playbackRate: number;
  captions: boolean;
  autoplay: boolean;
}

export interface ContentContext {
  id: string;
  title: string;
  streamType: 'vod' | 'live';
  duration: number;
  position: number;
  percent: number;
  playlistIndex: number;
  playlistLength: number;
}

export interface AdContext {
  breakId: string;
  breakType: 'preroll' | 'midroll' | 'postroll';
  breakPosition: number;
  adId: string;
  adTitle: string;
  podIndex: number;
  podSize: number;
  duration: number;
  position: number;
  skippable: boolean;
  advertiser: string;
  /** linear = standard video ad, bumper = 6 s unskippable */
  adType: 'linear' | 'bumper';
  /** csai = client-side (separate ad player), ssai = server-side stitched into the stream */
  insertion: 'csai' | 'ssai';
  /** Ads are served without personal data when advertising consent is denied. */
  personalized: boolean;
}

export interface QoeContext {
  rendition: string;
  bitrateKbps: number;
  resolution: string;
  bandwidthKbps: number;
  bufferSeconds: number;
  startupMs: number | null;
  rebufferCount: number;
  rebufferMs: number;
  droppedFrames: number;
  timePlayedSeconds: number;
  abr: 'auto' | 'manual';
  /** Connection type id (fiber, lte, satellite, dialup, …). */
  network: string;
  /** Simulated network path from the viewer to the CDN. */
  viewerLocation: string;
  cdnServer: string;
  rttMs: number;
  lossPct: number;
  throughputKbps: number;
}

/** Who is watching: what enterprise analytics stacks attach to every hit. */
export interface UserContext {
  anonymousId: string;
  /** GA client id (_ga cookie value): random.firstSeenSeconds */
  gaClientId: string;
  /** Adobe Experience Cloud ID (AMCV / kndctr cookie) */
  ecid: string;
  userId: string | null;
  loggedIn: boolean;
  tier: 'anonymous' | 'registered' | 'subscriber';
  analyticsSessionId: string;
  sessionNumber: number;
  sessionStartedAt: string;
  isNewVisitor: boolean;
  firstSeen: string;
  consent: { analytics: boolean; advertising: boolean; personalization: boolean; decided: boolean };
  experiment: { id: string; variant: string };
}

/** Where they are watching: page, campaign, and device context. */
export interface PageContext {
  url: string;
  path: string;
  title: string;
  referrer: string;
  search: string;
  campaign: { source: string; medium: string; name: string; term?: string; content?: string } | null;
  language: string;
  timezone: string;
  screen: string;
  viewport: string;
  colorDepth: number;
  userAgent: string;
  browser: string;
  os: string;
  deviceType: string;
  connection: string;
  pageViewId: string;
}

export interface EventContext {
  user: UserContext;
  page: PageContext;
}

export interface CanonicalEvent {
  event: string;
  category: EventCategory;
  seq: number;
  timestamp: string;
  sessionId: string;
  params: Record<string, unknown>;
  player: PlayerContext;
  content: ContentContext | null;
  ad: AdContext | null;
  qoe: QoeContext;
  context: EventContext;
}

/** Human descriptions, used by the event reference table and console tooltips. */
export const EVENT_CATALOG: Record<string, { category: EventCategory; description: string }> = {
  session_start: { category: 'session', description: 'Player loaded a piece of content and a viewing session began.' },
  session_end: { category: 'session', description: 'Session closed (content changed, page hidden, or reset) with QoE totals.' },
  content_loaded: { category: 'session', description: 'Metadata for the selected rendition is available (duration, size).' },
  playback_requested: { category: 'playback', description: 'Viewer pressed play for the first time (start of startup timer).' },
  playback_started: { category: 'playback', description: 'First frame of content rendered. Carries startup time.' },
  play: { category: 'playback', description: 'Playback resumed after a user pause.' },
  pause: { category: 'playback', description: 'Viewer paused playback.' },
  heartbeat: { category: 'progress', description: 'Every 10 s of playing time (Adobe-style ping).' },
  milestone: { category: 'progress', description: 'Crossed a percent milestone (10/25/50/75/90/95).' },
  content_completed: { category: 'progress', description: 'Reached the end of the content.' },
  seek_start: { category: 'seek', description: 'Scrub or skip began. Carries the from-position.' },
  seek_complete: { category: 'seek', description: 'Playhead settled at the new position.' },
  buffer_start: { category: 'buffer', description: 'Playback stalled waiting for data (simulated or real network).' },
  buffer_end: { category: 'buffer', description: 'Enough data buffered; playback continues. Carries stall duration.' },
  bitrate_change: { category: 'quality', description: 'Rendition switched, by ABR or by the viewer.' },
  quality_mode_change: { category: 'quality', description: 'Quality setting changed between Auto and a fixed rendition.' },
  network_change: { category: 'quality', description: 'Network path changed: connection type, viewer location, or CDN routing. Carries RTT and throughput.' },
  ad_break_start: { category: 'ad', description: 'An ad pod began (pre, mid, or post-roll).' },
  ad_start: { category: 'ad', description: 'An individual ad in the pod started.' },
  ad_quartile: { category: 'ad', description: 'Ad crossed 25 / 50 / 75 percent.' },
  ad_skip: { category: 'ad', description: 'Viewer skipped a skippable ad.' },
  ad_click: { category: 'ad', description: 'Viewer clicked the ad (click-through).' },
  ad_complete: { category: 'ad', description: 'Ad played to the end.' },
  ad_break_end: { category: 'ad', description: 'Ad pod finished; content resumes.' },
  volume_change: { category: 'ui', description: 'Volume level changed (debounced).' },
  mute: { category: 'ui', description: 'Audio muted.' },
  unmute: { category: 'ui', description: 'Audio unmuted.' },
  rate_change: { category: 'ui', description: 'Playback speed changed.' },
  captions_on: { category: 'ui', description: 'Closed captions enabled.' },
  captions_off: { category: 'ui', description: 'Closed captions disabled.' },
  fullscreen_enter: { category: 'ui', description: 'Entered fullscreen (native API or simulated in a device frame).' },
  fullscreen_exit: { category: 'ui', description: 'Left fullscreen.' },
  pip_enter: { category: 'ui', description: 'Entered picture-in-picture (native) or the floating mini-player.' },
  pip_exit: { category: 'ui', description: 'Left picture-in-picture or the mini-player.' },
  theater_on: { category: 'ui', description: 'Theater (wide) mode on.' },
  theater_off: { category: 'ui', description: 'Theater mode off.' },
  playlist_next: { category: 'ui', description: 'Moved to the next item (button or autoplay).' },
  playlist_previous: { category: 'ui', description: 'Moved to the previous item.' },
  autoplay_toggle: { category: 'ui', description: 'Autoplay-next setting changed.' },
  go_live: { category: 'seek', description: 'Live stream: jumped back to the live edge.' },
  form_factor_change: { category: 'device', description: 'Switched device type (desktop, mobile, tablet, TV, embed).' },
  orientation_change: { category: 'device', description: 'Device rotated between portrait and landscape.' },
  visibility_change: { category: 'device', description: 'Page hidden or shown (tab switch, app background).' },
  error: { category: 'error', description: 'Playback, network, DRM, or ad error. Carries code and fatality.' },
  error_recovered: { category: 'error', description: 'Player retried and recovered from a non-fatal error.' },

  // Ads beyond linear pods
  overlay_ad_impression: { category: 'ad', description: 'Non-linear overlay banner shown over playing content.' },
  overlay_ad_click: { category: 'ad', description: 'Viewer clicked the overlay banner.' },
  overlay_ad_close: { category: 'ad', description: 'Viewer closed the overlay banner.' },
  companion_impression: { category: 'ad', description: 'Companion display banner shown beside the player during a linear ad.' },
  companion_click: { category: 'ad', description: 'Viewer clicked the companion banner.' },
  pause_ad_impression: { category: 'ad', description: 'Pause ad shown while content is paused.' },
  pause_ad_click: { category: 'ad', description: 'Viewer clicked the pause ad.' },

  // Slates
  slate_start: { category: 'slate', description: 'A slate covers the content (pre-show, technical difficulties, ad filler).' },
  slate_end: { category: 'slate', description: 'Slate removed; carries how long it was up.' },

  // Chapters, calls to action, engagement
  chapter_start: { category: 'chapter', description: 'Playhead entered a chapter.' },
  chapter_complete: { category: 'chapter', description: 'Chapter played through to its end.' },
  chapter_skip: { category: 'chapter', description: 'Viewer left a chapter early by seeking or skipping.' },
  skip_intro: { category: 'engagement', description: 'Viewer pressed Skip intro.' },
  cta_impression: { category: 'engagement', description: 'Timed call-to-action shown over the video.' },
  cta_click: { category: 'engagement', description: 'Viewer clicked the call-to-action.' },
  endcard_impression: { category: 'engagement', description: 'End card (watch next + subscribe) shown when content ends.' },
  endcard_click: { category: 'engagement', description: 'Viewer picked a recommendation on the end card.' },
  subscribe_click: { category: 'engagement', description: 'Viewer clicked Subscribe.' },
  resume_prompt: { category: 'engagement', description: 'Offered to resume from the saved position.' },
  resume_accept: { category: 'engagement', description: 'Viewer resumed from the saved position.' },
  resume_decline: { category: 'engagement', description: 'Viewer chose to start over.' },
  share: { category: 'engagement', description: 'Viewer shared the video (copy link with timestamp).' },
  like: { category: 'engagement', description: 'Viewer liked the video.' },
  unlike: { category: 'engagement', description: 'Viewer removed their like.' },
  cast_start: { category: 'device', description: 'Started casting to a TV (simulated Chromecast/AirPlay).' },
  cast_end: { category: 'device', description: 'Stopped casting; playback returns to this device.' },
  audio_track_change: { category: 'ui', description: 'Switched audio track (e.g. to audio description).' },

  // Gates and identity
  gate_shown: { category: 'gate', description: 'A gate blocked playback (consent, age, registration, geo).' },
  gate_passed: { category: 'gate', description: 'Viewer cleared the gate.' },
  gate_failed: { category: 'gate', description: 'Viewer did not meet the gate (e.g. under age, outside region).' },
  gate_dismissed: { category: 'gate', description: 'Viewer closed the gate without clearing it.' },
  consent_update: { category: 'identity', description: 'Consent choices changed; vendors re-evaluate what they may send.' },
  sign_in: { category: 'identity', description: 'Viewer signed in; the anonymous ID is linked to a user ID (identify).' },
  sign_out: { category: 'identity', description: 'Viewer signed out.' },
  identity_reset: { category: 'identity', description: 'Simulated a brand-new visitor (new anonymous ID, cookies cleared).' },
  campaign_arrival: { category: 'identity', description: 'Simulated landing from a campaign link (UTM parameters).' },
  page_view: { category: 'identity', description: 'Page loaded; the hit every vendor sends before any video event.' },
};

export type Listener = (e: CanonicalEvent) => void;

export class EventBus {
  private listeners = new Set<Listener>();
  /** Supplies user + page context for every event (set by the identity module). */
  contextProvider: () => EventContext = () => ({ user: {} as UserContext, page: {} as PageContext });
  private seq = 0;
  sessionId = newSessionId();
  readonly history: CanonicalEvent[] = [];

  on(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  newSession() {
    this.sessionId = newSessionId();
  }

  emit(
    event: string,
    params: Record<string, unknown>,
    snapshot: { player: PlayerContext; content: ContentContext | null; ad: AdContext | null; qoe: QoeContext }
  ) {
    const meta = EVENT_CATALOG[event];
    const e: CanonicalEvent = {
      event,
      category: meta?.category ?? 'ui',
      seq: ++this.seq,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      params,
      ...structuredClone(snapshot),
      context: structuredClone(this.contextProvider()),
    };
    this.history.push(e);
    if (this.history.length > 2000) this.history.shift();
    for (const fn of this.listeners) {
      try {
        fn(e);
      } catch (err) {
        console.error('[mock-player] listener failed', err);
      }
    }
    return e;
  }
}

function newSessionId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}
