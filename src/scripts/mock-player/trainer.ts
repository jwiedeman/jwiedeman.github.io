/**
 * Trainer panel: device/network/ad/error controls, the live event console
 * with per-destination payloads, QoE readout, and the public window API.
 */
import catalogData from '../../data/mock-player-catalog.json';
import { EVENT_CATALOG, type CanonicalEvent, type EventCategory } from './events';
import { DESTINATIONS } from './mappers';
import { MockPlayer, NETWORK_PROFILES, type CatalogItem, type ErrorKind, type FormFactor } from './player';

declare global {
  interface Window {
    dataLayer: unknown[];
    mockPlayer: unknown;
  }
}

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

const MAX_ROWS = 400;

export function initTrainer() {
  const host = $('#mp-player');
  const player = new MockPlayer(host, catalogData as CatalogItem[]);
  const page = $('.mpt');

  /* ---------------- window API + dataLayer ---------------- */
  window.dataLayer = window.dataLayer || [];
  player.bus.on((e) => {
    window.dataLayer.push(DESTINATIONS[0].map(e)!.payload);
    window.dispatchEvent(new CustomEvent('mockplayer:event', { detail: e }));
  });
  window.mockPlayer = {
    play: () => player.play(),
    pause: () => player.pause('api'),
    seek: (t: number) => player.seek(t, 'api'),
    load: (idOrIndex: number | string, autoplay = true) => player.load(idOrIndex, { autoplay, reason: 'api' }),
    setQuality: (q: string) => player.setQuality(q),
    setNetwork: (id: string) => player.setNetwork(id),
    setFormFactor: (ff: FormFactor) => setFormFactor(ff),
    rotate: () => player.rotate(),
    injectError: (k: ErrorKind) => player.injectError(k),
    on: (fn: (e: CanonicalEvent) => void) => player.bus.on(fn),
    get events() {
      return player.bus.history;
    },
    get state() {
      return player.state;
    },
    destinations: DESTINATIONS.map((d) => d.id),
    map: (destination: string, e: CanonicalEvent) => DESTINATIONS.find((d) => d.id === destination)?.map(e) ?? null,
    catalog: player.content.map((c) => ({ id: c.slug, title: c.title, kind: c.kind })),
    networks: NETWORK_PROFILES.map((n) => n.id),
  };

  /* ---------------- device / form factor ---------------- */
  const stage = $('.mpt__stage');
  function setFormFactor(ff: FormFactor) {
    player.setFormFactor(ff);
    stage.dataset.ff = ff;
    $$('[data-ff]', $('.mpt__devices')).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ff === ff)));
    $('.mpt__remote').hidden = ff !== 'ctv';
    $('[data-action="rotate"]').toggleAttribute('disabled', !(ff === 'mobile' || ff === 'tablet'));
    syncOrientation();
  }
  function syncOrientation() {
    stage.dataset.orientation = player.orientation;
  }
  $$('[data-ff]', $('.mpt__devices')).forEach((b) => (b.onclick = () => setFormFactor(b.dataset.ff as FormFactor)));
  $('[data-action="rotate"]').onclick = () => {
    player.rotate();
    syncOrientation();
  };
  player.bus.on((e) => {
    if (e.event === 'orientation_change') syncOrientation();
  });
  host.addEventListener('mp:theater', (e) => page.classList.toggle('is-theater', (e as CustomEvent).detail));

  // TV remote
  $$('[data-key]', $('.mpt__remote')).forEach((b) => {
    // Keep keyboard focus on the player, like a real remote that has no focus of its own.
    b.onmousedown = (e) => e.preventDefault();
    b.onclick = () => {
      if (!host.contains(document.activeElement)) player.focusFirstControl();
      player.handleRemote(b.dataset.key!);
    };
  });

  /* ---------------- network ---------------- */
  const net = $<HTMLSelectElement>('#mpt-network');
  net.innerHTML = NETWORK_PROFILES.map((n) => `<option value="${n.id}">${n.label}</option>`).join('');
  net.onchange = () => player.setNetwork(net.value);
  player.bus.on((e) => {
    if (e.event === 'network_change') net.value = String(e.params.to);
  });

  /* ---------------- ads ---------------- */
  $$<HTMLInputElement>('[data-ad]').forEach((c) => {
    c.checked = Boolean(player.schedule[c.dataset.ad as 'preroll']);
    c.onchange = () => {
      (player.schedule as unknown as Record<string, boolean>)[c.dataset.ad!] = c.checked;
    };
  });
  const pod = $<HTMLSelectElement>('#mpt-pod');
  pod.value = String(player.schedule.podSize);
  pod.onchange = () => (player.schedule.podSize = Number(pod.value));
  $('[data-action="reload"]').onclick = () => player.load(player.index, { autoplay: false, reason: 'reload' });

  /* ---------------- errors ---------------- */
  $$('[data-error]').forEach((b) => (b.onclick = () => player.injectError(b.dataset.error as ErrorKind)));

  /* ---------------- console ---------------- */
  const list = $('#mpt-log');
  const detail = $('#mpt-detail');
  let destination = 'canonical';
  let paused = false;
  let query = '';
  const hidden = new Set<EventCategory>();
  let selected: CanonicalEvent | null = null;

  const categories = Array.from(new Set(Object.values(EVENT_CATALOG).map((m) => m.category)));
  const chipBox = $('#mpt-cats');
  for (const cat of categories) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = cat;
    b.dataset.cat = cat;
    b.setAttribute('aria-pressed', 'true');
    b.onclick = () => {
      hidden.has(cat) ? hidden.delete(cat) : hidden.add(cat);
      b.setAttribute('aria-pressed', String(!hidden.has(cat)));
      rerender();
    };
    chipBox.append(b);
  }

  function mapped(e: CanonicalEvent) {
    if (destination === 'canonical') {
      const params = JSON.stringify(e.params);
      return { call: params === '{}' ? '' : params, payload: e as unknown, note: undefined as string | undefined };
    }
    const d = DESTINATIONS.find((x) => x.id === destination)!;
    return d.map(e);
  }

  function visible(e: CanonicalEvent) {
    if (hidden.has(e.category)) return false;
    if (query && !`${e.event} ${JSON.stringify(e.params)}`.toLowerCase().includes(query)) return false;
    return true;
  }

  function row(e: CanonicalEvent) {
    const m = mapped(e);
    const li = document.createElement('li');
    li.className = 'mpt__row';
    li.dataset.cat = e.category;
    if (!m) li.classList.add('is-unsent');
    if (selected === e) li.classList.add('is-selected');
    const t = new Date(e.timestamp);
    li.innerHTML = `<span class="mpt__seq">${e.seq}</span><span class="mpt__ts">${t.toLocaleTimeString([], { hour12: false })}.${String(t.getMilliseconds()).padStart(3, '0')}</span><span class="mpt__cat"></span><span class="mpt__ev"></span><span class="mpt__call"></span>`;
    li.querySelector('.mpt__cat')!.textContent = e.category;
    li.querySelector('.mpt__ev')!.textContent = e.event;
    li.querySelector('.mpt__call')!.textContent = m ? m.call : 'not sent to this destination';
    li.onclick = () => {
      selected = e;
      list.querySelectorAll('.is-selected').forEach((n) => n.classList.remove('is-selected'));
      li.classList.add('is-selected');
      showDetail();
    };
    return li;
  }

  function showDetail() {
    if (!selected) {
      detail.textContent = 'Select an event to inspect its payload.';
      return;
    }
    const m = mapped(selected);
    const head = `${selected.event} → ${DESTINATIONS.find((d) => d.id === destination)?.label ?? 'canonical'}`;
    const meta = EVENT_CATALOG[selected.event]?.description ?? '';
    detail.textContent = `// ${head}\n// ${meta}${m?.note ? `\n// ${m.note}` : ''}\n${m ? JSON.stringify(m.payload, null, 2) : '// This destination has no equivalent call for this event.'}`;
  }

  function rerender() {
    list.replaceChildren(...player.bus.history.filter(visible).slice(-MAX_ROWS).reverse().map(row));
    $('#mpt-count').textContent = String(player.bus.history.length);
    showDetail();
  }

  player.bus.on((e) => {
    $('#mpt-count').textContent = String(player.bus.history.length);
    if (paused || !visible(e)) return;
    list.prepend(row(e));
    while (list.children.length > MAX_ROWS) list.lastElementChild!.remove();
  });

  $$('[data-dest]').forEach((b) => {
    b.onclick = () => {
      destination = b.dataset.dest!;
      $$('[data-dest]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
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
    selected = null;
    rerender();
  };
  $('[data-action="export"]').onclick = () => {
    const out = player.bus.history.map((e) => ({
      canonical: e,
      ...Object.fromEntries(DESTINATIONS.map((d) => [d.id, d.map(e)?.payload ?? null])),
    }));
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mock-player-session-${new Date().toISOString().slice(0, 19).replace(/:/g, '')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  $('[data-action="copy"]').onclick = async () => {
    try {
      await navigator.clipboard.writeText(detail.textContent ?? '');
      player.toast('Payload copied');
    } catch {
      player.toast('Clipboard not available');
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
    ['Session', (s) => s.sessionId.slice(0, 8)],
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
    if (!/^GTM-[A-Z0-9]{4,10}$/.test(id)) {
      player.toast('Enter a container ID like GTM-ABC1234');
      return;
    }
    if (document.querySelector(`script[data-gtm="${id}"]`)) return player.toast(`${id} already loaded`);
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
    s.dataset.gtm = id;
    document.head.append(s);
    $('#mpt-gtm-status').textContent = `${id} loaded. Player events arrive as custom events named mockplayer.<event>.`;
  };

  /* ---------------- start ---------------- */
  setFormFactor('desktop');
  player.load(0, { autoplay: false, reason: 'initial' });
  rerender();
}
