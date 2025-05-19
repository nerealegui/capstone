import { R as RichTypeAny, b as RichTypeNumber, e as RichTypeVector3, f as RichTypeVector2, g as getRichTypeByFlowGraphType, h as RichTypeMatrix } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass, V as Vector3, ay as Vector2, M as Matrix, az as Vector4 } from "./index.B4f7kVg_.js";
import { F as FlowGraphBinaryOperationBlock } from "./flowGraphBinaryOperationBlock.BnuDU0w6.js";
import { F as FlowGraphUnaryOperationBlock } from "./flowGraphUnaryOperationBlock.JXfHGDC4.js";
import { F as FlowGraphTernaryOperationBlock } from "./flowGraphTernaryOperationBlock.BkdkPXG8.js";
import { e as _getClassNameOf } from "./KHR_interactivity.BEJuWS3u.js";
class FlowGraphLengthBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeNumber, (a) => this._polymorphicLength(a), "FlowGraphLengthBlock", config);
  }
  _polymorphicLength(a) {
    const aClassName = _getClassNameOf(a);
    switch (aClassName) {
      case "Vector2":
      case "Vector3":
      case "Vector4":
      case "Quaternion":
        return a.length();
      default:
        throw new Error(`Cannot compute length of value ${a}`);
    }
  }
}
RegisterClass("FlowGraphLengthBlock", FlowGraphLengthBlock);
class FlowGraphNormalizeBlock extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, (a) => this._polymorphicNormalize(a), "FlowGraphNormalizeBlock", config);
  }
  _polymorphicNormalize(a) {
    var _a;
    const aClassName = _getClassNameOf(a);
    let normalized;
    switch (aClassName) {
      case "Vector2":
      case "Vector3":
      case "Vector4":
      case "Quaternion":
        normalized = a.normalizeToNew();
        if ((_a = this.config) == null ? void 0 : _a.nanOnZeroLength) {
          const length = a.length();
          if (length === 0) {
            normalized.setAll(NaN);
          }
        }
        return normalized;
      default:
        throw new Error(`Cannot normalize value ${a}`);
    }
  }
}
RegisterClass("FlowGraphNormalizeBlock", FlowGraphNormalizeBlock);
class FlowGraphDotBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeAny, RichTypeAny, RichTypeNumber, (a, b) => this._polymorphicDot(a, b), "FlowGraphDotBlock", config);
  }
  _polymorphicDot(a, b) {
    const className = _getClassNameOf(a);
    switch (className) {
      case "Vector2":
      case "Vector3":
      case "Vector4":
      case "Quaternion":
        return a.dot(b);
      default:
        throw new Error(`Cannot get dot product of ${a} and ${b}`);
    }
  }
}
RegisterClass("FlowGraphDotBlock", FlowGraphDotBlock);
class FlowGraphCrossBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeVector3, RichTypeVector3, RichTypeVector3, (a, b) => Vector3.Cross(a, b), "FlowGraphCrossBlock", config);
  }
}
RegisterClass("FlowGraphCrossBlock", FlowGraphCrossBlock);
class FlowGraphRotate2DBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeVector2, RichTypeNumber, RichTypeVector2, (a, b) => Vector2.Transform(a, Matrix.RotationZ(b)), "FlowGraphRotate2DBlock", config);
  }
}
RegisterClass("FlowGraphRotate2DBlock", FlowGraphRotate2DBlock);
class FlowGraphRotate3DBlock extends FlowGraphTernaryOperationBlock {
  constructor(config) {
    super(RichTypeVector3, RichTypeVector3, RichTypeNumber, RichTypeVector3, (a, b, c) => Vector3.TransformCoordinates(a, Matrix.RotationAxis(b, c)), "FlowGraphRotate3DBlock", config);
  }
}
RegisterClass("FlowGraphRotate3DBlock", FlowGraphRotate3DBlock);
function _transformVector(a, b) {
  const className = _getClassNameOf(a);
  switch (className) {
    case "Vector2":
      return b.transformVector(a);
    case "Vector3":
      return b.transformVector(a);
    case "Vector4":
      a = a;
      return new Vector4(a.x * b.m[0] + a.y * b.m[1] + a.z * b.m[2] + a.w * b.m[3], a.x * b.m[4] + a.y * b.m[5] + a.z * b.m[6] + a.w * b.m[7], a.x * b.m[8] + a.y * b.m[9] + a.z * b.m[10] + a.w * b.m[11], a.x * b.m[12] + a.y * b.m[13] + a.z * b.m[14] + a.w * b.m[15]);
    default:
      throw new Error(`Cannot transform value ${a}`);
  }
}
class FlowGraphTransformBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    const vectorType = (config == null ? void 0 : config.vectorType) || "Vector3";
    const matrixType = vectorType === "Vector2" ? "Matrix2D" : vectorType === "Vector3" ? "Matrix3D" : "Matrix";
    super(getRichTypeByFlowGraphType(vectorType), getRichTypeByFlowGraphType(matrixType), getRichTypeByFlowGraphType(vectorType), _transformVector, "FlowGraphTransformVectorBlock", config);
  }
}
RegisterClass("FlowGraphTransformVectorBlock", FlowGraphTransformBlock);
class FlowGraphTransformCoordinatesBlock extends FlowGraphBinaryOperationBlock {
  constructor(config) {
    super(RichTypeVector3, RichTypeMatrix, RichTypeVector3, (a, b) => Vector3.TransformCoordinates(a, b), "FlowGraphTransformCoordinatesBlock", config);
  }
}
RegisterClass("FlowGraphTransformCoordinatesBlock", FlowGraphTransformCoordinatesBlock);
export {
  FlowGraphCrossBlock,
  FlowGraphDotBlock,
  FlowGraphLengthBlock,
  FlowGraphNormalizeBlock,
  FlowGraphRotate2DBlock,
  FlowGraphRotate3DBlock,
  FlowGraphTransformBlock,
  FlowGraphTransformCoordinatesBlock
};
