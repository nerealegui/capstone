import { ar as PBRMaterial, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "KHR_materials_dispersion";
class KHR_materials_dispersion {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.order = 174;
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
      promises.push(this._loadDispersionPropertiesAsync(extensionContext, material, babylonMaterial, extension));
      return Promise.all(promises).then(() => {
      });
    });
  }
  _loadDispersionPropertiesAsync(context, material, babylonMaterial, extension) {
    if (!(babylonMaterial instanceof PBRMaterial)) {
      throw new Error(`${context}: Material type not supported`);
    }
    if (!babylonMaterial.subSurface.isRefractionEnabled || !extension.dispersion) {
      return Promise.resolve();
    }
    babylonMaterial.subSurface.isDispersionEnabled = true;
    babylonMaterial.subSurface.dispersion = extension.dispersion;
    return Promise.resolve();
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_dispersion(loader));
export {
  KHR_materials_dispersion
};
