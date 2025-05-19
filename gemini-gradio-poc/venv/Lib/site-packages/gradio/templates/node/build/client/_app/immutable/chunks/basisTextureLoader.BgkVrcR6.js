import { b as Tools, I as InternalTexture, T as Texture } from "./index.B4f7kVg_.js";
function workerFunction() {
  const _BASIS_FORMAT = {
    cTFETC1: 0,
    cTFETC2: 1,
    cTFBC1: 2,
    cTFBC3: 3,
    cTFBC4: 4,
    cTFBC5: 5,
    cTFBC7: 6,
    cTFPVRTC1_4_RGB: 8,
    cTFPVRTC1_4_RGBA: 9,
    cTFASTC_4x4: 10,
    cTFATC_RGB: 11,
    cTFATC_RGBA_INTERPOLATED_ALPHA: 12,
    cTFRGBA32: 13,
    cTFRGB565: 14,
    cTFBGR565: 15,
    cTFRGBA4444: 16,
    cTFFXT1_RGB: 17,
    cTFPVRTC2_4_RGB: 18,
    cTFPVRTC2_4_RGBA: 19,
    cTFETC2_EAC_R11: 20,
    cTFETC2_EAC_RG11: 21
  };
  let transcoderModulePromise = null;
  onmessage = (event) => {
    if (event.data.action === "init") {
      if (event.data.url) {
        try {
          importScripts(event.data.url);
        } catch (e) {
          postMessage({ action: "error", error: e });
        }
      }
      if (!transcoderModulePromise) {
        transcoderModulePromise = BASIS({
          // Override wasm binary
          wasmBinary: event.data.wasmBinary
        });
      }
      if (transcoderModulePromise !== null) {
        transcoderModulePromise.then((m) => {
          BASIS = m;
          m.initializeBasis();
          postMessage({ action: "init" });
        });
      }
    } else if (event.data.action === "transcode") {
      const config = event.data.config;
      const imgData = event.data.imageData;
      const loadedFile = new BASIS.BasisFile(imgData);
      const fileInfo = GetFileInfo(loadedFile);
      let format = event.data.ignoreSupportedFormats ? null : GetSupportedTranscodeFormat(event.data.config, fileInfo);
      let needsConversion = false;
      if (format === null) {
        needsConversion = true;
        format = fileInfo.hasAlpha ? _BASIS_FORMAT.cTFBC3 : _BASIS_FORMAT.cTFBC1;
      }
      let success = true;
      if (!loadedFile.startTranscoding()) {
        success = false;
      }
      const buffers = [];
      for (let imageIndex = 0; imageIndex < fileInfo.images.length; imageIndex++) {
        if (!success) {
          break;
        }
        const image = fileInfo.images[imageIndex];
        if (config.loadSingleImage === void 0 || config.loadSingleImage === imageIndex) {
          let mipCount = image.levels.length;
          if (config.loadMipmapLevels === false) {
            mipCount = 1;
          }
          for (let levelIndex = 0; levelIndex < mipCount; levelIndex++) {
            const levelInfo = image.levels[levelIndex];
            const pixels = TranscodeLevel(loadedFile, imageIndex, levelIndex, format, needsConversion);
            if (!pixels) {
              success = false;
              break;
            }
            levelInfo.transcodedPixels = pixels;
            buffers.push(levelInfo.transcodedPixels.buffer);
          }
        }
      }
      loadedFile.close();
      loadedFile.delete();
      if (needsConversion) {
        format = -1;
      }
      if (!success) {
        postMessage({ action: "transcode", success, id: event.data.id });
      } else {
        postMessage({ action: "transcode", success, id: event.data.id, fileInfo, format }, buffers);
      }
    }
  };
  function GetSupportedTranscodeFormat(config, fileInfo) {
    let format = null;
    if (config.supportedCompressionFormats) {
      if (config.supportedCompressionFormats.astc) {
        format = _BASIS_FORMAT.cTFASTC_4x4;
      } else if (config.supportedCompressionFormats.bc7) {
        format = _BASIS_FORMAT.cTFBC7;
      } else if (config.supportedCompressionFormats.s3tc) {
        format = fileInfo.hasAlpha ? _BASIS_FORMAT.cTFBC3 : _BASIS_FORMAT.cTFBC1;
      } else if (config.supportedCompressionFormats.pvrtc) {
        format = fileInfo.hasAlpha ? _BASIS_FORMAT.cTFPVRTC1_4_RGBA : _BASIS_FORMAT.cTFPVRTC1_4_RGB;
      } else if (config.supportedCompressionFormats.etc2) {
        format = _BASIS_FORMAT.cTFETC2;
      } else if (config.supportedCompressionFormats.etc1) {
        format = _BASIS_FORMAT.cTFETC1;
      } else {
        format = _BASIS_FORMAT.cTFRGB565;
      }
    }
    return format;
  }
  function GetFileInfo(basisFile) {
    const hasAlpha = basisFile.getHasAlpha();
    const imageCount = basisFile.getNumImages();
    const images = [];
    for (let i = 0; i < imageCount; i++) {
      const imageInfo = {
        levels: []
      };
      const levelCount = basisFile.getNumLevels(i);
      for (let level = 0; level < levelCount; level++) {
        const levelInfo = {
          width: basisFile.getImageWidth(i, level),
          height: basisFile.getImageHeight(i, level)
        };
        imageInfo.levels.push(levelInfo);
      }
      images.push(imageInfo);
    }
    const info = { hasAlpha, images };
    return info;
  }
  function TranscodeLevel(loadedFile, imageIndex, levelIndex, format, convertToRgb565) {
    const dstSize = loadedFile.getImageTranscodedSizeInBytes(imageIndex, levelIndex, format);
    let dst = new Uint8Array(dstSize);
    if (!loadedFile.transcodeImage(dst, imageIndex, levelIndex, format, 1, 0)) {
      return null;
    }
    if (convertToRgb565) {
      const alignedWidth = loadedFile.getImageWidth(imageIndex, levelIndex) + 3 & ~3;
      const alignedHeight = loadedFile.getImageHeight(imageIndex, levelIndex) + 3 & ~3;
      dst = ConvertDxtToRgb565(dst, 0, alignedWidth, alignedHeight);
    }
    return dst;
  }
  function ConvertDxtToRgb565(src, srcByteOffset, width, height) {
    const c = new Uint16Array(4);
    const dst = new Uint16Array(width * height);
    const blockWidth = width / 4;
    const blockHeight = height / 4;
    for (let blockY = 0; blockY < blockHeight; blockY++) {
      for (let blockX = 0; blockX < blockWidth; blockX++) {
        const i = srcByteOffset + 8 * (blockY * blockWidth + blockX);
        c[0] = src[i] | src[i + 1] << 8;
        c[1] = src[i + 2] | src[i + 3] << 8;
        c[2] = (2 * (c[0] & 31) + 1 * (c[1] & 31)) / 3 | (2 * (c[0] & 2016) + 1 * (c[1] & 2016)) / 3 & 2016 | (2 * (c[0] & 63488) + 1 * (c[1] & 63488)) / 3 & 63488;
        c[3] = (2 * (c[1] & 31) + 1 * (c[0] & 31)) / 3 | (2 * (c[1] & 2016) + 1 * (c[0] & 2016)) / 3 & 2016 | (2 * (c[1] & 63488) + 1 * (c[0] & 63488)) / 3 & 63488;
        for (let row = 0; row < 4; row++) {
          const m = src[i + 4 + row];
          let dstI = (blockY * 4 + row) * width + blockX * 4;
          dst[dstI++] = c[m & 3];
          dst[dstI++] = c[m >> 2 & 3];
          dst[dstI++] = c[m >> 4 & 3];
          dst[dstI++] = c[m >> 6 & 3];
        }
      }
    }
    return dst;
  }
}
function initializeWebWorker(worker, wasmBinary, moduleUrl) {
  return new Promise((res, reject) => {
    const initHandler = (msg) => {
      if (msg.data.action === "init") {
        worker.removeEventListener("message", initHandler);
        res(worker);
      } else if (msg.data.action === "error") {
        reject(msg.data.error || "error initializing worker");
      }
    };
    worker.addEventListener("message", initHandler);
    worker.postMessage({ action: "init", url: moduleUrl ? Tools.GetBabylonScriptURL(moduleUrl) : void 0, wasmBinary }, [wasmBinary]);
  });
}
var BASIS_FORMATS;
(function(BASIS_FORMATS2) {
  BASIS_FORMATS2[BASIS_FORMATS2["cTFETC1"] = 0] = "cTFETC1";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFETC2"] = 1] = "cTFETC2";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFBC1"] = 2] = "cTFBC1";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFBC3"] = 3] = "cTFBC3";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFBC4"] = 4] = "cTFBC4";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFBC5"] = 5] = "cTFBC5";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFBC7"] = 6] = "cTFBC7";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFPVRTC1_4_RGB"] = 8] = "cTFPVRTC1_4_RGB";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFPVRTC1_4_RGBA"] = 9] = "cTFPVRTC1_4_RGBA";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFASTC_4x4"] = 10] = "cTFASTC_4x4";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFATC_RGB"] = 11] = "cTFATC_RGB";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFATC_RGBA_INTERPOLATED_ALPHA"] = 12] = "cTFATC_RGBA_INTERPOLATED_ALPHA";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFRGBA32"] = 13] = "cTFRGBA32";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFRGB565"] = 14] = "cTFRGB565";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFBGR565"] = 15] = "cTFBGR565";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFRGBA4444"] = 16] = "cTFRGBA4444";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFFXT1_RGB"] = 17] = "cTFFXT1_RGB";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFPVRTC2_4_RGB"] = 18] = "cTFPVRTC2_4_RGB";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFPVRTC2_4_RGBA"] = 19] = "cTFPVRTC2_4_RGBA";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFETC2_EAC_R11"] = 20] = "cTFETC2_EAC_R11";
  BASIS_FORMATS2[BASIS_FORMATS2["cTFETC2_EAC_RG11"] = 21] = "cTFETC2_EAC_RG11";
})(BASIS_FORMATS || (BASIS_FORMATS = {}));
const BasisToolsOptions = {
  /**
   * URL to use when loading the basis transcoder
   */
  JSModuleURL: `${Tools._DefaultCdnUrl}/basisTranscoder/1/basis_transcoder.js`,
  /**
   * URL to use when loading the wasm module for the transcoder
   */
  WasmModuleURL: `${Tools._DefaultCdnUrl}/basisTranscoder/1/basis_transcoder.wasm`
};
const GetInternalFormatFromBasisFormat = (basisFormat, engine) => {
  let format;
  switch (basisFormat) {
    case BASIS_FORMATS.cTFETC1:
      format = 36196;
      break;
    case BASIS_FORMATS.cTFBC1:
      format = 33776;
      break;
    case BASIS_FORMATS.cTFBC4:
      format = 33779;
      break;
    case BASIS_FORMATS.cTFASTC_4x4:
      format = 37808;
      break;
    case BASIS_FORMATS.cTFETC2:
      format = 37496;
      break;
    case BASIS_FORMATS.cTFBC7:
      format = 36492;
      break;
  }
  if (format === void 0) {
    throw "The chosen Basis transcoder format is not currently supported";
  }
  return format;
};
let _WorkerPromise = null;
let _Worker = null;
let _actionId = 0;
const _IgnoreSupportedFormats = false;
const _CreateWorkerAsync = () => {
  if (!_WorkerPromise) {
    _WorkerPromise = new Promise((res, reject) => {
      if (_Worker) {
        res(_Worker);
      } else {
        Tools.LoadFileAsync(Tools.GetBabylonScriptURL(BasisToolsOptions.WasmModuleURL)).then((wasmBinary) => {
          if (typeof URL !== "function") {
            return reject("Basis transcoder requires an environment with a URL constructor");
          }
          const workerBlobUrl = URL.createObjectURL(new Blob([`(${workerFunction})()`], { type: "application/javascript" }));
          _Worker = new Worker(workerBlobUrl);
          initializeWebWorker(_Worker, wasmBinary, BasisToolsOptions.JSModuleURL).then(res, reject);
        }).catch(reject);
      }
    });
  }
  return _WorkerPromise;
};
const TranscodeAsync = (data, config) => {
  const dataView = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  return new Promise((res, rej) => {
    _CreateWorkerAsync().then(() => {
      const actionId = _actionId++;
      const messageHandler = (msg) => {
        if (msg.data.action === "transcode" && msg.data.id === actionId) {
          _Worker.removeEventListener("message", messageHandler);
          if (!msg.data.success) {
            rej("Transcode is not supported on this device");
          } else {
            res(msg.data);
          }
        }
      };
      _Worker.addEventListener("message", messageHandler);
      const dataViewCopy = new Uint8Array(dataView.byteLength);
      dataViewCopy.set(new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength));
      _Worker.postMessage({ action: "transcode", id: actionId, imageData: dataViewCopy, config, ignoreSupportedFormats: _IgnoreSupportedFormats }, [
        dataViewCopy.buffer
      ]);
    }, (error) => {
      rej(error);
    });
  });
};
const BindTexture = (texture, engine) => {
  var _a, _b;
  let target = (_a = engine._gl) == null ? void 0 : _a.TEXTURE_2D;
  if (texture.isCube) {
    target = (_b = engine._gl) == null ? void 0 : _b.TEXTURE_CUBE_MAP;
  }
  engine._bindTextureDirectly(target, texture, true);
};
const LoadTextureFromTranscodeResult = (texture, transcodeResult) => {
  const engine = texture.getEngine();
  for (let i = 0; i < transcodeResult.fileInfo.images.length; i++) {
    const rootImage = transcodeResult.fileInfo.images[i].levels[0];
    texture._invertVScale = texture.invertY;
    if (transcodeResult.format === -1 || transcodeResult.format === BASIS_FORMATS.cTFRGB565) {
      texture.type = 10;
      texture.format = 4;
      if (engine._features.basisNeedsPOT && (Math.log2(rootImage.width) % 1 !== 0 || Math.log2(rootImage.height) % 1 !== 0)) {
        const source = new InternalTexture(
          engine,
          2
          /* InternalTextureSource.Temp */
        );
        texture._invertVScale = texture.invertY;
        source.type = 10;
        source.format = 4;
        source.width = rootImage.width + 3 & ~3;
        source.height = rootImage.height + 3 & ~3;
        BindTexture(source, engine);
        engine._uploadDataToTextureDirectly(source, new Uint16Array(rootImage.transcodedPixels.buffer), i, 0, 4, true);
        engine._rescaleTexture(source, texture, engine.scenes[0], engine._getInternalFormat(4), () => {
          engine._releaseTexture(source);
          BindTexture(texture, engine);
        });
      } else {
        texture._invertVScale = !texture.invertY;
        texture.width = rootImage.width + 3 & ~3;
        texture.height = rootImage.height + 3 & ~3;
        texture.samplingMode = 2;
        BindTexture(texture, engine);
        engine._uploadDataToTextureDirectly(texture, new Uint16Array(rootImage.transcodedPixels.buffer), i, 0, 4, true);
      }
    } else {
      texture.width = rootImage.width;
      texture.height = rootImage.height;
      texture.generateMipMaps = transcodeResult.fileInfo.images[i].levels.length > 1;
      const format = BasisTools.GetInternalFormatFromBasisFormat(transcodeResult.format, engine);
      texture.format = format;
      BindTexture(texture, engine);
      transcodeResult.fileInfo.images[i].levels.forEach((level, index) => {
        engine._uploadCompressedDataToTextureDirectly(texture, format, level.width, level.height, level.transcodedPixels, i, index);
      });
      if (engine._features.basisNeedsPOT && (Math.log2(texture.width) % 1 !== 0 || Math.log2(texture.height) % 1 !== 0)) {
        Tools.Warn("Loaded .basis texture width and height are not a power of two. Texture wrapping will be set to Texture.CLAMP_ADDRESSMODE as other modes are not supported with non power of two dimensions in webGL 1.");
        texture._cachedWrapU = Texture.CLAMP_ADDRESSMODE;
        texture._cachedWrapV = Texture.CLAMP_ADDRESSMODE;
      }
    }
  }
};
const BasisTools = {
  /**
   * URL to use when loading the basis transcoder
   */
  JSModuleURL: BasisToolsOptions.JSModuleURL,
  /**
   * URL to use when loading the wasm module for the transcoder
   */
  WasmModuleURL: BasisToolsOptions.WasmModuleURL,
  /**
   * Get the internal format to be passed to texImage2D corresponding to the .basis format value
   * @param basisFormat format chosen from GetSupportedTranscodeFormat
   * @returns internal format corresponding to the Basis format
   */
  GetInternalFormatFromBasisFormat,
  /**
   * Transcodes a loaded image file to compressed pixel data
   * @param data image data to transcode
   * @param config configuration options for the transcoding
   * @returns a promise resulting in the transcoded image
   */
  TranscodeAsync,
  /**
   * Loads a texture from the transcode result
   * @param texture texture load to
   * @param transcodeResult the result of transcoding the basis file to load from
   */
  LoadTextureFromTranscodeResult
};
Object.defineProperty(BasisTools, "JSModuleURL", {
  get: function() {
    return BasisToolsOptions.JSModuleURL;
  },
  set: function(value) {
    BasisToolsOptions.JSModuleURL = value;
  }
});
Object.defineProperty(BasisTools, "WasmModuleURL", {
  get: function() {
    return BasisToolsOptions.WasmModuleURL;
  },
  set: function(value) {
    BasisToolsOptions.WasmModuleURL = value;
  }
});
class _BasisTextureLoader {
  constructor() {
    this.supportCascades = false;
  }
  /**
   * Uploads the cube texture data to the WebGL texture. It has already been bound.
   * @param data contains the texture data
   * @param texture defines the BabylonJS internal texture
   * @param createPolynomials will be true if polynomials have been requested
   * @param onLoad defines the callback to trigger once the texture is ready
   * @param onError defines the callback to trigger in case of error
   */
  loadCubeData(data, texture, createPolynomials, onLoad, onError) {
    if (Array.isArray(data)) {
      return;
    }
    const caps = texture.getEngine().getCaps();
    const transcodeConfig = {
      supportedCompressionFormats: {
        etc1: caps.etc1 ? true : false,
        s3tc: caps.s3tc ? true : false,
        pvrtc: caps.pvrtc ? true : false,
        etc2: caps.etc2 ? true : false,
        astc: caps.astc ? true : false,
        bc7: caps.bptc ? true : false
      }
    };
    TranscodeAsync(data, transcodeConfig).then((result) => {
      const hasMipmap = result.fileInfo.images[0].levels.length > 1 && texture.generateMipMaps;
      LoadTextureFromTranscodeResult(texture, result);
      texture.getEngine()._setCubeMapTextureParams(texture, hasMipmap);
      texture.isReady = true;
      texture.onLoadedObservable.notifyObservers(texture);
      texture.onLoadedObservable.clear();
      if (onLoad) {
        onLoad();
      }
    }).catch((err) => {
      const errorMessage = "Failed to transcode Basis file, transcoding may not be supported on this device";
      Tools.Warn(errorMessage);
      texture.isReady = true;
      if (onError) {
        onError(err);
      }
    });
  }
  /**
   * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
   * @param data contains the texture data
   * @param texture defines the BabylonJS internal texture
   * @param callback defines the method to call once ready to upload
   */
  loadData(data, texture, callback) {
    const caps = texture.getEngine().getCaps();
    const transcodeConfig = {
      supportedCompressionFormats: {
        etc1: caps.etc1 ? true : false,
        s3tc: caps.s3tc ? true : false,
        pvrtc: caps.pvrtc ? true : false,
        etc2: caps.etc2 ? true : false,
        astc: caps.astc ? true : false,
        bc7: caps.bptc ? true : false
      }
    };
    TranscodeAsync(data, transcodeConfig).then((result) => {
      const rootImage = result.fileInfo.images[0].levels[0];
      const hasMipmap = result.fileInfo.images[0].levels.length > 1 && texture.generateMipMaps;
      callback(rootImage.width, rootImage.height, hasMipmap, result.format !== -1, () => {
        LoadTextureFromTranscodeResult(texture, result);
      });
    }).catch((err) => {
      Tools.Warn("Failed to transcode Basis file, transcoding may not be supported on this device");
      Tools.Warn(`Failed to transcode Basis file: ${err}`);
      callback(0, 0, false, false, () => {
      }, true);
    });
  }
}
export {
  _BasisTextureLoader
};
