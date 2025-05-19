import { h as Logger, b as Tools } from "./index.B4f7kVg_.js";
import { A as AutoReleaseWorkerPool } from "./workerPool.DdmrBfgg.js";
class KhronosTextureContainer {
  /**
   * Creates a new KhronosTextureContainer
   * @param data contents of the KTX container file
   * @param facesExpected should be either 1 or 6, based whether a cube texture or or
   */
  constructor(data, facesExpected) {
    this.data = data;
    this.isInvalid = false;
    if (!KhronosTextureContainer.IsValid(data)) {
      this.isInvalid = true;
      Logger.Error("texture missing KTX identifier");
      return;
    }
    const dataSize = Uint32Array.BYTES_PER_ELEMENT;
    const headerDataView = new DataView(this.data.buffer, this.data.byteOffset + 12, 13 * dataSize);
    const endianness = headerDataView.getUint32(0, true);
    const littleEndian = endianness === 67305985;
    this.glType = headerDataView.getUint32(1 * dataSize, littleEndian);
    this.glTypeSize = headerDataView.getUint32(2 * dataSize, littleEndian);
    this.glFormat = headerDataView.getUint32(3 * dataSize, littleEndian);
    this.glInternalFormat = headerDataView.getUint32(4 * dataSize, littleEndian);
    this.glBaseInternalFormat = headerDataView.getUint32(5 * dataSize, littleEndian);
    this.pixelWidth = headerDataView.getUint32(6 * dataSize, littleEndian);
    this.pixelHeight = headerDataView.getUint32(7 * dataSize, littleEndian);
    this.pixelDepth = headerDataView.getUint32(8 * dataSize, littleEndian);
    this.numberOfArrayElements = headerDataView.getUint32(9 * dataSize, littleEndian);
    this.numberOfFaces = headerDataView.getUint32(10 * dataSize, littleEndian);
    this.numberOfMipmapLevels = headerDataView.getUint32(11 * dataSize, littleEndian);
    this.bytesOfKeyValueData = headerDataView.getUint32(12 * dataSize, littleEndian);
    if (this.glType !== 0) {
      Logger.Error("only compressed formats currently supported");
      this.isInvalid = true;
      return;
    } else {
      this.numberOfMipmapLevels = Math.max(1, this.numberOfMipmapLevels);
    }
    if (this.pixelHeight === 0 || this.pixelDepth !== 0) {
      Logger.Error("only 2D textures currently supported");
      this.isInvalid = true;
      return;
    }
    if (this.numberOfArrayElements !== 0) {
      Logger.Error("texture arrays not currently supported");
      this.isInvalid = true;
      return;
    }
    if (this.numberOfFaces !== facesExpected) {
      Logger.Error("number of faces expected" + facesExpected + ", but found " + this.numberOfFaces);
      this.isInvalid = true;
      return;
    }
    this.loadType = KhronosTextureContainer.COMPRESSED_2D;
  }
  /**
   * Uploads KTX content to a Babylon Texture.
   * It is assumed that the texture has already been created & is currently bound
   * @internal
   */
  uploadLevels(texture, loadMipmaps) {
    switch (this.loadType) {
      case KhronosTextureContainer.COMPRESSED_2D:
        this._upload2DCompressedLevels(texture, loadMipmaps);
        break;
    }
  }
  _upload2DCompressedLevels(texture, loadMipmaps) {
    let dataOffset = KhronosTextureContainer.HEADER_LEN + this.bytesOfKeyValueData;
    let width = this.pixelWidth;
    let height = this.pixelHeight;
    const mipmapCount = loadMipmaps ? this.numberOfMipmapLevels : 1;
    for (let level = 0; level < mipmapCount; level++) {
      const imageSize = new Int32Array(this.data.buffer, this.data.byteOffset + dataOffset, 1)[0];
      dataOffset += 4;
      for (let face = 0; face < this.numberOfFaces; face++) {
        const byteArray = new Uint8Array(this.data.buffer, this.data.byteOffset + dataOffset, imageSize);
        const engine = texture.getEngine();
        engine._uploadCompressedDataToTextureDirectly(texture, texture.format, width, height, byteArray, face, level);
        dataOffset += imageSize;
        dataOffset += 3 - (imageSize + 3) % 4;
      }
      width = Math.max(1, width * 0.5);
      height = Math.max(1, height * 0.5);
    }
  }
  /**
   * Checks if the given data starts with a KTX file identifier.
   * @param data the data to check
   * @returns true if the data is a KTX file or false otherwise
   */
  static IsValid(data) {
    if (data.byteLength >= 12) {
      const identifier = new Uint8Array(data.buffer, data.byteOffset, 12);
      if (identifier[0] === 171 && identifier[1] === 75 && identifier[2] === 84 && identifier[3] === 88 && identifier[4] === 32 && identifier[5] === 49 && identifier[6] === 49 && identifier[7] === 187 && identifier[8] === 13 && identifier[9] === 10 && identifier[10] === 26 && identifier[11] === 10) {
        return true;
      }
    }
    return false;
  }
}
KhronosTextureContainer.HEADER_LEN = 12 + 13 * 4;
KhronosTextureContainer.COMPRESSED_2D = 0;
KhronosTextureContainer.COMPRESSED_3D = 1;
KhronosTextureContainer.TEX_2D = 2;
KhronosTextureContainer.TEX_3D = 3;
var SourceTextureFormat;
(function(SourceTextureFormat2) {
  SourceTextureFormat2[SourceTextureFormat2["ETC1S"] = 0] = "ETC1S";
  SourceTextureFormat2[SourceTextureFormat2["UASTC4x4"] = 1] = "UASTC4x4";
})(SourceTextureFormat || (SourceTextureFormat = {}));
var TranscodeTarget;
(function(TranscodeTarget2) {
  TranscodeTarget2[TranscodeTarget2["ASTC_4X4_RGBA"] = 0] = "ASTC_4X4_RGBA";
  TranscodeTarget2[TranscodeTarget2["BC7_RGBA"] = 1] = "BC7_RGBA";
  TranscodeTarget2[TranscodeTarget2["BC3_RGBA"] = 2] = "BC3_RGBA";
  TranscodeTarget2[TranscodeTarget2["BC1_RGB"] = 3] = "BC1_RGB";
  TranscodeTarget2[TranscodeTarget2["PVRTC1_4_RGBA"] = 4] = "PVRTC1_4_RGBA";
  TranscodeTarget2[TranscodeTarget2["PVRTC1_4_RGB"] = 5] = "PVRTC1_4_RGB";
  TranscodeTarget2[TranscodeTarget2["ETC2_RGBA"] = 6] = "ETC2_RGBA";
  TranscodeTarget2[TranscodeTarget2["ETC1_RGB"] = 7] = "ETC1_RGB";
  TranscodeTarget2[TranscodeTarget2["RGBA32"] = 8] = "RGBA32";
  TranscodeTarget2[TranscodeTarget2["R8"] = 9] = "R8";
  TranscodeTarget2[TranscodeTarget2["RG8"] = 10] = "RG8";
})(TranscodeTarget || (TranscodeTarget = {}));
var EngineFormat;
(function(EngineFormat2) {
  EngineFormat2[EngineFormat2["COMPRESSED_RGBA_BPTC_UNORM_EXT"] = 36492] = "COMPRESSED_RGBA_BPTC_UNORM_EXT";
  EngineFormat2[EngineFormat2["COMPRESSED_RGBA_ASTC_4X4_KHR"] = 37808] = "COMPRESSED_RGBA_ASTC_4X4_KHR";
  EngineFormat2[EngineFormat2["COMPRESSED_RGB_S3TC_DXT1_EXT"] = 33776] = "COMPRESSED_RGB_S3TC_DXT1_EXT";
  EngineFormat2[EngineFormat2["COMPRESSED_RGBA_S3TC_DXT5_EXT"] = 33779] = "COMPRESSED_RGBA_S3TC_DXT5_EXT";
  EngineFormat2[EngineFormat2["COMPRESSED_RGBA_PVRTC_4BPPV1_IMG"] = 35842] = "COMPRESSED_RGBA_PVRTC_4BPPV1_IMG";
  EngineFormat2[EngineFormat2["COMPRESSED_RGB_PVRTC_4BPPV1_IMG"] = 35840] = "COMPRESSED_RGB_PVRTC_4BPPV1_IMG";
  EngineFormat2[EngineFormat2["COMPRESSED_RGBA8_ETC2_EAC"] = 37496] = "COMPRESSED_RGBA8_ETC2_EAC";
  EngineFormat2[EngineFormat2["COMPRESSED_RGB8_ETC2"] = 37492] = "COMPRESSED_RGB8_ETC2";
  EngineFormat2[EngineFormat2["COMPRESSED_RGB_ETC1_WEBGL"] = 36196] = "COMPRESSED_RGB_ETC1_WEBGL";
  EngineFormat2[EngineFormat2["RGBA8Format"] = 32856] = "RGBA8Format";
  EngineFormat2[EngineFormat2["R8Format"] = 33321] = "R8Format";
  EngineFormat2[EngineFormat2["RG8Format"] = 33323] = "RG8Format";
})(EngineFormat || (EngineFormat = {}));
function applyConfig(urls, binariesAndModulesContainer) {
  const KTX2DecoderModule = (binariesAndModulesContainer == null ? void 0 : binariesAndModulesContainer.jsDecoderModule) || KTX2DECODER;
  if (urls) {
    if (urls.wasmUASTCToASTC) {
      KTX2DecoderModule.LiteTranscoder_UASTC_ASTC.WasmModuleURL = urls.wasmUASTCToASTC;
    }
    if (urls.wasmUASTCToBC7) {
      KTX2DecoderModule.LiteTranscoder_UASTC_BC7.WasmModuleURL = urls.wasmUASTCToBC7;
    }
    if (urls.wasmUASTCToRGBA_UNORM) {
      KTX2DecoderModule.LiteTranscoder_UASTC_RGBA_UNORM.WasmModuleURL = urls.wasmUASTCToRGBA_UNORM;
    }
    if (urls.wasmUASTCToRGBA_SRGB) {
      KTX2DecoderModule.LiteTranscoder_UASTC_RGBA_SRGB.WasmModuleURL = urls.wasmUASTCToRGBA_SRGB;
    }
    if (urls.wasmUASTCToR8_UNORM) {
      KTX2DecoderModule.LiteTranscoder_UASTC_R8_UNORM.WasmModuleURL = urls.wasmUASTCToR8_UNORM;
    }
    if (urls.wasmUASTCToRG8_UNORM) {
      KTX2DecoderModule.LiteTranscoder_UASTC_RG8_UNORM.WasmModuleURL = urls.wasmUASTCToRG8_UNORM;
    }
    if (urls.jsMSCTranscoder) {
      KTX2DecoderModule.MSCTranscoder.JSModuleURL = urls.jsMSCTranscoder;
    }
    if (urls.wasmMSCTranscoder) {
      KTX2DecoderModule.MSCTranscoder.WasmModuleURL = urls.wasmMSCTranscoder;
    }
    if (urls.wasmZSTDDecoder) {
      KTX2DecoderModule.ZSTDDecoder.WasmModuleURL = urls.wasmZSTDDecoder;
    }
  }
  if (binariesAndModulesContainer) {
    if (binariesAndModulesContainer.wasmUASTCToASTC) {
      KTX2DecoderModule.LiteTranscoder_UASTC_ASTC.WasmBinary = binariesAndModulesContainer.wasmUASTCToASTC;
    }
    if (binariesAndModulesContainer.wasmUASTCToBC7) {
      KTX2DecoderModule.LiteTranscoder_UASTC_BC7.WasmBinary = binariesAndModulesContainer.wasmUASTCToBC7;
    }
    if (binariesAndModulesContainer.wasmUASTCToRGBA_UNORM) {
      KTX2DecoderModule.LiteTranscoder_UASTC_RGBA_UNORM.WasmBinary = binariesAndModulesContainer.wasmUASTCToRGBA_UNORM;
    }
    if (binariesAndModulesContainer.wasmUASTCToRGBA_SRGB) {
      KTX2DecoderModule.LiteTranscoder_UASTC_RGBA_SRGB.WasmBinary = binariesAndModulesContainer.wasmUASTCToRGBA_SRGB;
    }
    if (binariesAndModulesContainer.wasmUASTCToR8_UNORM) {
      KTX2DecoderModule.LiteTranscoder_UASTC_R8_UNORM.WasmBinary = binariesAndModulesContainer.wasmUASTCToR8_UNORM;
    }
    if (binariesAndModulesContainer.wasmUASTCToRG8_UNORM) {
      KTX2DecoderModule.LiteTranscoder_UASTC_RG8_UNORM.WasmBinary = binariesAndModulesContainer.wasmUASTCToRG8_UNORM;
    }
    if (binariesAndModulesContainer.jsMSCTranscoder) {
      KTX2DecoderModule.MSCTranscoder.JSModule = binariesAndModulesContainer.jsMSCTranscoder;
    }
    if (binariesAndModulesContainer.wasmMSCTranscoder) {
      KTX2DecoderModule.MSCTranscoder.WasmBinary = binariesAndModulesContainer.wasmMSCTranscoder;
    }
    if (binariesAndModulesContainer.wasmZSTDDecoder) {
      KTX2DecoderModule.ZSTDDecoder.WasmBinary = binariesAndModulesContainer.wasmZSTDDecoder;
    }
  }
}
function workerFunction(KTX2DecoderModule) {
  if (typeof KTX2DecoderModule === "undefined" && typeof KTX2DECODER !== "undefined") {
    KTX2DecoderModule = KTX2DECODER;
  }
  let ktx2Decoder;
  onmessage = (event) => {
    if (!event.data) {
      return;
    }
    switch (event.data.action) {
      case "init": {
        const urls = event.data.urls;
        if (urls) {
          if (urls.jsDecoderModule && typeof KTX2DecoderModule === "undefined") {
            importScripts(urls.jsDecoderModule);
            KTX2DecoderModule = KTX2DECODER;
          }
          applyConfig(urls);
        }
        if (event.data.wasmBinaries) {
          applyConfig(void 0, { ...event.data.wasmBinaries, jsDecoderModule: KTX2DecoderModule });
        }
        ktx2Decoder = new KTX2DecoderModule.KTX2Decoder();
        postMessage({ action: "init" });
        break;
      }
      case "setDefaultDecoderOptions": {
        KTX2DecoderModule.KTX2Decoder.DefaultDecoderOptions = event.data.options;
        break;
      }
      case "decode":
        ktx2Decoder.decode(event.data.data, event.data.caps, event.data.options).then((data) => {
          const buffers = [];
          for (let mip = 0; mip < data.mipmaps.length; ++mip) {
            const mipmap = data.mipmaps[mip];
            if (mipmap && mipmap.data) {
              buffers.push(mipmap.data.buffer);
            }
          }
          postMessage({ action: "decoded", success: true, decodedData: data }, buffers);
        }).catch((reason) => {
          postMessage({ action: "decoded", success: false, msg: reason });
        });
        break;
    }
  };
}
function initializeWebWorker(worker, wasmBinaries, urls) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      worker.removeEventListener("error", onError);
      worker.removeEventListener("message", onMessage);
      reject(error);
    };
    const onMessage = (message) => {
      if (message.data.action === "init") {
        worker.removeEventListener("error", onError);
        worker.removeEventListener("message", onMessage);
        resolve(worker);
      }
    };
    worker.addEventListener("error", onError);
    worker.addEventListener("message", onMessage);
    worker.postMessage({
      action: "init",
      urls,
      wasmBinaries
    });
  });
}
class DefaultKTX2DecoderOptions {
  constructor() {
    this._isDirty = true;
    this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC = true;
    this._ktx2DecoderOptions = {};
  }
  /**
   * Gets the dirty flag
   */
  get isDirty() {
    return this._isDirty;
  }
  /**
   * force a (uncompressed) RGBA transcoded format if transcoding a UASTC source format and ASTC + BC7 are not available as a compressed transcoded format
   */
  get useRGBAIfASTCBC7NotAvailableWhenUASTC() {
    return this._useRGBAIfASTCBC7NotAvailableWhenUASTC;
  }
  set useRGBAIfASTCBC7NotAvailableWhenUASTC(value) {
    if (this._useRGBAIfASTCBC7NotAvailableWhenUASTC === value) {
      return;
    }
    this._useRGBAIfASTCBC7NotAvailableWhenUASTC = value;
    this._isDirty = true;
  }
  /**
   * force a (uncompressed) RGBA transcoded format if transcoding a UASTC source format and only BC1 or BC3 are available as a compressed transcoded format.
   * This property is true by default to favor speed over memory, because currently transcoding from UASTC to BC1/3 is slow because the transcoder transcodes
   * to uncompressed and then recompresses the texture
   */
  get useRGBAIfOnlyBC1BC3AvailableWhenUASTC() {
    return this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC;
  }
  set useRGBAIfOnlyBC1BC3AvailableWhenUASTC(value) {
    if (this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC === value) {
      return;
    }
    this._useRGBAIfOnlyBC1BC3AvailableWhenUASTC = value;
    this._isDirty = true;
  }
  /**
   * force to always use (uncompressed) RGBA for transcoded format
   */
  get forceRGBA() {
    return this._forceRGBA;
  }
  set forceRGBA(value) {
    if (this._forceRGBA === value) {
      return;
    }
    this._forceRGBA = value;
    this._isDirty = true;
  }
  /**
   * force to always use (uncompressed) R8 for transcoded format
   */
  get forceR8() {
    return this._forceR8;
  }
  set forceR8(value) {
    if (this._forceR8 === value) {
      return;
    }
    this._forceR8 = value;
    this._isDirty = true;
  }
  /**
   * force to always use (uncompressed) RG8 for transcoded format
   */
  get forceRG8() {
    return this._forceRG8;
  }
  set forceRG8(value) {
    if (this._forceRG8 === value) {
      return;
    }
    this._forceRG8 = value;
    this._isDirty = true;
  }
  /**
   * list of transcoders to bypass when looking for a suitable transcoder. The available transcoders are:
   *      UniversalTranscoder_UASTC_ASTC
   *      UniversalTranscoder_UASTC_BC7
   *      UniversalTranscoder_UASTC_RGBA_UNORM
   *      UniversalTranscoder_UASTC_RGBA_SRGB
   *      UniversalTranscoder_UASTC_R8_UNORM
   *      UniversalTranscoder_UASTC_RG8_UNORM
   *      MSCTranscoder
   */
  get bypassTranscoders() {
    return this._bypassTranscoders;
  }
  set bypassTranscoders(value) {
    if (this._bypassTranscoders === value) {
      return;
    }
    this._bypassTranscoders = value;
    this._isDirty = true;
  }
  /** @internal */
  _getKTX2DecoderOptions() {
    if (!this._isDirty) {
      return this._ktx2DecoderOptions;
    }
    this._isDirty = false;
    const options = {
      useRGBAIfASTCBC7NotAvailableWhenUASTC: this._useRGBAIfASTCBC7NotAvailableWhenUASTC,
      forceRGBA: this._forceRGBA,
      forceR8: this._forceR8,
      forceRG8: this._forceRG8,
      bypassTranscoders: this._bypassTranscoders
    };
    if (this.useRGBAIfOnlyBC1BC3AvailableWhenUASTC) {
      options.transcodeFormatDecisionTree = {
        UASTC: {
          transcodeFormat: [TranscodeTarget.BC1_RGB, TranscodeTarget.BC3_RGBA],
          yes: {
            transcodeFormat: TranscodeTarget.RGBA32,
            engineFormat: 32856,
            roundToMultiple4: false
          }
        }
      };
    }
    this._ktx2DecoderOptions = options;
    return options;
  }
}
class KhronosTextureContainer2 {
  static GetDefaultNumWorkers() {
    if (typeof navigator !== "object" || !navigator.hardwareConcurrency) {
      return 1;
    }
    return Math.min(Math.floor(navigator.hardwareConcurrency * 0.5), 4);
  }
  static _Initialize(numWorkers) {
    if (KhronosTextureContainer2._WorkerPoolPromise || KhronosTextureContainer2._DecoderModulePromise) {
      return;
    }
    const urls = {
      jsDecoderModule: Tools.GetBabylonScriptURL(this.URLConfig.jsDecoderModule, true),
      wasmUASTCToASTC: Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToASTC, true),
      wasmUASTCToBC7: Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToBC7, true),
      wasmUASTCToRGBA_UNORM: Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToRGBA_UNORM, true),
      wasmUASTCToRGBA_SRGB: Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToRGBA_SRGB, true),
      wasmUASTCToR8_UNORM: Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToR8_UNORM, true),
      wasmUASTCToRG8_UNORM: Tools.GetBabylonScriptURL(this.URLConfig.wasmUASTCToRG8_UNORM, true),
      jsMSCTranscoder: Tools.GetBabylonScriptURL(this.URLConfig.jsMSCTranscoder, true),
      wasmMSCTranscoder: Tools.GetBabylonScriptURL(this.URLConfig.wasmMSCTranscoder, true),
      wasmZSTDDecoder: Tools.GetBabylonScriptURL(this.URLConfig.wasmZSTDDecoder, true)
    };
    if (numWorkers && typeof Worker === "function" && typeof URL !== "undefined") {
      KhronosTextureContainer2._WorkerPoolPromise = new Promise((resolve) => {
        const workerContent = `${applyConfig}(${workerFunction})()`;
        const workerBlobUrl = URL.createObjectURL(new Blob([workerContent], { type: "application/javascript" }));
        resolve(new AutoReleaseWorkerPool(numWorkers, () => initializeWebWorker(new Worker(workerBlobUrl), void 0, urls)));
      });
    } else {
      if (typeof KhronosTextureContainer2._KTX2DecoderModule === "undefined") {
        KhronosTextureContainer2._DecoderModulePromise = Tools.LoadBabylonScriptAsync(urls.jsDecoderModule).then(() => {
          KhronosTextureContainer2._KTX2DecoderModule = KTX2DECODER;
          KhronosTextureContainer2._KTX2DecoderModule.MSCTranscoder.UseFromWorkerThread = false;
          KhronosTextureContainer2._KTX2DecoderModule.WASMMemoryManager.LoadBinariesFromCurrentThread = true;
          applyConfig(urls, KhronosTextureContainer2._KTX2DecoderModule);
          return new KhronosTextureContainer2._KTX2DecoderModule.KTX2Decoder();
        });
      } else {
        KhronosTextureContainer2._KTX2DecoderModule.MSCTranscoder.UseFromWorkerThread = false;
        KhronosTextureContainer2._KTX2DecoderModule.WASMMemoryManager.LoadBinariesFromCurrentThread = true;
        KhronosTextureContainer2._DecoderModulePromise = Promise.resolve(new KhronosTextureContainer2._KTX2DecoderModule.KTX2Decoder());
      }
    }
  }
  /**
   * Constructor
   * @param engine The engine to use
   * @param numWorkersOrOptions The number of workers for async operations. Specify `0` to disable web workers and run synchronously in the current context.
   */
  constructor(engine, numWorkersOrOptions = KhronosTextureContainer2.DefaultNumWorkers) {
    var _a;
    this._engine = engine;
    const workerPoolOption = typeof numWorkersOrOptions === "object" && numWorkersOrOptions.workerPool || KhronosTextureContainer2.WorkerPool;
    if (workerPoolOption) {
      KhronosTextureContainer2._WorkerPoolPromise = Promise.resolve(workerPoolOption);
    } else {
      if (typeof numWorkersOrOptions === "object") {
        KhronosTextureContainer2._KTX2DecoderModule = (_a = numWorkersOrOptions == null ? void 0 : numWorkersOrOptions.binariesAndModulesContainer) == null ? void 0 : _a.jsDecoderModule;
      } else if (typeof KTX2DECODER !== "undefined") {
        KhronosTextureContainer2._KTX2DecoderModule = KTX2DECODER;
      }
      const numberOfWorkers = typeof numWorkersOrOptions === "number" ? numWorkersOrOptions : numWorkersOrOptions.numWorkers ?? KhronosTextureContainer2.DefaultNumWorkers;
      KhronosTextureContainer2._Initialize(numberOfWorkers);
    }
  }
  /**
   * @internal
   */
  _uploadAsync(data, internalTexture, options) {
    const caps = this._engine.getCaps();
    const compressedTexturesCaps = {
      astc: !!caps.astc,
      bptc: !!caps.bptc,
      s3tc: !!caps.s3tc,
      pvrtc: !!caps.pvrtc,
      etc2: !!caps.etc2,
      etc1: !!caps.etc1
    };
    if (KhronosTextureContainer2._WorkerPoolPromise) {
      return KhronosTextureContainer2._WorkerPoolPromise.then((workerPool) => {
        return new Promise((resolve, reject) => {
          workerPool.push((worker, onComplete) => {
            const onError = (error) => {
              worker.removeEventListener("error", onError);
              worker.removeEventListener("message", onMessage);
              reject(error);
              onComplete();
            };
            const onMessage = (message) => {
              if (message.data.action === "decoded") {
                worker.removeEventListener("error", onError);
                worker.removeEventListener("message", onMessage);
                if (!message.data.success) {
                  reject({ message: message.data.msg });
                } else {
                  try {
                    this._createTexture(message.data.decodedData, internalTexture, options);
                    resolve();
                  } catch (err) {
                    reject({ message: err });
                  }
                }
                onComplete();
              }
            };
            worker.addEventListener("error", onError);
            worker.addEventListener("message", onMessage);
            worker.postMessage({ action: "setDefaultDecoderOptions", options: KhronosTextureContainer2.DefaultDecoderOptions._getKTX2DecoderOptions() });
            const dataCopy = new Uint8Array(data.byteLength);
            dataCopy.set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
            worker.postMessage({ action: "decode", data: dataCopy, caps: compressedTexturesCaps, options }, [dataCopy.buffer]);
          });
        });
      });
    } else if (KhronosTextureContainer2._DecoderModulePromise) {
      return KhronosTextureContainer2._DecoderModulePromise.then((decoder) => {
        if (KhronosTextureContainer2.DefaultDecoderOptions.isDirty) {
          KhronosTextureContainer2._KTX2DecoderModule.KTX2Decoder.DefaultDecoderOptions = KhronosTextureContainer2.DefaultDecoderOptions._getKTX2DecoderOptions();
        }
        return new Promise((resolve, reject) => {
          decoder.decode(data, caps).then((data2) => {
            this._createTexture(data2, internalTexture);
            resolve();
          }).catch((reason) => {
            reject({ message: reason });
          });
        });
      });
    }
    throw new Error("KTX2 decoder module is not available");
  }
  _createTexture(data, internalTexture, options) {
    const oglTexture2D = 3553;
    this._engine._bindTextureDirectly(oglTexture2D, internalTexture);
    if (options) {
      options.transcodedFormat = data.transcodedFormat;
      options.isInGammaSpace = data.isInGammaSpace;
      options.hasAlpha = data.hasAlpha;
      options.transcoderName = data.transcoderName;
    }
    let isUncompressedFormat = true;
    switch (data.transcodedFormat) {
      case 32856:
        internalTexture.type = 0;
        internalTexture.format = 5;
        break;
      case 33321:
        internalTexture.type = 0;
        internalTexture.format = 6;
        break;
      case 33323:
        internalTexture.type = 0;
        internalTexture.format = 7;
        break;
      default:
        internalTexture.format = data.transcodedFormat;
        isUncompressedFormat = false;
        break;
    }
    internalTexture._gammaSpace = data.isInGammaSpace;
    internalTexture.generateMipMaps = data.mipmaps.length > 1;
    if (data.errors) {
      throw new Error("KTX2 container - could not transcode the data. " + data.errors);
    }
    for (let t = 0; t < data.mipmaps.length; ++t) {
      const mipmap = data.mipmaps[t];
      if (!mipmap || !mipmap.data) {
        throw new Error("KTX2 container - could not transcode one of the image");
      }
      if (isUncompressedFormat) {
        internalTexture.width = mipmap.width;
        internalTexture.height = mipmap.height;
        this._engine._uploadDataToTextureDirectly(internalTexture, mipmap.data, 0, t, void 0, true);
      } else {
        this._engine._uploadCompressedDataToTextureDirectly(internalTexture, data.transcodedFormat, mipmap.width, mipmap.height, mipmap.data, 0, t);
      }
    }
    internalTexture._extension = ".ktx2";
    internalTexture.width = data.mipmaps[0].width;
    internalTexture.height = data.mipmaps[0].height;
    internalTexture.isReady = true;
    this._engine._bindTextureDirectly(oglTexture2D, null);
  }
  /**
   * Checks if the given data starts with a KTX2 file identifier.
   * @param data the data to check
   * @returns true if the data is a KTX2 file or false otherwise
   */
  static IsValid(data) {
    if (data.byteLength >= 12) {
      const identifier = new Uint8Array(data.buffer, data.byteOffset, 12);
      if (identifier[0] === 171 && identifier[1] === 75 && identifier[2] === 84 && identifier[3] === 88 && identifier[4] === 32 && identifier[5] === 50 && identifier[6] === 48 && identifier[7] === 187 && identifier[8] === 13 && identifier[9] === 10 && identifier[10] === 26 && identifier[11] === 10) {
        return true;
      }
    }
    return false;
  }
}
KhronosTextureContainer2.URLConfig = {
  jsDecoderModule: "https://cdn.babylonjs.com/babylon.ktx2Decoder.js",
  wasmUASTCToASTC: null,
  wasmUASTCToBC7: null,
  wasmUASTCToRGBA_UNORM: null,
  wasmUASTCToRGBA_SRGB: null,
  wasmUASTCToR8_UNORM: null,
  wasmUASTCToRG8_UNORM: null,
  jsMSCTranscoder: null,
  wasmMSCTranscoder: null,
  wasmZSTDDecoder: null
};
KhronosTextureContainer2.DefaultNumWorkers = KhronosTextureContainer2.GetDefaultNumWorkers();
KhronosTextureContainer2.DefaultDecoderOptions = new DefaultKTX2DecoderOptions();
function mapSRGBToLinear(format) {
  switch (format) {
    case 35916:
      return 33776;
    case 35918:
      return 33778;
    case 35919:
      return 33779;
    case 37493:
      return 37492;
    case 37497:
      return 37496;
    case 37495:
      return 37494;
    case 37840:
      return 37808;
    case 36493:
      return 36492;
  }
  return null;
}
class _KTXTextureLoader {
  constructor() {
    this.supportCascades = false;
  }
  /**
   * Uploads the cube texture data to the WebGL texture. It has already been bound.
   * @param data contains the texture data
   * @param texture defines the BabylonJS internal texture
   * @param createPolynomials will be true if polynomials have been requested
   * @param onLoad defines the callback to trigger once the texture is ready
   */
  loadCubeData(data, texture, createPolynomials, onLoad) {
    if (Array.isArray(data)) {
      return;
    }
    texture._invertVScale = !texture.invertY;
    const engine = texture.getEngine();
    const ktx = new KhronosTextureContainer(data, 6);
    const loadMipmap = ktx.numberOfMipmapLevels > 1 && texture.generateMipMaps;
    engine._unpackFlipY(true);
    ktx.uploadLevels(texture, texture.generateMipMaps);
    texture.width = ktx.pixelWidth;
    texture.height = ktx.pixelHeight;
    engine._setCubeMapTextureParams(texture, loadMipmap, ktx.numberOfMipmapLevels - 1);
    texture.isReady = true;
    texture.onLoadedObservable.notifyObservers(texture);
    texture.onLoadedObservable.clear();
    if (onLoad) {
      onLoad();
    }
  }
  /**
   * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
   * @param data contains the texture data
   * @param texture defines the BabylonJS internal texture
   * @param callback defines the method to call once ready to upload
   * @param options
   */
  loadData(data, texture, callback, options) {
    if (KhronosTextureContainer.IsValid(data)) {
      texture._invertVScale = !texture.invertY;
      const ktx = new KhronosTextureContainer(data, 1);
      const mappedFormat = mapSRGBToLinear(ktx.glInternalFormat);
      if (mappedFormat) {
        texture.format = mappedFormat;
        texture._useSRGBBuffer = texture.getEngine()._getUseSRGBBuffer(true, texture.generateMipMaps);
        texture._gammaSpace = true;
      } else {
        texture.format = ktx.glInternalFormat;
      }
      callback(ktx.pixelWidth, ktx.pixelHeight, texture.generateMipMaps, true, () => {
        ktx.uploadLevels(texture, texture.generateMipMaps);
      }, ktx.isInvalid);
    } else if (KhronosTextureContainer2.IsValid(data)) {
      const ktx2 = new KhronosTextureContainer2(texture.getEngine());
      ktx2._uploadAsync(data, texture, options).then(() => {
        callback(texture.width, texture.height, texture.generateMipMaps, true, () => {
        }, false);
      }, (error) => {
        Logger.Warn(`Failed to load KTX2 texture data: ${error.message}`);
        callback(0, 0, false, false, () => {
        }, true);
      });
    } else {
      Logger.Error("texture missing KTX identifier");
      callback(0, 0, false, false, () => {
      }, true);
    }
  }
}
export {
  _KTXTextureLoader
};
