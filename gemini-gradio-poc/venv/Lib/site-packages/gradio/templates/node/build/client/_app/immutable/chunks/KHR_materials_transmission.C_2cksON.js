import { ar as PBRMaterial, an as unregisterGLTFExtension, ao as registerGLTFExtension, O as Observable, b as Tools, as as RenderTargetTexture } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
import { C as Constants } from "./objectModelMapping.r8gj80Ia.js";
class TransmissionHelper {
  /**
   * Creates the default options for the helper.
   * @returns the default options
   */
  static _GetDefaultOptions() {
    return {
      renderSize: 1024,
      samples: 4,
      lodGenerationScale: 1,
      lodGenerationOffset: -4,
      renderTargetTextureType: Constants.TEXTURETYPE_HALF_FLOAT,
      generateMipmaps: true
    };
  }
  /**
   * constructor
   * @param options Defines the options we want to customize the helper
   * @param scene The scene to add the material to
   */
  constructor(options, scene) {
    this._opaqueRenderTarget = null;
    this._opaqueMeshesCache = [];
    this._transparentMeshesCache = [];
    this._materialObservers = {};
    this._options = {
      ...TransmissionHelper._GetDefaultOptions(),
      ...options
    };
    this._scene = scene;
    this._scene._transmissionHelper = this;
    this.onErrorObservable = new Observable();
    this._scene.onDisposeObservable.addOnce(() => {
      this.dispose();
    });
    this._parseScene();
    this._setupRenderTargets();
  }
  /**
   * Updates the background according to the new options
   * @param options
   */
  updateOptions(options) {
    const newValues = Object.keys(options).filter((key) => this._options[key] !== options[key]);
    if (!newValues.length) {
      return;
    }
    const newOptions = {
      ...this._options,
      ...options
    };
    const oldOptions = this._options;
    this._options = newOptions;
    if (newOptions.renderSize !== oldOptions.renderSize || newOptions.renderTargetTextureType !== oldOptions.renderTargetTextureType || newOptions.generateMipmaps !== oldOptions.generateMipmaps || !this._opaqueRenderTarget) {
      this._setupRenderTargets();
    } else {
      this._opaqueRenderTarget.samples = newOptions.samples;
      this._opaqueRenderTarget.lodGenerationScale = newOptions.lodGenerationScale;
      this._opaqueRenderTarget.lodGenerationOffset = newOptions.lodGenerationOffset;
    }
  }
  /**
   * @returns the opaque render target texture or null if not available.
   */
  getOpaqueTarget() {
    return this._opaqueRenderTarget;
  }
  _shouldRenderAsTransmission(material) {
    if (!material) {
      return false;
    }
    if (material instanceof PBRMaterial && material.subSurface.isRefractionEnabled) {
      return true;
    }
    return false;
  }
  _addMesh(mesh) {
    this._materialObservers[mesh.uniqueId] = mesh.onMaterialChangedObservable.add(this._onMeshMaterialChanged.bind(this));
    Tools.SetImmediate(() => {
      if (this._shouldRenderAsTransmission(mesh.material)) {
        mesh.material.refractionTexture = this._opaqueRenderTarget;
        if (this._transparentMeshesCache.indexOf(mesh) === -1) {
          this._transparentMeshesCache.push(mesh);
        }
      } else {
        if (this._opaqueMeshesCache.indexOf(mesh) === -1) {
          this._opaqueMeshesCache.push(mesh);
        }
      }
    });
  }
  _removeMesh(mesh) {
    mesh.onMaterialChangedObservable.remove(this._materialObservers[mesh.uniqueId]);
    delete this._materialObservers[mesh.uniqueId];
    let idx = this._transparentMeshesCache.indexOf(mesh);
    if (idx !== -1) {
      this._transparentMeshesCache.splice(idx, 1);
    }
    idx = this._opaqueMeshesCache.indexOf(mesh);
    if (idx !== -1) {
      this._opaqueMeshesCache.splice(idx, 1);
    }
  }
  _parseScene() {
    this._scene.meshes.forEach(this._addMesh.bind(this));
    this._scene.onNewMeshAddedObservable.add(this._addMesh.bind(this));
    this._scene.onMeshRemovedObservable.add(this._removeMesh.bind(this));
  }
  // When one of the meshes in the scene has its material changed, make sure that it's in the correct cache list.
  _onMeshMaterialChanged(mesh) {
    const transparentIdx = this._transparentMeshesCache.indexOf(mesh);
    const opaqueIdx = this._opaqueMeshesCache.indexOf(mesh);
    const useTransmission = this._shouldRenderAsTransmission(mesh.material);
    if (useTransmission) {
      if (mesh.material instanceof PBRMaterial) {
        mesh.material.subSurface.refractionTexture = this._opaqueRenderTarget;
      }
      if (opaqueIdx !== -1) {
        this._opaqueMeshesCache.splice(opaqueIdx, 1);
        this._transparentMeshesCache.push(mesh);
      } else if (transparentIdx === -1) {
        this._transparentMeshesCache.push(mesh);
      }
    } else {
      if (transparentIdx !== -1) {
        this._transparentMeshesCache.splice(transparentIdx, 1);
        this._opaqueMeshesCache.push(mesh);
      } else if (opaqueIdx === -1) {
        this._opaqueMeshesCache.push(mesh);
      }
    }
  }
  /**
   * @internal
   * Check if the opaque render target has not been disposed and can still be used.
   * @returns
   */
  _isRenderTargetValid() {
    var _a;
    return ((_a = this._opaqueRenderTarget) == null ? void 0 : _a.getInternalTexture()) !== null;
  }
  /**
   * @internal
   * Setup the render targets according to the specified options.
   */
  _setupRenderTargets() {
    var _a;
    if (this._opaqueRenderTarget) {
      this._opaqueRenderTarget.dispose();
    }
    this._opaqueRenderTarget = new RenderTargetTexture("opaqueSceneTexture", this._options.renderSize, this._scene, this._options.generateMipmaps, void 0, this._options.renderTargetTextureType);
    this._opaqueRenderTarget.ignoreCameraViewport = true;
    this._opaqueRenderTarget.renderList = this._opaqueMeshesCache;
    this._opaqueRenderTarget.clearColor = ((_a = this._options.clearColor) == null ? void 0 : _a.clone()) ?? this._scene.clearColor.clone();
    this._opaqueRenderTarget.gammaSpace = false;
    this._opaqueRenderTarget.lodGenerationScale = this._options.lodGenerationScale;
    this._opaqueRenderTarget.lodGenerationOffset = this._options.lodGenerationOffset;
    this._opaqueRenderTarget.samples = this._options.samples;
    this._opaqueRenderTarget.renderSprites = true;
    this._opaqueRenderTarget.renderParticles = true;
    this._opaqueRenderTarget.disableImageProcessing = true;
    let saveSceneEnvIntensity;
    this._opaqueRenderTarget.onBeforeBindObservable.add((opaqueRenderTarget) => {
      saveSceneEnvIntensity = this._scene.environmentIntensity;
      this._scene.environmentIntensity = 1;
      if (!this._options.clearColor) {
        this._scene.clearColor.toLinearSpaceToRef(opaqueRenderTarget.clearColor, this._scene.getEngine().useExactSrgbConversions);
      } else {
        opaqueRenderTarget.clearColor.copyFrom(this._options.clearColor);
      }
    });
    this._opaqueRenderTarget.onAfterUnbindObservable.add(() => {
      this._scene.environmentIntensity = saveSceneEnvIntensity;
    });
    this._transparentMeshesCache.forEach((mesh) => {
      if (this._shouldRenderAsTransmission(mesh.material)) {
        mesh.material.refractionTexture = this._opaqueRenderTarget;
      }
    });
  }
  /**
   * Dispose all the elements created by the Helper.
   */
  dispose() {
    this._scene._transmissionHelper = void 0;
    if (this._opaqueRenderTarget) {
      this._opaqueRenderTarget.dispose();
      this._opaqueRenderTarget = null;
    }
    this._transparentMeshesCache = [];
    this._opaqueMeshesCache = [];
  }
}
const NAME = "KHR_materials_transmission";
class KHR_materials_transmission {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.order = 175;
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
      promises.push(this._loadTransparentPropertiesAsync(extensionContext, material, babylonMaterial, extension));
      return Promise.all(promises).then(() => {
      });
    });
  }
  _loadTransparentPropertiesAsync(context, material, babylonMaterial, extension) {
    var _a, _b;
    if (!(babylonMaterial instanceof PBRMaterial)) {
      throw new Error(`${context}: Material type not supported`);
    }
    const pbrMaterial = babylonMaterial;
    pbrMaterial.subSurface.isRefractionEnabled = true;
    pbrMaterial.subSurface.volumeIndexOfRefraction = 1;
    pbrMaterial.subSurface.useAlbedoToTintRefraction = true;
    if (extension.transmissionFactor !== void 0) {
      pbrMaterial.subSurface.refractionIntensity = extension.transmissionFactor;
      const scene = pbrMaterial.getScene();
      if (pbrMaterial.subSurface.refractionIntensity && !scene._transmissionHelper) {
        new TransmissionHelper({}, pbrMaterial.getScene());
      } else if (pbrMaterial.subSurface.refractionIntensity && !((_a = scene._transmissionHelper) == null ? void 0 : _a._isRenderTargetValid())) {
        (_b = scene._transmissionHelper) == null ? void 0 : _b._setupRenderTargets();
      }
    } else {
      pbrMaterial.subSurface.refractionIntensity = 0;
      pbrMaterial.subSurface.isRefractionEnabled = false;
      return Promise.resolve();
    }
    pbrMaterial.subSurface.minimumThickness = 0;
    pbrMaterial.subSurface.maximumThickness = 0;
    if (extension.transmissionTexture) {
      extension.transmissionTexture.nonColorData = true;
      return this._loader.loadTextureInfoAsync(`${context}/transmissionTexture`, extension.transmissionTexture, void 0).then((texture) => {
        texture.name = `${babylonMaterial.name} (Transmission)`;
        pbrMaterial.subSurface.refractionIntensityTexture = texture;
        pbrMaterial.subSurface.useGltfStyleTextures = true;
      });
    } else {
      return Promise.resolve();
    }
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_transmission(loader));
export {
  KHR_materials_transmission
};
