import { _ as __decorate, c as serializeAsVector3, s as serialize, aq as Light, M as Matrix, V as Vector3, b1 as Axis, a as TmpVectors, N as Node, T as Texture, l as serializeAsTexture, R as RegisterClass, ay as Vector2, aS as Color4, Q as Quaternion } from "./index.B4f7kVg_.js";
class Constants {
}
Constants.AUTOSAMPLERSUFFIX = "Sampler";
Constants.DISABLEUA = "#define DISABLE_UNIFORMITY_ANALYSIS";
Constants.ALPHA_DISABLE = 0;
Constants.ALPHA_ADD = 1;
Constants.ALPHA_COMBINE = 2;
Constants.ALPHA_SUBTRACT = 3;
Constants.ALPHA_MULTIPLY = 4;
Constants.ALPHA_MAXIMIZED = 5;
Constants.ALPHA_ONEONE = 6;
Constants.ALPHA_PREMULTIPLIED = 7;
Constants.ALPHA_PREMULTIPLIED_PORTERDUFF = 8;
Constants.ALPHA_INTERPOLATE = 9;
Constants.ALPHA_SCREENMODE = 10;
Constants.ALPHA_ONEONE_ONEONE = 11;
Constants.ALPHA_ALPHATOCOLOR = 12;
Constants.ALPHA_REVERSEONEMINUS = 13;
Constants.ALPHA_SRC_DSTONEMINUSSRCALPHA = 14;
Constants.ALPHA_ONEONE_ONEZERO = 15;
Constants.ALPHA_EXCLUSION = 16;
Constants.ALPHA_LAYER_ACCUMULATE = 17;
Constants.ALPHA_EQUATION_ADD = 0;
Constants.ALPHA_EQUATION_SUBSTRACT = 1;
Constants.ALPHA_EQUATION_REVERSE_SUBTRACT = 2;
Constants.ALPHA_EQUATION_MAX = 3;
Constants.ALPHA_EQUATION_MIN = 4;
Constants.ALPHA_EQUATION_DARKEN = 5;
Constants.DELAYLOADSTATE_NONE = 0;
Constants.DELAYLOADSTATE_LOADED = 1;
Constants.DELAYLOADSTATE_LOADING = 2;
Constants.DELAYLOADSTATE_NOTLOADED = 4;
Constants.NEVER = 512;
Constants.ALWAYS = 519;
Constants.LESS = 513;
Constants.EQUAL = 514;
Constants.LEQUAL = 515;
Constants.GREATER = 516;
Constants.GEQUAL = 518;
Constants.NOTEQUAL = 517;
Constants.KEEP = 7680;
Constants.ZERO = 0;
Constants.REPLACE = 7681;
Constants.INCR = 7682;
Constants.DECR = 7683;
Constants.INVERT = 5386;
Constants.INCR_WRAP = 34055;
Constants.DECR_WRAP = 34056;
Constants.TEXTURE_CLAMP_ADDRESSMODE = 0;
Constants.TEXTURE_WRAP_ADDRESSMODE = 1;
Constants.TEXTURE_MIRROR_ADDRESSMODE = 2;
Constants.TEXTURE_CREATIONFLAG_STORAGE = 1;
Constants.TEXTUREFORMAT_ALPHA = 0;
Constants.TEXTUREFORMAT_LUMINANCE = 1;
Constants.TEXTUREFORMAT_LUMINANCE_ALPHA = 2;
Constants.TEXTUREFORMAT_RGB = 4;
Constants.TEXTUREFORMAT_RGBA = 5;
Constants.TEXTUREFORMAT_RED = 6;
Constants.TEXTUREFORMAT_R = 6;
Constants.TEXTUREFORMAT_R16_UNORM = 33322;
Constants.TEXTUREFORMAT_RG16_UNORM = 33324;
Constants.TEXTUREFORMAT_RGB16_UNORM = 32852;
Constants.TEXTUREFORMAT_RGBA16_UNORM = 32859;
Constants.TEXTUREFORMAT_R16_SNORM = 36760;
Constants.TEXTUREFORMAT_RG16_SNORM = 36761;
Constants.TEXTUREFORMAT_RGB16_SNORM = 36762;
Constants.TEXTUREFORMAT_RGBA16_SNORM = 36763;
Constants.TEXTUREFORMAT_RG = 7;
Constants.TEXTUREFORMAT_RED_INTEGER = 8;
Constants.TEXTUREFORMAT_R_INTEGER = 8;
Constants.TEXTUREFORMAT_RG_INTEGER = 9;
Constants.TEXTUREFORMAT_RGB_INTEGER = 10;
Constants.TEXTUREFORMAT_RGBA_INTEGER = 11;
Constants.TEXTUREFORMAT_BGRA = 12;
Constants.TEXTUREFORMAT_DEPTH24_STENCIL8 = 13;
Constants.TEXTUREFORMAT_DEPTH32_FLOAT = 14;
Constants.TEXTUREFORMAT_DEPTH16 = 15;
Constants.TEXTUREFORMAT_DEPTH24 = 16;
Constants.TEXTUREFORMAT_DEPTH24UNORM_STENCIL8 = 17;
Constants.TEXTUREFORMAT_DEPTH32FLOAT_STENCIL8 = 18;
Constants.TEXTUREFORMAT_STENCIL8 = 19;
Constants.TEXTUREFORMAT_UNDEFINED = 4294967295;
Constants.TEXTUREFORMAT_COMPRESSED_RGBA_BPTC_UNORM = 36492;
Constants.TEXTUREFORMAT_COMPRESSED_SRGB_ALPHA_BPTC_UNORM = 36493;
Constants.TEXTUREFORMAT_COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT = 36495;
Constants.TEXTUREFORMAT_COMPRESSED_RGB_BPTC_SIGNED_FLOAT = 36494;
Constants.TEXTUREFORMAT_COMPRESSED_RGBA_S3TC_DXT5 = 33779;
Constants.TEXTUREFORMAT_COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = 35919;
Constants.TEXTUREFORMAT_COMPRESSED_RGBA_S3TC_DXT3 = 33778;
Constants.TEXTUREFORMAT_COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT = 35918;
Constants.TEXTUREFORMAT_COMPRESSED_RGBA_S3TC_DXT1 = 33777;
Constants.TEXTUREFORMAT_COMPRESSED_RGB_S3TC_DXT1 = 33776;
Constants.TEXTUREFORMAT_COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = 35917;
Constants.TEXTUREFORMAT_COMPRESSED_SRGB_S3TC_DXT1_EXT = 35916;
Constants.TEXTUREFORMAT_COMPRESSED_RGBA_ASTC_4x4 = 37808;
Constants.TEXTUREFORMAT_COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = 37840;
Constants.TEXTUREFORMAT_COMPRESSED_RGB_ETC1_WEBGL = 36196;
Constants.TEXTUREFORMAT_COMPRESSED_RGB8_ETC2 = 37492;
Constants.TEXTUREFORMAT_COMPRESSED_SRGB8_ETC2 = 37493;
Constants.TEXTUREFORMAT_COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 37494;
Constants.TEXTUREFORMAT_COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 37495;
Constants.TEXTUREFORMAT_COMPRESSED_RGBA8_ETC2_EAC = 37496;
Constants.TEXTUREFORMAT_COMPRESSED_SRGB8_ALPHA8_ETC2_EAC = 37497;
Constants.TEXTURETYPE_UNSIGNED_BYTE = 0;
Constants.TEXTURETYPE_UNSIGNED_INT = 0;
Constants.TEXTURETYPE_FLOAT = 1;
Constants.TEXTURETYPE_HALF_FLOAT = 2;
Constants.TEXTURETYPE_BYTE = 3;
Constants.TEXTURETYPE_SHORT = 4;
Constants.TEXTURETYPE_UNSIGNED_SHORT = 5;
Constants.TEXTURETYPE_INT = 6;
Constants.TEXTURETYPE_UNSIGNED_INTEGER = 7;
Constants.TEXTURETYPE_UNSIGNED_SHORT_4_4_4_4 = 8;
Constants.TEXTURETYPE_UNSIGNED_SHORT_5_5_5_1 = 9;
Constants.TEXTURETYPE_UNSIGNED_SHORT_5_6_5 = 10;
Constants.TEXTURETYPE_UNSIGNED_INT_2_10_10_10_REV = 11;
Constants.TEXTURETYPE_UNSIGNED_INT_24_8 = 12;
Constants.TEXTURETYPE_UNSIGNED_INT_10F_11F_11F_REV = 13;
Constants.TEXTURETYPE_UNSIGNED_INT_5_9_9_9_REV = 14;
Constants.TEXTURETYPE_FLOAT_32_UNSIGNED_INT_24_8_REV = 15;
Constants.TEXTURETYPE_UNDEFINED = 16;
Constants.TEXTURE_2D = 3553;
Constants.TEXTURE_2D_ARRAY = 35866;
Constants.TEXTURE_CUBE_MAP = 34067;
Constants.TEXTURE_CUBE_MAP_ARRAY = 3735928559;
Constants.TEXTURE_3D = 32879;
Constants.TEXTURE_NEAREST_SAMPLINGMODE = 1;
Constants.TEXTURE_NEAREST_NEAREST = 1;
Constants.TEXTURE_BILINEAR_SAMPLINGMODE = 2;
Constants.TEXTURE_LINEAR_LINEAR = 2;
Constants.TEXTURE_TRILINEAR_SAMPLINGMODE = 3;
Constants.TEXTURE_LINEAR_LINEAR_MIPLINEAR = 3;
Constants.TEXTURE_NEAREST_NEAREST_MIPNEAREST = 4;
Constants.TEXTURE_NEAREST_LINEAR_MIPNEAREST = 5;
Constants.TEXTURE_NEAREST_LINEAR_MIPLINEAR = 6;
Constants.TEXTURE_NEAREST_LINEAR = 7;
Constants.TEXTURE_NEAREST_NEAREST_MIPLINEAR = 8;
Constants.TEXTURE_LINEAR_NEAREST_MIPNEAREST = 9;
Constants.TEXTURE_LINEAR_NEAREST_MIPLINEAR = 10;
Constants.TEXTURE_LINEAR_LINEAR_MIPNEAREST = 11;
Constants.TEXTURE_LINEAR_NEAREST = 12;
Constants.TEXTURE_EXPLICIT_MODE = 0;
Constants.TEXTURE_SPHERICAL_MODE = 1;
Constants.TEXTURE_PLANAR_MODE = 2;
Constants.TEXTURE_CUBIC_MODE = 3;
Constants.TEXTURE_PROJECTION_MODE = 4;
Constants.TEXTURE_SKYBOX_MODE = 5;
Constants.TEXTURE_INVCUBIC_MODE = 6;
Constants.TEXTURE_EQUIRECTANGULAR_MODE = 7;
Constants.TEXTURE_FIXED_EQUIRECTANGULAR_MODE = 8;
Constants.TEXTURE_FIXED_EQUIRECTANGULAR_MIRRORED_MODE = 9;
Constants.TEXTURE_FILTERING_QUALITY_OFFLINE = 4096;
Constants.TEXTURE_FILTERING_QUALITY_HIGH = 64;
Constants.TEXTURE_FILTERING_QUALITY_MEDIUM = 16;
Constants.TEXTURE_FILTERING_QUALITY_LOW = 8;
Constants.SCALEMODE_FLOOR = 1;
Constants.SCALEMODE_NEAREST = 2;
Constants.SCALEMODE_CEILING = 3;
Constants.MATERIAL_TextureDirtyFlag = 1;
Constants.MATERIAL_LightDirtyFlag = 2;
Constants.MATERIAL_FresnelDirtyFlag = 4;
Constants.MATERIAL_AttributesDirtyFlag = 8;
Constants.MATERIAL_MiscDirtyFlag = 16;
Constants.MATERIAL_PrePassDirtyFlag = 32;
Constants.MATERIAL_ImageProcessingDirtyFlag = 64;
Constants.MATERIAL_AllDirtyFlag = 127;
Constants.MATERIAL_TriangleFillMode = 0;
Constants.MATERIAL_WireFrameFillMode = 1;
Constants.MATERIAL_PointFillMode = 2;
Constants.MATERIAL_PointListDrawMode = 3;
Constants.MATERIAL_LineListDrawMode = 4;
Constants.MATERIAL_LineLoopDrawMode = 5;
Constants.MATERIAL_LineStripDrawMode = 6;
Constants.MATERIAL_TriangleStripDrawMode = 7;
Constants.MATERIAL_TriangleFanDrawMode = 8;
Constants.MATERIAL_ClockWiseSideOrientation = 0;
Constants.MATERIAL_CounterClockWiseSideOrientation = 1;
Constants.ACTION_NothingTrigger = 0;
Constants.ACTION_OnPickTrigger = 1;
Constants.ACTION_OnLeftPickTrigger = 2;
Constants.ACTION_OnRightPickTrigger = 3;
Constants.ACTION_OnCenterPickTrigger = 4;
Constants.ACTION_OnPickDownTrigger = 5;
Constants.ACTION_OnDoublePickTrigger = 6;
Constants.ACTION_OnPickUpTrigger = 7;
Constants.ACTION_OnPickOutTrigger = 16;
Constants.ACTION_OnLongPressTrigger = 8;
Constants.ACTION_OnPointerOverTrigger = 9;
Constants.ACTION_OnPointerOutTrigger = 10;
Constants.ACTION_OnEveryFrameTrigger = 11;
Constants.ACTION_OnIntersectionEnterTrigger = 12;
Constants.ACTION_OnIntersectionExitTrigger = 13;
Constants.ACTION_OnKeyDownTrigger = 14;
Constants.ACTION_OnKeyUpTrigger = 15;
Constants.PARTICLES_BILLBOARDMODE_Y = 2;
Constants.PARTICLES_BILLBOARDMODE_ALL = 7;
Constants.PARTICLES_BILLBOARDMODE_STRETCHED = 8;
Constants.PARTICLES_BILLBOARDMODE_STRETCHED_LOCAL = 9;
Constants.MESHES_CULLINGSTRATEGY_STANDARD = 0;
Constants.MESHES_CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY = 1;
Constants.MESHES_CULLINGSTRATEGY_OPTIMISTIC_INCLUSION = 2;
Constants.MESHES_CULLINGSTRATEGY_OPTIMISTIC_INCLUSION_THEN_BSPHERE_ONLY = 3;
Constants.SCENELOADER_NO_LOGGING = 0;
Constants.SCENELOADER_MINIMAL_LOGGING = 1;
Constants.SCENELOADER_SUMMARY_LOGGING = 2;
Constants.SCENELOADER_DETAILED_LOGGING = 3;
Constants.PREPASS_IRRADIANCE_TEXTURE_TYPE = 0;
Constants.PREPASS_POSITION_TEXTURE_TYPE = 1;
Constants.PREPASS_VELOCITY_TEXTURE_TYPE = 2;
Constants.PREPASS_REFLECTIVITY_TEXTURE_TYPE = 3;
Constants.PREPASS_COLOR_TEXTURE_TYPE = 4;
Constants.PREPASS_DEPTH_TEXTURE_TYPE = 5;
Constants.PREPASS_NORMAL_TEXTURE_TYPE = 6;
Constants.PREPASS_ALBEDO_SQRT_TEXTURE_TYPE = 7;
Constants.PREPASS_WORLD_NORMAL_TEXTURE_TYPE = 8;
Constants.PREPASS_LOCAL_POSITION_TEXTURE_TYPE = 9;
Constants.PREPASS_SCREENSPACE_DEPTH_TEXTURE_TYPE = 10;
Constants.PREPASS_VELOCITY_LINEAR_TEXTURE_TYPE = 11;
Constants.PREPASS_ALBEDO_TEXTURE_TYPE = 12;
Constants.BUFFER_CREATIONFLAG_READ = 1;
Constants.BUFFER_CREATIONFLAG_WRITE = 2;
Constants.BUFFER_CREATIONFLAG_READWRITE = 3;
Constants.BUFFER_CREATIONFLAG_UNIFORM = 4;
Constants.BUFFER_CREATIONFLAG_VERTEX = 8;
Constants.BUFFER_CREATIONFLAG_INDEX = 16;
Constants.BUFFER_CREATIONFLAG_STORAGE = 32;
Constants.BUFFER_CREATIONFLAG_INDIRECT = 64;
Constants.RENDERPASS_MAIN = 0;
Constants.INPUT_ALT_KEY = 18;
Constants.INPUT_CTRL_KEY = 17;
Constants.INPUT_META_KEY1 = 91;
Constants.INPUT_META_KEY2 = 92;
Constants.INPUT_META_KEY3 = 93;
Constants.INPUT_SHIFT_KEY = 16;
Constants.SNAPSHOTRENDERING_STANDARD = 0;
Constants.SNAPSHOTRENDERING_FAST = 1;
Constants.PERSPECTIVE_CAMERA = 0;
Constants.ORTHOGRAPHIC_CAMERA = 1;
Constants.FOVMODE_VERTICAL_FIXED = 0;
Constants.FOVMODE_HORIZONTAL_FIXED = 1;
Constants.RIG_MODE_NONE = 0;
Constants.RIG_MODE_STEREOSCOPIC_ANAGLYPH = 10;
Constants.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_PARALLEL = 11;
Constants.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_CROSSEYED = 12;
Constants.RIG_MODE_STEREOSCOPIC_OVERUNDER = 13;
Constants.RIG_MODE_STEREOSCOPIC_INTERLACED = 14;
Constants.RIG_MODE_VR = 20;
Constants.RIG_MODE_CUSTOM = 22;
Constants.MAX_SUPPORTED_UV_SETS = 6;
Constants.GL_ALPHA_EQUATION_ADD = 32774;
Constants.GL_ALPHA_EQUATION_MIN = 32775;
Constants.GL_ALPHA_EQUATION_MAX = 32776;
Constants.GL_ALPHA_EQUATION_SUBTRACT = 32778;
Constants.GL_ALPHA_EQUATION_REVERSE_SUBTRACT = 32779;
Constants.GL_ALPHA_FUNCTION_SRC = 768;
Constants.GL_ALPHA_FUNCTION_ONE_MINUS_SRC_COLOR = 769;
Constants.GL_ALPHA_FUNCTION_SRC_ALPHA = 770;
Constants.GL_ALPHA_FUNCTION_ONE_MINUS_SRC_ALPHA = 771;
Constants.GL_ALPHA_FUNCTION_DST_ALPHA = 772;
Constants.GL_ALPHA_FUNCTION_ONE_MINUS_DST_ALPHA = 773;
Constants.GL_ALPHA_FUNCTION_DST_COLOR = 774;
Constants.GL_ALPHA_FUNCTION_ONE_MINUS_DST_COLOR = 775;
Constants.GL_ALPHA_FUNCTION_SRC_ALPHA_SATURATED = 776;
Constants.GL_ALPHA_FUNCTION_CONSTANT_COLOR = 32769;
Constants.GL_ALPHA_FUNCTION_ONE_MINUS_CONSTANT_COLOR = 32770;
Constants.GL_ALPHA_FUNCTION_CONSTANT_ALPHA = 32771;
Constants.GL_ALPHA_FUNCTION_ONE_MINUS_CONSTANT_ALPHA = 32772;
Constants.GL_ALPHA_FUNCTION_SRC1_COLOR = 35065;
Constants.GL_ALPHA_FUNCTION_ONE_MINUS_SRC1_COLOR = 35066;
Constants.GL_ALPHA_FUNCTION_SRC1_ALPHA = 34185;
Constants.GL_ALPHA_FUNCTION_ONE_MINUS_SRC1_ALPHA = 35067;
Constants.SnippetUrl = "https://snippet.babylonjs.com";
Constants.FOGMODE_NONE = 0;
Constants.FOGMODE_EXP = 1;
Constants.FOGMODE_EXP2 = 2;
Constants.FOGMODE_LINEAR = 3;
Constants.BYTE = 5120;
Constants.UNSIGNED_BYTE = 5121;
Constants.SHORT = 5122;
Constants.UNSIGNED_SHORT = 5123;
Constants.INT = 5124;
Constants.UNSIGNED_INT = 5125;
Constants.FLOAT = 5126;
Constants.PositionKind = "position";
Constants.NormalKind = "normal";
Constants.TangentKind = "tangent";
Constants.UVKind = "uv";
Constants.UV2Kind = "uv2";
Constants.UV3Kind = "uv3";
Constants.UV4Kind = "uv4";
Constants.UV5Kind = "uv5";
Constants.UV6Kind = "uv6";
Constants.ColorKind = "color";
Constants.ColorInstanceKind = "instanceColor";
Constants.MatricesIndicesKind = "matricesIndices";
Constants.MatricesWeightsKind = "matricesWeights";
Constants.MatricesIndicesExtraKind = "matricesIndicesExtra";
Constants.MatricesWeightsExtraKind = "matricesWeightsExtra";
Constants.ANIMATIONTYPE_FLOAT = 0;
Constants.ANIMATIONTYPE_VECTOR3 = 1;
Constants.ANIMATIONTYPE_QUATERNION = 2;
Constants.ANIMATIONTYPE_MATRIX = 3;
Constants.ANIMATIONTYPE_COLOR3 = 4;
Constants.ANIMATIONTYPE_COLOR4 = 7;
Constants.ANIMATIONTYPE_VECTOR2 = 5;
Constants.ANIMATIONTYPE_SIZE = 6;
Constants.ShadowMinZ = 0;
Constants.ShadowMaxZ = 1e4;
class ShadowLight extends Light {
  constructor() {
    super(...arguments);
    this._needProjectionMatrixCompute = true;
    this._viewMatrix = Matrix.Identity();
    this._projectionMatrix = Matrix.Identity();
  }
  _setPosition(value) {
    this._position = value;
  }
  /**
   * Sets the position the shadow will be casted from. Also use as the light position for both
   * point and spot lights.
   */
  get position() {
    return this._position;
  }
  /**
   * Sets the position the shadow will be casted from. Also use as the light position for both
   * point and spot lights.
   */
  set position(value) {
    this._setPosition(value);
  }
  _setDirection(value) {
    this._direction = value;
  }
  /**
   * In 2d mode (needCube being false), gets the direction used to cast the shadow.
   * Also use as the light direction on spot and directional lights.
   */
  get direction() {
    return this._direction;
  }
  /**
   * In 2d mode (needCube being false), sets the direction used to cast the shadow.
   * Also use as the light direction on spot and directional lights.
   */
  set direction(value) {
    this._setDirection(value);
  }
  /**
   * Gets the shadow projection clipping minimum z value.
   */
  get shadowMinZ() {
    return this._shadowMinZ;
  }
  /**
   * Sets the shadow projection clipping minimum z value.
   */
  set shadowMinZ(value) {
    this._shadowMinZ = value;
    this.forceProjectionMatrixCompute();
  }
  /**
   * Sets the shadow projection clipping maximum z value.
   */
  get shadowMaxZ() {
    return this._shadowMaxZ;
  }
  /**
   * Gets the shadow projection clipping maximum z value.
   */
  set shadowMaxZ(value) {
    this._shadowMaxZ = value;
    this.forceProjectionMatrixCompute();
  }
  /**
   * Computes the transformed information (transformedPosition and transformedDirection in World space) of the current light
   * @returns true if the information has been computed, false if it does not need to (no parenting)
   */
  computeTransformedInformation() {
    if (this.parent && this.parent.getWorldMatrix) {
      if (!this.transformedPosition) {
        this.transformedPosition = Vector3.Zero();
      }
      Vector3.TransformCoordinatesToRef(this.position, this.parent.getWorldMatrix(), this.transformedPosition);
      if (this.direction) {
        if (!this.transformedDirection) {
          this.transformedDirection = Vector3.Zero();
        }
        Vector3.TransformNormalToRef(this.direction, this.parent.getWorldMatrix(), this.transformedDirection);
      }
      return true;
    }
    return false;
  }
  /**
   * Return the depth scale used for the shadow map.
   * @returns the depth scale.
   */
  getDepthScale() {
    return 50;
  }
  /**
   * Get the direction to use to render the shadow map. In case of cube texture, the face index can be passed.
   * @param faceIndex The index of the face we are computed the direction to generate shadow
   * @returns The set direction in 2d mode otherwise the direction to the cubemap face if needCube() is true
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getShadowDirection(faceIndex) {
    return this.transformedDirection ? this.transformedDirection : this.direction;
  }
  /**
   * If computeTransformedInformation has been called, returns the ShadowLight absolute position in the world. Otherwise, returns the local position.
   * @returns the position vector in world space
   */
  getAbsolutePosition() {
    return this.transformedPosition ? this.transformedPosition : this.position;
  }
  /**
   * Sets the ShadowLight direction toward the passed target.
   * @param target The point to target in local space
   * @returns the updated ShadowLight direction
   */
  setDirectionToTarget(target) {
    this.direction = Vector3.Normalize(target.subtract(this.position));
    return this.direction;
  }
  /**
   * Returns the light rotation in euler definition.
   * @returns the x y z rotation in local space.
   */
  getRotation() {
    this.direction.normalize();
    const xaxis = Vector3.Cross(this.direction, Axis.Y);
    const yaxis = Vector3.Cross(xaxis, this.direction);
    return Vector3.RotationFromAxis(xaxis, yaxis, this.direction);
  }
  /**
   * Returns whether or not the shadow generation require a cube texture or a 2d texture.
   * @returns true if a cube texture needs to be use
   */
  needCube() {
    return false;
  }
  /**
   * Detects if the projection matrix requires to be recomputed this frame.
   * @returns true if it requires to be recomputed otherwise, false.
   */
  needProjectionMatrixCompute() {
    return this._needProjectionMatrixCompute;
  }
  /**
   * Forces the shadow generator to recompute the projection matrix even if position and direction did not changed.
   */
  forceProjectionMatrixCompute() {
    this._needProjectionMatrixCompute = true;
  }
  /** @internal */
  _initCache() {
    super._initCache();
    this._cache.position = Vector3.Zero();
  }
  /** @internal */
  _isSynchronized() {
    if (!this._cache.position.equals(this.position)) {
      return false;
    }
    return true;
  }
  /**
   * Computes the world matrix of the node
   * @param force defines if the cache version should be invalidated forcing the world matrix to be created from scratch
   * @returns the world matrix
   */
  computeWorldMatrix(force) {
    if (!force && this.isSynchronized()) {
      this._currentRenderId = this.getScene().getRenderId();
      return this._worldMatrix;
    }
    this._updateCache();
    this._cache.position.copyFrom(this.position);
    if (!this._worldMatrix) {
      this._worldMatrix = Matrix.Identity();
    }
    Matrix.TranslationToRef(this.position.x, this.position.y, this.position.z, this._worldMatrix);
    if (this.parent && this.parent.getWorldMatrix) {
      this._worldMatrix.multiplyToRef(this.parent.getWorldMatrix(), this._worldMatrix);
      this._markSyncedWithParent();
    }
    this._worldMatrixDeterminantIsDirty = true;
    return this._worldMatrix;
  }
  /**
   * Gets the minZ used for shadow according to both the scene and the light.
   * @param activeCamera The camera we are returning the min for
   * @returns the depth min z
   */
  getDepthMinZ(activeCamera) {
    return this.shadowMinZ !== void 0 ? this.shadowMinZ : (activeCamera == null ? void 0 : activeCamera.minZ) || 0;
  }
  /**
   * Gets the maxZ used for shadow according to both the scene and the light.
   * @param activeCamera The camera we are returning the max for
   * @returns the depth max z
   */
  getDepthMaxZ(activeCamera) {
    return this.shadowMaxZ !== void 0 ? this.shadowMaxZ : (activeCamera == null ? void 0 : activeCamera.maxZ) || 1e4;
  }
  /**
   * Sets the shadow projection matrix in parameter to the generated projection matrix.
   * @param matrix The matrix to updated with the projection information
   * @param viewMatrix The transform matrix of the light
   * @param renderList The list of mesh to render in the map
   * @returns The current light
   */
  setShadowProjectionMatrix(matrix, viewMatrix, renderList) {
    if (this.customProjectionMatrixBuilder) {
      this.customProjectionMatrixBuilder(viewMatrix, renderList, matrix);
    } else {
      this._setDefaultShadowProjectionMatrix(matrix, viewMatrix, renderList);
    }
    return this;
  }
  /** @internal */
  _syncParentEnabledState() {
    super._syncParentEnabledState();
    if (!this.parent || !this.parent.getWorldMatrix) {
      this.transformedPosition = null;
      this.transformedDirection = null;
    }
  }
  /**
   * Returns the view matrix.
   * @param faceIndex The index of the face for which we want to extract the view matrix. Only used for point light types.
   * @returns The view matrix. Can be null, if a view matrix cannot be defined for the type of light considered (as for a hemispherical light, for example).
   */
  getViewMatrix(faceIndex) {
    const lightDirection = TmpVectors.Vector3[0];
    let lightPosition = this.position;
    if (this.computeTransformedInformation()) {
      lightPosition = this.transformedPosition;
    }
    Vector3.NormalizeToRef(this.getShadowDirection(faceIndex), lightDirection);
    if (Math.abs(Vector3.Dot(lightDirection, Vector3.Up())) === 1) {
      lightDirection.z = 1e-13;
    }
    const lightTarget = TmpVectors.Vector3[1];
    lightPosition.addToRef(lightDirection, lightTarget);
    Matrix.LookAtLHToRef(lightPosition, lightTarget, Vector3.Up(), this._viewMatrix);
    return this._viewMatrix;
  }
  /**
   * Returns the projection matrix.
   * Note that viewMatrix and renderList are optional and are only used by lights that calculate the projection matrix from a list of meshes (e.g. directional lights with automatic extents calculation).
   * @param viewMatrix The view transform matrix of the light (optional).
   * @param renderList The list of meshes to take into account when calculating the projection matrix (optional).
   * @returns The projection matrix. Can be null, if a projection matrix cannot be defined for the type of light considered (as for a hemispherical light, for example).
   */
  getProjectionMatrix(viewMatrix, renderList) {
    this.setShadowProjectionMatrix(this._projectionMatrix, viewMatrix ?? this._viewMatrix, renderList ?? []);
    return this._projectionMatrix;
  }
}
__decorate([
  serializeAsVector3()
], ShadowLight.prototype, "position", null);
__decorate([
  serializeAsVector3()
], ShadowLight.prototype, "direction", null);
__decorate([
  serialize()
], ShadowLight.prototype, "shadowMinZ", null);
__decorate([
  serialize()
], ShadowLight.prototype, "shadowMaxZ", null);
Node.AddNodeConstructor("Light_Type_2", (name, scene) => {
  return () => new SpotLight(name, Vector3.Zero(), Vector3.Zero(), 0, 0, scene);
});
class SpotLight extends ShadowLight {
  /**
   * Gets or sets the IES profile texture used to create the spotlight
   * @see https://playground.babylonjs.com/#UIAXAU#1
   */
  get iesProfileTexture() {
    return this._iesProfileTexture;
  }
  set iesProfileTexture(value) {
    if (this._iesProfileTexture === value) {
      return;
    }
    this._iesProfileTexture = value;
    if (this._iesProfileTexture && SpotLight._IsTexture(this._iesProfileTexture)) {
      this._iesProfileTexture.onLoadObservable.addOnce(() => {
        this._markMeshesAsLightDirty();
      });
    }
  }
  /**
   * Gets the cone angle of the spot light in Radians.
   */
  get angle() {
    return this._angle;
  }
  /**
   * Sets the cone angle of the spot light in Radians.
   */
  set angle(value) {
    this._angle = value;
    this._cosHalfAngle = Math.cos(value * 0.5);
    this._projectionTextureProjectionLightDirty = true;
    this.forceProjectionMatrixCompute();
    this._computeAngleValues();
  }
  /**
   * Only used in gltf falloff mode, this defines the angle where
   * the directional falloff will start before cutting at angle which could be seen
   * as outer angle.
   */
  get innerAngle() {
    return this._innerAngle;
  }
  /**
   * Only used in gltf falloff mode, this defines the angle where
   * the directional falloff will start before cutting at angle which could be seen
   * as outer angle.
   */
  set innerAngle(value) {
    this._innerAngle = value;
    this._computeAngleValues();
  }
  /**
   * Allows scaling the angle of the light for shadow generation only.
   */
  get shadowAngleScale() {
    return this._shadowAngleScale;
  }
  /**
   * Allows scaling the angle of the light for shadow generation only.
   */
  set shadowAngleScale(value) {
    this._shadowAngleScale = value;
    this.forceProjectionMatrixCompute();
  }
  /**
   * Allows reading the projection texture
   */
  get projectionTextureMatrix() {
    return this._projectionTextureMatrix;
  }
  /**
   * Gets the near clip of the Spotlight for texture projection.
   */
  get projectionTextureLightNear() {
    return this._projectionTextureLightNear;
  }
  /**
   * Sets the near clip of the Spotlight for texture projection.
   */
  set projectionTextureLightNear(value) {
    this._projectionTextureLightNear = value;
    this._projectionTextureProjectionLightDirty = true;
  }
  /**
   * Gets the far clip of the Spotlight for texture projection.
   */
  get projectionTextureLightFar() {
    return this._projectionTextureLightFar;
  }
  /**
   * Sets the far clip of the Spotlight for texture projection.
   */
  set projectionTextureLightFar(value) {
    this._projectionTextureLightFar = value;
    this._projectionTextureProjectionLightDirty = true;
  }
  /**
   * Gets the Up vector of the Spotlight for texture projection.
   */
  get projectionTextureUpDirection() {
    return this._projectionTextureUpDirection;
  }
  /**
   * Sets the Up vector of the Spotlight for texture projection.
   */
  set projectionTextureUpDirection(value) {
    this._projectionTextureUpDirection = value;
    this._projectionTextureProjectionLightDirty = true;
  }
  /**
   * Gets the projection texture of the light.
   */
  get projectionTexture() {
    return this._projectionTexture;
  }
  /**
   * Sets the projection texture of the light.
   */
  set projectionTexture(value) {
    if (this._projectionTexture === value) {
      return;
    }
    this._projectionTexture = value;
    this._projectionTextureDirty = true;
    if (this._projectionTexture && !this._projectionTexture.isReady()) {
      if (SpotLight._IsProceduralTexture(this._projectionTexture)) {
        this._projectionTexture.getEffect().executeWhenCompiled(() => {
          this._markMeshesAsLightDirty();
        });
      } else if (SpotLight._IsTexture(this._projectionTexture)) {
        this._projectionTexture.onLoadObservable.addOnce(() => {
          this._markMeshesAsLightDirty();
        });
      }
    }
  }
  static _IsProceduralTexture(texture) {
    return texture.onGeneratedObservable !== void 0;
  }
  static _IsTexture(texture) {
    return texture.onLoadObservable !== void 0;
  }
  /**
   * Gets or sets the light projection matrix as used by the projection texture
   */
  get projectionTextureProjectionLightMatrix() {
    return this._projectionTextureProjectionLightMatrix;
  }
  set projectionTextureProjectionLightMatrix(projection) {
    this._projectionTextureProjectionLightMatrix = projection;
    this._projectionTextureProjectionLightDirty = false;
    this._projectionTextureDirty = true;
  }
  /**
   * Creates a SpotLight object in the scene. A spot light is a simply light oriented cone.
   * It can cast shadows.
   * Documentation : https://doc.babylonjs.com/features/featuresDeepDive/lights/lights_introduction
   * @param name The light friendly name
   * @param position The position of the spot light in the scene
   * @param direction The direction of the light in the scene
   * @param angle The cone angle of the light in Radians
   * @param exponent The light decay speed with the distance from the emission spot
   * @param scene The scene the lights belongs to
   */
  constructor(name, position, direction, angle, exponent, scene) {
    super(name, scene);
    this._innerAngle = 0;
    this._iesProfileTexture = null;
    this._projectionTextureMatrix = Matrix.Zero();
    this._projectionTextureLightNear = 1e-6;
    this._projectionTextureLightFar = 1e3;
    this._projectionTextureUpDirection = Vector3.Up();
    this._projectionTextureViewLightDirty = true;
    this._projectionTextureProjectionLightDirty = true;
    this._projectionTextureDirty = true;
    this._projectionTextureViewTargetVector = Vector3.Zero();
    this._projectionTextureViewLightMatrix = Matrix.Zero();
    this._projectionTextureProjectionLightMatrix = Matrix.Zero();
    this._projectionTextureScalingMatrix = Matrix.FromValues(0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5, 0, 0.5, 0.5, 0.5, 1);
    this.position = position;
    this.direction = direction;
    this.angle = angle;
    this.exponent = exponent;
  }
  /**
   * Returns the string "SpotLight".
   * @returns the class name
   */
  getClassName() {
    return "SpotLight";
  }
  /**
   * Returns the integer 2.
   * @returns The light Type id as a constant defines in Light.LIGHTTYPEID_x
   */
  getTypeID() {
    return Light.LIGHTTYPEID_SPOTLIGHT;
  }
  /**
   * Overrides the direction setter to recompute the projection texture view light Matrix.
   * @param value
   */
  _setDirection(value) {
    super._setDirection(value);
    this._projectionTextureViewLightDirty = true;
  }
  /**
   * Overrides the position setter to recompute the projection texture view light Matrix.
   * @param value
   */
  _setPosition(value) {
    super._setPosition(value);
    this._projectionTextureViewLightDirty = true;
  }
  /**
   * Sets the passed matrix "matrix" as perspective projection matrix for the shadows and the passed view matrix with the fov equal to the SpotLight angle and and aspect ratio of 1.0.
   * Returns the SpotLight.
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
    this._shadowAngleScale = this._shadowAngleScale || 1;
    const angle = this._shadowAngleScale * this._angle;
    const minZ = this.shadowMinZ !== void 0 ? this.shadowMinZ : activeCamera.minZ;
    const maxZ = this.shadowMaxZ !== void 0 ? this.shadowMaxZ : activeCamera.maxZ;
    const useReverseDepthBuffer = this.getScene().getEngine().useReverseDepthBuffer;
    Matrix.PerspectiveFovLHToRef(angle, 1, useReverseDepthBuffer ? maxZ : minZ, useReverseDepthBuffer ? minZ : maxZ, matrix, true, this._scene.getEngine().isNDCHalfZRange, void 0, useReverseDepthBuffer);
  }
  _computeProjectionTextureViewLightMatrix() {
    this._projectionTextureViewLightDirty = false;
    this._projectionTextureDirty = true;
    this.getAbsolutePosition().addToRef(this.getShadowDirection(), this._projectionTextureViewTargetVector);
    Matrix.LookAtLHToRef(this.getAbsolutePosition(), this._projectionTextureViewTargetVector, this._projectionTextureUpDirection, this._projectionTextureViewLightMatrix);
  }
  _computeProjectionTextureProjectionLightMatrix() {
    this._projectionTextureProjectionLightDirty = false;
    this._projectionTextureDirty = true;
    const lightFar = this.projectionTextureLightFar;
    const lightNear = this.projectionTextureLightNear;
    const P = lightFar / (lightFar - lightNear);
    const Q = -P * lightNear;
    const S = 1 / Math.tan(this._angle / 2);
    const A = 1;
    Matrix.FromValuesToRef(S / A, 0, 0, 0, 0, S, 0, 0, 0, 0, P, 1, 0, 0, Q, 0, this._projectionTextureProjectionLightMatrix);
  }
  /**
   * Main function for light texture projection matrix computing.
   */
  _computeProjectionTextureMatrix() {
    this._projectionTextureDirty = false;
    this._projectionTextureViewLightMatrix.multiplyToRef(this._projectionTextureProjectionLightMatrix, this._projectionTextureMatrix);
    if (this._projectionTexture instanceof Texture) {
      const u = this._projectionTexture.uScale / 2;
      const v = this._projectionTexture.vScale / 2;
      Matrix.FromValuesToRef(u, 0, 0, 0, 0, v, 0, 0, 0, 0, 0.5, 0, 0.5, 0.5, 0.5, 1, this._projectionTextureScalingMatrix);
    }
    this._projectionTextureMatrix.multiplyToRef(this._projectionTextureScalingMatrix, this._projectionTextureMatrix);
  }
  _buildUniformLayout() {
    this._uniformBuffer.addUniform("vLightData", 4);
    this._uniformBuffer.addUniform("vLightDiffuse", 4);
    this._uniformBuffer.addUniform("vLightSpecular", 4);
    this._uniformBuffer.addUniform("vLightDirection", 3);
    this._uniformBuffer.addUniform("vLightFalloff", 4);
    this._uniformBuffer.addUniform("shadowsInfo", 3);
    this._uniformBuffer.addUniform("depthValues", 2);
    this._uniformBuffer.create();
  }
  _computeAngleValues() {
    this._lightAngleScale = 1 / Math.max(1e-3, Math.cos(this._innerAngle * 0.5) - this._cosHalfAngle);
    this._lightAngleOffset = -this._cosHalfAngle * this._lightAngleScale;
  }
  /**
   * Sets the passed Effect "effect" with the Light textures.
   * @param effect The effect to update
   * @param lightIndex The index of the light in the effect to update
   * @returns The light
   */
  transferTexturesToEffect(effect, lightIndex) {
    if (this.projectionTexture && this.projectionTexture.isReady()) {
      if (this._projectionTextureViewLightDirty) {
        this._computeProjectionTextureViewLightMatrix();
      }
      if (this._projectionTextureProjectionLightDirty) {
        this._computeProjectionTextureProjectionLightMatrix();
      }
      if (this._projectionTextureDirty) {
        this._computeProjectionTextureMatrix();
      }
      effect.setMatrix("textureProjectionMatrix" + lightIndex, this._projectionTextureMatrix);
      effect.setTexture("projectionLightTexture" + lightIndex, this.projectionTexture);
    }
    if (this._iesProfileTexture && this._iesProfileTexture.isReady()) {
      effect.setTexture("iesLightTexture" + lightIndex, this._iesProfileTexture);
    }
    return this;
  }
  /**
   * Sets the passed Effect object with the SpotLight transformed position (or position if not parented) and normalized direction.
   * @param effect The effect to update
   * @param lightIndex The index of the light in the effect to update
   * @returns The spot light
   */
  transferToEffect(effect, lightIndex) {
    let normalizeDirection;
    if (this.computeTransformedInformation()) {
      this._uniformBuffer.updateFloat4("vLightData", this.transformedPosition.x, this.transformedPosition.y, this.transformedPosition.z, this.exponent, lightIndex);
      normalizeDirection = Vector3.Normalize(this.transformedDirection);
    } else {
      this._uniformBuffer.updateFloat4("vLightData", this.position.x, this.position.y, this.position.z, this.exponent, lightIndex);
      normalizeDirection = Vector3.Normalize(this.direction);
    }
    this._uniformBuffer.updateFloat4("vLightDirection", normalizeDirection.x, normalizeDirection.y, normalizeDirection.z, this._cosHalfAngle, lightIndex);
    this._uniformBuffer.updateFloat4("vLightFalloff", this.range, this._inverseSquaredRange, this._lightAngleScale, this._lightAngleOffset, lightIndex);
    return this;
  }
  transferToNodeMaterialEffect(effect, lightDataUniformName) {
    let normalizeDirection;
    if (this.computeTransformedInformation()) {
      normalizeDirection = Vector3.Normalize(this.transformedDirection);
    } else {
      normalizeDirection = Vector3.Normalize(this.direction);
    }
    if (this.getScene().useRightHandedSystem) {
      effect.setFloat3(lightDataUniformName, -normalizeDirection.x, -normalizeDirection.y, -normalizeDirection.z);
    } else {
      effect.setFloat3(lightDataUniformName, normalizeDirection.x, normalizeDirection.y, normalizeDirection.z);
    }
    return this;
  }
  /**
   * Disposes the light and the associated resources.
   */
  dispose() {
    super.dispose();
    if (this._projectionTexture) {
      this._projectionTexture.dispose();
    }
    if (this._iesProfileTexture) {
      this._iesProfileTexture.dispose();
      this._iesProfileTexture = null;
    }
  }
  /**
   * Gets the minZ used for shadow according to both the scene and the light.
   * @param activeCamera The camera we are returning the min for
   * @returns the depth min z
   */
  getDepthMinZ(activeCamera) {
    const engine = this._scene.getEngine();
    const minZ = this.shadowMinZ !== void 0 ? this.shadowMinZ : (activeCamera == null ? void 0 : activeCamera.minZ) ?? 0;
    return engine.useReverseDepthBuffer && engine.isNDCHalfZRange ? minZ : this._scene.getEngine().isNDCHalfZRange ? 0 : minZ;
  }
  /**
   * Gets the maxZ used for shadow according to both the scene and the light.
   * @param activeCamera The camera we are returning the max for
   * @returns the depth max z
   */
  getDepthMaxZ(activeCamera) {
    const engine = this._scene.getEngine();
    const maxZ = this.shadowMaxZ !== void 0 ? this.shadowMaxZ : (activeCamera == null ? void 0 : activeCamera.maxZ) ?? 1e4;
    return engine.useReverseDepthBuffer && engine.isNDCHalfZRange ? 0 : maxZ;
  }
  /**
   * Prepares the list of defines specific to the light type.
   * @param defines the list of defines
   * @param lightIndex defines the index of the light for the effect
   */
  prepareLightSpecificDefines(defines, lightIndex) {
    defines["SPOTLIGHT" + lightIndex] = true;
    defines["PROJECTEDLIGHTTEXTURE" + lightIndex] = this.projectionTexture && this.projectionTexture.isReady() ? true : false;
    defines["IESLIGHTTEXTURE" + lightIndex] = this._iesProfileTexture && this._iesProfileTexture.isReady() ? true : false;
  }
}
__decorate([
  serialize()
], SpotLight.prototype, "angle", null);
__decorate([
  serialize()
], SpotLight.prototype, "innerAngle", null);
__decorate([
  serialize()
], SpotLight.prototype, "shadowAngleScale", null);
__decorate([
  serialize()
], SpotLight.prototype, "exponent", void 0);
__decorate([
  serialize()
], SpotLight.prototype, "projectionTextureLightNear", null);
__decorate([
  serialize()
], SpotLight.prototype, "projectionTextureLightFar", null);
__decorate([
  serialize()
], SpotLight.prototype, "projectionTextureUpDirection", null);
__decorate([
  serializeAsTexture("projectedLightTexture")
], SpotLight.prototype, "_projectionTexture", void 0);
RegisterClass("BABYLON.SpotLight", SpotLight);
class GLTFPathToObjectConverter {
  constructor(_gltf, _infoTree) {
    this._gltf = _gltf;
    this._infoTree = _infoTree;
  }
  /**
   * The pointer string is represented by a [JSON pointer](https://datatracker.ietf.org/doc/html/rfc6901).
   * See also https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/ObjectModel.adoc#core-pointers
   * <animationPointer> := /<rootNode>/<assetIndex>/<propertyPath>
   * <rootNode> := "nodes" | "materials" | "meshes" | "cameras" | "extensions"
   * <assetIndex> := <digit> | <name>
   * <propertyPath> := <extensionPath> | <standardPath>
   * <extensionPath> := "extensions"/<name>/<standardPath>
   * <standardPath> := <name> | <name>/<standardPath>
   * <name> := W+
   * <digit> := D+
   *
   * Examples:
   *  - "/nodes/0/rotation"
   * - "/nodes.length"
   *  - "/materials/2/emissiveFactor"
   *  - "/materials/2/pbrMetallicRoughness/baseColorFactor"
   *  - "/materials/2/extensions/KHR_materials_emissive_strength/emissiveStrength"
   *
   * @param path The path to convert
   * @returns The object and info associated with the path
   */
  convert(path) {
    let objectTree = this._gltf;
    let infoTree = this._infoTree;
    let target = void 0;
    if (!path.startsWith("/")) {
      throw new Error("Path must start with a /");
    }
    const parts = path.split("/");
    parts.shift();
    if (parts[parts.length - 1].includes(".length")) {
      const lastPart = parts[parts.length - 1];
      const split = lastPart.split(".");
      parts.pop();
      parts.push(...split);
    }
    let ignoreObjectTree = false;
    for (const part of parts) {
      const isLength = part === "length";
      if (isLength && !infoTree.__array__) {
        throw new Error(`Path ${path} is invalid`);
      }
      if (infoTree.__ignoreObjectTree__) {
        ignoreObjectTree = true;
      }
      if (infoTree.__array__ && !isLength) {
        infoTree = infoTree.__array__;
      } else {
        infoTree = infoTree[part];
        if (!infoTree) {
          throw new Error(`Path ${path} is invalid`);
        }
      }
      if (!ignoreObjectTree) {
        if (objectTree === void 0) {
          throw new Error(`Path ${path} is invalid`);
        }
        if (!isLength) {
          objectTree = objectTree == null ? void 0 : objectTree[part];
        }
      }
      if (infoTree.__target__ || isLength) {
        target = objectTree;
      }
    }
    return {
      object: target,
      info: infoTree
    };
  }
}
const nodesTree = {
  length: {
    type: "number",
    get: (nodes) => nodes.length,
    getTarget: (nodes) => nodes.map((node) => node._babylonTransformNode),
    getPropertyName: [() => "length"]
  },
  __array__: {
    __target__: true,
    translation: {
      type: "Vector3",
      get: (node) => {
        var _a;
        return (_a = node._babylonTransformNode) == null ? void 0 : _a.position;
      },
      set: (value, node) => {
        var _a;
        return (_a = node._babylonTransformNode) == null ? void 0 : _a.position.copyFrom(value);
      },
      getTarget: (node) => node._babylonTransformNode,
      getPropertyName: [() => "position"]
    },
    rotation: {
      type: "Quaternion",
      get: (node) => {
        var _a;
        return (_a = node._babylonTransformNode) == null ? void 0 : _a.rotationQuaternion;
      },
      set: (value, node) => {
        var _a, _b;
        return (_b = (_a = node._babylonTransformNode) == null ? void 0 : _a.rotationQuaternion) == null ? void 0 : _b.copyFrom(value);
      },
      getTarget: (node) => node._babylonTransformNode,
      getPropertyName: [() => "rotationQuaternion"]
    },
    scale: {
      type: "Vector3",
      get: (node) => {
        var _a;
        return (_a = node._babylonTransformNode) == null ? void 0 : _a.scaling;
      },
      set: (value, node) => {
        var _a;
        return (_a = node._babylonTransformNode) == null ? void 0 : _a.scaling.copyFrom(value);
      },
      getTarget: (node) => node._babylonTransformNode,
      getPropertyName: [() => "scaling"]
    },
    weights: {
      length: {
        type: "number",
        get: (node) => node._numMorphTargets,
        getTarget: (node) => node._babylonTransformNode,
        getPropertyName: [() => "influence"]
      },
      __array__: {
        __target__: true,
        type: "number",
        get: (node, index) => {
          var _a, _b;
          return index !== void 0 ? (_b = (_a = node._primitiveBabylonMeshes) == null ? void 0 : _a[0].morphTargetManager) == null ? void 0 : _b.getTarget(index).influence : void 0;
        },
        // set: (value: number, node: INode, index?: number) => node._babylonTransformNode?.getMorphTargetManager()?.getTarget(index)?.setInfluence(value),
        getTarget: (node) => node._babylonTransformNode,
        getPropertyName: [() => "influence"]
      },
      type: "number[]",
      get: (node, index) => [0],
      // TODO: get the weights correctly
      // set: (value: number, node: INode, index?: number) => node._babylonTransformNode?.getMorphTargetManager()?.getTarget(index)?.setInfluence(value),
      getTarget: (node) => node._babylonTransformNode,
      getPropertyName: [() => "influence"]
    },
    // readonly!
    matrix: {
      type: "Matrix",
      get: (node) => {
        var _a, _b, _c;
        return Matrix.Compose((_a = node._babylonTransformNode) == null ? void 0 : _a.scaling, (_b = node._babylonTransformNode) == null ? void 0 : _b.rotationQuaternion, (_c = node._babylonTransformNode) == null ? void 0 : _c.position);
      },
      getTarget: (node) => node._babylonTransformNode,
      isReadOnly: true
    },
    globalMatrix: {
      type: "Matrix",
      get: (node) => {
        var _a, _b, _c, _d, _e, _f, _g;
        const matrix = Matrix.Identity();
        let rootNode = node.parent;
        while (rootNode && rootNode.parent) {
          rootNode = rootNode.parent;
        }
        const forceUpdate = ((_a = node._babylonTransformNode) == null ? void 0 : _a.position._isDirty) || ((_c = (_b = node._babylonTransformNode) == null ? void 0 : _b.rotationQuaternion) == null ? void 0 : _c._isDirty) || ((_d = node._babylonTransformNode) == null ? void 0 : _d.scaling._isDirty);
        if (rootNode) {
          const rootMatrix = (_e = rootNode._babylonTransformNode) == null ? void 0 : _e.computeWorldMatrix(true).invert();
          if (rootMatrix) {
            (_g = (_f = node._babylonTransformNode) == null ? void 0 : _f.computeWorldMatrix(forceUpdate)) == null ? void 0 : _g.multiplyToRef(rootMatrix, matrix);
          }
        } else if (node._babylonTransformNode) {
          matrix.copyFrom(node._babylonTransformNode.computeWorldMatrix(forceUpdate));
        }
        return matrix;
      },
      getTarget: (node) => node._babylonTransformNode,
      isReadOnly: true
    },
    extensions: {
      EXT_lights_ies: {
        multiplier: {
          type: "number",
          get: (node) => {
            var _a, _b;
            return (_b = (_a = node._babylonTransformNode) == null ? void 0 : _a.getChildren((child) => child instanceof SpotLight, true)[0]) == null ? void 0 : _b.intensity;
          },
          getTarget: (node) => {
            var _a;
            return (_a = node._babylonTransformNode) == null ? void 0 : _a.getChildren((child) => child instanceof SpotLight, true)[0];
          },
          set: (value, node) => {
            if (node._babylonTransformNode) {
              const light = node._babylonTransformNode.getChildren((child) => child instanceof SpotLight, true)[0];
              if (light) {
                light.intensity = value;
              }
            }
          }
        },
        color: {
          type: "Color3",
          get: (node) => {
            var _a, _b;
            return (_b = (_a = node._babylonTransformNode) == null ? void 0 : _a.getChildren((child) => child instanceof SpotLight, true)[0]) == null ? void 0 : _b.diffuse;
          },
          getTarget: (node) => {
            var _a;
            return (_a = node._babylonTransformNode) == null ? void 0 : _a.getChildren((child) => child instanceof SpotLight, true)[0];
          },
          set: (value, node) => {
            if (node._babylonTransformNode) {
              const light = node._babylonTransformNode.getChildren((child) => child instanceof SpotLight, true)[0];
              if (light) {
                light.diffuse = value;
              }
            }
          }
        }
      }
    }
  }
};
const animationsTree = {
  length: {
    type: "number",
    get: (animations) => animations.length,
    getTarget: (animations) => animations.map((animation) => animation._babylonAnimationGroup),
    getPropertyName: [() => "length"]
  },
  __array__: {}
};
const meshesTree = {
  length: {
    type: "number",
    get: (meshes) => meshes.length,
    getTarget: (meshes) => meshes.map((mesh) => {
      var _a;
      return (_a = mesh.primitives[0]._instanceData) == null ? void 0 : _a.babylonSourceMesh;
    }),
    getPropertyName: [() => "length"]
  },
  __array__: {}
};
const camerasTree = {
  __array__: {
    __target__: true,
    orthographic: {
      xmag: {
        componentsCount: 2,
        type: "Vector2",
        get: (camera) => {
          var _a, _b;
          return new Vector2(((_a = camera._babylonCamera) == null ? void 0 : _a.orthoLeft) ?? 0, ((_b = camera._babylonCamera) == null ? void 0 : _b.orthoRight) ?? 0);
        },
        set: (value, camera) => {
          if (camera._babylonCamera) {
            camera._babylonCamera.orthoLeft = value.x;
            camera._babylonCamera.orthoRight = value.y;
          }
        },
        getTarget: (camera) => camera,
        getPropertyName: [() => "orthoLeft", () => "orthoRight"]
      },
      ymag: {
        componentsCount: 2,
        type: "Vector2",
        get: (camera) => {
          var _a, _b;
          return new Vector2(((_a = camera._babylonCamera) == null ? void 0 : _a.orthoBottom) ?? 0, ((_b = camera._babylonCamera) == null ? void 0 : _b.orthoTop) ?? 0);
        },
        set: (value, camera) => {
          if (camera._babylonCamera) {
            camera._babylonCamera.orthoBottom = value.x;
            camera._babylonCamera.orthoTop = value.y;
          }
        },
        getTarget: (camera) => camera,
        getPropertyName: [() => "orthoBottom", () => "orthoTop"]
      },
      zfar: {
        type: "number",
        get: (camera) => {
          var _a;
          return (_a = camera._babylonCamera) == null ? void 0 : _a.maxZ;
        },
        set: (value, camera) => {
          if (camera._babylonCamera) {
            camera._babylonCamera.maxZ = value;
          }
        },
        getTarget: (camera) => camera,
        getPropertyName: [() => "maxZ"]
      },
      znear: {
        type: "number",
        get: (camera) => {
          var _a;
          return (_a = camera._babylonCamera) == null ? void 0 : _a.minZ;
        },
        set: (value, camera) => {
          if (camera._babylonCamera) {
            camera._babylonCamera.minZ = value;
          }
        },
        getTarget: (camera) => camera,
        getPropertyName: [() => "minZ"]
      }
    },
    perspective: {
      aspectRatio: {
        type: "number",
        get: (camera) => {
          var _a;
          return (_a = camera._babylonCamera) == null ? void 0 : _a.getEngine().getAspectRatio(camera._babylonCamera);
        },
        getTarget: (camera) => camera,
        getPropertyName: [() => "aspectRatio"],
        isReadOnly: true
        // might not be the case for glTF?
      },
      yfov: {
        type: "number",
        get: (camera) => {
          var _a;
          return (_a = camera._babylonCamera) == null ? void 0 : _a.fov;
        },
        set: (value, camera) => {
          if (camera._babylonCamera) {
            camera._babylonCamera.fov = value;
          }
        },
        getTarget: (camera) => camera,
        getPropertyName: [() => "fov"]
      },
      zfar: {
        type: "number",
        get: (camera) => {
          var _a;
          return (_a = camera._babylonCamera) == null ? void 0 : _a.maxZ;
        },
        set: (value, camera) => {
          if (camera._babylonCamera) {
            camera._babylonCamera.maxZ = value;
          }
        },
        getTarget: (camera) => camera,
        getPropertyName: [() => "maxZ"]
      },
      znear: {
        type: "number",
        get: (camera) => {
          var _a;
          return (_a = camera._babylonCamera) == null ? void 0 : _a.minZ;
        },
        set: (value, camera) => {
          if (camera._babylonCamera) {
            camera._babylonCamera.minZ = value;
          }
        },
        getTarget: (camera) => camera,
        getPropertyName: [() => "minZ"]
      }
    }
  }
};
const materialsTree = {
  __array__: {
    __target__: true,
    emissiveFactor: {
      type: "Color3",
      get: (material, index, payload) => _GetMaterial(material, index, payload).emissiveColor,
      set: (value, material, index, payload) => _GetMaterial(material, index, payload).emissiveColor.copyFrom(value),
      getTarget: (material, index, payload) => _GetMaterial(material, index, payload),
      getPropertyName: [() => "emissiveColor"]
    },
    emissiveTexture: {
      extensions: {
        KHR_texture_transform: _GenerateTextureMap("emissiveTexture")
      }
    },
    normalTexture: {
      scale: {
        type: "number",
        get: (material, index, payload) => {
          var _a;
          return (_a = _GetTexture(material, payload, "bumpTexture")) == null ? void 0 : _a.level;
        },
        set: (value, material, index, payload) => {
          const texture = _GetTexture(material, payload, "bumpTexture");
          if (texture) {
            texture.level = value;
          }
        },
        getTarget: (material, index, payload) => _GetMaterial(material, index, payload),
        getPropertyName: [() => "level"]
      },
      extensions: {
        KHR_texture_transform: _GenerateTextureMap("bumpTexture")
      }
    },
    occlusionTexture: {
      strength: {
        type: "number",
        get: (material, index, payload) => _GetMaterial(material, index, payload).ambientTextureStrength,
        set: (value, material, index, payload) => {
          const mat = _GetMaterial(material, index, payload);
          if (mat) {
            mat.ambientTextureStrength = value;
          }
        },
        getTarget: (material, index, payload) => _GetMaterial(material, index, payload),
        getPropertyName: [() => "ambientTextureStrength"]
      },
      extensions: {
        KHR_texture_transform: _GenerateTextureMap("ambientTexture")
      }
    },
    pbrMetallicRoughness: {
      baseColorFactor: {
        type: "Color4",
        get: (material, index, payload) => {
          const mat = _GetMaterial(material, index, payload);
          return Color4.FromColor3(mat.albedoColor, mat.alpha);
        },
        set: (value, material, index, payload) => {
          const mat = _GetMaterial(material, index, payload);
          mat.albedoColor.set(value.r, value.g, value.b);
          mat.alpha = value.a;
        },
        getTarget: (material, index, payload) => _GetMaterial(material, index, payload),
        // This is correct on the animation level, but incorrect as a single property of a type Color4
        getPropertyName: [() => "albedoColor", () => "alpha"]
      },
      baseColorTexture: {
        extensions: {
          KHR_texture_transform: _GenerateTextureMap("albedoTexture")
        }
      },
      metallicFactor: {
        type: "number",
        get: (material, index, payload) => _GetMaterial(material, index, payload).metallic,
        set: (value, material, index, payload) => {
          const mat = _GetMaterial(material, index, payload);
          if (mat) {
            mat.metallic = value;
          }
        },
        getTarget: (material, index, payload) => _GetMaterial(material, index, payload),
        getPropertyName: [() => "metallic"]
      },
      roughnessFactor: {
        type: "number",
        get: (material, index, payload) => _GetMaterial(material, index, payload).roughness,
        set: (value, material, index, payload) => {
          const mat = _GetMaterial(material, index, payload);
          if (mat) {
            mat.roughness = value;
          }
        },
        getTarget: (material, index, payload) => _GetMaterial(material, index, payload),
        getPropertyName: [() => "roughness"]
      },
      metallicRoughnessTexture: {
        extensions: {
          KHR_texture_transform: _GenerateTextureMap("metallicTexture")
        }
      }
    },
    extensions: {
      KHR_materials_anisotropy: {
        anisotropyStrength: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).anisotropy.intensity,
          set: (value, material, index, payload) => {
            _GetMaterial(material, index, payload).anisotropy.intensity = value;
          },
          getTarget: (material, index, payload) => _GetMaterial(material, index, payload),
          getPropertyName: [() => "anisotropy.intensity"]
        },
        anisotropyRotation: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).anisotropy.angle,
          set: (value, material, index, payload) => {
            _GetMaterial(material, index, payload).anisotropy.angle = value;
          },
          getTarget: (material, index, payload) => _GetMaterial(material, index, payload),
          getPropertyName: [() => "anisotropy.angle"]
        },
        anisotropyTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("anisotropy", "texture")
          }
        }
      },
      KHR_materials_clearcoat: {
        clearcoatFactor: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).clearCoat.intensity,
          set: (value, material, index, payload) => {
            _GetMaterial(material, index, payload).clearCoat.intensity = value;
          },
          getTarget: (material, index, payload) => _GetMaterial(material, index, payload),
          getPropertyName: [() => "clearCoat.intensity"]
        },
        clearcoatRoughnessFactor: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).clearCoat.roughness,
          set: (value, material, index, payload) => {
            _GetMaterial(material, index, payload).clearCoat.roughness = value;
          },
          getTarget: (material, index, payload) => _GetMaterial(material, index, payload),
          getPropertyName: [() => "clearCoat.roughness"]
        },
        clearcoatTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("clearCoat", "texture")
          }
        },
        clearcoatNormalTexture: {
          scale: {
            type: "number",
            get: (material, index, payload) => {
              var _a;
              return (_a = _GetMaterial(material, index, payload).clearCoat.bumpTexture) == null ? void 0 : _a.level;
            },
            getTarget: _GetMaterial,
            set: (value, material, index, payload) => _GetMaterial(material, index, payload).clearCoat.bumpTexture.level = value
          },
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("clearCoat", "bumpTexture")
          }
        },
        clearcoatRoughnessTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("clearCoat", "textureRoughness")
          }
        }
      },
      KHR_materials_dispersion: {
        dispersion: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).subSurface.dispersion,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).subSurface.dispersion = value
        }
      },
      KHR_materials_emissive_strength: {
        emissiveStrength: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).emissiveIntensity,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).emissiveIntensity = value
        }
      },
      KHR_materials_ior: {
        ior: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).indexOfRefraction,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).indexOfRefraction = value
        }
      },
      KHR_materials_iridescence: {
        iridescenceFactor: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).iridescence.intensity,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).iridescence.intensity = value
        },
        iridescenceIor: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).iridescence.indexOfRefraction,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).iridescence.indexOfRefraction = value
        },
        iridescenceTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("iridescence", "texture")
          }
        },
        iridescenceThicknessMaximum: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).iridescence.maximumThickness,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).iridescence.maximumThickness = value
        },
        iridescenceThicknessMinimum: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).iridescence.minimumThickness,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).iridescence.minimumThickness = value
        },
        iridescenceThicknessTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("iridescence", "thicknessTexture")
          }
        }
      },
      KHR_materials_sheen: {
        sheenColorFactor: {
          type: "Color3",
          get: (material, index, payload) => _GetMaterial(material, index, payload).sheen.color,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).sheen.color.copyFrom(value)
        },
        sheenColorTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("sheen", "texture")
          }
        },
        sheenRoughnessFactor: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).sheen.intensity,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).sheen.intensity = value
        },
        sheenRoughnessTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("sheen", "thicknessTexture")
          }
        }
      },
      KHR_materials_specular: {
        specularFactor: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).metallicF0Factor,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).metallicF0Factor = value,
          getPropertyName: [() => "metallicF0Factor"]
        },
        specularColorFactor: {
          type: "Color3",
          get: (material, index, payload) => _GetMaterial(material, index, payload).metallicReflectanceColor,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).metallicReflectanceColor.copyFrom(value),
          getPropertyName: [() => "metallicReflectanceColor"]
        },
        specularTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("metallicReflectanceTexture")
          }
        },
        specularColorTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("reflectanceTexture")
          }
        }
      },
      KHR_materials_transmission: {
        transmissionFactor: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).subSurface.refractionIntensity,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).subSurface.refractionIntensity = value,
          getPropertyName: [() => "subSurface.refractionIntensity"]
        },
        transmissionTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("subSurface", "refractionIntensityTexture")
          }
        }
      },
      KHR_materials_diffuse_transmission: {
        diffuseTransmissionFactor: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).subSurface.translucencyIntensity,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).subSurface.translucencyIntensity = value
        },
        diffuseTransmissionTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("subSurface", "translucencyIntensityTexture")
          }
        },
        diffuseTransmissionColorFactor: {
          type: "Color3",
          get: (material, index, payload) => _GetMaterial(material, index, payload).subSurface.translucencyColor,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => {
            var _a;
            return value && ((_a = _GetMaterial(material, index, payload).subSurface.translucencyColor) == null ? void 0 : _a.copyFrom(value));
          }
        },
        diffuseTransmissionColorTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("subSurface", "translucencyColorTexture")
          }
        }
      },
      KHR_materials_volume: {
        attenuationColor: {
          type: "Color3",
          get: (material, index, payload) => _GetMaterial(material, index, payload).subSurface.tintColor,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).subSurface.tintColor.copyFrom(value)
        },
        attenuationDistance: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).subSurface.tintColorAtDistance,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).subSurface.tintColorAtDistance = value
        },
        thicknessFactor: {
          type: "number",
          get: (material, index, payload) => _GetMaterial(material, index, payload).subSurface.maximumThickness,
          getTarget: _GetMaterial,
          set: (value, material, index, payload) => _GetMaterial(material, index, payload).subSurface.maximumThickness = value
        },
        thicknessTexture: {
          extensions: {
            KHR_texture_transform: _GenerateTextureMap("subSurface", "thicknessTexture")
          }
        }
      }
    }
  }
};
const extensionsTree = {
  KHR_lights_punctual: {
    lights: {
      length: {
        type: "number",
        get: (lights) => lights.length,
        getTarget: (lights) => lights.map((light) => light._babylonLight),
        getPropertyName: [(_lights) => "length"]
      },
      __array__: {
        __target__: true,
        color: {
          type: "Color3",
          get: (light) => {
            var _a;
            return (_a = light._babylonLight) == null ? void 0 : _a.diffuse;
          },
          set: (value, light) => {
            var _a;
            return (_a = light._babylonLight) == null ? void 0 : _a.diffuse.copyFrom(value);
          },
          getTarget: (light) => light._babylonLight,
          getPropertyName: [(_light) => "diffuse"]
        },
        intensity: {
          type: "number",
          get: (light) => {
            var _a;
            return (_a = light._babylonLight) == null ? void 0 : _a.intensity;
          },
          set: (value, light) => light._babylonLight ? light._babylonLight.intensity = value : void 0,
          getTarget: (light) => light._babylonLight,
          getPropertyName: [(_light) => "intensity"]
        },
        range: {
          type: "number",
          get: (light) => {
            var _a;
            return (_a = light._babylonLight) == null ? void 0 : _a.range;
          },
          set: (value, light) => light._babylonLight ? light._babylonLight.range = value : void 0,
          getTarget: (light) => light._babylonLight,
          getPropertyName: [(_light) => "range"]
        },
        spot: {
          innerConeAngle: {
            type: "number",
            get: (light) => {
              var _a;
              return (_a = light._babylonLight) == null ? void 0 : _a.innerAngle;
            },
            set: (value, light) => light._babylonLight ? light._babylonLight.innerAngle = value : void 0,
            getTarget: (light) => light._babylonLight,
            getPropertyName: [(_light) => "innerConeAngle"]
          },
          outerConeAngle: {
            type: "number",
            get: (light) => {
              var _a;
              return (_a = light._babylonLight) == null ? void 0 : _a.angle;
            },
            set: (value, light) => light._babylonLight ? light._babylonLight.angle = value : void 0,
            getTarget: (light) => light._babylonLight,
            getPropertyName: [(_light) => "outerConeAngle"]
          }
        }
      }
    }
  },
  EXT_lights_ies: {
    lights: {
      length: {
        type: "number",
        get: (lights) => lights.length,
        getTarget: (lights) => lights.map((light) => light._babylonLight),
        getPropertyName: [(_lights) => "length"]
      }
    }
  },
  EXT_lights_image_based: {
    lights: {
      length: {
        type: "number",
        get: (lights) => lights.length,
        getTarget: (lights) => lights.map((light) => light._babylonTexture),
        getPropertyName: [(_lights) => "length"]
      },
      __array__: {
        __target__: true,
        intensity: {
          type: "number",
          get: (light) => {
            var _a;
            return (_a = light._babylonTexture) == null ? void 0 : _a.level;
          },
          set: (value, light) => {
            if (light._babylonTexture)
              light._babylonTexture.level = value;
          },
          getTarget: (light) => light._babylonTexture
        },
        rotation: {
          type: "Quaternion",
          get: (light) => {
            var _a;
            return light._babylonTexture && Quaternion.FromRotationMatrix((_a = light._babylonTexture) == null ? void 0 : _a.getReflectionTextureMatrix());
          },
          set: (value, light) => {
            var _a;
            if (!light._babylonTexture)
              return;
            if (!((_a = light._babylonTexture.getScene()) == null ? void 0 : _a.useRightHandedSystem)) {
              value = Quaternion.Inverse(value);
            }
            Matrix.FromQuaternionToRef(value, light._babylonTexture.getReflectionTextureMatrix());
          },
          getTarget: (light) => light._babylonTexture
        }
      }
    }
  }
};
function _GetTexture(material, payload, textureType, textureInObject) {
  const babylonMaterial = _GetMaterial(material);
  return textureInObject ? babylonMaterial[textureType][textureInObject] : babylonMaterial[textureType];
}
function _GetMaterial(material, _index, payload) {
  var _a, _b;
  return (_b = (_a = material._data) == null ? void 0 : _a[(payload == null ? void 0 : payload.fillMode) ?? Constants.MATERIAL_TriangleFillMode]) == null ? void 0 : _b.babylonMaterial;
}
function _GenerateTextureMap(textureType, textureInObject) {
  return {
    offset: {
      componentsCount: 2,
      // assuming two independent values for u and v, and NOT a Vector2
      type: "Vector2",
      get: (material, _index, payload) => {
        const texture = _GetTexture(material, payload, textureType, textureInObject);
        return new Vector2(texture == null ? void 0 : texture.uOffset, texture == null ? void 0 : texture.vOffset);
      },
      getTarget: _GetMaterial,
      set: (value, material, _index, payload) => {
        const texture = _GetTexture(material, payload, textureType, textureInObject);
        texture.uOffset = value.x, texture.vOffset = value.y;
      },
      getPropertyName: [
        () => `${textureType}${textureInObject ? "." + textureInObject : ""}.uOffset`,
        () => `${textureType}${textureInObject ? "." + textureInObject : ""}.vOffset`
      ]
    },
    rotation: {
      type: "number",
      get: (material, _index, payload) => {
        var _a;
        return (_a = _GetTexture(material, payload, textureType, textureInObject)) == null ? void 0 : _a.wAng;
      },
      getTarget: _GetMaterial,
      set: (value, material, _index, payload) => _GetTexture(material, payload, textureType, textureInObject).wAng = value,
      getPropertyName: [() => `${textureType}${textureInObject ? "." + textureInObject : ""}.wAng`]
    },
    scale: {
      componentsCount: 2,
      type: "Vector2",
      get: (material, _index, payload) => {
        const texture = _GetTexture(material, payload, textureType, textureInObject);
        return new Vector2(texture == null ? void 0 : texture.uScale, texture == null ? void 0 : texture.vScale);
      },
      getTarget: _GetMaterial,
      set: (value, material, index, payload) => {
        const texture = _GetTexture(material, payload, textureType, textureInObject);
        texture.uScale = value.x, texture.vScale = value.y;
      },
      getPropertyName: [
        () => `${textureType}${textureInObject ? "." + textureInObject : ""}.uScale`,
        () => `${textureType}${textureInObject ? "." + textureInObject : ""}.vScale`
      ]
    }
  };
}
const objectModelMapping = {
  cameras: camerasTree,
  nodes: nodesTree,
  materials: materialsTree,
  extensions: extensionsTree,
  animations: animationsTree,
  meshes: meshesTree
};
function GetPathToObjectConverter(gltf) {
  return new GLTFPathToObjectConverter(gltf, objectModelMapping);
}
function GetMappingForKey(key) {
  const keyParts = key.split("/").map((part) => part.replace(/{}/g, "__array__"));
  let current = objectModelMapping;
  for (const part of keyParts) {
    if (!part) {
      continue;
    }
    current = current[part];
  }
  if (current && current.type && current.get) {
    return current;
  }
  return void 0;
}
function SetInterpolationForKey(key, interpolation) {
  const keyParts = key.split("/").map((part) => part.replace(/{}/g, "__array__"));
  let current = objectModelMapping;
  for (const part of keyParts) {
    if (!part) {
      continue;
    }
    current = current[part];
  }
  if (current && current.type && current.get) {
    current.interpolation = interpolation;
  }
}
function AddObjectAccessorToKey(key, accessor) {
  const keyParts = key.split("/").map((part) => part.replace(/{}/g, "__array__"));
  let current = objectModelMapping;
  for (const part of keyParts) {
    if (!part) {
      continue;
    }
    if (!current[part]) {
      if (part === "?") {
        current.__ignoreObjectTree__ = true;
        continue;
      }
      current[part] = {};
      if (part === "__array__") {
        current[part].__target__ = true;
      }
    }
    current = current[part];
  }
  Object.assign(current, accessor);
}
export {
  AddObjectAccessorToKey as A,
  Constants as C,
  GetPathToObjectConverter as G,
  SetInterpolationForKey as S,
  SpotLight as a,
  ShadowLight as b,
  GetMappingForKey as c
};
