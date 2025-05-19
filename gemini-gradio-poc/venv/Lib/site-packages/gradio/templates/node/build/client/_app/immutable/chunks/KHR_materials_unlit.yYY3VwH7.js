import { ar as PBRMaterial, C as Color3, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "KHR_materials_unlit";
class KHR_materials_unlit {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.order = 210;
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
    return GLTFLoader.LoadExtensionAsync(context, material, this.name, () => {
      return this._loadUnlitPropertiesAsync(context, material, babylonMaterial);
    });
  }
  _loadUnlitPropertiesAsync(context, material, babylonMaterial) {
    if (!(babylonMaterial instanceof PBRMaterial)) {
      throw new Error(`${context}: Material type not supported`);
    }
    const promises = new Array();
    babylonMaterial.unlit = true;
    const properties = material.pbrMetallicRoughness;
    if (properties) {
      if (properties.baseColorFactor) {
        babylonMaterial.albedoColor = Color3.FromArray(properties.baseColorFactor);
        babylonMaterial.alpha = properties.baseColorFactor[3];
      } else {
        babylonMaterial.albedoColor = Color3.White();
      }
      if (properties.baseColorTexture) {
        promises.push(this._loader.loadTextureInfoAsync(`${context}/baseColorTexture`, properties.baseColorTexture, (texture) => {
          texture.name = `${babylonMaterial.name} (Base Color)`;
          babylonMaterial.albedoTexture = texture;
        }));
      }
    }
    if (material.doubleSided) {
      babylonMaterial.backFaceCulling = false;
      babylonMaterial.twoSidedLighting = true;
    }
    this._loader.loadMaterialAlphaProperties(context, material, babylonMaterial);
    return Promise.all(promises).then(() => {
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_unlit(loader));
export {
  KHR_materials_unlit
};
