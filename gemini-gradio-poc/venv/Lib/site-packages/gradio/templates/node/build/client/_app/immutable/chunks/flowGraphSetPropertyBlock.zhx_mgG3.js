import { b as FlowGraphExecutionBlockWithOutSignal } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphSetPropertyBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config) {
    super(config);
    this.config = config;
    this.object = this.registerDataInput("object", RichTypeAny, config.target);
    this.value = this.registerDataInput("value", RichTypeAny);
    this.propertyName = this.registerDataInput("propertyName", RichTypeAny, config.propertyName);
    this.customSetFunction = this.registerDataInput("customSetFunction", RichTypeAny);
  }
  _execute(context, _callingSignal) {
    try {
      const target = this.object.getValue(context);
      const value = this.value.getValue(context);
      const setFunction = this.customSetFunction.getValue(context);
      if (setFunction) {
        setFunction(target, this.propertyName.getValue(context), value, context);
      } else {
        this._setPropertyValue(target, this.propertyName.getValue(context), value);
      }
    } catch (e) {
      this._reportError(context, e);
    }
    this.out._activateSignal(context);
  }
  _setPropertyValue(target, propertyName, value) {
    const path = propertyName.split(".");
    let obj = target;
    for (let i = 0; i < path.length - 1; i++) {
      const prop = path[i];
      if (obj[prop] === void 0) {
        obj[prop] = {};
      }
      obj = obj[prop];
    }
    obj[path[path.length - 1]] = value;
  }
  getClassName() {
    return "FlowGraphSetPropertyBlock";
  }
}
RegisterClass("FlowGraphSetPropertyBlock", FlowGraphSetPropertyBlock);
export {
  FlowGraphSetPropertyBlock
};
