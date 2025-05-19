import { b as FlowGraphExecutionBlockWithOutSignal } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
import { b as RichTypeNumber } from "./declarationMapper.uCBvEQca.js";
class FlowGraphWaitAllBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config) {
    super(config);
    this.config = config;
    this.inFlows = [];
    this._cachedActivationState = [];
    this.reset = this._registerSignalInput("reset");
    this.completed = this._registerSignalOutput("completed");
    this.remainingInputs = this.registerDataOutput("remainingInputs", RichTypeNumber, this.config.inputSignalCount || 0);
    for (let i = 0; i < this.config.inputSignalCount; i++) {
      this.inFlows.push(this._registerSignalInput(`in_${i}`));
    }
    this._unregisterSignalInput("in");
  }
  _getCurrentActivationState(context) {
    const activationState = this._cachedActivationState;
    activationState.length = 0;
    if (!context._hasExecutionVariable(this, "activationState")) {
      for (let i = 0; i < this.config.inputSignalCount; i++) {
        activationState.push(false);
      }
    } else {
      const contextActivationState = context._getExecutionVariable(this, "activationState", []);
      for (let i = 0; i < contextActivationState.length; i++) {
        activationState.push(contextActivationState[i]);
      }
    }
    return activationState;
  }
  _execute(context, callingSignal) {
    const activationState = this._getCurrentActivationState(context);
    if (callingSignal === this.reset) {
      for (let i = 0; i < this.config.inputSignalCount; i++) {
        activationState[i] = false;
      }
    } else {
      const index = this.inFlows.indexOf(callingSignal);
      if (index >= 0) {
        activationState[index] = true;
      }
    }
    this.remainingInputs.setValue(activationState.filter((v) => !v).length, context);
    context._setExecutionVariable(this, "activationState", activationState.slice());
    if (!activationState.includes(false)) {
      this.completed._activateSignal(context);
      for (let i = 0; i < this.config.inputSignalCount; i++) {
        activationState[i] = false;
      }
    } else {
      callingSignal !== this.reset && this.out._activateSignal(context);
    }
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphWaitAllBlock";
  }
  /**
   * Serializes this block into a object
   * @param serializationObject the object to serialize to
   */
  serialize(serializationObject) {
    super.serialize(serializationObject);
    serializationObject.config.inputFlows = this.config.inputSignalCount;
  }
}
RegisterClass("FlowGraphWaitAllBlock", FlowGraphWaitAllBlock);
export {
  FlowGraphWaitAllBlock
};
