import { b as RichTypeNumber } from "./declarationMapper.uCBvEQca.js";
import { b as FlowGraphExecutionBlockWithOutSignal } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphThrottleBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config) {
    super(config);
    this.reset = this._registerSignalInput("reset");
    this.duration = this.registerDataInput("duration", RichTypeNumber);
    this.lastRemainingTime = this.registerDataOutput("lastRemainingTime", RichTypeNumber, NaN);
  }
  _execute(context, callingSignal) {
    if (callingSignal === this.reset) {
      this.lastRemainingTime.setValue(NaN, context);
      context._setExecutionVariable(this, "lastRemainingTime", NaN);
      context._setExecutionVariable(this, "timestamp", 0);
      return;
    }
    const durationValue = this.duration.getValue(context);
    if (durationValue <= 0 || isNaN(durationValue) || !isFinite(durationValue)) {
      return this._reportError(context, "Invalid duration in Throttle block");
    }
    const lastRemainingTime = context._getExecutionVariable(this, "lastRemainingTime", NaN);
    const currentTime = Date.now();
    if (isNaN(lastRemainingTime)) {
      this.lastRemainingTime.setValue(0, context);
      context._setExecutionVariable(this, "lastRemainingTime", 0);
      context._setExecutionVariable(this, "timestamp", currentTime);
      return this.out._activateSignal(context);
    } else {
      const elapsedTime = currentTime - context._getExecutionVariable(this, "timestamp", 0);
      const durationInMs = durationValue * 1e3;
      if (durationInMs <= elapsedTime) {
        this.lastRemainingTime.setValue(0, context);
        context._setExecutionVariable(this, "lastRemainingTime", 0);
        context._setExecutionVariable(this, "timestamp", currentTime);
        return this.out._activateSignal(context);
      } else {
        const remainingTime = durationInMs - elapsedTime;
        this.lastRemainingTime.setValue(remainingTime / 1e3, context);
        context._setExecutionVariable(this, "lastRemainingTime", remainingTime);
      }
    }
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphThrottleBlock";
  }
}
RegisterClass("FlowGraphThrottleBlock", FlowGraphThrottleBlock);
export {
  FlowGraphThrottleBlock
};
