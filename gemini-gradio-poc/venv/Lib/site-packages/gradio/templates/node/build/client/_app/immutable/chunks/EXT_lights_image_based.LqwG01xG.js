import { S as SerializationHelper, Q as Quaternion, M as Matrix, aQ as SphericalHarmonics, ai as SphericalPolynomial, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { _ as _UpdateRGBDAsync } from "./environmentTextureTools.RrwvyXPe.js";
import { CubeTexture } from "./cubeTexture.BHciWKtv.js";
import { GLTFLoader, ArrayItem } from "./glTFLoader.D0mNbVQS.js";
class RawCubeTexture extends CubeTexture {
  /**
   * Creates a cube texture where the raw buffers are passed in.
   * @param scene defines the scene the texture is attached to
   * @param data defines the array of data to use to create each face
   * @param size defines the size of the textures
   * @param format defines the format of the data
   * @param type defines the type of the data (like Engine.TEXTURETYPE_UNSIGNED_BYTE)
   * @param generateMipMaps  defines if the engine should generate the mip levels
   * @param invertY defines if data must be stored with Y axis inverted
   * @param samplingMode defines the required sampling mode (like Texture.NEAREST_SAMPLINGMODE)
   * @param compression defines the compression used (null by default)
   */
  constructor(scene, data, size, format = 5, type = 0, generateMipMaps = false, invertY = false, samplingMode = 3, compression = null) {
    super("", scene);
    this._texture = scene.getEngine().createRawCubeTexture(data, size, format, type, generateMipMaps, invertY, samplingMode, compression);
  }
  /**
   * Updates the raw cube texture.
   * @param data defines the data to store
   * @param format defines the data format
   * @param type defines the type fo the data (Engine.TEXTURETYPE_UNSIGNED_BYTE by default)
   * @param invertY defines if data must be stored with Y axis inverted
   * @param compression defines the compression used (null by default)
   */
  update(data, format, type, invertY, compression = null) {
    this._texture.getEngine().updateRawCubeTexture(this._texture, data, format, type, invertY, compression);
  }
  /**
   * Updates a raw cube texture with RGBD encoded data.
   * @param data defines the array of data [mipmap][face] to use to create each face
   * @param sphericalPolynomial defines the spherical polynomial for irradiance
   * @param lodScale defines the scale applied to environment texture. This manages the range of LOD level used for IBL according to the roughness
   * @param lodOffset defines the offset applied to environment texture. This manages first LOD level used for IBL according to the roughness
   * @returns a promise that resolves when the operation is complete
   */
  updateRGBDAsync(data, sphericalPolynomial = null, lodScale = 0.8, lodOffset = 0) {
    return _UpdateRGBDAsync(this._texture, data, sphericalPolynomial, lodScale, lodOffset).then(() => {
    });
  }
  /**
   * Clones the raw cube texture.
   * @returns a new cube texture
   */
  clone() {
    return SerializationHelper.Clone(() => {
      const scene = this.getScene();
      const internalTexture = this._texture;
      const texture = new RawCubeTexture(scene, internalTexture._bufferViewArray, internalTexture.width, internalTexture.format, internalTexture.type, internalTexture.generateMipMaps, internalTexture.invertY, internalTexture.samplingMode, internalTexture._compression);
      if (internalTexture.source === 13) {
        texture.updateRGBDAsync(internalTexture._bufferViewArrayArray, internalTexture._sphericalPolynomial, internalTexture._lodGenerationScale, internalTexture._lodGenerationOffset);
      }
      return texture;
    }, this);
  }
}
const NAME = "EXT_lights_image_based";
class EXT_lights_image_based {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this._loader = loader;
    this.enabled = this._loader.isExtensionUsed(NAME);
  }
  /** @internal */
  dispose() {
    this._loader = null;
    delete this._lights;
  }
  /** @internal */
  onLoading() {
    const extensions = this._loader.gltf.extensions;
    if (extensions && extensions[this.name]) {
      const extension = extensions[this.name];
      this._lights = extension.lights;
    }
  }
  /**
   * @internal
   */
  loadSceneAsync(context, scene) {
    return GLTFLoader.LoadExtensionAsync(context, scene, this.name, (extensionContext, extension) => {
      this._loader._allMaterialsDirtyRequired = true;
      const promises = new Array();
      promises.push(this._loader.loadSceneAsync(context, scene));
      this._loader.logOpen(`${extensionContext}`);
      const light = ArrayItem.Get(`${extensionContext}/light`, this._lights, extension.light);
      promises.push(this._loadLightAsync(`/extensions/${this.name}/lights/${extension.light}`, light).then((texture) => {
        this._loader.babylonScene.environmentTexture = texture;
      }));
      this._loader.logClose();
      return Promise.all(promises).then(() => {
      });
    });
  }
  _loadLightAsync(context, light) {
    if (!light._loaded) {
      const promises = new Array();
      this._loader.logOpen(`${context}`);
      const imageData = new Array(light.specularImages.length);
      for (let mipmap = 0; mipmap < light.specularImages.length; mipmap++) {
        const faces = light.specularImages[mipmap];
        imageData[mipmap] = new Array(faces.length);
        for (let face = 0; face < faces.length; face++) {
          const specularImageContext = `${context}/specularImages/${mipmap}/${face}`;
          this._loader.logOpen(`${specularImageContext}`);
          const index = faces[face];
          const image = ArrayItem.Get(specularImageContext, this._loader.gltf.images, index);
          promises.push(this._loader.loadImageAsync(`/images/${index}`, image).then((data) => {
            imageData[mipmap][face] = data;
          }));
          this._loader.logClose();
        }
      }
      this._loader.logClose();
      light._loaded = Promise.all(promises).then(() => {
        const babylonTexture = new RawCubeTexture(this._loader.babylonScene, null, light.specularImageSize);
        babylonTexture.name = light.name || "environment";
        light._babylonTexture = babylonTexture;
        if (light.intensity != void 0) {
          babylonTexture.level = light.intensity;
        }
        if (light.rotation) {
          let rotation = Quaternion.FromArray(light.rotation);
          if (!this._loader.babylonScene.useRightHandedSystem) {
            rotation = Quaternion.Inverse(rotation);
          }
          Matrix.FromQuaternionToRef(rotation, babylonTexture.getReflectionTextureMatrix());
        }
        if (!light.irradianceCoefficients) {
          throw new Error(`${context}: Irradiance coefficients are missing`);
        }
        const sphericalHarmonics = SphericalHarmonics.FromArray(light.irradianceCoefficients);
        sphericalHarmonics.scaleInPlace(light.intensity);
        sphericalHarmonics.convertIrradianceToLambertianRadiance();
        const sphericalPolynomial = SphericalPolynomial.FromHarmonics(sphericalHarmonics);
        const lodGenerationScale = (imageData.length - 1) / Math.log2(light.specularImageSize);
        return babylonTexture.updateRGBDAsync(imageData, sphericalPolynomial, lodGenerationScale);
      });
    }
    return light._loaded.then(() => {
      return light._babylonTexture;
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new EXT_lights_image_based(loader));
export {
  EXT_lights_image_based
};
