import { a as TmpVectors, V as Vector3, Q as Quaternion, M as Matrix, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader, ArrayItem } from "./glTFLoader.D0mNbVQS.js";
import "./thinInstanceMesh.DAersNY-.js";
const NAME = "EXT_mesh_gpu_instancing";
class EXT_mesh_gpu_instancing {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this._loader = loader;
    this.enabled = this._loader.isExtensionUsed(NAME);
  }
  /** @internal */
  dispose() {
    this._loader = null;
  }
  /**
   * @internal
   */
  loadNodeAsync(context, node, assign) {
    return GLTFLoader.LoadExtensionAsync(context, node, this.name, (extensionContext, extension) => {
      this._loader._disableInstancedMesh++;
      const promise = this._loader.loadNodeAsync(`/nodes/${node.index}`, node, assign);
      this._loader._disableInstancedMesh--;
      if (!node._primitiveBabylonMeshes) {
        return promise;
      }
      const promises = new Array();
      let instanceCount = 0;
      const loadAttribute = (attribute) => {
        if (extension.attributes[attribute] == void 0) {
          promises.push(Promise.resolve(null));
          return;
        }
        const accessor = ArrayItem.Get(`${extensionContext}/attributes/${attribute}`, this._loader.gltf.accessors, extension.attributes[attribute]);
        promises.push(this._loader._loadFloatAccessorAsync(`/accessors/${accessor.bufferView}`, accessor));
        if (instanceCount === 0) {
          instanceCount = accessor.count;
        } else if (instanceCount !== accessor.count) {
          throw new Error(`${extensionContext}/attributes: Instance buffer accessors do not have the same count.`);
        }
      };
      loadAttribute("TRANSLATION");
      loadAttribute("ROTATION");
      loadAttribute("SCALE");
      return promise.then((babylonTransformNode) => {
        return Promise.all(promises).then(([translationBuffer, rotationBuffer, scaleBuffer]) => {
          const matrices = new Float32Array(instanceCount * 16);
          TmpVectors.Vector3[0].copyFromFloats(0, 0, 0);
          TmpVectors.Quaternion[0].copyFromFloats(0, 0, 0, 1);
          TmpVectors.Vector3[1].copyFromFloats(1, 1, 1);
          for (let i = 0; i < instanceCount; ++i) {
            translationBuffer && Vector3.FromArrayToRef(translationBuffer, i * 3, TmpVectors.Vector3[0]);
            rotationBuffer && Quaternion.FromArrayToRef(rotationBuffer, i * 4, TmpVectors.Quaternion[0]);
            scaleBuffer && Vector3.FromArrayToRef(scaleBuffer, i * 3, TmpVectors.Vector3[1]);
            Matrix.ComposeToRef(TmpVectors.Vector3[1], TmpVectors.Quaternion[0], TmpVectors.Vector3[0], TmpVectors.Matrix[0]);
            TmpVectors.Matrix[0].copyToArray(matrices, i * 16);
          }
          for (const babylonMesh of node._primitiveBabylonMeshes) {
            babylonMesh.thinInstanceSetBuffer("matrix", matrices, 16, true);
          }
          return babylonTransformNode;
        });
      });
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new EXT_mesh_gpu_instancing(loader));
export {
  EXT_mesh_gpu_instancing
};
