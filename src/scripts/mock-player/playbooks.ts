/**
 * Play plans: long scripted sessions that drive the player like a real
 * viewer would, clicking the same buttons, so the event stream is what a
 * production implementation would see for that kind of visit.
 */
import type { CanonicalEvent } from './events';
import type { FeatureFlags, Features } from './features';
import type { Identity } from './identity';
import type { AdSchedule, FormFactor, MockPlayer } from './player';

export interface PlanCtx {
  player: MockPlayer;
  features: Features;
  identity: Identity;
  setFormFactor: (ff: FormFactor) => void;
  /** Click a feature button (data-f) or selector once it appears. Throws unless optional. */
  click: (target: string, timeoutMs?: number, optional?: boolean) => Promise<boolean>;
  /** Resolve when the event fires (counting from now). Times out to null with a console warning. */
  waitEvent: (name: string, timeoutMs?: number) => Promise<CanonicalEvent | null>;
  /** Like waitEvent, but resolves at once if the event already fired in the current session. */
  reached: (name: string, timeoutMs?: number) => Promise<CanonicalEvent | null>;
  wait: (ms: number) => Promise<void>;
  /** Wait until content reaches a position (seconds). */
  playTo: (seconds: number, timeoutMs?: number) => Promise<void>;
  /** Fast-forward every ad until content resumes. */
  clearAds: (opts?: { skip?: boolean; clickFirst?: boolean }) => Promise<void>;
  flags: (f: Partial<FeatureFlags>) => void;
  /** Called by the runner before each step (moves the event window forward). */
  beginStep?: () => void;
  schedule: (s: Partial<AdSchedule>) => void;
}

export interface Step {
  say: string;
  /** May return a promise; the runner awaits whatever comes back. */
  run: (c: PlanCtx) => unknown;
}

export interface Plan {
  id: string;
  title: string;
  summary: string;
  steps: Step[];
}

/* -------------------------------------------------------------------- */

