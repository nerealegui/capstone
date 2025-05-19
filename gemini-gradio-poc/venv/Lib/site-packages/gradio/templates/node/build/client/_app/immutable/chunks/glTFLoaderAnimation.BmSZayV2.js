import { V as Vector3, Q as Quaternion, ap as Animation } from "./index.B4f7kVg_.js";
import { S as SetInterpolationForKey } from "./objectModelMapping.r8gj80Ia.js";
function getVector3(_target, source, offset, scale) {
  return Vector3.FromArray(source, offset).scaleInPlace(scale);
}
function getQuaternion(_target, source, offset, scale) {
  return Quaternion.FromArray(source, offset).scaleInPlace(scale);
}
function getWeights(target, source, offset, scale) {
  const value = new Array(target._numMorphTargets);
  for (let i = 0; i < value.length; i++) {
    value[i] = source[offset++] * scale;
  }
  return value;
}
class AnimationPropertyInfo {
  /** @internal */
  constructor(type, name, getValue, getStride) {
    this.type = type;
    this.name = name;
    this.getValue = getValue;
    this.getStride = getStride;
  }
  _buildAnimation(name, fps, keys) {
    const babylonAnimation = new Animation(name, this.name, fps, this.type);
    babylonAnimation.setKeys(keys);
    return babylonAnimation;
  }
}
class TransformNodeAnimationPropertyInfo extends AnimationPropertyInfo {
  /** @internal */
  buildAnimations(target, name, fps, keys) {
    const babylonAnimations = [];
    babylonAnimations.push({ babylonAnimatable: target._babylonTransformNode, babylonAnimation: this._buildAnimation(name, fps, keys) });
    return babylonAnimations;
  }
}
class WeightAnimationPropertyInfo extends AnimationPropertyInfo {
  buildAnimations(target, name, fps, keys) {
    const babylonAnimations = [];
    if (target._numMorphTargets) {
      for (let targetIndex = 0; targetIndex < target._numMorphTargets; targetIndex++) {
        const babylonAnimation = new Animation(`${name}_${targetIndex}`, this.name, fps, this.type);
        babylonAnimation.setKeys(keys.map((key) => ({
          frame: key.frame,
          inTangent: key.inTangent ? key.inTangent[targetIndex] : void 0,
          value: key.value[targetIndex],
          outTangent: key.outTangent ? key.outTangent[targetIndex] : void 0,
          interpolation: key.interpolation
        })));
        if (target._primitiveBabylonMeshes) {
          for (const babylonMesh of target._primitiveBabylonMeshes) {
            if (babylonMesh.morphTargetManager) {
              const morphTarget = babylonMesh.morphTargetManager.getTarget(targetIndex);
              const babylonAnimationClone = babylonAnimation.clone();
              morphTarget.animations.push(babylonAnimationClone);
              babylonAnimations.push({ babylonAnimatable: morphTarget, babylonAnimation: babylonAnimationClone });
            }
          }
        }
      }
    }
    return babylonAnimations;
  }
}
SetInterpolationForKey("/nodes/{}/translation", [new TransformNodeAnimationPropertyInfo(Animation.ANIMATIONTYPE_VECTOR3, "position", getVector3, () => 3)]);
SetInterpolationForKey("/nodes/{}/rotation", [new TransformNodeAnimationPropertyInfo(Animation.ANIMATIONTYPE_QUATERNION, "rotationQuaternion", getQuaternion, () => 4)]);
SetInterpolationForKey("/nodes/{}/scale", [new TransformNodeAnimationPropertyInfo(Animation.ANIMATIONTYPE_VECTOR3, "scaling", getVector3, () => 3)]);
SetInterpolationForKey("/nodes/{}/weights", [new WeightAnimationPropertyInfo(Animation.ANIMATIONTYPE_FLOAT, "influence", getWeights, (target) => target._numMorphTargets)]);
export {
  AnimationPropertyInfo,
  TransformNodeAnimationPropertyInfo,
  WeightAnimationPropertyInfo,
  getQuaternion,
  getVector3,
  getWeights
};
