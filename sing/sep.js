'use strict';
/* Sing-Along Studio — karaoke vocal separation (runs in a Web Worker).
   For every STFT frame it builds a removal mask from two cues:
   1. Harmonic mask: bins at the detected melody pitch and its overtones (the singer).
   2. Centre mask: bins whose left and right channels match (lead vocals are mixed centre),
      used for the singer's consonants/breaths only while someone is singing.
   The same real gain is applied to both channels, so whatever is kept keeps its stereo image. */

function fftPlan(N) {
  const bits = Math.log2(N) | 0, rev = new Uint32Array(N), cos = new Float32Array(N / 2), sin = new Float32Array(N / 2);
  for (let i = 0; i < N; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
  for (let i = 0; i < N / 2; i++) { cos[i] = Math.cos(2 * Math.PI * i / N); sin[i] = Math.sin(2 * Math.PI * i / N); }
  return { N, rev, cos, sin };
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

/**
 * @param {Float32Array} L, R  input channels (same length)
 * @param {number} sr          sample rate
 * @param {Float32Array} f0t, f0m  melody contour: times (s) and MIDI pitches of voiced frames, sorted by time
 * @param {{strength?:number, mono?:boolean, centre?:number}} opts
 * @returns {[Float32Array, Float32Array]} instrumental L, R
 */
function separate(L, R, sr, f0t, f0m, opts = {}, onProgress = () => {}) {
  const strength = opts.strength == null ? 0.97 : opts.strength;
  const mono = !!opts.mono, centreW = opts.centre == null ? 0.55 : opts.centre;
  const minW = opts.minW == null ? 2.6 : opts.minW, relW = opts.relW == null ? 0.03 : opts.relW;
  const base = opts.base == null ? 0.6 : opts.base, tail = opts.tail == null ? 0.12 : opts.tail;
  const tailW = opts.tailW == null ? 0.75 : opts.tailW, smooth = opts.smooth == null ? 0.4 : opts.smooth;
  const N = sr > 30000 ? 4096 : 2048, H = N / 4, half = N / 2, P = fftPlan(N), binHz = sr / N, len = L.length;
  const win = new Float32Array(N); for (let i = 0; i < N; i++) win[i] = Math.sin(Math.PI * i / N); // sqrt-Hann
  const outL = new Float32Array(len), outR = new Float32Array(len);
  const re = new Float32Array(N), im = new Float32Array(N);
  const g = new Float32Array(half + 1), gPrev = new Float32Array(half + 1).fill(1), gs = new Float32Array(half + 1), v = new Float32Array(half + 1);
  const maxHz = Math.min(11000, sr / 2 - binHz), kMax = Math.floor(maxHz / binHz);
  const kC0 = Math.floor(1200 / binHz), kC1 = Math.min(half - 1, Math.floor(10000 / binHz));
  const nFrames = Math.ceil((len + N - H) / H);
  const m2f = m => 440 * Math.pow(2, (m - 69) / 12);
  const extra = (opts.apply || []).map(([a, b]) => ({ a, b, oa: new Float32Array(len), ob: new Float32Array(len) }));
  const re2 = extra.length ? new Float32Array(N) : null, im2 = extra.length ? new Float32Array(N) : null;
  let fi = 0, ai = 0;
  for (let f = 0; f < nFrames; f++) {
    if (f % 256 === 0) onProgress(f / nFrames);
    const s0 = f * H - (N - H);
    for (let i = 0; i < N; i++) { const x = s0 + i; if (x >= 0 && x < len) { re[i] = L[x] * win[i]; im[i] = R[x] * win[i]; } else { re[i] = 0; im[i] = 0; } }
    fft(P, re, im);
    const tc = (s0 + N / 2) / sr;
    // melody pitch at this frame (contour hop is 20 ms); hold it briefly so reverb tails go too
    while (fi < f0t.length && f0t[fi] < tc - 0.025) fi++;
    let f0 = 0, fPrev = 0;
    if (fi < f0t.length && Math.abs(f0t[fi] - tc) <= 0.025) f0 = m2f(f0m[fi]);
    else if (fi > 0 && tc - f0t[fi - 1] <= tail) f0 = m2f(f0m[fi - 1]);
    { // the pitch sung ~0.1 s ago (previous note still ringing in the reverb)
      let j = fi - 1; while (j >= 0 && f0t[j] > tc - 0.1) j--;
      if (j >= 0 && tc - f0t[j] <= 0.1 + tail) fPrev = m2f(f0m[j]);
      if (fPrev && f0 && Math.abs(fPrev / f0 - 1) < 0.03) fPrev = 0;
    }
    // vocal activity: any voiced contour frame within ±0.2 s
    while (ai < f0t.length && f0t[ai] < tc - 0.2) ai++;
    const active = ai < f0t.length && f0t[ai] <= tc + 0.2;
    // harmonic comb around the melody pitch (flat top, tapered edges)
    v.fill(0);
    const comb = (fz, amp0) => {
      for (let h = 1; ; h++) {
        const fh = h * fz; if (fh > maxHz) break;
        const c = fh / binHz, w = Math.max(minW, fh * relW / binHz), a = Math.max(1, Math.floor(c - w)), b = Math.min(kMax, Math.ceil(c + w));
        for (let k = a; k <= b; k++) { const d = Math.abs(k - c) / w; if (d >= 1) continue; const val = (d < 0.5 ? 1 : 1 - Math.pow((d - 0.5) / 0.5, 2)) * amp0; if (val > v[k]) v[k] = val; }
      }
    };
    if (f0 > 0) comb(f0, 1);
    if (fPrev > 0) comb(fPrev, tailW);
    g[0] = 1; g[half] = 1;
    for (let k = 1; k < half; k++) {
      let r = 0;
      if (k <= kMax && (v[k] > 0 || (active && !mono && k >= kC0 && k <= kC1))) {
        const a = re[k], b = im[k], c = re[N - k], d = im[N - k];
        const xr = (a + c) * 0.5, xi = (b - d) * 0.5, yr = (b + d) * 0.5, yi = (c - a) * 0.5; // left, right
        const px = xr * xr + xi * xi, py = yr * yr + yi * yi;
        const sim = 2 * (xr * yr + xi * yi) / (px + py + 1e-20); // 1 = identical in both channels
        let cen = mono ? 1 : (sim - 0.55) / 0.4; cen = cen < 0 ? 0 : cen > 1 ? 1 : cen;
        const rh = v[k] * (mono ? 1 : base + (1 - base) * cen);
        const rc = (active && !mono && k >= kC0 && k <= kC1) ? cen * cen * centreW : 0;
        r = rh > rc ? rh : rc;
      }
      g[k] = 1 - r * strength;
    }
    // smooth across time (less "musical noise") and frequency
    for (let k = 0; k <= half; k++) { gs[k] = (1 - smooth) * g[k] + smooth * gPrev[k]; gPrev[k] = g[k]; }
    for (let k = 1; k < half; k++) g[k] = 0.25 * gs[k - 1] + 0.5 * gs[k] + 0.25 * gs[k + 1];
    g[0] = gs[0]; g[half] = gs[half];
    for (const x of extra) { // test hook
      for (let i = 0; i < N; i++) { const q = s0 + i; if (q >= 0 && q < len) { re2[i] = x.a[q] * win[i]; im2[i] = x.b[q] * win[i]; } else { re2[i] = 0; im2[i] = 0; } }
      fft(P, re2, im2);
      re2[0] *= g[0]; im2[0] *= g[0]; re2[half] *= g[half]; im2[half] *= g[half];
      for (let k = 1; k < half; k++) { const q = g[k]; re2[k] *= q; im2[k] *= q; re2[N - k] *= q; im2[N - k] *= q; }
      for (let i = 0; i < N; i++) im2[i] = -im2[i];
      fft(P, re2, im2);
      for (let i = 0; i < N; i++) { const q = s0 + i; if (q < 0 || q >= len) continue; const w = win[i] * 0.5 / N; x.oa[q] += re2[i] * w; x.ob[q] -= im2[i] * w; }
    }
    // the same real gain on L and R == the same gain on the packed spectrum
    re[0] *= g[0]; im[0] *= g[0]; re[half] *= g[half]; im[half] *= g[half];
    for (let k = 1; k < half; k++) { const q = g[k]; re[k] *= q; im[k] *= q; re[N - k] *= q; im[N - k] *= q; }
    // inverse FFT via conjugation; output real part = L, imaginary = R
    for (let i = 0; i < N; i++) im[i] = -im[i];
    fft(P, re, im);
    const sc = 0.5 / N; // 0.5: sqrt-Hann² at 75% overlap sums to 2
    for (let i = 0; i < N; i++) {
      const x = s0 + i; if (x < 0 || x >= len) continue;
      const w = win[i] * sc; outL[x] += re[i] * w; outR[x] -= im[i] * w;
    }
  }
  onProgress(1);
  if (extra.length) return [outL, outR, extra.map(x => [x.oa, x.ob])];
  return [outL, outR];
}

if (typeof self !== 'undefined' && typeof self.postMessage === 'function' && typeof window === 'undefined') {
  self.onmessage = e => {
    const { L, R, sr, f0t, f0m, opts } = e.data;
    try {
      let last = 0;
      const [oL, oR] = separate(L, R, sr, f0t, f0m, opts, p => { if (p - last > 0.02 || p === 1) { last = p; self.postMessage({ type: 'progress', p }); } });
      self.postMessage({ type: 'done', L: oL, R: oR }, [oL.buffer, oR.buffer]);
    } catch (err) { self.postMessage({ type: 'error', message: String(err && err.message || err) }); }
  };
}
if (typeof module !== 'undefined') module.exports = { separate };
