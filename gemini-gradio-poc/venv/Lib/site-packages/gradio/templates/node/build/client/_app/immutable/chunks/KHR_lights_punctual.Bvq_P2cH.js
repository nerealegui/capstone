import { N as Node, V as Vector3, aq as Light, M as Matrix, _ as __decorate, s as serialize, R as RegisterClass, C as Color3, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { b as ShadowLight, a as SpotLight } from "./objectModelMapping.r8gj80Ia.js";
import { ArrayItem, GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
Node.AddNodeConstructor("Light_Type_1", (name, scene) => {
  return () => new DirectionalLight(name, Vector3.Zero(), scene);
});
class DirectionalLight extends ShadowLight {
  /**
   * Fix frustum size for the shadow generation. This is disabled if the value is 0.
   */
  get shadowFrustumSize() {
    return this._shadowFrustumSize;
  }
  /**
   * Specifies a fix frustum size for the shadow generation.
   */
  set shadowFrustumSize(value) {
    this._shadowFrustumSize = value;
    this.forceProjectionMatrixCompute();
  }
  /**
   * Gets the shadow projection scale against the optimal computed one.
   * 0.1 by default which means that the projection window is increase by 10% from the optimal size.
   * This does not impact in fixed frustum size (shadowFrustumSize being set)
   */
  get shadowOrthoScale() {
    return this._shadowOrthoScale;
  }
  /**
   * Sets the shadow projection scale against the optimal computed one.
   * 0.1 by default which means that the projection window is increase by 10% from the optimal size.
   * This does not impact in fixed frustum size (shadowFrustumSize being set)
   */
  set shadowOrthoScale(value) {
    this._shadowOrthoScale = value;
    this.forceProjectionMatrixCompute();
  }
  /**
   * Gets or sets the orthoLeft property used to build the light frustum
   */
  get orthoLeft() {
    return this._orthoLeft;
  }
  set orthoLeft(left) {
    this._orthoLeft = left;
  }
  /**
   * Gets or sets the orthoRight property used to build the light frustum
   */
  get orthoRight() {
    return this._orthoRight;
  }
  set orthoRight(right) {
    this._orthoRight = right;
  }
  /**
   * Gets or sets the orthoTop property used to build the light frustum
   */
  get orthoTop() {
    return this._orthoTop;
  }
  set orthoTop(top) {
    this._orthoTop = top;
  }
  /**
   * Gets or sets the orthoBottom property used to build the light frustum
   */
  get orthoBottom() {
    return this._orthoBottom;
  }
  set orthoBottom(bottom) {
    this._orthoBottom = bottom;
  }
  /**
   * Creates a DirectionalLight object in the scene, oriented towards the passed direction (Vector3).
   * The directional light is emitted from everywhere in the given direction.
   * It can cast shadows.
   * Documentation : https://doc.babylonjs.com/features/featuresDeepDive/lights/lights_introduction
   * @param name The friendly name of the light
   * @param direction The direction of the light
   * @param scene The scene the light belongs to
   */
  constructor(name, direction, scene) {
    super(name, scene);
    this._shadowFrustumSize = 0;
    this._shadowOrthoScale = 0.1;
    this.autoUpdateExtends = true;
    this.autoCalcShadowZBounds = false;
    this._orthoLeft = Number.MAX_VALUE;
    this._orthoRight = Number.MIN_VALUE;
    this._orthoTop = Number.MIN_VALUE;
    this._orthoBottom = Number.MAX_VALUE;
    this.position = direction.scale(-1);
    this.direction = direction;
  }
  /**
   * Returns the string "DirectionalLight".
   * @returns The class name
   */
  getClassName() {
    return "DirectionalLight";
  }
  /**
   * Returns the integer 1.
   * @returns The light Type id as a constant defines in Light.LIGHTTYPEID_x
   */
  getTypeID() {
    return Light.LIGHTTYPEID_DIRECTIONALLIGHT;
  }
  /**
   * Sets the passed matrix "matrix" as projection matrix for the shadows cast by the light according to the passed view matrix.
   * Returns the DirectionalLight Shadow projection matrix.
   * @param matrix
   * @param viewMatrix
   * @param renderList
   */
  _setDefaultShadowProjectionMatrix(matrix, viewMatrix, renderList) {
    if (this.shadowFrustumSize > 0) {
      this._setDefaultFixedFrustumShadowProjectionMatrix(matrix);
    } else {
      this._setDefaultAutoExtendShadowProjectionMatrix(matrix, viewMatrix, renderList);
    }
  }
  /**
   * Sets the passed matrix "matrix" as fixed frustum projection matrix for the shadows cast by the light according to the passed view matrix.
   * Returns the DirectionalLight Shadow projection matrix.
   * @param matrix
   */
  _setDefaultFixedFrustumShadowProjectionMatrix(matrix) {
    const activeCamera = this.getScene().activeCamera;
    if (!activeCamera) {
      return;
    }
    Matrix.OrthoLHToRef(this.shadowFrustumSize, this.shadowFrustumSize, this.shadowMinZ !== void 0 ? this.shadowMinZ : activeCamera.minZ, this.shadowMaxZ !== void 0 ? this.shadowMaxZ : activeCamera.maxZ, matrix, this.getScene().getEngine().isNDCHalfZRange);
  }
  /**
   * Sets the passed matrix "matrix" as auto extend projection matrix for the shadows cast by the light according to the passed view matrix.
   * Returns the DirectionalLight Shadow projection matrix.
   * @param matrix
   * @param viewMatrix
   * @param renderList
   */
  _setDefaultAutoExtendShadowProjectionMatrix(matrix, viewMatrix, renderList) {
    const activeCamera = this.getScene().activeCamera;
    if (this.autoUpdateExtends || this._orthoLeft === Number.MAX_VALUE) {
      const tempVector3 = Vector3.Zero();
      this._orthoLeft = Number.MAX_VALUE;
      this._orthoRight = -Number.MAX_VALUE;
      this._orthoTop = -Number.MAX_VALUE;
      this._orthoBottom = Number.MAX_VALUE;
      let shadowMinZ = Number.MAX_VALUE;
      let shadowMaxZ = -Number.MAX_VALUE;
      for (let meshIndex = 0; meshIndex < renderList.length; meshIndex++) {
        const mesh = renderList[meshIndex];
        if (!mesh) {
          continue;
        }
        const boundingInfo = mesh.getBoundingInfo();
        const boundingBox = boundingInfo.boundingBox;
        for (let index = 0; index < boundingBox.vectorsWorld.length; index++) {
          Vector3.TransformCoordinatesToRef(boundingBox.vectorsWorld[index], viewMatrix, tempVector3);
          if (tempVector3.x < this._orthoLeft) {
            this._orthoLeft = tempVector3.x;
          }
          if (tempVector3.y < this._orthoBottom) {
            this._orthoBottom = tempVector3.y;
          }
          if (tempVector3.x > this._orthoRight) {
            this._orthoRight = tempVector3.x;
          }
          if (tempVector3.y > this._orthoTop) {
            this._orthoTop = tempVector3.y;
          }
          if (this.autoCalcShadowZBounds) {
            if (tempVector3.z < shadowMinZ) {
              shadowMinZ = tempVector3.z;
            }
            if (tempVector3.z > shadowMaxZ) {
              shadowMaxZ = tempVector3.z;
            }
          }
        }
      }
      if (this.autoCalcShadowZBounds) {
        this._shadowMinZ = shadowMinZ;
        this._shadowMaxZ = shadowMaxZ;
      }
    }
    const xOffset = this._orthoRight - this._orthoLeft;
    const yOffset = this._orthoTop - this._orthoBottom;
    const minZ = this.shadowMinZ !== void 0 ? this.shadowMinZ : (activeCamera == null ? void 0 : activeCamera.minZ) || 0;
    const maxZ = this.shadowMaxZ !== void 0 ? this.shadowMaxZ : (activeCamera == null ? void 0 : activeCamera.maxZ) || 1e4;
    const useReverseDepthBuffer = this.getScene().getEngine().useReverseDepthBuffer;
    Matrix.OrthoOffCenterLHToRef(this._orthoLeft - xOffset * this.shadowOrthoScale, this._orthoRight + xOffset * this.shadowOrthoScale, this._orthoBottom - yOffset * this.shadowOrthoScale, this._orthoTop + yOffset * this.shadowOrthoScale, useReverseDepthBuffer ? maxZ : minZ, useReverseDepthBuffer ? minZ : maxZ, matrix, this.getScene().getEngine().isNDCHalfZRange);
  }
  _buildUniformLayout() {
    this._uniformBuffer.addUniform("vLightData", 4);
    this._uniformBuffer.addUniform("vLightDiffuse", 4);
    this._uniformBuffer.addUniform("vLightSpecular", 4);
    this._uniformBuffer.addUniform("shadowsInfo", 3);
    this._uniformBuffer.addUniform("depthValues", 2);
    this._uniformBuffer.create();
  }
  /**
   * Sets the passed Effect object with the DirectionalLight transformed position (or position if not parented) and the passed name.
   * @param effect The effect to update
   * @param lightIndex The index of the light in the effect to update
   * @returns The directional light
   */
  transferToEffect(effect, lightIndex) {
    if (this.computeTransformedInformation()) {
      this._uniformBuffer.updateFloat4("vLightData", this.transformedDirection.x, this.transformedDirection.y, this.transformedDirection.z, 1, lightIndex);
      return this;
    }
    this._uniformBuffer.updateFloat4("vLightData", this.direction.x, this.direction.y, this.direction.z, 1, lightIndex);
    return this;
  }
  transferToNodeMaterialEffect(effect, lightDataUniformName) {
    if (this.computeTransformedInformation()) {
      effect.setFloat3(lightDataUniformName, this.transformedDirection.x, this.transformedDirection.y, this.transformedDirection.z);
      return this;
    }
    effect.setFloat3(lightDataUniformName, this.direction.x, this.direction.y, this.direction.z);
    return this;
  }
  /**
   * Gets the minZ used for shadow according to both the scene and the light.
   *
   * Values are fixed on directional lights as it relies on an ortho projection hence the need to convert being
   * -1 and 1 to 0 and 1 doing (depth + min) / (min + max) -> (depth + 1) / (1 + 1) -> (depth * 0.5) + 0.5.
   * (when not using reverse depth buffer / NDC half Z range)
   * @param _activeCamera The camera we are returning the min for (not used)
   * @returns the depth min z
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDepthMinZ(_activeCamera) {
    const engine = this._scene.getEngine();
    return !engine.useReverseDepthBuffer && engine.isNDCHalfZRange ? 0 : 1;
  }
  /**
   * Gets the maxZ used for shadow according to both the scene and the light.
   *
   * Values are fixed on directional lights as it relies on an ortho projection hence the need to convert being
   * -1 and 1 to 0 and 1 doing (depth + min) / (min + max) -> (depth + 1) / (1 + 1) -> (depth * 0.5) + 0.5.
   * (when not using reverse depth buffer / NDC half Z range)
   * @param _activeCamera The camera we are returning the max for
   * @returns the depth max z
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDepthMaxZ(_activeCamera) {
    const engine = this._scene.getEngine();
    return engine.useReverseDepthBuffer && engine.isNDCHalfZRange ? 0 : 1;
  }
  /**
   * Prepares the list of defines specific to the light type.
   * @param defines the list of defines
   * @param lightIndex defines the index of the light for the effect
   */
  prepareLightSpecificDefines(defines, lightIndex) {
    defines["DIRLIGHT" + lightIndex] = true;
  }
}
__decorate([
  serialize()
], DirectionalLight.prototype, "shadowFrustumSize", null);
__decorate([
  serialize()
], DirectionalLight.prototype, "shadowOrthoScale", null);
__decorate([
  serialize()
], DirectionalLight.prototype, "autoUpdateExtends", void 0);
__decorate([
  serialize()
], DirectionalLight.prototype, "autoCalcShadowZBounds", void 0);
__decorate([
  serialize("orthoLeft")
], DirectionalLight.prototype, "_orthoLeft", void 0);
__decorate([
  serialize("orthoRight")
], DirectionalLight.prototype, "_orthoRight", void 0);
__decorate([
  serialize("orthoTop")
], DirectionalLight.prototype, "_orthoTop", void 0);
__decorate([
  serialize("orthoBottom")
], DirectionalLight.prototype, "_orthoBottom", void 0);
RegisterClass("BABYLON.DirectionalLight", DirectionalLight);
Node.AddNodeConstructor("Light_Type_0", (name, scene) => {
  return () => new PointLight(name, Vector3.Zero(), scene);
});
class PointLight extends ShadowLight {
  /**
   * Getter: In case of direction provided, the shadow will not use a cube texture but simulate a spot shadow as a fallback
   * This specifies what angle the shadow will use to be created.
   *
   * It default to 90 degrees to work nicely with the cube texture generation for point lights shadow maps.
   */
  get shadowAngle() {
    return this._shadowAngle;
  }
  /**
   * Setter: In case of direction provided, the shadow will not use a cube texture but simulate a spot shadow as a fallback
   * This specifies what angle the shadow will use to be created.
   *
   * It default to 90 degrees to work nicely with the cube texture generation for point lights shadow maps.
   */
  set shadowAngle(value) {
    this._shadowAngle = value;
    this.forceProjectionMatrixCompute();
  }
  /**
   * Gets the direction if it has been set.
   * In case of direction provided, the shadow will not use a cube texture but simulate a spot shadow as a fallback
   */
  get direction() {
    return this._direction;
  }
  /**
   * In case of direction provided, the shadow will not use a cube texture but simulate a spot shadow as a fallback
   */
  set direction(value) {
    const previousNeedCube = this.needCube();
    this._direction = value;
    if (this.needCube() !== previousNeedCube && this._shadowGenerators) {
      const iterator = this._shadowGenerators.values();
      for (let key = iterator.next(); key.done !== true; key = iterator.next()) {
        const shadowGenerator = key.value;
        shadowGenerator.recreateShadowMap();
      }
    }
  }
  /**
   * Creates a PointLight object from the passed name and position (Vector3) and adds it in the scene.
   * A PointLight emits the light in every direction.
   * It can cast shadows.
   * If the scene camera is already defined and you want to set your PointLight at the camera position, just set it :
   * ```javascript
   * var pointLight = new PointLight("pl", camera.position, scene);
   * ```
   * Documentation : https://doc.babylonjs.com/features/featuresDeepDive/lights/lights_introduction
   * @param name The light friendly name
   * @param position The position of the point light in the scene
   * @param scene The scene the lights belongs to
   */
  constructor(name, position, scene) {
    super(name, scene);
    this._shadowAngle = Math.PI / 2;
    this.position = position;
  }
  /**
   * Returns the string "PointLight"
   * @returns the class name
   */
  getClassName() {
    return "PointLight";
  }
  /**
   * Returns the integer 0.
   * @returns The light Type id as a constant defines in Light.LIGHTTYPEID_x
   */
  getTypeID() {
    return Light.LIGHTTYPEID_POINTLIGHT;
  }
  /**
   * Specifies whether or not the shadowmap should be a cube texture.
   * @returns true if the shadowmap needs to be a cube texture.
   */
  needCube() {
    return !this.direction;
  }
  /**
   * Returns a new Vector3 aligned with the PointLight cube system according to the passed cube face index (integer).
   * @param faceIndex The index of the face we are computed the direction to generate shadow
   * @returns The set direction in 2d mode otherwise the direction to the cubemap face if needCube() is true
   */
  getShadowDirection(faceIndex) {
    if (this.direction) {
      return super.getShadowDirection(faceIndex);
    } else {
      switch (faceIndex) {
        case 0:
          return new Vector3(1, 0, 0);
        case 1:
          return new Vector3(-1, 0, 0);
        case 2:
          return new Vector3(0, -1, 0);
        case 3:
          return new Vector3(0, 1, 0);
        case 4:
          return new Vector3(0, 0, 1);
        case 5:
          return new Vector3(0, 0, -1);
      }
    }
    return Vector3.Zero();
  }
  /**
   * Sets the passed matrix "matrix" as a left-handed perspective projection matrix with the following settings :
   * - fov = PI / 2
   * - aspect ratio : 1.0
   * - z-near and far equal to the active camera minZ and maxZ.
   * Returns the PointLight.
   * @param matrix
   * @param viewMatrix
   * @param renderList
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _setDefaultShadowProjectionMatrix(matrix, viewMatrix, renderList) {
    const activeCamera = this.getScene().activeCamera;
    if (!activeCamera) {
      return;
    }
    const minZ = this.shadowMinZ !== void 0 ? this.shadowMinZ : activeCamera.minZ;
    const maxZ = this.shadowMaxZ !== void 0 ? this.shadowMaxZ : activeCamera.maxZ;
    const useReverseDepthBuffer = this.getScene().getEngine().useReverseDepthBuffer;
    Matrix.PerspectiveFovLHToRef(this.shadowAngle, 1, useReverseDepthBuffer ? maxZ : minZ, useReverseDepthBuffer ? minZ : maxZ, matrix, true, this._scene.getEngine().isNDCHalfZRange, void 0, useReverseDepthBuffer);
  }
  _buildUniformLayout() {
    this._uniformBuffer.addUniform("vLightData", 4);
    this._uniformBuffer.addUniform("vLightDiffuse", 4);
    this._uniformBuffer.addUniform("vLightSpecular", 4);
    this._uniformBuffer.addUniform("vLightFalloff", 4);
    this._uniformBuffer.addUniform("shadowsInfo", 3);
    this._uniformBuffer.addUniform("depthValues", 2);
    this._uniformBuffer.create();
  }
  /**
   * Sets the passed Effect "effect" with the PointLight transformed position (or position, if none) and passed name (string).
   * @param effect The effect to update
   * @param lightIndex The index of the light in the effect to update
   * @returns The point light
   */
  transferToEffect(effect, lightIndex) {
    if (this.computeTransformedInformation()) {
      this._uniformBuffer.updateFloat4("vLightData", this.transformedPosition.x, this.transformedPosition.y, this.transformedPosition.z, 0, lightIndex);
    } else {
      this._uniformBuffer.updateFloat4("vLightData", this.position.x, this.position.y, this.position.z, 0, lightIndex);
    }
    this._uniformBuffer.updateFloat4("vLightFalloff", this.range, this._inverseSquaredRange, 0, 0, lightIndex);
    return this;
  }
  transferToNodeMaterialEffect(effect, lightDataUniformName) {
    if (this.computeTransformedInformation()) {
      effect.setFloat3(lightDataUniformName, this.transformedPosition.x, this.transformedPosition.y, this.transformedPosition.z);
    } else {
      effect.setFloat3(lightDataUniformName, this.position.x, this.position.y, this.position.z);
    }
    return this;
  }
  /**
   * Prepares the list of defines specific to the light type.
   * @param defines the list of defines
   * @param lightIndex defines the index of the light for the effect
   */
  prepareLightSpecificDefines(defines, lightIndex) {
    defines["POINTLIGHT" + lightIndex] = true;
  }
}
__decorate([
  serialize()
], PointLight.prototype, "shadowAngle", null);
RegisterClass("BABYLON.PointLight", PointLight);
const NAME = "KHR_lights_punctual";
class KHR_lights {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this._loader = loader;
    this.enabled = this._loader.isExtensionUsed(NAME);
  }
  /** @internal */
  dispose() {
    this._loader = null;
    delete this._lights;
  }
  /** @internal */
  onLoading() {
    const extensions = this._loader.gltf.extensions;
    if (extensions && extensions[this.name]) {
      const extension = extensions[this.name];
      this._lights = extension.lights;
      ArrayItem.Assign(this._lights);
    }
  }
  /**
   * @internal
   */
  loadNodeAsync(context, node, assign) {
    return GLTFLoader.LoadExtensionAsync(context, node, this.name, (extensionContext, extension) => {
      this._loader._allMaterialsDirtyRequired = true;
      return this._loader.loadNodeAsync(context, node, (babylonMesh) => {
        let babylonLight;
        const light = ArrayItem.Get(extensionContext, this._lights, extension.light);
        const name = light.name || babylonMesh.name;
        this._loader.babylonScene._blockEntityCollection = !!this._loader._assetContainer;
        switch (light.type) {
          case "directional": {
            const babylonDirectionalLight = new DirectionalLight(name, Vector3.Backward(), this._loader.babylonScene);
            babylonDirectionalLight.position.setAll(0);
            babylonLight = babylonDirectionalLight;
            break;
          }
          case "point": {
            babylonLight = new PointLight(name, Vector3.Zero(), this._loader.babylonScene);
            break;
          }
          case "spot": {
            const babylonSpotLight = new SpotLight(name, Vector3.Zero(), Vector3.Backward(), 0, 1, this._loader.babylonScene);
            babylonSpotLight.angle = (light.spot && light.spot.outerConeAngle || Math.PI / 4) * 2;
            babylonSpotLight.innerAngle = (light.spot && light.spot.innerConeAngle || 0) * 2;
            babylonLight = babylonSpotLight;
            break;
          }
          default: {
            this._loader.babylonScene._blockEntityCollection = false;
            throw new Error(`${extensionContext}: Invalid light type (${light.type})`);
          }
        }
        babylonLight._parentContainer = this._loader._assetContainer;
        this._loader.babylonScene._blockEntityCollection = false;
        light._babylonLight = babylonLight;
        babylonLight.falloffType = Light.FALLOFF_GLTF;
        babylonLight.diffuse = light.color ? Color3.FromArray(light.color) : Color3.White();
        babylonLight.intensity = light.intensity == void 0 ? 1 : light.intensity;
        babylonLight.range = light.range == void 0 ? Number.MAX_VALUE : light.range;
        babylonLight.parent = babylonMesh;
        this._loader._babylonLights.push(babylonLight);
        GLTFLoader.AddPointerMetadata(babylonLight, extensionContext);
        assign(babylonMesh);
      });
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_lights(loader));
export {
  KHR_lights
};
