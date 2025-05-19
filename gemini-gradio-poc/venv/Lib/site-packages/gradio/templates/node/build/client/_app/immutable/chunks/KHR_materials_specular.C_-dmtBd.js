import { ar as PBRMaterial, C as Color3, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "KHR_materials_specular";
class KHR_materials_specular {
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
      promises.push(this._loadSpecularPropertiesAsync(extensionContext, extension, babylonMaterial));
      return Promise.all(promises).then(() => {
      });
    });
  }
  _loadSpecularPropertiesAsync(context, properties, babylonMaterial) {
    if (!(babylonMaterial instanceof PBRMaterial)) {
      throw new Error(`${context}: Material type not supported`);
    }
    const promises = new Array();
    if (properties.specularFactor !== void 0) {
      babylonMaterial.metallicF0Factor = properties.specularFactor;
    }
    if (properties.specularColorFactor !== void 0) {
      babylonMaterial.metallicReflectanceColor = Color3.FromArray(properties.specularColorFactor);
    }
    if (properties.specularTexture) {
      properties.specularTexture.nonColorData = true;
      promises.push(this._loader.loadTextureInfoAsync(`${context}/specularTexture`, properties.specularTexture, (texture) => {
        texture.name = `${babylonMaterial.name} (Specular)`;
        babylonMaterial.metallicReflectanceTexture = texture;
        babylonMaterial.useOnlyMetallicFromMetallicReflectanceTexture = true;
      }));
    }
    if (properties.specularColorTexture) {
      promises.push(this._loader.loadTextureInfoAsync(`${context}/specularColorTexture`, properties.specularColorTexture, (texture) => {
        texture.name = `${babylonMaterial.name} (Specular Color)`;
        babylonMaterial.reflectanceTexture = texture;
      }));
    }
    return Promise.all(promises).then(() => {
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_specular(loader));
export {
  KHR_materials_specular
};
