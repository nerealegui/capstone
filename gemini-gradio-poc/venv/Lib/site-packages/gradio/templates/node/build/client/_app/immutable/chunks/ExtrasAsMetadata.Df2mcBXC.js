import { an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
const NAME = "ExtrasAsMetadata";
class ExtrasAsMetadata {
  _assignExtras(babylonObject, gltfProp) {
    if (gltfProp.extras && Object.keys(gltfProp.extras).length > 0) {
      const metadata = babylonObject.metadata = babylonObject.metadata || {};
      const gltf = metadata.gltf = metadata.gltf || {};
      gltf.extras = gltfProp.extras;
    }
  }
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.enabled = true;
    this._loader = loader;
  }
  /** @internal */
  dispose() {
    this._loader = null;
  }
  /**
   * @internal
   */
  loadNodeAsync(context, node, assign) {
    return this._loader.loadNodeAsync(context, node, (babylonTransformNode) => {
      this._assignExtras(babylonTransformNode, node);
      assign(babylonTransformNode);
    });
  }
  /**
   * @internal
   */
  loadCameraAsync(context, camera, assign) {
    return this._loader.loadCameraAsync(context, camera, (babylonCamera) => {
      this._assignExtras(babylonCamera, camera);
      assign(babylonCamera);
    });
  }
  /**
   * @internal
   */
  createMaterial(context, material, babylonDrawMode) {
    const babylonMaterial = this._loader.createMaterial(context, material, babylonDrawMode);
    this._assignExtras(babylonMaterial, material);
    return babylonMaterial;
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, false, (loader) => new ExtrasAsMetadata(loader));
export {
  ExtrasAsMetadata
};
