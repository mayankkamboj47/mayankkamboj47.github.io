'use strict';
/* Runs the MDX-Net separation off the main thread so the app stays responsive. */
const ORT_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
let ready = null;
function init(threads) {
  if (!ready) ready = (async () => {
    importScripts(ORT_BASE + 'ort.webgpu.min.js');
    self.ort.env.wasm.wasmPaths = ORT_BASE;
    self.ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.max(1, threads || 1) : 1;
    importScripts('mdx.js?v=0.4');
  })();
  return ready;
}
self.onmessage = async e => {
  const { cmd, L, R, model, id, threads, gpu } = e.data;
  try {
    await init(threads);
    if (cmd === 'separate') {
      const res = await self.MDX.separate(L, R, {
        model, gpu,
        onStatus: (s, p, msg) => self.postMessage({ type: 'status', id, s, p, msg }),
        onProgress: (p, info) => self.postMessage({ type: 'progress', id, p, info }),
      });
      const oL = res.L.slice(), oR = res.R.slice();
      self.postMessage({ type: 'done', id, L: oL, R: oR, ep: res.ep }, [oL.buffer, oR.buffer]);
    }
  } catch (err) { self.postMessage({ type: 'error', id, message: String(err && err.message || err) }); }
};
