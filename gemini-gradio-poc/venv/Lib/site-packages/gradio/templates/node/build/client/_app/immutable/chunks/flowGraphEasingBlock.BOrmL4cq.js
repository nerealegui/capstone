import { R as RegisterClass, aA as ExponentialEase, aB as ElasticEase, aC as CubicEase, aD as BounceEase, aE as BackEase, aF as CircleEase, aG as BezierCurveEase } from "./index.B4f7kVg_.js";
import { F as FlowGraphBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny, b as RichTypeNumber } from "./declarationMapper.uCBvEQca.js";
var EasingFunctionType;
(function(EasingFunctionType2) {
  EasingFunctionType2[EasingFunctionType2["CircleEase"] = 0] = "CircleEase";
  EasingFunctionType2[EasingFunctionType2["BackEase"] = 1] = "BackEase";
  EasingFunctionType2[EasingFunctionType2["BounceEase"] = 2] = "BounceEase";
  EasingFunctionType2[EasingFunctionType2["CubicEase"] = 3] = "CubicEase";
  EasingFunctionType2[EasingFunctionType2["ElasticEase"] = 4] = "ElasticEase";
  EasingFunctionType2[EasingFunctionType2["ExponentialEase"] = 5] = "ExponentialEase";
  EasingFunctionType2[EasingFunctionType2["PowerEase"] = 6] = "PowerEase";
  EasingFunctionType2[EasingFunctionType2["QuadraticEase"] = 7] = "QuadraticEase";
  EasingFunctionType2[EasingFunctionType2["QuarticEase"] = 8] = "QuarticEase";
  EasingFunctionType2[EasingFunctionType2["QuinticEase"] = 9] = "QuinticEase";
  EasingFunctionType2[EasingFunctionType2["SineEase"] = 10] = "SineEase";
  EasingFunctionType2[EasingFunctionType2["BezierCurveEase"] = 11] = "BezierCurveEase";
})(EasingFunctionType || (EasingFunctionType = {}));
function CreateEasingFunction(type, ...parameters) {
  switch (type) {
    case 11:
      return new BezierCurveEase(...parameters);
    case 0:
      return new CircleEase();
    case 1:
      return new BackEase(...parameters);
    case 2:
      return new BounceEase(...parameters);
    case 3:
      return new CubicEase();
    case 4:
      return new ElasticEase(...parameters);
    case 5:
      return new ExponentialEase(...parameters);
    default:
      throw new Error("Easing type not yet implemented");
  }
}
class FlowGraphEasingBlock extends FlowGraphBlock {
  constructor(config) {
    super(config);
    this.config = config;
    this._easingFunctions = {};
    this.type = this.registerDataInput("type", RichTypeAny, 11);
    this.mode = this.registerDataInput("mode", RichTypeNumber, 0);
    this.parameters = this.registerDataInput("parameters", RichTypeAny, [1, 0, 0, 1]);
    this.easingFunction = this.registerDataOutput("easingFunction", RichTypeAny);
  }
  _updateOutputs(context) {
    const type = this.type.getValue(context);
    const mode = this.mode.getValue(context);
    const parameters = this.parameters.getValue(context);
    if (type === void 0 || mode === void 0) {
      return;
    }
    const key = `${type}-${mode}-${parameters.join("-")}`;
    if (!this._easingFunctions[key]) {
      const easing = CreateEasingFunction(type, ...parameters);
      easing.setEasingMode(mode);
      this._easingFunctions[key] = easing;
    }
    this.easingFunction.setValue(this._easingFunctions[key], context);
  }
  getClassName() {
    return "FlowGraphEasingBlock";
  }
}
RegisterClass("FlowGraphEasingBlock", FlowGraphEasingBlock);
export {
  EasingFunctionType,
  FlowGraphEasingBlock
};
