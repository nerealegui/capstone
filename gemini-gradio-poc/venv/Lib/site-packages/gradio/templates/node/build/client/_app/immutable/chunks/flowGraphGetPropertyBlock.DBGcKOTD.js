import { R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
import { F as FlowGraphCachedOperationBlock } from "./flowGraphCachedOperationBlock.BYccI7XF.js";
class FlowGraphGetPropertyBlock extends FlowGraphCachedOperationBlock {
  constructor(config) {
    super(RichTypeAny, config);
    this.config = config;
    this.object = this.registerDataInput("object", RichTypeAny, config.object);
    this.propertyName = this.registerDataInput("propertyName", RichTypeAny, config.propertyName);
    this.customGetFunction = this.registerDataInput("customGetFunction", RichTypeAny);
  }
  _doOperation(context) {
    const getter = this.customGetFunction.getValue(context);
    let value;
    if (getter) {
      value = getter(this.object.getValue(context), this.propertyName.getValue(context), context);
    } else {
      const target = this.object.getValue(context);
      const propertyName = this.propertyName.getValue(context);
      value = target && propertyName ? this._getPropertyValue(target, propertyName) : void 0;
    }
    return value;
  }
  _getPropertyValue(target, propertyName) {
    const path = propertyName.split(".");
    let value = target;
    for (const prop of path) {
      value = value[prop];
      if (value === void 0) {
        return;
      }
    }
    return value;
  }
  getClassName() {
    return "FlowGraphGetPropertyBlock";
  }
}
RegisterClass("FlowGraphGetPropertyBlock", FlowGraphGetPropertyBlock);
export {
  FlowGraphGetPropertyBlock
};
