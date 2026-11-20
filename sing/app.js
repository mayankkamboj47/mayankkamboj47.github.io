'use strict';
/* Sing-Along Studio — live pitch tracking, melodies, tracks, scoring, karaoke. */
const VERSION = '0.3';

/* ---------------- helpers ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const NN = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const pcOf = m => ((Math.round(m) % 12) + 12) % 12;
const noteName = m => NN[pcOf(m)] + (Math.floor(Math.round(m) / 12) - 1);
const f2m = f => 69 + 12 * Math.log2(f / 440);
const m2f = m => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = s => { s = Math.max(0, s || 0); return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0'); };
const fold = c => { c = ((c % 1200) + 1200) % 1200; return c > 600 ? c - 1200 : c; };
const tick = () => new Promise(r => setTimeout(r, 0));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const store = {
  get(k, d) { try { const v = localStorage.getItem('sas.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('sas.' + k, JSON.stringify(v)); } catch (e) {} }
};
const DEFAULTS = { fit: true, transpose: 0, speed: 1, guideVol: 0.7, tol: 50, anyOct: true, earphones: false, countIn: true, reps: 5, syncMs: 0, vocals: 0.2, sens: 2, range: null, bannerOff: false };
const settings = Object.assign({}, DEFAULTS, store.get('settings', {}));
const saveSettings = () => store.set('settings', settings);
const bests = store.get('bests', {});
const GATES = [0.02, 0.011, 0.006, 0.0032, 0.0016];
const SENS_LBL = ['Low', 'Lower', 'Normal', 'Higher', 'High'];

/* ---------------- melodies ---------------- */
function nm(n) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
  if (!m) throw new Error('bad note ' + n);
  return 12 * (+m[3] + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const beats = s => { if (s.includes('/')) { const [a, b] = s.split('/'); return +a / +b; } return +s; };
function parseMelody(str, lyrics) {
  const toks = str.trim().split(/\s+/), lyr = lyrics ? lyrics.trim().split(/\s+/) : [];
  let b = 0, li = 0; const notes = [];
  for (const t of toks) {
    const [n, d] = t.split(':'); const dur = beats(d || '1');
    if (n !== 'R') notes.push({ b, d: dur, midi: nm(n), lyr: lyr[li++] || '' });
    b += dur;
  }
  return { notes, beats: b };
}

const SONGS = [
  { id: 'twinkle', title: 'Twinkle, Twinkle, Little Star', sub: 'Steps and a leap of a fifth', bpm: 96, bpb: 4,
    notes: 'C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2',
    lyrics: 'Twin- kle twin- kle lit- tle star, How I won- der what you are. Up a- bove the world so high, Like a dia- mond in the sky. Twin- kle twin- kle lit- tle star, How I won- der what you are.' },
  { id: 'mary', title: 'Mary Had a Little Lamb', sub: 'Three notes: easiest start', bpm: 108, bpb: 4,
    notes: 'E4:1 D4:1 C4:1 D4:1 E4:1 E4:1 E4:2 D4:1 D4:1 D4:2 E4:1 G4:1 G4:2 E4:1 D4:1 C4:1 D4:1 E4:1 E4:1 E4:1 E4:1 D4:1 D4:1 E4:1 D4:1 C4:4',
    lyrics: 'Ma- ry had a lit- tle lamb, lit- tle lamb, lit- tle lamb, Ma- ry had a lit- tle lamb, its fleece was white as snow.' },
  { id: 'sleeping', title: 'Are You Sleeping?', sub: 'Frère Jacques · short phrases', bpm: 100, bpb: 4,
    notes: 'C4:1 D4:1 E4:1 C4:1 C4:1 D4:1 E4:1 C4:1 E4:1 F4:1 G4:2 E4:1 F4:1 G4:2 G4:1/2 A4:1/2 G4:1/2 F4:1/2 E4:1 C4:1 G4:1/2 A4:1/2 G4:1/2 F4:1/2 E4:1 C4:1 C4:1 G3:1 C4:2 C4:1 G3:1 C4:2',
    lyrics: 'Are you sleep- ing, are you sleep- ing, Bro- ther John? Bro- ther John? Mor- ning bells are ring- ing, mor- ning bells are ring- ing, Ding dang dong, ding dang dong.' },
  { id: 'row', title: 'Row, Row, Row Your Boat', sub: 'Lilting rhythm · octave jump', bpm: 66, bpb: 2,
    notes: 'C4:1 C4:1 C4:2/3 D4:1/3 E4:1 E4:2/3 D4:1/3 E4:2/3 F4:1/3 G4:2 C5:1/3 C5:1/3 C5:1/3 G4:1/3 G4:1/3 G4:1/3 E4:1/3 E4:1/3 E4:1/3 C4:1/3 C4:1/3 C4:1/3 G4:2/3 F4:1/3 E4:2/3 D4:1/3 C4:2',
    lyrics: 'Row row row your boat, gent- ly down the stream. Mer- ri- ly mer- ri- ly mer- ri- ly mer- ri- ly, life is but a dream.' },
  { id: 'ode', title: 'Ode to Joy', sub: 'Beethoven · smooth stepwise lines', bpm: 104, bpb: 4,
    notes: 'E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 E4:3/2 D4:1/2 D4:2 E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 D4:3/2 C4:1/2 C4:2 D4:1 D4:1 E4:1 C4:1 D4:1 E4:1/2 F4:1/2 E4:1 C4:1 D4:1 E4:1/2 F4:1/2 E4:1 D4:1 C4:1 D4:1 G3:2 E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 D4:3/2 C4:1/2 C4:2' },
  { id: 'birthday', title: 'Happy Birthday', sub: 'Big leap up an octave', bpm: 104, bpb: 3,
    notes: 'G3:3/4 G3:1/4 A3:1 G3:1 C4:1 B3:2 G3:3/4 G3:1/4 A3:1 G3:1 D4:1 C4:2 G3:3/4 G3:1/4 G4:1 E4:1 C4:1 B3:1 A3:2 F4:3/4 F4:1/4 E4:1 C4:1 D4:1 C4:3',
    lyrics: 'Hap- py birth- day to you, Hap- py birth- day to you, Hap- py birth- day dear sing- er, Hap- py birth- day to you!' },
  { id: 'jingle', title: 'Jingle Bells', sub: 'Chorus · repeated notes', bpm: 116, bpb: 4,
    notes: 'E4:1 E4:1 E4:2 E4:1 E4:1 E4:2 E4:1 G4:1 C4:3/2 D4:1/2 E4:4 F4:1 F4:1 F4:3/2 F4:1/2 F4:1 E4:1 E4:1 E4:1/2 E4:1/2 E4:1 D4:1 D4:1 E4:1 D4:2 G4:2 E4:1 E4:1 E4:2 E4:1 E4:1 E4:2 E4:1 G4:1 C4:3/2 D4:1/2 E4:4 F4:1 F4:1 F4:3/2 F4:1/2 F4:1 E4:1 E4:1 E4:1/2 E4:1/2 G4:1 G4:1 F4:1 D4:1 C4:4',
    lyrics: 'Jin- gle bells, jin- gle bells, jin- gle all the way. Oh what fun it is to ride in a one- horse o- pen sleigh, hey! Jin- gle bells, jin- gle bells, jin- gle all the way. Oh what fun it is to ride in a one- horse o- pen sleigh.' },
];
SONGS.forEach(s => { s.kind = 'song'; s.key = 'song:' + s.id; s.parsed = parseMelody(s.notes, s.lyrics); });

const DEG = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 8: 12 };
const WARMUPS = [
  { id: 'five', title: 'Five-note scale', sub: 'do re mi fa sol fa mi re do', bpm: 92, bpb: 4, pat: [1, 2, 3, 4, 5, 4, 3, 2, 1], dur: [1, 1, 1, 1, 1, 1, 1, 1, 2], syl: 'do re mi fa sol fa mi re do' },
  { id: 'scale', title: 'Major scale', sub: 'A full octave up and down', bpm: 100, bpb: 4, pat: [1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1], dur: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], syl: 'do re mi fa sol la ti do ti la sol fa mi re do' },
  { id: 'arp', title: 'Arpeggio', sub: 'Leaps: 1 · 3 · 5 · 8', bpm: 88, bpb: 4, pat: [1, 3, 5, 8, 5, 3, 1], dur: [1, 1, 1, 2, 1, 1, 2], syl: 'do mi sol do sol mi do' },
  { id: 'thirds', title: 'Thirds', sub: 'Skip-step pattern for accuracy', bpm: 92, bpb: 4, pat: [1, 3, 2, 4, 3, 5, 4, 2, 1], dur: [1, 1, 1, 1, 1, 1, 1, 1, 2], syl: 'do mi re fa mi sol fa re do' },
  { id: 'octave', title: 'Octave drop', sub: 'Leap up, walk down', bpm: 88, bpb: 4, pat: [1, 8, 7, 6, 5, 4, 3, 2, 1], dur: [1, 2, 1, 1, 1, 1, 1, 1, 2], syl: 'do do ti la sol fa mi re do' },
  { id: 'long', title: 'Long tones', sub: 'Hold each note steady', bpm: 80, bpb: 4, pat: [1, 3, 5, 3, 1], dur: [4, 4, 4, 4, 4], syl: 'ah ah ah ah ah' },
];
WARMUPS.forEach(w => { w.kind = 'warmup'; w.key = 'warm:' + w.id; });
function buildWarmup(w, reps) {
  const base = 60, notes = [], syl = w.syl.split(' '); let b = 0;
  for (let r = 0; r < reps; r++) {
    w.pat.forEach((deg, i) => { notes.push({ b, d: w.dur[i], midi: base + r + DEG[deg], lyr: syl[i] }); b += w.dur[i]; });
    b += w.bpb; // a bar to breathe
  }
  return { notes, beats: b - w.bpb };
}

/* ---------------- state ---------------- */
const S = {
  tab: 'songs', item: null, notes: [], duration: 0, range: [52, 72], spb: 0.6, bpb: 4, shift: 0,
  mode: 'idle', // idle | running | replay
  songStart: 0, endAt: 0, run: null, lastRun: null, reviewT: 0, guide: null,
  free: { frames: [], t0: 0, center: 57 },
  tracks: [], wake: null,
};

/* ---------------- audio ---------------- */
let ctx = null, master = null;
function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { ctx = new AC(); }
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -10; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}
const outLat = () => ctx ? (ctx.outputLatency || 0) + (ctx.baseLatency || 0) : 0;

