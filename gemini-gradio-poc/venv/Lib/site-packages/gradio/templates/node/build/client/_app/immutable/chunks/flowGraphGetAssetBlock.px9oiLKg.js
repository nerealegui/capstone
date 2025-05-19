import { F as FlowGraphBlock, g as getNumericValue, G as GetFlowGraphAssetWithType } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny, F as FlowGraphInteger } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphGetAssetBlock extends FlowGraphBlock {
  constructor(config) {
    super(config);
    this.config = config;
    this.type = this.registerDataInput("type", RichTypeAny, config.type);
    this.value = this.registerDataOutput("value", RichTypeAny);
    this.index = this.registerDataInput("index", RichTypeAny, new FlowGraphInteger(getNumericValue(config.index ?? -1)));
  }
  _updateOutputs(context) {
    const type = this.type.getValue(context);
    const index = this.index.getValue(context);
    const asset = GetFlowGraphAssetWithType(context.assetsContext, type, getNumericValue(index), this.config.useIndexAsUniqueId);
    this.value.setValue(asset, context);
  }
  /**
   * Gets the class name of this block
   * @returns the class name
   */
  getClassName() {
    return "FlowGraphGetAssetBlock";
  }
}
RegisterClass("FlowGraphGetAssetBlock", FlowGraphGetAssetBlock);
export {
  FlowGraphGetAssetBlock
};