export const PLANS: Plan[] = [
  {
    id: 'first-visit',
    title: 'First-time visitor, desktop',
    summary: 'New visitor accepts consent, sits through a bumper and pre-roll, skips the intro, engages with chapters, CTA, like and share, changes quality, then picks a recommendation from the end card.',
    steps: [
      { say: 'Brand-new visitor: cookies cleared, new anonymous ID', run: async (c) => { c.features.signOut(); c.identity.reset(); c.player.emit('identity_reset', {}); c.player.emit('page_view', { trigger: 'plan' }); } },
      { say: 'Desktop browser, fast connection, default features', run: async (c) => { c.setFormFactor('desktop'); c.player.setNetwork('fiber'); c.flags({ consentGate: true, chapters: true, skipIntro: true, cta: true, endCard: true, companion: true, registrationGate: false, ageGate: false, geoBlock: false, overlayAd: false, pauseAd: false }); c.schedule({ preroll: true, bumper: true, podSize: 1, midroll: false, postroll: false, ssai: false, skippable: true }); c.player.load('perseverance-landing', { reason: 'plan' }); } },
      { say: 'Presses play: the consent banner appears first', run: (c) => (c.player.play(), c.waitEvent('gate_shown', 5000)) },
      { say: 'Accepts all cookies', run: (c) => c.click('consent-accept') },
      { say: 'A 6 s bumper plays, then a pre-roll; the companion banner shows beside the player', run: (c) => c.waitEvent('ad_start', 15000) },
      { say: 'Lets the bumper finish', run: async (c) => { c.player.adFastForward(1); await c.waitEvent('ad_complete', 10000); } },
      { say: 'Watches the pre-roll to the end (quartiles fire)', run: (c) => c.clearAds() },
      { say: 'Content starts; Skip intro is offered', run: (c) => c.reached('playback_started', 30000) },
      { say: 'Presses Skip intro', run: (c) => c.click('skip-intro', 6000) },
      { say: 'Watches into Part 1 (chapter_start / milestones)', run: (c) => c.playTo(16) },
      { say: 'Turns on captions and likes the video', run: async (c) => { c.player.toggleCaptions(); await c.click('like'); } },
      { say: 'Scrubs ahead to the middle', run: async (c) => { c.player.seek(c.player.item.duration * 0.33, 'scrub'); await c.waitEvent('seek_complete', 5000); } },
      { say: 'Waits for the call-to-action and clicks it', run: async (c) => { await c.waitEvent('cta_impression', 20000); await c.wait(1200); await c.click('cta'); } },
      { say: 'Forces 1080p from the settings menu', run: (c) => c.player.setQuality('large') },
      { say: 'Shares the video with a timestamp', run: (c) => c.click('share') },
      { say: 'Jumps near the end', run: async (c) => { c.player.setQuality('auto'); c.player.seek(c.player.item.duration - 6, 'scrub'); await c.waitEvent('content_completed', 30000); } },
      { say: 'End card appears (A/B variant from the identity panel)', run: (c) => c.waitEvent('endcard_impression', 8000) },
      { say: 'Clicks the first recommendation', run: (c) => c.click('endcard-1') },
      { say: 'Next video loads; the session ends here', run: (c) => c.wait(2500) },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy-conscious visitor',
    summary: 'Rejects all cookies. GA4 falls back to cookieless Consent Mode pings and Adobe, Segment, and Tealium are blocked. Later opts in from the panel, and full tracking resumes mid-session.',
    steps: [
      { say: 'New visitor; consent banner on', run: async (c) => { c.features.signOut(); c.identity.reset(); c.player.emit('identity_reset', {}); c.flags({ consentGate: true, registrationGate: false, ageGate: false, geoBlock: false }); c.schedule({ preroll: true, bumper: false, podSize: 1, midroll: false, ssai: false }); c.setFormFactor('desktop'); c.player.load('hubble-29', { reason: 'plan' }); } },
      { say: 'Presses play and sees the banner', run: (c) => (c.player.play(), c.waitEvent('gate_shown', 5000)) },
      { say: 'Rejects all: watch the GA4 tab show gcs=G100 and no cid', run: (c) => c.click('consent-reject') },
      { say: 'Pre-roll is non-personalized (personalized: false)', run: (c) => c.clearAds({ skip: true }) },
      { say: 'Watches 20 s: only GTM and cookieless GA4 hits go out', run: async (c) => { await c.reached('playback_started', 30000); await c.playTo(20); } },
      { say: 'Pauses to read the cookie policy', run: async (c) => { c.player.pause(); await c.wait(1500); } },
      { say: 'Changes their mind: grants analytics only', run: async (c) => { c.features.setConsent({ analytics: true, advertising: false, personalization: false }, 'preference_center'); } },
      { say: 'Resumes: Adobe, Segment, and Tealium start sending', run: async (c) => { c.player.play(); await c.playTo(32); } },
      { say: 'Opts in to advertising too', run: async (c) => c.features.setConsent({ analytics: true, advertising: true, personalization: true }, 'preference_center') },
      { say: 'Watches to the next heartbeat with full consent', run: (c) => c.waitEvent('heartbeat', 15000) },
    ],
  },
  {
    id: 'commuter',
    title: 'Mobile commuter on a train',
    summary: 'Phone in portrait on 4G. Rotates to fullscreen, drops to 3G then loses signal in a tunnel (stalls, ABR down-switches), recovers, gets backgrounded, and comes back.',
    steps: [
      { say: 'Returning visitor on a phone, consent already given', run: async (c) => { c.features.setConsent({ analytics: true, advertising: true, personalization: true }, 'stored'); c.setFormFactor('mobile'); c.player.setNetwork('lte'); c.flags({ consentGate: true, registrationGate: false, ageGate: false, geoBlock: false, pauseAd: false }); c.schedule({ preroll: true, bumper: false, podSize: 1, midroll: true, ssai: false }); c.player.load('artemis-i-recap', { reason: 'plan' }); } },
      { say: 'Taps play; skips the pre-roll after 5 s', run: async (c) => { c.player.play(); await c.waitEvent('ad_start', 10000); await c.wait(5600); await c.click('.mp__adskip'); } },
      { say: 'Content starts at a 4G-friendly rendition', run: (c) => c.reached('playback_started', 30000) },
      { say: 'Rotates to landscape (orientation_change + fullscreen)', run: async (c) => { await c.wait(3000); c.player.rotate(); } },
      { say: 'Train slows: network drops to 3G', run: async (c) => { c.player.setNetwork('3g'); await c.wait(9000); } },
      { say: 'Tunnel: offline. The buffer drains and playback stalls', run: async (c) => { c.player.setNetwork('offline'); await c.waitEvent('buffer_start', 40000); await c.wait(4000); } },
      { say: 'Out of the tunnel on 2G: the player picks 180p', run: async (c) => { c.player.setNetwork('edge'); await c.waitEvent('buffer_end', 30000); } },
      { say: 'Back on 4G: ABR steps back up', run: async (c) => { c.player.setNetwork('lte'); await c.wait(9000); } },
      { say: 'Checks a message: the app is backgrounded and pauses', run: async (c) => { c.player.pause('background'); c.player.emit('visibility_change', { visible: false, simulated: true }); await c.wait(3000); } },
      { say: 'Returns to the app and resumes', run: async (c) => { c.player.emit('visibility_change', { visible: true, simulated: true }); c.player.play(); await c.wait(3000); } },
      { say: 'Rotates back to portrait', run: async (c) => { c.player.rotate(); await c.wait(1500); } },
      { say: 'Mid-roll arrives; watches it', run: async (c) => { c.player.seek(c.player.item.duration / 2 - 3, 'scrub'); await c.waitEvent('ad_start', 20000); await c.clearAds(); } },
      { say: 'Gets off the train: closes the video', run: (c) => c.player.load('perseverance-landing', { reason: 'user_exit' }) },
    ],
  },
  {
    id: 'living-room',
    title: 'Living-room TV, live event',
    summary: 'Smart TV with a remote. Joins the live stream during the pre-show slate, navigates with the D-pad, rewinds the DVR window, returns to live, rides out a technical-difficulties slate, and watches a stitched (SSAI) ad break.',
    steps: [
      { say: 'Smart TV, cable broadband, server-side ads', run: async (c) => { c.features.setConsent({ analytics: true, advertising: true, personalization: true }, 'stored'); c.setFormFactor('ctv'); c.player.setNetwork('cable'); c.flags({ preshow: true, registrationGate: false, ageGate: false, geoBlock: false }); c.schedule({ preroll: true, bumper: false, podSize: 1, midroll: true, ssai: true }); c.player.load('iss-tour-live', { reason: 'plan' }); } },
      { say: 'Presses OK on the remote: the "Starting soon" slate is up', run: async (c) => { c.player.focusFirstControl(); c.player.handleRemote('Enter'); await c.waitEvent('slate_start', 5000); } },
      { say: 'Waits out the pre-show countdown', run: (c) => c.waitEvent('slate_end', 15000) },
      { say: 'A stitched pre-roll plays (no skip, ad markers in the stream)', run: (c) => c.clearAds() },
      { say: 'Live content starts at the live edge', run: (c) => c.reached('playback_started', 30000) },
      { say: 'D-pad: focus moves play → next → back 10 s; OK presses it', run: async (c) => { await c.wait(3000); c.player.focusFirstControl(); c.player.handleRemote('ArrowRight'); await c.wait(500); c.player.handleRemote('ArrowRight'); await c.wait(500); c.player.handleRemote('Enter'); await c.wait(1500); } },
      { say: 'Rewinds 90 s into the DVR window', run: async (c) => { c.player.seek(c.player.position - 90, 'remote'); await c.waitEvent('seek_complete', 5000); await c.wait(5000); } },
      { say: 'Presses LIVE to return to the live edge', run: async (c) => { await c.click('.mp__live'); await c.wait(3000); } },
      { say: 'Broadcast hiccup: technical-difficulties slate', run: async (c) => { c.player.injectError('tech_slate'); await c.waitEvent('slate_end', 15000); } },
      { say: 'Turns on captions from the remote menu', run: async (c) => { c.player.toggleCaptions(); await c.wait(4000); } },
      { say: 'Stitched mid-roll break', run: async (c) => { await c.waitEvent('ad_break_start', 90000); await c.clearAds(); } },
      { say: 'Keeps watching live', run: (c) => c.waitEvent('heartbeat', 15000) },
    ],
  },
  {
    id: 'paywall',
    title: 'Paywall prospect from a paid social ad',
    summary: 'Arrives from a Meta campaign (UTM), watches the 30 s free preview, hits the registration gate, dismisses it, comes back, signs in (identify links the anonymous ID), finishes, and clicks Subscribe.',
    steps: [
      { say: 'New visitor lands from a paid social campaign link', run: async (c) => { c.features.signOut(); c.identity.reset(); c.player.emit('identity_reset', {}); c.identity.setCampaign('paid_social'); c.player.emit('campaign_arrival', { campaign: 'paid_social' }); c.features.setConsent({ analytics: true, advertising: true, personalization: true }, 'accept_all'); } },
      { say: 'Registration gate on: 30 s free preview', run: async (c) => { c.setFormFactor('desktop'); c.player.setNetwork('cable'); c.flags({ registrationGate: true, ageGate: false, geoBlock: false, resume: false }); c.schedule({ preroll: false, midroll: false, ssai: false }); c.player.load('webb-overview', { reason: 'plan' }); } },
      { say: 'Plays the video', run: async (c) => { c.player.play(); await c.reached('playback_started', 30000); } },
      { say: 'Watches the free preview', run: (c) => c.playTo(29, 60000) },
      { say: 'Preview ends: "Sign in to keep watching"', run: (c) => c.waitEvent('gate_shown', 15000) },
      { say: 'Clicks "Not now" (gate_dismissed; playback stays blocked)', run: async (c) => { await c.wait(1500); await c.click('gate-dismiss'); await c.wait(2000); } },
      { say: 'Tries play anyway: still blocked', run: async (c) => { c.player.play(); await c.wait(1500); } },
      { say: 'Reopens the gate', run: (c) => c.click('gate-reopen') },
      { say: 'Signs in: identify() links anon ID to usr_48213', run: async (c) => { await c.wait(1200); await c.click('gate-signin'); } },
      { say: 'Playback resumes as a known user', run: (c) => c.playTo(45, 40000) },
      { say: 'Skips to the end', run: async (c) => { c.player.seek(c.player.item.duration - 5, 'scrub'); await c.waitEvent('endcard_impression', 30000); } },
      { say: 'Clicks Subscribe on the end card', run: (c) => c.click('subscribe') },
      { say: 'Done: compare the anonymous vs. signed-in hits in the Segment tab', run: async (c) => { await c.click('endcard-cancel', 2000, true); c.flags({ registrationGate: false, resume: true }); } },
    ],
  },
  {
    id: 'ad-ops',
    title: 'Ad ops audit: every ad type',
    summary: 'Bumper, a two-ad pre-roll pod (one skipped, one clicked), companion banner, overlay banner, mid-roll, pause ad, post-roll, an empty VAST response, then the same break as SSAI with a filler slate.',
    steps: [
      { say: 'Client-side ads: bumper + 2-ad pod, mid-roll, post-roll, overlay, companion, pause ad', run: async (c) => { c.features.setConsent({ analytics: true, advertising: true, personalization: true }, 'stored'); c.setFormFactor('desktop'); c.player.setNetwork('fiber'); c.flags({ overlayAd: true, companion: true, pauseAd: true, registrationGate: false, ageGate: false, geoBlock: false, resume: false }); c.schedule({ preroll: true, bumper: true, podSize: 2, midroll: true, postroll: true, ssai: false, skippable: true }); c.player.load('artemis-i-recap', { reason: 'plan' }); } },
      { say: 'Play: the bumper runs (6 s, unskippable)', run: async (c) => { c.player.play(); await c.waitEvent('ad_start', 10000); c.player.adFastForward(1); await c.waitEvent('ad_complete', 10000); } },
      { say: 'Ad 2: clicks the companion banner, then skips at 5 s', run: async (c) => { await c.waitEvent('ad_start', 10000); await c.click('companion'); await c.wait(5600); await c.click('.mp__adskip'); } },
      { say: 'Ad 3: clicks "Learn more" and watches all quartiles', run: async (c) => { await c.waitEvent('ad_start', 10000); await c.click('.mp__adlink'); await c.clearAds(); } },
      { say: 'Content: the overlay banner appears at 20 s', run: async (c) => { await c.reached('playback_started', 30000); await c.waitEvent('overlay_ad_impression', 40000); } },
      { say: 'Clicks the overlay banner', run: async (c) => { await c.wait(1500); await c.click('overlay-ad'); } },
      { say: 'Pauses: a pause ad appears', run: async (c) => { c.player.pause(); await c.waitEvent('pause_ad_impression', 5000); } },
      { say: 'Clicks the pause ad, then resumes', run: async (c) => { await c.click('pause-ad'); await c.wait(800); c.player.play(); } },
      { say: 'Seeks to the mid-roll and watches it', run: async (c) => { c.player.seek(c.player.item.duration / 2 - 3, 'scrub'); await c.waitEvent('ad_break_start', 20000); await c.clearAds(); } },
      { say: 'Seeks to the end: post-roll plays', run: async (c) => { c.player.seek(c.player.item.duration - 4, 'scrub'); await c.waitEvent('ad_break_start', 30000); await c.clearAds(); } },
      { say: 'Switches to SSAI and reloads', run: async (c) => { await c.click('endcard-cancel', 4000, true); c.schedule({ ssai: true, bumper: false, podSize: 1, postroll: false }); c.flags({ overlayAd: false, pauseAd: false }); c.player.load('sdo-year-7', { reason: 'plan' }); } },
      { say: 'Ad server will return nothing for the next break (VAST 303)', run: async (c) => { c.player.injectError('ad_vast_303'); } },
      { say: 'Plays: the stitched break is filled with a "We\'ll be right back" slate', run: async (c) => { c.player.play(); await c.waitEvent('slate_start', 15000); await c.waitEvent('slate_end', 15000); } },
      { say: 'Mid-roll is a normal stitched ad', run: async (c) => { await c.reached('playback_started', 30000); c.player.seek(c.player.item.duration / 2 - 3, 'scrub'); await c.waitEvent('ad_start', 20000); await c.clearAds(); } },
      { say: 'Audit complete: filter the console by "ad"', run: async (c) => { c.schedule({ ssai: false, postroll: false, podSize: 2 }); c.flags({ resume: true }); } },
    ],
  },
  {
    id: 'controls-tour',
    title: 'Controls tour: every button',
    summary: 'Works through every control a viewer can touch: volume, mute, speed, theater, mini-player, playlist, autoplay, like and unlike, cast, audio description, chapters, overlay close, and the resume prompt (accept, then decline).',
    steps: [
      { say: 'Desktop, fiber, consent granted, no linear ads, overlay banner on', run: async (c) => { c.features.setConsent({ analytics: true, advertising: true, personalization: true }, 'stored'); c.setFormFactor('desktop'); c.player.setLocation('chicago'); c.player.setNetwork('cable'); c.flags({ registrationGate: false, ageGate: false, geoBlock: false, overlayAd: true, resume: true, cta: true }); c.schedule({ preroll: false, midroll: false, postroll: false, ssai: false }); c.player.load('sdo-year-7', { reason: 'plan' }); c.features.clearSavedPositions(); c.player.play(); await c.reached('playback_started', 20000); } },
      { say: 'Mutes, unmutes, then turns the volume down', run: async (c) => { c.player.toggleMute(); await c.wait(600); c.player.toggleMute(); await c.wait(600); c.player.setVolume(0.4); await c.waitEvent('volume_change', 3000); } },
      { say: 'Speeds up to 1.5×, then back to normal', run: async (c) => { c.player.setRate(1.5); await c.wait(2500); c.player.setRate(1); } },
      { say: 'Theater mode on and off', run: async (c) => { c.player.toggleTheater(); await c.wait(2000); c.player.toggleTheater(); } },
      { say: 'Pops out to the mini-player and back', run: async (c) => { c.player.toggleMini('button'); await c.wait(2000); c.player.toggleMini('button'); } },
      { say: 'Likes, then unlikes', run: async (c) => { await c.click('like'); await c.wait(800); await c.click('like'); } },
      { say: 'Switches to the audio-description track and back', run: async (c) => { c.features.setAudio('en-ad'); await c.wait(1500); c.features.setAudio('en'); } },
      { say: 'Casts to the living-room TV, then stops', run: async (c) => { await c.click('cast'); await c.wait(3000); await c.click('cast'); } },
      { say: 'Overlay banner appears at 20 s; closes it', run: async (c) => { await c.reached('overlay_ad_impression', 30000); await c.wait(1000); await c.click('overlay-close'); } },
      { say: 'Jumps to Part 2 from the chapter list', run: async (c) => { c.features.jumpToChapter(2); await c.waitEvent('chapter_start', 8000); } },
      { say: 'Skips to the next video with the Next button, then comes back', run: async (c) => { c.player.next(); await c.reached('playback_started', 20000); await c.wait(1500); c.player.previous(); await c.reached('playback_started', 20000); c.features.jumpToChapter(2); await c.wait(1500); } },
      { say: 'Turns autoplay-next off', run: async (c) => c.player.setAutoplay(false) },
      { say: 'Leaves for the previous video in the playlist (position saved for later)', run: async (c) => { c.player.previous(); await c.reached('playback_started', 20000); await c.wait(2000); } },
      { say: 'Returns to SDO: Year 7; the resume prompt offers the saved position', run: async (c) => { c.player.load('sdo-year-7', { reason: 'plan' }); c.player.play(); await c.waitEvent('resume_prompt', 5000); await c.wait(1200); await c.click('resume-accept'); await c.reached('playback_started', 20000); await c.wait(3000); } },
      { say: 'Comes back again later and chooses Start over', run: async (c) => { c.player.load('sdo-year-7', { reason: 'plan' }); c.player.play(); await c.waitEvent('resume_prompt', 5000); await c.wait(1200); await c.click('resume-decline'); await c.reached('playback_started', 20000); } },
      { say: 'Autoplay back on; overlay banner off', run: async (c) => { c.player.setAutoplay(true); c.flags({ overlayAd: false }); } },
    ],
  },
  {
    id: 'edge-cases',
    title: 'Edge cases: where the viewer is',
    summary: 'Same video from very different places: inside the origin data center, Seattle fiber, a Nebraska ranch on 56k dial-up, the same ranch on GEO satellite and Starlink, a misrouted viewer, Sydney with no CDN, and an offline gap. Compare startup time, ABR, and beacon latency in the Network tab.',
    steps: [
      { say: 'Consent granted, no ads, desktop', run: async (c) => { c.features.setConsent({ analytics: true, advertising: true, personalization: true }, 'stored'); c.setFormFactor('desktop'); c.flags({ registrationGate: false, ageGate: false, geoBlock: false, resume: false, cta: false }); c.schedule({ preroll: false, midroll: false, postroll: false, ssai: false }); } },
      { say: 'A laptop inside us-east-1, the same data center as the origin: sub-millisecond RTT', run: async (c) => { c.player.setLocation('ashburn_dc'); c.player.setNetwork('datacenter'); c.player.setRouting('auto'); c.player.load('perseverance-landing', { reason: 'plan' }); c.player.play(); await c.reached('playback_started', 20000); await c.wait(4000); } },
      { say: 'Seattle on fiber via the Seattle edge: the everyday baseline', run: async (c) => { c.player.setLocation('seattle'); c.player.setNetwork('fiber'); c.player.load('perseverance-landing', { reason: 'plan' }); c.player.play(); await c.reached('playback_started', 20000); await c.wait(4000); } },
      { say: 'Ranch in the Nebraska Sandhills on 56k dial-up: below the lowest rendition', run: async (c) => { c.player.setLocation('rural_ne'); c.player.setNetwork('dialup'); c.player.load('perseverance-landing', { reason: 'plan' }); c.player.play(); await c.wait(20000); } },
      { say: 'Same ranch on GEO satellite: plenty of bandwidth, ~650 ms round trips', run: async (c) => { c.player.setNetwork('satellite'); c.player.load('perseverance-landing', { reason: 'plan' }); c.player.play(); await c.reached('playback_started', 40000); await c.wait(8000); } },
      { say: 'Same ranch on Starlink: low-earth orbit cuts latency', run: async (c) => { c.player.setNetwork('starlink'); c.player.load('perseverance-landing', { reason: 'plan' }); c.player.play(); await c.reached('playback_started', 30000); await c.wait(6000); } },
      { say: 'Misrouted: a Seattle cable viewer sent to the New York edge (bad DNS resolver)', run: async (c) => { c.player.setLocation('seattle'); c.player.setNetwork('cable'); c.player.setRouting('pop_new_york'); c.player.load('perseverance-landing', { reason: 'plan' }); c.player.play(); await c.reached('playback_started', 30000); await c.wait(5000); } },
      { say: 'Sydney on 4G with no CDN: every request crosses the Pacific to Virginia', run: async (c) => { c.player.setLocation('sydney'); c.player.setNetwork('lte'); c.player.setRouting('origin'); c.player.load('perseverance-landing', { reason: 'plan' }); c.player.play(); await c.reached('playback_started', 40000); await c.wait(6000); } },
      { say: 'Connection drops: GA4 and Adobe hits are dropped, Segment queues them', run: async (c) => { c.player.setRouting('auto'); c.player.setNetwork('offline'); c.player.toggleCaptions(); await c.wait(1000); c.player.toggleCaptions(); await c.waitEvent('buffer_start', 30000); await c.wait(3000); } },
      { say: 'Back online: Segment flushes its queue (late, but delivered)', run: async (c) => { c.player.setNetwork('lte'); await c.waitEvent('buffer_end', 30000); await c.wait(3000); } },
      { say: 'Back to Seattle fiber', run: async (c) => { c.player.setLocation('seattle'); c.player.setNetwork('fiber'); c.flags({ resume: true, cta: true }); } },
    ],
  },
  {
    id: 'chaos',
    title: 'Chaos QA: everything breaks',
    summary: 'A QA engineer walks the failure paths: bandwidth crash, rendition 404 failover, decode error with retry, DRM failure, then gates that fail: under-age viewer and a geo-blocked region.',
    steps: [
      { say: 'Desktop, cable, consent granted, no ads', run: async (c) => { c.features.setConsent({ analytics: true, advertising: true, personalization: true }, 'stored'); c.setFormFactor('desktop'); c.player.setNetwork('cable'); c.flags({ registrationGate: false, ageGate: false, geoBlock: false, resume: false }); c.schedule({ preroll: false, midroll: false, postroll: false, ssai: false }); c.player.load('sunspot-two-weeks', { reason: 'plan' }); } },
      { say: 'Starts playback', run: async (c) => { c.player.play(); await c.reached('playback_started', 30000); await c.wait(3000); } },
      { say: 'Bandwidth crashes to 300 kbps: stall and ABR down-switch', run: async (c) => { c.player.injectError('bandwidth_crash'); await c.waitEvent('buffer_start', 30000); } },
      { say: 'Network restored', run: async (c) => { c.player.setNetwork('cable'); await c.waitEvent('buffer_end', 30000); await c.wait(3000); } },
      { say: 'Current rendition starts returning 404s: failover to a lower one', run: async (c) => { c.player.injectError('network_404'); await c.waitEvent('error_recovered', 10000); await c.wait(3000); } },
      { say: 'Decoder error: the viewer presses Retry', run: async (c) => { c.player.injectError('media_decode'); await c.wait(1500); await c.click('[data-el="errorRetry"]'); await c.wait(3000); } },
      { say: 'DRM license denied: fatal error', run: async (c) => { c.player.injectError('drm_license'); await c.wait(2500); } },
      { say: 'Age gate on; viewer enters a birth year that makes them 15', run: async (c) => { c.features.resetAge(); c.flags({ ageGate: true }); c.player.load('hubble-29', { reason: 'plan' }); c.player.play(); await c.waitEvent('gate_shown', 5000); const sel = document.querySelector<HTMLSelectElement>('[data-f="age-year"]'); if (sel) sel.value = String(new Date().getFullYear() - 15); await c.wait(1000); await c.click('age-submit'); await c.wait(2500); } },
      { say: 'Geo-block on: viewer is outside the licensed regions', run: async (c) => { c.flags({ ageGate: false, geoBlock: true }); c.player.load('webb-overview', { reason: 'plan' }); c.player.play(); await c.waitEvent('gate_failed', 5000); await c.wait(2500); } },
      { say: 'Cleanup: gates off', run: async (c) => { c.flags({ geoBlock: false, ageGate: false, resume: true }); c.player.load(0, { reason: 'plan_end' }); } },
    ],
  },
];

/* -------------------------------------------------------------------- */

export type RunnerListener = (u: { plan: Plan; index: number; step: Step | null; status: 'step' | 'done' | 'stopped' | 'error'; message?: string }) => void;

export class PlanRunner {
  private stopFlag = false;
  running: Plan | null = null;
  private listeners = new Set<RunnerListener>();

  constructor(private makeCtx: (shouldStop: () => boolean) => PlanCtx) {}

  on(fn: RunnerListener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(u: Parameters<RunnerListener>[0]) {
    for (const fn of this.listeners) fn(u);
  }

  stop() {
    this.stopFlag = true;
  }

  async run(plan: Plan) {
    if (this.running) return;
    this.running = plan;
    this.stopFlag = false;
    const ctx = this.makeCtx(() => this.stopFlag);
    try {
      for (let i = 0; i < plan.steps.length; i++) {
        if (this.stopFlag) {
          this.notify({ plan, index: i, step: null, status: 'stopped' });
          return;
        }
        const step = plan.steps[i];
        this.notify({ plan, index: i, step, status: 'step' });
        ctx.beginStep?.();
        await step.run(ctx);
        await ctx.wait(900);
      }
      this.notify({ plan, index: plan.steps.length, step: null, status: 'done' });
    } catch (err) {
      this.notify({ plan, index: -1, step: null, status: this.stopFlag ? 'stopped' : 'error', message: String((err as Error)?.message ?? err) });
    } finally {
      this.running = null;
    }
  }
}
