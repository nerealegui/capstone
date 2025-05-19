import { c as FlowGraphEventBlock, _ as _isADescendantOf } from "./KHR_interactivity.BEJuWS3u.js";
import { b as RichTypeNumber, R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphPointerOverEventBlock extends FlowGraphEventBlock {
  constructor(config) {
    super(config);
    this.type = "PointerOver";
    this.pointerId = this.registerDataOutput("pointerId", RichTypeNumber);
    this.targetMesh = this.registerDataInput("targetMesh", RichTypeAny, config == null ? void 0 : config.targetMesh);
    this.meshUnderPointer = this.registerDataOutput("meshUnderPointer", RichTypeAny);
  }
  _executeEvent(context, payload) {
    var _a;
    const mesh = this.targetMesh.getValue(context);
    this.meshUnderPointer.setValue(payload.mesh, context);
    const skipEvent = payload.out && _isADescendantOf(payload.out, mesh);
    this.pointerId.setValue(payload.pointerId, context);
    if (!skipEvent && (payload.mesh === mesh || _isADescendantOf(payload.mesh, mesh))) {
      this._execute(context);
      return !((_a = this.config) == null ? void 0 : _a.stopPropagation);
    }
    return true;
  }
  _preparePendingTasks(_context) {
  }
  _cancelPendingTasks(_context) {
  }
  getClassName() {
    return "FlowGraphPointerOverEventBlock";
  }
}
RegisterClass("FlowGraphPointerOverEventBlock", FlowGraphPointerOverEventBlock);
export {
  FlowGraphPointerOverEventBlock
};
