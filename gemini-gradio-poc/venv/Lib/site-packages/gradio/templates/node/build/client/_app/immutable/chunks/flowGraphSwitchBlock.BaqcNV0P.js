import { f as FlowGraphExecutionBlock, i as isNumeric, g as getNumericValue } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphSwitchBlock extends FlowGraphExecutionBlock {
  constructor(config) {
    super(config);
    this.config = config;
    this.default = this._registerSignalOutput("default");
    this._caseToOutputFlow = /* @__PURE__ */ new Map();
    this.case = this.registerDataInput("case", RichTypeAny);
    (this.config.cases || []).forEach((caseValue) => {
      this._caseToOutputFlow.set(caseValue, this._registerSignalOutput(`out_${caseValue}`));
    });
  }
  _execute(context, _callingSignal) {
    const selectionValue = this.case.getValue(context);
    let outputFlow;
    if (isNumeric(selectionValue)) {
      outputFlow = this._getOutputFlowForCase(getNumericValue(selectionValue));
    } else {
      outputFlow = this._getOutputFlowForCase(selectionValue);
    }
    if (outputFlow) {
      outputFlow._activateSignal(context);
    } else {
      this.default._activateSignal(context);
    }
  }
  /**
   * Adds a new case to the switch block.
   * @param newCase the new case to add.
   */
  addCase(newCase) {
    if (this.config.cases.includes(newCase)) {
      return;
    }
    this.config.cases.push(newCase);
    this._caseToOutputFlow.set(newCase, this._registerSignalOutput(`out_${newCase}`));
  }
  /**
   * Removes a case from the switch block.
   * @param caseToRemove the case to remove.
   */
  removeCase(caseToRemove) {
    if (!this.config.cases.includes(caseToRemove)) {
      return;
    }
    const index = this.config.cases.indexOf(caseToRemove);
    this.config.cases.splice(index, 1);
    this._caseToOutputFlow.delete(caseToRemove);
  }
  /**
   * @internal
   */
  _getOutputFlowForCase(caseValue) {
    return this._caseToOutputFlow.get(caseValue);
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphSwitchBlock";
  }
  /**
   * Serialize the block to a JSON representation.
   * @param serializationObject the object to serialize to.
   */
  serialize(serializationObject) {
    super.serialize(serializationObject);
    serializationObject.cases = this.config.cases;
  }
}
RegisterClass("FlowGraphSwitchBlock", FlowGraphSwitchBlock);
export {
  FlowGraphSwitchBlock
};
