import { an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { A as AddObjectAccessorToKey } from "./objectModelMapping.r8gj80Ia.js";
const NAME = "KHR_node_visibility";
AddObjectAccessorToKey("/nodes/{}/extensions/KHR_node_visibility/visible", {
  get: (node) => {
    const tn = node._babylonTransformNode;
    if (tn && tn.isVisible !== void 0) {
      return tn.isVisible;
    }
    return true;
  },
  set: (value, node) => {
    var _a, _b;
    (_a = node._primitiveBabylonMeshes) == null ? void 0 : _a.forEach((mesh) => {
      mesh.inheritVisibility = true;
    });
    if (node._babylonTransformNode) {
      node._babylonTransformNode.isVisible = value;
    }
    (_b = node._primitiveBabylonMeshes) == null ? void 0 : _b.forEach((mesh) => {
      mesh.isVisible = value;
    });
  },
  getTarget: (node) => node._babylonTransformNode,
  getPropertyName: [() => "isVisible"],
  type: "boolean"
});
class KHR_node_visibility {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this._loader = loader;
    this.enabled = loader.isExtensionUsed(NAME);
  }
  async onReady() {
    var _a;
    (_a = this._loader.gltf.nodes) == null ? void 0 : _a.forEach((node) => {
      var _a2, _b, _c, _d;
      (_a2 = node._primitiveBabylonMeshes) == null ? void 0 : _a2.forEach((mesh) => {
        mesh.inheritVisibility = true;
      });
      if ((_b = node.extensions) == null ? void 0 : _b.KHR_node_visibility) {
        if (((_c = node.extensions) == null ? void 0 : _c.KHR_node_visibility.visible) === false) {
          if (node._babylonTransformNode) {
            node._babylonTransformNode.isVisible = false;
          }
          (_d = node._primitiveBabylonMeshes) == null ? void 0 : _d.forEach((mesh) => {
            mesh.isVisible = false;
          });
        }
      }
    });
  }
  dispose() {
    this._loader = null;
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_node_visibility(loader));
export {
  KHR_node_visibility
};
