const __vite__fileDeps=["./index.B4f7kVg_.js","./preload-helper.DpQnamwV.js","./pass.fragment.2HqXMPnz.js"],__vite__mapDeps=i=>i.map(i=>__vite__fileDeps[i]);
import { _ as __vitePreload } from "./preload-helper.DpQnamwV.js";
import { aj as Clamp, b as Tools, ak as EngineStore, al as EffectRenderer, am as EffectWrapper } from "./index.B4f7kVg_.js";
let _dumpToolsEngine;
let _enginePromise = null;
async function _CreateDumpRenderer() {
  if (!_enginePromise) {
    _enginePromise = new Promise((resolve, reject) => {
      let canvas;
      let engine = null;
      const options = {
        preserveDrawingBuffer: true,
        depth: false,
        stencil: false,
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
        failIfMajorPerformanceCaveat: false
      };
      __vitePreload(() => import("./index.B4f7kVg_.js").then((n) => n.bX), true ? __vite__mapDeps([0,1]) : void 0, import.meta.url).then(({ ThinEngine: thinEngineClass }) => {
        var _a;
        const engineInstanceCount = EngineStore.Instances.length;
        try {
          canvas = new OffscreenCanvas(100, 100);
          engine = new thinEngineClass(canvas, false, options);
        } catch (e) {
          if (engineInstanceCount < EngineStore.Instances.length) {
            (_a = EngineStore.Instances.pop()) == null ? void 0 : _a.dispose();
          }
          canvas = document.createElement("canvas");
          engine = new thinEngineClass(canvas, false, options);
        }
        EngineStore.Instances.pop();
        EngineStore.OnEnginesDisposedObservable.add((e) => {
          if (engine && e !== engine && !engine.isDisposed && EngineStore.Instances.length === 0) {
            Dispose();
          }
        });
        engine.getCaps().parallelShaderCompile = void 0;
        const renderer = new EffectRenderer(engine);
        __vitePreload(() => import("./pass.fragment.2HqXMPnz.js"), true ? __vite__mapDeps([2,0,1]) : void 0, import.meta.url).then(({ passPixelShader }) => {
          if (!engine) {
            reject("Engine is not defined");
            return;
          }
          const wrapper = new EffectWrapper({
            engine,
            name: passPixelShader.name,
            fragmentShader: passPixelShader.shader,
            samplerNames: ["textureSampler"]
          });
          _dumpToolsEngine = {
            canvas,
            engine,
            renderer,
            wrapper
          };
          resolve(_dumpToolsEngine);
        });
      }).catch(reject);
    });
  }
  return await _enginePromise;
}
async function DumpFramebuffer(width, height, engine, successCallback, mimeType = "image/png", fileName, quality) {
  const bufferView = await engine.readPixels(0, 0, width, height);
  const data = new Uint8Array(bufferView.buffer);
  DumpData(width, height, data, successCallback, mimeType, fileName, true, void 0, quality);
}
function DumpDataAsync(width, height, data, mimeType = "image/png", fileName, invertY = false, toArrayBuffer = false, quality) {
  return new Promise((resolve) => {
    DumpData(width, height, data, (result) => resolve(result), mimeType, fileName, invertY, toArrayBuffer, quality);
  });
}
function DumpData(width, height, data, successCallback, mimeType = "image/png", fileName, invertY = false, toArrayBuffer = false, quality) {
  _CreateDumpRenderer().then((renderer) => {
    renderer.engine.setSize(width, height, true);
    if (data instanceof Float32Array) {
      const data2 = new Uint8Array(data.length);
      let n = data.length;
      while (n--) {
        const v = data[n];
        data2[n] = Math.round(Clamp(v) * 255);
      }
      data = data2;
    }
    const texture = renderer.engine.createRawTexture(data, width, height, 5, false, !invertY, 1);
    renderer.renderer.setViewport();
    renderer.renderer.applyEffectWrapper(renderer.wrapper);
    renderer.wrapper.effect._bindTexture("textureSampler", texture);
    renderer.renderer.draw();
    if (toArrayBuffer) {
      Tools.ToBlob(renderer.canvas, (blob) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
          const arrayBuffer = event.target.result;
          if (successCallback) {
            successCallback(arrayBuffer);
          }
        };
        fileReader.readAsArrayBuffer(blob);
      }, mimeType, quality);
    } else {
      Tools.EncodeScreenshotCanvasData(renderer.canvas, successCallback, mimeType, fileName, quality);
    }
    texture.dispose();
  });
}
function Dispose() {
  if (_dumpToolsEngine) {
    _dumpToolsEngine.wrapper.dispose();
    _dumpToolsEngine.renderer.dispose();
    _dumpToolsEngine.engine.dispose();
  } else {
    _enginePromise == null ? void 0 : _enginePromise.then((dumpToolsEngine) => {
      dumpToolsEngine.wrapper.dispose();
      dumpToolsEngine.renderer.dispose();
      dumpToolsEngine.engine.dispose();
    });
  }
  _enginePromise = null;
  _dumpToolsEngine = null;
}
const DumpTools = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DumpData,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DumpDataAsync,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  DumpFramebuffer,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Dispose
};
const initSideEffects = () => {
  Tools.DumpData = DumpData;
  Tools.DumpDataAsync = DumpDataAsync;
  Tools.DumpFramebuffer = DumpFramebuffer;
};
initSideEffects();
export {
  Dispose,
  DumpData,
  DumpDataAsync,
  DumpFramebuffer,
  DumpTools
};
