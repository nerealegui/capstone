import { an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { a as addNewInteractivityFlowGraphMapping } from "./declarationMapper.uCBvEQca.js";
import { A as AddObjectAccessorToKey } from "./objectModelMapping.r8gj80Ia.js";
const NAME = "KHR_node_hoverability";
const meshPointerOverPrefix = "targetMeshPointerOver_";
addNewInteractivityFlowGraphMapping("event/onHoverIn", NAME, {
  // using GetVariable as the nodeIndex is a configuration and not a value (i.e. it's not mutable)
  blocks: ["FlowGraphPointerOverEventBlock", "FlowGraphGetVariableBlock", "FlowGraphIndexOfBlock", "KHR_interactivity/FlowGraphGLTFDataProvider"],
  configuration: {
    stopPropagation: { name: "stopPropagation" },
    nodeIndex: {
      name: "variable",
      toBlock: "FlowGraphGetVariableBlock",
      dataTransformer(data) {
        return [meshPointerOverPrefix + data[0]];
      }
    }
  },
  outputs: {
    values: {
      hoverNodeIndex: {
        name: "index",
        toBlock: "FlowGraphIndexOfBlock"
        /* FlowGraphBlockNames.IndexOf */
      },
      controllerIndex: { name: "pointerId" }
    },
    flows: {
      out: { name: "done" }
    }
  },
  interBlockConnectors: [
    {
      input: "targetMesh",
      output: "value",
      inputBlockIndex: 0,
      outputBlockIndex: 1,
      isVariable: true
    },
    {
      input: "array",
      output: "nodes",
      inputBlockIndex: 2,
      outputBlockIndex: 3,
      isVariable: true
    },
    {
      input: "object",
      output: "meshUnderPointer",
      inputBlockIndex: 2,
      outputBlockIndex: 0,
      isVariable: true
    }
  ],
  extraProcessor(gltfBlock, _declaration, _mapping, _arrays, serializedObjects, context, globalGLTF) {
    var _a, _b, _c, _d, _e, _f;
    const serializedObject = serializedObjects[serializedObjects.length - 1];
    serializedObject.config = serializedObject.config || {};
    serializedObject.config.glTF = globalGLTF;
    const nodeIndex = (_b = (_a = gltfBlock.configuration) == null ? void 0 : _a["nodeIndex"]) == null ? void 0 : _b.value[0];
    if (nodeIndex === void 0 || typeof nodeIndex !== "number") {
      throw new Error("nodeIndex not found in configuration");
    }
    const variableName = meshPointerOverPrefix + nodeIndex;
    serializedObjects[1].config.variable = variableName;
    context._userVariables[variableName] = {
      className: "Mesh",
      id: (_d = (_c = globalGLTF == null ? void 0 : globalGLTF.nodes) == null ? void 0 : _c[nodeIndex]._babylonTransformNode) == null ? void 0 : _d.id,
      uniqueId: (_f = (_e = globalGLTF == null ? void 0 : globalGLTF.nodes) == null ? void 0 : _e[nodeIndex]._babylonTransformNode) == null ? void 0 : _f.uniqueId
    };
    return serializedObjects;
  }
});
const meshPointerOutPrefix = "targetMeshPointerOut_";
addNewInteractivityFlowGraphMapping("event/onHoverOut", NAME, {
  // using GetVariable as the nodeIndex is a configuration and not a value (i.e. it's not mutable)
  blocks: ["FlowGraphPointerOutEventBlock", "FlowGraphGetVariableBlock", "FlowGraphIndexOfBlock", "KHR_interactivity/FlowGraphGLTFDataProvider"],
  configuration: {
    stopPropagation: { name: "stopPropagation" },
    nodeIndex: {
      name: "variable",
      toBlock: "FlowGraphGetVariableBlock",
      dataTransformer(data) {
        return [meshPointerOutPrefix + data[0]];
      }
    }
  },
  outputs: {
    values: {
      hoverNodeIndex: {
        name: "index",
        toBlock: "FlowGraphIndexOfBlock"
        /* FlowGraphBlockNames.IndexOf */
      },
      controllerIndex: { name: "pointerId" }
    },
    flows: {
      out: { name: "done" }
    }
  },
  interBlockConnectors: [
    {
      input: "targetMesh",
      output: "value",
      inputBlockIndex: 0,
      outputBlockIndex: 1,
      isVariable: true
    },
    {
      input: "array",
      output: "nodes",
      inputBlockIndex: 2,
      outputBlockIndex: 3,
      isVariable: true
    },
    {
      input: "object",
      output: "meshOutOfPointer",
      inputBlockIndex: 2,
      outputBlockIndex: 0,
      isVariable: true
    }
  ],
  extraProcessor(gltfBlock, _declaration, _mapping, _arrays, serializedObjects, context, globalGLTF) {
    var _a, _b, _c, _d, _e, _f;
    const serializedObject = serializedObjects[serializedObjects.length - 1];
    serializedObject.config = serializedObject.config || {};
    serializedObject.config.glTF = globalGLTF;
    const nodeIndex = (_b = (_a = gltfBlock.configuration) == null ? void 0 : _a["nodeIndex"]) == null ? void 0 : _b.value[0];
    if (nodeIndex === void 0 || typeof nodeIndex !== "number") {
      throw new Error("nodeIndex not found in configuration");
    }
    const variableName = meshPointerOutPrefix + nodeIndex;
    serializedObjects[1].config.variable = variableName;
    context._userVariables[variableName] = {
      className: "Mesh",
      id: (_d = (_c = globalGLTF == null ? void 0 : globalGLTF.nodes) == null ? void 0 : _c[nodeIndex]._babylonTransformNode) == null ? void 0 : _d.id,
      uniqueId: (_f = (_e = globalGLTF == null ? void 0 : globalGLTF.nodes) == null ? void 0 : _e[nodeIndex]._babylonTransformNode) == null ? void 0 : _f.uniqueId
    };
    return serializedObjects;
  }
});
AddObjectAccessorToKey("/nodes/{}/extensions/KHR_node_hoverability/hoverable", {
  get: (node) => {
    const tn = node._babylonTransformNode;
    if (tn && tn.pointerOverDisableMeshTesting !== void 0) {
      return tn.pointerOverDisableMeshTesting;
    }
    return true;
  },
  set: (value, node) => {
    var _a;
    (_a = node._primitiveBabylonMeshes) == null ? void 0 : _a.forEach((mesh) => {
      mesh.pointerOverDisableMeshTesting = !value;
    });
  },
  getTarget: (node) => node._babylonTransformNode,
  getPropertyName: [() => "pointerOverDisableMeshTesting"],
  type: "boolean"
});
class KHR_node_hoverability {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this._loader = loader;
    this.enabled = loader.isExtensionUsed(NAME);
  }
  async onReady() {
    var _a;
    (_a = this._loader.gltf.nodes) == null ? void 0 : _a.forEach((node) => {
      var _a2, _b, _c;
      if (((_a2 = node.extensions) == null ? void 0 : _a2.KHR_node_hoverability) && ((_b = node.extensions) == null ? void 0 : _b.KHR_node_hoverability.hoverable) === false) {
        (_c = node._babylonTransformNode) == null ? void 0 : _c.getChildMeshes().forEach((mesh) => {
          mesh.pointerOverDisableMeshTesting = true;
        });
      }
    });
  }
  dispose() {
    this._loader = null;
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_node_hoverability(loader));
export {
  KHR_node_hoverability
};
