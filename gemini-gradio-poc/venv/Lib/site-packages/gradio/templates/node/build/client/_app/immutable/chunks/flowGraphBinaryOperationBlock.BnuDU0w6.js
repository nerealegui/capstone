import { F as FlowGraphCachedOperationBlock } from "./flowGraphCachedOperationBlock.BYccI7XF.js";
class FlowGraphBinaryOperationBlock extends FlowGraphCachedOperationBlock {
  constructor(leftRichType, rightRichType, resultRichType, _operation, _className, config) {
    super(resultRichType, config);
    this._operation = _operation;
    this._className = _className;
    this.a = this.registerDataInput("a", leftRichType);
    this.b = this.registerDataInput("b", rightRichType);
  }
  /**
   * the operation performed by this block
   * @param context the graph context
   * @returns the result of the operation
   */
  _doOperation(context) {
    const a = this.a.getValue(context);
    const b = this.b.getValue(context);
    return this._operation(a, b);
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
  FlowGraphBinaryOperationBlock as F
};
