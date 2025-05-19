import { F as FlowGraphBlock, g as getNumericValue } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny, F as FlowGraphInteger } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphArrayIndexBlock extends FlowGraphBlock {
  /**
   * Construct a FlowGraphArrayIndexBlock.
   * @param config construction parameters
   */
  constructor(config) {
    super(config);
    this.config = config;
    this.array = this.registerDataInput("array", RichTypeAny);
    this.index = this.registerDataInput("index", RichTypeAny, new FlowGraphInteger(-1));
    this.value = this.registerDataOutput("value", RichTypeAny);
  }
  /**
   * @internal
   */
  _updateOutputs(context) {
    const array = this.array.getValue(context);
    const index = getNumericValue(this.index.getValue(context));
    if (array && index >= 0 && index < array.length) {
      this.value.setValue(array[index], context);
    } else {
      this.value.setValue(null, context);
    }
  }
  /**
   * Serializes this block
   * @param serializationObject the object to serialize to
   */
  serialize(serializationObject) {
    super.serialize(serializationObject);
  }
  getClassName() {
    return "FlowGraphArrayIndexBlock";
  }
}
RegisterClass("FlowGraphArrayIndexBlock", FlowGraphArrayIndexBlock);
export {
  FlowGraphArrayIndexBlock
};
