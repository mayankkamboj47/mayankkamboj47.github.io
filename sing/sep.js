'use strict';
/* Sing-Along Studio — karaoke vocal separation (runs in a Web Worker).

   1. Voice detector: the melody line is cut into continuous pitch trajectories and each one is
      scored for "voice-ness" (voices wobble, glide and sit off the equal-tempered grid; piano and
      guitar notes are steady and in tune). Scores are averaged over ±2 s, so a whole phrase is
      judged together. Where it isn't voice, the audio is left untouched.
   2. Inside voice regions, per STFT bin:
      - Accompaniment estimate A = time-median of the spectrum over ~0.45 s (steady tones)
        plus a frequency-median (drum hits); anything louder than A is treated as voice
        (Wiener-style gain).
      - Harmonic comb at the singer's pitch and overtones, for held notes the median would keep.
   The same real gain is applied to both channels, so what remains keeps its stereo image. */

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

/* ---------- voice detector ---------- */
const VOICE_MODEL = { w: [0.955, 1.115, 2.515, -4.28, 0.254, 1.971], b: -15.331 }; // fitted on labelled speech/singing vs guitar/piano segments
function voiceProb(f0t, f0m, f0s, opts = {}) {
  const STEP = 0.02, half = opts.window == null ? 2 : opts.window, pThr = opts.pThr == null ? 0.7 : opts.pThr;
  const n0 = f0t.length; const T = n0 ? f0t[n0 - 1] + 1 : 1, n = Math.ceil(T / STEP) + 1;
  // tuning offset of the whole track (circular mean of the fractional pitch)
  let cs = 0, sn = 0; for (let i = 0; i < n0; i++) { const a = 2 * Math.PI * (f0m[i] - Math.round(f0m[i])); cs += Math.cos(a); sn += Math.sin(a); }
  const tun = Math.atan2(sn, cs) / (2 * Math.PI);
  const sum = new Float32Array(n), cnt = new Float32Array(n);
  let i = 0;
  while (i < n0) { // continuous trajectories
    let j = i + 1;
    while (j < n0 && f0t[j] - f0t[j - 1] <= 0.065 && Math.abs(f0m[j] - f0m[j - 1]) < 1.2) j++;
    const len = j - i, dur = f0t[j - 1] - f0t[i] + 0.02;
    let p = 0.3;
    if (dur >= 0.1) {
      let jit = 0, tv = 0, off = 0, big = 0;
      for (let k = i; k < j; k++) {
        let a = 0, c = 0; for (let q = Math.max(i, k - 4); q <= Math.min(j - 1, k + 4); q++) { a += f0m[q]; c++; }
        jit += ((f0m[k] - a / c) * 100) ** 2;
        if (k > i) { const st = Math.abs(f0m[k] - f0m[k - 1]) * 100; tv += st; if (st > 60) big += st; } // voices glide; note flips jump
        const d = (f0m[k] - tun) - Math.round(f0m[k] - tun); off += Math.abs(d) * 100;
      }
      const jump = tv > 0 ? big / tv : 0;
      jit = Math.sqrt(jit / len); tv /= dur; off /= len;
      let slope = 0;
      if (f0s) { // loudness trend, dB/s
        let tm = 0, ym = 0; for (let k = i; k < j; k++) { tm += f0t[k]; ym += 20 * Math.log10(Math.max(1e-9, f0s[k])); } tm /= len; ym /= len;
        let num = 0, den = 0; for (let k = i; k < j; k++) { const dt = f0t[k] - tm; num += dt * (20 * Math.log10(Math.max(1e-9, f0s[k])) - ym); den += dt * dt; }
        slope = den > 0 ? num / den : 0;
      }
      const x = [Math.log(jit + 1), Math.log(tv + 1), Math.log(off + 1), jump, Math.max(-3, Math.min(3, slope / 10)), Math.min(dur, 1)];
      const z = x.reduce((a, v, q) => a + v * VOICE_MODEL.w[q], VOICE_MODEL.b);
      p = 1 / (1 + Math.exp(-z));
    }
    const conf = p > pThr ? 1 : 0; // confidently voice-like trajectory
    for (let k = i; k < j; k++) { const g = Math.round(f0t[k] / STEP); if (g < n) { sum[g] += conf; cnt[g] += 1; } }
    i = j;
  }
  // share of the melody line (within ±half s) that is confidently voice-like, then a soft threshold
  const K = Math.round(half / STEP), out = new Float32Array(n);
  let S = 0, C = 0; for (let k = 0; k < Math.min(n, K); k++) { S += sum[k]; C += cnt[k]; }
  const lo = opts.lo == null ? 0.14 : opts.lo, hi = opts.hi == null ? 0.26 : opts.hi;
  for (let k = 0; k < n; k++) {
    if (k + K < n) { S += sum[k + K]; C += cnt[k + K]; }
    if (k - K - 1 >= 0) { S -= sum[k - K - 1]; C -= cnt[k - K - 1]; }
    const sp = C >= 0.1 * (2 * K + 1) ? S / C : 0;
    const u = Math.max(0, Math.min(1, (sp - lo) / (hi - lo))); out[k] = u * u * (3 - 2 * u);
  }
  return { grid: out, step: STEP };
}

