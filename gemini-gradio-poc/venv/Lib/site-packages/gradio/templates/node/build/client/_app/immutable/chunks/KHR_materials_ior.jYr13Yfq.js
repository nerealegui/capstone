import { ar as PBRMaterial, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "KHR_materials_ior";
class KHR_materials_ior {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.order = 180;
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
      promises.push(this._loadIorPropertiesAsync(extensionContext, extension, babylonMaterial));
      return Promise.all(promises).then(() => {
      });
    });
  }
  _loadIorPropertiesAsync(context, properties, babylonMaterial) {
    if (!(babylonMaterial instanceof PBRMaterial)) {
      throw new Error(`${context}: Material type not supported`);
    }
    if (properties.ior !== void 0) {
      babylonMaterial.indexOfRefraction = properties.ior;
    } else {
      babylonMaterial.indexOfRefraction = KHR_materials_ior._DEFAULT_IOR;
    }
    return Promise.resolve();
  }
}
KHR_materials_ior._DEFAULT_IOR = 1.5;
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_ior(loader));
export {
  KHR_materials_ior
};
