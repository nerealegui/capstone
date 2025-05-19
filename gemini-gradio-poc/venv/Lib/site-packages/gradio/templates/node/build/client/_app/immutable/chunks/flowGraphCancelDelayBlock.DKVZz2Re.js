import { R as RegisterClass } from "./index.B4f7kVg_.js";
import { b as FlowGraphExecutionBlockWithOutSignal } from "./KHR_interactivity.BEJuWS3u.js";
import { b as RichTypeNumber } from "./declarationMapper.uCBvEQca.js";
class FlowGraphCancelDelayBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config) {
    super(config);
    this.delayIndex = this.registerDataInput("delayIndex", RichTypeNumber);
  }
  _execute(context, _callingSignal) {
    const delayIndex = this.delayIndex.getValue(context);
    if (delayIndex <= 0 || isNaN(delayIndex) || !isFinite(delayIndex)) {
      return this._reportError(context, "Invalid delay index");
    }
    const timers = context._getExecutionVariable(this, "pendingDelays", []);
    const timer = timers[delayIndex];
    if (timer) {
      timer.dispose();
    }
    this.out._activateSignal(context);
  }
  getClassName() {
    return "FlowGraphCancelDelayBlock";
  }
}
RegisterClass("FlowGraphCancelDelayBlock", FlowGraphCancelDelayBlock);
export {
  FlowGraphCancelDelayBlock
};
