import { F as FlowGraphCachedOperationBlock } from "./flowGraphCachedOperationBlock.BYccI7XF.js";
import { f as RichTypeVector2, e as RichTypeVector3, l as RichTypeVector4, h as RichTypeMatrix, m as RichTypeMatrix2D, n as FlowGraphMatrix2D, o as RichTypeMatrix3D, p as FlowGraphMatrix3D, b as RichTypeNumber } from "./declarationMapper.uCBvEQca.js";
import { F as FlowGraphBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { ay as Vector2, R as RegisterClass, V as Vector3, az as Vector4, M as Matrix } from "./index.B4f7kVg_.js";
class FlowGraphMathCombineBlock extends FlowGraphCachedOperationBlock {
  /**
   * Base class for blocks that combine multiple numeric inputs into a single result.
   * Handles registering data inputs and managing cached outputs.
   * @param numberOfInputs The number of input values to combine.
   * @param type The type of the result.
   * @param config The block configuration.
   */
  constructor(numberOfInputs, type, config) {
    super(type, config);
    for (let i = 0; i < numberOfInputs; i++) {
      this.registerDataInput(`input_${i}`, RichTypeNumber, 0);
    }
  }
}
class FlowGraphMathExtractBlock extends FlowGraphBlock {
  /**
   * Creates an instance of FlowGraphMathExtractBlock.
   *
   * @param numberOfOutputs - The number of outputs to be extracted from the input.
   * @param type - The type of the input data.
   * @param config - Optional configuration for the flow graph block.
   */
  constructor(numberOfOutputs, type, config) {
    super(config);
    this.registerDataInput("input", type);
    for (let i = 0; i < numberOfOutputs; i++) {
      this.registerDataOutput(`output_${i}`, RichTypeNumber, 0);
    }
  }
}
class FlowGraphCombineVector2Block extends FlowGraphMathCombineBlock {
  constructor(config) {
    super(2, RichTypeVector2, config);
  }
  /**
   * @internal
   * Combines two floats into a new Vector2
   */
  _doOperation(context) {
    if (!context._hasExecutionVariable(this, "cachedVector")) {
      context._setExecutionVariable(this, "cachedVector", new Vector2());
    }
    const vector = context._getExecutionVariable(this, "cachedVector", null);
    vector.set(this.getDataInput("input_0").getValue(context), this.getDataInput("input_1").getValue(context));
    return vector;
  }
  getClassName() {
    return "FlowGraphCombineVector2Block";
  }
}
RegisterClass("FlowGraphCombineVector2Block", FlowGraphCombineVector2Block);
class FlowGraphCombineVector3Block extends FlowGraphMathCombineBlock {
  constructor(config) {
    super(3, RichTypeVector3, config);
  }
  _doOperation(context) {
    if (!context._hasExecutionVariable(this, "cachedVector")) {
      context._setExecutionVariable(this, "cachedVector", new Vector3());
    }
    const vector = context._getExecutionVariable(this, "cachedVector", null);
    vector.set(this.getDataInput("input_0").getValue(context), this.getDataInput("input_1").getValue(context), this.getDataInput("input_2").getValue(context));
    return vector;
  }
  getClassName() {
    return "FlowGraphCombineVector3Block";
  }
}
RegisterClass("FlowGraphCombineVector3Block", FlowGraphCombineVector3Block);
class FlowGraphCombineVector4Block extends FlowGraphMathCombineBlock {
  constructor(config) {
    super(4, RichTypeVector4, config);
  }
  _doOperation(context) {
    if (!context._hasExecutionVariable(this, "cachedVector")) {
      context._setExecutionVariable(this, "cachedVector", new Vector4());
    }
    const vector = context._getExecutionVariable(this, "cachedVector", null);
    vector.set(this.getDataInput("input_0").getValue(context), this.getDataInput("input_1").getValue(context), this.getDataInput("input_2").getValue(context), this.getDataInput("input_3").getValue(context));
    return vector;
  }
  getClassName() {
    return "FlowGraphCombineVector4Block";
  }
}
RegisterClass("FlowGraphCombineVector4Block", FlowGraphCombineVector4Block);
class FlowGraphCombineMatrixBlock extends FlowGraphMathCombineBlock {
  constructor(config) {
    super(16, RichTypeMatrix, config);
  }
  _doOperation(context) {
    var _a;
    if (!context._hasExecutionVariable(this, "cachedMatrix")) {
      context._setExecutionVariable(this, "cachedMatrix", new Matrix());
    }
    const matrix = context._getExecutionVariable(this, "cachedMatrix", null);
    if ((_a = this.config) == null ? void 0 : _a.inputIsColumnMajor) {
      matrix.set(this.getDataInput("input_0").getValue(context), this.getDataInput("input_4").getValue(context), this.getDataInput("input_8").getValue(context), this.getDataInput("input_12").getValue(context), this.getDataInput("input_1").getValue(context), this.getDataInput("input_5").getValue(context), this.getDataInput("input_9").getValue(context), this.getDataInput("input_13").getValue(context), this.getDataInput("input_2").getValue(context), this.getDataInput("input_6").getValue(context), this.getDataInput("input_10").getValue(context), this.getDataInput("input_14").getValue(context), this.getDataInput("input_3").getValue(context), this.getDataInput("input_7").getValue(context), this.getDataInput("input_11").getValue(context), this.getDataInput("input_15").getValue(context));
    } else {
      matrix.set(this.getDataInput("input_0").getValue(context), this.getDataInput("input_1").getValue(context), this.getDataInput("input_2").getValue(context), this.getDataInput("input_3").getValue(context), this.getDataInput("input_4").getValue(context), this.getDataInput("input_5").getValue(context), this.getDataInput("input_6").getValue(context), this.getDataInput("input_7").getValue(context), this.getDataInput("input_8").getValue(context), this.getDataInput("input_9").getValue(context), this.getDataInput("input_10").getValue(context), this.getDataInput("input_11").getValue(context), this.getDataInput("input_12").getValue(context), this.getDataInput("input_13").getValue(context), this.getDataInput("input_14").getValue(context), this.getDataInput("input_15").getValue(context));
    }
    return matrix;
  }
  getClassName() {
    return "FlowGraphCombineMatrixBlock";
  }
}
RegisterClass("FlowGraphCombineMatrixBlock", FlowGraphCombineMatrixBlock);
class FlowGraphCombineMatrix2DBlock extends FlowGraphMathCombineBlock {
  constructor(config) {
    super(4, RichTypeMatrix2D, config);
  }
  _doOperation(context) {
    var _a;
    if (!context._hasExecutionVariable(this, "cachedMatrix")) {
      context._setExecutionVariable(this, "cachedMatrix", new FlowGraphMatrix2D());
    }
    const matrix = context._getExecutionVariable(this, "cachedMatrix", null);
    const array = ((_a = this.config) == null ? void 0 : _a.inputIsColumnMajor) ? [
      // column to row-major
      this.getDataInput("input_0").getValue(context),
      this.getDataInput("input_2").getValue(context),
      this.getDataInput("input_1").getValue(context),
      this.getDataInput("input_3").getValue(context)
    ] : [
      this.getDataInput("input_0").getValue(context),
      this.getDataInput("input_1").getValue(context),
      this.getDataInput("input_2").getValue(context),
      this.getDataInput("input_3").getValue(context)
    ];
    matrix.fromArray(array);
    return matrix;
  }
  getClassName() {
    return "FlowGraphCombineMatrix2DBlock";
  }
}
RegisterClass("FlowGraphCombineMatrix2DBlock", FlowGraphCombineMatrix2DBlock);
class FlowGraphCombineMatrix3DBlock extends FlowGraphMathCombineBlock {
  constructor(config) {
    super(9, RichTypeMatrix3D, config);
  }
  _doOperation(context) {
    var _a;
    if (!context._hasExecutionVariable(this, "cachedMatrix")) {
      context._setExecutionVariable(this, "cachedMatrix", new FlowGraphMatrix3D());
    }
    const matrix = context._getExecutionVariable(this, "cachedMatrix", null);
    const array = ((_a = this.config) == null ? void 0 : _a.inputIsColumnMajor) ? [
      // column to row major
      this.getDataInput("input_0").getValue(context),
      this.getDataInput("input_3").getValue(context),
      this.getDataInput("input_6").getValue(context),
      this.getDataInput("input_1").getValue(context),
      this.getDataInput("input_4").getValue(context),
      this.getDataInput("input_7").getValue(context),
      this.getDataInput("input_2").getValue(context),
      this.getDataInput("input_5").getValue(context),
      this.getDataInput("input_8").getValue(context)
    ] : [
      this.getDataInput("input_0").getValue(context),
      this.getDataInput("input_1").getValue(context),
      this.getDataInput("input_2").getValue(context),
      this.getDataInput("input_3").getValue(context),
      this.getDataInput("input_4").getValue(context),
      this.getDataInput("input_5").getValue(context),
      this.getDataInput("input_6").getValue(context),
      this.getDataInput("input_7").getValue(context),
      this.getDataInput("input_8").getValue(context)
    ];
    matrix.fromArray(array);
    return matrix;
  }
  getClassName() {
    return "FlowGraphCombineMatrix3DBlock";
  }
}
RegisterClass("FlowGraphCombineMatrix3DBlock", FlowGraphCombineMatrix3DBlock);
class FlowGraphExtractVector2Block extends FlowGraphMathExtractBlock {
  constructor(config) {
    super(2, RichTypeVector2, config);
  }
  _updateOutputs(context) {
    var _a;
    let input = (_a = this.getDataInput("input")) == null ? void 0 : _a.getValue(context);
    if (!input) {
      input = Vector2.Zero();
      this.getDataInput("input").setValue(input, context);
    }
    this.getDataOutput("output_0").setValue(input.x, context);
    this.getDataOutput("output_1").setValue(input.y, context);
  }
  getClassName() {
    return "FlowGraphExtractVector2Block";
  }
}
RegisterClass("FlowGraphExtractVector2Block", FlowGraphExtractVector2Block);
class FlowGraphExtractVector3Block extends FlowGraphMathExtractBlock {
  constructor(config) {
    super(3, RichTypeVector3, config);
  }
  _updateOutputs(context) {
    var _a;
    let input = (_a = this.getDataInput("input")) == null ? void 0 : _a.getValue(context);
    if (!input) {
      input = Vector3.Zero();
      this.getDataInput("input").setValue(input, context);
    }
    this.getDataOutput("output_0").setValue(input.x, context);
    this.getDataOutput("output_1").setValue(input.y, context);
    this.getDataOutput("output_2").setValue(input.z, context);
  }
  getClassName() {
    return "FlowGraphExtractVector3Block";
  }
}
RegisterClass("FlowGraphExtractVector3Block", FlowGraphExtractVector3Block);
class FlowGraphExtractVector4Block extends FlowGraphMathExtractBlock {
  constructor(config) {
    super(4, RichTypeVector4, config);
  }
  _updateOutputs(context) {
    var _a;
    let input = (_a = this.getDataInput("input")) == null ? void 0 : _a.getValue(context);
    if (!input) {
      input = Vector4.Zero();
      this.getDataInput("input").setValue(input, context);
    }
    this.getDataOutput("output_0").setValue(input.x, context);
    this.getDataOutput("output_1").setValue(input.y, context);
    this.getDataOutput("output_2").setValue(input.z, context);
    this.getDataOutput("output_3").setValue(input.w, context);
  }
  getClassName() {
    return "FlowGraphExtractVector4Block";
  }
}
RegisterClass("FlowGraphExtractVector4Block", FlowGraphExtractVector4Block);
class FlowGraphExtractMatrixBlock extends FlowGraphMathExtractBlock {
  constructor(config) {
    super(16, RichTypeMatrix, config);
  }
  _updateOutputs(context) {
    var _a;
    let input = (_a = this.getDataInput("input")) == null ? void 0 : _a.getValue(context);
    if (!input) {
      input = Matrix.Identity();
      this.getDataInput("input").setValue(input, context);
    }
    for (let i = 0; i < 16; i++) {
      this.getDataOutput(`output_${i}`).setValue(input.m[i], context);
    }
  }
  getClassName() {
    return "FlowGraphExtractMatrixBlock";
  }
}
RegisterClass("FlowGraphExtractMatrixBlock", FlowGraphExtractMatrixBlock);
class FlowGraphExtractMatrix2DBlock extends FlowGraphMathExtractBlock {
  constructor(config) {
    super(4, RichTypeMatrix2D, config);
  }
  _updateOutputs(context) {
    var _a;
    let input = (_a = this.getDataInput("input")) == null ? void 0 : _a.getValue(context);
    if (!input) {
      input = new FlowGraphMatrix2D();
      this.getDataInput("input").setValue(input, context);
    }
    for (let i = 0; i < 4; i++) {
      this.getDataOutput(`output_${i}`).setValue(input.m[i], context);
    }
  }
  getClassName() {
    return "FlowGraphExtractMatrix2DBlock";
  }
}
RegisterClass("FlowGraphExtractMatrix2DBlock", FlowGraphExtractMatrix2DBlock);
class FlowGraphExtractMatrix3DBlock extends FlowGraphMathExtractBlock {
  constructor(config) {
    super(9, RichTypeMatrix3D, config);
  }
  _updateOutputs(context) {
    var _a;
    let input = (_a = this.getDataInput("input")) == null ? void 0 : _a.getValue(context);
    if (!input) {
      input = new FlowGraphMatrix3D();
      this.getDataInput("input").setValue(input, context);
    }
    for (let i = 0; i < 9; i++) {
      this.getDataOutput(`output_${i}`).setValue(input.m[i], context);
    }
  }
  getClassName() {
    return "FlowGraphExtractMatrix3DBlock";
  }
}
RegisterClass("FlowGraphExtractMatrix3DBlock", FlowGraphExtractMatrix3DBlock);
export {
  FlowGraphCombineMatrix2DBlock,
  FlowGraphCombineMatrix3DBlock,
  FlowGraphCombineMatrixBlock,
  FlowGraphCombineVector2Block,
  FlowGraphCombineVector3Block,
  FlowGraphCombineVector4Block,
  FlowGraphExtractMatrix2DBlock,
  FlowGraphExtractMatrix3DBlock,
  FlowGraphExtractMatrixBlock,
  FlowGraphExtractVector2Block,
  FlowGraphExtractVector3Block,
  FlowGraphExtractVector4Block
};
