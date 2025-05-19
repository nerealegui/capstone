import { ar as PBRMaterial, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "MSFT_minecraftMesh";
class MSFT_minecraftMesh {
  /** @internal */
  constructor(loader) {
    this.name = NAME;
    this._loader = loader;
    this.enabled = this._loader.isExtensionUsed(NAME);
  }
  /** @internal */
  dispose() {
    this._loader = null;
  }
  /** @internal */
  loadMaterialPropertiesAsync(context, material, babylonMaterial) {
    return GLTFLoader.LoadExtraAsync(context, material, this.name, (extraContext, extra) => {
      if (extra) {
        if (!(babylonMaterial instanceof PBRMaterial)) {
          throw new Error(`${extraContext}: Material type not supported`);
        }
        const promise = this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial);
        if (babylonMaterial.needAlphaBlending()) {
          babylonMaterial.forceDepthWrite = true;
          babylonMaterial.separateCullingPass = true;
        }
        babylonMaterial.backFaceCulling = babylonMaterial.forceDepthWrite;
        babylonMaterial.twoSidedLighting = true;
        return promise;
      }
      return null;
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new MSFT_minecraftMesh(loader));
export {
  MSFT_minecraftMesh
};
