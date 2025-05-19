const __vite__fileDeps=["./flowGraphPlayAnimationBlock.D3wZXiN9.js","./declarationMapper.uCBvEQca.js","./index.B4f7kVg_.js","./preload-helper.DpQnamwV.js","./animationGroup.DVZgpxRT.js","./bone.BcduFHgb.js","./flowGraphStopAnimationBlock.CiimHs2Q.js","./flowGraphPauseAnimationBlock.AYBBwn9q.js","./flowGraphInterpolationBlock.DV8Vr40P.js","./flowGraphSceneReadyEventBlock.DoDiJ-2w.js","./flowGraphSceneTickEventBlock.BgwcrT2E.js","./flowGraphSendCustomEventBlock.CR3PtYKy.js","./flowGraphReceiveCustomEventBlock.UFE7DFaT.js","./flowGraphMeshPickEventBlock.Cag1CMVe.js","./flowGraphMathBlocks.FA_CEmev.js","./flowGraphBinaryOperationBlock.BnuDU0w6.js","./flowGraphCachedOperationBlock.BYccI7XF.js","./flowGraphUnaryOperationBlock.JXfHGDC4.js","./flowGraphTernaryOperationBlock.BkdkPXG8.js","./flowGraphVectorMathBlocks.DRsbk2T3.js","./flowGraphMatrixMathBlocks.C1eB5hQv.js","./flowGraphBranchBlock.BbGDqXg1.js","./flowGraphSetDelayBlock.DQNNDJEz.js","./flowGraphCancelDelayBlock.DKVZz2Re.js","./flowGraphCounterBlock.C0GZb3fO.js","./flowGraphDebounceBlock.ByR_Nwil.js","./flowGraphThrottleBlock.BywcgzGD.js","./flowGraphDoNBlock.40Ok59ul.js","./flowGraphFlipFlopBlock.9RbAMtmg.js","./flowGraphForLoopBlock.BfvuNBPn.js","./flowGraphMultiGateBlock.OD_w9mp1.js","./flowGraphSequenceBlock.C8XMM_dx.js","./flowGraphSwitchBlock.BaqcNV0P.js","./flowGraphWaitAllBlock.pbnyLVLV.js","./flowGraphWhileLoopBlock.imI51HtA.js","./flowGraphConsoleLogBlock.lXeZwAaJ.js","./flowGraphConditionalDataBlock.BlD_U9vy.js","./flowGraphConstantBlock.cmIXucVq.js","./flowGraphTransformCoordinatesSystemBlock.CJLhjDoJ.js","./flowGraphGetAssetBlock.px9oiLKg.js","./flowGraphGetPropertyBlock.DBGcKOTD.js","./flowGraphSetPropertyBlock.zhx_mgG3.js","./flowGraphGetVariableBlock.Dde2bJ8o.js","./flowGraphSetVariableBlock.FYvMTizC.js","./flowGraphJsonPointerParserBlock.B8hasj3y.js","./flowGraphMathCombineExtractBlocks.CVSL6-uA.js","./flowGraphTypeToTypeBlocks.BiA7H43P.js","./flowGraphEasingBlock.BOrmL4cq.js","./flowGraphBezierCurveEasingBlock.B89QWAxy.js","./flowGraphPointerOverEventBlock.BS9kUrxN.js","./flowGraphPointerOutEventBlock.DxLen1az.js","./flowGraphContextBlock.5hEHV2uP.js","./flowGraphArrayIndexBlock.C1xhKLwm.js","./flowGraphCodeExecutionBlock.Ot2zrGV6.js","./flowGraphIndexOfBlock.DrvZSolb.js","./flowGraphFunctionReferenceBlock.DFh2VVvi.js","./flowGraphDataSwitchBlock.Cje8nY5_.js","./flowGraphGLTFDataProvider.DG2qwn2B.js"],__vite__mapDeps=i=>i.map(i=>__vite__fileDeps[i]);
import { _ as __vitePreload } from "./preload-helper.DpQnamwV.js";
import { M as Matrix, ay as Vector2, V as Vector3, az as Vector4, Q as Quaternion, C as Color3, aS as Color4, h as Logger, _ as __decorate, s as serialize, e as RandomGUID, O as Observable, R as RegisterClass, ax as PointerEventTypes, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { n as FlowGraphMatrix2D, p as FlowGraphMatrix3D, F as FlowGraphInteger, g as getRichTypeByFlowGraphType, r as getMappingForDeclaration, s as getMappingForFullOperationName } from "./declarationMapper.uCBvEQca.js";
import { G as GetPathToObjectConverter, A as AddObjectAccessorToKey } from "./objectModelMapping.r8gj80Ia.js";
function isMeshClassName(className) {
  return className === "Mesh" || className === "AbstractMesh" || className === "GroundMesh" || className === "InstanceMesh" || className === "LinesMesh" || className === "GoldbergMesh" || className === "GreasedLineMesh" || className === "TrailMesh";
}
function isVectorClassName(className) {
  return className === "Vector2" || className === "Vector3" || className === "Vector4" || className === "Quaternion" || className === "Color3" || className === "Color4";
}
function isMatrixClassName(className) {
  return className === "Matrix" || className === "Matrix2D" || className === "Matrix3D";
}
function isAnimationGroupClassName(className) {
  return className === "AnimationGroup";
}
function parseVector(className, value, flipHandedness = false) {
  if (className === "Vector2") {
    return Vector2.FromArray(value);
  } else if (className === "Vector3") {
    if (flipHandedness) {
      value[2] *= -1;
    }
    return Vector3.FromArray(value);
  } else if (className === "Vector4") {
    return Vector4.FromArray(value);
  } else if (className === "Quaternion") {
    if (flipHandedness) {
      value[2] *= -1;
      value[3] *= -1;
    }
    return Quaternion.FromArray(value);
  } else if (className === "Color3") {
    return new Color3(value[0], value[1], value[2]);
  } else if (className === "Color4") {
    return new Color4(value[0], value[1], value[2], value[3]);
  } else {
    throw new Error(`Unknown vector class name ${className}`);
  }
}
function defaultValueSerializationFunction(key, value, serializationObject) {
  var _a;
  const className = ((_a = value == null ? void 0 : value.getClassName) == null ? void 0 : _a.call(value)) ?? "";
  if (isVectorClassName(className) || isMatrixClassName(className)) {
    serializationObject[key] = {
      value: value.asArray(),
      className
    };
  } else if (className === "FlowGraphInteger") {
    serializationObject[key] = {
      value: value.value,
      className
    };
  } else {
    if (className && (value.id || value.name)) {
      serializationObject[key] = {
        id: value.id,
        name: value.name,
        className
      };
    } else {
      if (typeof value !== "object") {
        serializationObject[key] = value;
      } else {
        throw new Error(`Could not serialize value ${value}`);
      }
    }
  }
}
function defaultValueParseFunction(key, serializationObject, assetsContainer, scene) {
  const intermediateValue = serializationObject[key];
  let finalValue;
  const className = (intermediateValue == null ? void 0 : intermediateValue.type) ?? (intermediateValue == null ? void 0 : intermediateValue.className);
  if (isMeshClassName(className)) {
    let nodes = scene.meshes.filter((m) => intermediateValue.id ? m.id === intermediateValue.id : m.name === intermediateValue.name);
    if (nodes.length === 0) {
      nodes = scene.transformNodes.filter((m) => intermediateValue.id ? m.id === intermediateValue.id : m.name === intermediateValue.name);
    }
    finalValue = intermediateValue.uniqueId ? nodes.find((m) => m.uniqueId === intermediateValue.uniqueId) : nodes[0];
  } else if (isVectorClassName(className)) {
    finalValue = parseVector(className, intermediateValue.value);
  } else if (isAnimationGroupClassName(className)) {
    const ags = scene.animationGroups.filter((ag) => ag.name === intermediateValue.name);
    finalValue = ags.length === 1 ? ags[0] : ags.find((ag) => ag.uniqueId === intermediateValue.uniqueId);
  } else if (className === "Matrix") {
    finalValue = Matrix.FromArray(intermediateValue.value);
  } else if (className === "Matrix2D") {
    finalValue = new FlowGraphMatrix2D(intermediateValue.value);
  } else if (className === "Matrix3D") {
    finalValue = new FlowGraphMatrix3D(intermediateValue.value);
  } else if (className === "FlowGraphInteger") {
    finalValue = FlowGraphInteger.FromValue(intermediateValue.value);
  } else if (className === "number" || className === "string" || className === "boolean") {
    finalValue = intermediateValue.value[0];
  } else if (intermediateValue && intermediateValue.value !== void 0) {
    finalValue = intermediateValue.value;
  } else {
    if (Array.isArray(intermediateValue)) {
      finalValue = intermediateValue.reduce((acc, val) => {
        if (!val.eventData) {
          return acc;
        }
        acc[val.id] = {
          type: getRichTypeByFlowGraphType(val.type)
        };
        if (typeof val.value !== "undefined") {
          acc[val.id].value = defaultValueParseFunction("value", val, assetsContainer, scene);
        }
        return acc;
      }, {});
    } else {
      finalValue = intermediateValue;
    }
  }
  return finalValue;
}
function needsPathConverter(className) {
  return className === "FlowGraphJsonPointerParserBlock";
}
var FlowGraphAssetType;
(function(FlowGraphAssetType2) {
  FlowGraphAssetType2["Animation"] = "Animation";
  FlowGraphAssetType2["AnimationGroup"] = "AnimationGroup";
  FlowGraphAssetType2["Mesh"] = "Mesh";
  FlowGraphAssetType2["Material"] = "Material";
  FlowGraphAssetType2["Camera"] = "Camera";
  FlowGraphAssetType2["Light"] = "Light";
})(FlowGraphAssetType || (FlowGraphAssetType = {}));
function GetFlowGraphAssetWithType(assetsContext, type, index, useIndexAsUniqueId) {
  switch (type) {
    case "Animation":
      return useIndexAsUniqueId ? assetsContext.animations.find((a) => a.uniqueId === index) ?? null : assetsContext.animations[index] ?? null;
    case "AnimationGroup":
      return useIndexAsUniqueId ? assetsContext.animationGroups.find((a) => a.uniqueId === index) ?? null : assetsContext.animationGroups[index] ?? null;
    case "Mesh":
      return useIndexAsUniqueId ? assetsContext.meshes.find((a) => a.uniqueId === index) ?? null : assetsContext.meshes[index] ?? null;
    case "Material":
      return useIndexAsUniqueId ? assetsContext.materials.find((a) => a.uniqueId === index) ?? null : assetsContext.materials[index] ?? null;
    case "Camera":
      return useIndexAsUniqueId ? assetsContext.cameras.find((a) => a.uniqueId === index) ?? null : assetsContext.cameras[index] ?? null;
    case "Light":
      return useIndexAsUniqueId ? assetsContext.lights.find((a) => a.uniqueId === index) ?? null : assetsContext.lights[index] ?? null;
    default:
      return null;
  }
}
var FlowGraphAction;
(function(FlowGraphAction2) {
  FlowGraphAction2["ExecuteBlock"] = "ExecuteBlock";
  FlowGraphAction2["ExecuteEvent"] = "ExecuteEvent";
  FlowGraphAction2["TriggerConnection"] = "TriggerConnection";
  FlowGraphAction2["ContextVariableSet"] = "ContextVariableSet";
  FlowGraphAction2["GlobalVariableSet"] = "GlobalVariableSet";
  FlowGraphAction2["GlobalVariableDelete"] = "GlobalVariableDelete";
  FlowGraphAction2["GlobalVariableGet"] = "GlobalVariableGet";
  FlowGraphAction2["AddConnection"] = "AddConnection";
  FlowGraphAction2["GetConnectionValue"] = "GetConnectionValue";
  FlowGraphAction2["SetConnectionValue"] = "SetConnectionValue";
  FlowGraphAction2["ActivateSignal"] = "ActivateSignal";
  FlowGraphAction2["ContextVariableGet"] = "ContextVariableGet";
})(FlowGraphAction || (FlowGraphAction = {}));
class FlowGraphLogger {
  constructor() {
    this.logToConsole = false;
    this.log = [];
  }
  addLogItem(item) {
    var _a;
    if (!item.time) {
      item.time = Date.now();
    }
    this.log.push(item);
    if (this.logToConsole) {
      const value = (_a = item.payload) == null ? void 0 : _a.value;
      if (typeof value === "object" && value.getClassName) {
        Logger.Log(`[FGLog] ${item.className}:${item.uniqueId.split("-")[0]} ${item.action} - ${JSON.stringify(value.getClassName())}: ${value.toString()}`);
      } else {
        Logger.Log(`[FGLog] ${item.className}:${item.uniqueId.split("-")[0]} ${item.action} - ${JSON.stringify(item.payload)}`);
      }
    }
  }
  getItemsOfType(action) {
    return this.log.filter((i) => i.action === action);
  }
}
class FlowGraphContext {
  /**
   * Enable logging on this context
   */
  get enableLogging() {
    return this._enableLogging;
  }
  set enableLogging(value) {
    if (this._enableLogging === value) {
      return;
    }
    this._enableLogging = value;
    if (this._enableLogging) {
      this.logger = new FlowGraphLogger();
      this.logger.logToConsole = true;
    } else {
      this.logger = null;
    }
  }
  constructor(params) {
    this.uniqueId = RandomGUID();
    this._userVariables = {};
    this._executionVariables = {};
    this._globalContextVariables = {};
    this._connectionValues = {};
    this._pendingBlocks = [];
    this._executionId = 0;
    this.onNodeExecutedObservable = new Observable();
    this.treatDataAsRightHanded = false;
    this._enableLogging = false;
    this._configuration = params;
    this.assetsContext = params.assetsContext ?? params.scene;
  }
  /**
   * Check if a user-defined variable is defined.
   * @param name the name of the variable
   * @returns true if the variable is defined
   */
  hasVariable(name) {
    return name in this._userVariables;
  }
  /**
   * Set a user-defined variable.
   * @param name the name of the variable
   * @param value the value of the variable
   */
  setVariable(name, value) {
    var _a;
    this._userVariables[name] = value;
    (_a = this.logger) == null ? void 0 : _a.addLogItem({
      time: Date.now(),
      className: this.getClassName(),
      uniqueId: this.uniqueId,
      action: "ContextVariableSet",
      payload: {
        name,
        value
      }
    });
  }
  /**
   * Get an assets from the assets context based on its type and index in the array
   * @param type The type of the asset
   * @param index The index of the asset
   * @returns The asset or null if not found
   */
  getAsset(type, index) {
    return GetFlowGraphAssetWithType(this.assetsContext, type, index);
  }
  /**
   * Get a user-defined variable.
   * @param name the name of the variable
   * @returns the value of the variable
   */
  getVariable(name) {
    var _a;
    (_a = this.logger) == null ? void 0 : _a.addLogItem({
      time: Date.now(),
      className: this.getClassName(),
      uniqueId: this.uniqueId,
      action: "ContextVariableGet",
      payload: {
        name,
        value: this._userVariables[name]
      }
    });
    return this._userVariables[name];
  }
  /**
   * Gets all user variables map
   */
  get userVariables() {
    return this._userVariables;
  }
  /**
   * Get the scene that the context belongs to.
   * @returns the scene
   */
  getScene() {
    return this._configuration.scene;
  }
  _getUniqueIdPrefixedName(obj, name) {
    return `${obj.uniqueId}_${name}`;
  }
  /**
   * @internal
   * @param name name of the variable
   * @param defaultValue default value to return if the variable is not defined
   * @returns the variable value or the default value if the variable is not defined
   */
  _getGlobalContextVariable(name, defaultValue) {
    var _a;
    (_a = this.logger) == null ? void 0 : _a.addLogItem({
      time: Date.now(),
      className: this.getClassName(),
      uniqueId: this.uniqueId,
      action: "GlobalVariableGet",
      payload: {
        name,
        defaultValue,
        possibleValue: this._globalContextVariables[name]
      }
    });
    if (this._hasGlobalContextVariable(name)) {
      return this._globalContextVariables[name];
    } else {
      return defaultValue;
    }
  }
  /**
   * Set a global context variable
   * @internal
   * @param name the name of the variable
   * @param value the value of the variable
   */
  _setGlobalContextVariable(name, value) {
    var _a;
    (_a = this.logger) == null ? void 0 : _a.addLogItem({
      time: Date.now(),
      className: this.getClassName(),
      uniqueId: this.uniqueId,
      action: "GlobalVariableSet",
      payload: { name, value }
    });
    this._globalContextVariables[name] = value;
  }
  /**
   * Delete a global context variable
   * @internal
   * @param name the name of the variable
   */
  _deleteGlobalContextVariable(name) {
    var _a;
    (_a = this.logger) == null ? void 0 : _a.addLogItem({
      time: Date.now(),
      className: this.getClassName(),
      uniqueId: this.uniqueId,
      action: "GlobalVariableDelete",
      payload: { name }
    });
    delete this._globalContextVariables[name];
  }
  /**
   * Check if a global context variable is defined
   * @internal
   * @param name the name of the variable
   * @returns true if the variable is defined
   */
  _hasGlobalContextVariable(name) {
    return name in this._globalContextVariables;
  }
  /**
   * Set an internal execution variable
   * @internal
   * @param name
   * @param value
   */
  _setExecutionVariable(block, name, value) {
    this._executionVariables[this._getUniqueIdPrefixedName(block, name)] = value;
  }
  /**
   * Get an internal execution variable
   * @internal
   * @param name
   * @returns
   */
  _getExecutionVariable(block, name, defaultValue) {
    if (this._hasExecutionVariable(block, name)) {
      return this._executionVariables[this._getUniqueIdPrefixedName(block, name)];
    } else {
      return defaultValue;
    }
  }
  /**
   * Delete an internal execution variable
   * @internal
   * @param block
   * @param name
   */
  _deleteExecutionVariable(block, name) {
    delete this._executionVariables[this._getUniqueIdPrefixedName(block, name)];
  }
  /**
   * Check if an internal execution variable is defined
   * @internal
   * @param block
   * @param name
   * @returns
   */
  _hasExecutionVariable(block, name) {
    return this._getUniqueIdPrefixedName(block, name) in this._executionVariables;
  }
  /**
   * Check if a connection value is defined
   * @internal
   * @param connectionPoint
   * @returns
   */
  _hasConnectionValue(connectionPoint) {
    return connectionPoint.uniqueId in this._connectionValues;
  }
  /**
   * Set a connection value
   * @internal
   * @param connectionPoint
   * @param value
   */
  _setConnectionValue(connectionPoint, value) {
    var _a;
    this._connectionValues[connectionPoint.uniqueId] = value;
    (_a = this.logger) == null ? void 0 : _a.addLogItem({
      time: Date.now(),
      className: this.getClassName(),
      uniqueId: this.uniqueId,
      action: "SetConnectionValue",
      payload: {
        connectionPointId: connectionPoint.uniqueId,
        value
      }
    });
  }
  /**
   * Set a connection value by key
   * @internal
   * @param key the key of the connection value
   * @param value the value of the connection
   */
  _setConnectionValueByKey(key, value) {
    this._connectionValues[key] = value;
  }
  /**
   * Get a connection value
   * @internal
   * @param connectionPoint
   * @returns
   */
  _getConnectionValue(connectionPoint) {
    var _a;
    (_a = this.logger) == null ? void 0 : _a.addLogItem({
      time: Date.now(),
      className: this.getClassName(),
      uniqueId: this.uniqueId,
      action: "GetConnectionValue",
      payload: {
        connectionPointId: connectionPoint.uniqueId,
        value: this._connectionValues[connectionPoint.uniqueId]
      }
    });
    return this._connectionValues[connectionPoint.uniqueId];
  }
  /**
   * Get the configuration
   * @internal
   * @param name
   * @param value
   */
  get configuration() {
    return this._configuration;
  }
  /**
   * Check if there are any pending blocks in this context
   * @returns true if there are pending blocks
   */
  get hasPendingBlocks() {
    return this._pendingBlocks.length > 0;
  }
  /**
   * Add a block to the list of blocks that have pending tasks.
   * @internal
   * @param block
   */
  _addPendingBlock(block) {
    if (this._pendingBlocks.includes(block)) {
      return;
    }
    this._pendingBlocks.push(block);
    this._pendingBlocks.sort((a, b) => a.priority - b.priority);
  }
  /**
   * Remove a block from the list of blocks that have pending tasks.
   * @internal
   * @param block
   */
  _removePendingBlock(block) {
    const index = this._pendingBlocks.indexOf(block);
    if (index !== -1) {
      this._pendingBlocks.splice(index, 1);
    }
  }
  /**
   * Clear all pending blocks.
   * @internal
   */
  _clearPendingBlocks() {
    for (const block of this._pendingBlocks) {
      block._cancelPendingTasks(this);
    }
    this._pendingBlocks.length = 0;
  }
  /**
   * @internal
   * Function that notifies the node executed observable
   * @param node
   */
  _notifyExecuteNode(node) {
    var _a;
    this.onNodeExecutedObservable.notifyObservers(node);
    (_a = this.logger) == null ? void 0 : _a.addLogItem({
      time: Date.now(),
      className: node.getClassName(),
      uniqueId: node.uniqueId,
      action: "ExecuteBlock"
    });
  }
  _notifyOnTick(framePayload) {
    var _a;
    this._setGlobalContextVariable("timeSinceStart", framePayload.timeSinceStart);
    this._setGlobalContextVariable("deltaTime", framePayload.deltaTime);
    for (const block of this._pendingBlocks) {
      (_a = block._executeOnTick) == null ? void 0 : _a.call(block, this);
    }
  }
  /**
   * @internal
   */
  _increaseExecutionId() {
    this._executionId++;
  }
  /**
   * A monotonically increasing ID for each execution.
   * Incremented for every block executed.
   */
  get executionId() {
    return this._executionId;
  }
  /**
   * Serializes a context
   * @param serializationObject the object to write the values in
   * @param valueSerializationFunction a function to serialize complex values
   */
  serialize(serializationObject = {}, valueSerializationFunction = defaultValueSerializationFunction) {
    var _a;
    serializationObject.uniqueId = this.uniqueId;
    serializationObject._userVariables = {};
    for (const key in this._userVariables) {
      valueSerializationFunction(key, this._userVariables[key], serializationObject._userVariables);
    }
    serializationObject._connectionValues = {};
    for (const key in this._connectionValues) {
      valueSerializationFunction(key, this._connectionValues[key], serializationObject._connectionValues);
    }
    if (this.assetsContext !== this.getScene()) {
      serializationObject._assetsContext = {
        meshes: this.assetsContext.meshes.map((m) => m.id),
        materials: this.assetsContext.materials.map((m) => m.id),
        textures: this.assetsContext.textures.map((m) => m.name),
        animations: this.assetsContext.animations.map((m) => m.name),
        lights: this.assetsContext.lights.map((m) => m.id),
        cameras: this.assetsContext.cameras.map((m) => m.id),
        sounds: (_a = this.assetsContext.sounds) == null ? void 0 : _a.map((m) => m.name),
        skeletons: this.assetsContext.skeletons.map((m) => m.id),
        particleSystems: this.assetsContext.particleSystems.map((m) => m.name),
        geometries: this.assetsContext.geometries.map((m) => m.id),
        multiMaterials: this.assetsContext.multiMaterials.map((m) => m.id),
        transformNodes: this.assetsContext.transformNodes.map((m) => m.id)
      };
    }
  }
  /**
   * @returns the class name of the object.
   */
  getClassName() {
    return "FlowGraphContext";
  }
}
__decorate([
  serialize()
], FlowGraphContext.prototype, "uniqueId", void 0);
var FlowGraphConnectionType;
(function(FlowGraphConnectionType2) {
  FlowGraphConnectionType2[FlowGraphConnectionType2["Input"] = 0] = "Input";
  FlowGraphConnectionType2[FlowGraphConnectionType2["Output"] = 1] = "Output";
})(FlowGraphConnectionType || (FlowGraphConnectionType = {}));
class FlowGraphConnection {
  constructor(name, _connectionType, _ownerBlock) {
    this._ownerBlock = _ownerBlock;
    this._connectedPoint = [];
    this.uniqueId = RandomGUID();
    this.connectedPointIds = [];
    this.name = name;
    this._connectionType = _connectionType;
  }
  /**
   * The type of the connection
   */
  get connectionType() {
    return this._connectionType;
  }
  /**
   * @internal
   * Override this to indicate if a point can connect to more than one point.
   */
  _isSingularConnection() {
    return true;
  }
  /**
   * Returns if a point is connected to any other point.
   * @returns boolean indicating if the point is connected.
   */
  isConnected() {
    return this._connectedPoint.length > 0;
  }
  /**
   * Connects two connections together.
   * @param point the connection to connect to.
   */
  connectTo(point) {
    if (this._connectionType === point._connectionType) {
      throw new Error(`Cannot connect two points of type ${this.connectionType}`);
    }
    if (this._isSingularConnection() && this._connectedPoint.length > 0 || point._isSingularConnection() && point._connectedPoint.length > 0) {
      throw new Error("Max number of connections for point reached");
    }
    this._connectedPoint.push(point);
    point._connectedPoint.push(this);
  }
  /**
   * Disconnects two connections.
   * @param point the connection to disconnect from.
   * @param removeFromLocal if true, the connection will be removed from the local connection list.
   */
  disconnectFrom(point, removeFromLocal = true) {
    const indexLocal = this._connectedPoint.indexOf(point);
    const indexConnected = point._connectedPoint.indexOf(this);
    if (indexLocal === -1 || indexConnected === -1) {
      return;
    }
    if (removeFromLocal) {
      this._connectedPoint.splice(indexLocal, 1);
    }
    point._connectedPoint.splice(indexConnected, 1);
  }
  /**
   * Disconnects all connected points.
   */
  disconnectFromAll() {
    for (const point of this._connectedPoint) {
      this.disconnectFrom(point, false);
    }
    this._connectedPoint.length = 0;
  }
  dispose() {
    for (const point of this._connectedPoint) {
      this.disconnectFrom(point);
    }
  }
  /**
   * Saves the connection to a JSON object.
   * @param serializationObject the object to serialize to.
   */
  serialize(serializationObject = {}) {
    serializationObject.uniqueId = this.uniqueId;
    serializationObject.name = this.name;
    serializationObject._connectionType = this._connectionType;
    serializationObject.connectedPointIds = [];
    serializationObject.className = this.getClassName();
    for (const point of this._connectedPoint) {
      serializationObject.connectedPointIds.push(point.uniqueId);
    }
  }
  /**
   * @returns class name of the connection.
   */
  getClassName() {
    return "FGConnection";
  }
  /**
   * Deserialize from a object into this
   * @param serializationObject the object to deserialize from.
   */
  deserialize(serializationObject) {
    this.uniqueId = serializationObject.uniqueId;
    this.name = serializationObject.name;
    this._connectionType = serializationObject._connectionType;
    this.connectedPointIds = serializationObject.connectedPointIds;
  }
}
class FlowGraphDataConnection extends FlowGraphConnection {
  /**
   * Create a new data connection point.
   * @param name the name of the connection
   * @param connectionType the type of the connection
   * @param ownerBlock the block that owns this connection
   * @param richType the type of the data in this block
   * @param _defaultValue the default value of the connection
   * @param _optional if the connection is optional
   */
  constructor(name, connectionType, ownerBlock, richType, _defaultValue = richType.defaultValue, _optional = false) {
    super(name, connectionType, ownerBlock);
    this.richType = richType;
    this._defaultValue = _defaultValue;
    this._optional = _optional;
    this._isDisabled = false;
    this._lastValue = null;
    this.dataTransformer = null;
    this.onValueChangedObservable = new Observable();
  }
  /**
   * Whether or not the connection is optional.
   * Currently only used for UI control.
   */
  get optional() {
    return this._optional;
  }
  /**
   * is this connection disabled
   * If the connection is disabled you will not be able to connect anything to it.
   */
  get isDisabled() {
    return this._isDisabled;
  }
  set isDisabled(value) {
    if (this._isDisabled === value) {
      return;
    }
    this._isDisabled = value;
    if (this._isDisabled) {
      this.disconnectFromAll();
    }
  }
  /**
   * An output data block can connect to multiple input data blocks,
   * but an input data block can only connect to one output data block.
   * @returns true if the connection is singular
   */
  _isSingularConnection() {
    return this.connectionType === 0;
  }
  /**
   * Set the value of the connection in a specific context.
   * @param value the value to set
   * @param context the context to which the value is set
   */
  setValue(value, context) {
    if (context._getConnectionValue(this) === value) {
      return;
    }
    context._setConnectionValue(this, value);
    this.onValueChangedObservable.notifyObservers(value);
  }
  /**
   * Reset the value of the connection to the default value.
   * @param context the context in which the value is reset
   */
  resetToDefaultValue(context) {
    context._setConnectionValue(this, this._defaultValue);
  }
  /**
   * Connect this point to another point.
   * @param point the point to connect to.
   */
  connectTo(point) {
    if (this._isDisabled) {
      return;
    }
    super.connectTo(point);
  }
  _getValueOrDefault(context) {
    const val = context._getConnectionValue(this) ?? this._defaultValue;
    return this.dataTransformer ? this.dataTransformer(val) : val;
  }
  /**
   * Gets the value of the connection in a specific context.
   * @param context the context from which the value is retrieved
   * @returns the value of the connection
   */
  getValue(context) {
    if (this.connectionType === 1) {
      context._notifyExecuteNode(this._ownerBlock);
      this._ownerBlock._updateOutputs(context);
      const value2 = this._getValueOrDefault(context);
      this._lastValue = value2;
      return this.richType.typeTransformer ? this.richType.typeTransformer(value2) : value2;
    }
    const value = !this.isConnected() ? this._getValueOrDefault(context) : this._connectedPoint[0].getValue(context);
    this._lastValue = value;
    return this.richType.typeTransformer ? this.richType.typeTransformer(value) : value;
  }
  /**
   * @internal
   */
  _getLastValue() {
    return this._lastValue;
  }
  /**
   * @returns class name of the object.
   */
  getClassName() {
    return "FlowGraphDataConnection";
  }
  /**
   * Serializes this object.
   * @param serializationObject the object to serialize to
   */
  serialize(serializationObject = {}) {
    super.serialize(serializationObject);
    serializationObject.richType = {};
    this.richType.serialize(serializationObject.richType);
    serializationObject.optional = this._optional;
    defaultValueSerializationFunction("defaultValue", this._defaultValue, serializationObject);
  }
}
RegisterClass("FlowGraphDataConnection", FlowGraphDataConnection);
class FlowGraphBlock {
  /** Constructor is protected so only subclasses can be instantiated
   * @param config optional configuration for this block
   * @internal - do not use directly. Extend this class instead.
   */
  constructor(config) {
    var _a;
    this.config = config;
    this.uniqueId = RandomGUID();
    this.name = ((_a = this.config) == null ? void 0 : _a.name) ?? this.getClassName();
    this.dataInputs = [];
    this.dataOutputs = [];
  }
  /**
   * @internal
   * This function is called when the block needs to update its output flows.
   * @param _context the context in which it is running
   */
  _updateOutputs(_context) {
  }
  /**
   * Registers a data input on the block.
   * @param name the name of the input
   * @param richType the type of the input
   * @param defaultValue optional default value of the input. If not set, the rich type's default value will be used.
   * @returns the created connection
   */
  registerDataInput(name, richType, defaultValue) {
    const input = new FlowGraphDataConnection(name, 0, this, richType, defaultValue);
    this.dataInputs.push(input);
    return input;
  }
  /**
   * Registers a data output on the block.
   * @param name the name of the input
   * @param richType the type of the input
   * @param defaultValue optional default value of the input. If not set, the rich type's default value will be used.
   * @returns the created connection
   */
  registerDataOutput(name, richType, defaultValue) {
    const output = new FlowGraphDataConnection(name, 1, this, richType, defaultValue);
    this.dataOutputs.push(output);
    return output;
  }
  /**
   * Given the name of a data input, returns the connection if it exists
   * @param name the name of the input
   * @returns the connection if it exists, undefined otherwise
   */
  getDataInput(name) {
    return this.dataInputs.find((i) => i.name === name);
  }
  /**
   * Given the name of a data output, returns the connection if it exists
   * @param name the name of the output
   * @returns the connection if it exists, undefined otherwise
   */
  getDataOutput(name) {
    return this.dataOutputs.find((i) => i.name === name);
  }
  /**
   * Serializes this block
   * @param serializationObject the object to serialize to
   * @param _valueSerializeFunction a function that serializes a specific value
   */
  serialize(serializationObject = {}, _valueSerializeFunction = defaultValueSerializationFunction) {
    serializationObject.uniqueId = this.uniqueId;
    serializationObject.config = {};
    if (this.config) {
      const config = this.config;
      Object.keys(this.config).forEach((key) => {
        _valueSerializeFunction(key, config[key], serializationObject.config);
      });
    }
    serializationObject.dataInputs = [];
    serializationObject.dataOutputs = [];
    serializationObject.className = this.getClassName();
    for (const input of this.dataInputs) {
      const serializedInput = {};
      input.serialize(serializedInput);
      serializationObject.dataInputs.push(serializedInput);
    }
    for (const output of this.dataOutputs) {
      const serializedOutput = {};
      output.serialize(serializedOutput);
      serializationObject.dataOutputs.push(serializedOutput);
    }
  }
  /**
   * Deserializes this block
   * @param _serializationObject the object to deserialize from
   */
  deserialize(_serializationObject) {
  }
  _log(context, action, payload) {
    var _a;
    (_a = context.logger) == null ? void 0 : _a.addLogItem({
      action,
      payload,
      className: this.getClassName(),
      uniqueId: this.uniqueId
    });
  }
  /**
   * Gets the class name of this block
   * @returns the class name
   */
  getClassName() {
    return "FlowGraphBlock";
  }
}
class FlowGraphSignalConnection extends FlowGraphConnection {
  constructor() {
    super(...arguments);
    this.priority = 0;
  }
  _isSingularConnection() {
    return false;
  }
  connectTo(point) {
    super.connectTo(point);
    this._connectedPoint.sort((a, b) => b.priority - a.priority);
  }
  /**
   * @internal
   */
  _activateSignal(context) {
    var _a;
    (_a = context.logger) == null ? void 0 : _a.addLogItem({
      action: "ActivateSignal",
      className: this._ownerBlock.getClassName(),
      uniqueId: this._ownerBlock.uniqueId,
      payload: {
        connectionType: this.connectionType,
        name: this.name
      }
    });
    if (this.connectionType === 0) {
      context._notifyExecuteNode(this._ownerBlock);
      this._ownerBlock._execute(context, this);
      context._increaseExecutionId();
    } else {
      for (const connectedPoint of this._connectedPoint) {
        connectedPoint._activateSignal(context);
      }
    }
  }
}
RegisterClass("FlowGraphSignalConnection", FlowGraphSignalConnection);
class FlowGraphExecutionBlock extends FlowGraphBlock {
  constructor(config) {
    super(config);
    this.priority = 0;
    this.signalInputs = [];
    this.signalOutputs = [];
    this.in = this._registerSignalInput("in");
    this.error = this._registerSignalOutput("error");
  }
  _registerSignalInput(name) {
    const input = new FlowGraphSignalConnection(name, 0, this);
    this.signalInputs.push(input);
    return input;
  }
  _registerSignalOutput(name) {
    const output = new FlowGraphSignalConnection(name, 1, this);
    this.signalOutputs.push(output);
    return output;
  }
  _unregisterSignalInput(name) {
    const index = this.signalInputs.findIndex((input) => input.name === name);
    if (index !== -1) {
      this.signalInputs[index].dispose();
      this.signalInputs.splice(index, 1);
    }
  }
  _unregisterSignalOutput(name) {
    const index = this.signalOutputs.findIndex((output) => output.name === name);
    if (index !== -1) {
      this.signalOutputs[index].dispose();
      this.signalOutputs.splice(index, 1);
    }
  }
  _reportError(context, error) {
    this.error.payload = typeof error === "string" ? new Error(error) : error;
    this.error._activateSignal(context);
  }
  /**
   * Given a name of a signal input, return that input if it exists
   * @param name the name of the input
   * @returns if the input exists, the input. Otherwise, undefined.
   */
  getSignalInput(name) {
    return this.signalInputs.find((input) => input.name === name);
  }
  /**
   * Given a name of a signal output, return that input if it exists
   * @param name the name of the input
   * @returns if the input exists, the input. Otherwise, undefined.
   */
  getSignalOutput(name) {
    return this.signalOutputs.find((output) => output.name === name);
  }
  /**
   * Serializes this block
   * @param serializationObject the object to serialize in
   */
  serialize(serializationObject = {}) {
    super.serialize(serializationObject);
    serializationObject.signalInputs = [];
    serializationObject.signalOutputs = [];
    for (const input of this.signalInputs) {
      const serializedInput = {};
      input.serialize(serializedInput);
      serializationObject.signalInputs.push(serializedInput);
    }
    for (const output of this.signalOutputs) {
      const serializedOutput = {};
      output.serialize(serializedOutput);
      serializationObject.signalOutputs.push(serializedOutput);
    }
  }
  /**
   * Deserializes from an object
   * @param serializationObject the object to deserialize from
   */
  deserialize(serializationObject) {
    for (let i = 0; i < serializationObject.signalInputs.length; i++) {
      const signalInput = this.getSignalInput(serializationObject.signalInputs[i].name);
      if (signalInput) {
        signalInput.deserialize(serializationObject.signalInputs[i]);
      } else {
        throw new Error("Could not find signal input with name " + serializationObject.signalInputs[i].name + " in block " + serializationObject.className);
      }
    }
    for (let i = 0; i < serializationObject.signalOutputs.length; i++) {
      const signalOutput = this.getSignalOutput(serializationObject.signalOutputs[i].name);
      if (signalOutput) {
        signalOutput.deserialize(serializationObject.signalOutputs[i]);
      } else {
        throw new Error("Could not find signal output with name " + serializationObject.signalOutputs[i].name + " in block " + serializationObject.className);
      }
    }
  }
  /**
   * @returns the class name
   */
  getClassName() {
    return "FlowGraphExecutionBlock";
  }
}
class FlowGraphSceneEventCoordinator {
  constructor(scene) {
    this.onEventTriggeredObservable = new Observable();
    this.sceneReadyTriggered = false;
    this._pointerUnderMeshState = {};
    this._startingTime = 0;
    this._scene = scene;
    this._initialize();
  }
  _initialize() {
    this._sceneReadyObserver = this._scene.onReadyObservable.add(() => {
      if (!this.sceneReadyTriggered) {
        this.onEventTriggeredObservable.notifyObservers({
          type: "SceneReady"
          /* FlowGraphEventType.SceneReady */
        });
        this.sceneReadyTriggered = true;
      }
    });
    this._sceneDisposeObserver = this._scene.onDisposeObservable.add(() => {
      this.onEventTriggeredObservable.notifyObservers({
        type: "SceneDispose"
        /* FlowGraphEventType.SceneDispose */
      });
    });
    this._sceneOnBeforeRenderObserver = this._scene.onBeforeRenderObservable.add(() => {
      const deltaTime = this._scene.getEngine().getDeltaTime() / 1e3;
      this.onEventTriggeredObservable.notifyObservers({
        type: "SceneBeforeRender",
        payload: {
          timeSinceStart: this._startingTime,
          deltaTime
        }
      });
      this._startingTime += deltaTime;
    });
    this._meshPickedObserver = this._scene.onPointerObservable.add((pointerInfo) => {
      this.onEventTriggeredObservable.notifyObservers({ type: "MeshPick", payload: pointerInfo });
    }, PointerEventTypes.POINTERPICK);
    this._meshUnderPointerObserver = this._scene.onMeshUnderPointerUpdatedObservable.add((data) => {
      const pointerId = data.pointerId;
      const mesh = data.mesh;
      const previousState = this._pointerUnderMeshState[pointerId];
      if (!previousState && mesh) {
        this.onEventTriggeredObservable.notifyObservers({ type: "PointerOver", payload: { pointerId, mesh } });
      } else if (previousState && !mesh) {
        this.onEventTriggeredObservable.notifyObservers({ type: "PointerOut", payload: { pointerId, mesh: previousState } });
      } else if (previousState && mesh && previousState !== mesh) {
        this.onEventTriggeredObservable.notifyObservers({ type: "PointerOut", payload: { pointerId, mesh: previousState, over: mesh } });
        this.onEventTriggeredObservable.notifyObservers({ type: "PointerOver", payload: { pointerId, mesh, out: previousState } });
      }
      this._pointerUnderMeshState[pointerId] = mesh;
    }, PointerEventTypes.POINTERMOVE);
  }
  dispose() {
    var _a, _b, _c, _d, _e;
    (_a = this._sceneDisposeObserver) == null ? void 0 : _a.remove();
    (_b = this._sceneReadyObserver) == null ? void 0 : _b.remove();
    (_c = this._sceneOnBeforeRenderObserver) == null ? void 0 : _c.remove();
    (_d = this._meshPickedObserver) == null ? void 0 : _d.remove();
    (_e = this._meshUnderPointerObserver) == null ? void 0 : _e.remove();
    this.onEventTriggeredObservable.clear();
  }
}
function _isADescendantOf(mesh1, mesh2) {
  return !!(mesh1.parent && (mesh1.parent === mesh2 || _isADescendantOf(mesh1.parent, mesh2)));
}
function _getClassNameOf(v) {
  if (v.getClassName) {
    return v.getClassName();
  }
  return;
}
function _areSameVectorClass(className, className2) {
  return className === className2 && (className === "Vector2" || className === "Vector3" || className === "Vector4");
}
function _areSameMatrixClass(className, className2) {
  return className === className2 && (className === "Matrix" || className === "Matrix2D" || className === "Matrix3D");
}
function _areSameIntegerClass(className, className2) {
  return className === "FlowGraphInteger" && className2 === "FlowGraphInteger";
}
function isNumeric(a, validIfNaN) {
  const isNumeric2 = typeof a === "number" || typeof (a == null ? void 0 : a.value) === "number";
  if (isNumeric2 && !validIfNaN) {
    return !isNaN(getNumericValue(a));
  }
  return isNumeric2;
}
function getNumericValue(a) {
  return typeof a === "number" ? a : a.value;
}
var FlowGraphState;
(function(FlowGraphState2) {
  FlowGraphState2[FlowGraphState2["Stopped"] = 0] = "Stopped";
  FlowGraphState2[FlowGraphState2["Started"] = 1] = "Started";
})(FlowGraphState || (FlowGraphState = {}));
class FlowGraph {
  /**
   * The state of the graph
   */
  get state() {
    return this._state;
  }
  /**
   * The state of the graph
   */
  set state(value) {
    this._state = value;
    this.onStateChangedObservable.notifyObservers(value);
  }
  /**
   * Construct a Flow Graph
   * @param params construction parameters. currently only the scene
   */
  constructor(params) {
    this.onStateChangedObservable = new Observable();
    this._eventBlocks = {
      [
        "SceneReady"
        /* FlowGraphEventType.SceneReady */
      ]: [],
      [
        "SceneDispose"
        /* FlowGraphEventType.SceneDispose */
      ]: [],
      [
        "SceneBeforeRender"
        /* FlowGraphEventType.SceneBeforeRender */
      ]: [],
      [
        "MeshPick"
        /* FlowGraphEventType.MeshPick */
      ]: [],
      [
        "PointerDown"
        /* FlowGraphEventType.PointerDown */
      ]: [],
      [
        "PointerUp"
        /* FlowGraphEventType.PointerUp */
      ]: [],
      [
        "PointerMove"
        /* FlowGraphEventType.PointerMove */
      ]: [],
      [
        "PointerOver"
        /* FlowGraphEventType.PointerOver */
      ]: [],
      [
        "PointerOut"
        /* FlowGraphEventType.PointerOut */
      ]: [],
      [
        "SceneAfterRender"
        /* FlowGraphEventType.SceneAfterRender */
      ]: [],
      [
        "NoTrigger"
        /* FlowGraphEventType.NoTrigger */
      ]: []
    };
    this._executionContexts = [];
    this._state = 0;
    this._scene = params.scene;
    this._sceneEventCoordinator = new FlowGraphSceneEventCoordinator(this._scene);
    this._coordinator = params.coordinator;
    this._eventObserver = this._sceneEventCoordinator.onEventTriggeredObservable.add((event) => {
      for (const context of this._executionContexts) {
        const order = this._getContextualOrder(event.type, context);
        for (const block of order) {
          if (!block._executeEvent(context, event.payload)) {
            break;
          }
        }
      }
      switch (event.type) {
        case "SceneReady":
          this._sceneEventCoordinator.sceneReadyTriggered = true;
          break;
        case "SceneBeforeRender":
          for (const context of this._executionContexts) {
            context._notifyOnTick(event.payload);
          }
          break;
        case "SceneDispose":
          this.dispose();
          break;
      }
    });
  }
  /**
   * Create a context. A context represents one self contained execution for the graph, with its own variables.
   * @returns the context, where you can get and set variables
   */
  createContext() {
    const context = new FlowGraphContext({ scene: this._scene, coordinator: this._coordinator });
    this._executionContexts.push(context);
    return context;
  }
  /**
   * Returns the execution context at a given index
   * @param index the index of the context
   * @returns the execution context at that index
   */
  getContext(index) {
    return this._executionContexts[index];
  }
  /**
   * Add an event block. When the graph is started, it will start listening to events
   * from the block and execute the graph when they are triggered.
   * @param block the event block to be added
   */
  addEventBlock(block) {
    if (block.type === "PointerOver" || block.type === "PointerOut") {
      this._scene.constantlyUpdateMeshUnderPointer = true;
    }
    if (block.type !== "NoTrigger") {
      this._eventBlocks[block.type].push(block);
    }
    if (this.state === 1) {
      for (const context of this._executionContexts) {
        block._startPendingTasks(context);
      }
    } else {
      this.onStateChangedObservable.addOnce((state) => {
        if (state === 1) {
          for (const context of this._executionContexts) {
            block._startPendingTasks(context);
          }
        }
      });
    }
  }
  /**
   * Starts the flow graph. Initializes the event blocks and starts listening to events.
   */
  start() {
    if (this.state === 1) {
      return;
    }
    if (this._executionContexts.length === 0) {
      this.createContext();
    }
    this.onStateChangedObservable.add((state) => {
      if (state === 1) {
        this._startPendingEvents();
        if (this._scene.isReady(true)) {
          this._sceneEventCoordinator.onEventTriggeredObservable.notifyObservers({
            type: "SceneReady"
            /* FlowGraphEventType.SceneReady */
          });
        }
      }
    });
    this.state = 1;
  }
  _startPendingEvents() {
    for (const context of this._executionContexts) {
      for (const type in this._eventBlocks) {
        const order = this._getContextualOrder(type, context);
        for (const block of order) {
          block._startPendingTasks(context);
        }
      }
    }
  }
  _getContextualOrder(type, context) {
    const order = this._eventBlocks[type].sort((a, b) => b.initPriority - a.initPriority);
    if (type === "MeshPick") {
      const meshPickOrder = [];
      for (const block1 of order) {
        const mesh1 = block1.asset.getValue(context);
        let i = 0;
        for (; i < order.length; i++) {
          const block2 = order[i];
          const mesh2 = block2.asset.getValue(context);
          if (mesh1 && mesh2 && _isADescendantOf(mesh1, mesh2)) {
            break;
          }
        }
        meshPickOrder.splice(i, 0, block1);
      }
      return meshPickOrder;
    }
    return order;
  }
  /**
   * Disposes of the flow graph. Cancels any pending tasks and removes all event listeners.
   */
  dispose() {
    var _a;
    if (this.state === 0) {
      return;
    }
    this.state = 0;
    for (const context of this._executionContexts) {
      context._clearPendingBlocks();
    }
    this._executionContexts.length = 0;
    for (const type in this._eventBlocks) {
      this._eventBlocks[type].length = 0;
    }
    (_a = this._eventObserver) == null ? void 0 : _a.remove();
    this._sceneEventCoordinator.dispose();
  }
  /**
   * Executes a function in all blocks of a flow graph, starting with the event blocks.
   * @param visitor the function to execute.
   */
  visitAllBlocks(visitor) {
    const visitList = [];
    const idsAddedToVisitList = /* @__PURE__ */ new Set();
    for (const type in this._eventBlocks) {
      for (const block of this._eventBlocks[type]) {
        visitList.push(block);
        idsAddedToVisitList.add(block.uniqueId);
      }
    }
    while (visitList.length > 0) {
      const block = visitList.pop();
      visitor(block);
      for (const dataIn of block.dataInputs) {
        for (const connection of dataIn._connectedPoint) {
          if (!idsAddedToVisitList.has(connection._ownerBlock.uniqueId)) {
            visitList.push(connection._ownerBlock);
            idsAddedToVisitList.add(connection._ownerBlock.uniqueId);
          }
        }
      }
      if (block instanceof FlowGraphExecutionBlock) {
        for (const signalOut of block.signalOutputs) {
          for (const connection of signalOut._connectedPoint) {
            if (!idsAddedToVisitList.has(connection._ownerBlock.uniqueId)) {
              visitList.push(connection._ownerBlock);
              idsAddedToVisitList.add(connection._ownerBlock.uniqueId);
            }
          }
        }
      }
    }
  }
  /**
   * Serializes a graph
   * @param serializationObject the object to write the values in
   * @param valueSerializeFunction a function to serialize complex values
   */
  serialize(serializationObject = {}, valueSerializeFunction) {
    serializationObject.allBlocks = [];
    this.visitAllBlocks((block) => {
      const serializedBlock = {};
      block.serialize(serializedBlock);
      serializationObject.allBlocks.push(serializedBlock);
    });
    serializationObject.executionContexts = [];
    for (const context of this._executionContexts) {
      const serializedContext = {};
      context.serialize(serializedContext, valueSerializeFunction);
      serializationObject.executionContexts.push(serializedContext);
    }
  }
}
class FlowGraphCoordinator {
  constructor(config) {
    this.config = config;
    this.dispatchEventsSynchronously = true;
    this._flowGraphs = [];
    this._customEventsMap = /* @__PURE__ */ new Map();
    this._eventExecutionCounter = /* @__PURE__ */ new Map();
    this._executeOnNextFrame = [];
    this._eventUniqueId = 0;
    this._disposeObserver = this.config.scene.onDisposeObservable.add(() => {
      this.dispose();
    });
    this._onBeforeRenderObserver = this.config.scene.onBeforeRenderObservable.add(() => {
      this._eventExecutionCounter.clear();
      const executeOnNextFrame = this._executeOnNextFrame.slice(0);
      if (executeOnNextFrame.length) {
        executeOnNextFrame.forEach((event) => {
          this.notifyCustomEvent(event.id, event.data, false);
          const index = this._executeOnNextFrame.findIndex((e) => e.uniqueId === event.uniqueId);
          if (index !== -1) {
            this._executeOnNextFrame.splice(index, 1);
          }
        });
      }
    });
    const coordinators = FlowGraphCoordinator.SceneCoordinators.get(this.config.scene) ?? [];
    coordinators.push(this);
  }
  /**
   * Creates a new flow graph and adds it to the list of existing flow graphs
   * @returns a new flow graph
   */
  createGraph() {
    const graph = new FlowGraph({ scene: this.config.scene, coordinator: this });
    this._flowGraphs.push(graph);
    return graph;
  }
  /**
   * Removes a flow graph from the list of existing flow graphs and disposes it
   * @param graph the graph to remove
   */
  removeGraph(graph) {
    const index = this._flowGraphs.indexOf(graph);
    if (index !== -1) {
      graph.dispose();
      this._flowGraphs.splice(index, 1);
    }
  }
  /**
   * Starts all graphs
   */
  start() {
    this._flowGraphs.forEach((graph) => graph.start());
  }
  /**
   * Disposes all graphs
   */
  dispose() {
    var _a, _b;
    this._flowGraphs.forEach((graph) => graph.dispose());
    this._flowGraphs.length = 0;
    (_a = this._disposeObserver) == null ? void 0 : _a.remove();
    (_b = this._onBeforeRenderObserver) == null ? void 0 : _b.remove();
    const coordinators = FlowGraphCoordinator.SceneCoordinators.get(this.config.scene) ?? [];
    const index = coordinators.indexOf(this);
    if (index !== -1) {
      coordinators.splice(index, 1);
    }
  }
  /**
   * Serializes this coordinator to a JSON object.
   * @param serializationObject the object to serialize to
   * @param valueSerializeFunction the function to use to serialize the value
   */
  serialize(serializationObject, valueSerializeFunction) {
    serializationObject._flowGraphs = [];
    this._flowGraphs.forEach((graph) => {
      const serializedGraph = {};
      graph.serialize(serializedGraph, valueSerializeFunction);
      serializationObject._flowGraphs.push(serializedGraph);
    });
    serializationObject.dispatchEventsSynchronously = this.dispatchEventsSynchronously;
  }
  /**
   * Gets the list of flow graphs
   */
  get flowGraphs() {
    return this._flowGraphs;
  }
  /**
   * Get an observable that will be notified when the event with the given id is fired.
   * @param id the id of the event
   * @returns the observable for the event
   */
  getCustomEventObservable(id) {
    let observable = this._customEventsMap.get(id);
    if (!observable) {
      observable = new Observable(
        /*undefined, true*/
      );
      this._customEventsMap.set(id, observable);
    }
    return observable;
  }
  /**
   * Notifies the observable for the given event id with the given data.
   * @param id the id of the event
   * @param data the data to send with the event
   * @param async if true, the event will be dispatched asynchronously
   */
  notifyCustomEvent(id, data, async = !this.dispatchEventsSynchronously) {
    if (async) {
      this._executeOnNextFrame.push({ id, data, uniqueId: this._eventUniqueId++ });
      return;
    }
    if (this._eventExecutionCounter.has(id)) {
      const count = this._eventExecutionCounter.get(id);
      this._eventExecutionCounter.set(id, count + 1);
      if (count >= FlowGraphCoordinator.MaxEventTypeExecutionPerFrame) {
        count === FlowGraphCoordinator.MaxEventTypeExecutionPerFrame && Logger.Warn(`FlowGraphCoordinator: Too many executions of event "${id}".`);
        return;
      }
    } else {
      this._eventExecutionCounter.set(id, 1);
    }
    const observable = this._customEventsMap.get(id);
    if (observable) {
      observable.notifyObservers(data);
    }
  }
}
FlowGraphCoordinator.MaxEventsPerType = 30;
FlowGraphCoordinator.MaxEventTypeExecutionPerFrame = 30;
FlowGraphCoordinator.SceneCoordinators = /* @__PURE__ */ new Map();
const customBlocks = {};
function addToBlockFactory(module, blockName, factory) {
  customBlocks[`${module}/${blockName}`] = factory;
}
function blockFactory(blockName) {
  switch (blockName) {
    case "FlowGraphPlayAnimationBlock":
      return async () => (await __vitePreload(() => import("./flowGraphPlayAnimationBlock.D3wZXiN9.js"), true ? __vite__mapDeps([0,1,2,3,4,5]) : void 0, import.meta.url)).FlowGraphPlayAnimationBlock;
    case "FlowGraphStopAnimationBlock":
      return async () => (await __vitePreload(() => import("./flowGraphStopAnimationBlock.CiimHs2Q.js"), true ? __vite__mapDeps([6,1,2,3]) : void 0, import.meta.url)).FlowGraphStopAnimationBlock;
    case "FlowGraphPauseAnimationBlock":
      return async () => (await __vitePreload(() => import("./flowGraphPauseAnimationBlock.AYBBwn9q.js"), true ? __vite__mapDeps([7,1,2,3]) : void 0, import.meta.url)).FlowGraphPauseAnimationBlock;
    case "FlowGraphInterpolationBlock":
      return async () => (await __vitePreload(() => import("./flowGraphInterpolationBlock.DV8Vr40P.js"), true ? __vite__mapDeps([8,1,2,3]) : void 0, import.meta.url)).FlowGraphInterpolationBlock;
    case "FlowGraphSceneReadyEventBlock":
      return async () => (await __vitePreload(() => import("./flowGraphSceneReadyEventBlock.DoDiJ-2w.js"), true ? __vite__mapDeps([9,2,3]) : void 0, import.meta.url)).FlowGraphSceneReadyEventBlock;
    case "FlowGraphSceneTickEventBlock":
      return async () => (await __vitePreload(() => import("./flowGraphSceneTickEventBlock.BgwcrT2E.js"), true ? __vite__mapDeps([10,2,3,1]) : void 0, import.meta.url)).FlowGraphSceneTickEventBlock;
    case "FlowGraphSendCustomEventBlock":
      return async () => (await __vitePreload(() => import("./flowGraphSendCustomEventBlock.CR3PtYKy.js"), true ? __vite__mapDeps([11,2,3]) : void 0, import.meta.url)).FlowGraphSendCustomEventBlock;
    case "FlowGraphReceiveCustomEventBlock":
      return async () => (await __vitePreload(() => import("./flowGraphReceiveCustomEventBlock.UFE7DFaT.js"), true ? __vite__mapDeps([12,2,3]) : void 0, import.meta.url)).FlowGraphReceiveCustomEventBlock;
    case "FlowGraphMeshPickEventBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMeshPickEventBlock.Cag1CMVe.js"), true ? __vite__mapDeps([13,2,3,1]) : void 0, import.meta.url)).FlowGraphMeshPickEventBlock;
    case "FlowGraphEBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphEBlock;
    case "FlowGraphPIBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphPiBlock;
    case "FlowGraphInfBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphInfBlock;
    case "FlowGraphNaNBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphNaNBlock;
    case "FlowGraphRandomBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphRandomBlock;
    case "FlowGraphAddBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphAddBlock;
    case "FlowGraphSubtractBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphSubtractBlock;
    case "FlowGraphMultiplyBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphMultiplyBlock;
    case "FlowGraphDivideBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphDivideBlock;
    case "FlowGraphAbsBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphAbsBlock;
    case "FlowGraphSignBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphSignBlock;
    case "FlowGraphTruncBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphTruncBlock;
    case "FlowGraphFloorBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphFloorBlock;
    case "FlowGraphCeilBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphCeilBlock;
    case "FlowGraphRoundBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphRoundBlock;
    case "FlowGraphFractBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphFractionBlock;
    case "FlowGraphNegationBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphNegationBlock;
    case "FlowGraphModuloBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphModuloBlock;
    case "FlowGraphMinBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphMinBlock;
    case "FlowGraphMaxBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphMaxBlock;
    case "FlowGraphClampBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphClampBlock;
    case "FlowGraphSaturateBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphSaturateBlock;
    case "FlowGraphMathInterpolationBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphMathInterpolationBlock;
    case "FlowGraphEqualityBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphEqualityBlock;
    case "FlowGraphLessThanBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphLessThanBlock;
    case "FlowGraphLessThanOrEqualBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphLessThanOrEqualBlock;
    case "FlowGraphGreaterThanBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphGreaterThanBlock;
    case "FlowGraphGreaterThanOrEqualBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphGreaterThanOrEqualBlock;
    case "FlowGraphIsNaNBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphIsNanBlock;
    case "FlowGraphIsInfBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphIsInfinityBlock;
    case "FlowGraphDegToRadBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphDegToRadBlock;
    case "FlowGraphRadToDegBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphRadToDegBlock;
    case "FlowGraphSinBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphSinBlock;
    case "FlowGraphCosBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphCosBlock;
    case "FlowGraphTanBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphTanBlock;
    case "FlowGraphASinBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphAsinBlock;
    case "FlowGraphACosBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphAcosBlock;
    case "FlowGraphATanBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphAtanBlock;
    case "FlowGraphATan2Block":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphAtan2Block;
    case "FlowGraphSinhBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphSinhBlock;
    case "FlowGraphCoshBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphCoshBlock;
    case "FlowGraphTanhBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphTanhBlock;
    case "FlowGraphASinhBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphAsinhBlock;
    case "FlowGraphACoshBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphAcoshBlock;
    case "FlowGraphATanhBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphAtanhBlock;
    case "FlowGraphExponentialBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphExpBlock;
    case "FlowGraphLogBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphLogBlock;
    case "FlowGraphLog2Block":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphLog2Block;
    case "FlowGraphLog10Block":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphLog10Block;
    case "FlowGraphSquareRootBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphSquareRootBlock;
    case "FlowGraphPowerBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphPowerBlock;
    case "FlowGraphCubeRootBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphCubeRootBlock;
    case "FlowGraphBitwiseAndBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphBitwiseAndBlock;
    case "FlowGraphBitwiseOrBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphBitwiseOrBlock;
    case "FlowGraphBitwiseNotBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphBitwiseNotBlock;
    case "FlowGraphBitwiseXorBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphBitwiseXorBlock;
    case "FlowGraphBitwiseLeftShiftBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphBitwiseLeftShiftBlock;
    case "FlowGraphBitwiseRightShiftBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphBitwiseRightShiftBlock;
    case "FlowGraphLengthBlock":
      return async () => (await __vitePreload(() => import("./flowGraphVectorMathBlocks.DRsbk2T3.js"), true ? __vite__mapDeps([19,1,2,3,15,16,17,18]) : void 0, import.meta.url)).FlowGraphLengthBlock;
    case "FlowGraphNormalizeBlock":
      return async () => (await __vitePreload(() => import("./flowGraphVectorMathBlocks.DRsbk2T3.js"), true ? __vite__mapDeps([19,1,2,3,15,16,17,18]) : void 0, import.meta.url)).FlowGraphNormalizeBlock;
    case "FlowGraphDotBlock":
      return async () => (await __vitePreload(() => import("./flowGraphVectorMathBlocks.DRsbk2T3.js"), true ? __vite__mapDeps([19,1,2,3,15,16,17,18]) : void 0, import.meta.url)).FlowGraphDotBlock;
    case "FlowGraphCrossBlock":
      return async () => (await __vitePreload(() => import("./flowGraphVectorMathBlocks.DRsbk2T3.js"), true ? __vite__mapDeps([19,1,2,3,15,16,17,18]) : void 0, import.meta.url)).FlowGraphCrossBlock;
    case "FlowGraphRotate2DBlock":
      return async () => (await __vitePreload(() => import("./flowGraphVectorMathBlocks.DRsbk2T3.js"), true ? __vite__mapDeps([19,1,2,3,15,16,17,18]) : void 0, import.meta.url)).FlowGraphRotate2DBlock;
    case "FlowGraphRotate3DBlock":
      return async () => (await __vitePreload(() => import("./flowGraphVectorMathBlocks.DRsbk2T3.js"), true ? __vite__mapDeps([19,1,2,3,15,16,17,18]) : void 0, import.meta.url)).FlowGraphRotate3DBlock;
    case "FlowGraphTransposeBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMatrixMathBlocks.C1eB5hQv.js"), true ? __vite__mapDeps([20,1,2,3,17,16,15]) : void 0, import.meta.url)).FlowGraphTransposeBlock;
    case "FlowGraphDeterminantBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMatrixMathBlocks.C1eB5hQv.js"), true ? __vite__mapDeps([20,1,2,3,17,16,15]) : void 0, import.meta.url)).FlowGraphDeterminantBlock;
    case "FlowGraphInvertMatrixBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMatrixMathBlocks.C1eB5hQv.js"), true ? __vite__mapDeps([20,1,2,3,17,16,15]) : void 0, import.meta.url)).FlowGraphInvertMatrixBlock;
    case "FlowGraphMatrixMultiplicationBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMatrixMathBlocks.C1eB5hQv.js"), true ? __vite__mapDeps([20,1,2,3,17,16,15]) : void 0, import.meta.url)).FlowGraphMatrixMultiplicationBlock;
    case "FlowGraphBranchBlock":
      return async () => (await __vitePreload(() => import("./flowGraphBranchBlock.BbGDqXg1.js"), true ? __vite__mapDeps([21,1,2,3]) : void 0, import.meta.url)).FlowGraphBranchBlock;
    case "FlowGraphSetDelayBlock":
      return async () => (await __vitePreload(() => import("./flowGraphSetDelayBlock.DQNNDJEz.js"), true ? __vite__mapDeps([22,1,2,3]) : void 0, import.meta.url)).FlowGraphSetDelayBlock;
    case "FlowGraphCancelDelayBlock":
      return async () => (await __vitePreload(() => import("./flowGraphCancelDelayBlock.DKVZz2Re.js"), true ? __vite__mapDeps([23,2,3,1]) : void 0, import.meta.url)).FlowGraphCancelDelayBlock;
    case "FlowGraphCallCounterBlock":
      return async () => (await __vitePreload(() => import("./flowGraphCounterBlock.C0GZb3fO.js"), true ? __vite__mapDeps([24,1,2,3]) : void 0, import.meta.url)).FlowGraphCallCounterBlock;
    case "FlowGraphDebounceBlock":
      return async () => (await __vitePreload(() => import("./flowGraphDebounceBlock.ByR_Nwil.js"), true ? __vite__mapDeps([25,1,2,3]) : void 0, import.meta.url)).FlowGraphDebounceBlock;
    case "FlowGraphThrottleBlock":
      return async () => (await __vitePreload(() => import("./flowGraphThrottleBlock.BywcgzGD.js"), true ? __vite__mapDeps([26,1,2,3]) : void 0, import.meta.url)).FlowGraphThrottleBlock;
    case "FlowGraphDoNBlock":
      return async () => (await __vitePreload(() => import("./flowGraphDoNBlock.40Ok59ul.js"), true ? __vite__mapDeps([27,1,2,3]) : void 0, import.meta.url)).FlowGraphDoNBlock;
    case "FlowGraphFlipFlopBlock":
      return async () => (await __vitePreload(() => import("./flowGraphFlipFlopBlock.9RbAMtmg.js"), true ? __vite__mapDeps([28,1,2,3]) : void 0, import.meta.url)).FlowGraphFlipFlopBlock;
    case "FlowGraphForLoopBlock":
      return async () => (await __vitePreload(() => import("./flowGraphForLoopBlock.BfvuNBPn.js"), true ? __vite__mapDeps([29,1,2,3]) : void 0, import.meta.url)).FlowGraphForLoopBlock;
    case "FlowGraphMultiGateBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMultiGateBlock.OD_w9mp1.js"), true ? __vite__mapDeps([30,2,3,1]) : void 0, import.meta.url)).FlowGraphMultiGateBlock;
    case "FlowGraphSequenceBlock":
      return async () => (await __vitePreload(() => import("./flowGraphSequenceBlock.C8XMM_dx.js"), true ? __vite__mapDeps([31,2,3]) : void 0, import.meta.url)).FlowGraphSequenceBlock;
    case "FlowGraphSwitchBlock":
      return async () => (await __vitePreload(() => import("./flowGraphSwitchBlock.BaqcNV0P.js"), true ? __vite__mapDeps([32,1,2,3]) : void 0, import.meta.url)).FlowGraphSwitchBlock;
    case "FlowGraphWaitAllBlock":
      return async () => (await __vitePreload(() => import("./flowGraphWaitAllBlock.pbnyLVLV.js"), true ? __vite__mapDeps([33,2,3,1]) : void 0, import.meta.url)).FlowGraphWaitAllBlock;
    case "FlowGraphWhileLoopBlock":
      return async () => (await __vitePreload(() => import("./flowGraphWhileLoopBlock.imI51HtA.js"), true ? __vite__mapDeps([34,1,2,3]) : void 0, import.meta.url)).FlowGraphWhileLoopBlock;
    case "FlowGraphConsoleLogBlock":
      return async () => (await __vitePreload(() => import("./flowGraphConsoleLogBlock.lXeZwAaJ.js"), true ? __vite__mapDeps([35,1,2,3]) : void 0, import.meta.url)).FlowGraphConsoleLogBlock;
    case "FlowGraphConditionalBlock":
      return async () => (await __vitePreload(() => import("./flowGraphConditionalDataBlock.BlD_U9vy.js"), true ? __vite__mapDeps([36,1,2,3]) : void 0, import.meta.url)).FlowGraphConditionalDataBlock;
    case "FlowGraphConstantBlock":
      return async () => (await __vitePreload(() => import("./flowGraphConstantBlock.cmIXucVq.js"), true ? __vite__mapDeps([37,1,2,3]) : void 0, import.meta.url)).FlowGraphConstantBlock;
    case "FlowGraphTransformCoordinatesSystemBlock":
      return async () => (await __vitePreload(() => import("./flowGraphTransformCoordinatesSystemBlock.CJLhjDoJ.js"), true ? __vite__mapDeps([38,1,2,3]) : void 0, import.meta.url)).FlowGraphTransformCoordinatesSystemBlock;
    case "FlowGraphGetAssetBlock":
      return async () => (await __vitePreload(() => import("./flowGraphGetAssetBlock.px9oiLKg.js"), true ? __vite__mapDeps([39,1,2,3]) : void 0, import.meta.url)).FlowGraphGetAssetBlock;
    case "FlowGraphGetPropertyBlock":
      return async () => (await __vitePreload(() => import("./flowGraphGetPropertyBlock.DBGcKOTD.js"), true ? __vite__mapDeps([40,1,2,3,16]) : void 0, import.meta.url)).FlowGraphGetPropertyBlock;
    case "FlowGraphSetPropertyBlock":
      return async () => (await __vitePreload(() => import("./flowGraphSetPropertyBlock.zhx_mgG3.js"), true ? __vite__mapDeps([41,1,2,3]) : void 0, import.meta.url)).FlowGraphSetPropertyBlock;
    case "FlowGraphGetVariableBlock":
      return async () => (await __vitePreload(() => import("./flowGraphGetVariableBlock.Dde2bJ8o.js"), true ? __vite__mapDeps([42,1,2,3]) : void 0, import.meta.url)).FlowGraphGetVariableBlock;
    case "FlowGraphSetVariableBlock":
      return async () => (await __vitePreload(() => import("./flowGraphSetVariableBlock.FYvMTizC.js"), true ? __vite__mapDeps([43,2,3,1]) : void 0, import.meta.url)).FlowGraphSetVariableBlock;
    case "FlowGraphJsonPointerParserBlock":
      return async () => (await __vitePreload(() => import("./flowGraphJsonPointerParserBlock.B8hasj3y.js"), true ? __vite__mapDeps([44,1,2,3,16]) : void 0, import.meta.url)).FlowGraphJsonPointerParserBlock;
    case "FlowGraphLeadingZerosBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphLeadingZerosBlock;
    case "FlowGraphTrailingZerosBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphTrailingZerosBlock;
    case "FlowGraphOneBitsCounterBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathBlocks.FA_CEmev.js"), true ? __vite__mapDeps([14,2,3,1,15,16,17,18]) : void 0, import.meta.url)).FlowGraphOneBitsCounterBlock;
    case "FlowGraphCombineVector2Block":
      return async () => (await __vitePreload(() => import("./flowGraphMathCombineExtractBlocks.CVSL6-uA.js"), true ? __vite__mapDeps([45,16,1,2,3]) : void 0, import.meta.url)).FlowGraphCombineVector2Block;
    case "FlowGraphCombineVector3Block":
      return async () => (await __vitePreload(() => import("./flowGraphMathCombineExtractBlocks.CVSL6-uA.js"), true ? __vite__mapDeps([45,16,1,2,3]) : void 0, import.meta.url)).FlowGraphCombineVector3Block;
    case "FlowGraphCombineVector4Block":
      return async () => (await __vitePreload(() => import("./flowGraphMathCombineExtractBlocks.CVSL6-uA.js"), true ? __vite__mapDeps([45,16,1,2,3]) : void 0, import.meta.url)).FlowGraphCombineVector4Block;
    case "FlowGraphCombineMatrixBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathCombineExtractBlocks.CVSL6-uA.js"), true ? __vite__mapDeps([45,16,1,2,3]) : void 0, import.meta.url)).FlowGraphCombineMatrixBlock;
    case "FlowGraphExtractVector2Block":
      return async () => (await __vitePreload(() => import("./flowGraphMathCombineExtractBlocks.CVSL6-uA.js"), true ? __vite__mapDeps([45,16,1,2,3]) : void 0, import.meta.url)).FlowGraphExtractVector2Block;
    case "FlowGraphExtractVector3Block":
      return async () => (await __vitePreload(() => import("./flowGraphMathCombineExtractBlocks.CVSL6-uA.js"), true ? __vite__mapDeps([45,16,1,2,3]) : void 0, import.meta.url)).FlowGraphExtractVector3Block;
    case "FlowGraphExtractVector4Block":
      return async () => (await __vitePreload(() => import("./flowGraphMathCombineExtractBlocks.CVSL6-uA.js"), true ? __vite__mapDeps([45,16,1,2,3]) : void 0, import.meta.url)).FlowGraphExtractVector4Block;
    case "FlowGraphExtractMatrixBlock":
      return async () => (await __vitePreload(() => import("./flowGraphMathCombineExtractBlocks.CVSL6-uA.js"), true ? __vite__mapDeps([45,16,1,2,3]) : void 0, import.meta.url)).FlowGraphExtractMatrixBlock;
    case "FlowGraphTransformVectorBlock":
      return async () => (await __vitePreload(() => import("./flowGraphVectorMathBlocks.DRsbk2T3.js"), true ? __vite__mapDeps([19,1,2,3,15,16,17,18]) : void 0, import.meta.url)).FlowGraphTransformBlock;
    case "FlowGraphTransformCoordinatesBlock":
      return async () => (await __vitePreload(() => import("./flowGraphVectorMathBlocks.DRsbk2T3.js"), true ? __vite__mapDeps([19,1,2,3,15,16,17,18]) : void 0, import.meta.url)).FlowGraphTransformCoordinatesBlock;
    case "FlowGraphMatrixDecompose":
      return async () => (await __vitePreload(() => import("./flowGraphMatrixMathBlocks.C1eB5hQv.js"), true ? __vite__mapDeps([20,1,2,3,17,16,15]) : void 0, import.meta.url)).FlowGraphMatrixDecomposeBlock;
    case "FlowGraphMatrixCompose":
      return async () => (await __vitePreload(() => import("./flowGraphMatrixMathBlocks.C1eB5hQv.js"), true ? __vite__mapDeps([20,1,2,3,17,16,15]) : void 0, import.meta.url)).FlowGraphMatrixComposeBlock;
    case "FlowGraphBooleanToFloat":
      return async () => (await __vitePreload(() => import("./flowGraphTypeToTypeBlocks.BiA7H43P.js"), true ? __vite__mapDeps([46,17,16,1,2,3]) : void 0, import.meta.url)).FlowGraphBooleanToFloat;
    case "FlowGraphBooleanToInt":
      return async () => (await __vitePreload(() => import("./flowGraphTypeToTypeBlocks.BiA7H43P.js"), true ? __vite__mapDeps([46,17,16,1,2,3]) : void 0, import.meta.url)).FlowGraphBooleanToInt;
    case "FlowGraphFloatToBoolean":
      return async () => (await __vitePreload(() => import("./flowGraphTypeToTypeBlocks.BiA7H43P.js"), true ? __vite__mapDeps([46,17,16,1,2,3]) : void 0, import.meta.url)).FlowGraphFloatToBoolean;
    case "FlowGraphIntToBoolean":
      return async () => (await __vitePreload(() => import("./flowGraphTypeToTypeBlocks.BiA7H43P.js"), true ? __vite__mapDeps([46,17,16,1,2,3]) : void 0, import.meta.url)).FlowGraphIntToBoolean;
    case "FlowGraphIntToFloat":
      return async () => (await __vitePreload(() => import("./flowGraphTypeToTypeBlocks.BiA7H43P.js"), true ? __vite__mapDeps([46,17,16,1,2,3]) : void 0, import.meta.url)).FlowGraphIntToFloat;
    case "FlowGraphFloatToInt":
      return async () => (await __vitePreload(() => import("./flowGraphTypeToTypeBlocks.BiA7H43P.js"), true ? __vite__mapDeps([46,17,16,1,2,3]) : void 0, import.meta.url)).FlowGraphFloatToInt;
    case "FlowGraphEasingBlock":
      return async () => (await __vitePreload(() => import("./flowGraphEasingBlock.BOrmL4cq.js"), true ? __vite__mapDeps([47,2,3,1]) : void 0, import.meta.url)).FlowGraphEasingBlock;
    case "FlowGraphBezierCurveEasing":
      return async () => (await __vitePreload(() => import("./flowGraphBezierCurveEasingBlock.B89QWAxy.js"), true ? __vite__mapDeps([48,2,3,1]) : void 0, import.meta.url)).FlowGraphBezierCurveEasingBlock;
    case "FlowGraphPointerOverEventBlock":
      return async () => (await __vitePreload(() => import("./flowGraphPointerOverEventBlock.BS9kUrxN.js"), true ? __vite__mapDeps([49,1,2,3]) : void 0, import.meta.url)).FlowGraphPointerOverEventBlock;
    case "FlowGraphPointerOutEventBlock":
      return async () => (await __vitePreload(() => import("./flowGraphPointerOutEventBlock.DxLen1az.js"), true ? __vite__mapDeps([50,1,2,3]) : void 0, import.meta.url)).FlowGraphPointerOutEventBlock;
    case "FlowGraphContextBlock":
      return async () => (await __vitePreload(() => import("./flowGraphContextBlock.5hEHV2uP.js"), true ? __vite__mapDeps([51,1,2,3]) : void 0, import.meta.url)).FlowGraphContextBlock;
    case "FlowGraphArrayIndexBlock":
      return async () => (await __vitePreload(() => import("./flowGraphArrayIndexBlock.C1xhKLwm.js"), true ? __vite__mapDeps([52,1,2,3]) : void 0, import.meta.url)).FlowGraphArrayIndexBlock;
    case "FlowGraphCodeExecutionBlock":
      return async () => (await __vitePreload(() => import("./flowGraphCodeExecutionBlock.Ot2zrGV6.js"), true ? __vite__mapDeps([53,1,2,3]) : void 0, import.meta.url)).FlowGraphCodeExecutionBlock;
    case "FlowGraphIndexOfBlock":
      return async () => (await __vitePreload(() => import("./flowGraphIndexOfBlock.DrvZSolb.js"), true ? __vite__mapDeps([54,1,2,3]) : void 0, import.meta.url)).FlowGraphIndexOfBlock;
    case "FlowGraphFunctionReference":
      return async () => (await __vitePreload(() => import("./flowGraphFunctionReferenceBlock.DFh2VVvi.js"), true ? __vite__mapDeps([55,1,2,3]) : void 0, import.meta.url)).FlowGraphFunctionReferenceBlock;
    case "FlowGraphDataSwitchBlock":
      return async () => (await __vitePreload(() => import("./flowGraphDataSwitchBlock.Cje8nY5_.js"), true ? __vite__mapDeps([56,1,2,3]) : void 0, import.meta.url)).FlowGraphDataSwitchBlock;
    default:
      if (customBlocks[blockName]) {
        return customBlocks[blockName];
      }
      throw new Error(`Unknown block name ${blockName}`);
  }
}
class FlowGraphExecutionBlockWithOutSignal extends FlowGraphExecutionBlock {
  constructor(config) {
    super(config);
    this.out = this._registerSignalOutput("out");
  }
}
class FlowGraphAsyncExecutionBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config, events) {
    super(config);
    this._eventsSignalOutputs = {};
    this.done = this._registerSignalOutput("done");
    events == null ? void 0 : events.forEach((eventName) => {
      this._eventsSignalOutputs[eventName] = this._registerSignalOutput(eventName + "Event");
    });
  }
  /**
   * @internal
   * This function can be overridden to execute any
   * logic that should be executed on every frame
   * while the async task is pending.
   * @param context the context in which it is running
   */
  _executeOnTick(_context) {
  }
  /**
   * @internal
   * @param context
   */
  _startPendingTasks(context) {
    if (context._getExecutionVariable(this, "_initialized", false)) {
      this._cancelPendingTasks(context);
      this._resetAfterCanceled(context);
    }
    this._preparePendingTasks(context);
    context._addPendingBlock(this);
    this.out._activateSignal(context);
    context._setExecutionVariable(this, "_initialized", true);
  }
  _resetAfterCanceled(context) {
    context._deleteExecutionVariable(this, "_initialized");
    context._removePendingBlock(this);
  }
}
class FlowGraphEventBlock extends FlowGraphAsyncExecutionBlock {
  constructor() {
    super(...arguments);
    this.initPriority = 0;
    this.type = "NoTrigger";
  }
  /**
   * @internal
   */
  _execute(context) {
    context._notifyExecuteNode(this);
    this.done._activateSignal(context);
  }
}
function GetDataOutConnectionByUniqueId(blocks, uniqueId) {
  for (const block of blocks) {
    for (const dataOut of block.dataOutputs) {
      if (dataOut.uniqueId === uniqueId) {
        return dataOut;
      }
    }
  }
  throw new Error("Could not find data out connection with unique id " + uniqueId);
}
function GetSignalInConnectionByUniqueId(blocks, uniqueId) {
  for (const block of blocks) {
    if (block instanceof FlowGraphExecutionBlock) {
      for (const signalIn of block.signalInputs) {
        if (signalIn.uniqueId === uniqueId) {
          return signalIn;
        }
      }
    }
  }
  throw new Error("Could not find signal in connection with unique id " + uniqueId);
}
async function ParseFlowGraphAsync(serializationObject, options) {
  const resolvedClasses = await Promise.all(serializationObject.allBlocks.map(async (serializedBlock) => {
    const classFactory = blockFactory(serializedBlock.className);
    return classFactory();
  }));
  return ParseFlowGraph(serializationObject, options, resolvedClasses);
}
function ParseFlowGraph(serializationObject, options, resolvedClasses) {
  const graph = options.coordinator.createGraph();
  const blocks = [];
  const valueParseFunction = options.valueParseFunction ?? defaultValueParseFunction;
  for (let i = 0; i < serializationObject.allBlocks.length; i++) {
    const serializedBlock = serializationObject.allBlocks[i];
    const block = ParseFlowGraphBlockWithClassType(serializedBlock, { scene: options.coordinator.config.scene, pathConverter: options.pathConverter, assetsContainer: options.coordinator.config.scene, valueParseFunction }, resolvedClasses[i]);
    blocks.push(block);
    if (block instanceof FlowGraphEventBlock) {
      graph.addEventBlock(block);
    }
  }
  for (const block of blocks) {
    for (const dataIn of block.dataInputs) {
      for (const serializedConnection of dataIn.connectedPointIds) {
        const connection = GetDataOutConnectionByUniqueId(blocks, serializedConnection);
        dataIn.connectTo(connection);
      }
    }
    if (block instanceof FlowGraphExecutionBlock) {
      for (const signalOut of block.signalOutputs) {
        for (const serializedConnection of signalOut.connectedPointIds) {
          const connection = GetSignalInConnectionByUniqueId(blocks, serializedConnection);
          signalOut.connectTo(connection);
        }
      }
    }
  }
  for (const serializedContext of serializationObject.executionContexts) {
    ParseFlowGraphContext(serializedContext, { graph, valueParseFunction }, serializationObject.rightHanded);
  }
  return graph;
}
function ParseFlowGraphContext(serializationObject, options, rightHanded) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const result = options.graph.createContext();
  if (serializationObject.enableLogging) {
    result.enableLogging = true;
  }
  result.treatDataAsRightHanded = rightHanded || false;
  const valueParseFunction = options.valueParseFunction ?? defaultValueParseFunction;
  result.uniqueId = serializationObject.uniqueId;
  const scene = result.getScene();
  if (serializationObject._assetsContext) {
    const ac = serializationObject._assetsContext;
    const assetsContext = {
      meshes: (_a = ac.meshes) == null ? void 0 : _a.map((m) => scene.getMeshById(m)),
      lights: (_b = ac.lights) == null ? void 0 : _b.map((l) => scene.getLightByName(l)),
      cameras: (_c = ac.cameras) == null ? void 0 : _c.map((c) => scene.getCameraByName(c)),
      materials: (_d = ac.materials) == null ? void 0 : _d.map((m) => scene.getMaterialById(m)),
      textures: (_e = ac.textures) == null ? void 0 : _e.map((t) => scene.getTextureByName(t)),
      animations: (_f = ac.animations) == null ? void 0 : _f.map((a) => scene.animations.find((anim) => anim.name === a)),
      skeletons: (_g = ac.skeletons) == null ? void 0 : _g.map((s) => scene.getSkeletonByName(s)),
      particleSystems: (_h = ac.particleSystems) == null ? void 0 : _h.map((ps) => scene.getParticleSystemById(ps)),
      animationGroups: (_i = ac.animationGroups) == null ? void 0 : _i.map((ag) => scene.getAnimationGroupByName(ag)),
      transformNodes: (_j = ac.transformNodes) == null ? void 0 : _j.map((tn) => scene.getTransformNodeById(tn)),
      rootNodes: [],
      multiMaterials: [],
      morphTargetManagers: [],
      geometries: [],
      actionManagers: [],
      environmentTexture: null,
      postProcesses: [],
      sounds: null,
      effectLayers: [],
      layers: [],
      reflectionProbes: [],
      lensFlareSystems: [],
      proceduralTextures: [],
      getNodes: function() {
        throw new Error("Function not implemented.");
      }
    };
    result.assetsContext = assetsContext;
  }
  for (const key in serializationObject._userVariables) {
    const value = valueParseFunction(key, serializationObject._userVariables, result.assetsContext, scene);
    result.userVariables[key] = value;
  }
  for (const key in serializationObject._connectionValues) {
    const value = valueParseFunction(key, serializationObject._connectionValues, result.assetsContext, scene);
    result._setConnectionValueByKey(key, value);
  }
  return result;
}
function ParseFlowGraphBlockWithClassType(serializationObject, parseOptions, classType) {
  const parsedConfig = {};
  const valueParseFunction = parseOptions.valueParseFunction ?? defaultValueParseFunction;
  if (serializationObject.config) {
    for (const key in serializationObject.config) {
      parsedConfig[key] = valueParseFunction(key, serializationObject.config, parseOptions.assetsContainer || parseOptions.scene, parseOptions.scene);
    }
  }
  if (needsPathConverter(serializationObject.className)) {
    if (!parseOptions.pathConverter) {
      throw new Error("Path converter is required for this block");
    }
    parsedConfig.pathConverter = parseOptions.pathConverter;
  }
  const obj = new classType(parsedConfig);
  obj.uniqueId = serializationObject.uniqueId;
  for (let i = 0; i < serializationObject.dataInputs.length; i++) {
    const dataInput = obj.getDataInput(serializationObject.dataInputs[i].name);
    if (dataInput) {
      dataInput.deserialize(serializationObject.dataInputs[i]);
    } else {
      throw new Error("Could not find data input with name " + serializationObject.dataInputs[i].name + " in block " + serializationObject.className);
    }
  }
  for (let i = 0; i < serializationObject.dataOutputs.length; i++) {
    const dataOutput = obj.getDataOutput(serializationObject.dataOutputs[i].name);
    if (dataOutput) {
      dataOutput.deserialize(serializationObject.dataOutputs[i]);
    } else {
      throw new Error("Could not find data output with name " + serializationObject.dataOutputs[i].name + " in block " + serializationObject.className);
    }
  }
  obj.metadata = serializationObject.metadata;
  obj.deserialize && obj.deserialize(serializationObject);
  return obj;
}
const gltfTypeToBabylonType = {
  float: { length: 1, flowGraphType: "number", elementType: "number" },
  bool: { length: 1, flowGraphType: "boolean", elementType: "boolean" },
  float2: { length: 2, flowGraphType: "Vector2", elementType: "number" },
  float3: { length: 3, flowGraphType: "Vector3", elementType: "number" },
  float4: { length: 4, flowGraphType: "Vector4", elementType: "number" },
  float4x4: { length: 16, flowGraphType: "Matrix", elementType: "number" },
  float2x2: { length: 4, flowGraphType: "Matrix2D", elementType: "number" },
  float3x3: { length: 9, flowGraphType: "Matrix3D", elementType: "number" },
  int: { length: 1, flowGraphType: "FlowGraphInteger", elementType: "number" }
};
class InteractivityGraphToFlowGraphParser {
  constructor(_interactivityGraph, _gltf, _loader) {
    this._interactivityGraph = _interactivityGraph;
    this._gltf = _gltf;
    this._loader = _loader;
    this._types = [];
    this._mappings = [];
    this._staticVariables = [];
    this._events = [];
    this._internalEventsCounter = 0;
    this._nodes = [];
    this._parseTypes();
    this._parseDeclarations();
    this._parseVariables();
    this._parseEvents();
    this._parseNodes();
  }
  get arrays() {
    return {
      types: this._types,
      mappings: this._mappings,
      staticVariables: this._staticVariables,
      events: this._events,
      nodes: this._nodes
    };
  }
  _parseTypes() {
    if (!this._interactivityGraph.types) {
      return;
    }
    for (const type of this._interactivityGraph.types) {
      this._types.push(gltfTypeToBabylonType[type.signature]);
    }
  }
  _parseDeclarations() {
    if (!this._interactivityGraph.declarations) {
      return;
    }
    for (const declaration of this._interactivityGraph.declarations) {
      const mapping = getMappingForDeclaration(declaration);
      if (!mapping) {
        Logger.Error(["No mapping found for declaration", declaration]);
        throw new Error("Error parsing declarations");
      }
      this._mappings.push({
        flowGraphMapping: mapping,
        fullOperationName: declaration.extension ? declaration.op + ":" + declaration.extension : declaration.op
      });
    }
  }
  _parseVariables() {
    if (!this._interactivityGraph.variables) {
      return;
    }
    for (const variable of this._interactivityGraph.variables) {
      const parsed = this._parseVariable(variable);
      this._staticVariables.push(parsed);
    }
  }
  _parseVariable(variable, dataTransform) {
    const type = this._types[variable.type];
    if (!type) {
      Logger.Error(["No type found for variable", variable]);
      throw new Error("Error parsing variables");
    }
    if (variable.value) {
      if (variable.value.length !== type.length) {
        Logger.Error(["Invalid value length for variable", variable, type]);
        throw new Error("Error parsing variables");
      }
    }
    const value = variable.value || [];
    if (!value.length) {
      switch (type.flowGraphType) {
        case "boolean":
          value.push(false);
          break;
        case "FlowGraphInteger":
          value.push(0);
          break;
        case "number":
          value.push(NaN);
          break;
        case "Vector2":
          value.push(NaN, NaN);
          break;
        case "Vector3":
          value.push(NaN, NaN, NaN);
          break;
        case "Vector4":
        case "Matrix2D":
        case "Quaternion":
          value.fill(NaN, 0, 4);
          break;
        case "Matrix":
          value.fill(NaN, 0, 16);
          break;
        case "Matrix3D":
          value.fill(NaN, 0, 9);
          break;
      }
    }
    return { type: type.flowGraphType, value: dataTransform ? dataTransform(value, this) : value };
  }
  _parseEvents() {
    if (!this._interactivityGraph.events) {
      return;
    }
    for (const event of this._interactivityGraph.events) {
      const converted = {
        eventId: event.id || "internalEvent_" + this._internalEventsCounter++
      };
      if (event.values) {
        converted.eventData = Object.keys(event.values).map((key) => {
          var _a;
          const eventValue = (_a = event.values) == null ? void 0 : _a[key];
          if (!eventValue) {
            Logger.Error(["No value found for event key", key]);
            throw new Error("Error parsing events");
          }
          const type = this._types[eventValue.type];
          if (!type) {
            Logger.Error(["No type found for event value", eventValue]);
            throw new Error("Error parsing events");
          }
          const value = typeof eventValue.value !== "undefined" ? this._parseVariable(eventValue) : void 0;
          return {
            id: key,
            type: type.flowGraphType,
            eventData: true,
            value
          };
        });
      }
      this._events.push(converted);
    }
  }
  _parseNodes() {
    if (!this._interactivityGraph.nodes) {
      return;
    }
    for (const node of this._interactivityGraph.nodes) {
      if (typeof node.declaration !== "number") {
        Logger.Error(["No declaration found for node", node]);
        throw new Error("Error parsing nodes");
      }
      const mapping = this._mappings[node.declaration];
      if (!mapping) {
        Logger.Error(["No mapping found for node", node]);
        throw new Error("Error parsing nodes");
      }
      if (mapping.flowGraphMapping.validation) {
        if (!mapping.flowGraphMapping.validation(node, this._interactivityGraph, this._gltf)) {
          throw new Error(`Error validating interactivity node ${node}`);
        }
      }
      const blocks = [];
      for (const blockType of mapping.flowGraphMapping.blocks) {
        const block = this._getEmptyBlock(blockType, mapping.fullOperationName);
        this._parseNodeConfiguration(node, block, mapping.flowGraphMapping, blockType);
        blocks.push(block);
      }
      this._nodes.push({ blocks, fullOperationName: mapping.fullOperationName });
    }
  }
  _getEmptyBlock(className, type) {
    const uniqueId = RandomGUID();
    const dataInputs = [];
    const dataOutputs = [];
    const signalInputs = [];
    const signalOutputs = [];
    const config = {};
    const metadata = {};
    return {
      uniqueId,
      className,
      dataInputs,
      dataOutputs,
      signalInputs,
      signalOutputs,
      config,
      type,
      metadata
    };
  }
  _parseNodeConfiguration(node, block, nodeMapping, blockType) {
    const configuration = block.config;
    if (node.configuration) {
      Object.keys(node.configuration).forEach((key) => {
        var _a, _b;
        const value = (_a = node.configuration) == null ? void 0 : _a[key];
        if (!value) {
          Logger.Error(["No value found for node configuration", key]);
          throw new Error("Error parsing node configuration");
        }
        const configMapping = (_b = nodeMapping.configuration) == null ? void 0 : _b[key];
        const belongsToBlock = configMapping && configMapping.toBlock ? configMapping.toBlock === blockType : nodeMapping.blocks.indexOf(blockType) === 0;
        if (belongsToBlock) {
          const configKey = (configMapping == null ? void 0 : configMapping.name) || key;
          if ((!value || typeof value.value === "undefined") && typeof (configMapping == null ? void 0 : configMapping.defaultValue) !== "undefined") {
            configuration[configKey] = {
              value: configMapping.defaultValue
            };
          } else if (value.value.length >= 1) {
            configuration[configKey] = {
              value: value.value.length === 1 ? value.value[0] : value.value
            };
          } else {
            Logger.Warn(["Invalid value for node configuration", value]);
          }
          if (configMapping && configMapping.dataTransformer) {
            configuration[configKey].value = configMapping.dataTransformer([configuration[configKey].value], this)[0];
          }
        }
      });
    }
  }
  _parseNodeConnections(context) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
    for (let i = 0; i < this._nodes.length; i++) {
      const gltfNode = (_a = this._interactivityGraph.nodes) == null ? void 0 : _a[i];
      if (!gltfNode) {
        Logger.Error(["No node found for interactivity node", this._nodes[i]]);
        throw new Error("Error parsing node connections");
      }
      const flowGraphBlocks = this._nodes[i];
      const outputMapper = this._mappings[gltfNode.declaration];
      if (!outputMapper) {
        Logger.Error(["No mapping found for node", gltfNode]);
        throw new Error("Error parsing node connections");
      }
      const flowsFromGLTF = gltfNode.flows || {};
      const flowsKeys = Object.keys(flowsFromGLTF).sort();
      for (const flowKey of flowsKeys) {
        const flow = flowsFromGLTF[flowKey];
        const flowMapping = (_c = (_b = outputMapper.flowGraphMapping.outputs) == null ? void 0 : _b.flows) == null ? void 0 : _c[flowKey];
        const socketOutName = (flowMapping == null ? void 0 : flowMapping.name) || flowKey;
        const socketOut = this._createNewSocketConnection(socketOutName, true);
        const block = flowMapping && flowMapping.toBlock && flowGraphBlocks.blocks.find((b) => b.className === flowMapping.toBlock) || flowGraphBlocks.blocks[0];
        block.signalOutputs.push(socketOut);
        const inputNodeId = flow.node;
        const nodeIn = this._nodes[inputNodeId];
        if (!nodeIn) {
          Logger.Error(["No node found for input node id", inputNodeId]);
          throw new Error("Error parsing node connections");
        }
        const inputMapper = getMappingForFullOperationName(nodeIn.fullOperationName);
        if (!inputMapper) {
          Logger.Error(["No mapping found for input node", nodeIn]);
          throw new Error("Error parsing node connections");
        }
        let flowInMapping = (_e = (_d = inputMapper.inputs) == null ? void 0 : _d.flows) == null ? void 0 : _e[flow.socket || "in"];
        let arrayMapping = false;
        if (!flowInMapping) {
          for (const key in (_f = inputMapper.inputs) == null ? void 0 : _f.flows) {
            if (key.startsWith("[") && key.endsWith("]")) {
              arrayMapping = true;
              flowInMapping = (_h = (_g = inputMapper.inputs) == null ? void 0 : _g.flows) == null ? void 0 : _h[key];
            }
          }
        }
        const nodeInSocketName = flowInMapping ? arrayMapping ? flowInMapping.name.replace("$1", flow.socket || "") : flowInMapping.name : flow.socket || "in";
        const inputBlock = flowInMapping && flowInMapping.toBlock && nodeIn.blocks.find((b) => b.className === flowInMapping.toBlock) || nodeIn.blocks[0];
        let socketIn = inputBlock.signalInputs.find((s) => s.name === nodeInSocketName);
        if (!socketIn) {
          socketIn = this._createNewSocketConnection(nodeInSocketName);
          inputBlock.signalInputs.push(socketIn);
        }
        socketIn.connectedPointIds.push(socketOut.uniqueId);
        socketOut.connectedPointIds.push(socketIn.uniqueId);
      }
      const valuesFromGLTF = gltfNode.values || {};
      const valuesKeys = Object.keys(valuesFromGLTF);
      for (const valueKey of valuesKeys) {
        const value = valuesFromGLTF[valueKey];
        let valueMapping = (_j = (_i = outputMapper.flowGraphMapping.inputs) == null ? void 0 : _i.values) == null ? void 0 : _j[valueKey];
        let arrayMapping = false;
        if (!valueMapping) {
          for (const key in (_k = outputMapper.flowGraphMapping.inputs) == null ? void 0 : _k.values) {
            if (key.startsWith("[") && key.endsWith("]")) {
              arrayMapping = true;
              valueMapping = (_m = (_l = outputMapper.flowGraphMapping.inputs) == null ? void 0 : _l.values) == null ? void 0 : _m[key];
            }
          }
        }
        const socketInName = valueMapping ? arrayMapping ? valueMapping.name.replace("$1", valueKey) : valueMapping.name : valueKey;
        const socketIn = this._createNewSocketConnection(socketInName);
        const block = valueMapping && valueMapping.toBlock && flowGraphBlocks.blocks.find((b) => b.className === valueMapping.toBlock) || flowGraphBlocks.blocks[0];
        block.dataInputs.push(socketIn);
        if (value.value !== void 0) {
          const convertedValue = this._parseVariable(value, valueMapping && valueMapping.dataTransformer);
          context._connectionValues[socketIn.uniqueId] = convertedValue;
        } else if (typeof value.node !== "undefined") {
          const nodeOutId = value.node;
          const nodeOutSocketName = value.socket || "value";
          const nodeOut = this._nodes[nodeOutId];
          if (!nodeOut) {
            Logger.Error(["No node found for output socket reference", value]);
            throw new Error("Error parsing node connections");
          }
          const outputMapper2 = getMappingForFullOperationName(nodeOut.fullOperationName);
          if (!outputMapper2) {
            Logger.Error(["No mapping found for output socket reference", value]);
            throw new Error("Error parsing node connections");
          }
          let valueMapping2 = (_o = (_n = outputMapper2.outputs) == null ? void 0 : _n.values) == null ? void 0 : _o[nodeOutSocketName];
          let arrayMapping2 = false;
          if (!valueMapping2) {
            for (const key in (_p = outputMapper2.outputs) == null ? void 0 : _p.values) {
              if (key.startsWith("[") && key.endsWith("]")) {
                arrayMapping2 = true;
                valueMapping2 = (_r = (_q = outputMapper2.outputs) == null ? void 0 : _q.values) == null ? void 0 : _r[key];
              }
            }
          }
          const socketOutName = valueMapping2 ? arrayMapping2 ? valueMapping2.name.replace("$1", nodeOutSocketName) : valueMapping2 == null ? void 0 : valueMapping2.name : nodeOutSocketName;
          const outBlock = valueMapping2 && valueMapping2.toBlock && nodeOut.blocks.find((b) => b.className === valueMapping2.toBlock) || nodeOut.blocks[0];
          let socketOut = outBlock.dataOutputs.find((s) => s.name === socketOutName);
          if (!socketOut) {
            socketOut = this._createNewSocketConnection(socketOutName, true);
            outBlock.dataOutputs.push(socketOut);
          }
          socketIn.connectedPointIds.push(socketOut.uniqueId);
          socketOut.connectedPointIds.push(socketIn.uniqueId);
        } else {
          Logger.Error(["Invalid value for value connection", value]);
          throw new Error("Error parsing node connections");
        }
      }
      if (outputMapper.flowGraphMapping.interBlockConnectors) {
        for (const connector of outputMapper.flowGraphMapping.interBlockConnectors) {
          const input = connector.input;
          const output = connector.output;
          const isVariable = connector.isVariable;
          this._connectFlowGraphNodes(input, output, flowGraphBlocks.blocks[connector.inputBlockIndex], flowGraphBlocks.blocks[connector.outputBlockIndex], isVariable);
        }
      }
      if (outputMapper.flowGraphMapping.extraProcessor) {
        const declaration = (_s = this._interactivityGraph.declarations) == null ? void 0 : _s[gltfNode.declaration];
        if (!declaration) {
          Logger.Error(["No declaration found for extra processor", gltfNode]);
          throw new Error("Error parsing node connections");
        }
        flowGraphBlocks.blocks = outputMapper.flowGraphMapping.extraProcessor(gltfNode, declaration, outputMapper.flowGraphMapping, this, flowGraphBlocks.blocks, context, this._gltf);
      }
    }
  }
  _createNewSocketConnection(name, isOutput) {
    return {
      uniqueId: RandomGUID(),
      name,
      _connectionType: isOutput ? 1 : 0,
      connectedPointIds: []
    };
  }
  _connectFlowGraphNodes(input, output, serializedInput, serializedOutput, isVariable) {
    const inputArray = isVariable ? serializedInput.dataInputs : serializedInput.signalInputs;
    const outputArray = isVariable ? serializedOutput.dataOutputs : serializedOutput.signalOutputs;
    const inputConnection = inputArray.find((s) => s.name === input) || this._createNewSocketConnection(input);
    const outputConnection = outputArray.find((s) => s.name === output) || this._createNewSocketConnection(output, true);
    if (!inputArray.find((s) => s.name === input)) {
      inputArray.push(inputConnection);
    }
    if (!outputArray.find((s) => s.name === output)) {
      outputArray.push(outputConnection);
    }
    inputConnection.connectedPointIds.push(outputConnection.uniqueId);
    outputConnection.connectedPointIds.push(inputConnection.uniqueId);
  }
  getVariableName(index) {
    return "staticVariable_" + index;
  }
  serializeToFlowGraph() {
    const context = {
      uniqueId: RandomGUID(),
      _userVariables: {},
      _connectionValues: {}
    };
    this._parseNodeConnections(context);
    for (let i = 0; i < this._staticVariables.length; i++) {
      const variable = this._staticVariables[i];
      context._userVariables[this.getVariableName(i)] = variable;
    }
    const allBlocks = this._nodes.reduce((acc, val) => acc.concat(val.blocks), []);
    return {
      rightHanded: true,
      allBlocks,
      executionContexts: [context]
    };
  }
}
const NAME = "KHR_interactivity";
class KHR_interactivity {
  /**
   * @internal
   * @param _loader
   */
  constructor(_loader) {
    this._loader = _loader;
    this.name = NAME;
    this.enabled = this._loader.isExtensionUsed(NAME);
    this._pathConverter = GetPathToObjectConverter(this._loader.gltf);
    _loader._skipStartAnimationStep = true;
    const scene = _loader.babylonScene;
    if (scene) {
      _AddInteractivityObjectModel(scene);
    }
  }
  dispose() {
    this._loader = null;
    delete this._pathConverter;
  }
  async onReady() {
    var _a;
    if (!this._loader.babylonScene || !this._pathConverter) {
      return;
    }
    const scene = this._loader.babylonScene;
    const interactivityDefinition = (_a = this._loader.gltf.extensions) == null ? void 0 : _a.KHR_interactivity;
    if (!interactivityDefinition) {
      return;
    }
    const coordinator = new FlowGraphCoordinator({ scene });
    coordinator.dispatchEventsSynchronously = false;
    const graphs = interactivityDefinition.graphs.map((graph) => {
      const parser = new InteractivityGraphToFlowGraphParser(graph, this._loader.gltf, this._loader);
      return parser.serializeToFlowGraph();
    });
    await Promise.all(graphs.map((graph) => ParseFlowGraphAsync(graph, { coordinator, pathConverter: this._pathConverter })));
    coordinator.start();
  }
}
function _AddInteractivityObjectModel(scene) {
  AddObjectAccessorToKey("/extensions/KHR_interactivity/?/activeCamera/rotation", {
    get: () => {
      if (!scene.activeCamera) {
        return new Quaternion(NaN, NaN, NaN, NaN);
      }
      return Quaternion.FromRotationMatrix(scene.activeCamera.getWorldMatrix()).normalize();
    },
    type: "Quaternion",
    getTarget: () => scene.activeCamera
  });
  AddObjectAccessorToKey("/extensions/KHR_interactivity/?/activeCamera/position", {
    get: () => {
      if (!scene.activeCamera) {
        return new Vector3(NaN, NaN, NaN);
      }
      return scene.activeCamera.position;
    },
    type: "Vector3",
    getTarget: () => scene.activeCamera
  });
  AddObjectAccessorToKey("/animations/{}/extensions/KHR_interactivity/isPlaying", {
    get: (animation) => {
      var _a;
      return ((_a = animation._babylonAnimationGroup) == null ? void 0 : _a.isPlaying) ?? false;
    },
    type: "boolean",
    getTarget: (animation) => {
      return animation._babylonAnimationGroup;
    }
  });
  AddObjectAccessorToKey("/animations/{}/extensions/KHR_interactivity/minTime", {
    get: (animation) => {
      var _a;
      return (((_a = animation._babylonAnimationGroup) == null ? void 0 : _a.from) ?? 0) / 60;
    },
    type: "number",
    getTarget: (animation) => {
      return animation._babylonAnimationGroup;
    }
  });
  AddObjectAccessorToKey("/animations/{}/extensions/KHR_interactivity/maxTime", {
    get: (animation) => {
      var _a;
      return (((_a = animation._babylonAnimationGroup) == null ? void 0 : _a.to) ?? 0) / 60;
    },
    type: "number",
    getTarget: (animation) => {
      return animation._babylonAnimationGroup;
    }
  });
  AddObjectAccessorToKey("/animations/{}/extensions/KHR_interactivity/playhead", {
    get: (animation) => {
      var _a;
      return (((_a = animation._babylonAnimationGroup) == null ? void 0 : _a.getCurrentFrame()) ?? 0) / 60;
    },
    type: "number",
    getTarget: (animation) => {
      return animation._babylonAnimationGroup;
    }
  });
  AddObjectAccessorToKey("/animations/{}/extensions/KHR_interactivity/virtualPlayhead", {
    get: (animation) => {
      var _a;
      return (((_a = animation._babylonAnimationGroup) == null ? void 0 : _a.getCurrentFrame()) ?? 0) / 60;
    },
    type: "number",
    getTarget: (animation) => {
      return animation._babylonAnimationGroup;
    }
  });
}
addToBlockFactory(NAME, "FlowGraphGLTFDataProvider", async () => {
  return (await __vitePreload(() => import("./flowGraphGLTFDataProvider.DG2qwn2B.js"), true ? __vite__mapDeps([57,1,2,3]) : void 0, import.meta.url)).FlowGraphGLTFDataProvider;
});
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_interactivity(loader));
const KHR_interactivity$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  KHR_interactivity,
  _AddInteractivityObjectModel
}, Symbol.toStringTag, { value: "Module" }));
export {
  FlowGraphBlock as F,
  GetFlowGraphAssetWithType as G,
  KHR_interactivity$1 as K,
  _isADescendantOf as _,
  FlowGraphAsyncExecutionBlock as a,
  FlowGraphExecutionBlockWithOutSignal as b,
  FlowGraphEventBlock as c,
  FlowGraphCoordinator as d,
  _getClassNameOf as e,
  FlowGraphExecutionBlock as f,
  getNumericValue as g,
  defaultValueSerializationFunction as h,
  isNumeric as i,
  _areSameVectorClass as j,
  _areSameMatrixClass as k,
  _areSameIntegerClass as l
};
