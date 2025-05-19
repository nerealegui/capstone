import { f as FlowGraphExecutionBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { c as RichTypeBoolean } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphFlipFlopBlock extends FlowGraphExecutionBlock {
  constructor(config) {
    super(config);
    this.onOn = this._registerSignalOutput("onOn");
    this.onOff = this._registerSignalOutput("onOff");
    this.value = this.registerDataOutput("value", RichTypeBoolean);
  }
  _execute(context, _callingSignal) {
    var _a;
    let value = context._getExecutionVariable(this, "value", typeof ((_a = this.config) == null ? void 0 : _a.startValue) === "boolean" ? !this.config.startValue : false);
    value = !value;
    context._setExecutionVariable(this, "value", value);
    this.value.setValue(value, context);
    if (value) {
      this.onOn._activateSignal(context);
    } else {
      this.onOff._activateSignal(context);
    }
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphFlipFlopBlock";
  }
}
RegisterClass("FlowGraphFlipFlopBlock", FlowGraphFlipFlopBlock);
export {
  FlowGraphFlipFlopBlock
};
