import { ar as PBRMaterial, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "KHR_materials_emissive_strength";
class KHR_materials_emissive_strength {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.order = 170;
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
  loadMaterialPropertiesAsync(context, material, babylonMaterial) {
    return GLTFLoader.LoadExtensionAsync(context, material, this.name, (extensionContext, extension) => {
      return this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial).then(() => {
        this._loadEmissiveProperties(extensionContext, extension, babylonMaterial);
      });
    });
  }
  _loadEmissiveProperties(context, properties, babylonMaterial) {
    if (!(babylonMaterial instanceof PBRMaterial)) {
      throw new Error(`${context}: Material type not supported`);
    }
    if (properties.emissiveStrength !== void 0) {
      babylonMaterial.emissiveIntensity = properties.emissiveStrength;
    }
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_emissive_strength(loader));
export {
  KHR_materials_emissive_strength
};
