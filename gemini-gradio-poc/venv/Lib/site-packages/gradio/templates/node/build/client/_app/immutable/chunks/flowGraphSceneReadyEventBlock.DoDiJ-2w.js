import { c as FlowGraphEventBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphSceneReadyEventBlock extends FlowGraphEventBlock {
  constructor() {
    super(...arguments);
    this.initPriority = -1;
    this.type = "SceneReady";
  }
  _executeEvent(context, _payload) {
    this._execute(context);
    return true;
  }
  _preparePendingTasks(context) {
  }
  _cancelPendingTasks(context) {
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphSceneReadyEventBlock";
  }
}
RegisterClass("FlowGraphSceneReadyEventBlock", FlowGraphSceneReadyEventBlock);
export {
  FlowGraphSceneReadyEventBlock
};
