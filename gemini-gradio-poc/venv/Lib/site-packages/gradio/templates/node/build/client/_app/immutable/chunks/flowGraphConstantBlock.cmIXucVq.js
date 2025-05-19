import { F as FlowGraphBlock, h as defaultValueSerializationFunction } from "./KHR_interactivity.BEJuWS3u.js";
import { k as getRichTypeFromValue } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphConstantBlock extends FlowGraphBlock {
  constructor(config) {
    super(config);
    this.config = config;
    this.output = this.registerDataOutput("output", getRichTypeFromValue(config.value));
  }
  _updateOutputs(context) {
    this.output.setValue(this.config.value, context);
  }
  /**
   * Gets the class name of this block
   * @returns the class name
   */
  getClassName() {
    return "FlowGraphConstantBlock";
  }
  /**
   * Serializes this block
   * @param serializationObject the object to serialize to
   * @param valueSerializeFunction the function to use to serialize the value
   */
  serialize(serializationObject = {}, valueSerializeFunction = defaultValueSerializationFunction) {
    super.serialize(serializationObject);
    valueSerializeFunction("value", this.config.value, serializationObject.config);
  }
}
RegisterClass("FlowGraphConstantBlock", FlowGraphConstantBlock);
export {
  FlowGraphConstantBlock
};
