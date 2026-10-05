/**
 * Destination mappers: canonical event -> what each analytics vendor expects.
 *
 * A mapper returns null when that vendor has no equivalent call (for example,
 * Adobe derives milestones server-side, so they are not sent). The console
 * shows "not sent" in that case, which is itself useful for training.
 */
import type { CanonicalEvent } from './events';

export interface Mapped {
  /** One-line call a developer would write, e.g. gtag('event', ...) */
  call: string;
  payload: unknown;
  note?: string;
}

export interface Destination {
  id: string;
  label: string;
  map: (e: CanonicalEvent) => Mapped | null;
}

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const pageUrl = () => (typeof location !== 'undefined' ? location.href.split('?')[0] : '');

/* ------------------------------------------------------------------ */
/* dataLayer (GTM)                                                     */
/* ------------------------------------------------------------------ */

export const dataLayerDestination: Destination = {
  id: 'datalayer',
  label: 'dataLayer',
  map: (e) => {
    const payload = {
      event: `mockplayer.${e.event}`,
      mockplayer: {
        event: e.event,
        category: e.category,
        seq: e.seq,
        sessionId: e.sessionId,
        params: e.params,
        content: e.content,
        ad: e.ad,
        player: e.player,
        qoe: e.qoe,
      },
    };
    return { call: `dataLayer.push({ event: '${payload.event}', mockplayer: {…} })`, payload };
  },
};

/* ------------------------------------------------------------------ */
/* GA4 (gtag) — uses the enhanced-measurement video names where they    */
/* exist, custom names for everything else.                            */
/* ------------------------------------------------------------------ */

const GA4_NAMES: Record<string, string> = {
  playback_started: 'video_start',
  milestone: 'video_progress',
  content_completed: 'video_complete',
  play: 'video_resume',
  pause: 'video_pause',
  seek_complete: 'video_seek',
  buffer_start: 'video_buffer_start',
  buffer_end: 'video_buffer_end',
  bitrate_change: 'video_quality_change',
  ad_break_start: 'video_ad_break_start',
  ad_start: 'video_ad_start',
  ad_quartile: 'video_ad_progress',
  ad_skip: 'video_ad_skip',
  ad_click: 'video_ad_click',
  ad_complete: 'video_ad_complete',
  ad_break_end: 'video_ad_break_end',
  fullscreen_enter: 'video_fullscreen',
  pip_enter: 'video_pip',
  captions_on: 'video_captions',
  captions_off: 'video_captions',
  mute: 'video_mute',
  unmute: 'video_mute',
  rate_change: 'video_rate_change',
  error: 'video_error',
  session_end: 'video_session_end',
};

export const ga4Destination: Destination = {
  id: 'ga4',
  label: 'GA4',
  map: (e) => {
    const name = GA4_NAMES[e.event];
    if (!name) return null;
    const c = e.content;
    const params: Record<string, unknown> = {
      video_provider: 'mock_player',
      video_title: c?.title,
      video_url: c ? `${pageUrl()}#${c.id}` : undefined,
      video_duration: c ? Math.round(c.duration) : undefined,
      video_current_time: c ? Math.round(c.position) : undefined,
      video_percent: c ? Math.round(c.percent) : undefined,
      visible: typeof document !== 'undefined' ? document.visibilityState === 'visible' : true,
    };
    switch (e.event) {
      case 'milestone':
        params.video_percent = e.params.percent;
        break;
      case 'seek_complete':
        params.seek_from = round(Number(e.params.from));
        params.seek_to = round(Number(e.params.to));
        break;
      case 'buffer_end':
        params.buffer_ms = e.params.durationMs;
        break;
      case 'bitrate_change':
        params.video_quality = e.params.to;
        params.video_bitrate_kbps = e.params.bitrateKbps;
        params.quality_reason = e.params.reason;
        break;
      case 'captions_on':
      case 'captions_off':
        params.captions_enabled = e.event === 'captions_on';
        break;
      case 'mute':
      case 'unmute':
        params.muted = e.event === 'mute';
        break;
      case 'rate_change':
        params.playback_rate = e.params.to;
        break;
      case 'pip_enter':
        params.pip_type = e.params.type;
        break;
      case 'error':
        params.error_code = e.params.code;
        params.error_type = e.params.type;
        params.fatal = e.params.fatal;
        break;
      case 'session_end':
        params.time_played_s = Math.round(e.qoe.timePlayedSeconds);
        params.rebuffer_count = e.qoe.rebufferCount;
        params.startup_ms = e.qoe.startupMs;
        break;
    }
    if (e.ad) {
      params.ad_id = e.ad.adId;
      params.ad_break_type = e.ad.breakType;
      params.ad_pod_position = e.ad.podIndex;
      if (e.event === 'ad_quartile') params.ad_percent = e.params.quartile;
    }
    params.stream_type = c?.streamType;
    params.form_factor = e.player.formFactor;
    for (const k of Object.keys(params)) if (params[k] === undefined) delete params[k];
    return { call: `gtag('event', '${name}', {…})`, payload: { name, params } };
  },
};

