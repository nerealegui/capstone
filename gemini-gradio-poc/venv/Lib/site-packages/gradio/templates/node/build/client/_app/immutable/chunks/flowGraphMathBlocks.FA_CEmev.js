import { R as RegisterClass, M as Matrix, Q as Quaternion, az as Vector4, V as Vector3, ay as Vector2 } from "./index.B4f7kVg_.js";
import { g as getRichTypeByFlowGraphType, n as FlowGraphMatrix2D, p as FlowGraphMatrix3D, b as RichTypeNumber, R as RichTypeAny, c as RichTypeBoolean, F as FlowGraphInteger, j as RichTypeFlowGraphInteger } from "./declarationMapper.uCBvEQca.js";
import { F as FlowGraphBinaryOperationBlock } from "./flowGraphBinaryOperationBlock.BnuDU0w6.js";
import { F as FlowGraphCachedOperationBlock } from "./flowGraphCachedOperationBlock.BYccI7XF.js";
import { F as FlowGraphUnaryOperationBlock } from "./flowGraphUnaryOperationBlock.JXfHGDC4.js";
import { F as FlowGraphTernaryOperationBlock } from "./flowGraphTernaryOperationBlock.BkdkPXG8.js";
import { e as _getClassNameOf, j as _areSameVectorClass, k as _areSameMatrixClass, l as _areSameIntegerClass, i as isNumeric, g as getNumericValue } from "./KHR_interactivity.BEJuWS3u.js";
class FlowGraphConstantOperationBlock extends FlowGraphCachedOperationBlock {
  constructor(richType, _operation, _className, config) {
    super(richType, config);
    this._operation = _operation;
    this._className = _className;
  }
  /**
   * the operation performed by this block
   * @param context the graph context
   * @returns the result of the operation
   */
  _doOperation(context) {
    return this._operation(context);
  }
  /**
   * Gets the class name of this block
   * @returns the class name
   */
  getClassName() {
    return this._className;
  }
}
class FlowGraphAddBlock extends FlowGraphBinaryOperationBlock {
  /**
   * Construct a new add block.
   * @param config optional configuration
   */
  constructor(config) {
    super(getRichTypeByFlowGraphType(config == null ? void 0 : config.type), getRichTypeByFlowGraphType(config == null ? void 0 : config.type), getRichTypeByFlowGraphType(config == null ? void 0 : config.type), (a, b) => this._polymorphicAdd(a, b), "FlowGraphAddBlock", config);
  }
  _polymorphicAdd(a, b) {
    const aClassName = _getClassNameOf(a);
    const bClassName = _getClassNameOf(b);
    if (_areSameVectorClass(aClassName, bClassName) || _areSameMatrixClass(aClassName, bClassName) || _areSameIntegerClass(aClassName, bClassName)) {
      return a.add(b);
    } else if (aClassName === "Quaternion" || bClassName === "Quaternion") {
      return a.add(b);
    } else {
      return a + b;
    }
  }
}
RegisterClass("FlowGraphAddBlock", FlowGraphAddBlock);
class FlowGraphSubtractBlock extends FlowGraphBinaryOperationBlock {
  /**
   * Construct a new subtract block.
   * @param config optional configuration
   */
  constructor(config) {
    super(getRichTypeByFlowGraphType(config == null ? void 0 : config.type), getRichTypeByFlowGraphType(config == null ? void 0 : config.type), getRichTypeByFlowGraphType(config == null ? void 0 : config.type), (a, b) => this._polymorphicSubtract(a, b), "FlowGraphSubtractBlock", config);
  }
  _polymorphicSubtract(a, b) {
    const aClassName = _getClassNameOf(a);
    const bClassName = _getClassNameOf(b);
    if (_areSameVectorClass(aClassName, bClassName) || _areSameIntegerClass(aClassName, bClassName) || _areSameMatrixClass(aClassName, bClassName)) {
      return a.subtract(b);
    } else if (aClassName === "Quaternion" || bClassName === "Quaternion") {
      return a.subtract(b);
    } else {
      return a - b;
    }
  }
}
RegisterClass("FlowGraphSubtractBlock", FlowGraphSubtractBlock);
class FlowGraphMultiplyBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(getRichTypeByFlowGraphType(config == null ? void 0 : config.type), getRichTypeByFlowGraphType(config == null ? void 0 : config.type), getRichTypeByFlowGraphType(config == null ? void 0 : config.type), (a, b) => this._polymorphicMultiply(a, b), "FlowGraphMultiplyBlock", config);
  }
  _polymorphicMultiply(a, b) {
    var _a;
    const aClassName = _getClassNameOf(a);
    const bClassName = _getClassNameOf(b);
    if (_areSameVectorClass(aClassName, bClassName) || _areSameIntegerClass(aClassName, bClassName)) {
      return a.multiply(b);
    } else if (aClassName === "Quaternion" || bClassName === "Quaternion") {
      const aClone = a.clone();
      aClone.x *= b.x;
      aClone.y *= b.y;
      aClone.z *= b.z;
      aClone.w *= b.w;
      return aClone;
    } else if (_areSameMatrixClass(aClassName, bClassName)) {
      if ((_a = this.config) == null ? void 0 : _a.useMatrixPerComponent) {
        const aM = a.m;
        for (let i = 0; i < aM.length; i++) {
          aM[i] *= b.m[i];
        }
        if (aClassName === "Matrix2D") {
          return new FlowGraphMatrix2D(aM);
        } else if (aClassName === "Matrix3D") {
          return new FlowGraphMatrix3D(aM);
        } else {
          return Matrix.FromArray(aM);
        }
      } else {
        a = a;
        b = b;
        return b.multiply(a);
      }
    } else {
      return a * b;
    }
  }
}
RegisterClass("FlowGraphMultiplyBlock", FlowGraphMultiplyBlock);
class FlowGraphDivideBlock extends FlowGraphBinaryOperationBlock {
  /**
   * Construct a new divide block.
   * @param config - Optional configuration
   */
  constructor(config) {
    super(getRichTypeByFlowGraphType(config == null ? void 0 : config.type), getRichTypeByFlowGraphType(config == null ? void 0 : config.type), getRichTypeByFlowGraphType(config == null ? void 0 : config.type), (a, b) => this._polymorphicDivide(a, b), "FlowGraphDivideBlock", config);
  }
  _polymorphicDivide(a, b) {
    var _a;
    const aClassName = _getClassNameOf(a);
    const bClassName = _getClassNameOf(b);
    if (_areSameVectorClass(aClassName, bClassName) || _areSameIntegerClass(aClassName, bClassName)) {
      return a.divide(b);
    } else if (aClassName === "Quaternion" || bClassName === "Quaternion") {
      const aClone = a.clone();
      aClone.x /= b.x;
      aClone.y /= b.y;
      aClone.z /= b.z;
      aClone.w /= b.w;
      return aClone;
    } else if (_areSameMatrixClass(aClassName, bClassName)) {
      if ((_a = this.config) == null ? void 0 : _a.useMatrixPerComponent) {
        const aM = a.m;
        for (let i = 0; i < aM.length; i++) {
          aM[i] /= b.m[i];
        }
        if (aClassName === "Matrix2D") {
          return new FlowGraphMatrix2D(aM);
        } else if (aClassName === "Matrix3D") {
          return new FlowGraphMatrix3D(aM);
        } else {
          return Matrix.FromArray(aM);
        }
      } else {
        a = a;
        b = b;
        return a.divide(b);
      }
    } else {
      return a / b;
    }
  }
}
RegisterClass("FlowGraphDivideBlock", FlowGraphDivideBlock);
class FlowGraphRandomBlock extends FlowGraphConstantOperationBlock {
  /**
   * Construct a new random block.
   * @param config optional configuration
   */
  constructor(config) {
    super(RichTypeNumber, (context) => this._random(context), "FlowGraphRandomBlock", config);
    this.min = this.registerDataInput("min", RichTypeNumber, (config == null ? void 0 : config.min) ?? 0);
    this.max = this.registerDataInput("max", RichTypeNumber, (config == null ? void 0 : config.max) ?? 1);
    if (config == null ? void 0 : config.seed) {
      this._seed = config.seed;
    }
  }
  _isSeed(seed = this._seed) {
    return seed !== void 0;
  }
  _getRandomValue() {
    if (this._isSeed(this._seed)) {
      const x = Math.sin(this._seed++) * 1e4;
      return x - Math.floor(x);
    }
    return Math.random();
  }
  _random(context) {
    const min = this.min.getValue(context);
    const max = this.max.getValue(context);
    return this._getRandomValue() * (max - min) + min;
  }
}
RegisterClass("FlowGraphRandomBlock", FlowGraphRandomBlock);
class FlowGraphEBlock extends FlowGraphConstantOperationBlock {
  constructor(config) {
    super(RichTypeNumber, () => Math.E, "FlowGraphEBlock", config);
  }
}
RegisterClass("FlowGraphEBlock", FlowGraphEBlock);
class FlowGraphPiBlock extends FlowGraphConstantOperationBlock {
  constructor(config) {
    super(RichTypeNumber, () => Math.PI, "FlowGraphPIBlock", config);
  }
}
RegisterClass("FlowGraphPIBlock", FlowGraphPiBlock);
class FlowGraphInfBlock extends FlowGraphConstantOperationBlock {
  constructor(config) {
    super(RichTypeNumber, () => Number.POSITIVE_INFINITY, "FlowGraphInfBlock", config);
  }
}
RegisterClass("FlowGraphInfBlock", FlowGraphInfBlock);
class FlowGraphNaNBlock extends FlowGraphConstantOperationBlock {
  constructor(config) {
    super(RichTypeNumber, () => Number.NaN, "FlowGraphNaNBlock", config);
  }
}
RegisterClass("FlowGraphNaNBlock", FlowGraphNaNBlock);
function _componentWiseUnaryOperation(a, op) {
  const aClassName = _getClassNameOf(a);
  switch (aClassName) {
    case "FlowGraphInteger":
      a = a;
      return new FlowGraphInteger(op(a.value));
    case "Vector2":
      a = a;
      return new Vector2(op(a.x), op(a.y));
    case "Vector3":
      a = a;
      return new Vector3(op(a.x), op(a.y), op(a.z));
    case "Vector4":
      a = a;
      return new Vector4(op(a.x), op(a.y), op(a.z), op(a.w));
    case "Quaternion":
      a = a;
      return new Quaternion(op(a.x), op(a.y), op(a.z), op(a.w));
    case "Matrix":
      a = a;
      return Matrix.FromArray(a.m.map(op));
    case "Matrix2D":
      a = a;
      return new FlowGraphMatrix2D(a.m.map(op));
    case "Matrix3D":
      a = a;
      return new FlowGraphMatrix3D(a.m.map(op));
    default:
      a = a;
      return op(a);
  }
}
class FlowGraphAbsBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeNumber, RichTypeNumber, (a) => this._polymorphicAbs(a), "FlowGraphAbsBlock", config);
  }
  _polymorphicAbs(a) {
    return _componentWiseUnaryOperation(a, Math.abs);
  }
}
RegisterClass("FlowGraphAbsBlock", FlowGraphAbsBlock);
class FlowGraphSignBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeNumber, RichTypeNumber, (a) => this._polymorphicSign(a), "FlowGraphSignBlock", config);
  }
  _polymorphicSign(a) {
    return _componentWiseUnaryOperation(a, Math.sign);
  }
}
RegisterClass("FlowGraphSignBlock", FlowGraphSignBlock);
class FlowGraphTruncBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeNumber, RichTypeNumber, (a) => this._polymorphicTrunc(a), "FlowGraphTruncBlock", config);
  }
  _polymorphicTrunc(a) {
    return _componentWiseUnaryOperation(a, Math.trunc);
  }
}
RegisterClass("FlowGraphTruncBlock", FlowGraphTruncBlock);
class FlowGraphFloorBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeNumber, RichTypeNumber, (a) => this._polymorphicFloor(a), "FlowGraphFloorBlock", config);
  }
  _polymorphicFloor(a) {
    return _componentWiseUnaryOperation(a, Math.floor);
  }
}
RegisterClass("FlowGraphFloorBlock", FlowGraphFloorBlock);
class FlowGraphCeilBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, (a) => this._polymorphicCeiling(a), "FlowGraphCeilBlock", config);
  }
  _polymorphicCeiling(a) {
    return _componentWiseUnaryOperation(a, Math.ceil);
  }
}
RegisterClass("FlowGraphCeilBlock", FlowGraphCeilBlock);
class FlowGraphRoundBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, (a) => this._polymorphicRound(a), "FlowGraphRoundBlock", config);
  }
  _polymorphicRound(a) {
    return _componentWiseUnaryOperation(a, (a2) => {
      var _a;
      return a2 < 0 && ((_a = this.config) == null ? void 0 : _a.roundHalfAwayFromZero) ? -Math.round(-a2) : Math.round(a2);
    });
  }
}
RegisterClass("FlowGraphRoundBlock", FlowGraphRoundBlock);
class FlowGraphFractionBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, (a) => this._polymorphicFraction(a), "FlowGraphFractBlock", config);
  }
  _polymorphicFraction(a) {
    return _componentWiseUnaryOperation(a, (a2) => a2 - Math.floor(a2));
  }
}
RegisterClass("FlowGraphFractBlock", FlowGraphFractionBlock);
class FlowGraphNegationBlock extends FlowGraphUnaryOperationBlock {
  /**
   * construct a new negation block.
   * @param config optional configuration
   */
  constructor(config) {
    super(RichTypeAny, RichTypeAny, (a) => this._polymorphicNeg(a), "FlowGraphNegationBlock", config);
  }
  _polymorphicNeg(a) {
    return _componentWiseUnaryOperation(a, (a2) => -a2);
  }
}
RegisterClass("FlowGraphNegationBlock", FlowGraphNegationBlock);
function _componentWiseBinaryOperation(a, b, op) {
  const aClassName = _getClassNameOf(a);
  switch (aClassName) {
    case "FlowGraphInteger":
      a = a;
      b = b;
      return new FlowGraphInteger(op(a.value, b.value));
    case "Vector2":
      a = a;
      b = b;
      return new Vector2(op(a.x, b.x), op(a.y, b.y));
    case "Vector3":
      a = a;
      b = b;
      return new Vector3(op(a.x, b.x), op(a.y, b.y), op(a.z, b.z));
    case "Vector4":
      a = a;
      b = b;
      return new Vector4(op(a.x, b.x), op(a.y, b.y), op(a.z, b.z), op(a.w, b.w));
    case "Quaternion":
      a = a;
      b = b;
      return new Quaternion(op(a.x, b.x), op(a.y, b.y), op(a.z, b.z), op(a.w, b.w));
    case "Matrix":
      a = a;
      return Matrix.FromArray(a.m.map((v, i) => op(v, b.m[i])));
    case "Matrix2D":
      a = a;
      return new FlowGraphMatrix2D(a.m.map((v, i) => op(v, b.m[i])));
    case "Matrix3D":
      a = a;
      return new FlowGraphMatrix3D(a.m.map((v, i) => op(v, b.m[i])));
    default:
      return op(a, b);
  }
}
class FlowGraphModuloBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, RichTypeAny, (a, b) => this._polymorphicRemainder(a, b), "FlowGraphModuloBlock", config);
  }
  _polymorphicRemainder(a, b) {
    return _componentWiseBinaryOperation(a, b, (a2, b2) => a2 % b2);
  }
}
RegisterClass("FlowGraphModuloBlock", FlowGraphModuloBlock);
class FlowGraphMinBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, RichTypeAny, (a, b) => this._polymorphicMin(a, b), "FlowGraphMinBlock", config);
  }
  _polymorphicMin(a, b) {
    return _componentWiseBinaryOperation(a, b, Math.min);
  }
}
RegisterClass("FlowGraphMinBlock", FlowGraphMinBlock);
class FlowGraphMaxBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, RichTypeAny, (a, b) => this._polymorphicMax(a, b), "FlowGraphMaxBlock", config);
  }
  _polymorphicMax(a, b) {
    return _componentWiseBinaryOperation(a, b, Math.max);
  }
}
RegisterClass("FlowGraphMaxBlock", FlowGraphMaxBlock);
function _clamp(a, b, c) {
  return Math.min(Math.max(a, Math.min(b, c)), Math.max(b, c));
}
function _componentWiseTernaryOperation(a, b, c, op) {
  const aClassName = _getClassNameOf(a);
  switch (aClassName) {
    case "FlowGraphInteger":
      a = a;
      b = b;
      c = c;
      return new FlowGraphInteger(op(a.value, b.value, c.value));
    case "Vector2":
      a = a;
      b = b;
      c = c;
      return new Vector2(op(a.x, b.x, c.x), op(a.y, b.y, c.y));
    case "Vector3":
      a = a;
      b = b;
      c = c;
      return new Vector3(op(a.x, b.x, c.x), op(a.y, b.y, c.y), op(a.z, b.z, c.z));
    case "Vector4":
      a = a;
      b = b;
      c = c;
      return new Vector4(op(a.x, b.x, c.x), op(a.y, b.y, c.y), op(a.z, b.z, c.z), op(a.w, b.w, c.w));
    case "Quaternion":
      a = a;
      b = b;
      c = c;
      return new Quaternion(op(a.x, b.x, c.x), op(a.y, b.y, c.y), op(a.z, b.z, c.z), op(a.w, b.w, c.w));
    case "Matrix":
      return Matrix.FromArray(a.m.map((v, i) => op(v, b.m[i], c.m[i])));
    case "Matrix2D":
      return new FlowGraphMatrix2D(a.m.map((v, i) => op(v, b.m[i], c.m[i])));
    case "Matrix3D":
      return new FlowGraphMatrix3D(a.m.map((v, i) => op(v, b.m[i], c.m[i])));
    default:
      return op(a, b, c);
  }
}
class FlowGraphClampBlock extends FlowGraphTernaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, RichTypeAny, RichTypeAny, (a, b, c) => this._polymorphicClamp(a, b, c), "FlowGraphClampBlock", config);
  }
  _polymorphicClamp(a, b, c) {
    return _componentWiseTernaryOperation(a, b, c, _clamp);
  }
}
RegisterClass("FlowGraphClampBlock", FlowGraphClampBlock);
function _saturate(a) {
  return Math.min(Math.max(a, 0), 1);
}
class FlowGraphSaturateBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, (a) => this._polymorphicSaturate(a), "FlowGraphSaturateBlock", config);
  }
  _polymorphicSaturate(a) {
    return _componentWiseUnaryOperation(a, _saturate);
  }
}
RegisterClass("FlowGraphSaturateBlock", FlowGraphSaturateBlock);
function _interpolate(a, b, c) {
  return (1 - c) * a + c * b;
}
class FlowGraphMathInterpolationBlock extends FlowGraphTernaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, RichTypeAny, RichTypeAny, (a, b, c) => this._polymorphicInterpolate(a, b, c), "FlowGraphMathInterpolationBlock", config);
  }
  _polymorphicInterpolate(a, b, c) {
    return _componentWiseTernaryOperation(a, b, c, _interpolate);
  }
}
RegisterClass("FlowGraphMathInterpolationBlock", FlowGraphMathInterpolationBlock);
class FlowGraphEqualityBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, RichTypeBoolean, (a, b) => this._polymorphicEq(a, b), "FlowGraphEqualityBlock", config);
  }
  _polymorphicEq(a, b) {
    const aClassName = _getClassNameOf(a);
    const bClassName = _getClassNameOf(b);
    if (_areSameVectorClass(aClassName, bClassName) || _areSameMatrixClass(aClassName, bClassName) || _areSameIntegerClass(aClassName, bClassName)) {
      return a.equals(b);
    } else {
      return a === b;
    }
  }
}
RegisterClass("FlowGraphEqualityBlock", FlowGraphEqualityBlock);
function _comparisonOperators(a, b, op) {
  if (isNumeric(a) && isNumeric(b)) {
    return op(getNumericValue(a), getNumericValue(b));
  } else {
    throw new Error(`Cannot compare ${a} and ${b}`);
  }
}
class FlowGraphLessThanBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, RichTypeBoolean, (a, b) => this._polymorphicLessThan(a, b), "FlowGraphLessThanBlock", config);
  }
  _polymorphicLessThan(a, b) {
    return _comparisonOperators(a, b, (a2, b2) => a2 < b2);
  }
}
RegisterClass("FlowGraphLessThanBlock", FlowGraphLessThanBlock);
class FlowGraphLessThanOrEqualBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, RichTypeBoolean, (a, b) => this._polymorphicLessThanOrEqual(a, b), "FlowGraphLessThanOrEqualBlock", config);
  }
  _polymorphicLessThanOrEqual(a, b) {
    return _comparisonOperators(a, b, (a2, b2) => a2 <= b2);
  }
}
RegisterClass("FlowGraphLessThanOrEqualBlock", FlowGraphLessThanOrEqualBlock);
class FlowGraphGreaterThanBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, RichTypeBoolean, (a, b) => this._polymorphicGreaterThan(a, b), "FlowGraphGreaterThanBlock", config);
  }
  _polymorphicGreaterThan(a, b) {
    return _comparisonOperators(a, b, (a2, b2) => a2 > b2);
  }
}
RegisterClass("FlowGraphGreaterThanBlock", FlowGraphGreaterThanBlock);
class FlowGraphGreaterThanOrEqualBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, RichTypeBoolean, (a, b) => this._polymorphicGreaterThanOrEqual(a, b), "FlowGraphGreaterThanOrEqualBlock", config);
  }
  _polymorphicGreaterThanOrEqual(a, b) {
    return _comparisonOperators(a, b, (a2, b2) => a2 >= b2);
  }
}
RegisterClass("FlowGraphGreaterThanOrEqualBlock", FlowGraphGreaterThanOrEqualBlock);
class FlowGraphIsNanBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeBoolean, (a) => this._polymorphicIsNan(a), "FlowGraphIsNaNBlock", config);
  }
  _polymorphicIsNan(a) {
    if (isNumeric(a)) {
      return isNaN(getNumericValue(a));
    } else {
      throw new Error(`Cannot get NaN of ${a}`);
    }
  }
}
RegisterClass("FlowGraphIsNaNBlock", FlowGraphIsNanBlock);
class FlowGraphIsInfinityBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeBoolean, (a) => this._polymorphicIsInf(a), "FlowGraphIsInfBlock", config);
  }
  _polymorphicIsInf(a) {
    if (isNumeric(a)) {
      return !isFinite(getNumericValue(a));
    } else {
      throw new Error(`Cannot get isInf of ${a}`);
    }
  }
}
RegisterClass("FlowGraphIsInfBlock", FlowGraphIsInfinityBlock);
class FlowGraphDegToRadBlock extends FlowGraphUnaryOperationBlock {
  /**
   * Constructs a new instance of the flow graph math block.
   * @param config - Optional configuration for the flow graph block.
   */
  constructor(config) {
    super(RichTypeAny, RichTypeAny, (a) => this._polymorphicDegToRad(a), "FlowGraphDegToRadBlock", config);
  }
  _degToRad(a) {
    return a * Math.PI / 180;
  }
  _polymorphicDegToRad(a) {
    return _componentWiseUnaryOperation(a, this._degToRad);
  }
}
RegisterClass("FlowGraphDegToRadBlock", FlowGraphDegToRadBlock);
class FlowGraphRadToDegBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, (a) => this._polymorphicRadToDeg(a), "FlowGraphRadToDegBlock", config);
  }
  _radToDeg(a) {
    return a * 180 / Math.PI;
  }
  _polymorphicRadToDeg(a) {
    return _componentWiseUnaryOperation(a, this._radToDeg);
  }
}
RegisterClass("FlowGraphRadToDegBlock", FlowGraphRadToDegBlock);
class FlowGraphSinBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeNumber, RichTypeNumber, (a) => this._polymorphicSin(a), "FlowGraphSinBlock", config);
  }
  _polymorphicSin(a) {
    return _componentWiseUnaryOperation(a, Math.sin);
  }
}
class FlowGraphCosBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeNumber, RichTypeNumber, (a) => this._polymorphicCos(a), "FlowGraphCosBlock", config);
  }
  _polymorphicCos(a) {
    return _componentWiseUnaryOperation(a, Math.cos);
  }
}
class FlowGraphTanBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeNumber, RichTypeNumber, (a) => this._polymorphicTan(a), "FlowGraphTanBlock", config);
  }
  _polymorphicTan(a) {
    return _componentWiseUnaryOperation(a, Math.tan);
  }
}
class FlowGraphAsinBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeNumber, RichTypeNumber, (a) => this._polymorphicAsin(a), "FlowGraphASinBlock", config);
  }
  _polymorphicAsin(a) {
    return _componentWiseUnaryOperation(a, Math.asin);
  }
}
RegisterClass("FlowGraphASinBlock", FlowGraphAsinBlock);
class FlowGraphAcosBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeNumber, RichTypeNumber, (a) => this._polymorphicAcos(a), "FlowGraphACosBlock", config);
  }
  _polymorphicAcos(a) {
    return _componentWiseUnaryOperation(a, Math.acos);
  }
}
RegisterClass("FlowGraphACosBlock", FlowGraphAcosBlock);
class FlowGraphAtanBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeNumber, RichTypeNumber, (a) => this._polymorphicAtan(a), "FlowGraphATanBlock", config);
  }
  _polymorphicAtan(a) {
    return _componentWiseUnaryOperation(a, Math.atan);
  }
}
RegisterClass("FlowGraphATanBlock", FlowGraphAtanBlock);
class FlowGraphAtan2Block extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, RichTypeAny, (a, b) => this._polymorphicAtan2(a, b), "FlowGraphATan2Block", config);
  }
  _polymorphicAtan2(a, b) {
    return _componentWiseBinaryOperation(a, b, Math.atan2);
  }
}
RegisterClass("FlowGraphATan2Block", FlowGraphAtan2Block);
class FlowGraphSinhBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, (a) => this._polymorphicSinh(a), "FlowGraphSinhBlock", config);
  }
  _polymorphicSinh(a) {
    return _componentWiseUnaryOperation(a, Math.sinh);
  }
}
RegisterClass("FlowGraphSinhBlock", FlowGraphSinhBlock);
class FlowGraphCoshBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, (a) => this._polymorphicCosh(a), "FlowGraphCoshBlock", config);
  }
  _polymorphicCosh(a) {
    return _componentWiseUnaryOperation(a, Math.cosh);
  }
}
RegisterClass("FlowGraphCoshBlock", FlowGraphCoshBlock);
class FlowGraphTanhBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, (a) => this._polymorphicTanh(a), "FlowGraphTanhBlock", config);
  }
  _polymorphicTanh(a) {
    return _componentWiseUnaryOperation(a, Math.tanh);
  }
}
RegisterClass("FlowGraphTanhBlock", FlowGraphTanhBlock);
class FlowGraphAsinhBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeNumber, (a) => this._polymorphicAsinh(a), "FlowGraphASinhBlock", config);
  }
  _polymorphicAsinh(a) {
    return _componentWiseUnaryOperation(a, Math.asinh);
  }
}
RegisterClass("FlowGraphASinhBlock", FlowGraphAsinhBlock);
class FlowGraphAcoshBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeNumber, (a) => this._polymorphicAcosh(a), "FlowGraphACoshBlock", config);
  }
  _polymorphicAcosh(a) {
    return _componentWiseUnaryOperation(a, Math.acosh);
  }
}
RegisterClass("FlowGraphACoshBlock", FlowGraphAcoshBlock);
class FlowGraphAtanhBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeNumber, (a) => this._polymorphicAtanh(a), "FlowGraphATanhBlock", config);
  }
  _polymorphicAtanh(a) {
    return _componentWiseUnaryOperation(a, Math.atanh);
  }
}
RegisterClass("FlowGraphATanhBlock", FlowGraphAtanhBlock);
class FlowGraphExpBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeNumber, (a) => this._polymorphicExp(a), "FlowGraphExponentialBlock", config);
  }
  _polymorphicExp(a) {
    return _componentWiseUnaryOperation(a, Math.exp);
  }
}
RegisterClass("FlowGraphExponentialBlock", FlowGraphExpBlock);
class FlowGraphLogBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeNumber, (a) => this._polymorphicLog(a), "FlowGraphLogBlock", config);
  }
  _polymorphicLog(a) {
    return _componentWiseUnaryOperation(a, Math.log);
  }
}
RegisterClass("FlowGraphLogBlock", FlowGraphLogBlock);
class FlowGraphLog2Block extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeNumber, (a) => this._polymorphicLog2(a), "FlowGraphLog2Block", config);
  }
  _polymorphicLog2(a) {
    return _componentWiseUnaryOperation(a, Math.log2);
  }
}
RegisterClass("FlowGraphLog2Block", FlowGraphLog2Block);
class FlowGraphLog10Block extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeNumber, (a) => this._polymorphicLog10(a), "FlowGraphLog10Block", config);
  }
  _polymorphicLog10(a) {
    return _componentWiseUnaryOperation(a, Math.log10);
  }
}
RegisterClass("FlowGraphLog10Block", FlowGraphLog10Block);
class FlowGraphSquareRootBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeNumber, (a) => this._polymorphicSqrt(a), "FlowGraphSquareRootBlock", config);
  }
  _polymorphicSqrt(a) {
    return _componentWiseUnaryOperation(a, Math.sqrt);
  }
}
RegisterClass("FlowGraphSquareRootBlock", FlowGraphSquareRootBlock);
class FlowGraphCubeRootBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeNumber, (a) => this._polymorphicCubeRoot(a), "FlowGraphCubeRootBlock", config);
  }
  _polymorphicCubeRoot(a) {
    return _componentWiseUnaryOperation(a, Math.cbrt);
  }
}
RegisterClass("FlowGraphCubeRootBlock", FlowGraphCubeRootBlock);
class FlowGraphPowerBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeNumber, RichTypeNumber, (a, b) => this._polymorphicPow(a, b), "FlowGraphPowerBlock", config);
  }
  _polymorphicPow(a, b) {
    return _componentWiseBinaryOperation(a, b, Math.pow);
  }
}
RegisterClass("FlowGraphPowerBlock", FlowGraphPowerBlock);
class FlowGraphBitwiseNotBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.valueType) || "FlowGraphInteger"
      /* FlowGraphTypes.Integer */
    ), getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.valueType) || "FlowGraphInteger"
      /* FlowGraphTypes.Integer */
    ), (a) => {
      if (typeof a === "boolean") {
        return !a;
      } else if (typeof a === "number") {
        return ~a;
      }
      return new FlowGraphInteger(~a.value);
    }, "FlowGraphBitwiseNotBlock", config);
  }
}
RegisterClass("FlowGraphBitwiseNotBlock", FlowGraphBitwiseNotBlock);
class FlowGraphBitwiseAndBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.valueType) || "FlowGraphInteger"
      /* FlowGraphTypes.Integer */
    ), getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.valueType) || "FlowGraphInteger"
      /* FlowGraphTypes.Integer */
    ), getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.valueType) || "FlowGraphInteger"
      /* FlowGraphTypes.Integer */
    ), (a, b) => {
      if (typeof a === "boolean" && typeof b === "boolean") {
        return a && b;
      } else if (typeof a === "number" && typeof b === "number") {
        return a & b;
      } else if (typeof a === "object" && typeof b === "object") {
        return new FlowGraphInteger(a.value & b.value);
      } else {
        throw new Error(`Cannot perform bitwise AND on ${a} and ${b}`);
      }
    }, "FlowGraphBitwiseAndBlock", config);
  }
}
RegisterClass("FlowGraphBitwiseAndBlock", FlowGraphBitwiseAndBlock);
class FlowGraphBitwiseOrBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.valueType) || "FlowGraphInteger"
      /* FlowGraphTypes.Integer */
    ), getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.valueType) || "FlowGraphInteger"
      /* FlowGraphTypes.Integer */
    ), getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.valueType) || "FlowGraphInteger"
      /* FlowGraphTypes.Integer */
    ), (a, b) => {
      if (typeof a === "boolean" && typeof b === "boolean") {
        return a || b;
      } else if (typeof a === "number" && typeof b === "number") {
        return a | b;
      } else if (typeof a === "object" && typeof b === "object") {
        return new FlowGraphInteger(a.value | b.value);
      } else {
        throw new Error(`Cannot perform bitwise OR on ${a} and ${b}`);
      }
    }, "FlowGraphBitwiseOrBlock", config);
  }
}
RegisterClass("FlowGraphBitwiseOrBlock", FlowGraphBitwiseOrBlock);
class FlowGraphBitwiseXorBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.valueType) || "FlowGraphInteger"
      /* FlowGraphTypes.Integer */
    ), getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.valueType) || "FlowGraphInteger"
      /* FlowGraphTypes.Integer */
    ), getRichTypeByFlowGraphType(
      (config == null ? void 0 : config.valueType) || "FlowGraphInteger"
      /* FlowGraphTypes.Integer */
    ), (a, b) => {
      if (typeof a === "boolean" && typeof b === "boolean") {
        return a !== b;
      } else if (typeof a === "number" && typeof b === "number") {
        return a ^ b;
      } else if (typeof a === "object" && typeof b === "object") {
        return new FlowGraphInteger(a.value ^ b.value);
      } else {
        throw new Error(`Cannot perform bitwise XOR on ${a} and ${b}`);
      }
    }, "FlowGraphBitwiseXorBlock", config);
  }
}
RegisterClass("FlowGraphBitwiseXorBlock", FlowGraphBitwiseXorBlock);
class FlowGraphBitwiseLeftShiftBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeFlowGraphInteger, RichTypeFlowGraphInteger, RichTypeFlowGraphInteger, (a, b) => new FlowGraphInteger(a.value << b.value), "FlowGraphBitwiseLeftShiftBlock", config);
  }
}
RegisterClass("FlowGraphBitwiseLeftShiftBlock", FlowGraphBitwiseLeftShiftBlock);
class FlowGraphBitwiseRightShiftBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeFlowGraphInteger, RichTypeFlowGraphInteger, RichTypeFlowGraphInteger, (a, b) => new FlowGraphInteger(a.value >> b.value), "FlowGraphBitwiseRightShiftBlock", config);
  }
}
RegisterClass("FlowGraphBitwiseRightShiftBlock", FlowGraphBitwiseRightShiftBlock);
class FlowGraphLeadingZerosBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeFlowGraphInteger, RichTypeFlowGraphInteger, (a) => new FlowGraphInteger(Math.clz32(a.value)), "FlowGraphLeadingZerosBlock", config);
  }
}
RegisterClass("FlowGraphLeadingZerosBlock", FlowGraphLeadingZerosBlock);
class FlowGraphTrailingZerosBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeFlowGraphInteger, RichTypeFlowGraphInteger, (a) => new FlowGraphInteger(a.value ? 31 - Math.clz32(a.value & -a.value) : 32), "FlowGraphTrailingZerosBlock", config);
  }
}
RegisterClass("FlowGraphTrailingZerosBlock", FlowGraphTrailingZerosBlock);
function _countOnes(n) {
  let result = 0;
  while (n) {
    result += n & 1;
    n >>= 1;
  }
  return result;
}
class FlowGraphOneBitsCounterBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeFlowGraphInteger, RichTypeFlowGraphInteger, (a) => new FlowGraphInteger(_countOnes(a.value)), "FlowGraphOneBitsCounterBlock", config);
  }
}
RegisterClass("FlowGraphOneBitsCounterBlock", FlowGraphOneBitsCounterBlock);
export {
  FlowGraphAbsBlock,
  FlowGraphAcosBlock,
  FlowGraphAcoshBlock,
  FlowGraphAddBlock,
  FlowGraphAsinBlock,
  FlowGraphAsinhBlock,
  FlowGraphAtan2Block,
  FlowGraphAtanBlock,
  FlowGraphAtanhBlock,
  FlowGraphBitwiseAndBlock,
  FlowGraphBitwiseLeftShiftBlock,
  FlowGraphBitwiseNotBlock,
  FlowGraphBitwiseOrBlock,
  FlowGraphBitwiseRightShiftBlock,
  FlowGraphBitwiseXorBlock,
  FlowGraphCeilBlock,
  FlowGraphClampBlock,
  FlowGraphCosBlock,
  FlowGraphCoshBlock,
  FlowGraphCubeRootBlock,
  FlowGraphDegToRadBlock,
  FlowGraphDivideBlock,
  FlowGraphEBlock,
  FlowGraphEqualityBlock,
  FlowGraphExpBlock,
  FlowGraphFloorBlock,
  FlowGraphFractionBlock,
  FlowGraphGreaterThanBlock,
  FlowGraphGreaterThanOrEqualBlock,
  FlowGraphInfBlock,
  FlowGraphIsInfinityBlock,
  FlowGraphIsNanBlock,
  FlowGraphLeadingZerosBlock,
  FlowGraphLessThanBlock,
  FlowGraphLessThanOrEqualBlock,
  FlowGraphLog10Block,
  FlowGraphLog2Block,
  FlowGraphLogBlock,
  FlowGraphMathInterpolationBlock,
  FlowGraphMaxBlock,
  FlowGraphMinBlock,
  FlowGraphModuloBlock,
  FlowGraphMultiplyBlock,
  FlowGraphNaNBlock,
  FlowGraphNegationBlock,
  FlowGraphOneBitsCounterBlock,
  FlowGraphPiBlock,
  FlowGraphPowerBlock,
  FlowGraphRadToDegBlock,
  FlowGraphRandomBlock,
  FlowGraphRoundBlock,
  FlowGraphSaturateBlock,
  FlowGraphSignBlock,
  FlowGraphSinBlock,
  FlowGraphSinhBlock,
  FlowGraphSquareRootBlock,
  FlowGraphSubtractBlock,
  FlowGraphTanBlock,
  FlowGraphTanhBlock,
  FlowGraphTrailingZerosBlock,
  FlowGraphTruncBlock
};
