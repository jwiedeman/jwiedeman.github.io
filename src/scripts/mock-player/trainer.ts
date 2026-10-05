/**
 * Trainer: wires the player, features, identity, vendors, and play plans to
 * the page: control panel, event console (per-vendor calls and network
 * requests), QoE + identity readouts, and the public window API.
 */
import catalogData from '../../data/mock-player-catalog.json';
import { EVENT_CATALOG, type CanonicalEvent, type EventCategory } from './events';
import { DESTINATIONS, type Mapped, type Req } from './mappers';
import { MockPlayer, type AdSchedule, type CatalogItem, type ErrorKind, type FormFactor } from './player';
import { CONNECTIONS, LOCATIONS, POPS, type BeaconTiming } from './network';
import { Features, type FeatureFlags } from './features';
import { CAMPAIGNS, Identity } from './identity';
import { PLANS, PlanRunner, type PlanCtx } from './playbooks';

declare global {
  interface Window {
    dataLayer: unknown[];
    mockPlayer: unknown;
  }
}

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

const MAX_ROWS = 500;
const VENDOR_DESTS = DESTINATIONS.filter((d) => d.id !== 'gtm');

interface NetRow {
  e: CanonicalEvent;
  dest: (typeof DESTINATIONS)[number];
  m: Mapped;
  req: Req;
  timing: BeaconTiming | null;
  path: string;
}

