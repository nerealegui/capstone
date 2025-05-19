import { F as FlowGraphBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny, j as RichTypeFlowGraphInteger, F as FlowGraphInteger } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphIndexOfBlock extends FlowGraphBlock {
  /**
   * Construct a FlowGraphIndexOfBlock.
   * @param config construction parameters
   */
  constructor(config) {
    super(config);
    this.config = config;
    this.object = this.registerDataInput("object", RichTypeAny);
    this.array = this.registerDataInput("array", RichTypeAny);
    this.index = this.registerDataOutput("index", RichTypeFlowGraphInteger, new FlowGraphInteger(-1));
  }
  /**
   * @internal
   */
  _updateOutputs(context) {
    const object = this.object.getValue(context);
    const array = this.array.getValue(context);
    if (array) {
      this.index.setValue(new FlowGraphInteger(array.indexOf(object)), context);
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
    return "FlowGraphIndexOfBlock";
  }
}
RegisterClass("FlowGraphIndexOfBlock", FlowGraphIndexOfBlock);
export {
  FlowGraphIndexOfBlock
};
