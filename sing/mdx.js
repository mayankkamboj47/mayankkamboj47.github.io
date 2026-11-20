'use strict';
/* Sing-Along Studio — AI vocal separation with Ultimate Vocal Remover's MDX-Net models (MIT),
   run on the device with ONNX Runtime Web (WebGPU when available, otherwise WebAssembly).
   The network maps a stereo spectrogram chunk to the spectrogram of the instrumental;
   this file does the PyTorch-compatible STFT/iSTFT and the chunking around it. */
(function (root) {
  const ORT_VER = '1.20.1';
  const ORT_BASE = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VER}/dist/`;
  const MODELS = {
    hq3: { name: 'UVR-MDX-NET Inst HQ 3', url: 'https://huggingface.co/debugzxcv/uvr/resolve/main/UVR-MDX-NET-Inst_HQ_3.onnx', nfft: 6144, dimF: 3072, dimT: 256, hop: 1024, compensate: 1.022, stem: 'inst', mb: 67 },
    kara2: { name: 'UVR-MDX-NET Karaoke 2', url: 'https://huggingface.co/debugzxcv/uvr/resolve/main/UVR_MDXNET_KARA_2.onnx', nfft: 5120, dimF: 2048, dimT: 256, hop: 1024, compensate: 1.065, stem: 'inst', mb: 53 },
  };
  const SR = 44100;

  /* ---------- mixed-radix complex FFT (N = 2^a·3^b·5^c) ---------- */
  function makeFFT(N) {
    const factors = []; let n = N;
    for (const p of [4, 2, 3, 5]) while (n % p === 0) { factors.push(p); n /= p; }
    if (n !== 1) throw new Error('FFT size ' + N + ' not supported');
    const twr = new Float64Array(N), twi = new Float64Array(N);
    for (let k = 0; k < N; k++) { twr[k] = Math.cos(-2 * Math.PI * k / N); twi[k] = Math.sin(-2 * Math.PI * k / N); }
    const ar = new Float64Array(5), ai = new Float64Array(5);
    const rootsR = {}, rootsI = {};
    for (const p of [2, 3, 4, 5]) { rootsR[p] = new Float64Array(p * p); rootsI[p] = new Float64Array(p * p); for (let q = 0; q < p; q++) for (let s = 0; s < p; s++) { rootsR[p][q * p + s] = Math.cos(-2 * Math.PI * q * s / p); rootsI[p][q * p + s] = Math.sin(-2 * Math.PI * q * s / p); } }
    function rec(xr, xi, off, stride, n, fi, yr, yi, yo) {
      if (n === 1) { yr[yo] = xr[off]; yi[yo] = xi[off]; return; }
      const p = factors[fi], m = n / p;
      for (let q = 0; q < p; q++) rec(xr, xi, off + q * stride, stride * p, m, fi + 1, yr, yi, yo + q * m);
      const tstep = N / n, RR = rootsR[p], RI = rootsI[p];
      for (let k = 0; k < m; k++) {
        for (let q = 0; q < p; q++) {
          const idx = yo + q * m + k, t = (q * k * tstep) % N, wr = twr[t], wi = twi[t];
          const vr = yr[idx], vi = yi[idx]; ar[q] = vr * wr - vi * wi; ai[q] = vr * wi + vi * wr;
        }
        for (let s = 0; s < p; s++) {
          let sr = 0, si = 0;
          for (let q = 0; q < p; q++) { const cr = RR[q * p + s], ci = RI[q * p + s]; sr += ar[q] * cr - ai[q] * ci; si += ar[q] * ci + ai[q] * cr; }
          yr[yo + s * m + k] = sr; yi[yo + s * m + k] = si;
        }
      }
    }
    const tr = new Float64Array(N), ti = new Float64Array(N);
    // forward DFT, in place on (re, im)
    return function fft(re, im) { rec(re, im, 0, 1, N, 0, tr, ti, 0); re.set(tr); im.set(ti); };
  }

  /* ---------- torch.stft / torch.istft (center=True, reflect pad, periodic Hann) ---------- */
  function makeSTFT(nfft, hop, dimT) {
    const fft = makeFFT(nfft), nb = nfft / 2 + 1, half = nfft / 2;
    const win = new Float64Array(nfft); for (let i = 0; i < nfft; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / nfft);
    const re = new Float64Array(nfft), im = new Float64Array(nfft);
    const chunk = hop * (dimT - 1), padded = chunk + nfft;
    const pl = new Float64Array(padded), pr = new Float64Array(padded);
    // window-square envelope for iSTFT normalisation (same for every chunk)
    const env = new Float64Array(padded);
    for (let t = 0; t < dimT; t++) for (let i = 0; i < nfft; i++) env[t * hop + i] += win[i] * win[i];
    const reflect = (src, o, out) => { // out[j] = src[o + j - half] with reflect padding at the chunk edges
      for (let j = 0; j < padded; j++) { let x = j - half; if (x < 0) x = -x; else if (x >= chunk) x = 2 * (chunk - 1) - x; out[j] = src[o + x]; }
    };
    // spec layout = model input: [4][dimF][dimT] = L.re, L.im, R.re, R.im
    function forward(L, R, o, dimF, spec) {
      reflect(L, o, pl); reflect(R, o, pr);
      const cs = dimF * dimT;
      for (let t = 0; t < dimT; t++) {
        const s0 = t * hop;
        for (let i = 0; i < nfft; i++) { re[i] = pl[s0 + i] * win[i]; im[i] = pr[s0 + i] * win[i]; }
        fft(re, im);
        for (let k = 0; k < dimF; k++) {
          const a = re[k], b = im[k], c = re[(nfft - k) % nfft], d = im[(nfft - k) % nfft];
          const idx = k * dimT + t;
          spec[idx] = (a + c) * 0.5; spec[cs + idx] = (b - d) * 0.5;            // left
          spec[2 * cs + idx] = (b + d) * 0.5; spec[3 * cs + idx] = (c - a) * 0.5; // right
        }
      }
    }
    // inverse: spec [4][dimF][dimT] (bins ≥ dimF are zero) → chunk samples written to outL/outR at [o, o+len)
    const ol = new Float64Array(padded), or = new Float64Array(padded);
    function inverse(spec, dimF, outL, outR, o, from, to, gain) {
      ol.fill(0); or.fill(0);
      const cs = dimF * dimT;
      for (let t = 0; t < dimT; t++) {
        re.fill(0); im.fill(0);
        // pack: Z_k = L_k + i R_k for k in [0, nb); conjugate-symmetric halves for the real signals
        for (let k = 0; k < dimF && k < nb; k++) {
          const idx = k * dimT + t;
          const lr = spec[idx], li = spec[cs + idx], rr = spec[2 * cs + idx], ri = spec[3 * cs + idx];
          if (k === 0 || k === half) { re[k] = lr; im[k] = rr; continue; } // like irfft: imaginary DC/Nyquist ignored
          // Z_k = L_k + i R_k ; Z_{N-k} = conj(L_k) + i conj(R_k)
          re[k] = lr - ri; im[k] = li + rr;
          re[nfft - k] = lr + ri; im[nfft - k] = -li + rr;
        }
        // inverse via conj-FFT-conj; result real = L, imag = R (times nfft)
        for (let i = 0; i < nfft; i++) im[i] = -im[i];
        fft(re, im);
        const s0 = t * hop, sc = 1 / nfft;
        for (let i = 0; i < nfft; i++) { ol[s0 + i] += re[i] * sc * win[i]; or[s0 + i] += -im[i] * sc * win[i]; }
      }
      for (let j = from; j < to; j++) {
        const x = j + half, e = env[x] > 1e-11 ? env[x] : 1;
        outL[o + j] += ol[x] / e * gain; outR[o + j] += or[x] / e * gain;
      }
    }
    return { forward, inverse, chunk };
  }

  /* ---------- runtime & model ---------- */
  let ortPromise = null;
  function loadOrt() {
    if (root.ort) return Promise.resolve(root.ort);
    if (ortPromise) return ortPromise;
    ortPromise = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = ORT_BASE + 'ort.webgpu.min.js'; s.crossOrigin = 'anonymous';
      s.onload = () => { const o = root.ort; o.env.wasm.wasmPaths = ORT_BASE; o.env.wasm.numThreads = root.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 2) : 1; res(o); };
      s.onerror = () => { ortPromise = null; rej(new Error('Could not load the AI runtime (offline?)')); };
      document.head.appendChild(s);
    });
    return ortPromise;
  }
  async function hasWebGPU() { try { return !!(navigator.gpu && await navigator.gpu.requestAdapter()); } catch (e) { return false; } }
  async function fetchModel(m, onProgress) {
    let cache = null; try { cache = await caches.open('sing-models'); const hit = await cache.match(m.url); if (hit) { onProgress(1); return await hit.arrayBuffer(); } } catch (e) {}
    const r = await fetch(m.url); if (!r.ok) throw new Error('Model download failed (' + r.status + ')');
    const total = +r.headers.get('content-length') || m.mb * 1e6, rd = r.body.getReader(), parts = []; let got = 0;
    for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; onProgress(Math.min(1, got / total)); }
    const buf = new Uint8Array(got); let o = 0; for (const p of parts) { buf.set(p, o); o += p.length; }
    try { if (cache) await cache.put(m.url, new Response(buf, { headers: { 'content-type': 'application/octet-stream' } })); } catch (e) {}
    return buf.buffer;
  }
  const sessions = {};
  async function getSession(key, onStatus, o = {}) {
    if (sessions[key]) return sessions[key];
    const m = MODELS[key], ort = await loadOrt();
    const bytes = await fetchModel(m, p => onStatus('download', p));
    onStatus('init', 0);
    let sess = null, ep = 'wasm';
    if (o.gpu !== false && await hasWebGPU()) {
      // GPU set-up can be slow (or stall) on some phones: give up after a while and use the CPU
      const timeout = o.gpuTimeout || 180000;
      try {
        sess = await Promise.race([
          ort.InferenceSession.create(bytes, { executionProviders: ['webgpu'], graphOptimizationLevel: 'all' }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('gpu-timeout')), timeout)),
        ]);
        ep = 'webgpu';
      } catch (e) { sess = null; onStatus('gpu-failed', 0, String(e && e.message || e)); }
    }
    if (!sess) sess = await ort.InferenceSession.create(bytes, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
    return (sessions[key] = { sess, ep, m });
  }

  /* ---------- demix ---------- */
  // Core loop. run(spec Float32Array[4*dimF*dimT]) → Promise<Float32Array> (predicted instrumental spectrogram).
  async function demixWith(run, m, L, R, onProgress = () => {}) {
    const { nfft, hop, dimT, dimF, compensate } = m;
    const st = makeSTFT(nfft, hop, dimT), chunk = st.chunk, trim = nfft / 2, gen = chunk - 2 * trim;
    const n = L.length, nChunks = Math.max(1, Math.ceil(n / gen)), len = nChunks * gen + 2 * trim;
    const mixL = new Float32Array(len), mixR = new Float32Array(len);
    mixL.set(L, trim); mixR.set(R, trim);
    const outL = new Float32Array(len), outR = new Float32Array(len);
    const spec = new Float32Array(4 * dimF * dimT);
    for (let s = 0; s < nChunks; s++) {
      const i = s * gen;
      st.forward(mixL, mixR, i, dimF, spec);
      const pred = await run(spec);
      st.inverse(pred, dimF, outL, outR, i, trim, chunk - trim, compensate);
      onProgress((s + 1) / nChunks);
      await new Promise(r => setTimeout(r, 0));
    }
    return [outL.subarray(trim, trim + n), outR.subarray(trim, trim + n)];
  }
  // L, R: Float32Array at 44.1 kHz. Returns the instrumental at 44.1 kHz.
  async function separate(L, R, opts = {}) {
    const key = opts.model || 'hq3', onProgress = opts.onProgress || (() => {}), onStatus = opts.onStatus || (() => {});
    const { sess, ep, m } = await getSession(key, onStatus, opts);
    const inName = sess.inputNames[0], outName = sess.outputNames[0], t0 = performance.now(); let k = 0;
    const run = async spec => {
      const out = await sess.run({ [inName]: new root.ort.Tensor('float32', spec, [1, 4, m.dimF, m.dimT]) });
      const t = out[outName]; return t.data instanceof Float32Array ? t.data : Float32Array.from(await t.getData());
    };
    const [oL, oR] = await demixWith(run, m, L, R, p => { k++; onProgress(p, { ep, perChunk: (performance.now() - t0) / k }); });
    return { L: oL, R: oR, ep };
  }

  const isCached = async key => { try { const c = await caches.open('sing-models'); return !!(await c.match(MODELS[key].url)); } catch (e) { return false; } };
  const api = { isCached, MODELS, SR, makeFFT, makeSTFT, demixWith, separate, loadOrt, hasWebGPU, getSession };
  if (typeof module !== 'undefined') module.exports = api; else root.MDX = api;
})(typeof window !== 'undefined' ? window : globalThis);
