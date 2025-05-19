import { an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
const NAME = "KHR_mesh_quantization";
class KHR_mesh_quantization {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.enabled = loader.isExtensionUsed(NAME);
  }
  /** @internal */
  dispose() {
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_mesh_quantization(loader));
export {
  KHR_mesh_quantization
};