function tone(midi, when, dur, vol, gb) {
  const f = m2f(midi);
  const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = f;
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2;
  const g2 = ctx.createGain(); g2.gain.value = 0.22;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(9000, f * 7);
  const g = ctx.createGain();
  o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(gb.gain);
  const end = when + Math.max(0.06, dur);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.015);
  g.gain.setTargetAtTime(vol * 0.62, when + 0.015, 0.18);
  g.gain.setTargetAtTime(0, end, 0.04);
  o1.start(when); o2.start(when); o1.stop(end + 0.3); o2.stop(end + 0.3);
  gb.nodes.push(o1, o2);
}
function click(when, accent, gb) {
  const o = ctx.createOscillator(); o.frequency.value = accent ? 1568 : 1046;
  const g = ctx.createGain(); g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(accent ? 0.6 : 0.4, when + 0.002); g.gain.exponentialRampToValueAtTime(0.001, when + 0.07);
  o.connect(g); g.connect(gb.click); o.start(when); o.stop(when + 0.09); gb.nodes.push(o);
}
function guideBus(vol) {
  const gain = ctx.createGain(); gain.gain.value = vol; gain.connect(master);
  const clk = ctx.createGain(); clk.gain.value = 0.5; clk.connect(master);
  return (S.guide = { gain, click: clk, nodes: [] });
}
function stopGuide() {
  const gb = S.guide; if (!gb) return;
  for (const n of gb.nodes) { try { n.stop(); } catch (e) {} }
  try { gb.gain.disconnect(); gb.click.disconnect(); if (gb.voice) gb.voice.disconnect(); } catch (e) {}
  S.guide = null;
}
// Track playback modes: 'orig' = the original, 'mix' = karaoke instrumental + some of the
// singer (orig·v + inst·(1−v)), 'vocals' = the singer alone (orig − inst). Sources start on
// the same sample so the subtraction is exact.
function scheduleGuide(gb, songStart, from, mode = 'orig') {
  if (S.item.kind === 'track') {
    const rec = S.item.rec, when = Math.max(ctx.currentTime, songStart + from);
    const play = (buf, gain) => {
      const src = ctx.createBufferSource(); src.buffer = buf;
      const g = ctx.createGain(); g.gain.value = gain; src.connect(g); g.connect(gb.gain);
      src.start(when, from); gb.nodes.push(src); return g;
    };
    if (mode === 'orig' || !rec.inst) play(rec.buffer, 1);
    else if (mode === 'vocals') { play(rec.buffer, 1); play(rec.inst, -1); }
    else { const v = settings.vocals; gb.vox = { orig: play(rec.buffer, v), inst: play(rec.inst, 1 - v) }; }
  } else {
    for (const n of S.notes) {
      if (n.t + n.d <= from + 0.01) continue;
      const st = Math.max(n.t, from);
      tone(n.midi, songStart + st, (n.t + n.d - st) * 0.9, 0.3, gb);
    }
  }
}
function decodeAudio(ab) {
  ensureCtx();
  return new Promise((res, rej) => { const p = ctx.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); });
}

/* ---------------- pitch detection (YIN) ---------------- */
const yinScratch = new Map();
function yin(buf, sr, minF, maxF, thresh) {
  const N = buf.length;
  const maxTau = Math.min(Math.floor(sr / minF), N >> 1);
  const minTau = Math.max(2, Math.floor(sr / maxF));
  const W = N - maxTau;
  let d = yinScratch.get(maxTau); if (!d) { d = new Float32Array(maxTau + 2); yinScratch.set(maxTau, d); }
  for (let tau = 1; tau <= maxTau; tau++) {
    let s = 0;
    for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + tau]; s += x * x; }
    d[tau] = s;
  }
  d[0] = 1; let run = 0;
  for (let tau = 1; tau <= maxTau; tau++) { run += d[tau]; d[tau] = run > 0 ? d[tau] * tau / run : 1; }
  let te = -1;
  for (let tau = minTau; tau <= maxTau; tau++) {
    if (d[tau] < thresh) { while (tau + 1 <= maxTau && d[tau + 1] < d[tau]) tau++; te = tau; break; }
  }
  if (te < 0) {
    let best = 1e9, bi = -1;
    for (let tau = minTau; tau <= maxTau; tau++) if (d[tau] < best) { best = d[tau]; bi = tau; }
    if (best < 0.22) te = bi; else return null;
  }
  let t = te;
  if (te > 1 && te < maxTau) {
    const s0 = d[te - 1], s1 = d[te], s2 = d[te + 1], den = s0 - 2 * s1 + s2;
    if (Math.abs(den) > 1e-12) t = te + 0.5 * (s0 - s2) / den;
  }
  return { freq: sr / t, conf: 1 - d[te] };
}

// Offline pitch track of a whole AudioBuffer → [{t, m}] (voiced frames only)
async function pitchTrack(buffer, { minF = 70, maxF = 1000, hop = 0.02, highpass = false, onProgress = () => {} } = {}) {
  const sr0 = buffer.sampleRate, len = buffer.length, chs = buffer.numberOfChannels;
  const D = Math.max(1, Math.round(sr0 / 11025)), sr = sr0 / D, n = Math.floor(len / D);
  const x = new Float32Array(n);
  for (let c = 0; c < chs; c++) {
    const dd = buffer.getChannelData(c), k = 1 / (D * chs);
    for (let i = 0; i < n; i++) { let s = 0; const o = i * D; for (let j = 0; j < D; j++) s += dd[o + j]; x[i] += s * k; }
  }
  if (highpass) { // one-pole high-pass ~110 Hz to tame bass in full mixes
    const rc = 1 / (2 * Math.PI * 110), dt = 1 / sr, a = rc / (rc + dt);
    let py = 0, px = x[0];
    for (let i = 1; i < n; i++) { const cx = x[i]; py = a * (py + cx - px); px = cx; x[i] = py; }
  }
  const win = Math.max(Math.round(0.064 * sr), Math.ceil(2.2 * sr / minF)), hs = Math.max(1, Math.round(hop * sr));
  const nF = Math.max(0, Math.floor((n - win) / hs) + 1);
  const rms = new Float32Array(nF);
  for (let f = 0; f < nF; f++) { let e = 0; const o = f * hs; for (let i = 0; i < win; i += 2) e += x[o + i] * x[o + i]; rms[f] = Math.sqrt(e / (win / 2)); }
  const sorted = Array.from(rms).sort((a, b) => a - b);
  const p90 = sorted[Math.floor(sorted.length * 0.9)] || 0, gate = Math.max(2e-4, p90 * 0.1);
  const out = [];
  for (let f = 0; f < nF; f++) {
    if (f % 200 === 0) { onProgress(f / nF); await tick(); }
    if (rms[f] < gate) continue;
    const o = f * hs, r = yin(x.subarray(o, o + win), sr, minF, maxF, 0.15);
    if (r) out.push({ t: (o + win / 2) / sr, m: f2m(r.freq) });
  }
  onProgress(1);
  // median-of-5 inside continuous runs
  return out.map((fr, i) => {
    const w = [];
    for (let j = i - 2; j <= i + 2; j++) if (j >= 0 && j < out.length && Math.abs(out[j].t - fr.t) <= hop * 2.6) w.push(out[j].m);
    w.sort((a, b) => a - b);
    return { t: fr.t, m: w[w.length >> 1] };
  });
}
/* ---------- melody extraction from full mixes ----------
   Centre-channel emphasis (vocals are usually panned centre) + harmonic-sum salience
   + a Viterbi path through the strongest pitch candidates for a smooth melody line. */
