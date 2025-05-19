import { F as FlowGraphInteger, j as RichTypeFlowGraphInteger } from "./declarationMapper.uCBvEQca.js";
import { b as FlowGraphExecutionBlockWithOutSignal } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphDoNBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config = {}) {
    super(config);
    this.config = config;
    this.config.startIndex = config.startIndex ?? new FlowGraphInteger(0);
    this.reset = this._registerSignalInput("reset");
    this.maxExecutions = this.registerDataInput("maxExecutions", RichTypeFlowGraphInteger);
    this.executionCount = this.registerDataOutput("executionCount", RichTypeFlowGraphInteger, new FlowGraphInteger(0));
  }
  _execute(context, callingSignal) {
    if (callingSignal === this.reset) {
      this.executionCount.setValue(this.config.startIndex, context);
    } else {
      const currentCountValue = this.executionCount.getValue(context);
      if (currentCountValue.value < this.maxExecutions.getValue(context).value) {
        this.executionCount.setValue(new FlowGraphInteger(currentCountValue.value + 1), context);
        this.out._activateSignal(context);
      }
    }
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphDoNBlock";
  }
}
RegisterClass("FlowGraphDoNBlock", FlowGraphDoNBlock);
export {
  FlowGraphDoNBlock
};
