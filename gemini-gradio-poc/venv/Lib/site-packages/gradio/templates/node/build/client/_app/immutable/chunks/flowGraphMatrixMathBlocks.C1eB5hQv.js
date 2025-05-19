import { F as FlowGraphBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { g as getRichTypeByFlowGraphType, b as RichTypeNumber, h as RichTypeMatrix, e as RichTypeVector3, i as RichTypeQuaternion, c as RichTypeBoolean } from "./declarationMapper.uCBvEQca.js";
import { M as Matrix, R as RegisterClass, V as Vector3, Q as Quaternion } from "./index.B4f7kVg_.js";
import { F as FlowGraphUnaryOperationBlock } from "./flowGraphUnaryOperationBlock.JXfHGDC4.js";
import { F as FlowGraphBinaryOperationBlock } from "./flowGraphBinaryOperationBlock.BnuDU0w6.js";
class FlowGraphTransposeBlock extends FlowGraphUnaryOperationBlock {
  /**
   * Creates a new instance of the block.
   * @param config the configuration of the block
   */
  constructor(config) {
    super(getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.matrixType) || "Matrix"
      /* FlowGraphTypes.Matrix */
    ), getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.matrixType) || "Matrix"
      /* FlowGraphTypes.Matrix */
    ), (a) => a.transpose ? a.transpose() : Matrix.Transpose(a), "FlowGraphTransposeBlock", config);
  }
}
RegisterClass("FlowGraphTransposeBlock", FlowGraphTransposeBlock);
class FlowGraphDeterminantBlock extends FlowGraphUnaryOperationBlock {
  /**
   * Creates a new instance of the block.
   * @param config the configuration of the block
   */
  constructor(config) {
    super(getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.matrixType) || "Matrix"
      /* FlowGraphTypes.Matrix */
    ), RichTypeNumber, (a) => a.determinant(), "FlowGraphDeterminantBlock", config);
  }
}
RegisterClass("FlowGraphDeterminantBlock", FlowGraphDeterminantBlock);
class FlowGraphInvertMatrixBlock extends FlowGraphUnaryOperationBlock {
  /**
   * Creates a new instance of the inverse block.
   * @param config the configuration of the block
   */
  constructor(config) {
    super(getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.matrixType) || "Matrix"
      /* FlowGraphTypes.Matrix */
    ), getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.matrixType) || "Matrix"
      /* FlowGraphTypes.Matrix */
    ), (a) => a.inverse ? a.inverse() : Matrix.Invert(a), "FlowGraphInvertMatrixBlock", config);
  }
}
RegisterClass("FlowGraphInvertMatrixBlock", FlowGraphInvertMatrixBlock);
class FlowGraphMatrixMultiplicationBlock extends FlowGraphBinaryOperationBlock {
  /**
   * Creates a new instance of the multiplication block.
   * Note - this is similar to the math multiplication if not using matrix per-component multiplication.
   * @param config the configuration of the block
   */
  constructor(config) {
    super(getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.matrixType) || "Matrix"
      /* FlowGraphTypes.Matrix */
    ), getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.matrixType) || "Matrix"
      /* FlowGraphTypes.Matrix */
    ), getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.matrixType) || "Matrix"
      /* FlowGraphTypes.Matrix */
    ), (a, b) => b.multiply(a), "FlowGraphMatrixMultiplicationBlock", config);
  }
}
RegisterClass("FlowGraphMatrixMultiplicationBlock", FlowGraphMatrixMultiplicationBlock);
class FlowGraphMatrixDecomposeBlock extends FlowGraphBlock {
  constructor(config) {
    super(config);
    this.input = this.registerDataInput("input", RichTypeMatrix);
    this.position = this.registerDataOutput("position", RichTypeVector3);
    this.rotationQuaternion = this.registerDataOutput("rotationQuaternion", RichTypeQuaternion);
    this.scaling = this.registerDataOutput("scaling", RichTypeVector3);
    this.isValid = this.registerDataOutput("isValid", RichTypeBoolean, false);
  }
  _updateOutputs(context) {
    const cachedExecutionId = context._getExecutionVariable(this, "executionId", -1);
    const cachedPosition = context._getExecutionVariable(this, "cachedPosition", null);
    const cachedRotation = context._getExecutionVariable(this, "cachedRotation", null);
    const cachedScaling = context._getExecutionVariable(this, "cachedScaling", null);
    if (cachedExecutionId === context.executionId && cachedPosition && cachedRotation && cachedScaling) {
      this.position.setValue(cachedPosition, context);
      this.rotationQuaternion.setValue(cachedRotation, context);
      this.scaling.setValue(cachedScaling, context);
    } else {
      const matrix = this.input.getValue(context);
      const position = cachedPosition || new Vector3();
      const rotation = cachedRotation || new Quaternion();
      const scaling = cachedScaling || new Vector3();
      const m3 = Math.round(matrix.m[3] * 1e4) / 1e4;
      const m7 = Math.round(matrix.m[7] * 1e4) / 1e4;
      const m11 = Math.round(matrix.m[11] * 1e4) / 1e4;
      const m15 = Math.round(matrix.m[15] * 1e4) / 1e4;
      if (m3 !== 0 || m7 !== 0 || m11 !== 0 || m15 !== 1) {
        this.isValid.setValue(false, context);
        this.position.setValue(Vector3.Zero(), context);
        this.rotationQuaternion.setValue(Quaternion.Identity(), context);
        this.scaling.setValue(Vector3.One(), context);
        return;
      }
      const valid = matrix.decompose(scaling, rotation, position);
      this.isValid.setValue(valid, context);
      this.position.setValue(position, context);
      this.rotationQuaternion.setValue(rotation, context);
      this.scaling.setValue(scaling, context);
      context._setExecutionVariable(this, "cachedPosition", position);
      context._setExecutionVariable(this, "cachedRotation", rotation);
      context._setExecutionVariable(this, "cachedScaling", scaling);
      context._setExecutionVariable(this, "executionId", context.executionId);
    }
  }
  getClassName() {
    return "FlowGraphMatrixDecompose";
  }
}
RegisterClass("FlowGraphMatrixDecompose", FlowGraphMatrixDecomposeBlock);
class FlowGraphMatrixComposeBlock extends FlowGraphBlock {
  constructor(config) {
    super(config);
    this.position = this.registerDataInput("position", RichTypeVector3);
    this.rotationQuaternion = this.registerDataInput("rotationQuaternion", RichTypeQuaternion);
    this.scaling = this.registerDataInput("scaling", RichTypeVector3);
    this.value = this.registerDataOutput("value", RichTypeMatrix);
  }
  _updateOutputs(context) {
    const cachedExecutionId = context._getExecutionVariable(this, "executionId", -1);
    const cachedMatrix = context._getExecutionVariable(this, "cachedMatrix", null);
    if (cachedExecutionId === context.executionId && cachedMatrix) {
      this.value.setValue(cachedMatrix, context);
    } else {
      const matrix = Matrix.Compose(this.scaling.getValue(context), this.rotationQuaternion.getValue(context), this.position.getValue(context));
      this.value.setValue(matrix, context);
      context._setExecutionVariable(this, "cachedMatrix", matrix);
      context._setExecutionVariable(this, "executionId", context.executionId);
    }
  }
  getClassName() {
    return "FlowGraphMatrixCompose";
  }
}
RegisterClass("FlowGraphMatrixCompose", FlowGraphMatrixComposeBlock);
export {
  FlowGraphDeterminantBlock,
  FlowGraphInvertMatrixBlock,
  FlowGraphMatrixComposeBlock,
  FlowGraphMatrixDecomposeBlock,
  FlowGraphMatrixMultiplicationBlock,
  FlowGraphTransposeBlock
};
