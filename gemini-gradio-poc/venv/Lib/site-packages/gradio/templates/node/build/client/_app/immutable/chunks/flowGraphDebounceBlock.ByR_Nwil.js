import { b as RichTypeNumber } from "./declarationMapper.uCBvEQca.js";
import { b as FlowGraphExecutionBlockWithOutSignal } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphDebounceBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config) {
    super(config);
    this.count = this.registerDataInput("count", RichTypeNumber);
    this.reset = this._registerSignalInput("reset");
    this.currentCount = this.registerDataOutput("currentCount", RichTypeNumber);
  }
  _execute(context, callingSignal) {
    if (callingSignal === this.reset) {
      context._setExecutionVariable(this, "debounceCount", 0);
      return;
    }
    const count = this.count.getValue(context);
    const currentCount = context._getExecutionVariable(this, "debounceCount", 0);
    const newCount = currentCount + 1;
    this.currentCount.setValue(newCount, context);
    context._setExecutionVariable(this, "debounceCount", newCount);
    if (newCount >= count) {
      this.out._activateSignal(context);
      context._setExecutionVariable(this, "debounceCount", 0);
    }
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphDebounceBlock";
  }
}
RegisterClass("FlowGraphDebounceBlock", FlowGraphDebounceBlock);
export {
  FlowGraphDebounceBlock
};
