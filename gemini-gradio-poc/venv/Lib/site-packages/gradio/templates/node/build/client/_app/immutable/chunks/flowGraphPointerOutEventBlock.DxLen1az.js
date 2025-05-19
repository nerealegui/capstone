import { c as FlowGraphEventBlock, _ as _isADescendantOf } from "./KHR_interactivity.BEJuWS3u.js";
import { b as RichTypeNumber, R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphPointerOutEventBlock extends FlowGraphEventBlock {
  constructor(config) {
    super(config);
    this.type = "PointerOut";
    this.pointerId = this.registerDataOutput("pointerId", RichTypeNumber);
    this.targetMesh = this.registerDataInput("targetMesh", RichTypeAny, config == null ? void 0 : config.targetMesh);
    this.meshOutOfPointer = this.registerDataOutput("meshOutOfPointer", RichTypeAny);
  }
  _executeEvent(context, payload) {
    var _a;
    const mesh = this.targetMesh.getValue(context);
    this.meshOutOfPointer.setValue(payload.mesh, context);
    this.pointerId.setValue(payload.pointerId, context);
    const skipEvent = payload.over && _isADescendantOf(payload.mesh, mesh);
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
    return "FlowGraphPointerOutEventBlock";
  }
}
RegisterClass("FlowGraphPointerOutEventBlock", FlowGraphPointerOutEventBlock);
export {
  FlowGraphPointerOutEventBlock
};
