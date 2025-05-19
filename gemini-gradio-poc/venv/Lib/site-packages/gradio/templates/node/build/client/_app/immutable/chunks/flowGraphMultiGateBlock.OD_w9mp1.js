import { R as RegisterClass } from "./index.B4f7kVg_.js";
import { f as FlowGraphExecutionBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { j as RichTypeFlowGraphInteger, F as FlowGraphInteger } from "./declarationMapper.uCBvEQca.js";
class FlowGraphMultiGateBlock extends FlowGraphExecutionBlock {
  constructor(config) {
    super(config);
    this.config = config;
    this.outputSignals = [];
    this.reset = this._registerSignalInput("reset");
    this.lastIndex = this.registerDataOutput("lastIndex", RichTypeFlowGraphInteger, new FlowGraphInteger(-1));
    this.setNumberOfOutputSignals(config == null ? void 0 : config.outputSignalCount);
  }
  _getNextIndex(indexesUsed) {
    if (!indexesUsed.includes(false)) {
      if (this.config.isLoop) {
        indexesUsed.fill(false);
      }
    }
    if (!this.config.isRandom) {
      return indexesUsed.indexOf(false);
    } else {
      const unusedIndexes = indexesUsed.map((used, index) => used ? -1 : index).filter((index) => index !== -1);
      return unusedIndexes.length ? unusedIndexes[Math.floor(Math.random() * unusedIndexes.length)] : -1;
    }
  }
  /**
   * Sets the block's output signals. Would usually be passed from the constructor but can be changed afterwards.
   * @param numberOutputSignals the number of output flows
   */
  setNumberOfOutputSignals(numberOutputSignals = 1) {
    while (this.outputSignals.length > numberOutputSignals) {
      const flow = this.outputSignals.pop();
      if (flow) {
        flow.disconnectFromAll();
        this._unregisterSignalOutput(flow.name);
      }
    }
    while (this.outputSignals.length < numberOutputSignals) {
      this.outputSignals.push(this._registerSignalOutput(`out_${this.outputSignals.length}`));
    }
  }
  _execute(context, callingSignal) {
    if (!context._hasExecutionVariable(this, "indexesUsed")) {
      context._setExecutionVariable(this, "indexesUsed", this.outputSignals.map(() => false));
    }
    if (callingSignal === this.reset) {
      context._deleteExecutionVariable(this, "indexesUsed");
      this.lastIndex.setValue(new FlowGraphInteger(-1), context);
      return;
    }
    const indexesUsed = context._getExecutionVariable(this, "indexesUsed", []);
    const nextIndex = this._getNextIndex(indexesUsed);
    if (nextIndex > -1) {
      this.lastIndex.setValue(new FlowGraphInteger(nextIndex), context);
      indexesUsed[nextIndex] = true;
      context._setExecutionVariable(this, "indexesUsed", indexesUsed);
      this.outputSignals[nextIndex]._activateSignal(context);
    }
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphMultiGateBlock";
  }
  /**
   * Serializes the block.
   * @param serializationObject the object to serialize to.
   */
  serialize(serializationObject) {
    super.serialize(serializationObject);
    serializationObject.config.outputSignalCount = this.config.outputSignalCount;
    serializationObject.config.isRandom = this.config.isRandom;
    serializationObject.config.loop = this.config.isLoop;
    serializationObject.config.startIndex = this.config.startIndex;
  }
}
RegisterClass("FlowGraphMultiGateBlock", FlowGraphMultiGateBlock);
export {
  FlowGraphMultiGateBlock
};
