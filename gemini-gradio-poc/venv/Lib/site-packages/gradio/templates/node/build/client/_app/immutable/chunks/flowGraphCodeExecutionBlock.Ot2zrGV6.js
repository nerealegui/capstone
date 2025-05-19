import { F as FlowGraphBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
class FlowGraphCodeExecutionBlock extends FlowGraphBlock {
  /**
   * Construct a FlowGraphCodeExecutionBlock.
   * @param config construction parameters
   */
  constructor(config) {
    super(config);
    this.config = config;
    this.executionFunction = this.registerDataInput("function", RichTypeAny);
    this.value = this.registerDataInput("value", RichTypeAny);
    this.result = this.registerDataOutput("result", RichTypeAny);
  }
  /**
   * @internal
   */
  _updateOutputs(context) {
    const func = this.executionFunction.getValue(context);
    const value = this.value.getValue(context);
    if (func) {
      this.result.setValue(func(value, context), context);
    }
  }
  getClassName() {
    return "FlowGraphCodeExecutionBlock";
  }
}
export {
  FlowGraphCodeExecutionBlock
};