/* ------------------------------------------------------------------ */
/* Adobe Streaming Media via Edge Network (XDM mediaCollection)        */
/* ------------------------------------------------------------------ */

function adobeSession(e: CanonicalEvent) {
  const c = e.content!;
  return {
    name: c.id,
    friendlyName: c.title,
    length: Math.round(c.duration),
    contentType: c.streamType === 'live' ? 'Live' : 'VOD',
    streamType: 'video',
    playerName: e.player.name,
    channel: 'lab',
    hasResume: false,
  };
}

const ADOBE_STATE: Record<string, [string, 'start' | 'end']> = {
  fullscreen_enter: ['fullscreen', 'start'],
  fullscreen_exit: ['fullscreen', 'end'],
  mute: ['mute', 'start'],
  unmute: ['mute', 'end'],
  captions_on: ['closedCaptioning', 'start'],
  captions_off: ['closedCaptioning', 'end'],
  pip_enter: ['pictureInPicture', 'start'],
  pip_exit: ['pictureInPicture', 'end'],
  visibility_change: ['inFocus', 'start'],
};

export const adobeDestination: Destination = {
  id: 'adobe',
  label: 'Adobe Media',
  map: (e) => {
    if (!e.content) return null;
    const playhead = Math.floor(e.ad ? e.ad.position : e.content.position);
    const base = { playhead, sessionID: `<from sessionStart response>` };
    let eventType: string | null = null;
    let extra: Record<string, unknown> = {};
    let note: string | undefined;

    switch (e.event) {
      case 'session_start':
        eventType = 'media.sessionStart';
        extra = { sessionDetails: adobeSession(e) };
        delete (base as Record<string, unknown>).sessionID;
        break;
      case 'playback_started':
      case 'play':
      case 'buffer_end':
      case 'seek_complete':
      case 'error_recovered':
        eventType = 'media.play';
        if (e.event === 'playback_started') extra = { qoeDataDetails: { timeToStart: e.qoe.startupMs, bitrate: e.qoe.bitrateKbps } };
        if (e.event === 'seek_complete') note = 'Adobe has no seek event: seeks are a pause then a play.';
        break;
      case 'pause':
      case 'seek_start':
        eventType = 'media.pauseStart';
        break;
      case 'buffer_start':
        eventType = 'media.bufferStart';
        break;
      case 'heartbeat':
        eventType = 'media.ping';
        break;
      case 'bitrate_change':
        eventType = 'media.bitrateChange';
        extra = { qoeDataDetails: { bitrate: e.qoe.bitrateKbps, droppedFrames: e.qoe.droppedFrames } };
        break;
      case 'ad_break_start':
        eventType = 'media.adBreakStart';
        extra = {
          advertisingPodDetails: {
            friendlyName: e.ad!.breakType,
            index: e.ad!.breakPosition,
            offset: Math.floor(e.content.position),
          },
        };
        break;
      case 'ad_start':
        eventType = 'media.adStart';
        extra = {
          advertisingDetails: {
            name: e.ad!.adId,
            friendlyName: e.ad!.adTitle,
            length: Math.round(e.ad!.duration),
            podPosition: e.ad!.podIndex,
            playerName: e.player.name,
            advertiser: e.ad!.advertiser,
          },
        };
        break;
      case 'ad_complete':
        eventType = 'media.adComplete';
        break;
      case 'ad_skip':
        eventType = 'media.adSkip';
        break;
      case 'ad_break_end':
        eventType = 'media.adBreakComplete';
        break;
      case 'content_completed':
        eventType = 'media.sessionComplete';
        break;
      case 'session_end':
        eventType = 'media.sessionEnd';
        break;
      case 'error':
        eventType = 'media.error';
        extra = { errorDetails: { name: String(e.params.code), source: e.params.type === 'player' ? 'player' : 'external' } };
        break;
      default: {
        const st = ADOBE_STATE[e.event];
        if (!st) return null;
        let [name, phase] = st;
        if (e.event === 'visibility_change') phase = e.params.visible ? 'start' : 'end';
        eventType = 'media.statesUpdate';
        extra = phase === 'start' ? { statesStart: [{ name }] } : { statesEnd: [{ name }] };
      }
    }

    const payload = { xdm: { eventType, timestamp: e.timestamp, mediaCollection: { ...base, ...extra } } };
    return { call: `alloy('sendEvent', { xdm: { eventType: '${eventType}', … } })`, payload, note };
  },
};

