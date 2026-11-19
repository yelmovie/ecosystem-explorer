// Original procedural sound design for UI cues. Map encounters add short local CC0 recordings
// through sample(); both share the mute, hidden-tab and disposal rules. No microphone.
// Three lanes: 'ui' holds one tone at a time; 'reward' (map combat, cards, a place opening) lets up to
// four cues ring together; 'step' holds one footstep. A lane only ever cuts its own sounds.
export function createThemeEffects(theme, getSettings = () => ({})) {
  let context, disposed = false, last = -Infinity, cues = 0;
  const lanes = { ui: new Set(), reward: new Set(), step: new Set() }, epoch = { ui: 0, reward: 0, step: 0 }, buffers = new Map();
  const silence = voice => { try { voice.stop(); voice.disconnect(); } catch {} };
  const scales = { sky: [523.25, 783.99, 1046.5], ecosystem: [587.33, 880, 1174.66], gas: [196, 293.66, 392], climate: [392, 523.25, 783.99] };
  // stop() silences everything (mute, hidden tab, leaving a screen); stop(lane) only that lane.
  function stop(lane) { for (const name of lane ? [lane] : Object.keys(lanes)) { epoch[name]++; lanes[name].forEach(silence); lanes[name].clear(); } }
  function unlock() {
    if (disposed) return;
    try { const Audio = globalThis.AudioContext || globalThis.webkitAudioContext; if (!Audio) return; context ||= new Audio(); if (context.state === 'suspended') context.resume().catch(() => {}); } catch {}
  }
  // Fetch once; decode as soon as an AudioContext exists (after the first tap).
  function buffer(url) {
    let entry = buffers.get(url);
    if (!entry) { entry = { data: fetch(url).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null), buffer: null }; buffers.set(url, entry); }
    if (!entry.decoded && context) entry.decoded = entry.data.then(data => data ? context.decodeAudioData(data.slice(0)) : null).then(b => (entry.buffer = b)).catch(() => null);
    return entry;
  }
  function preload(urls = []) { if (!disposed) for (const url of urls) buffer(url); }
  // parts: [{ url, at = seconds after the input, volume, rate, dur = optional faded cut }] played as one cue.
  // A fifth reward cue ends the oldest one; a footstep replaces only the footstep before it.
  function sample(parts = [], lane = 'reward') {
    const voices = lanes[lane]; if (!voices) return false;
    const s = getSettings();
    if (disposed || document.hidden || s.muted || s.enabled === false || !parts.length) return false;
    unlock(); if (!context || context.state !== 'running') return false;
    if (lane === 'reward') { const live = [...new Set([...voices].map(voice => voice.cue))]; if (live.length >= 4) for (const voice of [...voices]) if (voice.cue === live[0]) { silence(voice); voices.delete(voice); } }
    else stop(lane);
    const token = epoch[lane], cue = ++cues, start = context.currentTime, volume = Math.max(0, Math.min(1, Number.isFinite(s.volume) ? s.volume : 1));
    for (const part of parts) {
      const entry = buffer(part.url);
      const go = data => {
        if (!data || token !== epoch[lane] || disposed) return;
        const source = context.createBufferSource(), g = context.createGain();
        source.buffer = data; source.cue = cue; source.playbackRate.value = part.rate || 1;
        const level = (part.volume ?? .5) * volume, t = Math.max(context.currentTime, start + (part.at || 0));
        g.gain.value = level;
        source.connect(g); g.connect(context.destination); voices.add(source);
        source.onended = () => { voices.delete(source); source.disconnect(); g.disconnect(); };
        if (part.dur) { g.gain.setValueAtTime?.(level, t + part.dur * .7); g.gain.linearRampToValueAtTime?.(0, t + part.dur); source.start(t, 0, part.dur); }
        else source.start(t);
      };
      if (entry.buffer) go(entry.buffer); else entry.decoded?.then(go);
    }
    return true;
  }
  function sync() { const s = getSettings(); if (s.muted || s.enabled === false || document.hidden) stop(); }
  function play(kind = 'tap') {
    const s = getSettings();
    if (disposed || document.hidden || s.muted || s.enabled === false) return;
    const now = performance.now(); if (now - last < 65 && ['click','tap'].includes(kind)) return; last = now;
    unlock(); if (!context || context.state !== 'running') return;
    stop('ui');
    const voices = lanes.ui, notes = scales[theme] || scales.sky, success = ['success','award','discover','collect'].includes(kind), soft = ['error','retry'].includes(kind);
    const count = success ? 3 : 1, volume = Math.max(0, Math.min(1, Number.isFinite(s.volume) ? s.volume : 1));
    for (let i = 0; i < count; i++) {
      const o = context.createOscillator(), g = context.createGain(), t = context.currentTime + i * .075;
      const airy = theme === 'gas' && ['pump','rotate','experiment'].includes(kind);
      const f = soft ? notes[0] * .55 : notes[i];
      o.type = theme === 'gas' ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(airy ? 110 : f, t);
      // Wrong-answer tones fall; every other cue rises.
      o.frequency.exponentialRampToValueAtTime(airy ? 440 : soft ? f * .7 : f * (theme === 'ecosystem' ? 1.3 : 1.04), t + .09);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.045 * volume, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + (success ? .32 : .18));
      o.connect(g); g.connect(context.destination); voices.add(o);
      o.onended = () => { voices.delete(o); o.disconnect(); g.disconnect(); };
      o.start(t); o.stop(t + (success ? .35 : .21));
    }
  }
  const hide = () => { if (document.hidden) { stop(); context?.suspend().catch(() => {}); } };
  const leave = () => { stop(); context?.suspend().catch(() => {}); };
  document.addEventListener('visibilitychange', hide); globalThis.addEventListener?.('pagehide', leave);
  return { unlock, play, sample, preload, stop, sync, dispose() { if (disposed) return; disposed = true; stop(); document.removeEventListener('visibilitychange', hide); globalThis.removeEventListener?.('pagehide', leave); context?.close().catch(() => {}); } };
}
