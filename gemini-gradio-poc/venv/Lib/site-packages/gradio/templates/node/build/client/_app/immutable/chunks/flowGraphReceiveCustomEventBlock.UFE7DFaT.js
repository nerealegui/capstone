import { c as FlowGraphEventBlock, d as FlowGraphCoordinator } from "./KHR_interactivity.BEJuWS3u.js";
import { b as Tools, R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphReceiveCustomEventBlock extends FlowGraphEventBlock {
  constructor(config) {
    super(config);
    this.config = config;
    this.initPriority = 1;
    for (const key in this.config.eventData) {
      this.registerDataOutput(key, this.config.eventData[key].type);
    }
  }
  _preparePendingTasks(context) {
    const observable = context.configuration.coordinator.getCustomEventObservable(this.config.eventId);
    if (observable && observable.hasObservers() && observable.observers.length > FlowGraphCoordinator.MaxEventsPerType) {
      this._reportError(context, `FlowGraphReceiveCustomEventBlock: Too many observers for event ${this.config.eventId}. Max is ${FlowGraphCoordinator.MaxEventsPerType}.`);
      return;
    }
    const eventObserver = observable.add((eventData) => {
      Object.keys(eventData).forEach((key) => {
        var _a;
        (_a = this.getDataOutput(key)) == null ? void 0 : _a.setValue(eventData[key], context);
      });
      this._execute(context);
    });
    context._setExecutionVariable(this, "_eventObserver", eventObserver);
  }
  _cancelPendingTasks(context) {
    const observable = context.configuration.coordinator.getCustomEventObservable(this.config.eventId);
    if (observable) {
      const eventObserver = context._getExecutionVariable(this, "_eventObserver", null);
      observable.remove(eventObserver);
    } else {
      Tools.Warn(`FlowGraphReceiveCustomEventBlock: Missing observable for event ${this.config.eventId}`);
    }
  }
  _executeEvent(_context, _payload) {
    return true;
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphReceiveCustomEventBlock";
  }
}
RegisterClass("FlowGraphReceiveCustomEventBlock", FlowGraphReceiveCustomEventBlock);
export {
  FlowGraphReceiveCustomEventBlock
};
