'use strict';
/* Runs the MDX-Net separation off the main thread so the app stays responsive. */
const ORT_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
let ready = null;
function init() {
  if (!ready) ready = (async () => {
    importScripts(ORT_BASE + 'ort.webgpu.min.js');
    self.ort.env.wasm.wasmPaths = ORT_BASE;
    self.ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 2) : 1;
    importScripts('mdx.js?v=4');
  })();
  return ready;
}
self.onmessage = async e => {
  const { cmd, L, R, model, id } = e.data;
  try {
    await init();
    if (cmd === 'separate') {
      const res = await self.MDX.separate(L, R, {
        model,
        onStatus: (s, p) => self.postMessage({ type: 'status', id, s, p }),
        onProgress: (p, info) => self.postMessage({ type: 'progress', id, p, info }),
      });
      const oL = res.L.slice(), oR = res.R.slice();
      self.postMessage({ type: 'done', id, L: oL, R: oR, ep: res.ep }, [oL.buffer, oR.buffer]);
    }
  } catch (err) { self.postMessage({ type: 'error', id, message: String(err && err.message || err) }); }
};
