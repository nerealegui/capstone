import { F as FlowGraphBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { g as getRichTypeByFlowGraphType, d as getRichTypeByAnimationType, b as RichTypeNumber, R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { ap as Animation, R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphInterpolationBlock extends FlowGraphBlock {
  constructor(config = {}) {
    super(config);
    this.keyFrames = [];
    const type = typeof (config == null ? void 0 : config.animationType) === "string" ? getRichTypeByFlowGraphType(config.animationType) : getRichTypeByAnimationType((config == null ? void 0 : config.animationType) ?? 0);
    const numberOfKeyFrames = (config == null ? void 0 : config.keyFramesCount) ?? 1;
    const duration = this.registerDataInput(`duration_0`, RichTypeNumber, 0);
    const value = this.registerDataInput(`value_0`, type);
    this.keyFrames.push({ duration, value });
    for (let i = 1; i < numberOfKeyFrames + 1; i++) {
      const duration2 = this.registerDataInput(`duration_${i}`, RichTypeNumber, i === numberOfKeyFrames ? config.duration : void 0);
      const value2 = this.registerDataInput(`value_${i}`, type);
      this.keyFrames.push({ duration: duration2, value: value2 });
    }
    this.initialValue = this.keyFrames[0].value;
    this.endValue = this.keyFrames[numberOfKeyFrames].value;
    this.easingFunction = this.registerDataInput("easingFunction", RichTypeAny);
    this.animation = this.registerDataOutput("animation", RichTypeAny);
    this.propertyName = this.registerDataInput("propertyName", RichTypeAny, config == null ? void 0 : config.propertyName);
    this.customBuildAnimation = this.registerDataInput("customBuildAnimation", RichTypeAny);
  }
  _updateOutputs(context) {
    const interpolationAnimations = context._getGlobalContextVariable("interpolationAnimations", []);
    const propertyName = this.propertyName.getValue(context);
    const easingFunction = this.easingFunction.getValue(context);
    const animation = this._createAnimation(context, propertyName, easingFunction);
    this.animation.setValue(animation, context);
    if (Array.isArray(animation)) {
      for (const anim of animation) {
        interpolationAnimations.push(anim.uniqueId);
      }
    } else {
      interpolationAnimations.push(animation.uniqueId);
    }
    context._setGlobalContextVariable("interpolationAnimations", interpolationAnimations);
  }
  _createAnimation(context, propertyName, easingFunction) {
    var _a, _b, _c;
    const type = this.initialValue.richType;
    const keys = [];
    const currentValue = this.initialValue.getValue(context) || type.defaultValue;
    keys.push({ frame: 0, value: currentValue });
    const numberOfKeyFrames = ((_a = this.config) == null ? void 0 : _a.numberOfKeyFrames) ?? 1;
    for (let i = 1; i < numberOfKeyFrames + 1; i++) {
      const duration = (_b = this.keyFrames[i].duration) == null ? void 0 : _b.getValue(context);
      let value = (_c = this.keyFrames[i].value) == null ? void 0 : _c.getValue(context);
      if (i === numberOfKeyFrames - 1) {
        value = value || type.defaultValue;
      }
      if (duration !== void 0 && value) {
        keys.push({ frame: duration * 60, value });
      }
    }
    const customBuildAnimation = this.customBuildAnimation.getValue(context);
    if (customBuildAnimation) {
      return customBuildAnimation()(keys, 60, type.animationType, easingFunction);
    }
    if (typeof propertyName === "string") {
      const animation = Animation.CreateAnimation(propertyName, type.animationType, 60, easingFunction);
      animation.setKeys(keys);
      return [animation];
    } else {
      const animations = propertyName.map((name) => {
        const animation = Animation.CreateAnimation(name, type.animationType, 60, easingFunction);
        animation.setKeys(keys);
        return animation;
      });
      return animations;
    }
  }
  getClassName() {
    return "FlowGraphInterpolationBlock";
  }
}
RegisterClass("FlowGraphInterpolationBlock", FlowGraphInterpolationBlock);
export {
  FlowGraphInterpolationBlock
};
