import { F as FlowGraphBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphGetVariableBlock extends FlowGraphBlock {
  /**
   * Construct a FlowGraphGetVariableBlock.
   * @param config construction parameters
   */
  constructor(config) {
    super(config);
    this.config = config;
    this.value = this.registerDataOutput("value", RichTypeAny, config.initialValue);
  }
  /**
   * @internal
   */
  _updateOutputs(context) {
    const variableNameValue = this.config.variable;
    if (context.hasVariable(variableNameValue)) {
      this.value.setValue(context.getVariable(variableNameValue), context);
    }
  }
  /**
   * Serializes this block
   * @param serializationObject the object to serialize to
   */
  serialize(serializationObject) {
    super.serialize(serializationObject);
    serializationObject.config.variable = this.config.variable;
  }
  getClassName() {
    return "FlowGraphGetVariableBlock";
  }
}
RegisterClass("FlowGraphGetVariableBlock", FlowGraphGetVariableBlock);
export {
  FlowGraphGetVariableBlock
};
