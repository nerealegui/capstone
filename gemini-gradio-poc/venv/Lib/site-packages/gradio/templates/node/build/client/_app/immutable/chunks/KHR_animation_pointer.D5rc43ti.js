import { ap as Animation, C as Color3, h as Logger, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { S as SetInterpolationForKey, G as GetPathToObjectConverter } from "./objectModelMapping.r8gj80Ia.js";
import { AnimationPropertyInfo } from "./glTFLoaderAnimation.BmSZayV2.js";
function getColor3(_target, source, offset, scale) {
  return Color3.FromArray(source, offset).scale(scale);
}
function getAlpha(_target, source, offset, scale) {
  return source[offset + 3] * scale;
}
function getFloat(_target, source, offset, scale) {
  return source[offset] * scale;
}
function getMinusFloat(_target, source, offset, scale) {
  return -source[offset] * scale;
}
function getNextFloat(_target, source, offset, scale) {
  return source[offset + 1] * scale;
}
function getFloatBy2(_target, source, offset, scale) {
  return source[offset] * scale * 2;
}
function getTextureTransformTree(textureName) {
  return {
    scale: [
      new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, `${textureName}.uScale`, getFloat, () => 2),
      new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, `${textureName}.vScale`, getNextFloat, () => 2)
    ],
    offset: [
      new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, `${textureName}.uOffset`, getFloat, () => 2),
      new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, `${textureName}.vOffset`, getNextFloat, () => 2)
    ],
    rotation: [new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, `${textureName}.wAng`, getMinusFloat, () => 1)]
  };
}
class CameraAnimationPropertyInfo extends AnimationPropertyInfo {
  /** @internal */
  buildAnimations(target, name, fps, keys) {
    return [{ babylonAnimatable: target._babylonCamera, babylonAnimation: this._buildAnimation(name, fps, keys) }];
  }
}
class MaterialAnimationPropertyInfo extends AnimationPropertyInfo {
  /** @internal */
  buildAnimations(target, name, fps, keys) {
    const babylonAnimations = [];
    for (const fillMode in target._data) {
      babylonAnimations.push({
        babylonAnimatable: target._data[fillMode].babylonMaterial,
        babylonAnimation: this._buildAnimation(name, fps, keys)
      });
    }
    return babylonAnimations;
  }
}
class LightAnimationPropertyInfo extends AnimationPropertyInfo {
  /** @internal */
  buildAnimations(target, name, fps, keys) {
    return [{ babylonAnimatable: target._babylonLight, babylonAnimation: this._buildAnimation(name, fps, keys) }];
  }
}
SetInterpolationForKey("/cameras/{}/orthographic/xmag", [
  new CameraAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "orthoLeft", getMinusFloat, () => 1),
  new CameraAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "orthoRight", getNextFloat, () => 1)
]);
SetInterpolationForKey("/cameras/{}/orthographic/ymag", [
  new CameraAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "orthoBottom", getMinusFloat, () => 1),
  new CameraAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "orthoTop", getNextFloat, () => 1)
]);
SetInterpolationForKey("/cameras/{}/orthographic/zfar", [new CameraAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "maxZ", getFloat, () => 1)]);
SetInterpolationForKey("/cameras/{}/orthographic/znear", [new CameraAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "minZ", getFloat, () => 1)]);
SetInterpolationForKey("/cameras/{}/perspective/yfov", [new CameraAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "fov", getFloat, () => 1)]);
SetInterpolationForKey("/cameras/{}/perspective/zfar", [new CameraAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "maxZ", getFloat, () => 1)]);
SetInterpolationForKey("/cameras/{}/perspective/znear", [new CameraAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "minZ", getFloat, () => 1)]);
SetInterpolationForKey("/materials/{}/pbrMetallicRoughness/baseColorFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_COLOR3, "albedoColor", getColor3, () => 4),
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "alpha", getAlpha, () => 4)
]);
SetInterpolationForKey("/materials/{}/pbrMetallicRoughness/metallicFactor", [new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "metallic", getFloat, () => 1)]);
SetInterpolationForKey("/materials/{}/pbrMetallicRoughness/metallicFactor", [new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "roughness", getFloat, () => 1)]);
const baseColorTextureInterpolation = getTextureTransformTree("albedoTexture");
SetInterpolationForKey("/materials/{}/pbrMetallicRoughness/baseColorTexture/extensions/KHR_texture_transform/scale", baseColorTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/pbrMetallicRoughness/baseColorTexture/extensions/KHR_texture_transform/offset", baseColorTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/pbrMetallicRoughness/baseColorTexture/extensions/KHR_texture_transform/rotation", baseColorTextureInterpolation.rotation);
const metallicRoughnessTextureInterpolation = getTextureTransformTree("metallicTexture");
SetInterpolationForKey("//materials/{}/pbrMetallicRoughness/metallicRoughnessTexture/scale", metallicRoughnessTextureInterpolation.scale);
SetInterpolationForKey("//materials/{}/pbrMetallicRoughness/metallicRoughnessTexture/offset", metallicRoughnessTextureInterpolation.offset);
SetInterpolationForKey("//materials/{}/pbrMetallicRoughness/metallicRoughnessTexture/rotation", metallicRoughnessTextureInterpolation.rotation);
SetInterpolationForKey("/materials/{}/emissiveFactor", [new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_COLOR3, "emissiveColor", getColor3, () => 3)]);
const normalTextureInterpolation = getTextureTransformTree("bumpTexture");
SetInterpolationForKey("/materials/{}/normalTexture/scale", [new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "bumpTexture.level", getFloat, () => 1)]);
SetInterpolationForKey("/materials/{}/normalTexture/extensions/KHR_texture_transform/scale", normalTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/normalTexture/extensions/KHR_texture_transform/offset", normalTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/normalTexture/extensions/KHR_texture_transform/rotation", normalTextureInterpolation.rotation);
SetInterpolationForKey("/materials/{}/occlusionTexture/strength", [new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "ambientTextureStrength", getFloat, () => 1)]);
const occlusionTextureInterpolation = getTextureTransformTree("ambientTexture");
SetInterpolationForKey("/materials/{}/occlusionTexture/extensions/KHR_texture_transform/scale", occlusionTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/occlusionTexture/extensions/KHR_texture_transform/offset", occlusionTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/occlusionTexture/extensions/KHR_texture_transform/rotation", occlusionTextureInterpolation.rotation);
const emissiveTextureInterpolation = getTextureTransformTree("emissiveTexture");
SetInterpolationForKey("/materials/{}/emissiveTexture/extensions/KHR_texture_transform/scale", emissiveTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/emissiveTexture/extensions/KHR_texture_transform/offset", emissiveTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/emissiveTexture/extensions/KHR_texture_transform/rotation", emissiveTextureInterpolation.rotation);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_anisotropy/anisotropyStrength", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "anisotropy.intensity", getFloat, () => 1)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_anisotropy/anisotropyRotation", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "anisotropy.angle", getFloat, () => 1)
]);
const anisotropyTextureInterpolation = getTextureTransformTree("anisotropy.texture");
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_anisotropy/anisotropyTexture/extensions/KHR_texture_transform/scale", anisotropyTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_anisotropy/anisotropyTexture/extensions/KHR_texture_transform/offset", anisotropyTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_anisotropy/anisotropyTexture/extensions/KHR_texture_transform/rotation", anisotropyTextureInterpolation.rotation);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_clearcoat/clearcoatFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "clearCoat.intensity", getFloat, () => 1)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_clearcoat/clearcoatRoughnessFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "clearCoat.roughness", getFloat, () => 1)
]);
const clearcoatTextureInterpolation = getTextureTransformTree("clearCoat.texture");
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_clearcoat/clearcoatTexture/extensions/KHR_texture_transform/scale", clearcoatTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_clearcoat/clearcoatTexture/extensions/KHR_texture_transform/offset", clearcoatTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_clearcoat/clearcoatTexture/extensions/KHR_texture_transform/rotation", clearcoatTextureInterpolation.rotation);
const clearcoatNormalTextureInterpolation = getTextureTransformTree("clearCoat.bumpTexture");
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_clearcoat/clearcoatNormalTexture/scale", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "clearCoat.bumpTexture.level", getFloat, () => 1)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_clearcoat/clearcoatNormalTexture/extensions/KHR_texture_transform/scale", clearcoatNormalTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_clearcoat/clearcoatNormalTexture/extensions/KHR_texture_transform/offset", clearcoatNormalTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_clearcoat/clearcoatNormalTexture/extensions/KHR_texture_transform/rotation", clearcoatNormalTextureInterpolation.rotation);
const clearcoatRoughnessTextureInterpolation = getTextureTransformTree("clearCoat.textureRoughness");
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_clearcoat/clearcoatRoughnessTexture/extensions/KHR_texture_transform/scale", clearcoatRoughnessTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_clearcoat/clearcoatRoughnessTexture/extensions/KHR_texture_transform/offset", clearcoatRoughnessTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_clearcoat/clearcoatRoughnessTexture/extensions/KHR_texture_transform/rotation", clearcoatRoughnessTextureInterpolation.rotation);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_dispersion/dispersionFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "subSurface.dispersion", getFloat, () => 1)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_emissive_strength/emissiveStrength", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "emissiveIntensity", getFloat, () => 1)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_ior/ior", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "indexOfRefraction", getFloat, () => 1)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_iridescence/iridescenceFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "iridescence.intensity", getFloat, () => 1)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_iridescence/iridescenceIor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "iridescence.indexOfRefraction", getFloat, () => 1)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_iridescence/iridescenceThicknessMinimum", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "iridescence.minimumThickness", getFloat, () => 1)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_iridescence/iridescenceThicknessMaximum", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "iridescence.maximumThickness", getFloat, () => 1)
]);
const iridescenceTextureInterpolation = getTextureTransformTree("iridescence.texture");
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_iridescence/iridescenceTexture/extensions/KHR_texture_transform/scale", iridescenceTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_iridescence/iridescenceTexture/extensions/KHR_texture_transform/offset", iridescenceTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_iridescence/iridescenceTexture/extensions/KHR_texture_transform/rotation", iridescenceTextureInterpolation.rotation);
const iridescenceThicknessTextureInterpolation = getTextureTransformTree("iridescence.thicknessTexture");
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_iridescence/iridescenceThicknessTexture/extensions/KHR_texture_transform/scale", iridescenceThicknessTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_iridescence/iridescenceThicknessTexture/extensions/KHR_texture_transform/offset", iridescenceThicknessTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_iridescence/iridescenceThicknessTexture/extensions/KHR_texture_transform/rotation", iridescenceThicknessTextureInterpolation.rotation);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_sheen/sheenColorFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_COLOR3, "sheen.color", getColor3, () => 3)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_sheen/sheenRoughnessFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "sheen.roughness", getFloat, () => 1)
]);
const sheenTextureInterpolation = getTextureTransformTree("sheen.texture");
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_sheen/sheenColorTexture/extensions/KHR_texture_transform/scale", sheenTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_sheen/sheenColorTexture/extensions/KHR_texture_transform/offset", sheenTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_sheen/sheenColorTexture/extensions/KHR_texture_transform/rotation", sheenTextureInterpolation.rotation);
const sheenRoughnessTextureInterpolation = getTextureTransformTree("sheen.textureRoughness");
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_sheen/sheenRoughnessTexture/extensions/KHR_texture_transform/scale", sheenRoughnessTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_sheen/sheenRoughnessTexture/extensions/KHR_texture_transform/offset", sheenRoughnessTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_sheen/sheenRoughnessTexture/extensions/KHR_texture_transform/rotation", sheenRoughnessTextureInterpolation.rotation);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_specular/specularFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "metallicF0Factor", getFloat, () => 1)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_specular/specularColorFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_COLOR3, "metallicReflectanceColor", getColor3, () => 3)
]);
const specularTextureInterpolation = getTextureTransformTree("metallicReflectanceTexture");
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_specular/specularTexture/extensions/KHR_texture_transform/scale", specularTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_specular/specularTexture/extensions/KHR_texture_transform/offset", specularTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_specular/specularTexture/extensions/KHR_texture_transform/rotation", specularTextureInterpolation.rotation);
const specularColorTextureInterpolation = getTextureTransformTree("reflectanceTexture");
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_specular/specularColorTexture/extensions/KHR_texture_transform/scale", specularColorTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_specular/specularColorTexture/extensions/KHR_texture_transform/offset", specularColorTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_specular/specularColorTexture/extensions/KHR_texture_transform/rotation", specularColorTextureInterpolation.rotation);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_transmission/transmissionFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "subSurface.refractionIntensity", getFloat, () => 1)
]);
const transmissionTextureInterpolation = getTextureTransformTree("subSurface.refractionIntensityTexture");
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_transmission/transmissionTexture/extensions/KHR_texture_transform/scale", transmissionTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_transmission/transmissionTexture/extensions/KHR_texture_transform/offset", transmissionTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_transmission/transmissionTexture/extensions/KHR_texture_transform/rotation", transmissionTextureInterpolation.rotation);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_volume/attenuationColor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_COLOR3, "subSurface.tintColor", getColor3, () => 3)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_volume/attenuationDistance", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "subSurface.tintColorAtDistance", getFloat, () => 1)
]);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_volume/thicknessFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "subSurface.maximumThickness", getFloat, () => 1)
]);
const thicknessTextureInterpolation = getTextureTransformTree("subSurface.thicknessTexture");
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_volume/thicknessTexture/extensions/KHR_texture_transform/scale", thicknessTextureInterpolation.scale);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_volume/thicknessTexture/extensions/KHR_texture_transform/offset", thicknessTextureInterpolation.offset);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_volume/thicknessTexture/extensions/KHR_texture_transform/rotation", thicknessTextureInterpolation.rotation);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_diffuse_transmission/diffuseTransmissionFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "subSurface.translucencyIntensity", getFloat, () => 1)
]);
const diffuseTransmissionTextureInterpolation = getTextureTransformTree("subSurface.translucencyIntensityTexture");
SetInterpolationForKey("materials/{}/extensions/KHR_materials_diffuse_transmission/diffuseTransmissionTexture/extensions/KHR_texture_transform/scale", diffuseTransmissionTextureInterpolation.scale);
SetInterpolationForKey("materials/{}/extensions/KHR_materials_diffuse_transmission/diffuseTransmissionTexture/extensions/KHR_texture_transform/offset", diffuseTransmissionTextureInterpolation.offset);
SetInterpolationForKey("materials/{}/extensions/KHR_materials_diffuse_transmission/diffuseTransmissionTexture/extensions/KHR_texture_transform/rotation", diffuseTransmissionTextureInterpolation.rotation);
SetInterpolationForKey("/materials/{}/extensions/KHR_materials_diffuse_transmission/diffuseTransmissionColorFactor", [
  new MaterialAnimationPropertyInfo(Animation.ANIMATIONTYPE_COLOR3, "subSurface.translucencyColor", getColor3, () => 3)
]);
const diffuseTransmissionColorTextureInterpolation = getTextureTransformTree("subSurface.translucencyColorTexture");
SetInterpolationForKey("materials/{}/extensions/KHR_materials_diffuse_transmission/diffuseTransmissionColorTexture/extensions/KHR_texture_transform/scale", diffuseTransmissionColorTextureInterpolation.scale);
SetInterpolationForKey("materials/{}/extensions/KHR_materials_diffuse_transmission/diffuseTransmissionColorTexture/extensions/KHR_texture_transform/offset", diffuseTransmissionColorTextureInterpolation.offset);
SetInterpolationForKey("materials/{}/extensions/KHR_materials_diffuse_transmission/diffuseTransmissionColorTexture/extensions/KHR_texture_transform/rotation", diffuseTransmissionColorTextureInterpolation.rotation);
SetInterpolationForKey("/extensions/KHR_lights_punctual/lights/{}/color", [new LightAnimationPropertyInfo(Animation.ANIMATIONTYPE_COLOR3, "diffuse", getColor3, () => 3)]);
SetInterpolationForKey("/extensions/KHR_lights_punctual/lights/{}/intensity", [new LightAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "intensity", getFloat, () => 1)]);
SetInterpolationForKey("/extensions/KHR_lights_punctual/lights/{}/range", [new LightAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "range", getFloat, () => 1)]);
SetInterpolationForKey("/extensions/KHR_lights_punctual/lights/{}/spot/innerConeAngle", [
  new LightAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "innerAngle", getFloatBy2, () => 1)
]);
SetInterpolationForKey("/extensions/KHR_lights_punctual/lights/{}/spot/outerConeAngle", [
  new LightAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "angle", getFloatBy2, () => 1)
]);
SetInterpolationForKey("/nodes/{}/extensions/EXT_lights_ies/color", [new LightAnimationPropertyInfo(Animation.ANIMATIONTYPE_COLOR3, "diffuse", getColor3, () => 3)]);
SetInterpolationForKey("/nodes/{}/extensions/EXT_lights_ies/multiplier", [new LightAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "intensity", getFloat, () => 1)]);
const NAME = "KHR_animation_pointer";
class KHR_animation_pointer {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this._loader = loader;
    this._pathToObjectConverter = GetPathToObjectConverter(this._loader.gltf);
  }
  /**
   * Defines whether this extension is enabled.
   */
  get enabled() {
    return this._loader.isExtensionUsed(NAME);
  }
  /** @internal */
  dispose() {
    this._loader = null;
    delete this._pathToObjectConverter;
  }
  /**
   * Loads a glTF animation channel.
   * @param context The context when loading the asset
   * @param animationContext The context of the animation when loading the asset
   * @param animation The glTF animation property
   * @param channel The glTF animation channel property
   * @param onLoad Called for each animation loaded
   * @returns A void promise that resolves when the load is complete or null if not handled
   */
  _loadAnimationChannelAsync(context, animationContext, animation, channel, onLoad) {
    var _a;
    const extension = (_a = channel.target.extensions) == null ? void 0 : _a.KHR_animation_pointer;
    if (!extension || !this._pathToObjectConverter) {
      return null;
    }
    if (channel.target.path !== "pointer") {
      Logger.Warn(`${context}/target/path: Value (${channel.target.path}) must be (${"pointer"}) when using the ${this.name} extension`);
    }
    if (channel.target.node != void 0) {
      Logger.Warn(`${context}/target/node: Value (${channel.target.node}) must not be present when using the ${this.name} extension`);
    }
    const extensionContext = `${context}/extensions/${this.name}`;
    const pointer = extension.pointer;
    if (!pointer) {
      throw new Error(`${extensionContext}: Pointer is missing`);
    }
    try {
      const obj = this._pathToObjectConverter.convert(pointer);
      if (!obj.info.interpolation) {
        throw new Error(`${extensionContext}/pointer: Interpolation is missing`);
      }
      return this._loader._loadAnimationChannelFromTargetInfoAsync(context, animationContext, animation, channel, {
        object: obj.object,
        info: obj.info.interpolation
      }, onLoad);
    } catch (e) {
      Logger.Warn(`${extensionContext}/pointer: Invalid pointer (${pointer}) skipped`);
      return null;
    }
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_animation_pointer(loader));
export {
  KHR_animation_pointer
};
