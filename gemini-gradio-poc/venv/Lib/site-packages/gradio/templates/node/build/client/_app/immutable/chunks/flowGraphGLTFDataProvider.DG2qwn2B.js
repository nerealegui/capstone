import { F as FlowGraphBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
class FlowGraphGLTFDataProvider extends FlowGraphBlock {
  constructor(config) {
    var _a, _b;
    super();
    const glTF = config.glTF;
    const animationGroups = ((_a = glTF.animations) == null ? void 0 : _a.map((a) => a._babylonAnimationGroup)) || [];
    this.animationGroups = this.registerDataOutput("animationGroups", RichTypeAny, animationGroups);
    const nodes = ((_b = glTF.nodes) == null ? void 0 : _b.map((n) => n._babylonTransformNode)) || [];
    this.nodes = this.registerDataOutput("nodes", RichTypeAny, nodes);
  }
  getClassName() {
    return "FlowGraphGLTFDataProvider";
  }
}
export {
  FlowGraphGLTFDataProvider
};
