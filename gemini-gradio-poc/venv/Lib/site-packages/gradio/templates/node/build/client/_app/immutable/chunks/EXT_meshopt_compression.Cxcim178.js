import { GLTFLoader, ArrayItem } from "./glTFLoader.D0mNbVQS.js";
import { b as Tools, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
let NumberOfWorkers = 0;
let WorkerTimeout = null;
class MeshoptCompression {
  /**
   * Default instance for the meshoptimizer object.
   */
  static get Default() {
    if (!MeshoptCompression._Default) {
      MeshoptCompression._Default = new MeshoptCompression();
    }
    return MeshoptCompression._Default;
  }
  /**
   * Constructor
   */
  constructor() {
    const decoder = MeshoptCompression.Configuration.decoder;
    this._decoderModulePromise = Tools.LoadBabylonScriptAsync(decoder.url).then(() => {
      return MeshoptDecoder.ready;
    });
  }
  /**
   * Stop all async operations and release resources.
   */
  dispose() {
    delete this._decoderModulePromise;
  }
  /**
   * Decode meshopt data.
   * @see https://github.com/zeux/meshoptimizer/tree/master/js#decoder
   * @param source The input data.
   * @param count The number of elements.
   * @param stride The stride in bytes.
   * @param mode The compression mode.
   * @param filter The compression filter.
   * @returns a Promise<Uint8Array> that resolves to the decoded data
   */
  decodeGltfBufferAsync(source, count, stride, mode, filter) {
    return this._decoderModulePromise.then(async () => {
      if (NumberOfWorkers === 0) {
        MeshoptDecoder.useWorkers(1);
        NumberOfWorkers = 1;
      }
      const result = await MeshoptDecoder.decodeGltfBufferAsync(count, stride, source, mode, filter);
      if (WorkerTimeout !== null) {
        clearTimeout(WorkerTimeout);
      }
      WorkerTimeout = setTimeout(() => {
        MeshoptDecoder.useWorkers(0);
        NumberOfWorkers = 0;
        WorkerTimeout = null;
      }, 1e3);
      return result;
    });
  }
}
MeshoptCompression.Configuration = {
  decoder: {
    url: `${Tools._DefaultCdnUrl}/meshopt_decoder.js`
  }
};
MeshoptCompression._Default = null;
const NAME = "EXT_meshopt_compression";
class EXT_meshopt_compression {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.enabled = loader.isExtensionUsed(NAME);
    this._loader = loader;
  }
  /** @internal */
  dispose() {
    this._loader = null;
  }
  /**
   * @internal
   */
  loadBufferViewAsync(context, bufferView) {
    return GLTFLoader.LoadExtensionAsync(context, bufferView, this.name, (extensionContext, extension) => {
      const bufferViewMeshopt = bufferView;
      if (bufferViewMeshopt._meshOptData) {
        return bufferViewMeshopt._meshOptData;
      }
      const buffer = ArrayItem.Get(`${context}/buffer`, this._loader.gltf.buffers, extension.buffer);
      bufferViewMeshopt._meshOptData = this._loader.loadBufferAsync(`/buffers/${buffer.index}`, buffer, extension.byteOffset || 0, extension.byteLength).then((buffer2) => {
        return MeshoptCompression.Default.decodeGltfBufferAsync(buffer2, extension.count, extension.byteStride, extension.mode, extension.filter);
      });
      return bufferViewMeshopt._meshOptData;
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new EXT_meshopt_compression(loader));
export {
  EXT_meshopt_compression
};
