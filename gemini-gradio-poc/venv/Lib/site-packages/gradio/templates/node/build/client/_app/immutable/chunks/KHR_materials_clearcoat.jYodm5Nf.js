import { ar as PBRMaterial, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "KHR_materials_clearcoat";
class KHR_materials_clearcoat {
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
      promises.push(this._loadClearCoatPropertiesAsync(extensionContext, extension, babylonMaterial));
      return Promise.all(promises).then(() => {
      });
    });
  }
  _loadClearCoatPropertiesAsync(context, properties, babylonMaterial) {
    if (!(babylonMaterial instanceof PBRMaterial)) {
      throw new Error(`${context}: Material type not supported`);
    }
    const promises = new Array();
    babylonMaterial.clearCoat.isEnabled = true;
    babylonMaterial.clearCoat.useRoughnessFromMainTexture = false;
    babylonMaterial.clearCoat.remapF0OnInterfaceChange = false;
    if (properties.clearcoatFactor != void 0) {
      babylonMaterial.clearCoat.intensity = properties.clearcoatFactor;
    } else {
      babylonMaterial.clearCoat.intensity = 0;
    }
    if (properties.clearcoatTexture) {
      promises.push(this._loader.loadTextureInfoAsync(`${context}/clearcoatTexture`, properties.clearcoatTexture, (texture) => {
        texture.name = `${babylonMaterial.name} (ClearCoat)`;
        babylonMaterial.clearCoat.texture = texture;
      }));
    }
    if (properties.clearcoatRoughnessFactor != void 0) {
      babylonMaterial.clearCoat.roughness = properties.clearcoatRoughnessFactor;
    } else {
      babylonMaterial.clearCoat.roughness = 0;
    }
    if (properties.clearcoatRoughnessTexture) {
      properties.clearcoatRoughnessTexture.nonColorData = true;
      promises.push(this._loader.loadTextureInfoAsync(`${context}/clearcoatRoughnessTexture`, properties.clearcoatRoughnessTexture, (texture) => {
        texture.name = `${babylonMaterial.name} (ClearCoat Roughness)`;
        babylonMaterial.clearCoat.textureRoughness = texture;
      }));
    }
    if (properties.clearcoatNormalTexture) {
      properties.clearcoatNormalTexture.nonColorData = true;
      promises.push(this._loader.loadTextureInfoAsync(`${context}/clearcoatNormalTexture`, properties.clearcoatNormalTexture, (texture) => {
        texture.name = `${babylonMaterial.name} (ClearCoat Normal)`;
        babylonMaterial.clearCoat.bumpTexture = texture;
      }));
      babylonMaterial.invertNormalMapX = !babylonMaterial.getScene().useRightHandedSystem;
      babylonMaterial.invertNormalMapY = babylonMaterial.getScene().useRightHandedSystem;
      if (properties.clearcoatNormalTexture.scale != void 0) {
        babylonMaterial.clearCoat.bumpTexture.level = properties.clearcoatNormalTexture.scale;
      }
    }
    return Promise.all(promises).then(() => {
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_clearcoat(loader));
export {
  KHR_materials_clearcoat
};
