import { F as FlowGraphBlock, g as getNumericValue, i as isNumeric } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphDataSwitchBlock extends FlowGraphBlock {
  constructor(config) {
    super(config);
    this.config = config;
    this._inputCases = /* @__PURE__ */ new Map();
    this.case = this.registerDataInput("case", RichTypeAny, NaN);
    this.default = this.registerDataInput("default", RichTypeAny);
    this.value = this.registerDataOutput("value", RichTypeAny);
    (this.config.cases || []).forEach((caseValue) => {
      caseValue = getNumericValue(caseValue);
      if (this.config.treatCasesAsIntegers) {
        caseValue = caseValue | 0;
        if (this._inputCases.has(caseValue)) {
          return;
        }
      }
      this._inputCases.set(caseValue, this.registerDataInput(`in_${caseValue}`, RichTypeAny));
    });
  }
  _updateOutputs(context) {
    const selectionValue = this.case.getValue(context);
    let outputValue;
    if (isNumeric(selectionValue)) {
      outputValue = this._getOutputValueForCase(getNumericValue(selectionValue), context);
    } else {
      outputValue = this.default.getValue(context);
    }
    this.value.setValue(outputValue, context);
  }
  _getOutputValueForCase(caseValue, context) {
    var _a;
    return (_a = this._inputCases.get(caseValue)) == null ? void 0 : _a.getValue(context);
  }
  getClassName() {
    return "FlowGraphDataSwitchBlock";
  }
}
RegisterClass("FlowGraphDataSwitchBlock", FlowGraphDataSwitchBlock);
export {
  FlowGraphDataSwitchBlock
};
