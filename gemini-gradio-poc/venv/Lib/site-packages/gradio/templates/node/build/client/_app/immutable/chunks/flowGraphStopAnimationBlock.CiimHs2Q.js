import { R as RichTypeAny, b as RichTypeNumber } from "./declarationMapper.uCBvEQca.js";
import { h as Logger, R as RegisterClass } from "./index.B4f7kVg_.js";
import { a as FlowGraphAsyncExecutionBlock } from "./KHR_interactivity.BEJuWS3u.js";
class FlowGraphStopAnimationBlock extends FlowGraphAsyncExecutionBlock {
  constructor(config) {
    super(config);
    this.animationGroup = this.registerDataInput("animationGroup", RichTypeAny);
    this.stopAtFrame = this.registerDataInput("stopAtFrame", RichTypeNumber, -1);
  }
  _preparePendingTasks(context) {
    const animationToStopValue = this.animationGroup.getValue(context);
    const stopAtFrame = this.stopAtFrame.getValue(context) ?? -1;
    const pendingStopAnimations = context._getGlobalContextVariable("pendingStopAnimations", []);
    pendingStopAnimations.push({ uniqueId: animationToStopValue.uniqueId, stopAtFrame });
    context._setGlobalContextVariable("pendingStopAnimations", pendingStopAnimations);
  }
  _cancelPendingTasks(context) {
    const animationToStopValue = this.animationGroup.getValue(context);
    const pendingStopAnimations = context._getGlobalContextVariable("pendingStopAnimations", []);
    for (let i = 0; i < pendingStopAnimations.length; i++) {
      if (pendingStopAnimations[i].uniqueId === animationToStopValue.uniqueId) {
        pendingStopAnimations.splice(i, 1);
        context._setGlobalContextVariable("pendingStopAnimations", pendingStopAnimations);
        break;
      }
    }
  }
  _execute(context) {
    const animationToStopValue = this.animationGroup.getValue(context);
    const stopTime = this.stopAtFrame.getValue(context) ?? -1;
    if (!animationToStopValue) {
      Logger.Warn("No animation group provided to stop.");
      return this._reportError(context, "No animation group provided to stop.");
    }
    if (isNaN(stopTime)) {
      return this._reportError(context, "Invalid stop time.");
    }
    if (stopTime > 0) {
      this._startPendingTasks(context);
    } else {
      this._stopAnimation(animationToStopValue, context);
    }
    this.out._activateSignal(context);
  }
  _executeOnTick(context) {
    const animationToStopValue = this.animationGroup.getValue(context);
    const pendingStopAnimations = context._getGlobalContextVariable("pendingStopAnimations", []);
    for (let i = 0; i < pendingStopAnimations.length; i++) {
      if (pendingStopAnimations[i].uniqueId === animationToStopValue.uniqueId) {
        if (animationToStopValue.getCurrentFrame() >= pendingStopAnimations[i].stopAtFrame) {
          this._stopAnimation(animationToStopValue, context);
          pendingStopAnimations.splice(i, 1);
          context._setGlobalContextVariable("pendingStopAnimations", pendingStopAnimations);
          this.done._activateSignal(context);
          context._removePendingBlock(this);
          break;
        }
      }
    }
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphStopAnimationBlock";
  }
  _stopAnimation(animationGroup, context) {
    const currentlyRunning = context._getGlobalContextVariable("currentlyRunningAnimationGroups", []);
    const index = currentlyRunning.indexOf(animationGroup.uniqueId);
    if (index !== -1) {
      animationGroup.stop();
      currentlyRunning.splice(index, 1);
      context._setGlobalContextVariable("currentlyRunningAnimationGroups", currentlyRunning);
    }
  }
}
RegisterClass("FlowGraphStopAnimationBlock", FlowGraphStopAnimationBlock);
export {
  FlowGraphStopAnimationBlock
};
