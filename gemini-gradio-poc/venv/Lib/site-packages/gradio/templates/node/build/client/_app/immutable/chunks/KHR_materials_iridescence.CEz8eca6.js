import { ar as PBRMaterial, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "KHR_materials_iridescence";
class KHR_materials_iridescence {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.order = 195;
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
      promises.push(this._loadIridescencePropertiesAsync(extensionContext, extension, babylonMaterial));
      return Promise.all(promises).then(() => {
      });
    });
  }
  _loadIridescencePropertiesAsync(context, properties, babylonMaterial) {
    if (!(babylonMaterial instanceof PBRMaterial)) {
      throw new Error(`${context}: Material type not supported`);
    }
    const promises = new Array();
    babylonMaterial.iridescence.isEnabled = true;
    babylonMaterial.iridescence.intensity = properties.iridescenceFactor ?? 0;
    babylonMaterial.iridescence.indexOfRefraction = properties.iridescenceIor ?? properties.iridescenceIOR ?? 1.3;
    babylonMaterial.iridescence.minimumThickness = properties.iridescenceThicknessMinimum ?? 100;
    babylonMaterial.iridescence.maximumThickness = properties.iridescenceThicknessMaximum ?? 400;
    if (properties.iridescenceTexture) {
      promises.push(this._loader.loadTextureInfoAsync(`${context}/iridescenceTexture`, properties.iridescenceTexture, (texture) => {
        texture.name = `${babylonMaterial.name} (Iridescence)`;
        babylonMaterial.iridescence.texture = texture;
      }));
    }
    if (properties.iridescenceThicknessTexture) {
      promises.push(this._loader.loadTextureInfoAsync(`${context}/iridescenceThicknessTexture`, properties.iridescenceThicknessTexture, (texture) => {
        texture.name = `${babylonMaterial.name} (Iridescence Thickness)`;
        babylonMaterial.iridescence.thicknessTexture = texture;
      }));
    }
    return Promise.all(promises).then(() => {
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_iridescence(loader));
export {
  KHR_materials_iridescence
};
