import { c as RichTypeBoolean } from "./declarationMapper.uCBvEQca.js";
import { h as Logger, R as RegisterClass } from "./index.B4f7kVg_.js";
import { b as FlowGraphExecutionBlockWithOutSignal } from "./KHR_interactivity.BEJuWS3u.js";
class FlowGraphWhileLoopBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config) {
    super(config);
    this.config = config;
    this.condition = this.registerDataInput("condition", RichTypeBoolean);
    this.executionFlow = this._registerSignalOutput("executionFlow");
    this.completed = this._registerSignalOutput("completed");
    this._unregisterSignalOutput("out");
  }
  _execute(context, _callingSignal) {
    var _a;
    let conditionValue = this.condition.getValue(context);
    if (((_a = this.config) == null ? void 0 : _a.doWhile) && !conditionValue) {
      this.executionFlow._activateSignal(context);
    }
    let i = 0;
    while (conditionValue) {
      this.executionFlow._activateSignal(context);
      ++i;
      if (i >= FlowGraphWhileLoopBlock.MaxLoopCount) {
        Logger.Warn("FlowGraphWhileLoopBlock: Max loop count reached. Breaking.");
        break;
      }
      conditionValue = this.condition.getValue(context);
    }
    this.completed._activateSignal(context);
  }
  getClassName() {
    return "FlowGraphWhileLoopBlock";
  }
}
FlowGraphWhileLoopBlock.MaxLoopCount = 1e3;
RegisterClass("FlowGraphWhileLoopBlock", FlowGraphWhileLoopBlock);
export {
  FlowGraphWhileLoopBlock
};