const FFTS = new Map();
function fftPlan(N) {
  if (FFTS.has(N)) return FFTS.get(N);
  const bits = Math.log2(N) | 0, rev = new Uint32Array(N), cos = new Float32Array(N / 2), sin = new Float32Array(N / 2);
  for (let i = 0; i < N; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
  for (let i = 0; i < N / 2; i++) { cos[i] = Math.cos(2 * Math.PI * i / N); sin[i] = Math.sin(2 * Math.PI * i / N); }
  const p = { N, rev, cos, sin }; FFTS.set(N, p); return p;
}
function fft(P, re, im) {
  const { N, rev, cos, sin } = P;
  for (let i = 0; i < N; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let size = 2; size <= N; size <<= 1) {
    const half = size >> 1, step = N / size;
    for (let i = 0; i < N; i += size) {
      for (let j = i, k = 0; j < i + half; j++, k += step) {
        const a = j + half, c = cos[k], s = sin[k];
        const tr = re[a] * c + im[a] * s, ti = im[a] * c - re[a] * s;
        re[a] = re[j] - tr; im[a] = im[j] - ti; re[j] += tr; im[j] += ti;
      }
    }
  }
}
async function melodyExtract(buffer, onProgress = () => {}) {
  const sr0 = buffer.sampleRate, D = Math.max(1, Math.round(sr0 / 22050)), sr = sr0 / D;
  const L0 = buffer.getChannelData(0), R0 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : L0;
  const n = Math.floor(buffer.length / D), Ls = new Float32Array(n), Rs = new Float32Array(n);
  for (let i = 0; i < n; i++) { let a = 0, b = 0; const o = i * D; for (let j = 0; j < D; j++) { a += L0[o + j]; b += R0[o + j]; } Ls[i] = a / D; Rs[i] = b / D; }
  const N = 2048, P = fftPlan(N), hop = Math.round(0.02 * sr), binHz = sr / N;
  const win = new Float32Array(N); for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  const nF = Math.max(0, Math.floor((n - N) / hop) + 1);
  const re = new Float32Array(N), im = new Float32Array(N), mag = new Float32Array(N / 2 + 1);
  const fMin = 90, fMax = 1000, CENTS = 10, nb = Math.floor(1200 * Math.log2(fMax / fMin) / CENTS) + 1, H = 10, ALPHA = 0.8;
  const maxBin = Math.min(N / 2 - 2, Math.floor(5000 / binHz));
  const hIdx = new Int32Array(nb * H), hW = new Float32Array(nb * H);
  for (let i = 0; i < nb; i++) {
    const f = fMin * Math.pow(2, i * CENTS / 1200);
    for (let h = 0; h < H; h++) { const b = Math.floor((h + 1) * f / binHz); hIdx[i * H + h] = b <= maxBin ? b : -1; hW[i * H + h] = Math.pow(ALPHA, h); }
  }
  const prior = new Float32Array(nb); // mild preference for the usual singing range (around D#4)
  for (let i = 0; i < nb; i++) { const m = f2m(fMin * Math.pow(2, i * CENTS / 1200)); prior[i] = Math.exp(-0.5 * Math.pow((m - 63) / 15, 2)); }
  const fw = new Float32Array(N / 2 + 1);
  for (let k = 0; k <= N / 2; k++) { const f = k * binHz; fw[k] = f < 60 ? 0 : Math.min(1, Math.pow(f / 200, 1.5)); }
  const K = 4, cand = new Float32Array(nF * K), csal = new Float32Array(nF * K), peak = new Float32Array(nF), energy = new Float32Array(nF);
  const sal = new Float32Array(nb);
  for (let f = 0; f < nF; f++) {
    if (f % 60 === 0) { onProgress(f / nF * 0.85); await tick(); }
    const o = f * hop;
    for (let i = 0; i < N; i++) { re[i] = Ls[o + i] * win[i]; im[i] = Rs[o + i] * win[i]; }
    fft(P, re, im);
    let e = 0;
    for (let k = 1; k <= maxBin + 1; k++) {
      const a = re[k], b = im[k], c = re[N - k], d = im[N - k];
      const xr = (a + c) / 2, xi = (b - d) / 2, yr = (b + d) / 2, yi = (c - a) / 2; // left & right spectra
      const px = xr * xr + xi * xi, py = yr * yr + yi * yi;
      const cr = xr * yr + xi * yi, ci = xi * yr - xr * yi;
      const sim = 2 * Math.sqrt(cr * cr + ci * ci) / (px + py + 1e-12);
      const m4 = sim * sim; const cm = Math.sqrt((xr + yr) * (xr + yr) + (xi + yi) * (xi + yi)) * 0.5 * m4 * m4;
      mag[k] = Math.sqrt(cm) * fw[k];
      if (k * binHz > 120) e += cm * cm;
    }
    energy[f] = e;
    let best = 0;
    for (let i = 0; i < nb; i++) {
      let s = 0; const base = i * H;
      let m0 = 0, m1 = 0;
      for (let h = 0; h < H; h++) { const b = hIdx[base + h]; if (b < 0) break; const m = mag[b] > mag[b + 1] ? mag[b] : mag[b + 1]; s += hW[base + h] * m; if (h === 0) m0 = m; else if (h === 1) m1 = m; }
      // a real fundamental has energy at f itself; sub-octave ghosts don't
      s *= (0.35 + 0.65 * Math.min(1, m0 / (0.6 * m1 + 1e-9))) * prior[i];
      sal[i] = s; if (s > best) best = s;
    }
    peak[f] = best;
    // top-K local maxima
    for (let k = 0; k < K; k++) { cand[f * K + k] = -1; csal[f * K + k] = 0; }
    for (let i = 1; i < nb - 1; i++) {
      const s = sal[i]; if (s <= sal[i - 1] || s < sal[i + 1] || s < best * 0.25) continue;
      let slot = -1, minS = Infinity;
      for (let k = 0; k < K; k++) { if (csal[f * K + k] < minS) { minS = csal[f * K + k]; slot = k; } }
      if (s > minS) {
        const den = sal[i - 1] - 2 * s + sal[i + 1], off = den !== 0 ? 0.5 * (sal[i - 1] - sal[i + 1]) / den : 0;
        cand[f * K + slot] = f2m(fMin * Math.pow(2, (i + clamp(off, -0.5, 0.5)) * CENTS / 1200)); csal[f * K + slot] = s;
      }
    }
  }
  onProgress(0.9); await tick();
  // voicing: salience and energy relative to the song's loud parts
  const sp = Array.from(peak).sort((a, b) => a - b), se = Array.from(energy).sort((a, b) => a - b);
  const pThr = (sp[Math.floor(sp.length * 0.9)] || 0) * 0.32, eThr = (se[Math.floor(se.length * 0.9)] || 0) * 0.02;
  const voiced = f => peak[f] > 0 && peak[f] >= pThr && energy[f] >= eThr;
  // Viterbi through candidates within voiced runs
  const out = [];
  let f = 0;
  while (f < nF) {
    if (!voiced(f)) { f++; continue; }
    let g2 = f; while (g2 < nF && voiced(g2)) g2++;
    const len = g2 - f; if (len >= 4) {
      const cost = new Float32Array(len * K), back = new Int8Array(len * K);
      for (let t = 0; t < len; t++) {
        const fr = f + t, mx = Math.max(1e-9, peak[fr]);
        for (let k = 0; k < K; k++) {
          const m = cand[fr * K + k];
          const local = m < 0 ? 1e6 : -Math.log(csal[fr * K + k] / mx + 1e-3);
          if (t === 0) { cost[k] = local; continue; }
          let bc = Infinity, bk = 0;
          for (let j = 0; j < K; j++) {
            const pm = cand[(fr - 1) * K + j]; if (pm < 0) continue;
            const jump = Math.abs(m - pm), c = cost[(t - 1) * K + j] + 0.18 * jump + (jump > 7 ? 1.5 : 0);
            if (c < bc) { bc = c; bk = j; }
          }
          cost[t * K + k] = local + (bc === Infinity ? 0 : bc); back[t * K + k] = bk;
        }
      }
      let bk = 0, bc = Infinity; for (let k = 0; k < K; k++) if (cost[(len - 1) * K + k] < bc) { bc = cost[(len - 1) * K + k]; bk = k; }
      const path = new Array(len);
      for (let t = len - 1; t >= 0; t--) { path[t] = bk; bk = back[t * K + bk]; }
      for (let t = 0; t < len; t++) { const m = cand[(f + t) * K + path[t]]; if (m > 0) out.push({ t: ((f + t) * hop + N / 2) / sr, m, s: csal[(f + t) * K + path[t]] }); }
    }
    f = g2;
  }
  onProgress(1);
  return out.map((fr, i) => {
    const w = [];
    for (let j = i - 2; j <= i + 2; j++) if (j >= 0 && j < out.length && Math.abs(out[j].t - fr.t) <= 0.052) w.push(out[j].m);
    w.sort((a, b) => a - b);
    return { t: fr.t, m: w[w.length >> 1], s: fr.s };
  });
}
// Turn a pitch contour into note segments (with hysteresis so vibrato doesn't split notes)
function contourToNotes(fr, hop = 0.02) {
  const notes = []; let cur = null;
  const push = () => { if (!cur) return; const d = cur.last - cur.start + hop; if (d >= 0.1) notes.push({ t: cur.start - hop / 2, d, midi: Math.round(cur.sum / cur.n), lyr: '' }); };
  const begin = f => { cur = { start: f.t, last: f.t, sum: f.m, n: 1, ref: Math.round(f.m), lo: f.s || 0, hi: f.s || 0 }; };
  for (const f of fr) {
    if (cur && f.t - cur.last <= hop * 3.5 && Math.abs(f.m - cur.ref) < 0.75) {
      // same pitch: a fresh rise in strength after a dip means a new syllable on the same note
      if (f.s != null && f.t - cur.start > 0.12 && cur.lo < 0.6 * cur.hi && f.s > 1.7 * cur.lo) { push(); begin(f); continue; }
      cur.last = f.t; cur.sum += f.m; cur.n++;
      if (f.s != null) { if (f.s > cur.hi) { cur.hi = f.s; cur.lo = f.s; } else if (f.s < cur.lo) cur.lo = f.s; }
    } else { push(); begin(f); }
  }
  push();
  const merged = [];
  for (const nn of notes) { const p = merged[merged.length - 1]; if (p && p.midi === nn.midi && nn.t - (p.t + p.d) < 0.03) p.d = nn.t + nn.d - p.t; else merged.push({ ...nn }); }
  return merged;
}
function stereoSideRatio(buffer) {
  if (buffer.numberOfChannels < 2) return 0;
  const L = buffer.getChannelData(0), R = buffer.getChannelData(1); let s = 0, m = 0;
  for (let i = 0; i < L.length; i += 16) { const a = L[i], b = R[i]; s += (a - b) * (a - b); m += (a + b) * (a + b); }
  return m > 0 ? s / m : 0;
}

/* ---------------- note lookup & scoring ---------------- */
function firstEndingAfter(notes, t) { let lo = 0, hi = notes.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (notes[mid].t + notes[mid].d < t) lo = mid + 1; else hi = mid; } return lo; }
function noteIndexAt(notes, t) { let lo = 0, hi = notes.length - 1, r = -1; while (lo <= hi) { const mid = (lo + hi) >> 1; if (notes[mid].t <= t) { r = mid; lo = mid + 1; } else hi = mid - 1; } return r >= 0 && t < notes[r].t + notes[r].d ? r : -1; }
function lowerBoundT(arr, t) { let lo = 0, hi = arr.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid].t < t) lo = mid + 1; else hi = mid; } return lo; }
const need = n => Math.max(0.06, Math.min(0.45 * n.d, 0.3));

function classify(f) {
  const notes = S.notes; f.ni = -1; f.err = 0; f.cls = 'none'; f.dm = f.m;
  if (!notes.length) return;
  const W = 0.15; let best = Infinity;
  for (let i = firstEndingAfter(notes, f.t - W); i < notes.length && notes[i].t <= f.t + W; i++) {
    const n = notes[i]; let e = (f.m - n.midi) * 100; if (settings.anyOct) e = fold(e);
    const gap = f.t < n.t ? n.t - f.t : f.t > n.t + n.d ? f.t - (n.t + n.d) : 0;
    const sc = Math.abs(e) + gap * 600;
    if (sc < best) { best = sc; f.ni = i; f.err = e; }
  }
  if (f.ni >= 0) {
    const a = Math.abs(f.err), tol = settings.tol;
    f.cls = a <= tol ? 'good' : a <= tol * 2.2 ? 'close' : 'off';
    f.dm = notes[f.ni].midi + f.err / 100;
  }
}
function newRun(kind, from, mic) { return { kind, from, mic, frames: [], per: S.notes.map(() => ({ good: 0, voiced: 0, errSum: 0, errN: 0 })) }; }
function addFrame(run, f) {
  classify(f);
  const prev = run.frames[run.frames.length - 1];
  const dt = prev ? clamp(f.t - prev.t, 0, 0.05) : 0.02;
  run.frames.push(f);
  if (f.ni >= 0) {
    const p = run.per[f.ni]; p.voiced += dt;
    if (f.cls === 'good') p.good += dt;
    if (Math.abs(f.err) < 100) { p.errSum += f.err * dt; p.errN += dt; }
  }
}
function evaluated(run, i, upTo) { const n = S.notes[i]; return n.t >= run.from - 0.05 && n.t + n.d * 0.5 <= upTo; }
function results(run) {
  let hits = 0, total = 0, good = 0, voiced = 0, dur = 0, eS = 0, eN = 0; const misses = [];
  S.notes.forEach((n, i) => {
    if (!evaluated(run, i, run.endT)) return;
    total++; const p = run.per[i];
    if (p.good >= need(n)) hits++; else misses.push(i);
    good += p.good; voiced += Math.min(p.voiced, n.d + 0.3); dur += n.d; eS += p.errSum; eN += p.errN;
  });
  return { hits, total, score: total ? Math.round(100 * hits / total) : 0, inTune: voiced ? good / voiced : 0, coverage: dur ? Math.min(1, voiced / dur) : 0, meanErr: eN > 0.3 ? eS / eN : 0, misses };
}

