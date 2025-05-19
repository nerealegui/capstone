import { ar as PBRMaterial, C as Color3, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "KHR_materials_sheen";
class KHR_materials_sheen {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.order = 190;
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
      const promises = new Array();
      promises.push(this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial));
      promises.push(this._loadSheenPropertiesAsync(extensionContext, extension, babylonMaterial));
      return Promise.all(promises).then(() => {
      });
    });
  }
  _loadSheenPropertiesAsync(context, properties, babylonMaterial) {
    if (!(babylonMaterial instanceof PBRMaterial)) {
      throw new Error(`${context}: Material type not supported`);
    }
    const promises = new Array();
    babylonMaterial.sheen.isEnabled = true;
    babylonMaterial.sheen.intensity = 1;
    if (properties.sheenColorFactor != void 0) {
      babylonMaterial.sheen.color = Color3.FromArray(properties.sheenColorFactor);
    } else {
      babylonMaterial.sheen.color = Color3.Black();
    }
    if (properties.sheenColorTexture) {
      promises.push(this._loader.loadTextureInfoAsync(`${context}/sheenColorTexture`, properties.sheenColorTexture, (texture) => {
        texture.name = `${babylonMaterial.name} (Sheen Color)`;
        babylonMaterial.sheen.texture = texture;
      }));
    }
    if (properties.sheenRoughnessFactor !== void 0) {
      babylonMaterial.sheen.roughness = properties.sheenRoughnessFactor;
    } else {
      babylonMaterial.sheen.roughness = 0;
    }
    if (properties.sheenRoughnessTexture) {
      properties.sheenRoughnessTexture.nonColorData = true;
      promises.push(this._loader.loadTextureInfoAsync(`${context}/sheenRoughnessTexture`, properties.sheenRoughnessTexture, (texture) => {
        texture.name = `${babylonMaterial.name} (Sheen Roughness)`;
        babylonMaterial.sheen.textureRoughness = texture;
      }));
    }
    babylonMaterial.sheen.albedoScaling = true;
    babylonMaterial.sheen.useRoughnessFromMainTexture = false;
    return Promise.all(promises).then(() => {
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_sheen(loader));
export {
  KHR_materials_sheen
};
