import { an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
const NAME = "KHR_xmp_json_ld";
class KHR_xmp_json_ld {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.order = 100;
    this._loader = loader;
    this.enabled = this._loader.isExtensionUsed(NAME);
  }
  /** @internal */
  dispose() {
    this._loader = null;
  }
  /**
   * Called after the loader state changes to LOADING.
   */
  onLoading() {
    var _a, _b, _c;
    if (this._loader.rootBabylonMesh === null) {
      return;
    }
    const xmp_gltf = (_a = this._loader.gltf.extensions) == null ? void 0 : _a.KHR_xmp_json_ld;
    const xmp_node = (_c = (_b = this._loader.gltf.asset) == null ? void 0 : _b.extensions) == null ? void 0 : _c.KHR_xmp_json_ld;
    if (xmp_gltf && xmp_node) {
      const packet = +xmp_node.packet;
      if (xmp_gltf.packets && packet < xmp_gltf.packets.length) {
        this._loader.rootBabylonMesh.metadata = this._loader.rootBabylonMesh.metadata || {};
        this._loader.rootBabylonMesh.metadata.xmp = xmp_gltf.packets[packet];
      }
    }
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_xmp_json_ld(loader));
export {
  KHR_xmp_json_ld
};