/* ---------------- microphone ---------------- */
const mic = { stream: null, src: null, an: null, sink: null, buf: null, dec: null, on: false, inLat: 0.015, ec: null, failed: false };
const live = { m: null, raw: [], rms: 0 };
async function micOn() {
  ensureCtx();
  if (mic.on && mic.ec === !settings.earphones) return true;
  micOff(true);
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { micFail('This browser can’t reach the microphone. Open the app in Chrome.'); return false; }
  try {
    mic.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: !settings.earphones, noiseSuppression: false, autoGainControl: false } });
  } catch (e) {
    micFail(e && e.name === 'NotAllowedError' ? 'Microphone permission is blocked. Tap the icon left of the address bar → Permissions → Microphone → Allow.' : 'Couldn’t start the microphone (' + (e.message || e.name) + ').');
    return false;
  }
  mic.ec = !settings.earphones;
  mic.src = ctx.createMediaStreamSource(mic.stream);
  mic.an = ctx.createAnalyser(); mic.an.fftSize = 2048;
  mic.src.connect(mic.an);
  mic.sink = ctx.createGain(); mic.sink.gain.value = 0; mic.an.connect(mic.sink); mic.sink.connect(ctx.destination);
  mic.buf = new Float32Array(mic.an.fftSize); mic.dec = new Float32Array(mic.an.fftSize);
  const tr = mic.stream.getAudioTracks()[0]; const st = (tr && tr.getSettings && tr.getSettings()) || {};
  mic.inLat = typeof st.latency === 'number' ? st.latency : 0.015;
  mic.on = true; mic.failed = false; live.raw = []; updateMicUI();
  return true;
}
function micOff(silent) {
  if (mic.stream) mic.stream.getTracks().forEach(t => t.stop());
  try { mic.src && mic.src.disconnect(); mic.sink && mic.sink.disconnect(); } catch (e) {}
  mic.stream = null; mic.on = false; live.m = null; if (!silent) updateMicUI();
}
function micFail(msg) { mic.failed = true; updateMicUI(); toast(msg, 6000); }
const latComp = () => (mic.an ? mic.an.fftSize / ctx.sampleRate / 2 : 0) + outLat() + mic.inLat + settings.syncMs / 1000;

function detect() {
  mic.an.getFloatTimeDomainData(mic.buf);
  const b = mic.buf, sr = ctx.sampleRate, D = sr > 32000 ? 2 : 1, n = (b.length / D) | 0, x = mic.dec;
  let e = 0; for (let i = 0; i < b.length; i++) e += b[i] * b[i];
  live.rms = Math.sqrt(e / b.length);
  if (D === 2) for (let i = 0; i < n; i++) x[i] = 0.5 * (b[2 * i] + b[2 * i + 1]); else x.set(b);
  const r = live.rms > GATES[settings.sens] ? yin(x.subarray(0, n), sr / D, 65, 1100, 0.15) : null;
  const m = r ? f2m(r.freq) : null;
  live.raw.push(m); if (live.raw.length > 3) live.raw.shift();
  let out = m;
  if (m != null && live.raw.length === 3 && live.raw.every(v => v != null)) out = [...live.raw].sort((a, c) => a - c)[1];
  live.m = out;
  return out;
}

/* ---------------- recorder (for listen-back) ---------------- */
function startRecorder(run) {
  if (!window.MediaRecorder || !mic.stream) return;
  try {
    const rec = new MediaRecorder(mic.stream), chunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = async () => {
      try {
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        run.take = { buffer: await decodeAudio(await blob.arrayBuffer()), lead: run.recLead };
      } catch (e) { run.takeErr = true; }
      refreshResultButtons();
    };
    rec.start(); run.rec = rec;
    run.recLead = S.songStart - ctx.currentTime + outLat() + mic.inLat + settings.syncMs / 1000;
  } catch (e) {}
}
function stopRecorder(run) { try { if (run.rec && run.rec.state !== 'inactive') run.rec.stop(); } catch (e) {} }

/* ---------------- items & compile ---------------- */
function fitShift(lo, hi) {
  const r = settings.range; if (!r || !settings.fit) return null;
  const uLo = r[0] + 1, uHi = r[1] - 1, span = uHi - uLo;
  let s = Math.round(uLo + span * 0.45 - (lo + hi) / 2);
  if (hi - lo <= span) { if (lo + s < uLo) s = uLo - lo; if (hi + s > uHi) s = uHi - hi; }
  return s;
}
function compile() {
  const it = S.item; S.lastRun = null; hideResults();
  if (!it || it.kind === 'free') { S.notes = []; S.duration = 0; S.range = [50, 70]; return; }
  if (it.kind === 'track') {
    S.notes = it.rec.notes.map(n => ({ t: n.t, d: n.d, midi: n.midi, lyr: '' }));
    S.duration = it.rec.duration; S.spb = 0.5; S.bpb = 4; S.shift = 0;
    computeRange(true); return;
  }
  const src = it.kind === 'warmup' ? buildWarmup(it, settings.reps) : it.parsed;
  const spb = 60 / (it.bpm * settings.speed);
  let lo = Infinity, hi = -Infinity; for (const n of src.notes) { lo = Math.min(lo, n.midi); hi = Math.max(hi, n.midi); }
  const auto = fitShift(lo, hi);
  S.shift = (auto != null ? auto : (settings.range ? 0 : -12)) + settings.transpose;
  S.spb = spb; S.bpb = it.bpb || 4;
  S.notes = src.notes.map(n => ({ t: n.b * spb, d: n.d * spb, midi: n.midi + S.shift, lyr: n.lyr }));
  S.duration = src.beats * spb;
  computeRange(false);
}
function computeRange(robust) {
  if (!S.notes.length) { S.range = [50, 70]; return; }
  const ms = S.notes.map(n => n.midi).sort((a, b) => a - b);
  let lo = robust ? ms[Math.floor(ms.length * 0.03)] : ms[0], hi = robust ? ms[Math.ceil(ms.length * 0.97) - 1] : ms[ms.length - 1];
  lo -= 3; hi += 3;
  if (hi - lo < 14) { const c = (lo + hi) / 2; lo = c - 7; hi = c + 7; }
  S.range = [lo - 0.5, hi + 0.5];
}
function itemsFor(tab) {
  if (tab === 'songs') return SONGS;
  if (tab === 'warmups') return WARMUPS;
  if (tab === 'tracks') return S.tracks.map(trackItem);
  return [];
}
function trackItem(rec) { return { kind: 'track', key: 'track:' + rec.id, title: rec.name, get sub() { return `${fmt(rec.duration)} · ${rec.notes.length} notes${rec.inst ? ' · karaoke ✓' : ''}`; }, rec }; }
const FREE = { kind: 'free', key: 'free', title: 'Free tuner', sub: 'Sing anything and see your pitch' };

function selectItem(item) {
  stopAll();
  S.item = item; S.reviewT = 0;
  for (const r of S.tracks) if (r !== item.rec && !sepJobs.has(r.id)) { r.buffer = null; r.inst = null; }
  if (item.kind === 'track') prepareKaraoke(item.rec).catch(() => {});
  if (item.kind === 'free') { ensureCtx(); S.free.t0 = ctx.currentTime; S.free.frames = []; micOn(); }
  compile();
  renderLibrary(); renderNowPlaying(); updateTransport();
}

/* ---------------- run control ---------------- */
async function start(kind) {
  if (!S.item) return toast('Pick something to sing first.');
  if (S.item.kind === 'free') { micOn(); return; }
  ensureCtx(); try { await ctx.resume(); } catch (e) {}
  stopAll();
  let micOk = false;
  if (kind !== 'listen' && kind !== 'vocals') {
    micOk = await micOn();
    if (!micOk && kind === 'score') kind = 'listen';
  }
  if (S.item.kind === 'track') {
    const rec = S.item.rec;
    if (!rec.buffer) {
      progress('Loading track…', 0.3);
      try { rec.buffer = await decodeAudio(await rec.blob.arrayBuffer()); } catch (e) { hideProgress(); return toast('Couldn’t load this track.'); }
      hideProgress();
    }
    if ((kind === 'karaoke' || kind === 'vocals') && !rec.inst) { if (!(await waitKaraoke(rec))) return; }
    else if (kind === 'score' && !rec.inst && settings.vocals < 0.95) toast('Karaoke version is still being prepared, so this plays the original.');
  }
  let from = 0;
  if (S.reviewT > 0.3 && S.reviewT < S.duration - 0.5) {
    from = S.reviewT;
    if (S.item.kind !== 'track') { const i = firstEndingAfter(S.notes, from); if (i < S.notes.length) from = Math.min(from, S.notes[i].t); }
  }
  const pre = (S.item.kind !== 'track' && settings.countIn) ? S.bpb * S.spb : 0.6;
  const t0 = ctx.currentTime + 0.2;
  S.songStart = t0 + pre - from;
  const gb = guideBus(S.item.kind === 'track' ? Math.max(0.6, settings.guideVol) : settings.guideVol);
  if (S.item.kind !== 'track' && settings.countIn) for (let b = 0; b < S.bpb; b++) click(t0 + b * S.spb, b === 0, gb);
  scheduleGuide(gb, S.songStart, from, kind === 'listen' ? 'orig' : kind === 'vocals' ? 'vocals' : 'mix');
  S.run = newRun(kind, from, micOk && kind !== 'listen' && kind !== 'vocals');
  if (S.run.mic) startRecorder(S.run);
  S.mode = 'running'; S.endAt = S.songStart + S.duration + 0.35;
  hideResults(); wakeLock(true); updateTransport();
}
function finish() {
  const run = S.run, was = S.mode, now = ctx ? ctx.currentTime : 0;
  stopGuide(); S.mode = 'idle'; wakeLock(false);
  if (was === 'running' && run) {
    run.endT = Math.min(S.duration, now - S.songStart);
    if (run.rec) stopRecorder(run);
    if (run.mic) {
      S.lastRun = run;
      if (run.kind === 'score') {
        run.res = results(run);
        if (run.res.total) { showResults(run.res, run); recordBest(run.res); }
        else toast('Sing through at least a few notes to get a score.');
      }
    }
    S.reviewT = run.from;
  } else if (was === 'replay') {
    S.reviewT = clamp(now - S.songStart, 0, S.duration);
  }
  S.run = null; updateTransport();
}
function stopAll() { if (S.mode === 'running' || S.mode === 'replay') finish(); }

