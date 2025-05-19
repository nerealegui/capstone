import { F as FlowGraphBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { c as RichTypeBoolean } from "./declarationMapper.uCBvEQca.js";
const cacheName = "cachedOperationValue";
const cacheExecIdName = "cachedExecutionId";
class FlowGraphCachedOperationBlock extends FlowGraphBlock {
  constructor(outputRichType, config) {
    super(config);
    this.value = this.registerDataOutput("value", outputRichType);
    this.isValid = this.registerDataOutput("isValid", RichTypeBoolean);
  }
  _updateOutputs(context) {
    const cachedExecutionId = context._getExecutionVariable(this, cacheExecIdName, -1);
    const cachedValue = context._getExecutionVariable(this, cacheName, null);
    if (cachedValue !== void 0 && cachedValue !== null && cachedExecutionId === context.executionId) {
      this.isValid.setValue(true, context);
      this.value.setValue(cachedValue, context);
    } else {
      try {
        const calculatedValue = this._doOperation(context);
        if (calculatedValue === void 0 || calculatedValue === null) {
          this.isValid.setValue(false, context);
          return;
        }
        context._setExecutionVariable(this, cacheName, calculatedValue);
        context._setExecutionVariable(this, cacheExecIdName, context.executionId);
        this.value.setValue(calculatedValue, context);
        this.isValid.setValue(true, context);
      } catch (e) {
        this.isValid.setValue(false, context);
      }
    }
  }
}
export {
  FlowGraphCachedOperationBlock as F
};
