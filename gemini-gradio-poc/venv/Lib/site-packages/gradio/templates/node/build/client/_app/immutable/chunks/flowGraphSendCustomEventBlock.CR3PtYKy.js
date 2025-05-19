import { b as FlowGraphExecutionBlockWithOutSignal } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphSendCustomEventBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config) {
    super(config);
    this.config = config;
    for (const key in this.config.eventData) {
      this.registerDataInput(key, this.config.eventData[key].type, this.config.eventData[key].value);
    }
  }
  _execute(context) {
    const eventId = this.config.eventId;
    const eventData = {};
    this.dataInputs.forEach((port) => {
      eventData[port.name] = port.getValue(context);
    });
    context.configuration.coordinator.notifyCustomEvent(eventId, eventData);
    this.out._activateSignal(context);
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphReceiveCustomEventBlock";
  }
}
RegisterClass("FlowGraphReceiveCustomEventBlock", FlowGraphSendCustomEventBlock);
export {
  FlowGraphSendCustomEventBlock
};
