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
  | 'error';

export type PlayerState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'seeking'
  | 'ad'
  | 'ended'
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
  network: string;
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
  network_change: { category: 'quality', description: 'Simulated network profile changed.' },
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
};

export type Listener = (e: CanonicalEvent) => void;

export class EventBus {
  private listeners = new Set<Listener>();
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
