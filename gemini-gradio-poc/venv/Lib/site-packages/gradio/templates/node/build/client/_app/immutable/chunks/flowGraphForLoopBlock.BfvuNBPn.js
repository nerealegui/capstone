import { b as FlowGraphExecutionBlockWithOutSignal, g as getNumericValue } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny, b as RichTypeNumber, j as RichTypeFlowGraphInteger, F as FlowGraphInteger } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphForLoopBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config) {
    super(config);
    this.startIndex = this.registerDataInput("startIndex", RichTypeAny, 0);
    this.endIndex = this.registerDataInput("endIndex", RichTypeAny);
    this.step = this.registerDataInput("step", RichTypeNumber, 1);
    this.index = this.registerDataOutput("index", RichTypeFlowGraphInteger, new FlowGraphInteger(getNumericValue((config == null ? void 0 : config.initialIndex) ?? 0)));
    this.executionFlow = this._registerSignalOutput("executionFlow");
    this.completed = this._registerSignalOutput("completed");
    this._unregisterSignalOutput("out");
  }
  /**
   * @internal
   */
  _execute(context) {
    const index = getNumericValue(this.startIndex.getValue(context));
    const step = this.step.getValue(context);
    let endIndex = getNumericValue(this.endIndex.getValue(context));
    for (let i = index; i < endIndex; i += step) {
      this.index.setValue(new FlowGraphInteger(i), context);
      this.executionFlow._activateSignal(context);
      endIndex = getNumericValue(this.endIndex.getValue(context));
      if (i > FlowGraphForLoopBlock.MaxLoopIterations) {
        break;
      }
    }
    this.completed._activateSignal(context);
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphForLoopBlock";
  }
}
FlowGraphForLoopBlock.MaxLoopIterations = 1e3;
RegisterClass("FlowGraphForLoopBlock", FlowGraphForLoopBlock);
export {
  FlowGraphForLoopBlock
};
