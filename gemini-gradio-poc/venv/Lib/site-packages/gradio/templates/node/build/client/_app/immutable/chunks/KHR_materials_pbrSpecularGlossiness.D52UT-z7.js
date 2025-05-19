import { ar as PBRMaterial, C as Color3, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "KHR_materials_pbrSpecularGlossiness";
class KHR_materials_pbrSpecularGlossiness {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.order = 200;
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
      promises.push(this._loader.loadMaterialBasePropertiesAsync(context, material, babylonMaterial));
      promises.push(this._loadSpecularGlossinessPropertiesAsync(extensionContext, extension, babylonMaterial));
      this._loader.loadMaterialAlphaProperties(context, material, babylonMaterial);
      return Promise.all(promises).then(() => {
      });
    });
  }
  _loadSpecularGlossinessPropertiesAsync(context, properties, babylonMaterial) {
    if (!(babylonMaterial instanceof PBRMaterial)) {
      throw new Error(`${context}: Material type not supported`);
    }
    const promises = new Array();
    babylonMaterial.metallic = null;
    babylonMaterial.roughness = null;
    if (properties.diffuseFactor) {
      babylonMaterial.albedoColor = Color3.FromArray(properties.diffuseFactor);
      babylonMaterial.alpha = properties.diffuseFactor[3];
    } else {
      babylonMaterial.albedoColor = Color3.White();
    }
    babylonMaterial.reflectivityColor = properties.specularFactor ? Color3.FromArray(properties.specularFactor) : Color3.White();
    babylonMaterial.microSurface = properties.glossinessFactor == void 0 ? 1 : properties.glossinessFactor;
    if (properties.diffuseTexture) {
      promises.push(this._loader.loadTextureInfoAsync(`${context}/diffuseTexture`, properties.diffuseTexture, (texture) => {
        texture.name = `${babylonMaterial.name} (Diffuse)`;
        babylonMaterial.albedoTexture = texture;
      }));
    }
    if (properties.specularGlossinessTexture) {
      promises.push(this._loader.loadTextureInfoAsync(`${context}/specularGlossinessTexture`, properties.specularGlossinessTexture, (texture) => {
        texture.name = `${babylonMaterial.name} (Specular Glossiness)`;
        babylonMaterial.reflectivityTexture = texture;
        babylonMaterial.reflectivityTexture.hasAlpha = true;
      }));
      babylonMaterial.useMicroSurfaceFromReflectivityMapAlpha = true;
    }
    return Promise.all(promises).then(() => {
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_pbrSpecularGlossiness(loader));
export {
  KHR_materials_pbrSpecularGlossiness
};
