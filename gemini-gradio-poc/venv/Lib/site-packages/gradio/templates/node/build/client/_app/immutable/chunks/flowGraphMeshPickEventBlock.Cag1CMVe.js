import { c as FlowGraphEventBlock, _ as _isADescendantOf } from "./KHR_interactivity.BEJuWS3u.js";
import { ax as PointerEventTypes, R as RegisterClass } from "./index.B4f7kVg_.js";
import { R as RichTypeAny, e as RichTypeVector3, b as RichTypeNumber } from "./declarationMapper.uCBvEQca.js";
class FlowGraphMeshPickEventBlock extends FlowGraphEventBlock {
  constructor(config) {
    super(config);
    this.config = config;
    this.type = "MeshPick";
    this.asset = this.registerDataInput("asset", RichTypeAny, config == null ? void 0 : config.targetMesh);
    this.pickedPoint = this.registerDataOutput("pickedPoint", RichTypeVector3);
    this.pickOrigin = this.registerDataOutput("pickOrigin", RichTypeVector3);
    this.pointerId = this.registerDataOutput("pointerId", RichTypeNumber);
    this.pickedMesh = this.registerDataOutput("pickedMesh", RichTypeAny);
    this.pointerType = this.registerDataInput("pointerType", RichTypeAny, PointerEventTypes.POINTERPICK);
  }
  _getReferencedMesh(context) {
    return this.asset.getValue(context);
  }
  _executeEvent(context, pickedInfo) {
    var _a, _b, _c, _d, _e;
    const pointerType = this.pointerType.getValue(context);
    if (pointerType !== pickedInfo.type) {
      return true;
    }
    const mesh = this._getReferencedMesh(context);
    if (mesh && ((_a = pickedInfo.pickInfo) == null ? void 0 : _a.pickedMesh) && (((_b = pickedInfo.pickInfo) == null ? void 0 : _b.pickedMesh) === mesh || _isADescendantOf((_c = pickedInfo.pickInfo) == null ? void 0 : _c.pickedMesh, mesh))) {
      this.pointerId.setValue(pickedInfo.event.pointerId, context);
      this.pickOrigin.setValue((_d = pickedInfo.pickInfo.ray) == null ? void 0 : _d.origin, context);
      this.pickedPoint.setValue(pickedInfo.pickInfo.pickedPoint, context);
      this.pickedMesh.setValue(pickedInfo.pickInfo.pickedMesh, context);
      this._execute(context);
      return !((_e = this.config) == null ? void 0 : _e.stopPropagation);
    } else {
      this.pointerId.resetToDefaultValue(context);
      this.pickOrigin.resetToDefaultValue(context);
      this.pickedPoint.resetToDefaultValue(context);
      this.pickedMesh.resetToDefaultValue(context);
    }
    return true;
  }
  /**
   * @internal
   */
  _preparePendingTasks(_context) {
  }
  /**
   * @internal
   */
  _cancelPendingTasks(_context) {
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphMeshPickEventBlock";
  }
}
RegisterClass("FlowGraphMeshPickEventBlock", FlowGraphMeshPickEventBlock);
export {
  FlowGraphMeshPickEventBlock
};
