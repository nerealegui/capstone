import { aG as BezierCurveEase, R as RegisterClass } from "./index.B4f7kVg_.js";
import { F as FlowGraphBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { b as RichTypeNumber, f as RichTypeVector2, R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
class FlowGraphBezierCurveEasingBlock extends FlowGraphBlock {
  constructor(config) {
    super(config);
    this.config = config;
    this._easingFunctions = {};
    this.mode = this.registerDataInput("mode", RichTypeNumber, 0);
    this.controlPoint1 = this.registerDataInput("controlPoint1", RichTypeVector2);
    this.controlPoint2 = this.registerDataInput("controlPoint2", RichTypeVector2);
    this.easingFunction = this.registerDataOutput("easingFunction", RichTypeAny);
  }
  _updateOutputs(context) {
    const mode = this.mode.getValue(context);
    const controlPoint1 = this.controlPoint1.getValue(context);
    const controlPoint2 = this.controlPoint2.getValue(context);
    if (mode === void 0) {
      return;
    }
    const key = `${mode}-${controlPoint1.x}-${controlPoint1.y}-${controlPoint2.x}-${controlPoint2.y}`;
    if (!this._easingFunctions[key]) {
      const easing = new BezierCurveEase(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y);
      easing.setEasingMode(mode);
      this._easingFunctions[key] = easing;
    }
    this.easingFunction.setValue(this._easingFunctions[key], context);
  }
  getClassName() {
    return "FlowGraphBezierCurveEasing";
  }
}
RegisterClass("FlowGraphBezierCurveEasing", FlowGraphBezierCurveEasingBlock);
export {
  FlowGraphBezierCurveEasingBlock
};
