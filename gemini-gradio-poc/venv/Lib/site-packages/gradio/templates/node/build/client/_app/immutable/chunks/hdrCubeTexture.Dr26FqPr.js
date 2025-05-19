const __vite__fileDeps=["./hdrFiltering.vertex.DGRsXq5e.js","./index.B4f7kVg_.js","./preload-helper.DpQnamwV.js","./hdrFiltering.fragment.CFD-jXUz.js","./helperFunctions.BjB2cuO9.js","./hdrFilteringFunctions.zYXqnovj.js","./hdrFiltering.vertex.Dmc4A-dI.js","./hdrFiltering.fragment.rX2VylhU.js","./helperFunctions.D96OHM8v.js","./hdrFilteringFunctions.D8NdBy7K.js","./procedural.vertex.Dhm1uhTF.js","./procedural.vertex.Bu15ToUG.js","./iblCdfx.fragment.ByMajggr.js","./iblCdfy.fragment.CdcByH7R.js","./iblScaledLuminance.fragment.EoQkH9Z9.js","./iblCdfx.fragment.Llnx0w9q.js","./iblCdfy.fragment.gPpMnXXB.js","./iblScaledLuminance.fragment.D2CtYEvc.js","./iblIcdf.fragment.ll2flkT-.js","./iblIcdf.fragment.CrRjDXHa.js","./iblCdfDebug.fragment.CITQCybG.js","./iblCdfDebug.fragment.1sDzNUfZ.js","./hdrIrradianceFiltering.vertex.CaY-6gfL.js","./hdrIrradianceFiltering.fragment.DoX0YdDe.js","./hdrIrradianceFiltering.vertex.HH5n6v_t.js","./hdrIrradianceFiltering.fragment.DqULPZQT.js"],__vite__mapDeps=i=>i.map(i=>__vite__fileDeps[i]);
import { ag as ILog2, am as EffectWrapper, al as EffectRenderer, V as Vector3, b2 as SceneComponentConstants, b as Tools, _ as __decorate, s as serialize, R as RegisterClass, T as Texture, O as Observable, ak as EngineStore, b3 as DrawWrapper, aa as VertexBuffer, as as RenderTargetTexture, t as Material, az as Vector4, b4 as Engine, ah as PostProcess, b5 as _WarnImport, B as BaseTexture, M as Matrix, aw as CubeMapToSphericalPolynomialTools, b6 as ToGammaSpace, av as ToHalfFloat } from "./index.B4f7kVg_.js";
import { G as GetCubeMapTextureData } from "./hdr.B6RPQ5Xu.js";
import { _ as __vitePreload } from "./preload-helper.DpQnamwV.js";
import { R as RawTexture } from "./rawTexture.BYaiLY3K.js";
class HDRFiltering {
  /**
   * Instantiates HDR filter for reflection maps
   *
   * @param engine Thin engine
   * @param options Options
   */
  constructor(engine, options = {}) {
    this._lodGenerationOffset = 0;
    this._lodGenerationScale = 0.8;
    this.quality = 4096;
    this.hdrScale = 1;
    this._engine = engine;
    this.hdrScale = options.hdrScale || this.hdrScale;
    this.quality = options.quality || this.quality;
  }
  _createRenderTarget(size) {
    let textureType = 0;
    if (this._engine.getCaps().textureHalfFloatRender) {
      textureType = 2;
    } else if (this._engine.getCaps().textureFloatRender) {
      textureType = 1;
    }
    const rtWrapper = this._engine.createRenderTargetCubeTexture(size, {
      format: 5,
      type: textureType,
      createMipMaps: true,
      generateMipMaps: false,
      generateDepthBuffer: false,
      generateStencilBuffer: false,
      samplingMode: 1,
      label: "HDR_Radiance_Filtering_Target"
    });
    this._engine.updateTextureWrappingMode(rtWrapper.texture, 0, 0, 0);
    this._engine.updateTextureSamplingMode(3, rtWrapper.texture, true);
    return rtWrapper;
  }
  _prefilterInternal(texture) {
    const width = texture.getSize().width;
    const mipmapsCount = ILog2(width) + 1;
    const effect = this._effectWrapper.effect;
    const outputTexture = this._createRenderTarget(width);
    this._effectRenderer.saveStates();
    this._effectRenderer.setViewport();
    const intTexture = texture.getInternalTexture();
    if (intTexture) {
      this._engine.updateTextureSamplingMode(3, intTexture, true);
    }
    this._effectRenderer.applyEffectWrapper(this._effectWrapper);
    const directions = [
      [new Vector3(0, 0, -1), new Vector3(0, -1, 0), new Vector3(1, 0, 0)],
      // PositiveX
      [new Vector3(0, 0, 1), new Vector3(0, -1, 0), new Vector3(-1, 0, 0)],
      // NegativeX
      [new Vector3(1, 0, 0), new Vector3(0, 0, 1), new Vector3(0, 1, 0)],
      // PositiveY
      [new Vector3(1, 0, 0), new Vector3(0, 0, -1), new Vector3(0, -1, 0)],
      // NegativeY
      [new Vector3(1, 0, 0), new Vector3(0, -1, 0), new Vector3(0, 0, 1)],
      // PositiveZ
      [new Vector3(-1, 0, 0), new Vector3(0, -1, 0), new Vector3(0, 0, -1)]
      // NegativeZ
    ];
    effect.setFloat("hdrScale", this.hdrScale);
    effect.setFloat2("vFilteringInfo", texture.getSize().width, mipmapsCount);
    effect.setTexture("inputTexture", texture);
    for (let face = 0; face < 6; face++) {
      effect.setVector3("up", directions[face][0]);
      effect.setVector3("right", directions[face][1]);
      effect.setVector3("front", directions[face][2]);
      for (let lod = 0; lod < mipmapsCount; lod++) {
        this._engine.bindFramebuffer(outputTexture, face, void 0, void 0, true, lod);
        this._effectRenderer.applyEffectWrapper(this._effectWrapper);
        let alpha = Math.pow(2, (lod - this._lodGenerationOffset) / this._lodGenerationScale) / width;
        if (lod === 0) {
          alpha = 0;
        }
        effect.setFloat("alphaG", alpha);
        this._effectRenderer.draw();
      }
    }
    this._effectRenderer.restoreStates();
    this._engine.restoreDefaultFramebuffer();
    this._engine._releaseTexture(texture._texture);
    const type = outputTexture.texture.type;
    const format = outputTexture.texture.format;
    outputTexture._swapAndDie(texture._texture);
    texture._texture.type = type;
    texture._texture.format = format;
    texture.gammaSpace = false;
    texture.lodGenerationOffset = this._lodGenerationOffset;
    texture.lodGenerationScale = this._lodGenerationScale;
    texture._prefiltered = true;
    return texture;
  }
  _createEffect(texture, onCompiled) {
    const defines = [];
    if (texture.gammaSpace) {
      defines.push("#define GAMMA_INPUT");
    }
    defines.push("#define NUM_SAMPLES " + this.quality + "u");
    const isWebGPU = this._engine.isWebGPU;
    const effectWrapper = new EffectWrapper({
      engine: this._engine,
      name: "hdrFiltering",
      vertexShader: "hdrFiltering",
      fragmentShader: "hdrFiltering",
      samplerNames: ["inputTexture"],
      uniformNames: ["vSampleDirections", "vWeights", "up", "right", "front", "vFilteringInfo", "hdrScale", "alphaG"],
      useShaderStore: true,
      defines,
      onCompiled,
      shaderLanguage: isWebGPU ? 1 : 0,
      extraInitializationsAsync: async () => {
        if (isWebGPU) {
          await Promise.all([__vitePreload(() => import("./hdrFiltering.vertex.DGRsXq5e.js"), true ? __vite__mapDeps([0,1,2]) : void 0, import.meta.url), __vitePreload(() => import("./hdrFiltering.fragment.CFD-jXUz.js"), true ? __vite__mapDeps([3,1,2,4,5]) : void 0, import.meta.url)]);
        } else {
          await Promise.all([__vitePreload(() => import("./hdrFiltering.vertex.Dmc4A-dI.js"), true ? __vite__mapDeps([6,1,2]) : void 0, import.meta.url), __vitePreload(() => import("./hdrFiltering.fragment.rX2VylhU.js"), true ? __vite__mapDeps([7,1,2,8,9]) : void 0, import.meta.url)]);
        }
      }
    });
    return effectWrapper;
  }
  /**
   * Get a value indicating if the filter is ready to be used
   * @param texture Texture to filter
   * @returns true if the filter is ready
   */
  isReady(texture) {
    return texture.isReady() && this._effectWrapper.effect.isReady();
  }
  /**
   * Prefilters a cube texture to have mipmap levels representing roughness values.
   * Prefiltering will be invoked at the end of next rendering pass.
   * This has to be done once the map is loaded, and has not been prefiltered by a third party software.
   * See http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf for more information
   * @param texture Texture to filter
   * @returns Promise called when prefiltering is done
   */
  async prefilter(texture) {
    if (!this._engine._features.allowTexturePrefiltering) {
      throw new Error("HDR prefiltering is not available in WebGL 1., you can use real time filtering instead.");
    }
    this._effectRenderer = new EffectRenderer(this._engine);
    this._effectWrapper = this._createEffect(texture);
    await this._effectWrapper.effect.whenCompiledAsync();
    this._prefilterInternal(texture);
    this._effectRenderer.dispose();
    this._effectWrapper.dispose();
  }
}
class ProceduralTextureSceneComponent {
  /**
   * Creates a new instance of the component for the given scene
   * @param scene Defines the scene to register the component in
   */
  constructor(scene) {
    this.name = SceneComponentConstants.NAME_PROCEDURALTEXTURE;
    this.scene = scene;
  }
  /**
   * Registers the component in a given scene
   */
  register() {
    this.scene._beforeClearStage.registerStep(SceneComponentConstants.STEP_BEFORECLEAR_PROCEDURALTEXTURE, this, this._beforeClear);
  }
  /**
   * Rebuilds the elements related to this component in case of
   * context lost for instance.
   */
  rebuild() {
  }
  /**
   * Disposes the component and the associated resources.
   */
  dispose() {
  }
  _beforeClear() {
    if (this.scene.proceduralTexturesEnabled) {
      Tools.StartPerformanceCounter("Procedural textures", this.scene.proceduralTextures.length > 0);
      for (let proceduralIndex = 0; proceduralIndex < this.scene.proceduralTextures.length; proceduralIndex++) {
        const proceduralTexture = this.scene.proceduralTextures[proceduralIndex];
        if (proceduralTexture._shouldRender()) {
          proceduralTexture.render();
        }
      }
      Tools.EndPerformanceCounter("Procedural textures", this.scene.proceduralTextures.length > 0);
    }
  }
}
class ProceduralTexture extends Texture {
  /**
   * Gets the shader language type used to generate vertex and fragment source code.
   */
  get shaderLanguage() {
    return this._shaderLanguage;
  }
  /**
   * Instantiates a new procedural texture.
   * Procedural texturing is a way to programmatically create a texture. There are 2 types of procedural textures: code-only, and code that references some classic 2D images, sometimes called 'refMaps' or 'sampler' images.
   * This is the base class of any Procedural texture and contains most of the shareable code.
   * @see https://doc.babylonjs.com/features/featuresDeepDive/materials/using/proceduralTextures
   * @param name  Define the name of the texture
   * @param size Define the size of the texture to create
   * @param fragment Define the fragment shader to use to generate the texture or null if it is defined later:
   *  * object: \{ fragmentElement: "fragmentShaderCode" \}, used with shader code in script tags
   *  * object: \{ fragmentSource: "fragment shader code string" \}, the string contains the shader code
   *  * string: the string contains a name "XXX" to lookup in Effect.ShadersStore["XXXFragmentShader"]
   * @param scene Define the scene the texture belongs to
   * @param fallbackTexture Define a fallback texture in case there were issues to create the custom texture
   * @param generateMipMaps Define if the texture should creates mip maps or not
   * @param isCube Define if the texture is a cube texture or not (this will render each faces of the cube)
   * @param textureType The FBO internal texture type
   */
  constructor(name, size, fragment, scene, fallbackTexture = null, generateMipMaps = true, isCube = false, textureType = 0) {
    super(null, scene, !generateMipMaps);
    this.isEnabled = true;
    this.autoClear = true;
    this.onGeneratedObservable = new Observable();
    this.onBeforeGenerationObservable = new Observable();
    this.nodeMaterialSource = null;
    this.defines = "";
    this._textures = {};
    this._currentRefreshId = -1;
    this._frameId = -1;
    this._refreshRate = 1;
    this._vertexBuffers = {};
    this._uniforms = new Array();
    this._samplers = new Array();
    this._floats = {};
    this._ints = {};
    this._floatsArrays = {};
    this._colors3 = {};
    this._colors4 = {};
    this._vectors2 = {};
    this._vectors3 = {};
    this._vectors4 = {};
    this._matrices = {};
    this._fallbackTextureUsed = false;
    this._cachedDefines = null;
    this._contentUpdateId = -1;
    this._rtWrapper = null;
    if (fallbackTexture !== null && !(fallbackTexture instanceof Texture)) {
      this._options = fallbackTexture;
      this._fallbackTexture = fallbackTexture.fallbackTexture ?? null;
    } else {
      this._options = {};
      this._fallbackTexture = fallbackTexture;
    }
    this._shaderLanguage = this._options.shaderLanguage ?? 0;
    scene = this.getScene() || EngineStore.LastCreatedScene;
    let component = scene._getComponent(SceneComponentConstants.NAME_PROCEDURALTEXTURE);
    if (!component) {
      component = new ProceduralTextureSceneComponent(scene);
      scene._addComponent(component);
    }
    scene.proceduralTextures.push(this);
    this._fullEngine = scene.getEngine();
    this.name = name;
    this.isRenderTarget = true;
    this._size = size;
    this._textureType = textureType;
    this._generateMipMaps = generateMipMaps;
    this._drawWrapper = new DrawWrapper(this._fullEngine);
    this.setFragment(fragment);
    const rtWrapper = this._createRtWrapper(isCube, size, generateMipMaps, textureType);
    this._texture = rtWrapper.texture;
    const vertices = [];
    vertices.push(1, 1);
    vertices.push(-1, 1);
    vertices.push(-1, -1);
    vertices.push(1, -1);
    this._vertexBuffers[VertexBuffer.PositionKind] = new VertexBuffer(this._fullEngine, vertices, VertexBuffer.PositionKind, false, false, 2);
    this._createIndexBuffer();
  }
  _createRtWrapper(isCube, size, generateMipMaps, textureType) {
    if (isCube) {
      this._rtWrapper = this._fullEngine.createRenderTargetCubeTexture(size, {
        generateMipMaps,
        generateDepthBuffer: false,
        generateStencilBuffer: false,
        type: textureType,
        ...this._options
      });
      this.setFloat("face", 0);
    } else {
      this._rtWrapper = this._fullEngine.createRenderTargetTexture(size, {
        generateMipMaps,
        generateDepthBuffer: false,
        generateStencilBuffer: false,
        type: textureType,
        ...this._options
      });
      if (this._rtWrapper.is3D) {
        this.setFloat("layer", 0);
        this.setInt("layerNum", 0);
      }
    }
    return this._rtWrapper;
  }
  /**
   * The effect that is created when initializing the post process.
   * @returns The created effect corresponding the postprocess.
   */
  getEffect() {
    return this._drawWrapper.effect;
  }
  /**
   * @internal
   */
  _setEffect(effect) {
    this._drawWrapper.effect = effect;
  }
  /**
   * Gets texture content (Use this function wisely as reading from a texture can be slow)
   * @returns an ArrayBufferView promise (Uint8Array or Float32Array)
   */
  getContent() {
    if (this._contentData && this._frameId === this._contentUpdateId) {
      return this._contentData;
    }
    if (this._contentData) {
      this._contentData.then((buffer) => {
        this._contentData = this.readPixels(0, 0, buffer);
        this._contentUpdateId = this._frameId;
      });
    } else {
      this._contentData = this.readPixels(0, 0);
      this._contentUpdateId = this._frameId;
    }
    return this._contentData;
  }
  _createIndexBuffer() {
    const engine = this._fullEngine;
    const indices = [];
    indices.push(0);
    indices.push(1);
    indices.push(2);
    indices.push(0);
    indices.push(2);
    indices.push(3);
    this._indexBuffer = engine.createIndexBuffer(indices);
  }
  /** @internal */
  _rebuild() {
    const vb = this._vertexBuffers[VertexBuffer.PositionKind];
    if (vb) {
      vb._rebuild();
    }
    this._createIndexBuffer();
    if (this.refreshRate === RenderTargetTexture.REFRESHRATE_RENDER_ONCE) {
      this.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
    }
  }
  /**
   * Resets the texture in order to recreate its associated resources.
   * This can be called in case of context loss or if you change the shader code and need to regenerate the texture with the new code
   */
  reset() {
    var _a;
    (_a = this._drawWrapper.effect) == null ? void 0 : _a.dispose();
    this._drawWrapper.effect = null;
    this._cachedDefines = null;
  }
  _getDefines() {
    return this.defines;
  }
  /**
   * Executes a function when the texture will be ready to be drawn.
   * @param func The callback to be used.
   */
  executeWhenReady(func) {
    if (this.isReady()) {
      func(this);
      return;
    }
    const effect = this.getEffect();
    if (effect) {
      effect.executeWhenCompiled(() => {
        func(this);
      });
    }
  }
  /**
   * Is the texture ready to be used ? (rendered at least once)
   * @returns true if ready, otherwise, false.
   */
  isReady() {
    const engine = this._fullEngine;
    if (this.nodeMaterialSource) {
      return this._drawWrapper.effect.isReady();
    }
    if (!this._fragment) {
      return false;
    }
    if (this._fallbackTextureUsed) {
      return true;
    }
    if (!this._texture) {
      return false;
    }
    const defines = this._getDefines();
    if (this._drawWrapper.effect && defines === this._cachedDefines && this._drawWrapper.effect.isReady()) {
      return true;
    }
    const shaders = {
      vertex: "procedural",
      fragmentElement: this._fragment.fragmentElement,
      fragmentSource: this._fragment.fragmentSource,
      fragment: typeof this._fragment === "string" ? this._fragment : void 0
    };
    if (this._cachedDefines !== defines) {
      this._cachedDefines = defines;
      this._drawWrapper.effect = engine.createEffect(shaders, [VertexBuffer.PositionKind], this._uniforms, this._samplers, defines, void 0, void 0, () => {
        var _a;
        (_a = this._rtWrapper) == null ? void 0 : _a.dispose();
        this._rtWrapper = this._texture = null;
        if (this._fallbackTexture) {
          this._texture = this._fallbackTexture._texture;
          if (this._texture) {
            this._texture.incrementReferences();
          }
        }
        this._fallbackTextureUsed = true;
      }, void 0, this._shaderLanguage, async () => {
        if (this._options.extraInitializationsAsync) {
          if (this.shaderLanguage === 1) {
            await Promise.all([__vitePreload(() => import("./procedural.vertex.Dhm1uhTF.js"), true ? __vite__mapDeps([10,1,2]) : void 0, import.meta.url), this._options.extraInitializationsAsync()]);
          } else {
            await Promise.all([__vitePreload(() => import("./procedural.vertex.Bu15ToUG.js"), true ? __vite__mapDeps([11,1,2]) : void 0, import.meta.url), this._options.extraInitializationsAsync()]);
          }
        } else {
          if (this.shaderLanguage === 1) {
            await __vitePreload(() => import("./procedural.vertex.Dhm1uhTF.js"), true ? __vite__mapDeps([10,1,2]) : void 0, import.meta.url);
          } else {
            await __vitePreload(() => import("./procedural.vertex.Bu15ToUG.js"), true ? __vite__mapDeps([11,1,2]) : void 0, import.meta.url);
          }
        }
      });
    }
    return this._drawWrapper.effect.isReady();
  }
  /**
   * Resets the refresh counter of the texture and start bak from scratch.
   * Could be useful to regenerate the texture if it is setup to render only once.
   */
  resetRefreshCounter() {
    this._currentRefreshId = -1;
  }
  /**
   * Set the fragment shader to use in order to render the texture.
   * @param fragment This can be set to a path (into the shader store) or to a json object containing a fragmentElement property.
   */
  setFragment(fragment) {
    this._fragment = fragment;
  }
  /**
   * Define the refresh rate of the texture or the rendering frequency.
   * Use 0 to render just once, 1 to render on every frame, 2 to render every two frames and so on...
   */
  get refreshRate() {
    return this._refreshRate;
  }
  set refreshRate(value) {
    this._refreshRate = value;
    this.resetRefreshCounter();
  }
  /** @internal */
  _shouldRender() {
    if (!this.isEnabled || !this.isReady() || !this._texture) {
      if (this._texture) {
        this._texture.isReady = false;
      }
      return false;
    }
    if (this._fallbackTextureUsed) {
      return false;
    }
    if (this._currentRefreshId === -1) {
      this._currentRefreshId = 1;
      this._frameId++;
      return true;
    }
    if (this.refreshRate === this._currentRefreshId) {
      this._currentRefreshId = 1;
      this._frameId++;
      return true;
    }
    this._currentRefreshId++;
    return false;
  }
  /**
   * Get the size the texture is rendering at.
   * @returns the size (on cube texture it is always squared)
   */
  getRenderSize() {
    return this._size;
  }
  /**
   * Resize the texture to new value.
   * @param size Define the new size the texture should have
   * @param generateMipMaps Define whether the new texture should create mip maps
   */
  resize(size, generateMipMaps) {
    if (this._fallbackTextureUsed || !this._rtWrapper || !this._texture) {
      return;
    }
    const isCube = this._texture.isCube;
    this._rtWrapper.dispose();
    const rtWrapper = this._createRtWrapper(isCube, size, generateMipMaps, this._textureType);
    this._texture = rtWrapper.texture;
    this._size = size;
    this._generateMipMaps = generateMipMaps;
  }
  _checkUniform(uniformName) {
    if (this._uniforms.indexOf(uniformName) === -1) {
      this._uniforms.push(uniformName);
    }
  }
  /**
   * Set a texture in the shader program used to render.
   * @param name Define the name of the uniform samplers as defined in the shader
   * @param texture Define the texture to bind to this sampler
   * @returns the texture itself allowing "fluent" like uniform updates
   */
  setTexture(name, texture) {
    if (this._samplers.indexOf(name) === -1) {
      this._samplers.push(name);
    }
    this._textures[name] = texture;
    return this;
  }
  /**
   * Set a float in the shader.
   * @param name Define the name of the uniform as defined in the shader
   * @param value Define the value to give to the uniform
   * @returns the texture itself allowing "fluent" like uniform updates
   */
  setFloat(name, value) {
    this._checkUniform(name);
    this._floats[name] = value;
    return this;
  }
  /**
   * Set a int in the shader.
   * @param name Define the name of the uniform as defined in the shader
   * @param value Define the value to give to the uniform
   * @returns the texture itself allowing "fluent" like uniform updates
   */
  setInt(name, value) {
    this._checkUniform(name);
    this._ints[name] = value;
    return this;
  }
  /**
   * Set an array of floats in the shader.
   * @param name Define the name of the uniform as defined in the shader
   * @param value Define the value to give to the uniform
   * @returns the texture itself allowing "fluent" like uniform updates
   */
  setFloats(name, value) {
    this._checkUniform(name);
    this._floatsArrays[name] = value;
    return this;
  }
  /**
   * Set a vec3 in the shader from a Color3.
   * @param name Define the name of the uniform as defined in the shader
   * @param value Define the value to give to the uniform
   * @returns the texture itself allowing "fluent" like uniform updates
   */
  setColor3(name, value) {
    this._checkUniform(name);
    this._colors3[name] = value;
    return this;
  }
  /**
   * Set a vec4 in the shader from a Color4.
   * @param name Define the name of the uniform as defined in the shader
   * @param value Define the value to give to the uniform
   * @returns the texture itself allowing "fluent" like uniform updates
   */
  setColor4(name, value) {
    this._checkUniform(name);
    this._colors4[name] = value;
    return this;
  }
  /**
   * Set a vec2 in the shader from a Vector2.
   * @param name Define the name of the uniform as defined in the shader
   * @param value Define the value to give to the uniform
   * @returns the texture itself allowing "fluent" like uniform updates
   */
  setVector2(name, value) {
    this._checkUniform(name);
    this._vectors2[name] = value;
    return this;
  }
  /**
   * Set a vec3 in the shader from a Vector3.
   * @param name Define the name of the uniform as defined in the shader
   * @param value Define the value to give to the uniform
   * @returns the texture itself allowing "fluent" like uniform updates
   */
  setVector3(name, value) {
    this._checkUniform(name);
    this._vectors3[name] = value;
    return this;
  }
  /**
   * Set a vec4 in the shader from a Vector4.
   * @param name Define the name of the uniform as defined in the shader
   * @param value Define the value to give to the uniform
   * @returns the texture itself allowing "fluent" like uniform updates
   */
  setVector4(name, value) {
    this._checkUniform(name);
    this._vectors4[name] = value;
    return this;
  }
  /**
   * Set a mat4 in the shader from a MAtrix.
   * @param name Define the name of the uniform as defined in the shader
   * @param value Define the value to give to the uniform
   * @returns the texture itself allowing "fluent" like uniform updates
   */
  setMatrix(name, value) {
    this._checkUniform(name);
    this._matrices[name] = value;
    return this;
  }
  /**
   * Render the texture to its associated render target.
   * @param useCameraPostProcess Define if camera post process should be applied to the texture
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(useCameraPostProcess) {
    var _a, _b, _c, _d;
    const scene = this.getScene();
    if (!scene) {
      return;
    }
    const engine = this._fullEngine;
    engine.enableEffect(this._drawWrapper);
    this.onBeforeGenerationObservable.notifyObservers(this);
    engine.setState(false);
    if (!this.nodeMaterialSource) {
      for (const name in this._textures) {
        this._drawWrapper.effect.setTexture(name, this._textures[name]);
      }
      for (const name in this._ints) {
        this._drawWrapper.effect.setInt(name, this._ints[name]);
      }
      for (const name in this._floats) {
        this._drawWrapper.effect.setFloat(name, this._floats[name]);
      }
      for (const name in this._floatsArrays) {
        this._drawWrapper.effect.setArray(name, this._floatsArrays[name]);
      }
      for (const name in this._colors3) {
        this._drawWrapper.effect.setColor3(name, this._colors3[name]);
      }
      for (const name in this._colors4) {
        const color = this._colors4[name];
        this._drawWrapper.effect.setFloat4(name, color.r, color.g, color.b, color.a);
      }
      for (const name in this._vectors2) {
        this._drawWrapper.effect.setVector2(name, this._vectors2[name]);
      }
      for (const name in this._vectors3) {
        this._drawWrapper.effect.setVector3(name, this._vectors3[name]);
      }
      for (const name in this._vectors4) {
        this._drawWrapper.effect.setVector4(name, this._vectors4[name]);
      }
      for (const name in this._matrices) {
        this._drawWrapper.effect.setMatrix(name, this._matrices[name]);
      }
    }
    if (!this._texture || !this._rtWrapper) {
      return;
    }
    (_a = engine._debugPushGroup) == null ? void 0 : _a.call(engine, `procedural texture generation for ${this.name}`, 1);
    const viewPort = engine.currentViewport;
    if (this.isCube) {
      for (let face = 0; face < 6; face++) {
        engine.bindFramebuffer(this._rtWrapper, face, void 0, void 0, true);
        engine.bindBuffers(this._vertexBuffers, this._indexBuffer, this._drawWrapper.effect);
        this._drawWrapper.effect.setFloat("face", face);
        if (this.autoClear) {
          engine.clear(scene.clearColor, true, false, false);
        }
        engine.drawElementsType(Material.TriangleFillMode, 0, 6);
        engine.unBindFramebuffer(this._rtWrapper, true);
      }
    } else {
      let numLayers = 1;
      if (this._rtWrapper.is3D) {
        numLayers = this._rtWrapper.depth;
      } else if (this._rtWrapper.is2DArray) {
        numLayers = this._rtWrapper.layers;
      }
      for (let layer = 0; layer < numLayers; layer++) {
        engine.bindFramebuffer(this._rtWrapper, 0, void 0, void 0, true, 0, layer);
        engine.bindBuffers(this._vertexBuffers, this._indexBuffer, this._drawWrapper.effect);
        if (this._rtWrapper.is3D || this._rtWrapper.is2DArray) {
          (_b = this._drawWrapper.effect) == null ? void 0 : _b.setFloat("layer", numLayers !== 1 ? layer / (numLayers - 1) : 0);
          (_c = this._drawWrapper.effect) == null ? void 0 : _c.setInt("layerNum", layer);
          for (const name in this._textures) {
            this._drawWrapper.effect.setTexture(name, this._textures[name]);
          }
        }
        if (this.autoClear) {
          engine.clear(scene.clearColor, true, false, false);
        }
        engine.drawElementsType(Material.TriangleFillMode, 0, 6);
        engine.unBindFramebuffer(this._rtWrapper, !this._generateMipMaps);
      }
    }
    if (viewPort) {
      engine.setViewport(viewPort);
    }
    if (this.isCube) {
      engine.generateMipMapsForCubemap(this._texture, true);
    }
    (_d = engine._debugPopGroup) == null ? void 0 : _d.call(engine, 1);
    if (this.onGenerated) {
      this.onGenerated();
    }
    this.onGeneratedObservable.notifyObservers(this);
  }
  /**
   * Clone the texture.
   * @returns the cloned texture
   */
  clone() {
    const textureSize = this.getSize();
    const newTexture = new ProceduralTexture(this.name, textureSize.width, this._fragment, this.getScene(), this._fallbackTexture, this._generateMipMaps);
    newTexture.hasAlpha = this.hasAlpha;
    newTexture.level = this.level;
    newTexture.coordinatesMode = this.coordinatesMode;
    return newTexture;
  }
  /**
   * Dispose the texture and release its associated resources.
   */
  dispose() {
    const scene = this.getScene();
    if (!scene) {
      return;
    }
    const index = scene.proceduralTextures.indexOf(this);
    if (index >= 0) {
      scene.proceduralTextures.splice(index, 1);
    }
    const vertexBuffer = this._vertexBuffers[VertexBuffer.PositionKind];
    if (vertexBuffer) {
      vertexBuffer.dispose();
      this._vertexBuffers[VertexBuffer.PositionKind] = null;
    }
    if (this._indexBuffer && this._fullEngine._releaseBuffer(this._indexBuffer)) {
      this._indexBuffer = null;
    }
    this.onGeneratedObservable.clear();
    this.onBeforeGenerationObservable.clear();
    super.dispose();
  }
}
__decorate([
  serialize()
], ProceduralTexture.prototype, "isEnabled", void 0);
__decorate([
  serialize()
], ProceduralTexture.prototype, "autoClear", void 0);
__decorate([
  serialize()
], ProceduralTexture.prototype, "_generateMipMaps", void 0);
__decorate([
  serialize()
], ProceduralTexture.prototype, "_size", void 0);
__decorate([
  serialize()
], ProceduralTexture.prototype, "refreshRate", null);
RegisterClass("BABYLON.ProceduralTexture", ProceduralTexture);
class IblCdfGenerator {
  /**
   * Gets the IBL source texture being used by the CDF renderer
   */
  get iblSource() {
    return this._iblSource;
  }
  /**
   * Sets the IBL source texture to be used by the CDF renderer.
   * This will trigger recreation of the CDF assets.
   */
  set iblSource(source) {
    if (this._iblSource === source) {
      return;
    }
    this._disposeTextures();
    this._iblSource = source;
    if (!source) {
      return;
    }
    if (source.isCube) {
      if (source.isReadyOrNotBlocking()) {
        this._recreateAssetsFromNewIbl();
      } else {
        source.onLoadObservable.addOnce(this._recreateAssetsFromNewIbl.bind(this, source));
      }
    } else {
      if (source.isReadyOrNotBlocking()) {
        this._recreateAssetsFromNewIbl();
      } else {
        source.onLoadObservable.addOnce(this._recreateAssetsFromNewIbl.bind(this, source));
      }
    }
  }
  _recreateAssetsFromNewIbl() {
    if (this._debugPass) {
      this._debugPass.dispose();
    }
    this._createTextures();
    if (this._debugPass) {
      this._createDebugPass();
    }
  }
  /**
   * Return the cumulative distribution function (CDF) texture
   * @returns Return the cumulative distribution function (CDF) texture
   */
  getIcdfTexture() {
    return this._icdfPT ? this._icdfPT : this._dummyTexture;
  }
  /**
   * Sets params that control the position and scaling of the debug display on the screen.
   * @param x Screen X offset of the debug display (0-1)
   * @param y Screen Y offset of the debug display (0-1)
   * @param widthScale X scale of the debug display (0-1)
   * @param heightScale Y scale of the debug display (0-1)
   */
  setDebugDisplayParams(x, y, widthScale, heightScale) {
    this._debugSizeParams.set(x, y, widthScale, heightScale);
  }
  /**
   * The name of the debug pass post process
   */
  get debugPassName() {
    return this._debugPassName;
  }
  /**
   * Gets the debug pass post process
   * @returns The post process
   */
  getDebugPassPP() {
    if (!this._debugPass) {
      this._createDebugPass();
    }
    return this._debugPass;
  }
  /**
   * Instanciates the CDF renderer
   * @param sceneOrEngine Scene to attach to
   * @returns The CDF renderer
   */
  constructor(sceneOrEngine) {
    this.debugEnabled = false;
    this._debugSizeParams = new Vector4(0, 0, 1, 1);
    this._debugPassName = "CDF Debug";
    this.onGeneratedObservable = new Observable();
    if (sceneOrEngine) {
      if (IblCdfGenerator._IsScene(sceneOrEngine)) {
        this._scene = sceneOrEngine;
      } else {
        this._engine = sceneOrEngine;
      }
    } else {
      this._scene = EngineStore.LastCreatedScene;
    }
    if (this._scene) {
      this._engine = this._scene.getEngine();
    }
    const blackPixels = new Uint16Array([0, 0, 0, 255]);
    this._dummyTexture = new RawTexture(blackPixels, 1, 1, Engine.TEXTUREFORMAT_RGBA, sceneOrEngine, false, false, void 0, 2);
    if (this._scene) {
      IblCdfGenerator._SceneComponentInitialization(this._scene);
    }
  }
  _createTextures() {
    const size = this._iblSource ? { width: this._iblSource.getSize().width, height: this._iblSource.getSize().height } : { width: 1, height: 1 };
    if (!this._iblSource) {
      this._iblSource = RawTexture.CreateRTexture(new Uint8Array([255]), 1, 1, this._engine, false, false, 1, 0);
      this._iblSource.name = "Placeholder IBL Source";
    }
    if (this._iblSource.isCube) {
      size.width *= 4;
      size.height *= 2;
      size.width = 1 << Math.floor(Math.log2(size.width));
      size.height = 1 << Math.floor(Math.log2(size.height));
    }
    const isWebGPU = this._engine.isWebGPU;
    const cdfOptions = {
      generateDepthBuffer: false,
      generateMipMaps: false,
      format: 6,
      type: 1,
      samplingMode: 1,
      shaderLanguage: isWebGPU ? 1 : 0,
      gammaSpace: false,
      extraInitializationsAsync: async () => {
        if (isWebGPU) {
          await Promise.all([__vitePreload(() => import("./iblCdfx.fragment.ByMajggr.js"), true ? __vite__mapDeps([12,1,2]) : void 0, import.meta.url), __vitePreload(() => import("./iblCdfy.fragment.CdcByH7R.js"), true ? __vite__mapDeps([13,1,2]) : void 0, import.meta.url), __vitePreload(() => import("./iblScaledLuminance.fragment.EoQkH9Z9.js"), true ? __vite__mapDeps([14,1,2,4]) : void 0, import.meta.url)]);
        } else {
          await Promise.all([__vitePreload(() => import("./iblCdfx.fragment.Llnx0w9q.js"), true ? __vite__mapDeps([15,1,2]) : void 0, import.meta.url), __vitePreload(() => import("./iblCdfy.fragment.gPpMnXXB.js"), true ? __vite__mapDeps([16,1,2,8]) : void 0, import.meta.url), __vitePreload(() => import("./iblScaledLuminance.fragment.D2CtYEvc.js"), true ? __vite__mapDeps([17,1,2,8]) : void 0, import.meta.url)]);
        }
      }
    };
    const icdfOptions = {
      generateDepthBuffer: false,
      generateMipMaps: false,
      format: 5,
      type: 2,
      samplingMode: 1,
      shaderLanguage: isWebGPU ? 1 : 0,
      gammaSpace: false,
      extraInitializationsAsync: async () => {
        if (isWebGPU) {
          await Promise.all([__vitePreload(() => import("./iblIcdf.fragment.ll2flkT-.js"), true ? __vite__mapDeps([18,1,2,4]) : void 0, import.meta.url)]);
        } else {
          await Promise.all([__vitePreload(() => import("./iblIcdf.fragment.CrRjDXHa.js"), true ? __vite__mapDeps([19,1,2,8]) : void 0, import.meta.url)]);
        }
      }
    };
    this._cdfyPT = new ProceduralTexture("cdfyTexture", { width: size.width, height: size.height + 1 }, "iblCdfy", this._scene, cdfOptions, false, false);
    this._cdfyPT.autoClear = false;
    this._cdfyPT.setTexture("iblSource", this._iblSource);
    this._cdfyPT.setInt("iblHeight", size.height);
    this._cdfyPT.wrapV = 0;
    this._cdfyPT.refreshRate = 0;
    if (this._iblSource.isCube) {
      this._cdfyPT.defines = "#define IBL_USE_CUBE_MAP\n";
    }
    this._cdfxPT = new ProceduralTexture("cdfxTexture", { width: size.width + 1, height: 1 }, "iblCdfx", this._scene, cdfOptions, false, false);
    this._cdfxPT.autoClear = false;
    this._cdfxPT.setTexture("cdfy", this._cdfyPT);
    this._cdfxPT.refreshRate = 0;
    this._cdfxPT.wrapU = 0;
    this._scaledLuminancePT = new ProceduralTexture("iblScaledLuminance", { width: size.width, height: size.height }, "iblScaledLuminance", this._scene, { ...cdfOptions, samplingMode: 3, generateMipMaps: true }, true, false);
    this._scaledLuminancePT.autoClear = false;
    this._scaledLuminancePT.setTexture("iblSource", this._iblSource);
    this._scaledLuminancePT.setInt("iblHeight", size.height);
    this._scaledLuminancePT.setInt("iblWidth", size.width);
    this._scaledLuminancePT.refreshRate = 0;
    if (this._iblSource.isCube) {
      this._scaledLuminancePT.defines = "#define IBL_USE_CUBE_MAP\n";
    }
    this._icdfPT = new ProceduralTexture("icdfTexture", { width: size.width, height: size.height }, "iblIcdf", this._scene, icdfOptions, false, false);
    this._icdfPT.autoClear = false;
    this._icdfPT.setTexture("cdfy", this._cdfyPT);
    this._icdfPT.setTexture("cdfx", this._cdfxPT);
    this._icdfPT.setTexture("iblSource", this._iblSource);
    this._icdfPT.setTexture("scaledLuminanceSampler", this._scaledLuminancePT);
    this._icdfPT.refreshRate = 0;
    this._icdfPT.wrapV = 0;
    this._icdfPT.wrapU = 0;
    if (this._iblSource.isCube) {
      this._icdfPT.defines = "#define IBL_USE_CUBE_MAP\n";
    }
    this._icdfPT.onGeneratedObservable.addOnce(() => {
      this.onGeneratedObservable.notifyObservers();
    });
  }
  _disposeTextures() {
    var _a, _b, _c, _d;
    (_a = this._cdfyPT) == null ? void 0 : _a.dispose();
    (_b = this._cdfxPT) == null ? void 0 : _b.dispose();
    (_c = this._icdfPT) == null ? void 0 : _c.dispose();
    (_d = this._scaledLuminancePT) == null ? void 0 : _d.dispose();
  }
  _createDebugPass() {
    var _a, _b, _c;
    if (this._debugPass) {
      this._debugPass.dispose();
    }
    const isWebGPU = this._engine.isWebGPU;
    const debugOptions = {
      width: this._engine.getRenderWidth(),
      height: this._engine.getRenderHeight(),
      samplingMode: Texture.BILINEAR_SAMPLINGMODE,
      engine: this._engine,
      textureType: 0,
      uniforms: ["sizeParams"],
      samplers: ["cdfy", "icdf", "cdfx", "iblSource"],
      defines: ((_a = this._iblSource) == null ? void 0 : _a.isCube) ? "#define IBL_USE_CUBE_MAP\n" : "",
      shaderLanguage: isWebGPU ? 1 : 0,
      extraInitializations: (useWebGPU, list) => {
        if (useWebGPU) {
          list.push(__vitePreload(() => import("./iblCdfDebug.fragment.CITQCybG.js"), true ? __vite__mapDeps([20,1,2]) : void 0, import.meta.url));
        } else {
          list.push(__vitePreload(() => import("./iblCdfDebug.fragment.1sDzNUfZ.js"), true ? __vite__mapDeps([21,1,2]) : void 0, import.meta.url));
        }
      }
    };
    this._debugPass = new PostProcess(this._debugPassName, "iblCdfDebug", debugOptions);
    const debugEffect = this._debugPass.getEffect();
    if (debugEffect) {
      debugEffect.defines = ((_b = this._iblSource) == null ? void 0 : _b.isCube) ? "#define IBL_USE_CUBE_MAP\n" : "";
    }
    if ((_c = this._iblSource) == null ? void 0 : _c.isCube) {
      this._debugPass.updateEffect("#define IBL_USE_CUBE_MAP\n");
    }
    this._debugPass.onApplyObservable.add((effect) => {
      effect.setTexture("cdfy", this._cdfyPT);
      effect.setTexture("icdf", this._icdfPT);
      effect.setTexture("cdfx", this._cdfxPT);
      effect.setTexture("iblSource", this._iblSource);
      effect.setFloat4("sizeParams", this._debugSizeParams.x, this._debugSizeParams.y, this._debugSizeParams.z, this._debugSizeParams.w);
    });
  }
  /**
   * Checks if the CDF renderer is ready
   * @returns true if the CDF renderer is ready
   */
  isReady() {
    return this._iblSource && this._iblSource.name !== "Placeholder IBL Source" && this._iblSource.isReady() && this._cdfyPT && this._cdfyPT.isReady() && this._icdfPT && this._icdfPT.isReady() && this._cdfxPT && this._cdfxPT.isReady() && this._scaledLuminancePT && this._scaledLuminancePT.isReady();
  }
  /**
   * Explicitly trigger generation of CDF maps when they are ready to render.
   * @returns Promise that resolves when the CDF maps are rendered.
   */
  renderWhenReady() {
    this._icdfPT.onGeneratedObservable.addOnce(() => {
      this.onGeneratedObservable.notifyObservers();
    });
    const promises = [];
    const renderTargets = [this._cdfyPT, this._cdfxPT, this._scaledLuminancePT, this._icdfPT];
    renderTargets.forEach((target) => {
      promises.push(new Promise((resolve) => {
        if (target.isReady()) {
          resolve();
        } else {
          target.getEffect().executeWhenCompiled(() => {
            resolve();
          });
        }
      }));
    });
    return Promise.all(promises).then(() => {
      renderTargets.forEach((target) => {
        target.render();
      });
    });
  }
  /**
   * Disposes the CDF renderer and associated resources
   */
  dispose() {
    this._disposeTextures();
    this._dummyTexture.dispose();
    if (this._debugPass) {
      this._debugPass.dispose();
    }
    this.onGeneratedObservable.clear();
  }
  static _IsScene(sceneOrEngine) {
    return sceneOrEngine.getClassName() === "Scene";
  }
}
IblCdfGenerator._SceneComponentInitialization = (_) => {
  throw _WarnImport("IblCdfGeneratorSceneComponentSceneComponent");
};
class HDRIrradianceFiltering {
  /**
   * Instantiates HDR filter for irradiance map
   *
   * @param engine Thin engine
   * @param options Options
   */
  constructor(engine, options = {}) {
    this.quality = 4096;
    this.hdrScale = 1;
    this.useCdf = false;
    this._engine = engine;
    this.hdrScale = options.hdrScale || this.hdrScale;
    this.quality = options.quality || this.quality;
    this.useCdf = options.useCdf || this.useCdf;
  }
  _createRenderTarget(size) {
    let textureType = 0;
    if (this._engine.getCaps().textureHalfFloatRender) {
      textureType = 2;
    } else if (this._engine.getCaps().textureFloatRender) {
      textureType = 1;
    }
    const rtWrapper = this._engine.createRenderTargetCubeTexture(size, {
      format: 5,
      type: textureType,
      createMipMaps: false,
      generateMipMaps: false,
      generateDepthBuffer: false,
      generateStencilBuffer: false,
      samplingMode: 2,
      label: "HDR_Irradiance_Filtering_Target"
    });
    this._engine.updateTextureWrappingMode(rtWrapper.texture, 0, 0, 0);
    return rtWrapper;
  }
  _prefilterInternal(texture) {
    const width = texture.getSize().width;
    const mipmapsCount = ILog2(width);
    const effect = this._effectWrapper.effect;
    const irradianceSize = Math.max(32, 1 << ILog2(width >> 3));
    const outputTexture = this._createRenderTarget(irradianceSize);
    this._effectRenderer.saveStates();
    this._effectRenderer.setViewport();
    this._effectRenderer.applyEffectWrapper(this._effectWrapper);
    const directions = [
      [new Vector3(0, 0, -1), new Vector3(0, -1, 0), new Vector3(1, 0, 0)],
      // PositiveX
      [new Vector3(0, 0, 1), new Vector3(0, -1, 0), new Vector3(-1, 0, 0)],
      // NegativeX
      [new Vector3(1, 0, 0), new Vector3(0, 0, 1), new Vector3(0, 1, 0)],
      // PositiveY
      [new Vector3(1, 0, 0), new Vector3(0, 0, -1), new Vector3(0, -1, 0)],
      // NegativeY
      [new Vector3(1, 0, 0), new Vector3(0, -1, 0), new Vector3(0, 0, 1)],
      // PositiveZ
      [new Vector3(-1, 0, 0), new Vector3(0, -1, 0), new Vector3(0, 0, -1)]
      // NegativeZ
    ];
    effect.setFloat("hdrScale", this.hdrScale);
    effect.setFloat2("vFilteringInfo", texture.getSize().width, mipmapsCount);
    effect.setTexture("inputTexture", texture);
    if (this._cdfGenerator) {
      effect.setTexture("icdfTexture", this._cdfGenerator.getIcdfTexture());
    }
    for (let face = 0; face < 6; face++) {
      effect.setVector3("up", directions[face][0]);
      effect.setVector3("right", directions[face][1]);
      effect.setVector3("front", directions[face][2]);
      this._engine.bindFramebuffer(outputTexture, face, void 0, void 0, true);
      this._effectRenderer.applyEffectWrapper(this._effectWrapper);
      this._effectRenderer.draw();
    }
    this._effectRenderer.restoreStates();
    this._engine.restoreDefaultFramebuffer();
    effect.setTexture("inputTexture", null);
    effect.setTexture("icdfTexture", null);
    const irradianceTexture = new BaseTexture(texture.getScene(), outputTexture.texture);
    irradianceTexture.name = texture.name + "_irradiance";
    irradianceTexture.displayName = texture.name + "_irradiance";
    irradianceTexture.gammaSpace = false;
    return irradianceTexture;
  }
  _createEffect(texture, onCompiled) {
    const defines = [];
    if (texture.gammaSpace) {
      defines.push("#define GAMMA_INPUT");
    }
    defines.push("#define NUM_SAMPLES " + this.quality + "u");
    const isWebGPU = this._engine.isWebGPU;
    const samplers = ["inputTexture"];
    if (this._cdfGenerator) {
      samplers.push("icdfTexture");
      defines.push("#define IBL_CDF_FILTERING");
    }
    const effectWrapper = new EffectWrapper({
      engine: this._engine,
      name: "HDRIrradianceFiltering",
      vertexShader: "hdrIrradianceFiltering",
      fragmentShader: "hdrIrradianceFiltering",
      samplerNames: samplers,
      uniformNames: ["vSampleDirections", "vWeights", "up", "right", "front", "vFilteringInfo", "hdrScale"],
      useShaderStore: true,
      defines,
      onCompiled,
      shaderLanguage: isWebGPU ? 1 : 0,
      extraInitializationsAsync: async () => {
        if (isWebGPU) {
          await Promise.all([__vitePreload(() => import("./hdrIrradianceFiltering.vertex.CaY-6gfL.js"), true ? __vite__mapDeps([22,1,2]) : void 0, import.meta.url), __vitePreload(() => import("./hdrIrradianceFiltering.fragment.DoX0YdDe.js"), true ? __vite__mapDeps([23,1,2,4,5]) : void 0, import.meta.url)]);
        } else {
          await Promise.all([__vitePreload(() => import("./hdrIrradianceFiltering.vertex.HH5n6v_t.js"), true ? __vite__mapDeps([24,1,2]) : void 0, import.meta.url), __vitePreload(() => import("./hdrIrradianceFiltering.fragment.DqULPZQT.js"), true ? __vite__mapDeps([25,1,2,8,9]) : void 0, import.meta.url)]);
        }
      }
    });
    return effectWrapper;
  }
  /**
   * Get a value indicating if the filter is ready to be used
   * @param texture Texture to filter
   * @returns true if the filter is ready
   */
  isReady(texture) {
    return texture.isReady() && this._effectWrapper.effect.isReady();
  }
  /**
   * Prefilters a cube texture to contain IBL irradiance.
   * Prefiltering will be invoked at the end of next rendering pass.
   * This has to be done once the map is loaded, and has not been prefiltered by a third party software.
   * See http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf for more information
   * @param texture Texture to filter
   * @returns Promise called when prefiltering is done
   */
  async prefilter(texture) {
    var _a;
    if (!this._engine._features.allowTexturePrefiltering) {
      throw new Error("HDR prefiltering is not available in WebGL 1., you can use real time filtering instead.");
    }
    if (this.useCdf) {
      this._cdfGenerator = new IblCdfGenerator(this._engine);
      this._cdfGenerator.iblSource = texture;
      await this._cdfGenerator.renderWhenReady();
    }
    this._effectRenderer = new EffectRenderer(this._engine);
    this._effectWrapper = this._createEffect(texture);
    await this._effectWrapper.effect.whenCompiledAsync();
    const irradianceTexture = this._prefilterInternal(texture);
    this._effectRenderer.dispose();
    this._effectWrapper.dispose();
    (_a = this._cdfGenerator) == null ? void 0 : _a.dispose();
    return irradianceTexture;
  }
}
class HDRCubeTexture extends BaseTexture {
  /**
   * Sets whether or not the texture is blocking during loading.
   */
  set isBlocking(value) {
    this._isBlocking = value;
  }
  /**
   * Gets whether or not the texture is blocking during loading.
   */
  get isBlocking() {
    return this._isBlocking;
  }
  /**
   * Sets texture matrix rotation angle around Y axis in radians.
   */
  set rotationY(value) {
    this._rotationY = value;
    this.setReflectionTextureMatrix(Matrix.RotationY(this._rotationY));
  }
  /**
   * Gets texture matrix rotation angle around Y axis radians.
   */
  get rotationY() {
    return this._rotationY;
  }
  /**
   * Gets or sets the size of the bounding box associated with the cube texture
   * When defined, the cubemap will switch to local mode
   * @see https://community.arm.com/graphics/b/blog/posts/reflections-based-on-local-cubemaps-in-unity
   * @example https://www.babylonjs-playground.com/#RNASML
   */
  set boundingBoxSize(value) {
    if (this._boundingBoxSize && this._boundingBoxSize.equals(value)) {
      return;
    }
    this._boundingBoxSize = value;
    const scene = this.getScene();
    if (scene) {
      scene.markAllMaterialsAsDirty(1);
    }
  }
  get boundingBoxSize() {
    return this._boundingBoxSize;
  }
  /**
   * Instantiates an HDRTexture from the following parameters.
   *
   * @param url The location of the HDR raw data (Panorama stored in RGBE format)
   * @param sceneOrEngine The scene or engine the texture will be used in
   * @param size The cubemap desired size (the more it increases the longer the generation will be)
   * @param noMipmap Forces to not generate the mipmap if true
   * @param generateHarmonics Specifies whether you want to extract the polynomial harmonics during the generation process
   * @param gammaSpace Specifies if the texture will be use in gamma or linear space (the PBR material requires those texture in linear space, but the standard material would require them in Gamma space)
   * @param prefilterOnLoad Prefilters HDR texture to allow use of this texture as a PBR reflection texture.
   * @param onLoad on success callback function
   * @param onError on error callback function
   * @param supersample Defines if texture must be supersampled (default: false)
   * @param prefilterIrradianceOnLoad Prefilters HDR texture to allow use of this texture for irradiance lighting.
   * @param prefilterUsingCdf Defines if the prefiltering should be done using a CDF instead of the default approach.
   */
  constructor(url, sceneOrEngine, size, noMipmap = false, generateHarmonics = true, gammaSpace = false, prefilterOnLoad = false, onLoad = null, onError = null, supersample = false, prefilterIrradianceOnLoad = false, prefilterUsingCdf = false) {
    var _a;
    super(sceneOrEngine);
    this._generateHarmonics = true;
    this._onError = null;
    this._isBlocking = true;
    this._rotationY = 0;
    this.boundingBoxPosition = Vector3.Zero();
    this.onLoadObservable = new Observable();
    if (!url) {
      return;
    }
    this._coordinatesMode = Texture.CUBIC_MODE;
    this.name = url;
    this.url = url;
    this.hasAlpha = false;
    this.isCube = true;
    this._textureMatrix = Matrix.Identity();
    this._prefilterOnLoad = prefilterOnLoad;
    this._prefilterIrradianceOnLoad = prefilterIrradianceOnLoad;
    this._prefilterUsingCdf = prefilterUsingCdf;
    this._onLoad = () => {
      this.onLoadObservable.notifyObservers(this);
      if (onLoad) {
        onLoad();
      }
    };
    this._onError = onError;
    this.gammaSpace = gammaSpace;
    this._noMipmap = noMipmap;
    this._size = size;
    this._supersample = supersample || prefilterUsingCdf;
    this._generateHarmonics = generateHarmonics;
    this._texture = this._getFromCache(url, this._noMipmap, void 0, void 0, void 0, this.isCube);
    if (!this._texture) {
      if (!((_a = this.getScene()) == null ? void 0 : _a.useDelayedTextureLoading)) {
        this._loadTexture();
      } else {
        this.delayLoadState = 4;
      }
    } else {
      if (this._texture.isReady) {
        Tools.SetImmediate(() => this._onLoad());
      } else {
        this._texture.onLoadedObservable.add(this._onLoad);
      }
    }
  }
  /**
   * Get the current class name of the texture useful for serialization or dynamic coding.
   * @returns "HDRCubeTexture"
   */
  getClassName() {
    return "HDRCubeTexture";
  }
  /**
   * Occurs when the file is raw .hdr file.
   */
  _loadTexture() {
    const engine = this._getEngine();
    const caps = engine.getCaps();
    let textureType = 0;
    if (caps.textureFloat && caps.textureFloatLinearFiltering) {
      textureType = 1;
    } else if (caps.textureHalfFloat && caps.textureHalfFloatLinearFiltering) {
      textureType = 2;
    }
    const callback = (buffer) => {
      this.lodGenerationOffset = 0;
      this.lodGenerationScale = 0.8;
      const data = GetCubeMapTextureData(buffer, this._size, this._supersample);
      if (this._generateHarmonics) {
        const sphericalPolynomial = CubeMapToSphericalPolynomialTools.ConvertCubeMapToSphericalPolynomial(data);
        this.sphericalPolynomial = sphericalPolynomial;
      }
      const results = [];
      let byteArray = null;
      let shortArray = null;
      for (let j = 0; j < 6; j++) {
        if (textureType === 2) {
          shortArray = new Uint16Array(this._size * this._size * 3);
        } else if (textureType === 0) {
          byteArray = new Uint8Array(this._size * this._size * 3);
        }
        const dataFace = data[HDRCubeTexture._FacesMapping[j]];
        if (this.gammaSpace || shortArray || byteArray) {
          for (let i = 0; i < this._size * this._size; i++) {
            if (this.gammaSpace) {
              dataFace[i * 3 + 0] = Math.pow(dataFace[i * 3 + 0], ToGammaSpace);
              dataFace[i * 3 + 1] = Math.pow(dataFace[i * 3 + 1], ToGammaSpace);
              dataFace[i * 3 + 2] = Math.pow(dataFace[i * 3 + 2], ToGammaSpace);
            }
            if (shortArray) {
              shortArray[i * 3 + 0] = ToHalfFloat(dataFace[i * 3 + 0]);
              shortArray[i * 3 + 1] = ToHalfFloat(dataFace[i * 3 + 1]);
              shortArray[i * 3 + 2] = ToHalfFloat(dataFace[i * 3 + 2]);
            }
            if (byteArray) {
              let r = Math.max(dataFace[i * 3 + 0] * 255, 0);
              let g = Math.max(dataFace[i * 3 + 1] * 255, 0);
              let b = Math.max(dataFace[i * 3 + 2] * 255, 0);
              const max = Math.max(Math.max(r, g), b);
              if (max > 255) {
                const scale = 255 / max;
                r *= scale;
                g *= scale;
                b *= scale;
              }
              byteArray[i * 3 + 0] = r;
              byteArray[i * 3 + 1] = g;
              byteArray[i * 3 + 2] = b;
            }
          }
        }
        if (shortArray) {
          results.push(shortArray);
        } else if (byteArray) {
          results.push(byteArray);
        } else {
          results.push(dataFace);
        }
      }
      return results;
    };
    if (engine._features.allowTexturePrefiltering && (this._prefilterOnLoad || this._prefilterIrradianceOnLoad)) {
      const previousOnLoad = this._onLoad;
      const hdrFiltering = new HDRFiltering(engine);
      this._onLoad = () => {
        let irradiancePromise = Promise.resolve(null);
        let radiancePromise = Promise.resolve();
        if (this._prefilterIrradianceOnLoad) {
          const hdrIrradianceFiltering = new HDRIrradianceFiltering(engine, { useCdf: this._prefilterUsingCdf });
          irradiancePromise = hdrIrradianceFiltering.prefilter(this);
        }
        if (this._prefilterOnLoad) {
          radiancePromise = hdrFiltering.prefilter(this);
        }
        Promise.all([irradiancePromise, radiancePromise]).then((results) => {
          const irradianceTexture = results[0];
          if (this._prefilterIrradianceOnLoad && irradianceTexture) {
            this.irradianceTexture = irradianceTexture;
            const scene = this.getScene();
            if (scene) {
              scene.markAllMaterialsAsDirty(1);
            }
          }
          if (previousOnLoad) {
            previousOnLoad();
          }
        });
      };
    }
    this._texture = engine.createRawCubeTextureFromUrl(this.url, this.getScene(), this._size, 4, textureType, this._noMipmap, callback, null, this._onLoad, this._onError);
  }
  clone() {
    const newTexture = new HDRCubeTexture(this.url, this.getScene() || this._getEngine(), this._size, this._noMipmap, this._generateHarmonics, this.gammaSpace);
    newTexture.level = this.level;
    newTexture.wrapU = this.wrapU;
    newTexture.wrapV = this.wrapV;
    newTexture.coordinatesIndex = this.coordinatesIndex;
    newTexture.coordinatesMode = this.coordinatesMode;
    return newTexture;
  }
  // Methods
  delayLoad() {
    if (this.delayLoadState !== 4) {
      return;
    }
    this.delayLoadState = 1;
    this._texture = this._getFromCache(this.url, this._noMipmap);
    if (!this._texture) {
      this._loadTexture();
    }
  }
  /**
   * Get the texture reflection matrix used to rotate/transform the reflection.
   * @returns the reflection matrix
   */
  getReflectionTextureMatrix() {
    return this._textureMatrix;
  }
  /**
   * Set the texture reflection matrix used to rotate/transform the reflection.
   * @param value Define the reflection matrix to set
   */
  setReflectionTextureMatrix(value) {
    var _a;
    this._textureMatrix = value;
    if (value.updateFlag === this._textureMatrix.updateFlag) {
      return;
    }
    if (value.isIdentity() !== this._textureMatrix.isIdentity()) {
      (_a = this.getScene()) == null ? void 0 : _a.markAllMaterialsAsDirty(1, (mat) => mat.getActiveTextures().indexOf(this) !== -1);
    }
  }
  /**
   * Dispose the texture and release its associated resources.
   */
  dispose() {
    this.onLoadObservable.clear();
    super.dispose();
  }
  /**
   * Parses a JSON representation of an HDR Texture in order to create the texture
   * @param parsedTexture Define the JSON representation
   * @param scene Define the scene the texture should be created in
   * @param rootUrl Define the root url in case we need to load relative dependencies
   * @returns the newly created texture after parsing
   */
  static Parse(parsedTexture, scene, rootUrl) {
    let texture = null;
    if (parsedTexture.name && !parsedTexture.isRenderTarget) {
      texture = new HDRCubeTexture(rootUrl + parsedTexture.name, scene, parsedTexture.size, parsedTexture.noMipmap, parsedTexture.generateHarmonics, parsedTexture.useInGammaSpace);
      texture.name = parsedTexture.name;
      texture.hasAlpha = parsedTexture.hasAlpha;
      texture.level = parsedTexture.level;
      texture.coordinatesMode = parsedTexture.coordinatesMode;
      texture.isBlocking = parsedTexture.isBlocking;
    }
    if (texture) {
      if (parsedTexture.boundingBoxPosition) {
        texture.boundingBoxPosition = Vector3.FromArray(parsedTexture.boundingBoxPosition);
      }
      if (parsedTexture.boundingBoxSize) {
        texture.boundingBoxSize = Vector3.FromArray(parsedTexture.boundingBoxSize);
      }
      if (parsedTexture.rotationY) {
        texture.rotationY = parsedTexture.rotationY;
      }
    }
    return texture;
  }
  serialize() {
    if (!this.name) {
      return null;
    }
    const serializationObject = {};
    serializationObject.name = this.name;
    serializationObject.hasAlpha = this.hasAlpha;
    serializationObject.isCube = true;
    serializationObject.level = this.level;
    serializationObject.size = this._size;
    serializationObject.coordinatesMode = this.coordinatesMode;
    serializationObject.useInGammaSpace = this.gammaSpace;
    serializationObject.generateHarmonics = this._generateHarmonics;
    serializationObject.customType = "BABYLON.HDRCubeTexture";
    serializationObject.noMipmap = this._noMipmap;
    serializationObject.isBlocking = this._isBlocking;
    serializationObject.rotationY = this._rotationY;
    return serializationObject;
  }
}
HDRCubeTexture._FacesMapping = ["right", "left", "up", "down", "front", "back"];
RegisterClass("BABYLON.HDRCubeTexture", HDRCubeTexture);
export {
  HDRCubeTexture
};