export function initTrainer() {
  const host = $('#mp-player');
  const identity = new Identity();
  const player = new MockPlayer(host, catalogData as CatalogItem[]);
  player.bus.contextProvider = () => identity.context();
  const features = new Features(player, identity, $('#mpt-companion'));
  // Undecided consent counts as no ad consent (GDPR-style default).
  player.adsPersonalized = identity.consent.advertising;
  const page = $('.mpt');

  /* ---------------- dataLayer + DOM event ---------------- */
  window.dataLayer = window.dataLayer || [];
  player.bus.on((e) => {
    window.dataLayer.push(DESTINATIONS[0].map(e)!.payload);
    window.dispatchEvent(new CustomEvent('mockplayer:event', { detail: e }));
  });

  /* ---------------- device ---------------- */
  const stage = $('.mpt__stage');
  function setFormFactor(ff: FormFactor) {
    player.setFormFactor(ff);
    identity.deviceType = ff === 'ctv' ? 'smart_tv' : ff === 'embed' ? 'desktop' : ff;
    stage.dataset.ff = ff;
    $$('[data-ff]', $('.mpt__devices')).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ff === ff)));
    $('.mpt__remote').hidden = ff !== 'ctv';
    $('[data-action="rotate"]').toggleAttribute('disabled', !(ff === 'mobile' || ff === 'tablet'));
    stage.dataset.orientation = player.orientation;
  }
  $$('[data-ff]', $('.mpt__devices')).forEach((b) => (b.onclick = () => setFormFactor(b.dataset.ff as FormFactor)));
  $('[data-action="rotate"]').onclick = () => {
    player.rotate();
    stage.dataset.orientation = player.orientation;
  };
  player.bus.on((e) => {
    if (e.event === 'orientation_change') stage.dataset.orientation = player.orientation;
  });
  host.addEventListener('mp:theater', (e) => page.classList.toggle('is-theater', (e as CustomEvent).detail));
  $$('[data-key]', $('.mpt__remote')).forEach((b) => {
    b.onmousedown = (e) => e.preventDefault();
    b.onclick = () => {
      if (!host.contains(document.activeElement)) player.focusFirstControl();
      player.handleRemote(b.dataset.key!);
    };
  });

  /* ---------------- network ---------------- */
  const net = $<HTMLSelectElement>('#mpt-network');
  const loc = $<HTMLSelectElement>('#mpt-location');
  const route = $<HTMLSelectElement>('#mpt-route');
  net.innerHTML = CONNECTIONS.map((n) => `<option value="${n.id}">${n.label}</option>`).join('');
  loc.innerHTML = LOCATIONS.map((l) => `<option value="${l.id}">${l.label}</option>`).join('');
  route.innerHTML = [`<option value="auto">Nearest CDN edge</option>`, ...POPS.map((p) => `<option value="${p.id}">Force ${p.label}</option>`), `<option value="origin">No CDN (origin, us-east-1)</option>`].join('');
  net.onchange = () => player.setNetwork(net.value);
  loc.onchange = () => player.setLocation(loc.value);
  route.onchange = () => player.setRouting(route.value);
  const pathBox = $('#mpt-path');
  const renderPath = () => {
    const p = player.net.path;
    net.value = p.connection.id;
    loc.value = p.location.id;
    route.value = p.routing;
    identity.connectionType = p.connection.id;
    identity.geo = p.location.label;
    const kbps = (k: number) => (k >= 1000 ? `${(k / 1000).toFixed(k >= 100000 ? 0 : 1)} Mbps` : `${Math.round(k)} kbps`);
    const rows: [string, string][] = [
      ['Served from', `${p.server.label}${p.serverKind === 'origin' ? ' (cache miss)' : ''}`],
      ['Distance', `${p.distanceKm.toLocaleString()} km`],
      ['Round trip', `${p.rttMs} ms`],
      ['Packet loss', `${p.lossPct}%`],
      ['Link', kbps(p.linkKbps)],
      ['Usable (1 TCP flow)', kbps(p.throughputKbps)],
      ['First byte (new conn.)', `${Math.round(p.rttMs * 4)} ms`],
    ];
    pathBox.innerHTML = rows.map(([k]) => `<dt>${k}</dt><dd></dd>`).join('');
    pathBox.querySelectorAll('dd').forEach((dd, i) => (dd.textContent = rows[i][1]));
    const note = p.location.note ?? '';
    $('#mpt-path-note').textContent = note;
  };
  player.bus.on((e) => {
    if (e.event === 'network_change') renderPath();
  });
  renderPath();

  /* ---------------- ads + features + gates ---------------- */
  const syncToggles = () => {
    $$<HTMLInputElement>('[data-ad]').forEach((c) => (c.checked = Boolean(player.schedule[c.dataset.ad as keyof AdSchedule])));
    $$<HTMLInputElement>('[data-flag]').forEach((c) => (c.checked = Boolean(features.flags[c.dataset.flag as keyof FeatureFlags])));
    $<HTMLSelectElement>('#mpt-pod').value = String(player.schedule.podSize);
  };
  $$<HTMLInputElement>('[data-ad]').forEach((c) => {
    c.onchange = () => ((player.schedule as unknown as Record<string, boolean>)[c.dataset.ad!] = c.checked);
  });
  $$<HTMLInputElement>('[data-flag]').forEach((c) => {
    c.onchange = () => {
      features.setFlag(c.dataset.flag as keyof FeatureFlags, c.checked);
      if (c.dataset.flag === 'companion') features.refreshCompanion();
    };
  });
  const pod = $<HTMLSelectElement>('#mpt-pod');
  pod.onchange = () => (player.schedule.podSize = Number(pod.value));
  $$('[data-action="reload"]').forEach((b) => (b.onclick = () => player.load(player.index, { autoplay: false, reason: 'reload' })));
  $$('[data-error]').forEach((b) => (b.onclick = () => player.injectError(b.dataset.error as ErrorKind)));

  /* ---------------- identity + consent ---------------- */
  const idBox = $('#mpt-identity');
  const renderIdentity = () => {
    const u = identity.user();
    const pg = identity.page();
    const rows: [string, string][] = [
      ['Anonymous ID', u.anonymousId],
      ['User ID', u.userId ?? '—'],
      ['Tier', u.tier],
      ['GA client ID', u.gaClientId],
      ['Adobe ECID', `${u.ecid.slice(0, 10)}…`],
      ['Session', `#${u.sessionNumber} · ${u.analyticsSessionId}`],
      ['Visitor', u.isNewVisitor ? 'new' : 'returning'],
      ['A/B variant', u.experiment.variant],
      ['Campaign', pg.campaign ? `${pg.campaign.source} / ${pg.campaign.medium} / ${pg.campaign.name}` : '(direct)'],
      ['Device', `${pg.deviceType} · ${pg.browser} · ${pg.os}`],
      ['Locale', `${pg.language} · ${pg.timezone}`],
      ['Consent', u.consent.decided ? `analytics ${u.consent.analytics ? '✓' : '✗'} · ads ${u.consent.advertising ? '✓' : '✗'} · personal ${u.consent.personalization ? '✓' : '✗'}` : 'not decided'],
    ];
    idBox.innerHTML = rows.map(([k]) => `<dt>${k}</dt><dd></dd>`).join('');
    idBox.querySelectorAll('dd').forEach((dd, i) => (dd.textContent = rows[i][1]));
    $<HTMLButtonElement>('[data-action="signin"]').hidden = !!u.userId;
    $<HTMLButtonElement>('[data-action="signout"]').hidden = !u.userId;
    $$<HTMLInputElement>('[data-consent]').forEach((c) => (c.checked = Boolean(u.consent[c.dataset.consent as 'analytics'])));
    $<HTMLSelectElement>('#mpt-variant').value = u.experiment.variant;
    const camp = Object.entries(CAMPAIGNS).find(([, v]) => v.name === pg.campaign?.name)?.[0] ?? '';
    $<HTMLSelectElement>('#mpt-campaign').value = camp;
  };
  identity.onChange(renderIdentity);
  player.bus.on((e) => {
    if (['sign_in', 'sign_out', 'consent_update', 'identity_reset', 'campaign_arrival'].includes(e.event)) renderIdentity();
  });
  $('[data-action="signin"]').onclick = () => features.signIn('panel');
  $('[data-action="signout"]').onclick = () => features.signOut();
  $('[data-action="new-visitor"]').onclick = () => {
    features.signOut();
    identity.reset();
    player.emit('identity_reset', {});
    player.emit('page_view', { trigger: 'new_visitor' });
    player.load(player.index, { reason: 'new_visitor' });
  };
  $<HTMLSelectElement>('#mpt-campaign').onchange = (e) => {
    const v = (e.target as HTMLSelectElement).value;
    identity.setCampaign(v || null);
    player.emit('campaign_arrival', { campaign: v || '(direct)' });
  };
  $<HTMLSelectElement>('#mpt-variant').onchange = (e) => identity.setVariant((e.target as HTMLSelectElement).value);
  $('[data-action="save-consent"]').onclick = () => {
    const pick = (k: string) => $<HTMLInputElement>(`[data-consent="${k}"]`).checked;
    features.setConsent({ analytics: pick('analytics'), advertising: pick('advertising'), personalization: pick('personalization') }, 'preference_center');
  };
  $('[data-action="reset-consent"]').onclick = () => {
    identity.clearConsent();
    player.adsPersonalized = false;
    player.load(player.index, { reason: 'consent_reset' });
    player.toast('Consent cleared: the banner shows on next play');
  };

  /* ---------------- console ---------------- */
  const list = $('#mpt-log');
  const detail = $('#mpt-detail');
  let tab = 'canonical';
  let paused = false;
  let query = '';
  const hidden = new Set<EventCategory>();
  let selected: { kind: 'event'; e: CanonicalEvent } | { kind: 'net'; r: NetRow } | { kind: 'marker'; text: string } | null = null;
  const markers: { afterSeq: number; text: string; cls: string }[] = [];
  const netRows: NetRow[] = [];

  const categories = Array.from(new Set(Object.values(EVENT_CATALOG).map((m) => m.category)));
  const chipBox = $('#mpt-cats');
  for (const cat of categories) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = cat;
    b.setAttribute('aria-pressed', 'true');
    b.onclick = () => {
      hidden.has(cat) ? hidden.delete(cat) : hidden.add(cat);
      b.setAttribute('aria-pressed', String(!hidden.has(cat)));
      rerender();
    };
    chipBox.append(b);
  }

  const dest = (id: string) => DESTINATIONS.find((d) => d.id === id)!;
  const visible = (e: CanonicalEvent) => !hidden.has(e.category) && (!query || `${e.event} ${JSON.stringify(e.params)}`.toLowerCase().includes(query));

  function collectNet(e: CanonicalEvent) {
    const p = player.net.path;
    for (const d of VENDOR_DESTS) {
      const m = d.map(e);
      if (!m?.request || m.blocked) continue;
      const bytes = m.request.url.length + (m.request.body ? JSON.stringify(m.request.body).length : 0) + 400; // + headers
      netRows.push({ e, dest: d, m, req: m.request, timing: player.net.beacon(d.id, bytes), path: `${p.location.label} · ${p.connection.label}` });
    }
    if (netRows.length > 3000) netRows.splice(0, netRows.length - 3000);
  }

  function eventRow(e: CanonicalEvent) {
    const li = document.createElement('li');
    li.className = 'mpt__row';
    li.dataset.cat = e.category;
    let call = '';
    if (tab === 'canonical') {
      const p = JSON.stringify(e.params);
      call = p === '{}' ? '' : p;
    } else {
      const m = dest(tab).map(e);
      if (!m) {
        li.classList.add('is-unsent');
        call = 'not sent to this destination';
      } else if (m.blocked) {
        li.classList.add('is-blocked');
        call = `⊘ ${m.blocked}`;
      } else {
        call = m.call;
      }
    }
    const t = new Date(e.timestamp);
    li.innerHTML = `<span class="mpt__seq">${e.seq}</span><span class="mpt__ts">${t.toLocaleTimeString([], { hour12: false })}.${String(t.getMilliseconds()).padStart(3, '0')}</span><span class="mpt__ev"></span><span class="mpt__call"></span>`;
    li.querySelector('.mpt__ev')!.textContent = e.event;
    li.querySelector('.mpt__call')!.textContent = call;
    li.onclick = () => select(li, { kind: 'event', e });
    if (selected?.kind === 'event' && selected.e === e) li.classList.add('is-selected');
    return li;
  }

  function netRow(r: NetRow) {
    const li = document.createElement('li');
    li.className = 'mpt__row mpt__row--net';
    li.dataset.vendor = r.dest.id;
    const u = new URL(r.req.url);
    const t = r.timing;
    if (t) li.dataset.status = t.status;
    li.innerHTML = `<span class="mpt__seq">${r.e.seq}</span><span class="mpt__method"></span><span class="mpt__ev"></span><span class="mpt__status"></span><span class="mpt__call"></span>`;
    li.querySelector('.mpt__method')!.textContent = r.req.method;
    li.querySelector('.mpt__ev')!.textContent = r.dest.label;
    li.querySelector('.mpt__status')!.textContent = t ? (t.status === 'queued' || t.status === 'dropped' ? t.status : `${t.status === 'delivered' ? '' : t.status + ' '}${t.latencyMs} ms`) : '';
    li.querySelector('.mpt__call')!.textContent = `${u.host}${u.pathname}  ·  ${r.e.event}`;
    li.onclick = () => select(li, { kind: 'net', r });
    if (selected?.kind === 'net' && selected.r === r) li.classList.add('is-selected');
    return li;
  }

  function markerRow(text: string, cls: string) {
    const li = document.createElement('li');
    li.className = `mpt__marker ${cls}`;
    li.textContent = text;
    return li;
  }

  function select(li: HTMLElement, s: typeof selected) {
    selected = s;
    list.querySelectorAll('.is-selected').forEach((n) => n.classList.remove('is-selected'));
    li.classList.add('is-selected');
    showDetail();
  }

  function describeRequest(req: Req) {
    const u = new URL(req.url);
    const lines = [`${req.method} ${u.origin}${u.pathname}`];
    if ([...u.searchParams].length) {
      lines.push('', '// query parameters');
      for (const [k, v] of u.searchParams) lines.push(`${k.padEnd(22)} ${v}`);
    }
    if (req.body !== undefined) lines.push('', '// body', JSON.stringify(req.body, null, 2));
    return lines.join('\n');
  }

  function showDetail() {
    if (!selected) {
      detail.textContent = 'Select an event or request to inspect it.';
      return;
    }
    if (selected.kind === 'marker') {
      detail.textContent = selected.text;
      return;
    }
    if (selected.kind === 'net') {
      const r = selected.r;
      const t = r.timing;
      const delivery = t
        ? [
            '// delivery (simulated)',
            `viewer               ${r.path}`,
            `endpoint             ${t.endpoint}`,
            `distance             ${t.distanceKm.toLocaleString()} km`,
            `connection           ${t.newConnection ? 'new (DNS + TCP + TLS before the request)' : 'reused (keep-alive)'}`,
            `latency              ${t.latencyMs} ms`,
            `attempts             ${t.attempts}`,
            `status               ${t.status}${t.status === 'dropped' ? ' (this hit never reaches the vendor)' : t.status === 'queued' ? ' (stored; sent when the connection returns)' : t.status === 'retried' ? ' (first attempt timed out; library retried)' : ''}`,
          ].join('\n')
        : '';
      detail.textContent = `// ${r.dest.vendor} · ${r.e.event} (#${r.e.seq})\n// ${r.m.call}${r.m.note ? `\n// ${r.m.note}` : ''}\n\n${delivery}\n\n${describeRequest(r.req)}`;
      return;
    }
    const e = selected.e;
    const meta = EVENT_CATALOG[e.event]?.description ?? '';
    if (tab === 'canonical') {
      detail.textContent = `// ${e.event} (canonical)\n// ${meta}\n${JSON.stringify(e, null, 2)}`;
      return;
    }
    const d = dest(tab);
    const m = d.map(e);
    if (!m) {
      detail.textContent = `// ${e.event} → ${d.vendor}\n// ${meta}\n// This vendor has no equivalent call for this event.`;
      return;
    }
    const parts = [`// ${e.event} → ${d.vendor}`, `// ${meta}`];
    if (m.note) parts.push(`// ${m.note}`);
    if (m.blocked) parts.push(`// ⊘ ${m.blocked}`);
    parts.push('', m.call, '', '// payload', JSON.stringify(m.payload, null, 2));
    if (m.request) parts.push('', '// request', describeRequest(m.request));
    detail.textContent = parts.join('\n');
  }

  function rerender() {
    const items: HTMLElement[] = [];
    if (tab === 'network') {
      for (const r of netRows) if (visible(r.e)) items.push(netRow(r));
    } else {
      for (const e of player.bus.history) if (visible(e)) items.push(eventRow(e));
    }
    // Interleave plan markers by sequence number.
    const out: HTMLElement[] = [];
    let mi = 0;
    const seqOf = (el: HTMLElement) => Number(el.querySelector('.mpt__seq')?.textContent ?? 0);
    for (const el of items) {
      while (mi < markers.length && markers[mi].afterSeq < seqOf(el)) out.push(markerRow(markers[mi].text, markers[mi].cls)), mi++;
      out.push(el);
    }
    while (mi < markers.length) out.push(markerRow(markers[mi].text, markers[mi].cls)), mi++;
    list.replaceChildren(...out.slice(-MAX_ROWS).reverse());
    $('#mpt-count').textContent = String(tab === 'network' ? netRows.length : player.bus.history.length);
    showDetail();
  }

  // Libraries that queue offline hits (analytics.js) flush them when the connection returns.
  player.bus.on((e) => {
    if (e.event !== 'network_change' || e.params.change !== 'connection' || e.params.from !== 'offline') return;
    const now = Date.now();
    for (const r of netRows) {
      if (r.timing?.status !== 'queued') continue;
      r.timing.status = 'retried';
      r.timing.attempts += 1;
      r.timing.latencyMs = now - Date.parse(r.e.timestamp);
    }
    rerender();
  });

  player.bus.on((e) => {
    collectNet(e);
    if (paused) {
      $('#mpt-count').textContent = String(tab === 'network' ? netRows.length : player.bus.history.length);
      return;
    }
    if (!visible(e)) return;
    if (tab === 'network') {
      for (const r of netRows.filter((x) => x.e === e)) list.prepend(netRow(r));
    } else {
      list.prepend(eventRow(e));
    }
    while (list.children.length > MAX_ROWS) list.lastElementChild!.remove();
    $('#mpt-count').textContent = String(tab === 'network' ? netRows.length : player.bus.history.length);
  });

  function addMarker(text: string, cls = '') {
    const m = { afterSeq: player.bus.history.at(-1)?.seq ?? 0, text, cls };
    markers.push(m);
    if (!paused) list.prepend(markerRow(text, cls));
  }

  $$('[data-dest]').forEach((b) => {
    b.onclick = () => {
      tab = b.dataset.dest!;
      $$('[data-dest]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      if (selected?.kind === 'net' && tab !== 'network') selected = null;
      rerender();
    };
  });
  $<HTMLInputElement>('#mpt-search').oninput = (e) => {
    query = (e.target as HTMLInputElement).value.trim().toLowerCase();
    rerender();
  };
  $('[data-action="pause-log"]').onclick = (e) => {
    paused = !paused;
    (e.currentTarget as HTMLElement).setAttribute('aria-pressed', String(paused));
    (e.currentTarget as HTMLElement).textContent = paused ? 'Resume' : 'Pause';
    if (!paused) rerender();
  };
  $('[data-action="clear-log"]').onclick = () => {
    player.bus.history.length = 0;
    netRows.length = 0;
    markers.length = 0;
    selected = null;
    rerender();
  };
  $('[data-action="export"]').onclick = () => {
    const out = player.bus.history.map((e) => ({
      canonical: e,
      destinations: Object.fromEntries(DESTINATIONS.map((d) => [d.id, d.map(e)])),
    }));
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), plans: markers, events: out }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mock-player-session-${new Date().toISOString().slice(0, 19).replace(/:/g, '')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  $('[data-action="copy"]').onclick = async () => {
    try {
      await navigator.clipboard.writeText(detail.textContent ?? '');
      player.toast('Copied');
    } catch {
      player.toast('Clipboard needs HTTPS');
    }
  };

  /* ---------------- QoE readout ---------------- */
  const qoe = $('#mpt-qoe');
  const snap = () => ({ ...player.snapshot(), sessionId: player.bus.sessionId });
  const fields: [string, (s: ReturnType<typeof snap>) => string][] = [
    ['State', (s) => s.player.state],
    ['Rendition', (s) => `${s.qoe.resolution} (${s.qoe.rendition})`],
    ['Bitrate', (s) => `${(s.qoe.bitrateKbps / 1000).toFixed(2)} Mbps`],
    ['Bandwidth', (s) => `${(s.qoe.bandwidthKbps / 1000).toFixed(2)} Mbps`],
    ['Buffer', (s) => `${s.qoe.bufferSeconds.toFixed(1)} s`],
    ['ABR', (s) => s.qoe.abr],
    ['Startup', (s) => (s.qoe.startupMs === null ? '–' : `${s.qoe.startupMs} ms`)],
    ['Rebuffers', (s) => `${s.qoe.rebufferCount} · ${(s.qoe.rebufferMs / 1000).toFixed(1)} s`],
    ['Dropped frames', (s) => String(s.qoe.droppedFrames)],
    ['Time played', (s) => `${s.qoe.timePlayedSeconds.toFixed(0)} s`],
    ['Position', (s) => (s.content ? `${s.content.position.toFixed(1)} s · ${s.content.percent}%` : '–')],
    ['Device', (s) => `${s.player.formFactor} · ${s.player.orientation}`],
    ['RTT', (s) => `${s.qoe.rttMs} ms`],
    ['CDN', (s) => s.qoe.cdnServer.replace('pop_', '').replace(/_/g, ' ')],
  ];
  qoe.innerHTML = fields.map(([k]) => `<dt>${k}</dt><dd data-k="${k}">–</dd>`).join('');
  window.setInterval(() => {
    const s = snap();
    for (const [k, fn] of fields) qoe.querySelector(`[data-k="${k}"]`)!.textContent = fn(s);
  }, 500);

  /* ---------------- bring your own GTM container ---------------- */
  const gtmInput = $<HTMLInputElement>('#mpt-gtm');
  $('[data-action="load-gtm"]').onclick = () => {
    const id = gtmInput.value.trim().toUpperCase();
    if (!/^GTM-[A-Z0-9]{4,10}$/.test(id)) return player.toast('Enter a container ID like GTM-ABC1234');
    if (document.querySelector(`script[data-gtm="${id}"]`)) return player.toast(`${id} already loaded`);
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
    s.dataset.gtm = id;
    document.head.append(s);
    $('#mpt-gtm-status').textContent = `${id} loaded. Player events arrive as custom events named mockplayer.<event>.`;
  };

  /* ---------------- play plans ---------------- */
  const planSel = $<HTMLSelectElement>('#mpt-plan');
  const planDesc = $('#mpt-plan-desc');
  const planRun = $<HTMLButtonElement>('[data-action="plan-run"]');
  const planStop = $<HTMLButtonElement>('[data-action="plan-stop"]');
  const narration = $('#mpt-narration');
  planSel.innerHTML = PLANS.map((p) => `<option value="${p.id}">${p.title} · ${p.steps.length} steps</option>`).join('');
  const showPlanDesc = () => (planDesc.textContent = PLANS.find((p) => p.id === planSel.value)?.summary ?? '');
  planSel.onchange = showPlanDesc;
  showPlanDesc();

  const runner = new PlanRunner((shouldStop) => {
    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const t0 = performance.now();
        const iv = window.setInterval(() => {
          if (shouldStop()) {
            window.clearInterval(iv);
            reject(new Error('stopped'));
          } else if (performance.now() - t0 >= ms) {
            window.clearInterval(iv);
            resolve();
          }
        }, 100);
      });
    let cursor = player.bus.history.at(-1)?.seq ?? 0;
    let prevStepStart = cursor;
    const waitEvent = (name: string, timeoutMs = 20000) =>
      new Promise<CanonicalEvent | null>((resolve, reject) => {
        const seen = player.bus.history.find((e) => e.seq > cursor && e.event === name);
        if (seen) {
          cursor = seen.seq;
          resolve(seen);
          return;
        }
        let off: () => void = () => {};
        const t0 = performance.now();
        const iv = window.setInterval(() => {
          if (shouldStop()) {
            off();
            window.clearInterval(iv);
            reject(new Error('stopped'));
          } else if (performance.now() - t0 > timeoutMs) {
            off();
            window.clearInterval(iv);
            addMarker(`⚠ waited ${Math.round(timeoutMs / 1000)} s for ${name}; it did not fire`, 'is-warn');
            resolve(null);
          }
        }, 150);
        off = player.bus.on((e) => {
          if (e.event === name) {
            off();
            window.clearInterval(iv);
            cursor = e.seq;
            resolve(e);
          }
        }) as () => void;
      });
    const click = async (target: string, timeoutMs = 8000, optional = false) => {
      const sel = /^[.#[]/.test(target) ? target : `[data-f="${target}"]`;
      const t0 = performance.now();
      while (performance.now() - t0 < timeoutMs) {
        if (shouldStop()) throw new Error('stopped');
        const el = document.querySelector<HTMLElement>(sel);
        if (el && el.offsetParent !== null && !el.hasAttribute('disabled')) {
          el.click();
          return true;
        }
        await sleep(150);
      }
      if (!optional) throw new Error(`could not click ${target} within ${timeoutMs / 1000} s`);
      return false;
    };
    const reached = (name: string, timeoutMs = 20000) => {
      const h = player.bus.history;
      for (let i = h.length - 1; i >= 0; i--) {
        if (h[i].event === name) return Promise.resolve(h[i]);
        if (h[i].event === 'session_start') break;
      }
      return waitEvent(name, timeoutMs);
    };
    const ctx: PlanCtx = {
      player,
      features,
      identity,
      setFormFactor,
      click,
      waitEvent,
      reached,
      beginStep: () => {
        cursor = Math.max(cursor, prevStepStart);
        prevStepStart = player.bus.history.at(-1)?.seq ?? 0;
      },
      wait: sleep,
      playTo: async (seconds, timeoutMs = 60000) => {
        const t0 = performance.now();
        while (player.position < seconds && performance.now() - t0 < timeoutMs) {
          if (player.state === 'paused' && !player.inAd) player.play();
          await sleep(250);
        }
      },
      clearAds: async ({ skip = false } = {}) => {
        const t0 = performance.now();
        await sleep(400);
        while (performance.now() - t0 < 120000) {
          if (!player.inAd) {
            await sleep(700);
            if (!player.inAd) return;
          }
          if (skip && document.querySelector('.mp__adskip:not([hidden])')) {
            await click('.mp__adskip', 7000, true);
          } else {
            await sleep(1200);
            player.adFastForward(1.2);
            await waitEvent('ad_complete', 8000);
          }
          await sleep(300);
        }
      },
      flags: (f) => {
        for (const [k, v] of Object.entries(f)) features.setFlag(k as keyof FeatureFlags, v as never);
        syncToggles();
      },
      schedule: (s) => {
        Object.assign(player.schedule, s);
        syncToggles();
      },
    };
    return ctx;
  });

  runner.on((u) => {
    const total = u.plan.steps.length;
    if (u.status === 'step' && u.step) {
      narration.hidden = false;
      narration.innerHTML = `<span>Plan · ${u.plan.title} · ${u.index + 1}/${total}</span><strong></strong>`;
      narration.querySelector('strong')!.textContent = u.step.say;
      addMarker(`▶ ${u.plan.title} · ${u.index + 1}/${total} · ${u.step.say}`);
      $('#mpt-plan-progress').textContent = `Step ${u.index + 1} of ${total}`;
    } else {
      const text = u.status === 'done' ? `✓ ${u.plan.title} complete` : u.status === 'stopped' ? `■ ${u.plan.title} stopped` : `✕ ${u.plan.title} failed: ${u.message}`;
      addMarker(text, `is-${u.status}`);
      narration.innerHTML = `<span>Plan</span><strong></strong>`;
      narration.querySelector('strong')!.textContent = text;
      window.setTimeout(() => (narration.hidden = true), 4000);
      $('#mpt-plan-progress').textContent = text;
      planRun.disabled = false;
      planStop.disabled = true;
      planSel.disabled = false;
      syncToggles();
    }
  });
  planRun.onclick = () => {
    const plan = PLANS.find((p) => p.id === planSel.value);
    if (!plan) return;
    planRun.disabled = true;
    planStop.disabled = false;
    planSel.disabled = true;
    runner.run(plan);
  };
  planStop.onclick = () => runner.stop();

  /* ---------------- fit the dashboard to the window ---------------- */
  const app = $('#mpt-app');
  const fit = () => {
    const top = app.getBoundingClientRect().top + window.scrollY;
    app.style.setProperty('--mpt-h', `${Math.max(560, window.innerHeight - top - 16)}px`);
  };
  fit();
  window.addEventListener('resize', fit);

  /* ---------------- window API ---------------- */
  window.mockPlayer = {
    play: () => player.play(),
    pause: () => player.pause('api'),
    seek: (t: number) => player.seek(t, 'api'),
    load: (idOrIndex: number | string, autoplay = true) => player.load(idOrIndex, { autoplay, reason: 'api' }),
    setQuality: (q: string) => player.setQuality(q),
    setNetwork: (id: string) => player.setNetwork(id),
    setLocation: (id: string) => player.setLocation(id),
    setRouting: (mode: string) => player.setRouting(mode),
    get path() {
      return player.net.path;
    },
    locations: LOCATIONS.map((l) => l.id),
    routes: ['auto', 'origin', ...POPS.map((p) => p.id)],
    setFormFactor: (ff: FormFactor) => setFormFactor(ff),
    rotate: () => player.rotate(),
    injectError: (k: ErrorKind) => player.injectError(k),
    setFlag: (k: keyof FeatureFlags, v: boolean) => (features.setFlag(k, v), syncToggles()),
    setSchedule: (s: Partial<AdSchedule>) => (Object.assign(player.schedule, s), syncToggles()),
    setConsent: (c: { analytics: boolean; advertising: boolean; personalization: boolean }) => features.setConsent(c, 'api'),
    signIn: () => features.signIn('api'),
    signOut: () => features.signOut(),
    runPlan: (id: string) => {
      const plan = PLANS.find((p) => p.id === id);
      if (plan) {
        planSel.value = id;
        showPlanDesc();
        planRun.click();
      }
      return !!plan;
    },
    stopPlan: () => runner.stop(),
    get planRunning() {
      return runner.running?.id ?? null;
    },
    on: (fn: (e: CanonicalEvent) => void) => player.bus.on(fn),
    get events() {
      return player.bus.history;
    },
    get requests() {
      return netRows.map((r) => ({ vendor: r.dest.id, event: r.e.event, seq: r.e.seq, ...r.req }));
    },
    get state() {
      return player.state;
    },
    get identity() {
      return identity.context();
    },
    destinations: DESTINATIONS.map((d) => d.id),
    plans: PLANS.map((p) => p.id),
    map: (destination: string, e: CanonicalEvent) => DESTINATIONS.find((d) => d.id === destination)?.map(e) ?? null,
    catalog: player.content.map((c) => ({ id: c.slug, title: c.title, kind: c.kind })),
    networks: CONNECTIONS.map((n) => n.id),
  };

  /* ---------------- start ---------------- */
  setFormFactor('desktop');
  syncToggles();
  renderIdentity();
  player.emit('page_view', { trigger: 'load', newVisitor: identity.isNewVisitor });
  // Shared links: ?v=<slug>&t=<seconds>
  const params = new URLSearchParams(location.search);
  const v = params.get('v');
  const t = Number(params.get('t') || 0);
  const start = v && player.content.some((c) => c.slug === v) ? v : 0;
  player.load(start, { autoplay: false, reason: v ? 'shared_link' : 'initial' });
  if (v && t > 0) {
    const off = player.bus.on((e) => {
      if (e.event === 'playback_started') {
        off();
        player.seek(t, 'shared_link');
      }
    });
  }
  rerender();
}