function listenBack() {
  const run = S.lastRun; if (!run || !run.take) return;
  ensureCtx(); stopAll();
  const from = S.reviewT > run.from && S.reviewT < run.endT - 0.3 ? S.reviewT : run.from;
  const t0 = ctx.currentTime + 0.15; S.songStart = t0 - from;
  const gb = guideBus(settings.guideVol * 0.5);
  scheduleGuide(gb, S.songStart, from, 'mix');
  const voice = ctx.createGain(); voice.gain.value = 1.4; voice.connect(master); gb.voice = voice;
  const src = ctx.createBufferSource(); src.buffer = run.take.buffer; src.connect(voice);
  const tau0 = from + run.take.lead;
  if (tau0 >= 0) src.start(t0, tau0); else src.start(t0 - tau0, 0);
  gb.nodes.push(src);
  S.mode = 'replay'; S.endAt = S.songStart + Math.min(S.duration, run.endT) + 0.3;
  updateTransport();
}

/* ---------------- upload a recording to score ---------------- */
function align(frames, notes) {
  if (!frames.length || !notes.length) return 0;
  const end = notes[notes.length - 1].t + notes[notes.length - 1].d;
  const sub = frames.filter((_, i) => i % 2 === 0);
  const scoreAt = L => { let s = 0; for (const f of sub) { const t = f.t - L; if (t < 0 || t > end) continue; const i = noteIndexAt(notes, t); if (i >= 0 && Math.abs(fold((f.m - notes[i].midi) * 100)) < 80) s++; } return s; };
  const lead0 = frames[0].t - notes[0].t;
  let best = -1, bl = lead0;
  for (let L = frames[0].t - end; L <= frames[frames.length - 1].t; L += 0.05) {
    const s = scoreAt(L) * (1 - 0.15 * Math.min(1, Math.abs(L - lead0) / 8));
    if (s > best) { best = s; bl = L; }
  }
  let best2 = -1, bl2 = bl;
  for (let L = bl - 0.06; L <= bl + 0.06; L += 0.01) { const s = scoreAt(L); if (s > best2) { best2 = s; bl2 = L; } }
  return bl2;
}
async function scoreUpload(file) {
  if (!S.item || S.item.kind === 'free') return toast('Pick a song, warm-up or track first.');
  stopAll();
  try {
    progress('Listening to your recording…', 0);
    const buf = await decodeAudio(await file.arrayBuffer());
    const fr = await pitchTrack(buf, { minF: 65, maxF: 1100, onProgress: p => progress('Listening to your recording…', p) });
    hideProgress();
    if (fr.length < 10) return toast('Couldn’t hear clear singing in that recording.');
    const lead = align(fr, S.notes);
    const run = newRun('score', 0, true);
    for (const f of fr) addFrame(run, { t: f.t - lead, m: f.m });
    run.from = Math.max(0, fr[0].t - lead - 0.2);
    run.endT = Math.min(S.duration, fr[fr.length - 1].t - lead + 0.3);
    run.take = { buffer: buf, lead };
    S.lastRun = run; run.res = results(run); S.reviewT = run.from;
    if (run.res.total) { showResults(run.res, run); recordBest(run.res); } else toast('That recording didn’t line up with this melody.');
  } catch (e) { hideProgress(); toast('Couldn’t read that audio file.'); }
}

/* ---------------- tracks (IndexedDB) ---------------- */
const DB = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('sing-along-studio', 2);
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains('tracks')) db.createObjectStore('tracks', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('karaoke')) db.createObjectStore('karaoke', { keyPath: 'id' });
      };
      r.onsuccess = () => res(this.db = r.result); r.onerror = () => rej(r.error);
    });
  },
  async tx(store, mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction(store, mode); const q = fn(t.objectStore(store)); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); },
  all() { return this.tx('tracks', 'readonly', s => s.getAll()); },
  put(o) { return this.tx('tracks', 'readwrite', s => s.put(o)); },
  del(id) { return this.tx('tracks', 'readwrite', s => s.delete(id)); },
  kget(id) { return this.tx('karaoke', 'readonly', s => s.get(id)); },
  kput(o) { return this.tx('karaoke', 'readwrite', s => s.put(o)); },
  kdel(id) { return this.tx('karaoke', 'readwrite', s => s.delete(id)); },
};
const storable = r => ({ id: r.id, name: r.name, blob: r.blob, notes: r.notes, duration: r.duration, side: r.side, added: r.added, f0t: r.f0t, f0m: r.f0m });

/* ---------------- karaoke (vocal separation in a worker) ---------------- */
const SEP_V = 1, sepJobs = new Map();
let kWait = null;
function toInt16Blob(L, R) {
  const n = L.length, a = new Int16Array(n * 2);
  for (let i = 0; i < n; i++) { a[2 * i] = clamp(L[i], -1, 1) * 32767; a[2 * i + 1] = clamp(R[i], -1, 1) * 32767; }
  return new Blob([a.buffer]);
}
async function int16ToBuffer(c) {
  const a = new Int16Array(await c.data.arrayBuffer()), L = new Float32Array(c.len), R = new Float32Array(c.len);
  for (let i = 0; i < c.len; i++) { L[i] = a[2 * i] / 32767; R[i] = a[2 * i + 1] / 32767; }
  const b = ctx.createBuffer(2, c.len, c.sr); b.copyToChannel(L, 0); b.copyToChannel(R, 1); return b;
}
function karaokeUI(rec) {
  if (kWait === rec) progress('Preparing karaoke…', rec.sepP);
  if (S.item && S.item.rec === rec) { updateTransport(); if (rec.sepP === 1) renderNowPlaying(); }
}
function prepareKaraoke(rec) {
  if (rec.inst) return Promise.resolve(rec.inst);
  if (sepJobs.has(rec.id)) return sepJobs.get(rec.id);
  const job = (async () => {
    ensureCtx(); rec.sepP = 0; karaokeUI(rec);
    if (!rec.buffer) rec.buffer = await decodeAudio(await rec.blob.arrayBuffer());
    const buf = rec.buffer;
    try {
      const c = await DB.kget(rec.id);
      if (c && c.v === SEP_V && c.sr === buf.sampleRate && c.len === buf.length) { rec.inst = await int16ToBuffer(c); rec.sepP = 1; karaokeUI(rec); renderLibrary(); return rec.inst; }
    } catch (e) {}
    if (!rec.f0t) {
      const fr = await melodyExtract(buf, p => { rec.sepP = p * 0.3; karaokeUI(rec); });
      rec.f0t = Float32Array.from(fr.map(x => x.t)); rec.f0m = Float32Array.from(fr.map(x => x.m));
      try { await DB.put(storable(rec)); } catch (e) {}
    }
    const p0 = rec.sepP || 0;
    const L = buf.getChannelData(0).slice(), R = (buf.numberOfChannels > 1 ? buf.getChannelData(1) : buf.getChannelData(0)).slice();
    const mono = buf.numberOfChannels < 2 || (rec.side != null && rec.side < 0.015);
    const [oL, oR] = await new Promise((res, rej) => {
      const w = new Worker('sep.js?v=' + VERSION);
      w.onmessage = e => {
        const d = e.data;
        if (d.type === 'progress') { rec.sepP = p0 + (1 - p0) * d.p * 0.98; karaokeUI(rec); }
        else if (d.type === 'done') { w.terminate(); res([d.L, d.R]); }
        else { w.terminate(); rej(new Error(d.message)); }
      };
      w.onerror = e => { w.terminate(); rej(new Error(e.message || 'worker failed')); };
      w.postMessage({ L, R, sr: buf.sampleRate, f0t: rec.f0t, f0m: rec.f0m, opts: { mono } }, [L.buffer, R.buffer]);
    });
    const inst = ctx.createBuffer(2, oL.length, buf.sampleRate); inst.copyToChannel(oL, 0); inst.copyToChannel(oR, 1);
    rec.inst = inst; rec.sepP = 1; karaokeUI(rec); renderLibrary();
    try { await DB.kput({ id: rec.id, v: SEP_V, sr: buf.sampleRate, len: oL.length, data: toInt16Blob(oL, oR) }); } catch (e) {}
    return inst;
  })();
  sepJobs.set(rec.id, job);
  job.then(() => sepJobs.delete(rec.id), () => { sepJobs.delete(rec.id); rec.sepP = null; karaokeUI(rec); });
  return job;
}
async function waitKaraoke(rec) {
  kWait = rec; progress('Preparing karaoke…', rec.sepP || 0);
  try { await prepareKaraoke(rec); return true; }
  catch (e) { toast('Couldn’t prepare karaoke for this track.'); return false; }
  finally { kWait = null; hideProgress(); }
}

async function loadTracks() {
  try { const all = await DB.all(); S.tracks = (all || []).sort((a, b) => b.added - a.added); } catch (e) { S.tracks = []; }
  if (S.tab === 'tracks') renderLibrary();
}
async function onTrackFile(file) {
  ensureCtx();
  try {
    progress('Reading “' + file.name + '”…', 0.05);
    const buf = await decodeAudio(await file.arrayBuffer());
    const frames = await melodyExtract(buf, p => progress('Finding the melody…', 0.1 + p * 0.9));
    const notes = contourToNotes(frames);
    const rec = { id: 't' + Date.now(), name: file.name.replace(/\.[^.]+$/, ''), blob: file, notes, duration: buf.duration, side: stereoSideRatio(buf), added: Date.now(),
      f0t: Float32Array.from(frames.map(x => x.t)), f0m: Float32Array.from(frames.map(x => x.m)) };
    try { await DB.put(storable(rec)); } catch (e) { toast('Couldn’t save the track on this device; it’ll stay until you close the app.'); }
    rec.buffer = buf; S.tracks.unshift(rec);
    hideProgress(); S.tab = 'tracks'; setTabUI(); selectItem(trackItem(rec));
    if (notes.length < 12) toast('Couldn’t find a clear melody. A vocal-only version works best, but Karaoke still works.', 6000);
    else toast(`Found ${notes.length} melody notes. Karaoke is being prepared…`);
  } catch (e) { hideProgress(); toast('Couldn’t read that audio file. Try an mp3, m4a or wav.'); }
}
async function deleteTrack(id) {
  if (!confirm('Remove this track from the app?')) return;
  try { await DB.del(id); await DB.kdel(id); } catch (e) {}
  S.tracks = S.tracks.filter(t => t.id !== id);
  if (S.item && S.item.rec && S.item.rec.id === id) { S.item = null; compile(); renderNowPlaying(); updateTransport(); }
  renderLibrary();
}