/* ------------------------------------------------------------------ */
/* Segment Video Spec                                                  */
/* ------------------------------------------------------------------ */

const SEGMENT_NAMES: Record<string, string> = {
  playback_started: 'Video Playback Started',
  pause: 'Video Playback Paused',
  play: 'Video Playback Resumed',
  buffer_start: 'Video Playback Buffer Started',
  buffer_end: 'Video Playback Buffer Completed',
  seek_start: 'Video Playback Seek Started',
  seek_complete: 'Video Playback Seek Completed',
  heartbeat: 'Video Content Playing',
  content_completed: 'Video Content Completed',
  session_end: 'Video Playback Exited',
  ad_break_start: 'Video Ad Break Started',
  ad_break_end: 'Video Ad Break Completed',
  ad_start: 'Video Ad Started',
  ad_quartile: 'Video Ad Playing',
  ad_complete: 'Video Ad Completed',
  ad_skip: 'Video Ad Skipped',
  ad_click: 'Video Ad Clicked',
  bitrate_change: 'Video Quality Updated',
  error: 'Video Playback Interrupted',
};

export const segmentDestination: Destination = {
  id: 'segment',
  label: 'Segment',
  map: (e) => {
    let name = SEGMENT_NAMES[e.event];
    if (e.event === 'visibility_change' && !e.params.visible) name = 'Video Playback Interrupted';
    if (e.event === 'session_start') name = 'Video Content Started';
    if (!name) return null;
    const c = e.content;
    const props: Record<string, unknown> = {
      session_id: e.sessionId,
      content_asset_id: c?.id,
      position: c ? Math.round(c.position) : undefined,
      total_length: c ? Math.round(c.duration) : undefined,
      bitrate: e.qoe.bitrateKbps,
      video_player: e.player.name,
      sound: e.player.muted ? 0 : Math.round(e.player.volume * 100),
      full_screen: e.player.fullscreen,
      ad_enabled: true,
      quality: e.qoe.resolution,
      livestream: c?.streamType === 'live',
    };
    if (e.event === 'session_start' || e.event === 'content_completed' || e.event === 'heartbeat') {
      Object.assign(props, { asset_id: c?.id, title: c?.title, publisher: 'NASA', full_episode: true });
    }
    if (e.event === 'seek_start') props.seek_position = Math.round(Number(e.params.from));
    if (e.event === 'seek_complete') props.seek_position = Math.round(Number(e.params.to));
    if (e.event === 'error') props.method = `${e.params.type}:${e.params.code}`;
    if (e.event === 'visibility_change') props.method = 'page_hidden';
    if (e.ad) {
      Object.assign(props, {
        ad_asset_id: e.ad.adId,
        ad_pod_id: e.ad.breakId,
        ad_type: e.ad.breakType === 'preroll' ? 'pre-roll' : e.ad.breakType === 'midroll' ? 'mid-roll' : 'post-roll',
        asset_id: e.ad.adId,
        pod_id: e.ad.breakId,
        title: e.ad.adTitle,
        publisher: e.ad.advertiser,
        position: Math.round(e.ad.position),
        total_length: Math.round(e.ad.duration),
      });
    }
    for (const k of Object.keys(props)) if (props[k] === undefined) delete props[k];
    return { call: `analytics.track('${name}', {…})`, payload: { event: name, properties: props } };
  },
};

export const DESTINATIONS: Destination[] = [dataLayerDestination, ga4Destination, adobeDestination, segmentDestination];
