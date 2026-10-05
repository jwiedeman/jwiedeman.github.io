/**
 * MockPlayer: a real HTML5 video player with every behaviour an analytics
 * implementation has to handle, instrumented through one canonical event bus.
 */
import { EventBus, type AdContext, type ContentContext, type PlayerContext, type PlayerState, type QoeContext } from './events';
import { NetworkSim, NETWORK_PROFILES, type Rendition } from './network';

export interface CatalogItem {
  slug: string;
  kind: 'vod' | 'live' | 'ad';
  title: string;
  center?: string;
  date?: string;
  duration: number;
  poster: string | null;
  captions: string | null;
  renditions: Rendition[];
}

export type FormFactor = 'desktop' | 'mobile' | 'tablet' | 'ctv' | 'embed';
export type ErrorKind = 'media_decode' | 'network_404' | 'drm_license' | 'ad_vast_303' | 'bandwidth_crash';

export interface AdSchedule {
  preroll: boolean;
  midroll: boolean;
  postroll: boolean;
  skippable: boolean;
  podSize: number;
}

interface AdBreak {
  id: string;
  type: AdContext['breakType'];
  index: number;
  at: number; // content seconds; -1 = postroll
  played: boolean;
}

const PLAYER_NAME = 'jfw-mock-player';
const PLAYER_VERSION = '1.0.0';
const MILESTONES = [10, 25, 50, 75, 90, 95];
const HEARTBEAT_S = 10;
const LIVE_DVR_S = 180;
const SKIP_AFTER_S = 5;
const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return '0:00';
  const neg = s < 0;
  s = Math.abs(Math.floor(s));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return (neg ? '-' : '') + (h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`);
};

const ICONS = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/><text x="12" y="16.5" font-size="6.5" text-anchor="middle" font-family="monospace" fill="currentColor">10</text></svg>',
  fwd: '<svg viewBox="0 0 24 24"><path d="M12 5V2l5 4-5 4V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z"/><text x="12" y="16.5" font-size="6.5" text-anchor="middle" font-family="monospace" fill="currentColor">10</text></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM9.5 12 19 5v14z"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM14.5 12 5 19V5z"/></svg>',
  vol: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9zM15.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM13 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
  muted: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9zm13.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4z"/></svg>',
  cc: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zm2 2v10h14V7zm2 3h4v1.5H8.5v1h2.5V14H7zm6 0h4v1.5h-2.5v1H17V14h-4z"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.3 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.3-2.9a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>',
  pip: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zm2 2v10h14V7zm6 5h7v4h-7z"/></svg>',
  mini: '<svg viewBox="0 0 24 24"><path d="M3 5h18v6h-2V7H5v10h6v2H3zm10 8h8v6h-8z"/></svg>',
  theater: '<svg viewBox="0 0 24 24"><path d="M2 7h20v10H2zm2 2v6h16V9z"/></svg>',
  fs: '<svg viewBox="0 0 24 24"><path d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z"/></svg>',
  fsExit: '<svg viewBox="0 0 24 24"><path d="M8 4h2v6H4V8h4zm6 0h2v4h4v2h-6zM4 14h6v6H8v-4H4zm10 0h6v2h-4v4h-2z"/></svg>',
  rotate: '<svg viewBox="0 0 24 24"><path d="M7 3h7a3 3 0 0 1 3 3v6h-2V6a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3v2H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm9 12 4 4-4 4v-3h-4v-2h4z"/></svg>',
};

export class MockPlayer {
  readonly bus = new EventBus();
  readonly net = new NetworkSim();
  readonly root: HTMLElement;
  readonly video: HTMLVideoElement;
  private adVideo: HTMLVideoElement;
  private el: Record<string, HTMLElement> = {};

  catalog: CatalogItem[];
  content: CatalogItem[];
  adCreative: CatalogItem | undefined;
  index = 0;
  item!: CatalogItem;

  state: PlayerState = 'idle';
  formFactor: FormFactor = 'desktop';
  orientation: 'portrait' | 'landscape' = 'landscape';
  fullscreen = false;
  fullscreenType: 'native' | 'simulated' | null = null;
  pip = false;
  miniPlayer = false;
  theater = false;
  captions = false;
  autoplayNext = true;
  quality: 'auto' | string = 'auto';
  rendition!: Rendition;
  schedule: AdSchedule = { preroll: true, midroll: true, postroll: false, skippable: true, podSize: 2 };

  // per-session
  private sessionOpen = false;
  private started = false;
  private requestedAt = 0;
  private startupMs: number | null = null;
  private rebufferCount = 0;
  private rebufferMs = 0;
  private timePlayed = 0;
  private heartbeatAcc = 0;
  private milestonesFired = new Set<number>();
  private completed = false;
  private breaks: AdBreak[] = [];

  // transient
  private waitingFor: 'none' | 'startup' | 'stall' | 'seek' = 'none';
  private stallStartedAt = 0;
  private internalPause = false;
  private switching = false;
  private seekFrom: number | null = null;
  private scrubbing = false;
  private lastTick = 0;
  private lastAbrSwitch = 0;
  private volumeTimer: number | undefined;
  private volumeFrom = 1;
  private hideTimer: number | undefined;
  private nextTimer: number | undefined;
  private fatal = false;
  private liveStartedAt = 0;
  private liveStartOffset = 0;
  private announceLoaded = false;
  private contentRequestedAt = 0;
  /** Renditions that failed this session; ABR will not return to them. */
  private blocked = new Set<string>();
  private tvFocus: HTMLElement | null = null;

  // ads
  private adState: {
    brk: AdBreak;
    pod: number;
    podSize: number;
    adId: string;
    quartiles: Set<number>;
    resume: () => void;
  } | null = null;

  constructor(root: HTMLElement, catalog: CatalogItem[]) {
    this.root = root;
    this.catalog = catalog;
    this.content = catalog.filter((c) => c.kind !== 'ad');
    this.adCreative = catalog.find((c) => c.kind === 'ad');
    this.root.classList.add('mp');
    this.root.tabIndex = 0;
    this.root.dataset.ff = this.formFactor;
    this.root.dataset.orientation = this.orientation;
    this.root.innerHTML = this.template();
    root.querySelectorAll<HTMLElement>('[data-el]').forEach((n) => (this.el[n.dataset.el!] = n));
    this.video = this.el.video as HTMLVideoElement;
    this.adVideo = this.el.adVideo as HTMLVideoElement;
    this.bindVideo();
    this.bindControls();
    this.bindKeys();
    this.bindDocument();
    this.renderPlaylist();
    this.renderSettings();
    this.lastTick = performance.now();
    window.setInterval(() => this.tick(), 250);
  }

  /* ---------------------------------------------------------------- */
  /* Snapshot used by every event                                     */
  /* ---------------------------------------------------------------- */

  private isLive() {
    return this.item?.kind === 'live';
  }

  private liveEdge() {
    if (!this.isLive()) return this.item?.duration ?? 0;
    const elapsed = (performance.now() - this.liveStartedAt) / 1000;
    return Math.min(this.item.duration - 0.5, this.liveStartOffset + elapsed);
  }

  snapshot(): { player: PlayerContext; content: ContentContext | null; ad: AdContext | null; qoe: QoeContext } {
    const v = this.video;
    const duration = this.isLive() ? 0 : this.item?.duration ?? 0;
    const position = v.currentTime || 0;
    const q = v.getVideoPlaybackQuality?.();
    let ad: AdContext | null = null;
    if (this.adState && this.adCreative) {
      const s = this.adState;
      ad = {
        breakId: s.brk.id,
        breakType: s.brk.type,
        breakPosition: s.brk.index,
        adId: s.adId,
        adTitle: `${this.adCreative.title} (${s.pod}/${s.podSize})`,
        podIndex: s.pod,
        podSize: s.podSize,
        duration: this.adVideo.duration || this.adCreative.duration,
        position: this.adVideo.currentTime || 0,
        skippable: this.schedule.skippable,
        advertiser: 'NASA Goddard',
      };
    }
    return {
      player: {
        name: PLAYER_NAME,
        version: PLAYER_VERSION,
        state: this.state,
        formFactor: this.formFactor,
        orientation: this.orientation,
        fullscreen: this.fullscreen,
        pip: this.pip,
        miniPlayer: this.miniPlayer,
        theater: this.theater,
        muted: v.muted,
        volume: Math.round(v.volume * 100) / 100,
        playbackRate: v.playbackRate,
        captions: this.captions,
        autoplay: this.autoplayNext,
      },
      content: this.item
        ? {
            id: this.item.slug,
            title: this.item.title,
            streamType: this.isLive() ? 'live' : 'vod',
            duration,
            position: Math.round(position * 100) / 100,
            percent: duration ? Math.min(100, Math.round((position / duration) * 1000) / 10) : 0,
            playlistIndex: this.index,
            playlistLength: this.content.length,
          }
        : null,
      ad,
      qoe: {
        rendition: this.rendition?.id ?? '',
        bitrateKbps: this.rendition?.bitrateKbps ?? 0,
        resolution: this.rendition?.label ?? '',
        bandwidthKbps: Math.round(this.net.bandwidthKbps),
        bufferSeconds: Math.round(this.net.bufferSeconds * 10) / 10,
        startupMs: this.startupMs,
        rebufferCount: this.rebufferCount,
        rebufferMs: Math.round(this.rebufferMs),
        droppedFrames: q?.droppedVideoFrames ?? 0,
        timePlayedSeconds: Math.round(this.timePlayed * 10) / 10,
        abr: this.quality === 'auto' ? 'auto' : 'manual',
        network: this.net.profile.id,
      },
    };
  }

  emit(event: string, params: Record<string, unknown> = {}) {
    return this.bus.emit(event, params, this.snapshot());
  }

  private setState(s: PlayerState) {
    this.state = s;
    this.root.dataset.state = s;
    this.el.play.innerHTML = s === 'playing' || s === 'buffering' || s === 'seeking' ? ICONS.pause : ICONS.play;
    this.el.play.setAttribute('aria-label', s === 'playing' ? 'Pause' : 'Play');
  }

  /* ---------------------------------------------------------------- */
  /* Loading content                                                  */
  /* ---------------------------------------------------------------- */

  load(target: number | string, opts: { autoplay?: boolean; reason?: string } = {}) {
    const idx = typeof target === 'number' ? target : this.content.findIndex((c) => c.slug === target);
    if (idx < 0 || idx >= this.content.length) return;
    this.endSession(opts.reason ?? 'content_change');
    window.clearTimeout(this.nextTimer);
    this.el.upnext.hidden = true;
    this.exitAd(false);

    this.index = idx;
    this.item = this.content[idx];
    this.bus.newSession();
    this.sessionOpen = true;
    this.started = false;
    this.startupMs = null;
    this.rebufferCount = 0;
    this.rebufferMs = 0;
    this.timePlayed = 0;
    this.heartbeatAcc = 0;
    this.milestonesFired.clear();
    this.blocked.clear();
    this.completed = false;
    this.fatal = false;
    this.waitingFor = 'none';
    this.el.error.hidden = true;
    this.net.flush(0);

    const d = this.item.duration;
    this.breaks = [];
    if (this.schedule.preroll) this.breaks.push({ id: 'break-pre', type: 'preroll', index: 0, at: 0, played: false });
    if (this.schedule.midroll && (this.isLive() || d > 60))
      this.breaks.push({ id: 'break-mid', type: 'midroll', index: 1, at: this.isLive() ? 90 : Math.round(d / 2), played: false });
    if (this.schedule.postroll && !this.isLive()) this.breaks.push({ id: 'break-post', type: 'postroll', index: 2, at: -1, played: false });

    if (this.isLive()) {
      this.liveStartOffset = Math.min(this.item.duration - 30, 240);
      this.liveStartedAt = performance.now();
    }

    this.announceLoaded = true;
    this.rendition = this.pickRendition();
    this.video.poster = this.item.poster ?? '';
    this.setSource(this.rendition, this.isLive() ? this.liveStartOffset : 0, false);
    this.setCaptionTrack();
    this.el.title.textContent = this.item.title;
    this.el.live.hidden = !this.isLive();
    this.root.classList.toggle('is-live', this.isLive());
    this.renderPlaylist();
    this.renderSettings();
    this.renderMarkers();
    this.setState('idle');
    this.emit('session_start', { reason: opts.reason ?? 'load', autoplay: !!opts.autoplay });
    if (opts.autoplay) this.play();
  }

  private pickRendition(): Rendition {
    const r = this.item.renditions;
    if (this.quality !== 'auto') return r.find((x) => x.id === this.quality) ?? r[0];
    return this.net.chooseRendition(this.usable(), this.rendition?.id ?? r[1]?.id ?? r[0].id);
  }

  private usable() {
    const ok = this.item.renditions.filter((r) => !this.blocked.has(r.id));
    return ok.length ? ok : this.item.renditions;
  }

  private setSource(r: Rendition, at: number, resume: boolean) {
    const v = this.video;
    this.switching = true;
    this.internalPause = true;
    v.src = r.url;
    v.load();
    const onMeta = () => {
      v.removeEventListener('loadedmetadata', onMeta);
      if (at > 0) v.currentTime = Math.min(at, (v.duration || at) - 0.2);
      this.switching = false;
      if (resume) this.resumeVideo();
      else this.internalPause = false;
    };
    v.addEventListener('loadedmetadata', onMeta);
  }

  private setCaptionTrack() {
    this.video.querySelectorAll('track').forEach((t) => t.remove());
    this.el.cc.toggleAttribute('disabled', !this.item.captions);
    if (!this.item.captions) return;
    const t = document.createElement('track');
    t.kind = 'captions';
    t.label = 'English';
    t.srclang = 'en';
    t.src = this.item.captions;
    this.video.append(t);
    t.track.mode = this.captions ? 'showing' : 'hidden';
  }

  private endSession(reason: string) {
    if (!this.sessionOpen) return;
    this.emit('session_end', {
      reason,
      completed: this.completed,
      timePlayedSeconds: Math.round(this.timePlayed),
      rebufferRatio: this.timePlayed ? Math.round((this.rebufferMs / 1000 / this.timePlayed) * 1000) / 1000 : 0,
    });
    this.sessionOpen = false;
  }

  /* ---------------------------------------------------------------- */
  /* Play / pause                                                     */
  /* ---------------------------------------------------------------- */

  play() {
    if (this.fatal) return;
    if (this.adState) {
      this.adVideo.play();
      return;
    }
    if (this.state === 'ended') {
      this.load(this.index, { autoplay: true, reason: 'replay' });
      return;
    }
    if (!this.started) {
      this.started = true;
      this.requestedAt = performance.now();
      this.emit('playback_requested', {});
      const pre = this.breaks.find((b) => b.type === 'preroll' && !b.played);
      if (pre) {
        this.startAdBreak(pre, () => this.beginContent());
        return;
      }
      this.beginContent();
      return;
    }
    if (this.state === 'paused') {
      this.resumeVideo();
      this.emit('play', {});
    }
  }

  pause(reason = 'user') {
    if (this.adState) {
      this.adVideo.pause();
      return;
    }
    if (this.state !== 'playing' && this.state !== 'buffering') return;
    this.internalPause = true;
    this.video.pause();
    this.internalPause = false;
    this.waitingFor = 'none';
    this.el.spinner.hidden = true;
    this.setState('paused');
    this.emit('pause', { reason });
  }

  toggle() {
    if (this.adState) return this.adVideo.paused ? this.adVideo.play() : this.adVideo.pause();
    this.state === 'playing' || this.state === 'buffering' ? this.pause() : this.play();
  }

  private beginContent() {
    this.contentRequestedAt = performance.now();
    this.setState('buffering');
    this.waitingFor = 'startup';
    this.el.spinner.hidden = false;
  }

  private resumeVideo() {
    this.internalPause = true;
    const p = this.video.play();
    p?.catch(() => {
      // Autoplay with sound blocked: retry muted, the way real players do.
      if (!this.video.muted) {
        this.video.muted = true;
        this.updateVolumeUi();
        this.emit('mute', { reason: 'autoplay_policy' });
        this.video.play().catch(() => this.setState('paused'));
      }
    });
    this.internalPause = false;
    this.setState('playing');
  }

  /* ---------------------------------------------------------------- */
  /* Seeking                                                          */
  /* ---------------------------------------------------------------- */

  seek(to: number, source = 'api') {
    if (this.adState || !this.item) return;
    const min = this.isLive() ? Math.max(0, this.liveEdge() - LIVE_DVR_S) : 0;
    const max = this.isLive() ? this.liveEdge() : this.item.duration - 0.25;
    to = Math.min(max, Math.max(min, to));
    if (this.seekFrom === null) {
      this.seekFrom = this.video.currentTime;
      this.emit('seek_start', { from: Math.round(this.seekFrom * 100) / 100, source });
    }
    this.net.flush(0.5);
    this.video.currentTime = to;
  }

  skip(delta: number) {
    this.seek(this.video.currentTime + delta, delta > 0 ? 'skip_forward' : 'skip_back');
  }

  goLive() {
    if (!this.isLive()) return;
    this.seek(this.liveEdge() - 1, 'go_live');
    this.emit('go_live', {});
  }

  /* ---------------------------------------------------------------- */
  /* Quality / network                                                */
  /* ---------------------------------------------------------------- */

  setQuality(q: 'auto' | string) {
    if (q !== 'auto' && this.blocked.has(q)) {
      this.toast(`${q} failed earlier this session and is unavailable`);
      return;
    }
    const prevMode = this.quality === 'auto' ? 'auto' : 'manual';
    this.quality = q;
    const mode = q === 'auto' ? 'auto' : 'manual';
    if (mode !== prevMode || mode === 'manual') this.emit('quality_mode_change', { mode, rendition: q });
    const next = this.pickRendition();
    if (next.id !== this.rendition.id) this.switchRendition(next, q === 'auto' ? 'abr' : 'manual');
    this.renderSettings();
  }

  setNetwork(id: string) {
    const from = this.net.profile.id;
    if (!this.net.setProfile(id)) return;
    this.emit('network_change', { from, to: id, kbps: this.net.profile.kbps });
  }

  private switchRendition(next: Rendition, reason: string) {
    const from = this.rendition;
    const wasPlaying = this.state === 'playing' || this.state === 'buffering';
    const at = this.video.currentTime;
    this.rendition = next;
    this.lastAbrSwitch = performance.now();
    this.emit('bitrate_change', {
      from: from.id,
      to: next.id,
      fromKbps: from.bitrateKbps,
      bitrateKbps: next.bitrateKbps,
      resolution: `${next.width}x${next.height}`,
      reason,
      direction: next.bitrateKbps > from.bitrateKbps ? 'up' : 'down',
    });
    // New rendition: keep a little buffer (segments already fetched are reusable
    // in a real player's buffer only for the same rendition).
    this.net.flush(Math.min(this.net.bufferSeconds, 1));
    this.setSource(next, at, wasPlaying && !this.adState);
    this.setCaptionTrack();
    this.renderSettings();
  }

  /* ---------------------------------------------------------------- */
  /* Ads                                                              */
  /* ---------------------------------------------------------------- */

  private startAdBreak(brk: AdBreak, resume: () => void) {
    if (!this.adCreative) return resume();
    brk.played = true;
    this.internalPause = true;
    this.video.pause();
    this.internalPause = false;
    this.adState = { brk, pod: 0, podSize: brk.type === 'preroll' ? this.schedule.podSize : 1, adId: '', quartiles: new Set(), resume };
    this.root.classList.add('in-ad');
    this.setState('ad');
    this.el.spinner.hidden = true;
    this.emit('ad_break_start', {});
    this.nextAd();
  }

  private nextAd() {
    const s = this.adState;
    if (!s || !this.adCreative) return;
    s.pod += 1;
    if (s.pod > s.podSize) return this.exitAd(true);
    s.adId = `AD-${s.brk.type.toUpperCase()}-${s.pod}`;
    s.quartiles = new Set();
    const r = this.adCreative.renditions.find((x) => x.id === (this.rendition.bitrateKbps >= 2000 ? 'medium' : 'small')) ?? this.adCreative.renditions[0];
    const a = this.adVideo;
    a.src = r.url;
    a.muted = this.video.muted;
    a.volume = this.video.volume;
    a.hidden = false;
    a.currentTime = 0;
    this.el.adSkip.hidden = !this.schedule.skippable;
    this.el.adSkip.setAttribute('disabled', '');
    const go = () => {
      a.removeEventListener('loadedmetadata', go);
      this.emit('ad_start', {});
      a.play().catch(() => {
        a.muted = true;
        a.play();
      });
    };
    a.addEventListener('loadedmetadata', go);
  }

  skipAd() {
    if (!this.adState || this.el.adSkip.hasAttribute('disabled')) return;
    this.emit('ad_skip', { at: Math.round(this.adVideo.currentTime * 10) / 10 });
    this.adVideo.pause();
    this.nextAd();
  }

  clickAd() {
    if (!this.adState) return;
    this.emit('ad_click', { clickThrough: 'https://science.nasa.gov/mission/hubble/' });
    this.toast('Ad click-through recorded (link not opened in the trainer)');
  }

  private exitAd(complete: boolean) {
    const s = this.adState;
    if (!s) return;
    if (complete) this.emit('ad_break_end', {});
    this.adState = null;
    this.adVideo.pause();
    this.adVideo.removeAttribute('src');
    this.adVideo.hidden = true;
    this.root.classList.remove('in-ad');
    if (complete) s.resume();
  }

  /* ---------------------------------------------------------------- */
  /* UI modes                                                         */
  /* ---------------------------------------------------------------- */

  setFormFactor(ff: FormFactor) {
    if (ff === this.formFactor) return;
    const from = this.formFactor;
    if (this.fullscreen) this.toggleFullscreen();
    if (this.miniPlayer) this.toggleMini('form_factor');
    this.formFactor = ff;
    this.orientation = ff === 'mobile' || ff === 'tablet' ? 'portrait' : 'landscape';
    if (ff !== 'desktop' && this.theater) this.toggleTheater();
    this.root.dataset.ff = ff;
    this.root.dataset.orientation = this.orientation;
    this.emit('form_factor_change', { from, to: ff });
    if (ff === 'ctv') this.focusFirstControl();
  }

  rotate() {
    if (this.formFactor !== 'mobile' && this.formFactor !== 'tablet') return;
    const from = this.orientation;
    this.orientation = from === 'portrait' ? 'landscape' : 'portrait';
    this.root.dataset.orientation = this.orientation;
    this.emit('orientation_change', { from, to: this.orientation });
    // Phones go fullscreen on landscape, like most video apps.
    if (this.formFactor === 'mobile') {
      if (this.orientation === 'landscape' && !this.fullscreen) this.toggleFullscreen('rotate');
      if (this.orientation === 'portrait' && this.fullscreen) this.toggleFullscreen('rotate');
    }
  }

  toggleFullscreen(trigger = 'button') {
    const simulated = this.formFactor === 'mobile' || this.formFactor === 'tablet' || this.formFactor === 'ctv';
    if (!this.fullscreen) {
      if (simulated) {
        this.applyFullscreen(true, 'simulated', trigger);
      } else {
        const host = this.root.closest<HTMLElement>('[data-mp-fullscreen-host]') ?? this.root;
        host.requestFullscreen?.().catch(() => this.applyFullscreen(true, 'simulated', trigger));
      }
    } else if (this.fullscreenType === 'native' && document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      this.applyFullscreen(false, 'simulated', trigger);
    }
  }

  private applyFullscreen(on: boolean, type: 'native' | 'simulated', trigger: string) {
    if (on === this.fullscreen) return;
    this.fullscreen = on;
    this.fullscreenType = on ? type : null;
    this.root.classList.toggle('is-fs', on && type === 'simulated');
    this.el.fs.innerHTML = on ? ICONS.fsExit : ICONS.fs;
    this.emit(on ? 'fullscreen_enter' : 'fullscreen_exit', { type, trigger });
  }

  async togglePip() {
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await this.video.requestPictureInPicture();
    } catch (err) {
      this.toast('Picture-in-picture is not available here. Try the mini-player.');
    }
  }

  toggleMini(trigger = 'button') {
    this.miniPlayer = !this.miniPlayer;
    this.root.classList.toggle('is-mini', this.miniPlayer);
    this.emit(this.miniPlayer ? 'pip_enter' : 'pip_exit', { type: 'mini', trigger });
  }

  toggleTheater() {
    if (this.formFactor !== 'desktop') return;
    this.theater = !this.theater;
    this.root.classList.toggle('is-theater', this.theater);
    this.root.dispatchEvent(new CustomEvent('mp:theater', { detail: this.theater, bubbles: true }));
    this.emit(this.theater ? 'theater_on' : 'theater_off', {});
  }

  toggleCaptions() {
    if (!this.item?.captions) return;
    this.captions = !this.captions;
    const track = this.video.textTracks[0];
    if (track) track.mode = this.captions ? 'showing' : 'hidden';
    this.el.cc.classList.toggle('is-on', this.captions);
    this.emit(this.captions ? 'captions_on' : 'captions_off', { language: 'en' });
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    if (this.adState) this.adVideo.muted = this.video.muted;
    this.updateVolumeUi();
    this.emit(this.video.muted ? 'mute' : 'unmute', {});
  }

  setVolume(v: number) {
    v = Math.min(1, Math.max(0, v));
    if (this.volumeTimer === undefined) this.volumeFrom = this.video.volume;
    this.video.volume = v;
    this.adVideo.volume = v;
    if (v > 0 && this.video.muted) this.toggleMute();
    this.updateVolumeUi();
    window.clearTimeout(this.volumeTimer);
    this.volumeTimer = window.setTimeout(() => {
      this.volumeTimer = undefined;
      if (Math.abs(this.video.volume - this.volumeFrom) > 0.001)
        this.emit('volume_change', { from: Math.round(this.volumeFrom * 100) / 100, to: Math.round(this.video.volume * 100) / 100 });
    }, 400);
  }

  setRate(rate: number) {
    const from = this.video.playbackRate;
    if (from === rate) return;
    this.video.playbackRate = rate;
    this.emit('rate_change', { from, to: rate });
    this.renderSettings();
  }

  setAutoplay(on: boolean) {
    this.autoplayNext = on;
    this.emit('autoplay_toggle', { enabled: on });
  }

  next(trigger = 'button') {
    const i = (this.index + 1) % this.content.length;
    this.emit('playlist_next', { trigger, to: this.content[i].slug });
    this.load(i, { autoplay: true, reason: trigger === 'autoplay' ? 'autoplay_next' : 'playlist_next' });
  }

  previous() {
    const i = (this.index - 1 + this.content.length) % this.content.length;
    this.emit('playlist_previous', { to: this.content[i].slug });
    this.load(i, { autoplay: true, reason: 'playlist_previous' });
  }

  /* ---------------------------------------------------------------- */
  /* Errors                                                           */
  /* ---------------------------------------------------------------- */

  injectError(kind: ErrorKind) {
    switch (kind) {
      case 'media_decode':
        this.raiseError({ type: 'player', code: 'MEDIA_ERR_DECODE', message: 'The video could not be decoded.', fatal: false, retry: () => this.setSource(this.rendition, this.video.currentTime, true) });
        break;
      case 'network_404': {
        const failed = this.rendition;
        const at = this.video.currentTime;
        const wasPlaying = this.state === 'playing' || this.state === 'buffering';
        this.blocked.add(failed.id);
        this.emit('error', { type: 'network', code: 'HTTP_404', message: `Segment request for ${failed.id} returned 404`, fatal: false, rendition: failed.id });
        // The player stalls while it retries, then fails over to the next-lower rendition.
        this.internalPause = true;
        this.video.pause();
        this.internalPause = false;
        if (wasPlaying) this.setState('buffering');
        this.el.spinner.hidden = false;
        window.setTimeout(() => {
          const lower = [...this.usable()].sort((x, y) => y.bitrateKbps - x.bitrateKbps).find((x) => x.bitrateKbps < failed.bitrateKbps) ?? this.usable()[0];
          this.rendition = lower;
          this.lastAbrSwitch = performance.now();
          this.emit('bitrate_change', { from: failed.id, to: lower.id, fromKbps: failed.bitrateKbps, bitrateKbps: lower.bitrateKbps, resolution: `${lower.width}x${lower.height}`, reason: 'failover', direction: 'down' });
          this.el.spinner.hidden = true;
          this.emit('error_recovered', { code: 'HTTP_404', action: 'rendition_failover', blocked: [...this.blocked] });
          this.setSource(lower, at, wasPlaying);
          this.renderSettings();
        }, 1500);
        break;
      }
      case 'drm_license':
        this.raiseError({ type: 'drm', code: 'DRM_LICENSE_6001', message: 'License request was denied. This video cannot be played.', fatal: true });
        break;
      case 'ad_vast_303':
        if (this.adState) {
          this.emit('error', { type: 'ad', code: 'VAST_303', message: 'No ad response for this break.', fatal: false });
          this.exitAd(true);
        } else {
          const pending = this.breaks.find((b) => !b.played && b.type !== 'postroll');
          if (pending) pending.played = true;
          this.emit('error', { type: 'ad', code: 'VAST_303', message: 'Next ad break returned no ads; it will be skipped.', fatal: false });
          this.toast('Next ad break will return no ads (VAST 303)');
          this.renderMarkers();
        }
        break;
      case 'bandwidth_crash': {
        const prev = this.net.profile.id;
        this.setNetwork('edge');
        this.net.flush(0.3);
        this.toast('Bandwidth crashed to 300 kbps for 15 s');
        window.setTimeout(() => this.setNetwork(prev), 15000);
        break;
      }
    }
  }

  private raiseError(e: { type: string; code: string; message: string; fatal: boolean; retry?: () => void }) {
    this.internalPause = true;
    this.video.pause();
    this.internalPause = false;
    this.setState('error');
    this.fatal = e.fatal;
    this.emit('error', { type: e.type, code: e.code, message: e.message, fatal: e.fatal });
    this.el.errorMsg.textContent = `${e.message} (${e.code})`;
    this.el.errorRetry.hidden = e.fatal;
    this.el.error.hidden = false;
    this.el.errorRetry.onclick = () => {
      this.el.error.hidden = true;
      this.emit('error_recovered', { code: e.code, action: 'user_retry' });
      e.retry?.();
      this.setState('playing');
    };
  }

  /* ---------------------------------------------------------------- */
  /* Tick: buffer model, ABR, progress, milestones, heartbeats        */
  /* ---------------------------------------------------------------- */

  private tick() {
    const now = performance.now();
    const dt = Math.min(1, (now - this.lastTick) / 1000);
    this.lastTick = now;
    if (!this.item) return;

    if (this.adState) {
      this.updateAdUi();
      this.updateUi();
      return;
    }

    const v = this.video;
    const playing = this.state === 'playing' && !v.paused;
    const r = this.net.tick(dt, {
      playing,
      rate: v.playbackRate,
      bitrateKbps: this.rendition.bitrateKbps,
      waiting: this.waitingFor !== 'none',
      startup: this.waitingFor === 'startup',
    });

    if (r === 'stall' && this.waitingFor === 'none' && !this.switching) {
      this.waitingFor = 'stall';
      this.stallStartedAt = now;
      this.internalPause = true;
      v.pause();
      this.internalPause = false;
      this.setState('buffering');
      this.el.spinner.hidden = false;
      this.emit('buffer_start', { cause: 'network_sim' });
    } else if (r === 'ready' && this.waitingFor !== 'none') {
      const kind = this.waitingFor;
      this.waitingFor = 'none';
      this.el.spinner.hidden = true;
      if (kind === 'stall') {
        const ms = now - this.stallStartedAt;
        this.rebufferCount += 1;
        this.rebufferMs += ms;
        this.emit('buffer_end', { cause: 'network_sim', durationMs: Math.round(ms) });
      }
      this.resumeVideo();
    }

    if (playing) {
      this.timePlayed += dt;
      this.heartbeatAcc += dt;
      if (this.heartbeatAcc >= HEARTBEAT_S) {
        this.heartbeatAcc -= HEARTBEAT_S;
        this.emit('heartbeat', { intervalSeconds: HEARTBEAT_S });
      }
      if (!this.isLive() && this.seekFrom === null) {
        const pct = (v.currentTime / this.item.duration) * 100;
        for (const m of MILESTONES) {
          if (pct >= m && !this.milestonesFired.has(m)) {
            this.milestonesFired.add(m);
            this.emit('milestone', { percent: m });
          }
        }
      }
      const mid = this.breaks.find((b) => b.type === 'midroll' && !b.played);
      if (mid && v.currentTime >= mid.at && this.seekFrom === null) {
        this.startAdBreak(mid, () => this.resumeVideo());
      }
      if (this.isLive() && v.currentTime > this.liveEdge()) v.currentTime = this.liveEdge();
    }

    // ABR decisions, at most every 4 s.
    if (this.quality === 'auto' && !this.switching && now - this.lastAbrSwitch > 4000 && this.started) {
      const pick = this.net.chooseRendition(this.usable(), this.rendition.id);
      if (pick.id !== this.rendition.id) this.switchRendition(pick, 'abr');
    }
    this.updateUi();
  }

  /* ---------------------------------------------------------------- */
  /* Video element wiring                                             */
  /* ---------------------------------------------------------------- */

  private bindVideo() {
    const v = this.video;
    v.addEventListener('loadedmetadata', () => {
      if (!this.announceLoaded) return;
      this.announceLoaded = false;
      this.emit('content_loaded', { duration: Math.round(v.duration * 100) / 100, width: v.videoWidth, height: v.videoHeight });
    });
    v.addEventListener('playing', () => {
      if (this.startupMs === null && this.started && !this.adState) {
        const now = performance.now();
        // Video startup time is content request to first frame; pre-roll time is reported separately.
        this.startupMs = Math.round(now - this.contentRequestedAt);
        this.emit('playback_started', { startupMs: this.startupMs, sinceRequestMs: Math.round(now - this.requestedAt), adTimeMs: Math.round(this.contentRequestedAt - this.requestedAt) });
      }
    });
    v.addEventListener('pause', () => {
      // Native controls (PiP window, OS media keys) pause without going through us.
      if (!this.internalPause && !this.switching && this.state === 'playing' && !this.adState) {
        this.setState('paused');
        this.emit('pause', { reason: 'system' });
      }
    });
    v.addEventListener('play', () => {
      if (!this.internalPause && this.state === 'paused' && !this.adState) {
        this.setState('playing');
        this.emit('play', { reason: 'system' });
      }
    });
    v.addEventListener('seeked', () => {
      if (this.seekFrom === null) return;
      const from = this.seekFrom;
      this.seekFrom = null;
      this.emit('seek_complete', { from: Math.round(from * 100) / 100, to: Math.round(v.currentTime * 100) / 100 });
      if (this.state === 'playing' || this.state === 'buffering') {
        this.waitingFor = 'seek';
        this.internalPause = true;
        v.pause();
        this.internalPause = false;
        this.el.spinner.hidden = false;
        this.setState('buffering');
      }
    });
    v.addEventListener('ended', () => this.onEnded());
    v.addEventListener('error', () => {
      if (this.switching || v.src.includes('-missing.mp4')) return;
      const code = v.error?.code ?? 0;
      const names = ['', 'MEDIA_ERR_ABORTED', 'MEDIA_ERR_NETWORK', 'MEDIA_ERR_DECODE', 'MEDIA_ERR_SRC_NOT_SUPPORTED'];
      this.raiseError({ type: 'player', code: names[code] ?? `MEDIA_ERR_${code}`, message: 'Playback failed.', fatal: false, retry: () => this.setSource(this.rendition, v.currentTime, true) });
    });
    v.addEventListener('enterpictureinpicture', () => {
      this.pip = true;
      this.emit('pip_enter', { type: 'native' });
    });
    v.addEventListener('leavepictureinpicture', () => {
      this.pip = false;
      this.emit('pip_exit', { type: 'native' });
    });

    const a = this.adVideo;
    a.addEventListener('timeupdate', () => {
      const s = this.adState;
      if (!s || !a.duration) return;
      const pct = (a.currentTime / a.duration) * 100;
      for (const q of [25, 50, 75]) {
        if (pct >= q && !s.quartiles.has(q)) {
          s.quartiles.add(q);
          this.emit('ad_quartile', { quartile: q });
        }
      }
      if (a.currentTime >= SKIP_AFTER_S) this.el.adSkip.removeAttribute('disabled');
    });
    a.addEventListener('ended', () => {
      if (!this.adState) return;
      this.emit('ad_complete', {});
      this.nextAd();
    });
  }

  private onEnded() {
    if (this.isLive() || this.adState) return;
    this.completed = true;
    this.emit('content_completed', {});
    const post = this.breaks.find((b) => b.type === 'postroll' && !b.played);
    const finish = () => {
      this.setState('ended');
      this.endSession('completed');
      if (this.autoplayNext) {
        const next = this.content[(this.index + 1) % this.content.length];
        this.el.upnextTitle.textContent = next.title;
        this.el.upnext.hidden = false;
        let n = 5;
        this.el.upnextCount.textContent = String(n);
        const step = () => {
          n -= 1;
          this.el.upnextCount.textContent = String(n);
          if (n <= 0) this.next('autoplay');
          else this.nextTimer = window.setTimeout(step, 1000);
        };
        this.nextTimer = window.setTimeout(step, 1000);
      }
    };
    if (post) this.startAdBreak(post, finish);
    else finish();
  }

  /* ---------------------------------------------------------------- */
  /* Controls                                                         */
  /* ---------------------------------------------------------------- */

  private template() {
    return `
<div class="mp__screen" data-el="screen">
  <video class="mp__video" data-el="video" playsinline preload="metadata"></video>
  <video class="mp__ad" data-el="adVideo" playsinline hidden></video>
  <button class="mp__bigplay" data-el="bigplay" aria-label="Play">${ICONS.play}</button>
  <div class="mp__spinner" data-el="spinner" hidden><span></span></div>
  <div class="mp__adui" data-el="adui">
    <span class="mp__adlabel" data-el="adLabel">Ad</span>
    <button class="mp__adlink" data-el="adLink">Learn more</button>
    <button class="mp__adskip" data-el="adSkip" disabled>Skip ad</button>
  </div>
  <div class="mp__error" data-el="error" hidden>
    <p class="mp__errormsg" data-el="errorMsg"></p>
    <button data-el="errorRetry">Retry</button>
  </div>
  <div class="mp__upnext" data-el="upnext" hidden>
    <span>Up next in <b data-el="upnextCount">5</b></span>
    <strong data-el="upnextTitle"></strong>
    <span class="mp__upnext-actions"><button data-el="upnextGo">Play now</button><button data-el="upnextCancel">Cancel</button></span>
  </div>
  <div class="mp__toast" data-el="toast" hidden></div>
  <div class="mp__top">
    <span class="mp__title" data-el="title"></span>
    <button class="mp__live" data-el="live" hidden>LIVE</button>
  </div>
  <div class="mp__chrome" data-el="chrome">
    <div class="mp__bar" data-el="bar" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0">
      <div class="mp__buffered" data-el="buffered"></div>
      <div class="mp__played" data-el="played"></div>
      <div class="mp__markers" data-el="markers"></div>
      <div class="mp__hover" data-el="hover" hidden></div>
    </div>
    <div class="mp__row">
      <button class="mp__btn" data-el="prev" aria-label="Previous">${ICONS.prev}</button>
      <button class="mp__btn" data-el="play" aria-label="Play">${ICONS.play}</button>
      <button class="mp__btn" data-el="next" aria-label="Next">${ICONS.next}</button>
      <button class="mp__btn" data-el="back" aria-label="Back 10 seconds">${ICONS.back}</button>
      <button class="mp__btn" data-el="fwd" aria-label="Forward 10 seconds">${ICONS.fwd}</button>
      <button class="mp__btn" data-el="mute" aria-label="Mute">${ICONS.vol}</button>
      <input class="mp__vol" data-el="vol" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume" />
      <span class="mp__time" data-el="time">0:00 / 0:00</span>
      <span class="mp__spacer"></span>
      <button class="mp__btn" data-el="cc" aria-label="Captions">${ICONS.cc}</button>
      <button class="mp__btn" data-el="gear" aria-label="Settings" aria-haspopup="true">${ICONS.gear}</button>
      <button class="mp__btn" data-el="rotate" aria-label="Rotate">${ICONS.rotate}</button>
      <button class="mp__btn" data-el="mini" aria-label="Mini-player">${ICONS.mini}</button>
      <button class="mp__btn" data-el="pip" aria-label="Picture-in-picture">${ICONS.pip}</button>
      <button class="mp__btn" data-el="theater" aria-label="Theater mode">${ICONS.theater}</button>
      <button class="mp__btn" data-el="fs" aria-label="Fullscreen">${ICONS.fs}</button>
    </div>
  </div>
  <div class="mp__menu" data-el="menu" hidden></div>
</div>
<ol class="mp__playlist" data-el="playlist" aria-label="Playlist"></ol>`;
  }

  private bindControls() {
    const on = (k: string, fn: (e: Event) => void, ev = 'click') => this.el[k].addEventListener(ev, fn);
    on('play', () => this.toggle());
    on('bigplay', () => this.play());
    on('prev', () => this.previous());
    on('next', () => this.next());
    on('back', () => this.skip(-10));
    on('fwd', () => this.skip(10));
    on('mute', () => this.toggleMute());
    on('vol', (e) => this.setVolume(Number((e.target as HTMLInputElement).value)), 'input');
    on('cc', () => this.toggleCaptions());
    on('gear', () => this.toggleMenu());
    on('rotate', () => this.rotate());
    on('mini', () => this.toggleMini());
    on('pip', () => this.togglePip());
    on('theater', () => this.toggleTheater());
    on('fs', () => this.toggleFullscreen());
    on('live', () => this.goLive());
    on('adSkip', () => this.skipAd());
    on('adLink', () => this.clickAd());
    on('upnextGo', () => this.next('autoplay'));
    on('upnextCancel', () => {
      window.clearTimeout(this.nextTimer);
      this.el.upnext.hidden = true;
    });
    this.el.screen.addEventListener('click', (e) => {
      if (e.target === this.video || e.target === this.el.screen) this.toggle();
    });
    this.el.screen.addEventListener('dblclick', (e) => {
      if (e.target === this.video) this.toggleFullscreen('double_click');
    });
    this.root.addEventListener('pointermove', () => this.showChrome());

    // Scrubbing
    const bar = this.el.bar;
    const posFromEvent = (e: PointerEvent) => {
      const rect = bar.getBoundingClientRect();
      const f = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      return this.barToTime(f);
    };
    bar.addEventListener('pointerdown', (e) => {
      if (this.adState) return;
      this.scrubbing = true;
      bar.setPointerCapture(e.pointerId);
      this.seek(posFromEvent(e), 'scrub');
    });
    bar.addEventListener('pointermove', (e) => {
      const t = posFromEvent(e);
      this.el.hover.hidden = false;
      this.el.hover.textContent = this.isLive() ? fmt(t - this.liveEdge()) : fmt(t);
      const rect = bar.getBoundingClientRect();
      this.el.hover.style.left = `${Math.min(rect.width - 40, Math.max(0, e.clientX - rect.left - 20))}px`;
      if (this.scrubbing) this.video.currentTime = t;
    });
    bar.addEventListener('pointerleave', () => (this.el.hover.hidden = true));
    bar.addEventListener('pointerup', () => (this.scrubbing = false));

    document.addEventListener('fullscreenchange', () => {
      const host = this.root.closest<HTMLElement>('[data-mp-fullscreen-host]') ?? this.root;
      const active = document.fullscreenElement === host;
      if (active !== this.fullscreen) this.applyFullscreen(active, 'native', 'button');
    });
  }

  private barToTime(f: number) {
    if (this.isLive()) {
      const edge = this.liveEdge();
      const start = Math.max(0, edge - LIVE_DVR_S);
      return start + f * (edge - start);
    }
    return f * (this.item?.duration ?? 0);
  }

  private bindKeys() {
    this.root.addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement).matches('input[type=range]') && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      if (this.formFactor === 'ctv' && this.handleRemote(e.key)) {
        e.preventDefault();
        return;
      }
      const k = e.key;
      const handled = (() => {
        if (k === ' ' || k === 'k') return this.toggle(), true;
        if (k === 'j') return this.skip(-10), true;
        if (k === 'l') return this.skip(10), true;
        if (k === 'ArrowLeft') return this.skip(-5), true;
        if (k === 'ArrowRight') return this.skip(5), true;
        if (k === 'ArrowUp') return this.setVolume(this.video.volume + 0.1), true;
        if (k === 'ArrowDown') return this.setVolume(this.video.volume - 0.1), true;
        if (k === 'm') return this.toggleMute(), true;
        if (k === 'f') return this.toggleFullscreen('keyboard'), true;
        if (k === 'c') return this.toggleCaptions(), true;
        if (k === 'i') return this.toggleMini('keyboard'), true;
        if (k === 't') return this.toggleTheater(), true;
        if (k === '>') return this.setRate(RATES[Math.min(RATES.length - 1, RATES.indexOf(this.video.playbackRate) + 1)]), true;
        if (k === '<') return this.setRate(RATES[Math.max(0, RATES.indexOf(this.video.playbackRate) - 1)]), true;
        if (k === 'N') return this.next(), true;
        if (k === 'P') return this.previous(), true;
        if (/^[0-9]$/.test(k) && !this.isLive()) return this.seek((Number(k) / 10) * this.item.duration, 'keyboard'), true;
        if (k === 'Escape' && !this.el.menu.hidden) return this.toggleMenu(false), true;
        return false;
      })();
      if (handled) {
        e.preventDefault();
        this.showChrome();
      }
    });
  }

  /** TV remote: arrows move focus between controls, OK activates. */
  handleRemote(key: string): boolean {
    this.showChrome();
    const focusables = Array.from(this.root.querySelectorAll<HTMLElement>('.mp__row .mp__btn:not([hidden]):not([disabled]), .mp__bar, .mp__menu:not([hidden]) button, .mp__adui button:not([hidden]):not([disabled]), .mp__live:not([hidden])')).filter((n) => n.offsetParent !== null);
    // The on-screen remote lives outside the player, so track the TV focus ourselves
    // rather than trusting document.activeElement.
    const active = document.activeElement as HTMLElement;
    const current = this.root.contains(active) && active !== this.root ? active : this.tvFocus;
    const i = current ? focusables.indexOf(current) : -1;
    const move = (el: HTMLElement | undefined) => {
      if (!el) return;
      this.tvFocus = el;
      el.focus({ preventScroll: true });
    };
    if (key === 'MediaPlayPause' || key === 'PlayPause') return this.toggle(), true;
    if (key === 'Back' || key === 'Backspace' || key === 'Escape') {
      if (!this.el.menu.hidden) this.toggleMenu(false);
      return true;
    }
    if (current === this.el.bar && (key === 'ArrowLeft' || key === 'ArrowRight')) {
      this.skip(key === 'ArrowLeft' ? -10 : 10);
      return true;
    }
    if (key === 'ArrowRight' || key === 'ArrowDown') {
      move(focusables[(i + 1) % focusables.length] ?? focusables[0]);
      return true;
    }
    if (key === 'ArrowLeft' || key === 'ArrowUp') {
      move(focusables[(i - 1 + focusables.length) % focusables.length] ?? focusables[0]);
      return true;
    }
    if (key === 'Enter' || key === 'Select') {
      if (current && focusables.includes(current) && current.tagName === 'BUTTON') current.click();
      else this.toggle();
      return true;
    }
    return false;
  }

  focusFirstControl() {
    this.tvFocus = this.el.play;
    this.el.play.focus({ preventScroll: true });
  }

  private bindDocument() {
    document.addEventListener('visibilitychange', () => {
      const visible = document.visibilityState === 'visible';
      this.emit('visibility_change', { visible });
      if (!visible && (this.formFactor === 'mobile' || this.formFactor === 'tablet') && this.state === 'playing' && !this.pip) this.pause('background');
    });
    window.addEventListener('pagehide', () => this.endSession('page_exit'));

    // Embedded players pop out into the mini-player when scrolled away.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (this.formFactor !== 'embed') return;
        const out = entry.intersectionRatio < 0.3;
        if (out && !this.miniPlayer && this.state === 'playing') this.toggleMini('scroll');
        if (!out && this.miniPlayer) this.toggleMini('scroll');
      },
      { threshold: [0, 0.3, 1] }
    );
    io.observe(this.root.parentElement ?? this.root);
  }

  private showChrome() {
    this.root.classList.add('chrome-visible');
    window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => {
      if (this.state === 'playing' && this.el.menu.hidden) this.root.classList.remove('chrome-visible');
    }, this.formFactor === 'ctv' ? 4000 : 2500);
  }

  private toggleMenu(force?: boolean) {
    const open = force ?? this.el.menu.hidden;
    this.el.menu.hidden = !open;
    this.el.gear.setAttribute('aria-expanded', String(open));
    if (open) {
      this.renderSettings();
      this.el.menu.querySelector<HTMLElement>('button')?.focus();
    }
  }

  private renderSettings() {
    const m = this.el.menu;
    if (!m || !this.item) return;
    const r = this.item.renditions;
    const current = this.rendition;
    const q = (id: string, label: string) => `<button data-q="${id}" aria-pressed="${this.quality === id}">${label}</button>`;
    m.innerHTML = `
      <div class="mp__menu-group"><span>Quality</span>${q('auto', `Auto${this.quality === 'auto' && current ? ` (${current.label})` : ''}`)}${[...r]
        .sort((a, b) => b.bitrateKbps - a.bitrateKbps)
        .map((x) => q(x.id, `${x.label} · ${(x.bitrateKbps / 1000).toFixed(1)} Mbps`))
        .join('')}</div>
      <div class="mp__menu-group"><span>Speed</span>${RATES.map((x) => `<button data-rate="${x}" aria-pressed="${this.video.playbackRate === x}">${x === 1 ? 'Normal' : `${x}×`}</button>`).join('')}</div>
      <div class="mp__menu-group"><span>Autoplay next</span><button data-autoplay aria-pressed="${this.autoplayNext}">${this.autoplayNext ? 'On' : 'Off'}</button></div>`;
    m.querySelectorAll<HTMLButtonElement>('[data-q]').forEach((b) => (b.onclick = () => this.setQuality(b.dataset.q!)));
    m.querySelectorAll<HTMLButtonElement>('[data-rate]').forEach((b) => (b.onclick = () => this.setRate(Number(b.dataset.rate))));
    m.querySelector<HTMLButtonElement>('[data-autoplay]')!.onclick = () => {
      this.setAutoplay(!this.autoplayNext);
      this.renderSettings();
    };
  }

  private renderPlaylist() {
    const ol = this.el.playlist;
    ol.innerHTML = '';
    this.content.forEach((c, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.className = 'mp__pl-item';
      b.setAttribute('aria-current', String(i === this.index && !!this.item));
      b.innerHTML = `<span class="mp__pl-n">${String(i + 1).padStart(2, '0')}</span><span class="mp__pl-t"></span><span class="mp__pl-d">${c.kind === 'live' ? 'LIVE' : fmt(c.duration)}</span>`;
      b.querySelector('.mp__pl-t')!.textContent = c.title;
      b.onclick = () => this.load(i, { autoplay: true, reason: 'playlist_select' });
      li.append(b);
      ol.append(li);
    });
  }

  private renderMarkers() {
    const m = this.el.markers;
    m.innerHTML = '';
    if (!this.item || this.isLive()) return;
    for (const b of this.breaks) {
      if (b.type !== 'midroll' || b.played) continue;
      const tick = document.createElement('span');
      tick.style.left = `${(b.at / this.item.duration) * 100}%`;
      m.append(tick);
    }
  }

  private updateVolumeUi() {
    const v = this.video;
    this.el.mute.innerHTML = v.muted || v.volume === 0 ? ICONS.muted : ICONS.vol;
    (this.el.vol as HTMLInputElement).value = String(v.muted ? 0 : v.volume);
  }

  private updateAdUi() {
    const s = this.adState;
    const a = this.adVideo;
    if (!s) return;
    const left = Math.max(0, (a.duration || 0) - a.currentTime);
    this.el.adLabel.textContent = `Ad ${s.pod} of ${s.podSize} · ${fmt(left)}`;
    const wait = Math.ceil(SKIP_AFTER_S - a.currentTime);
    this.el.adSkip.textContent = wait > 0 ? `Skip in ${wait}` : 'Skip ad';
  }

  private updateUi() {
    const v = this.video;
    const bar = this.el.bar;
    if (this.adState) {
      const a = this.adVideo;
      (this.el.played as HTMLElement).style.width = `${a.duration ? (a.currentTime / a.duration) * 100 : 0}%`;
      this.el.time.textContent = `Ad · ${fmt(a.currentTime)} / ${fmt(a.duration)}`;
      return;
    }
    if (this.isLive()) {
      const edge = this.liveEdge();
      const start = Math.max(0, edge - LIVE_DVR_S);
      const f = (v.currentTime - start) / (edge - start || 1);
      (this.el.played as HTMLElement).style.width = `${Math.min(100, Math.max(0, f * 100))}%`;
      (this.el.buffered as HTMLElement).style.width = '100%';
      const behind = edge - v.currentTime;
      this.el.live.classList.toggle('is-behind', behind > 5);
      this.el.time.textContent = behind > 5 ? `−${fmt(behind)} behind live` : 'Live';
    } else {
      const d = this.item.duration;
      const f = d ? v.currentTime / d : 0;
      (this.el.played as HTMLElement).style.width = `${f * 100}%`;
      const ahead = Math.min(d, v.currentTime + this.net.bufferSeconds);
      (this.el.buffered as HTMLElement).style.width = `${d ? (ahead / d) * 100 : 0}%`;
      this.el.time.textContent = `${fmt(v.currentTime)} / ${fmt(d)}`;
      bar.setAttribute('aria-valuemax', String(Math.round(d)));
      bar.setAttribute('aria-valuenow', String(Math.round(v.currentTime)));
    }
  }

  toast(msg: string) {
    const t = this.el.toast;
    t.textContent = msg;
    t.hidden = false;
    window.clearTimeout((t as unknown as { _t?: number })._t);
    (t as unknown as { _t?: number })._t = window.setTimeout(() => (t.hidden = true), 2600);
  }
}

export { NETWORK_PROFILES };