/* ---------------- range finder ---------------- */
const RF = { on: false, step: 0, lo: null, hi: null, ref: null, since: 0, sum: 0, n: 0, lastV: 0 };
function openRange() {
  RF.on = true; RF.step = 1; RF.lo = null; RF.hi = null; RF.ref = null;
  $('#rangeSheet').hidden = false; renderRF(); micOn();
}
function closeRange() { RF.on = false; $('#rangeSheet').hidden = true; }
function voiceType(lo, hi) {
  if (lo <= 41) return 'bass'; if (lo <= 45) return 'baritone'; if (lo <= 49) return 'tenor';
  if (lo <= 53) return 'alto'; if (lo <= 57) return 'mezzo-soprano'; return 'soprano';
}
function renderRF() {
  const t = $('#rfText'), next = $('#rfNext');
  $('#rfRedo').hidden = RF.step !== 3; $('#rfHold').style.width = '0%';
  if (RF.step === 1) {
    $('#rfTitle').textContent = 'Find your range · 1 of 2';
    t.innerHTML = 'Sing <b>“ah”</b> in a relaxed voice, then slide <b>down</b> to the <b>lowest note you can sing comfortably</b>. Hold it for a moment.';
    $('#rfBest').textContent = RF.lo != null ? 'Lowest: ' + noteName(RF.lo) : 'Lowest: –'; next.textContent = 'Next'; next.disabled = RF.lo == null;
  } else if (RF.step === 2) {
    $('#rfTitle').textContent = 'Find your range · 2 of 2';
    t.innerHTML = 'Now slide <b>up</b> to the <b>highest note you can sing comfortably</b> without straining. Hold it for a moment.';
    $('#rfBest').textContent = RF.hi != null ? 'Highest: ' + noteName(RF.hi) : 'Highest: –'; next.textContent = 'Finish'; next.disabled = RF.hi == null;
  } else {
    const lo = Math.min(RF.lo, RF.hi), hi = Math.max(RF.lo, RF.hi), span = hi - lo;
    $('#rfTitle').textContent = 'Your range';
    t.innerHTML = span < 7
      ? `Only ${span} semitones apart. Try again and slide further down and up.`
      : `<b>${noteName(lo)} – ${noteName(hi)}</b>, about ${(span / 12).toFixed(1)} octaves. That's close to a typical <b>${voiceType(lo, hi)}</b> range. Melodies will now be moved into a key that suits you (turn this off in Settings).`;
    $('#rfNote').textContent = noteName(lo) + '–' + noteName(hi); $('#rfBest').textContent = span + ' semitones';
    next.textContent = 'Save'; next.disabled = span < 7;
  }
}
function rfStep(now) {
  if (!RF.on || RF.step > 2) return;
  const m = live.m;
  $('#rfNote').textContent = m != null ? noteName(m) : '–';
  if (m == null) { if (now - (RF.lastV || 0) > 0.15) { RF.ref = null; $('#rfHold').style.width = '0%'; } return; }
  RF.lastV = now;
  if (RF.ref == null || Math.abs(m - RF.ref) > 0.6) { RF.ref = m; RF.since = now; RF.sum = 0; RF.n = 0; }
  RF.sum += m; RF.n++; RF.ref = RF.ref * 0.85 + m * 0.15;
  const held = (now - RF.since) / 0.7;
  $('#rfHold').style.width = Math.min(100, held * 100) + '%';
  if (held >= 1) {
    const v = Math.round(RF.sum / RF.n);
    if (RF.step === 1 && (RF.lo == null || v < RF.lo)) { RF.lo = v; renderRF(); }
    if (RF.step === 2 && (RF.hi == null || v > RF.hi)) { RF.hi = v; renderRF(); }
  }
}

