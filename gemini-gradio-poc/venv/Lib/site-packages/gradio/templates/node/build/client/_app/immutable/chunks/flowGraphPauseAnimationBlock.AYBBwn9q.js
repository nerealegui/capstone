import { b as FlowGraphExecutionBlockWithOutSignal } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphPauseAnimationBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config) {
    super(config);
    this.animationToPause = this.registerDataInput("animationToPause", RichTypeAny);
  }
  _execute(context) {
    const animationToPauseValue = this.animationToPause.getValue(context);
    animationToPauseValue.pause();
    this.out._activateSignal(context);
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphPauseAnimationBlock";
  }
}
RegisterClass("FlowGraphPauseAnimationBlock", FlowGraphPauseAnimationBlock);
export {
  FlowGraphPauseAnimationBlock
};
