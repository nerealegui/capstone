import { F as FlowGraphCachedOperationBlock } from "./flowGraphCachedOperationBlock.BYccI7XF.js";
class FlowGraphUnaryOperationBlock extends FlowGraphCachedOperationBlock {
  constructor(inputRichType, resultRichType, _operation, _className, config) {
    super(resultRichType, config);
    this._operation = _operation;
    this._className = _className;
    this.a = this.registerDataInput("a", inputRichType);
  }
  /**
   * the operation performed by this block
   * @param context the graph context
   * @returns the result of the operation
   */
  _doOperation(context) {
    return this._operation(this.a.getValue(context));
  }
  /**
   * Gets the class name of this block
   * @returns the class name
   */
  getClassName() {
    return this._className;
  }
}
export {
  FlowGraphUnaryOperationBlock as F
};