/* k-th smallest of a small array (in place); default = median */
function median(a, n, frac = 0.5) {
  let lo = 0, hi = n - 1; const k = Math.min(n - 1, Math.max(0, Math.round((n - 1) * frac)));
  while (lo < hi) {
    const piv = a[(lo + hi) >> 1]; let i = lo, j = hi;
    while (i <= j) { while (a[i] < piv) i++; while (a[j] > piv) j--; if (i <= j) { const t = a[i]; a[i] = a[j]; a[j] = t; i++; j--; } }
    if (k <= j) hi = j; else if (k >= i) lo = i; else break;
  }
  return a[k];
}

/**
 * @param {Float32Array} L, R       input channels
 * @param {number} sr
 * @param {Float32Array} f0t, f0m, f0s  melody contour (time s, MIDI pitch, salience) of voiced frames
 * @returns {[Float32Array, Float32Array]} instrumental L, R  (+ [stems] if opts.apply, + voice grid if opts.debug)
 */
function separate(L, R, sr, f0t, f0m, f0s, opts = {}, onProgress = () => {}) {
  const strength = opts.strength == null ? 1 : opts.strength;
  const mono = !!opts.mono;
  const minW = opts.minW == null ? 2.6 : opts.minW, relW = opts.relW == null ? 0.03 : opts.relW;
  const base = opts.base == null ? 0.6 : opts.base, tail = opts.tail == null ? 0.12 : opts.tail, tailW = opts.tailW == null ? 0.75 : opts.tailW;
  const smooth = opts.smooth == null ? 0.3 : opts.smooth;
  const over = opts.over == null ? 1 : opts.over;      // >1 removes more (accompaniment estimate scaled down)
  const perc = opts.perc == null ? 0.5 : opts.perc;    // how much the frequency-median (drums) protects
  const wien = opts.wiener == null ? 1 : opts.wiener;  // 0 = comb only
  const pct = opts.pct == null ? 0.5 : opts.pct;       // percentile of the time filter (lower = removes more)
  const vp = opts.voice || voiceProb(f0t, f0m, f0s, opts);
  const N = sr > 30000 ? 4096 : 2048, H = N / 4, half = N / 2, P = fftPlan(N), binHz = sr / N, len = L.length;
  const win = new Float32Array(N); for (let i = 0; i < N; i++) win[i] = Math.sin(Math.PI * i / N); // sqrt-Hann
  const outL = new Float32Array(len), outR = new Float32Array(len);
  const maxHz = Math.min(12000, sr / 2 - binHz), kMax = Math.floor(maxHz / binHz), kW0 = Math.floor(120 / binHz);
  const M = kMax + 1;
  const LT = opts.medFrames == null ? Math.round(0.22 * sr / H) : opts.medFrames;   // ±frames for the time median
  const KF = opts.medBins == null ? Math.max(4, Math.round(80 / binHz)) : opts.medBins; // ±bins for the frequency median
  const nFrames = Math.ceil((len + N - H) / H);
  const m2f = m => 440 * Math.pow(2, (m - 69) / 12);
  // ring buffers: magnitudes (2LT+1 frames) and packed spectra (LT+1 frames) so frame f-LT can be synthesised
  const RM = 2 * LT + 1, mags = new Float32Array(RM * M), RS = LT + 1, sRe = new Float32Array(RS * N), sIm = new Float32Array(RS * N);
  const re = new Float32Array(N), im = new Float32Array(N), tmp = new Float32Array(Math.max(RM, 2 * KF + 1));
  const g = new Float32Array(half + 1), gPrev = new Float32Array(half + 1).fill(1), gs = new Float32Array(half + 1), v = new Float32Array(half + 1), A = new Float32Array(M);
  const extra = (opts.apply || []).map(([a, b]) => ({ a, b, oa: new Float32Array(len), ob: new Float32Array(len), re: new Float32Array(RS * N), im: new Float32Array(RS * N) }));
  const voiceAt = t => { const x = t / vp.step, i = Math.floor(x); if (i < 0 || i >= vp.grid.length - 1) return 0; return vp.grid[i] + (vp.grid[i + 1] - vp.grid[i]) * (x - i); };
  const frameStart = f => f * H - (N - H);
  const loadFrame = (a, b, f, R1, I1) => {
    const s0 = frameStart(f), o = (f % RS) * N;
    for (let i = 0; i < N; i++) { const x = s0 + i; if (f < nFrames && x >= 0 && x < len) { re[i] = a[x] * win[i]; im[i] = b[x] * win[i]; } else { re[i] = 0; im[i] = 0; } }
    fft(P, re, im);
    for (let i = 0; i < N; i++) { R1[o + i] = re[i]; I1[o + i] = im[i]; }
  };
  const synth = (f, R1, I1, oa, ob) => {
    const s0 = frameStart(f), o = (f % RS) * N;
    for (let i = 0; i < N; i++) { re[i] = R1[o + i]; im[i] = I1[o + i]; }
    re[0] *= g[0]; im[0] *= g[0]; re[half] *= g[half]; im[half] *= g[half];
    for (let k = 1; k < half; k++) { const q = g[k]; re[k] *= q; im[k] *= q; re[N - k] *= q; im[N - k] *= q; }
    for (let i = 0; i < N; i++) im[i] = -im[i];
    fft(P, re, im);
    const sc = 0.5 / N;
    for (let i = 0; i < N; i++) { const x = s0 + i; if (x < 0 || x >= len) continue; const w = win[i] * sc; oa[x] += re[i] * w; ob[x] -= im[i] * w; }
  };
  let fi = 0;
  for (let step = 0; step < nFrames + LT; step++) {
    if (step % 256 === 0) onProgress(step / (nFrames + LT));
    // analysis of frame `step` → rings (frames past the end are silent)
    loadFrame(L, R, step, sRe, sIm);
    for (const x of extra) loadFrame(x.a, x.b, step, x.re, x.im);
    {
      const o = (step % RS) * N, mo = (step % RM) * M;
      for (let k = 0; k <= kMax; k++) {
        const a = sRe[o + k], b = sIm[o + k], c = sRe[o + ((N - k) % N)], d = sIm[o + ((N - k) % N)];
        const xr = (a + c) * 0.5, xi = (b - d) * 0.5, yr = (b + d) * 0.5, yi = (c - a) * 0.5;
        mags[mo + k] = 0.5 * (Math.sqrt(xr * xr + xi * xi) + Math.sqrt(yr * yr + yi * yi));
      }
    }
    // synthesis of frame f = step - LT
    const f = step - LT; if (f < 0) continue;
    const tc = (frameStart(f) + N / 2) / sr, pv = voiceAt(tc) * strength;
    g.fill(1);
    if (pv > 0.01) {
      const o = (f % RS) * N, mo = (f % RM) * M;
      // melody pitch now and ~0.1 s ago (reverb tail)
      while (fi < f0t.length && f0t[fi] < tc - 0.025) fi++;
      let f0 = 0, fPrev = 0;
      if (fi < f0t.length && Math.abs(f0t[fi] - tc) <= 0.025) f0 = m2f(f0m[fi]);
      else if (fi > 0 && tc - f0t[fi - 1] <= tail) f0 = m2f(f0m[fi - 1]);
      { let j = fi - 1; while (j >= 0 && f0t[j] > tc - 0.1) j--; if (j >= 0 && tc - f0t[j] <= 0.1 + tail) fPrev = m2f(f0m[j]); if (fPrev && f0 && Math.abs(fPrev / f0 - 1) < 0.03) fPrev = 0; }
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
      // accompaniment estimate: time median (steady tones) + some frequency median (hits)
      for (let k = kW0; k <= kMax; k++) {
        for (let q = 0; q < RM; q++) tmp[q] = mags[q * M + k];
        const ht = median(tmp, RM, pct);
        let c = 0; for (let q = Math.max(kW0, k - KF); q <= Math.min(kMax, k + KF); q++) tmp[c++] = mags[mo + q];
        const pf = median(tmp, c) * perc;
        A[k] = Math.sqrt(ht * ht + pf * pf) / over;
      }
      for (let k = 1; k < half && k <= kMax; k++) {
        const a = sRe[o + k], b = sIm[o + k], c = sRe[o + N - k], d = sIm[o + N - k];
        const xr = (a + c) * 0.5, xi = (b - d) * 0.5, yr = (b + d) * 0.5, yi = (c - a) * 0.5;
        const px = xr * xr + xi * xi, py = yr * yr + yi * yi;
        let cen = 1;
        if (!mono) { const sim = 2 * (xr * yr + xi * yi) / (px + py + 1e-20); cen = Math.max(0, Math.min(1, (sim - 0.55) / 0.4)); }
        const gC = 1 - v[k] * (mono ? 1 : base + (1 - base) * cen);
        let gW = 1;
        if (wien > 0 && k >= kW0) { const X = mags[mo + k]; gW = X > 1e-12 ? Math.min(1, (A[k] * A[k]) / (X * X)) : 1; gW = 1 - wien * (1 - gW); }
        g[k] = 1 - pv * (1 - Math.min(gC, gW));
      }
    }
    for (let k = 0; k <= half; k++) { gs[k] = (1 - smooth) * g[k] + smooth * gPrev[k]; gPrev[k] = g[k]; }
    for (let k = 1; k < half; k++) g[k] = 0.25 * gs[k - 1] + 0.5 * gs[k] + 0.25 * gs[k + 1];
    g[0] = gs[0]; g[half] = gs[half];
    synth(f, sRe, sIm, outL, outR);
    for (const x of extra) synth(f, x.re, x.im, x.oa, x.ob);
  }
  onProgress(1);
  const res = [outL, outR];
  if (extra.length) res.push(extra.map(x => [x.oa, x.ob]));
  if (opts.debug) res.push(vp);
  return res;
}

if (typeof self !== 'undefined' && typeof self.postMessage === 'function' && typeof window === 'undefined') {
  self.onmessage = e => {
    const { L, R, sr, f0t, f0m, f0s, opts } = e.data;
    try {
      let last = 0;
      const [oL, oR] = separate(L, R, sr, f0t, f0m, f0s, opts, p => { if (p - last > 0.02 || p === 1) { last = p; self.postMessage({ type: 'progress', p }); } });
      self.postMessage({ type: 'done', L: oL, R: oR }, [oL.buffer, oR.buffer]);
    } catch (err) { self.postMessage({ type: 'error', message: String(err && err.message || err) }); }
  };
}
if (typeof module !== 'undefined') module.exports = { separate, voiceProb };