/* ---------------- drawing ---------------- */
const cv = $('#roll'), g = cv.getContext('2d');
let cw = 0, ch = 0;
const COL = { good: '#7fe3a1', close: '#ffd06e', off: '#ff8089', none: '#b8a0ff', free: '#b8a0ff' };
function viewTime() {
  if (!ctx) return S.reviewT;
  if (S.mode === 'running' || S.mode === 'replay') return ctx.currentTime - S.songStart;
  if (S.item && S.item.kind === 'free') return ctx.currentTime - S.free.t0;
  return S.reviewT;
}
function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function currentTarget(t) {
  if (!S.notes.length) return null;
  const i = noteIndexAt(S.notes, t); if (i >= 0) return S.notes[i];
  const j = firstEndingAfter(S.notes, t); const n = S.notes[j];
  return n && n.t - t < 0.5 ? n : null;
}
function draw() {
  const dpr = Math.min(2.5, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
  if (w !== cw || h !== ch || cv.width !== Math.round(w * dpr)) { cw = w; ch = h; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = cw, H = ch; g.clearRect(0, 0, W, H);
  const free = S.item && S.item.kind === 'free';
  const now = viewTime();
  const lyrH = (!free && S.notes.length && S.item && S.item.kind !== 'track') ? 24 : 0;
  const top = 6, rollH = H - lyrH - top - 4;
  const secs = W < 520 ? 5 : 7, pps = W / secs, nowX = Math.round(W * 0.3);
  const X = t => nowX + (t - now) * pps;
  let lo, hi;
  if (free) { const tc = live.m != null ? live.m : S.free.center; S.free.center += (tc - S.free.center) * 0.05; lo = S.free.center - 9.5; hi = S.free.center + 9.5; }
  else [lo, hi] = S.range;
  const rowH = rollH / (hi - lo), Y = m => clamp(top + (hi - m) * rowH, top + 3, top + rollH - 3);
  // piano-roll rows
  g.font = '700 9.5px Manrope, system-ui, sans-serif'; g.textBaseline = 'middle';
  for (let m = Math.ceil(lo); m <= Math.floor(hi); m++) {
    const pc = ((m % 12) + 12) % 12, y = top + (hi - m) * rowH;
    if ([1, 3, 6, 8, 10].includes(pc)) { g.fillStyle = 'rgba(255,255,255,0.028)'; g.fillRect(0, y - rowH / 2, W, rowH); }
    if (pc === 0) { g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(0, y + rowH / 2, W, 1); }
    if (rowH >= 9 && (pc === 0 || (rowH >= 14 && ![1, 3, 6, 8, 10].includes(pc)))) { g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillText(noteName(m), 4, y); }
  }
  const t0 = now - nowX / pps, t1 = now + (W - nowX) / pps;
  // bar lines
  if (S.item && (S.item.kind === 'song' || S.item.kind === 'warmup') && S.spb) {
    const bar = S.spb * S.bpb; g.fillStyle = 'rgba(255,255,255,0.045)';
    for (let b = Math.max(0, Math.floor(t0 / bar) * bar); b < t1; b += bar) g.fillRect(Math.round(X(b)), top, 1, rollH);
  }
  // target notes
  const run = S.mode === 'running' ? S.run : S.lastRun;
  const upTo = S.mode === 'running' ? now : run ? run.endT : 0;
  const nh = clamp(rowH * 0.74, 6, 22);
  let lastLyrEnd = -1e9;
  for (let i = firstEndingAfter(S.notes, t0); i < S.notes.length && S.notes[i].t < t1; i++) {
    const n = S.notes[i], x0 = X(n.t), x1 = X(n.t + n.d), y = Y(n.midi);
    const active = S.mode !== 'idle' && now >= n.t && now < n.t + n.d;
    let fill = 'rgba(88,213,201,0.5)';
    if (run && run.kind === 'score' && run.mic && evaluated(run, i, upTo)) fill = run.per[i].good >= need(n) ? 'rgba(127,227,161,0.5)' : 'rgba(255,128,137,0.42)';
    if (active) fill = 'rgba(88,213,201,0.95)';
    rr(x0 + 1, y - nh / 2, Math.max(3, x1 - x0 - 2), nh, Math.min(6, nh / 2)); g.fillStyle = fill; g.fill();
    if (x1 - x0 > 30 && nh >= 11) { g.fillStyle = 'rgba(8,10,28,0.8)'; g.fillText(noteName(n.midi), x0 + 6, y + 0.5); }
    if (lyrH) {
      const lab = n.lyr || NN[pcOf(n.midi)];
      g.font = (active ? '800 ' : '600 ') + '12.5px Manrope, system-ui, sans-serif';
      const tw = g.measureText(lab).width;
      if (x0 > lastLyrEnd + 3) { g.fillStyle = active ? '#ffffff' : 'rgba(255,255,255,0.5)'; g.fillText(lab, x0 + 1, H - lyrH / 2 - 2); lastLyrEnd = x0 + tw; }
      g.font = '700 9.5px Manrope, system-ui, sans-serif';
    }
  }
  // voice trail
  const frames = S.mode === 'running' ? (S.run && S.run.frames) : free ? S.free.frames : (S.lastRun && S.lastRun.frames);
  if (frames && frames.length) {
    g.lineWidth = 3.4; g.lineCap = 'round'; g.lineJoin = 'round';
    let prev = null;
    for (let k = lowerBoundT(frames, t0 - 0.2); k < frames.length; k++) {
      const f = frames[k]; if (f.t > t1) break;
      if (S.mode === 'replay' && f.t > now) break;
      const dm = f.dm != null ? f.dm : f.m, x = X(f.t), y = Y(dm), c = COL[f.cls || 'none'];
      if (prev && f.t - prev.t < 0.1 && Math.abs(dm - prev.dm) < 1.6) { g.strokeStyle = c; g.beginPath(); g.moveTo(prev.x, prev.y); g.lineTo(x, y); g.stroke(); }
      else { g.fillStyle = c; g.beginPath(); g.arc(x, y, 1.8, 0, 7); g.fill(); }
      prev = { t: f.t, x, y, dm };
    }
  }
  // now line
  const grd = g.createLinearGradient(0, top, 0, top + rollH); grd.addColorStop(0, 'rgba(184,160,255,0)'); grd.addColorStop(0.5, 'rgba(184,160,255,0.55)'); grd.addColorStop(1, 'rgba(184,160,255,0)');
  g.fillStyle = grd; g.fillRect(nowX - 1, top, 2, rollH);
  // live dot
  if (mic.on && live.m != null && S.mode !== 'replay') {
    const tg = S.mode === 'running' ? currentTarget(now) : null;
    let dm = live.m, c = COL.none;
    if (tg) { let e = (live.m - tg.midi) * 100; if (settings.anyOct) e = fold(e); dm = tg.midi + e / 100; const a = Math.abs(e); c = a <= settings.tol ? COL.good : a <= settings.tol * 2.2 ? COL.close : COL.off; }
    g.save(); g.shadowColor = c; g.shadowBlur = 14; g.fillStyle = c; g.beginPath(); g.arc(nowX, Y(dm), 6.5, 0, 7); g.fill(); g.restore();
  }
  // overlays
  g.textAlign = 'center';
  if (S.mode === 'running' && S.run && now < S.run.from && S.item.kind !== 'track' && settings.countIn) {
    const left = Math.ceil((S.run.from - now) / S.spb);
    if (left > 0 && left <= S.bpb) { g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = '800 56px Manrope, system-ui, sans-serif'; g.fillText(String(left), W / 2, top + rollH / 2); }
  } else if (!S.item) {
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.font = '700 14px Manrope, system-ui, sans-serif'; g.fillText('Pick a song, warm-up or track above', W / 2, H / 2);
  } else if (free && !S.free.frames.length) {
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.font = '700 14px Manrope, system-ui, sans-serif'; g.fillText(mic.on ? 'Sing anything. Your pitch shows here.' : 'Tap the mic to start', W / 2, H / 2);
  } else if (S.item.kind === 'track' && !S.notes.length) {
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.font = '700 13px Manrope, system-ui, sans-serif'; g.fillText('No clear melody found. Karaoke still works.', W / 2, H / 2);
  }
  g.textAlign = 'start';
}

/* ---------------- readout ---------------- */
const RO = {};
function setText(id, v) { if (RO[id] !== v) { RO[id] = v; const el = document.getElementById(id); if (el) el.textContent = v; } }
function updateReadout() {
  const m = mic.on ? live.m : null, now = viewTime();
  const tg = S.mode === 'running' ? currentTarget(now) : null;
  setText('youNote', m != null ? noteName(m) : '–');
  const cents = m != null ? Math.round((m - Math.round(m)) * 100) : null;
  setText('youCents', m != null ? (cents > 0 ? '+' : '') + cents + '¢ · ' + Math.round(m2f(m)) + ' Hz' : (mic.on ? 'listening…' : ' '));
  setText('tgtNote', tg ? noteName(tg.midi) : '–');
  setText('tgtLyr', tg ? (tg.lyr ? '“' + tg.lyr.replace(/-$/, '') + '”' : 'hold it') : ' ');
  let err = null, hint;
  if (m != null && tg) { err = (m - tg.midi) * 100; if (settings.anyOct) err = fold(err); }
  else if (m != null) err = cents;
  const tol = tg ? settings.tol : 10;
  if (!mic.on) hint = mic.failed ? 'Mic unavailable' : 'Mic is off';
  else if (m == null) hint = S.mode === 'running' ? 'Sing!' : 'Listening…';
  else if (tg) { const a = Math.abs(err); hint = a > 250 ? 'Aim for ' + noteName(tg.midi) : a <= tol ? '✓ Right on' : err > 0 ? 'Too high ↓' : 'Too low ↑'; }
  else hint = Math.abs(err) <= tol ? '✓ In tune' : (err > 0 ? 'Sharp ' : 'Flat ') + Math.abs(err) + '¢';
  setText('hint', hint);
  const needle = $('#needle'), zone = $('#zone');
  const z = (tg ? settings.tol : 10) / 2;
  zone.style.left = (50 - z) + '%'; zone.style.width = (2 * z) + '%';
  if (err != null) {
    needle.style.left = (50 + clamp(err, -100, 100) / 2) + '%'; needle.style.opacity = 1;
    needle.style.background = Math.abs(err) <= tol ? COL.good : Math.abs(err) <= tol * 2.2 ? COL.close : COL.off;
  } else needle.style.opacity = 0.25;
  $('#lvl').style.width = mic.on ? Math.min(100, Math.sqrt(live.rms) * 260) + '%' : '0%';
  // scrub & time
  const sc = $('#scrub');
  if (S.duration && S.item && S.item.kind !== 'free') {
    if (S.mode !== 'idle' || document.activeElement !== sc) sc.value = clamp(now, 0, S.duration);
    setText('tCur', fmt(now)); setText('tDur', fmt(S.duration));
  } else { setText('tCur', '0:00'); setText('tDur', '0:00'); }
}

/* ---------------- main loop ---------------- */
function frameLoop() {
  requestAnimationFrame(frameLoop);
  if (ctx && mic.on && mic.an) {
    const now = ctx.currentTime, m = detect();
    if (S.mode === 'running' && S.run && S.run.mic && m != null) {
      const t = now - S.songStart - latComp();
      if (t >= S.run.from - 0.3) addFrame(S.run, { t, m });
    } else if (S.item && S.item.kind === 'free' && m != null) {
      const fr = S.free.frames; fr.push({ t: now - S.free.t0, m, cls: 'free' });
      if (fr.length > 1500) fr.splice(0, fr.length - 1200);
    }
    rfStep(now);
  }
  if ((S.mode === 'running' || S.mode === 'replay') && ctx && ctx.currentTime >= S.endAt) finish();
  draw(); updateReadout();
}

/* ---------------- UI rendering ---------------- */
function setTabUI() { $$('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === S.tab))); }
function renderLibrary() {
  const list = $('#list'); list.innerHTML = '';
  const add = (html, cls, onClick) => { const b = document.createElement('div'); b.className = 'card ' + (cls || ''); b.tabIndex = 0; b.setAttribute('role', 'button'); b.innerHTML = html; b.addEventListener('click', onClick); list.appendChild(b); return b; };
  if (S.tab === 'tuner') {
    add('<div class="t">Free tuner</div><div class="s">Sing anything and see your pitch</div>', S.item && S.item.kind === 'free' ? 'sel' : '', () => selectItem(FREE));
    add('<div class="t">Range finder</div><div class="s">' + (settings.range ? 'Yours: ' + noteName(settings.range[0]) + '–' + noteName(settings.range[1]) : 'Find your lowest & highest notes') + '</div>', '', openRange);
    return;
  }
  if (S.tab === 'tracks') add('<div class="t">＋ Load a track</div><div class="s">mp3, m4a, wav… from your phone</div>', 'add', () => $('#trackFile').click());
  for (const it of itemsFor(S.tab)) {
    const best = bests[it.key];
    const el = add(`<div class="t">${esc(it.title)}</div><div class="s">${esc(it.sub)}</div>${best != null ? `<div class="best">${best}%</div>` : ''}`,
      S.item && S.item.key === it.key ? 'sel' : '', () => selectItem(it));
    if (it.kind === 'track') {
      const del = document.createElement('button'); del.className = 'del'; del.textContent = '×'; del.setAttribute('aria-label', 'Remove track');
      del.addEventListener('click', e => { e.stopPropagation(); deleteTrack(it.rec.id); }); el.appendChild(del);
      if (best != null) el.querySelector('.best').style.right = '34px';
    }
  }
  if (S.tab === 'tracks' && !S.tracks.length) add('<div class="s" style="margin-top:0">Your tracks are kept on this phone. Vocal-only versions give the most accurate scoring.</div>', '', () => $('#trackFile').click());
  const sel = list.querySelector('.sel'); if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function renderNowPlaying() {
  const it = S.item;
  $('#npTitle').textContent = it ? it.title : 'Pick something to sing';
  $('#npSub').textContent = it ? it.sub : 'Choose a song, warm-up or track above.';
  let key = '';
  if (it && (it.kind === 'song' || it.kind === 'warmup') && S.notes.length) {
    const ms = S.notes.map(n => n.midi);
    key = noteName(Math.min(...ms)) + '–' + noteName(Math.max(...ms));
    key += S.shift ? ` · ${S.shift > 0 ? '+' : ''}${S.shift} st` : '';
  } else if (it && it.kind === 'track') key = fmt(S.duration);
  $('#npKey').textContent = key;
  $('#keyLbl').textContent = it && (it.kind === 'song' || it.kind === 'warmup') ? `Playing ${S.shift > 0 ? '+' : ''}${S.shift} from written key` : 'semitones';
}
function updateTransport() {
  const run = S.mode === 'running' || S.mode === 'replay', it = S.item;
  const isTrack = it && it.kind === 'track', isFree = it && it.kind === 'free';
  $('#btnSing').hidden = run || isFree; $('#btnListen').hidden = run || isFree; $('#btnKaraoke').hidden = run || !isTrack;
  $('#btnStop').hidden = !run;
  const rec = isTrack ? it.rec : null;
  $('#btnKaraoke').textContent = '🎤 Karaoke' + (rec && !rec.inst && rec.sepP != null ? ' ' + Math.round(rec.sepP * 100) + '%' : '');
  $('#voxRow').hidden = !isTrack; $('#vocalsOnly').hidden = !isTrack || run;
  $('#btnStop').textContent = S.mode === 'replay' ? '■ Stop playback' : '■ Stop';
  $('#btnSing').disabled = !it; $('#btnListen').disabled = !it;
  $('#scrub').disabled = run || !it || isFree; $('#scrub').max = S.duration || 1;
  $('#uploadTake').hidden = !it || isFree || run;
  const from = !run && S.reviewT > 0.3 && it && !isFree ? 'Starts from ' + fmt(S.reviewT) + ' (drag to 0:00 for the start)' : '';
  $('#fromLbl').textContent = run ? (S.mode === 'replay' ? 'Playing back your take…' : S.run && S.run.kind === 'karaoke' ? 'Karaoke' : S.run && S.run.kind === 'vocals' ? 'The singer on their own' : S.run && !S.run.mic ? 'Listening only (no scoring)' : '') : from;
  $$('#settings input, #settings select, #settings button').forEach(el => { if (!['sVol', 'sSync', 'sSens', 'sVocals'].includes(el.id)) el.disabled = run; });
  $('#sFit').disabled = run || !settings.range;
}
function updateMicUI() {
  const b = $('#micBtn'); b.classList.toggle('on', mic.on); b.classList.toggle('bad', mic.failed && !mic.on);
  $('#micLbl').textContent = mic.on ? 'Mic on' : mic.failed ? 'Mic blocked' : 'Mic off';
}
function hideResults() { const r = $('#results'); r.hidden = true; r.innerHTML = ''; }
function tipsFor(res) {
  const t = [];
  if (res.score >= 90) t.push('Excellent! Try <b>Strict</b> accuracy or a faster speed next.');
  if (res.meanErr > 12) t.push(`You lean <b>sharp</b> (about +${Math.round(res.meanErr)}¢). Relax your jaw and aim a little lower.`);
  else if (res.meanErr < -12) t.push(`You lean <b>flat</b> (about ${Math.round(res.meanErr)}¢). More breath support, and think “up” on each note.`);
  if (res.coverage < 0.6) t.push('Keep singing through each note for its <b>full length</b>. A slower speed helps.');
  if (res.inTune < 0.5 && res.score < 60) t.push('Try <b>Listen</b> first, then <b>Easy</b> accuracy or 75% speed.');
  if (!t.length) t.push('Nice and steady. Practise your trickiest notes below, then go again.');
  return t;
}
function showResults(res, run) {
  const el = $('#results'); el.hidden = false;
  const verdict = res.score >= 90 ? 'Superb!' : res.score >= 75 ? 'Great job' : res.score >= 55 ? 'Getting there' : res.score >= 30 ? 'Keep practising' : 'Warm-up round';
  const C = 2 * Math.PI * 36, col = res.score >= 75 ? COL.good : res.score >= 45 ? COL.close : COL.off;
  const tend = Math.abs(res.meanErr) < 8 ? 'centred' : (res.meanErr > 0 ? '+' : '') + Math.round(res.meanErr) + '¢';
  const misses = res.misses.slice(0, 6).map(i => {
    const n = S.notes[i], p = run.per[i];
    const e = p.voiced < 0.05 ? 'silent' : p.errN > 0.02 ? ((p.errSum / p.errN > 0 ? '+' : '') + Math.round(p.errSum / p.errN) + '¢') : 'off';
    return `<span class="miss">${n.lyr ? esc(n.lyr.replace(/-$/, '')) + ' · ' : ''}${noteName(n.midi)} · ${e}</span>`;
  }).join('');
  el.innerHTML = `
    <div class="rtop">
      <div class="ring"><svg viewBox="0 0 86 86"><circle cx="43" cy="43" r="36" fill="none" stroke="#2b2c4b" stroke-width="9"/><circle cx="43" cy="43" r="36" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C * res.score / 100} ${C}"/></svg><b>${res.score}</b></div>
      <div><h3>${verdict}</h3><p>${res.hits} of ${res.total} notes hit${bests[S.item.key] === res.score && res.score > 0 ? ' · new best!' : ''}</p></div>
    </div>
    <div class="stats">
      <div class="stat"><b>${Math.round(res.inTune * 100)}%</b><span>of the time in tune</span></div>
      <div class="stat"><b>${Math.round(res.coverage * 100)}%</b><span>of note length sung</span></div>
      <div class="stat"><b>${tend}</b><span>pitch tendency</span></div>
    </div>
    <ul class="tips">${tipsFor(res).map(x => `<li>${x}</li>`).join('')}</ul>
    ${misses ? `<div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px">Trickiest notes</div><div class="misses">${misses}</div>` : ''}
    <div class="rbtns">
      <button class="btn" id="rAgain">↻ Try again</button>
      ${res.misses.length ? '<button class="btn sec" id="rMiss">Practise from first miss</button>' : ''}
      <button class="btn sec" id="rListen" disabled>▶ Listen back</button>
    </div>`;
  $('#rAgain').onclick = () => { S.reviewT = run.from; start('score'); };
  if ($('#rMiss')) $('#rMiss').onclick = () => { S.reviewT = Math.max(0, S.notes[res.misses[0]].t - 1.2); start('score'); };
  $('#rListen').onclick = listenBack;
  refreshResultButtons();
}
function refreshResultButtons() {
  const b = $('#rListen'); if (!b) return; const run = S.lastRun;
  if (run && run.take) { b.disabled = false; b.textContent = '▶ Listen back'; }
  else if (run && run.takeErr) { b.disabled = true; b.textContent = 'No recording'; }
  else if (!window.MediaRecorder) { b.hidden = true; }
  else { b.disabled = true; b.textContent = 'Preparing…'; }
}
function recordBest(res) {
  const k = S.item.key; if (bests[k] == null || res.score > bests[k]) { bests[k] = res.score; store.set('bests', bests); renderLibrary(); }
}
let toastT = 0;
function toast(msg, ms = 3200) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms); }
function progress(title, p) { $('#progSheet').hidden = false; $('#progTitle').textContent = title; $('#progBar').style.width = Math.round(clamp(p || 0, 0, 1) * 100) + '%'; }
function hideProgress() { $('#progSheet').hidden = true; }
async function wakeLock(on) {
  try {
    if (on && 'wakeLock' in navigator && !S.wake) S.wake = await navigator.wakeLock.request('screen');
    if (!on && S.wake) { S.wake.release(); S.wake = null; }
  } catch (e) {}
}

/* ---------------- settings UI ---------------- */
function syncSettingsUI() {
  $('#sFit').checked = settings.fit; $('#sFit').disabled = !settings.range;
  $('#rangeLbl').textContent = settings.range ? `Your range: ${noteName(settings.range[0])}–${noteName(settings.range[1])}` : 'Set your range first (Range button at the top)';
  $('#tVal').textContent = (settings.transpose > 0 ? '+' : '') + settings.transpose;
  $('#sSpeed').value = settings.speed; $('#spVal').textContent = Math.round(settings.speed * 100) + '% (melodies)';
  $('#sVol').value = settings.guideVol;
  $$('#sTol button').forEach(b => b.classList.toggle('on', +b.dataset.v === settings.tol));
  $('#sOct').checked = settings.anyOct; $('#sEar').checked = settings.earphones; $('#sCount').checked = settings.countIn;
  $('#sReps').value = String(settings.reps);
  $('#sVocals').value = settings.vocals; $('#vocalsVal').textContent = Math.round(settings.vocals * 100) + '%';
  $('#sSync').value = settings.syncMs; $('#syncVal').textContent = (settings.syncMs > 0 ? '+' : '') + settings.syncMs + ' ms';
  $('#sSens').value = settings.sens; $('#sensVal').textContent = SENS_LBL[settings.sens];
  $('#rangeChip').textContent = settings.range ? noteName(settings.range[0]) + '–' + noteName(settings.range[1]) : 'Range?';
  $('#rangeBanner').hidden = !!settings.range || settings.bannerOff;
}
function changed(recompile) {
  saveSettings(); syncSettingsUI();
  if (recompile && S.mode === 'idle' && S.item) { compile(); renderNowPlaying(); }
}
function bindSettings() {
  $('#sFit').onchange = e => { settings.fit = e.target.checked; changed(true); };
  $('#tDown').onclick = () => { settings.transpose = clamp(settings.transpose - 1, -12, 12); changed(true); };
  $('#tUp').onclick = () => { settings.transpose = clamp(settings.transpose + 1, -12, 12); changed(true); };
  $('#sSpeed').oninput = e => { settings.speed = +e.target.value; changed(true); };
  $('#sVol').oninput = e => { settings.guideVol = +e.target.value; if (S.guide && S.mode === 'running' && S.run.kind !== 'karaoke') S.guide.gain.gain.value = settings.guideVol; changed(false); };
  $$('#sTol button').forEach(b => b.onclick = () => { settings.tol = +b.dataset.v; changed(false); });
  $('#sOct').onchange = e => { settings.anyOct = e.target.checked; changed(false); };
  $('#sEar').onchange = e => { settings.earphones = e.target.checked; changed(false); if (mic.on) micOn(); };
  $('#sCount').onchange = e => { settings.countIn = e.target.checked; changed(false); };
  $('#sReps').onchange = e => { settings.reps = +e.target.value; changed(true); };
  $('#sVocals').oninput = e => {
    settings.vocals = +e.target.value; changed(false);
    const vx = S.guide && S.guide.vox; if (vx) { vx.orig.gain.value = settings.vocals; vx.inst.gain.value = 1 - settings.vocals; }
  };
  $('#sSync').oninput = e => { settings.syncMs = +e.target.value; changed(false); };
  $('#sSens').oninput = e => { settings.sens = +e.target.value; changed(false); };
}

/* ---------------- wiring ---------------- */
function init() {
  $('#ver').textContent = 'v' + VERSION;
  $$('.tabs button').forEach(b => b.onclick = () => { S.tab = b.dataset.tab; setTabUI(); renderLibrary(); });
  $('#btnSing').onclick = () => start('score');
  $('#btnListen').onclick = () => start('listen');
  $('#btnKaraoke').onclick = () => start('karaoke');
  $('#vocalsOnly').onclick = () => start('vocals');
  $('#btnStop').onclick = () => finish();
  $('#micBtn').onclick = async () => { if (mic.on) { if (S.mode === 'running' && S.run && S.run.mic) return toast('Stop first to turn the mic off.'); micOff(); } else await micOn(); };
  $('#scrub').oninput = e => { S.reviewT = +e.target.value; updateTransport(); };
  $('#uploadTake').onclick = () => $('#takeFile').click();
  $('#takeFile').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) scoreUpload(f); };
  $('#trackFile').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) onTrackFile(f); };
  $('#rangeChip').onclick = openRange; $('#bannerRange').onclick = openRange;
  $('#rfCancel').onclick = closeRange;
  $('#rfRedo').onclick = () => { RF.step = 1; RF.lo = RF.hi = null; RF.ref = null; renderRF(); };
  $('#rfNext').onclick = () => {
    if (RF.step < 3) { RF.step++; RF.ref = null; renderRF(); return; }
    settings.range = [Math.min(RF.lo, RF.hi), Math.max(RF.lo, RF.hi)]; settings.fit = true; settings.transpose = 0;
    closeRange(); changed(true); renderLibrary(); toast('Range saved. Melodies now fit your voice.');
  };
  $('#helpBtn').onclick = () => { $('#helpSheet').hidden = false; };
  $$('[data-close]').forEach(b => b.onclick = () => { b.closest('.sheet').hidden = true; });
  $('#helpSheet').onclick = e => { if (e.target.id === 'helpSheet') e.target.hidden = true; };
  bindSettings(); syncSettingsUI();
  // install prompt
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('#installBtn').hidden = false; });
  $('#installBtn').onclick = async () => { if (!deferred) return; deferred.prompt(); try { await deferred.userChoice; } catch (e) {} deferred = null; $('#installBtn').hidden = true; };
  window.addEventListener('appinstalled', () => { $('#installBtn').hidden = true; });
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.mode !== 'idle') finish(); });
  setTabUI(); renderLibrary(); renderNowPlaying(); updateTransport(); updateMicUI();
  loadTracks();
  selectItem(SONGS[0]);
  requestAnimationFrame(frameLoop);
}
init();

// exposed for testing
window.__SAS = { melodyExtract, S, settings, yin, pitchTrack, contourToNotes, align, parseMelody, SONGS, WARMUPS, buildWarmup, results, newRun, addFrame, compile, selectItem, start, finish, mic, live };
