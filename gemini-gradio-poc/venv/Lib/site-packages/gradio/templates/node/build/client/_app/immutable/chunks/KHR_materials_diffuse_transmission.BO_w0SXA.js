import { ar as PBRMaterial, C as Color3, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "KHR_materials_diffuse_transmission";
class KHR_materials_diffuse_transmission {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.order = 174;
    this._loader = loader;
    this.enabled = this._loader.isExtensionUsed(NAME);
    if (this.enabled) {
      loader.parent.transparencyAsCoverage = true;
    }
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
      promises.push(this._loadTranslucentPropertiesAsync(extensionContext, material, babylonMaterial, extension));
      return Promise.all(promises).then(() => {
      });
    });
  }
  _loadTranslucentPropertiesAsync(context, material, babylonMaterial, extension) {
    if (!(babylonMaterial instanceof PBRMaterial)) {
      throw new Error(`${context}: Material type not supported`);
    }
    const pbrMaterial = babylonMaterial;
    pbrMaterial.subSurface.isTranslucencyEnabled = true;
    pbrMaterial.subSurface.volumeIndexOfRefraction = 1;
    pbrMaterial.subSurface.minimumThickness = 0;
    pbrMaterial.subSurface.maximumThickness = 0;
    pbrMaterial.subSurface.useAlbedoToTintTranslucency = false;
    if (extension.diffuseTransmissionFactor !== void 0) {
      pbrMaterial.subSurface.translucencyIntensity = extension.diffuseTransmissionFactor;
    } else {
      pbrMaterial.subSurface.translucencyIntensity = 0;
      pbrMaterial.subSurface.isTranslucencyEnabled = false;
      return Promise.resolve();
    }
    const promises = new Array();
    pbrMaterial.subSurface.useGltfStyleTextures = true;
    if (extension.diffuseTransmissionTexture) {
      extension.diffuseTransmissionTexture.nonColorData = true;
      promises.push(this._loader.loadTextureInfoAsync(`${context}/diffuseTransmissionTexture`, extension.diffuseTransmissionTexture).then((texture) => {
        texture.name = `${babylonMaterial.name} (Diffuse Transmission)`;
        pbrMaterial.subSurface.translucencyIntensityTexture = texture;
      }));
    }
    if (extension.diffuseTransmissionColorFactor !== void 0) {
      pbrMaterial.subSurface.translucencyColor = Color3.FromArray(extension.diffuseTransmissionColorFactor);
    } else {
      pbrMaterial.subSurface.translucencyColor = Color3.White();
    }
    if (extension.diffuseTransmissionColorTexture) {
      promises.push(this._loader.loadTextureInfoAsync(`${context}/diffuseTransmissionColorTexture`, extension.diffuseTransmissionColorTexture).then((texture) => {
        texture.name = `${babylonMaterial.name} (Diffuse Transmission Color)`;
        pbrMaterial.subSurface.translucencyColorTexture = texture;
      }));
    }
    return Promise.all(promises).then(() => {
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_diffuse_transmission(loader));
export {
  KHR_materials_diffuse_transmission
};
