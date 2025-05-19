import { ar as PBRMaterial, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "KHR_materials_volume";
class KHR_materials_volume {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.order = 173;
    this._loader = loader;
    this.enabled = this._loader.isExtensionUsed(NAME);
    if (this.enabled) {
      this._loader._disableInstancedMesh++;
    }
  }
  /** @internal */
  dispose() {
    if (this.enabled) {
      this._loader._disableInstancedMesh--;
    }
    this._loader = null;
  }
  /**
   * @internal
   */
  loadMaterialPropertiesAsync(context, material, babylonMaterial) {
    return GLTFLoader.LoadExtensionAsync(context, material, this.name, (extensionContext, extension) => {
      const promises = new Array();
      promises.push(this._loader.loadMaterialPropertiesAsync(context, material, babylonMaterial));
      promises.push(this._loadVolumePropertiesAsync(extensionContext, material, babylonMaterial, extension));
      return Promise.all(promises).then(() => {
      });
    });
  }
  _loadVolumePropertiesAsync(context, material, babylonMaterial, extension) {
    if (!(babylonMaterial instanceof PBRMaterial)) {
      throw new Error(`${context}: Material type not supported`);
    }
    if (!babylonMaterial.subSurface.isRefractionEnabled && !babylonMaterial.subSurface.isTranslucencyEnabled || !extension.thicknessFactor) {
      return Promise.resolve();
    }
    babylonMaterial.subSurface.volumeIndexOfRefraction = babylonMaterial.indexOfRefraction;
    const attenuationDistance = extension.attenuationDistance !== void 0 ? extension.attenuationDistance : Number.MAX_VALUE;
    babylonMaterial.subSurface.tintColorAtDistance = attenuationDistance;
    if (extension.attenuationColor !== void 0 && extension.attenuationColor.length == 3) {
      babylonMaterial.subSurface.tintColor.copyFromFloats(extension.attenuationColor[0], extension.attenuationColor[1], extension.attenuationColor[2]);
    }
    babylonMaterial.subSurface.minimumThickness = 0;
    babylonMaterial.subSurface.maximumThickness = extension.thicknessFactor;
    babylonMaterial.subSurface.useThicknessAsDepth = true;
    if (extension.thicknessTexture) {
      extension.thicknessTexture.nonColorData = true;
      return this._loader.loadTextureInfoAsync(`${context}/thicknessTexture`, extension.thicknessTexture).then((texture) => {
        texture.name = `${babylonMaterial.name} (Thickness)`;
        babylonMaterial.subSurface.thicknessTexture = texture;
        babylonMaterial.subSurface.useGltfStyleTextures = true;
      });
    } else {
      return Promise.resolve();
    }
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_volume(loader));
export {
  KHR_materials_volume
};
