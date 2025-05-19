import { F as FlowGraphBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { q as RichTypeString, R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphFunctionReferenceBlock extends FlowGraphBlock {
  constructor(config) {
    super(config);
    this.functionName = this.registerDataInput("functionName", RichTypeString);
    this.object = this.registerDataInput("object", RichTypeAny);
    this.context = this.registerDataInput("context", RichTypeAny, null);
    this.output = this.registerDataOutput("output", RichTypeAny);
  }
  _updateOutputs(context) {
    const functionName = this.functionName.getValue(context);
    const object = this.object.getValue(context);
    const contextValue = this.context.getValue(context);
    if (object && functionName) {
      const func = object[functionName];
      if (func && typeof func === "function") {
        this.output.setValue(func.bind(contextValue), context);
      }
    }
  }
  getClassName() {
    return "FlowGraphFunctionReference";
  }
}
RegisterClass("FlowGraphFunctionReference", FlowGraphFunctionReferenceBlock);
export {
  FlowGraphFunctionReferenceBlock
};
