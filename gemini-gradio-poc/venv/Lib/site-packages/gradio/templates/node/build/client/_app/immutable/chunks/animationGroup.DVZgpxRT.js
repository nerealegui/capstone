import { ap as Animation, M as Matrix, aW as _staticOffsetValueColor4, aX as _staticOffsetValueColor3, aY as _staticOffsetValueSize, aZ as _staticOffsetValueVector2, a_ as _staticOffsetValueVector3, a$ as _staticOffsetValueQuaternion, b0 as PrecisionDate, O as Observable, Q as Quaternion, a as TmpVectors, V as Vector3, p as Scene, ak as EngineStore, aP as Tags } from "./index.B4f7kVg_.js";
import { B as Bone } from "./bone.BcduFHgb.js";
class RuntimeAnimation {
  /**
   * Gets the current frame of the runtime animation
   */
  get currentFrame() {
    return this._currentFrame;
  }
  /**
   * Gets the weight of the runtime animation
   */
  get weight() {
    return this._weight;
  }
  /**
   * Gets the current value of the runtime animation
   */
  get currentValue() {
    return this._currentValue;
  }
  /**
   * Gets or sets the target path of the runtime animation
   */
  get targetPath() {
    return this._targetPath;
  }
  /**
   * Gets the actual target of the runtime animation
   */
  get target() {
    return this._currentActiveTarget;
  }
  /**
   * Gets the additive state of the runtime animation
   */
  get isAdditive() {
    return this._host && this._host.isAdditive;
  }
  /**
   * Create a new RuntimeAnimation object
   * @param target defines the target of the animation
   * @param animation defines the source animation object
   * @param scene defines the hosting scene
   * @param host defines the initiating Animatable
   */
  constructor(target, animation, scene, host) {
    this._events = new Array();
    this._currentFrame = 0;
    this._originalValue = new Array();
    this._originalBlendValue = null;
    this._offsetsCache = {};
    this._highLimitsCache = {};
    this._stopped = false;
    this._blendingFactor = 0;
    this._currentValue = null;
    this._currentActiveTarget = null;
    this._directTarget = null;
    this._targetPath = "";
    this._weight = 1;
    this._absoluteFrameOffset = 0;
    this._previousElapsedTime = 0;
    this._yoyoDirection = 1;
    this._previousAbsoluteFrame = 0;
    this._targetIsArray = false;
    this._animation = animation;
    this._target = target;
    this._scene = scene;
    this._host = host;
    this._activeTargets = [];
    animation._runtimeAnimations.push(this);
    this._animationState = {
      key: 0,
      repeatCount: 0,
      loopMode: this._getCorrectLoopMode()
    };
    if (this._animation.dataType === Animation.ANIMATIONTYPE_MATRIX) {
      this._animationState.workValue = Matrix.Zero();
    }
    this._keys = this._animation.getKeys();
    this._minFrame = this._keys[0].frame;
    this._maxFrame = this._keys[this._keys.length - 1].frame;
    this._minValue = this._keys[0].value;
    this._maxValue = this._keys[this._keys.length - 1].value;
    if (this._minFrame !== 0) {
      const newKey = { frame: 0, value: this._minValue };
      this._keys.splice(0, 0, newKey);
    }
    if (this._target instanceof Array) {
      let index = 0;
      for (const target2 of this._target) {
        this._preparePath(target2, index);
        this._getOriginalValues(index);
        index++;
      }
      this._targetIsArray = true;
    } else {
      this._preparePath(this._target);
      this._getOriginalValues();
      this._targetIsArray = false;
      this._directTarget = this._activeTargets[0];
    }
    const events = animation.getEvents();
    if (events && events.length > 0) {
      events.forEach((e) => {
        this._events.push(e._clone());
      });
    }
    this._enableBlending = target && target.animationPropertiesOverride ? target.animationPropertiesOverride.enableBlending : this._animation.enableBlending;
  }
  _preparePath(target, targetIndex = 0) {
    const targetPropertyPath = this._animation.targetPropertyPath;
    if (targetPropertyPath.length > 1) {
      let property = target;
      for (let index = 0; index < targetPropertyPath.length - 1; index++) {
        const name = targetPropertyPath[index];
        property = property[name];
        if (property === void 0) {
          throw new Error(`Invalid property (${name}) in property path (${targetPropertyPath.join(".")})`);
        }
      }
      this._targetPath = targetPropertyPath[targetPropertyPath.length - 1];
      this._activeTargets[targetIndex] = property;
    } else {
      this._targetPath = targetPropertyPath[0];
      this._activeTargets[targetIndex] = target;
    }
    if (this._activeTargets[targetIndex][this._targetPath] === void 0) {
      throw new Error(`Invalid property (${this._targetPath}) in property path (${targetPropertyPath.join(".")})`);
    }
  }
  /**
   * Gets the animation from the runtime animation
   */
  get animation() {
    return this._animation;
  }
  /**
   * Resets the runtime animation to the beginning
   * @param restoreOriginal defines whether to restore the target property to the original value
   */
  reset(restoreOriginal = false) {
    if (restoreOriginal) {
      if (this._target instanceof Array) {
        let index = 0;
        for (const target of this._target) {
          if (this._originalValue[index] !== void 0) {
            this._setValue(target, this._activeTargets[index], this._originalValue[index], -1, index);
          }
          index++;
        }
      } else {
        if (this._originalValue[0] !== void 0) {
          this._setValue(this._target, this._directTarget, this._originalValue[0], -1, 0);
        }
      }
    }
    this._offsetsCache = {};
    this._highLimitsCache = {};
    this._currentFrame = 0;
    this._blendingFactor = 0;
    for (let index = 0; index < this._events.length; index++) {
      this._events[index].isDone = false;
    }
  }
  /**
   * Specifies if the runtime animation is stopped
   * @returns Boolean specifying if the runtime animation is stopped
   */
  isStopped() {
    return this._stopped;
  }
  /**
   * Disposes of the runtime animation
   */
  dispose() {
    const index = this._animation.runtimeAnimations.indexOf(this);
    if (index > -1) {
      this._animation.runtimeAnimations.splice(index, 1);
    }
  }
  /**
   * Apply the interpolated value to the target
   * @param currentValue defines the value computed by the animation
   * @param weight defines the weight to apply to this value (Defaults to 1.0)
   */
  setValue(currentValue, weight) {
    if (this._targetIsArray) {
      for (let index = 0; index < this._target.length; index++) {
        const target = this._target[index];
        this._setValue(target, this._activeTargets[index], currentValue, weight, index);
      }
      return;
    }
    this._setValue(this._target, this._directTarget, currentValue, weight, 0);
  }
  _getOriginalValues(targetIndex = 0) {
    let originalValue;
    const target = this._activeTargets[targetIndex];
    if (target.getLocalMatrix && this._targetPath === "_matrix") {
      originalValue = target.getLocalMatrix();
    } else {
      originalValue = target[this._targetPath];
    }
    if (originalValue && originalValue.clone) {
      this._originalValue[targetIndex] = originalValue.clone();
    } else {
      this._originalValue[targetIndex] = originalValue;
    }
  }
  _registerTargetForLateAnimationBinding(runtimeAnimation, originalValue) {
    const target = runtimeAnimation.target;
    this._scene._registeredForLateAnimationBindings.pushNoDuplicate(target);
    if (!target._lateAnimationHolders) {
      target._lateAnimationHolders = {};
    }
    if (!target._lateAnimationHolders[runtimeAnimation.targetPath]) {
      target._lateAnimationHolders[runtimeAnimation.targetPath] = {
        totalWeight: 0,
        totalAdditiveWeight: 0,
        animations: [],
        additiveAnimations: [],
        originalValue
      };
    }
    if (runtimeAnimation.isAdditive) {
      target._lateAnimationHolders[runtimeAnimation.targetPath].additiveAnimations.push(runtimeAnimation);
      target._lateAnimationHolders[runtimeAnimation.targetPath].totalAdditiveWeight += runtimeAnimation.weight;
    } else {
      target._lateAnimationHolders[runtimeAnimation.targetPath].animations.push(runtimeAnimation);
      target._lateAnimationHolders[runtimeAnimation.targetPath].totalWeight += runtimeAnimation.weight;
    }
  }
  _setValue(target, destination, currentValue, weight, targetIndex) {
    this._currentActiveTarget = destination;
    this._weight = weight;
    if (this._enableBlending && this._blendingFactor <= 1) {
      if (!this._originalBlendValue) {
        const originalValue = destination[this._targetPath];
        if (originalValue.clone) {
          this._originalBlendValue = originalValue.clone();
        } else {
          this._originalBlendValue = originalValue;
        }
      }
      if (this._originalBlendValue.m) {
        if (Animation.AllowMatrixDecomposeForInterpolation) {
          if (this._currentValue) {
            Matrix.DecomposeLerpToRef(this._originalBlendValue, currentValue, this._blendingFactor, this._currentValue);
          } else {
            this._currentValue = Matrix.DecomposeLerp(this._originalBlendValue, currentValue, this._blendingFactor);
          }
        } else {
          if (this._currentValue) {
            Matrix.LerpToRef(this._originalBlendValue, currentValue, this._blendingFactor, this._currentValue);
          } else {
            this._currentValue = Matrix.Lerp(this._originalBlendValue, currentValue, this._blendingFactor);
          }
        }
      } else {
        this._currentValue = Animation._UniversalLerp(this._originalBlendValue, currentValue, this._blendingFactor);
      }
      const blendingSpeed = target && target.animationPropertiesOverride ? target.animationPropertiesOverride.blendingSpeed : this._animation.blendingSpeed;
      this._blendingFactor += blendingSpeed;
    } else {
      if (!this._currentValue) {
        if (currentValue == null ? void 0 : currentValue.clone) {
          this._currentValue = currentValue.clone();
        } else {
          this._currentValue = currentValue;
        }
      } else if (this._currentValue.copyFrom) {
        this._currentValue.copyFrom(currentValue);
      } else {
        this._currentValue = currentValue;
      }
    }
    if (weight !== -1) {
      this._registerTargetForLateAnimationBinding(this, this._originalValue[targetIndex]);
    } else {
      if (this._animationState.loopMode === Animation.ANIMATIONLOOPMODE_RELATIVE_FROM_CURRENT) {
        if (this._currentValue.addToRef) {
          this._currentValue.addToRef(this._originalValue[targetIndex], destination[this._targetPath]);
        } else {
          destination[this._targetPath] = this._originalValue[targetIndex] + this._currentValue;
        }
      } else {
        destination[this._targetPath] = this._currentValue;
      }
    }
    if (target.markAsDirty) {
      target.markAsDirty(this._animation.targetProperty);
    }
  }
  /**
   * Gets the loop pmode of the runtime animation
   * @returns Loop Mode
   */
  _getCorrectLoopMode() {
    if (this._target && this._target.animationPropertiesOverride) {
      return this._target.animationPropertiesOverride.loopMode;
    }
    return this._animation.loopMode;
  }
  /**
   * Move the current animation to a given frame
   * @param frame defines the frame to move to
   * @param weight defines the weight to apply to the animation (-1.0 by default)
   */
  goToFrame(frame, weight = -1) {
    const keys = this._animation.getKeys();
    if (frame < keys[0].frame) {
      frame = keys[0].frame;
    } else if (frame > keys[keys.length - 1].frame) {
      frame = keys[keys.length - 1].frame;
    }
    const events = this._events;
    if (events.length) {
      for (let index = 0; index < events.length; index++) {
        if (!events[index].onlyOnce) {
          events[index].isDone = events[index].frame < frame;
        }
      }
    }
    this._currentFrame = frame;
    const currentValue = this._animation._interpolate(frame, this._animationState);
    this.setValue(currentValue, weight);
  }
  /**
   * @internal Internal use only
   */
  _prepareForSpeedRatioChange(newSpeedRatio) {
    const newAbsoluteFrame = this._previousElapsedTime * (this._animation.framePerSecond * newSpeedRatio) / 1e3;
    this._absoluteFrameOffset = this._previousAbsoluteFrame - newAbsoluteFrame;
  }
  /**
   * Execute the current animation
   * @param elapsedTimeSinceAnimationStart defines the elapsed time (in milliseconds) since the animation was started
   * @param from defines the lower frame of the animation range
   * @param to defines the upper frame of the animation range
   * @param loop defines if the current animation must loop
   * @param speedRatio defines the current speed ratio
   * @param weight defines the weight of the animation (default is -1 so no weight)
   * @returns a boolean indicating if the animation is running
   */
  animate(elapsedTimeSinceAnimationStart, from, to, loop, speedRatio, weight = -1) {
    const animation = this._animation;
    const targetPropertyPath = animation.targetPropertyPath;
    if (!targetPropertyPath || targetPropertyPath.length < 1) {
      this._stopped = true;
      return false;
    }
    let returnValue = true;
    if (from < this._minFrame || from > this._maxFrame) {
      from = this._minFrame;
    }
    if (to < this._minFrame || to > this._maxFrame) {
      to = this._maxFrame;
    }
    const frameRange = to - from;
    let offsetValue;
    let absoluteFrame = elapsedTimeSinceAnimationStart * (animation.framePerSecond * speedRatio) / 1e3 + this._absoluteFrameOffset;
    let highLimitValue = 0;
    let yoyoLoop = false;
    const yoyoMode = loop && this._animationState.loopMode === Animation.ANIMATIONLOOPMODE_YOYO;
    if (yoyoMode) {
      const position = (absoluteFrame - from) / frameRange;
      const sin = Math.sin(position * Math.PI);
      const yoyoPosition = Math.abs(sin);
      absoluteFrame = yoyoPosition * frameRange + from;
      const direction = sin >= 0 ? 1 : -1;
      if (this._yoyoDirection !== direction) {
        yoyoLoop = true;
      }
      this._yoyoDirection = direction;
    }
    this._previousElapsedTime = elapsedTimeSinceAnimationStart;
    this._previousAbsoluteFrame = absoluteFrame;
    if (!loop && to >= from && (absoluteFrame >= frameRange && speedRatio > 0 || absoluteFrame <= 0 && speedRatio < 0)) {
      returnValue = false;
      highLimitValue = animation._getKeyValue(this._maxValue);
    } else if (!loop && from >= to && (absoluteFrame <= frameRange && speedRatio < 0 || absoluteFrame >= 0 && speedRatio > 0)) {
      returnValue = false;
      highLimitValue = animation._getKeyValue(this._minValue);
    } else if (this._animationState.loopMode !== Animation.ANIMATIONLOOPMODE_CYCLE) {
      const keyOffset = to.toString() + from.toString();
      if (!this._offsetsCache[keyOffset]) {
        this._animationState.repeatCount = 0;
        this._animationState.loopMode = Animation.ANIMATIONLOOPMODE_CYCLE;
        const fromValue = animation._interpolate(from, this._animationState);
        const toValue = animation._interpolate(to, this._animationState);
        this._animationState.loopMode = this._getCorrectLoopMode();
        switch (animation.dataType) {
          case Animation.ANIMATIONTYPE_FLOAT:
            this._offsetsCache[keyOffset] = toValue - fromValue;
            break;
          case Animation.ANIMATIONTYPE_QUATERNION:
            this._offsetsCache[keyOffset] = toValue.subtract(fromValue);
            break;
          case Animation.ANIMATIONTYPE_VECTOR3:
            this._offsetsCache[keyOffset] = toValue.subtract(fromValue);
            break;
          case Animation.ANIMATIONTYPE_VECTOR2:
            this._offsetsCache[keyOffset] = toValue.subtract(fromValue);
            break;
          case Animation.ANIMATIONTYPE_SIZE:
            this._offsetsCache[keyOffset] = toValue.subtract(fromValue);
            break;
          case Animation.ANIMATIONTYPE_COLOR3:
            this._offsetsCache[keyOffset] = toValue.subtract(fromValue);
            break;
        }
        this._highLimitsCache[keyOffset] = toValue;
      }
      highLimitValue = this._highLimitsCache[keyOffset];
      offsetValue = this._offsetsCache[keyOffset];
    }
    if (offsetValue === void 0) {
      switch (animation.dataType) {
        case Animation.ANIMATIONTYPE_FLOAT:
          offsetValue = 0;
          break;
        case Animation.ANIMATIONTYPE_QUATERNION:
          offsetValue = _staticOffsetValueQuaternion;
          break;
        case Animation.ANIMATIONTYPE_VECTOR3:
          offsetValue = _staticOffsetValueVector3;
          break;
        case Animation.ANIMATIONTYPE_VECTOR2:
          offsetValue = _staticOffsetValueVector2;
          break;
        case Animation.ANIMATIONTYPE_SIZE:
          offsetValue = _staticOffsetValueSize;
          break;
        case Animation.ANIMATIONTYPE_COLOR3:
          offsetValue = _staticOffsetValueColor3;
          break;
        case Animation.ANIMATIONTYPE_COLOR4:
          offsetValue = _staticOffsetValueColor4;
          break;
      }
    }
    let currentFrame;
    if (this._host && this._host.syncRoot) {
      const syncRoot = this._host.syncRoot;
      const hostNormalizedFrame = (syncRoot.masterFrame - syncRoot.fromFrame) / (syncRoot.toFrame - syncRoot.fromFrame);
      currentFrame = from + frameRange * hostNormalizedFrame;
    } else {
      if (absoluteFrame > 0 && from > to || absoluteFrame < 0 && from < to) {
        currentFrame = returnValue && frameRange !== 0 ? to + absoluteFrame % frameRange : from;
      } else {
        currentFrame = returnValue && frameRange !== 0 ? from + absoluteFrame % frameRange : to;
      }
    }
    const events = this._events;
    if (!yoyoMode && (speedRatio > 0 && this.currentFrame > currentFrame || speedRatio < 0 && this.currentFrame < currentFrame) || yoyoMode && yoyoLoop) {
      this._onLoop();
      for (let index = 0; index < events.length; index++) {
        if (!events[index].onlyOnce) {
          events[index].isDone = false;
        }
      }
      this._animationState.key = speedRatio > 0 ? 0 : animation.getKeys().length - 1;
    }
    this._currentFrame = currentFrame;
    this._animationState.repeatCount = frameRange === 0 ? 0 : absoluteFrame / frameRange >> 0;
    this._animationState.highLimitValue = highLimitValue;
    this._animationState.offsetValue = offsetValue;
    const currentValue = animation._interpolate(currentFrame, this._animationState);
    this.setValue(currentValue, weight);
    if (events.length) {
      for (let index = 0; index < events.length; index++) {
        if (frameRange >= 0 && currentFrame >= events[index].frame && events[index].frame >= from || frameRange < 0 && currentFrame <= events[index].frame && events[index].frame <= from) {
          const event = events[index];
          if (!event.isDone) {
            if (event.onlyOnce) {
              events.splice(index, 1);
              index--;
            }
            event.isDone = true;
            event.action(currentFrame);
          }
        }
      }
    }
    if (!returnValue) {
      this._stopped = true;
    }
    return returnValue;
  }
}
class Animatable {
  /**
   * Gets the root Animatable used to synchronize and normalize animations
   */
  get syncRoot() {
    return this._syncRoot;
  }
  /**
   * Gets the current frame of the first RuntimeAnimation
   * Used to synchronize Animatables
   */
  get masterFrame() {
    if (this._runtimeAnimations.length === 0) {
      return 0;
    }
    return this._runtimeAnimations[0].currentFrame;
  }
  /**
   * Gets or sets the animatable weight (-1.0 by default meaning not weighted)
   */
  get weight() {
    return this._weight;
  }
  set weight(value) {
    if (value === -1) {
      this._weight = -1;
      return;
    }
    this._weight = Math.min(Math.max(value, 0), 1);
  }
  /**
   * Gets or sets the speed ratio to apply to the animatable (1.0 by default)
   */
  get speedRatio() {
    return this._speedRatio;
  }
  set speedRatio(value) {
    for (let index = 0; index < this._runtimeAnimations.length; index++) {
      const animation = this._runtimeAnimations[index];
      animation._prepareForSpeedRatioChange(value);
    }
    this._speedRatio = value;
    if (this._goToFrame !== null) {
      this.goToFrame(this._goToFrame);
    }
  }
  /**
   * Gets the elapsed time since the animatable started in milliseconds
   */
  get elapsedTime() {
    return this._localDelayOffset === null ? 0 : this._scene._animationTime - this._localDelayOffset;
  }
  /**
   * Creates a new Animatable
   * @param scene defines the hosting scene
   * @param target defines the target object
   * @param fromFrame defines the starting frame number (default is 0)
   * @param toFrame defines the ending frame number (default is 100)
   * @param loopAnimation defines if the animation must loop (default is false)
   * @param speedRatio defines the factor to apply to animation speed (default is 1)
   * @param onAnimationEnd defines a callback to call when animation ends if it is not looping
   * @param animations defines a group of animation to add to the new Animatable
   * @param onAnimationLoop defines a callback to call when animation loops
   * @param isAdditive defines whether the animation should be evaluated additively
   * @param playOrder defines the order in which this animatable should be processed in the list of active animatables (default: 0)
   */
  constructor(scene, target, fromFrame = 0, toFrame = 100, loopAnimation = false, speedRatio = 1, onAnimationEnd, animations, onAnimationLoop, isAdditive = false, playOrder = 0) {
    this.target = target;
    this.fromFrame = fromFrame;
    this.toFrame = toFrame;
    this.loopAnimation = loopAnimation;
    this.onAnimationEnd = onAnimationEnd;
    this.onAnimationLoop = onAnimationLoop;
    this.isAdditive = isAdditive;
    this.playOrder = playOrder;
    this._localDelayOffset = null;
    this._pausedDelay = null;
    this._manualJumpDelay = null;
    this._runtimeAnimations = new Array();
    this._paused = false;
    this._speedRatio = 1;
    this._weight = -1;
    this._previousWeight = -1;
    this._syncRoot = null;
    this._frameToSyncFromJump = null;
    this._goToFrame = null;
    this.disposeOnEnd = true;
    this.animationStarted = false;
    this.onAnimationEndObservable = new Observable();
    this.onAnimationLoopObservable = new Observable();
    this._scene = scene;
    if (animations) {
      this.appendAnimations(target, animations);
    }
    this._speedRatio = speedRatio;
    scene._activeAnimatables.push(this);
  }
  // Methods
  /**
   * Synchronize and normalize current Animatable with a source Animatable
   * This is useful when using animation weights and when animations are not of the same length
   * @param root defines the root Animatable to synchronize with (null to stop synchronizing)
   * @returns the current Animatable
   */
  syncWith(root) {
    this._syncRoot = root;
    if (root) {
      const index = this._scene._activeAnimatables.indexOf(this);
      if (index > -1) {
        this._scene._activeAnimatables.splice(index, 1);
        this._scene._activeAnimatables.push(this);
      }
    }
    return this;
  }
  /**
   * Gets the list of runtime animations
   * @returns an array of RuntimeAnimation
   */
  getAnimations() {
    return this._runtimeAnimations;
  }
  /**
   * Adds more animations to the current animatable
   * @param target defines the target of the animations
   * @param animations defines the new animations to add
   */
  appendAnimations(target, animations) {
    for (let index = 0; index < animations.length; index++) {
      const animation = animations[index];
      const newRuntimeAnimation = new RuntimeAnimation(target, animation, this._scene, this);
      newRuntimeAnimation._onLoop = () => {
        this.onAnimationLoopObservable.notifyObservers(this);
        if (this.onAnimationLoop) {
          this.onAnimationLoop();
        }
      };
      this._runtimeAnimations.push(newRuntimeAnimation);
    }
  }
  /**
   * Gets the source animation for a specific property
   * @param property defines the property to look for
   * @returns null or the source animation for the given property
   */
  getAnimationByTargetProperty(property) {
    const runtimeAnimations = this._runtimeAnimations;
    for (let index = 0; index < runtimeAnimations.length; index++) {
      if (runtimeAnimations[index].animation.targetProperty === property) {
        return runtimeAnimations[index].animation;
      }
    }
    return null;
  }
  /**
   * Gets the runtime animation for a specific property
   * @param property defines the property to look for
   * @returns null or the runtime animation for the given property
   */
  getRuntimeAnimationByTargetProperty(property) {
    const runtimeAnimations = this._runtimeAnimations;
    for (let index = 0; index < runtimeAnimations.length; index++) {
      if (runtimeAnimations[index].animation.targetProperty === property) {
        return runtimeAnimations[index];
      }
    }
    return null;
  }
  /**
   * Resets the animatable to its original state
   */
  reset() {
    const runtimeAnimations = this._runtimeAnimations;
    for (let index = 0; index < runtimeAnimations.length; index++) {
      runtimeAnimations[index].reset(true);
    }
    this._localDelayOffset = null;
    this._pausedDelay = null;
  }
  /**
   * Allows the animatable to blend with current running animations
   * @see https://doc.babylonjs.com/features/featuresDeepDive/animation/advanced_animations#animation-blending
   * @param blendingSpeed defines the blending speed to use
   */
  enableBlending(blendingSpeed) {
    const runtimeAnimations = this._runtimeAnimations;
    for (let index = 0; index < runtimeAnimations.length; index++) {
      runtimeAnimations[index].animation.enableBlending = true;
      runtimeAnimations[index].animation.blendingSpeed = blendingSpeed;
    }
  }
  /**
   * Disable animation blending
   * @see https://doc.babylonjs.com/features/featuresDeepDive/animation/advanced_animations#animation-blending
   */
  disableBlending() {
    const runtimeAnimations = this._runtimeAnimations;
    for (let index = 0; index < runtimeAnimations.length; index++) {
      runtimeAnimations[index].animation.enableBlending = false;
    }
  }
  /**
   * Jump directly to a given frame
   * @param frame defines the frame to jump to
   * @param useWeight defines whether the animation weight should be applied to the image to be jumped to (false by default)
   */
  goToFrame(frame, useWeight = false) {
    const runtimeAnimations = this._runtimeAnimations;
    if (runtimeAnimations[0]) {
      const fps = runtimeAnimations[0].animation.framePerSecond;
      this._frameToSyncFromJump = this._frameToSyncFromJump ?? runtimeAnimations[0].currentFrame;
      const delay = this.speedRatio === 0 ? 0 : (frame - this._frameToSyncFromJump) / fps * 1e3 / this.speedRatio;
      this._manualJumpDelay = -delay;
    }
    for (let index = 0; index < runtimeAnimations.length; index++) {
      runtimeAnimations[index].goToFrame(frame, useWeight ? this._weight : -1);
    }
    this._goToFrame = frame;
  }
  /**
   * Returns true if the animations for this animatable are paused
   */
  get paused() {
    return this._paused;
  }
  /**
   * Pause the animation
   */
  pause() {
    if (this._paused) {
      return;
    }
    this._paused = true;
  }
  /**
   * Restart the animation
   */
  restart() {
    this._paused = false;
  }
  _raiseOnAnimationEnd() {
    if (this.onAnimationEnd) {
      this.onAnimationEnd();
    }
    this.onAnimationEndObservable.notifyObservers(this);
  }
  /**
   * Stop and delete the current animation
   * @param animationName defines a string used to only stop some of the runtime animations instead of all
   * @param targetMask a function that determines if the animation should be stopped based on its target (all animations will be stopped if both this and animationName are empty)
   * @param useGlobalSplice if true, the animatables will be removed by the caller of this function (false by default)
   * @param skipOnAnimationEnd defines if the system should not raise onAnimationEnd. Default is false
   */
  stop(animationName, targetMask, useGlobalSplice = false, skipOnAnimationEnd = false) {
    if (animationName || targetMask) {
      const idx = this._scene._activeAnimatables.indexOf(this);
      if (idx > -1) {
        const runtimeAnimations = this._runtimeAnimations;
        for (let index = runtimeAnimations.length - 1; index >= 0; index--) {
          const runtimeAnimation = runtimeAnimations[index];
          if (animationName && runtimeAnimation.animation.name != animationName) {
            continue;
          }
          if (targetMask && !targetMask(runtimeAnimation.target)) {
            continue;
          }
          runtimeAnimation.dispose();
          runtimeAnimations.splice(index, 1);
        }
        if (runtimeAnimations.length == 0) {
          if (!useGlobalSplice) {
            this._scene._activeAnimatables.splice(idx, 1);
          }
          if (!skipOnAnimationEnd) {
            this._raiseOnAnimationEnd();
          }
        }
      }
    } else {
      const index = this._scene._activeAnimatables.indexOf(this);
      if (index > -1) {
        if (!useGlobalSplice) {
          this._scene._activeAnimatables.splice(index, 1);
        }
        const runtimeAnimations = this._runtimeAnimations;
        for (let index2 = 0; index2 < runtimeAnimations.length; index2++) {
          runtimeAnimations[index2].dispose();
        }
        this._runtimeAnimations.length = 0;
        if (!skipOnAnimationEnd) {
          this._raiseOnAnimationEnd();
        }
      }
    }
  }
  /**
   * Wait asynchronously for the animation to end
   * @returns a promise which will be fulfilled when the animation ends
   */
  waitAsync() {
    return new Promise((resolve) => {
      this.onAnimationEndObservable.add(() => {
        resolve(this);
      }, void 0, void 0, this, true);
    });
  }
  /**
   * @internal
   */
  _animate(delay) {
    if (this._paused) {
      this.animationStarted = false;
      if (this._pausedDelay === null) {
        this._pausedDelay = delay;
      }
      return true;
    }
    if (this._localDelayOffset === null) {
      this._localDelayOffset = delay;
      this._pausedDelay = null;
    } else if (this._pausedDelay !== null) {
      this._localDelayOffset += delay - this._pausedDelay;
      this._pausedDelay = null;
    }
    if (this._manualJumpDelay !== null) {
      this._localDelayOffset += this._manualJumpDelay;
      this._manualJumpDelay = null;
      this._frameToSyncFromJump = null;
    }
    this._goToFrame = null;
    if (this._weight === 0 && this._previousWeight === 0) {
      return true;
    }
    this._previousWeight = this._weight;
    let running = false;
    const runtimeAnimations = this._runtimeAnimations;
    let index;
    for (index = 0; index < runtimeAnimations.length; index++) {
      const animation = runtimeAnimations[index];
      const isRunning = animation.animate(delay - this._localDelayOffset, this.fromFrame, this.toFrame, this.loopAnimation, this._speedRatio, this._weight);
      running = running || isRunning;
    }
    this.animationStarted = running;
    if (!running) {
      if (this.disposeOnEnd) {
        index = this._scene._activeAnimatables.indexOf(this);
        this._scene._activeAnimatables.splice(index, 1);
        for (index = 0; index < runtimeAnimations.length; index++) {
          runtimeAnimations[index].dispose();
        }
      }
      this._raiseOnAnimationEnd();
      if (this.disposeOnEnd) {
        this.onAnimationEnd = null;
        this.onAnimationLoop = null;
        this.onAnimationLoopObservable.clear();
        this.onAnimationEndObservable.clear();
      }
    }
    return running;
  }
}
function ProcessLateAnimationBindingsForMatrices(holder) {
  if (holder.totalWeight === 0 && holder.totalAdditiveWeight === 0) {
    return holder.originalValue;
  }
  let normalizer = 1;
  const finalPosition = TmpVectors.Vector3[0];
  const finalScaling = TmpVectors.Vector3[1];
  const finalQuaternion = TmpVectors.Quaternion[0];
  let startIndex = 0;
  const originalAnimation = holder.animations[0];
  const originalValue = holder.originalValue;
  let scale = 1;
  let skipOverride = false;
  if (holder.totalWeight < 1) {
    scale = 1 - holder.totalWeight;
    originalValue.decompose(finalScaling, finalQuaternion, finalPosition);
  } else {
    startIndex = 1;
    normalizer = holder.totalWeight;
    scale = originalAnimation.weight / normalizer;
    if (scale == 1) {
      if (holder.totalAdditiveWeight) {
        skipOverride = true;
      } else {
        return originalAnimation.currentValue;
      }
    }
    originalAnimation.currentValue.decompose(finalScaling, finalQuaternion, finalPosition);
  }
  if (!skipOverride) {
    finalScaling.scaleInPlace(scale);
    finalPosition.scaleInPlace(scale);
    finalQuaternion.scaleInPlace(scale);
    for (let animIndex = startIndex; animIndex < holder.animations.length; animIndex++) {
      const runtimeAnimation = holder.animations[animIndex];
      if (runtimeAnimation.weight === 0) {
        continue;
      }
      scale = runtimeAnimation.weight / normalizer;
      const currentPosition = TmpVectors.Vector3[2];
      const currentScaling = TmpVectors.Vector3[3];
      const currentQuaternion = TmpVectors.Quaternion[1];
      runtimeAnimation.currentValue.decompose(currentScaling, currentQuaternion, currentPosition);
      currentScaling.scaleAndAddToRef(scale, finalScaling);
      currentQuaternion.scaleAndAddToRef(Quaternion.Dot(finalQuaternion, currentQuaternion) > 0 ? scale : -scale, finalQuaternion);
      currentPosition.scaleAndAddToRef(scale, finalPosition);
    }
    finalQuaternion.normalize();
  }
  for (let animIndex = 0; animIndex < holder.additiveAnimations.length; animIndex++) {
    const runtimeAnimation = holder.additiveAnimations[animIndex];
    if (runtimeAnimation.weight === 0) {
      continue;
    }
    const currentPosition = TmpVectors.Vector3[2];
    const currentScaling = TmpVectors.Vector3[3];
    const currentQuaternion = TmpVectors.Quaternion[1];
    runtimeAnimation.currentValue.decompose(currentScaling, currentQuaternion, currentPosition);
    currentScaling.multiplyToRef(finalScaling, currentScaling);
    Vector3.LerpToRef(finalScaling, currentScaling, runtimeAnimation.weight, finalScaling);
    finalQuaternion.multiplyToRef(currentQuaternion, currentQuaternion);
    Quaternion.SlerpToRef(finalQuaternion, currentQuaternion, runtimeAnimation.weight, finalQuaternion);
    currentPosition.scaleAndAddToRef(runtimeAnimation.weight, finalPosition);
  }
  const workValue = originalAnimation ? originalAnimation._animationState.workValue : TmpVectors.Matrix[0].clone();
  Matrix.ComposeToRef(finalScaling, finalQuaternion, finalPosition, workValue);
  return workValue;
}
function ProcessLateAnimationBindingsForQuaternions(holder, refQuaternion) {
  if (holder.totalWeight === 0 && holder.totalAdditiveWeight === 0) {
    return refQuaternion;
  }
  const originalAnimation = holder.animations[0];
  const originalValue = holder.originalValue;
  let cumulativeQuaternion = refQuaternion;
  if (holder.totalWeight === 0 && holder.totalAdditiveWeight > 0) {
    cumulativeQuaternion.copyFrom(originalValue);
  } else if (holder.animations.length === 1) {
    Quaternion.SlerpToRef(originalValue, originalAnimation.currentValue, Math.min(1, holder.totalWeight), cumulativeQuaternion);
    if (holder.totalAdditiveWeight === 0) {
      return cumulativeQuaternion;
    }
  } else if (holder.animations.length > 1) {
    let normalizer = 1;
    let quaternions;
    let weights;
    if (holder.totalWeight < 1) {
      const scale = 1 - holder.totalWeight;
      quaternions = [];
      weights = [];
      quaternions.push(originalValue);
      weights.push(scale);
    } else {
      if (holder.animations.length === 2) {
        Quaternion.SlerpToRef(holder.animations[0].currentValue, holder.animations[1].currentValue, holder.animations[1].weight / holder.totalWeight, refQuaternion);
        if (holder.totalAdditiveWeight === 0) {
          return refQuaternion;
        }
      }
      quaternions = [];
      weights = [];
      normalizer = holder.totalWeight;
    }
    for (let animIndex = 0; animIndex < holder.animations.length; animIndex++) {
      const runtimeAnimation = holder.animations[animIndex];
      quaternions.push(runtimeAnimation.currentValue);
      weights.push(runtimeAnimation.weight / normalizer);
    }
    let cumulativeAmount = 0;
    for (let index = 0; index < quaternions.length; ) {
      if (!index) {
        Quaternion.SlerpToRef(quaternions[index], quaternions[index + 1], weights[index + 1] / (weights[index] + weights[index + 1]), refQuaternion);
        cumulativeQuaternion = refQuaternion;
        cumulativeAmount = weights[index] + weights[index + 1];
        index += 2;
        continue;
      }
      cumulativeAmount += weights[index];
      Quaternion.SlerpToRef(cumulativeQuaternion, quaternions[index], weights[index] / cumulativeAmount, cumulativeQuaternion);
      index++;
    }
  }
  for (let animIndex = 0; animIndex < holder.additiveAnimations.length; animIndex++) {
    const runtimeAnimation = holder.additiveAnimations[animIndex];
    if (runtimeAnimation.weight === 0) {
      continue;
    }
    cumulativeQuaternion.multiplyToRef(runtimeAnimation.currentValue, TmpVectors.Quaternion[0]);
    Quaternion.SlerpToRef(cumulativeQuaternion, TmpVectors.Quaternion[0], runtimeAnimation.weight, cumulativeQuaternion);
  }
  return cumulativeQuaternion;
}
function ProcessLateAnimationBindings(scene) {
  if (!scene._registeredForLateAnimationBindings.length) {
    return;
  }
  for (let index = 0; index < scene._registeredForLateAnimationBindings.length; index++) {
    const target = scene._registeredForLateAnimationBindings.data[index];
    for (const path in target._lateAnimationHolders) {
      const holder = target._lateAnimationHolders[path];
      const originalAnimation = holder.animations[0];
      const originalValue = holder.originalValue;
      if (originalValue === void 0 || originalValue === null) {
        continue;
      }
      const matrixDecomposeMode = Animation.AllowMatrixDecomposeForInterpolation && originalValue.m;
      let finalValue = target[path];
      if (matrixDecomposeMode) {
        finalValue = ProcessLateAnimationBindingsForMatrices(holder);
      } else {
        const quaternionMode = originalValue.w !== void 0;
        if (quaternionMode) {
          finalValue = ProcessLateAnimationBindingsForQuaternions(holder, finalValue || Quaternion.Identity());
        } else {
          let startIndex = 0;
          let normalizer = 1;
          const originalAnimationIsLoopRelativeFromCurrent = originalAnimation && originalAnimation._animationState.loopMode === Animation.ANIMATIONLOOPMODE_RELATIVE_FROM_CURRENT;
          if (holder.totalWeight < 1) {
            if (originalAnimationIsLoopRelativeFromCurrent) {
              finalValue = originalValue.clone ? originalValue.clone() : originalValue;
            } else if (originalAnimation && originalValue.scale) {
              finalValue = originalValue.scale(1 - holder.totalWeight);
            } else if (originalAnimation) {
              finalValue = originalValue * (1 - holder.totalWeight);
            } else if (originalValue.clone) {
              finalValue = originalValue.clone();
            } else {
              finalValue = originalValue;
            }
          } else if (originalAnimation) {
            normalizer = holder.totalWeight;
            const scale = originalAnimation.weight / normalizer;
            if (scale !== 1) {
              if (originalAnimation.currentValue.scale) {
                finalValue = originalAnimation.currentValue.scale(scale);
              } else {
                finalValue = originalAnimation.currentValue * scale;
              }
            } else {
              finalValue = originalAnimation.currentValue;
            }
            if (originalAnimationIsLoopRelativeFromCurrent) {
              if (finalValue.addToRef) {
                finalValue.addToRef(originalValue, finalValue);
              } else {
                finalValue += originalValue;
              }
            }
            startIndex = 1;
          }
          for (let animIndex = startIndex; animIndex < holder.animations.length; animIndex++) {
            const runtimeAnimation = holder.animations[animIndex];
            const scale = runtimeAnimation.weight / normalizer;
            if (!scale) {
              continue;
            } else if (runtimeAnimation.currentValue.scaleAndAddToRef) {
              runtimeAnimation.currentValue.scaleAndAddToRef(scale, finalValue);
            } else {
              finalValue += runtimeAnimation.currentValue * scale;
            }
          }
          for (let animIndex = 0; animIndex < holder.additiveAnimations.length; animIndex++) {
            const runtimeAnimation = holder.additiveAnimations[animIndex];
            const scale = runtimeAnimation.weight;
            if (!scale) {
              continue;
            } else if (runtimeAnimation.currentValue.scaleAndAddToRef) {
              runtimeAnimation.currentValue.scaleAndAddToRef(scale, finalValue);
            } else {
              finalValue += runtimeAnimation.currentValue * scale;
            }
          }
        }
      }
      target[path] = finalValue;
    }
    target._lateAnimationHolders = {};
  }
  scene._registeredForLateAnimationBindings.reset();
}
function AddAnimationExtensions(sceneClass, boneClass) {
  if (boneClass) {
    boneClass.prototype.copyAnimationRange = function(source, rangeName, frameOffset, rescaleAsRequired = false, skelDimensionsRatio = null) {
      if (this.animations.length === 0) {
        this.animations.push(new Animation(this.name, "_matrix", source.animations[0].framePerSecond, Animation.ANIMATIONTYPE_MATRIX, 0));
        this.animations[0].setKeys([]);
      }
      const sourceRange = source.animations[0].getRange(rangeName);
      if (!sourceRange) {
        return false;
      }
      const from = sourceRange.from;
      const to = sourceRange.to;
      const sourceKeys = source.animations[0].getKeys();
      const sourceBoneLength = source.length;
      const sourceParent = source.getParent();
      const parent = this.getParent();
      const parentScalingReqd = rescaleAsRequired && sourceParent && sourceBoneLength && this.length && sourceBoneLength !== this.length;
      const parentRatio = parentScalingReqd && parent && sourceParent ? parent.length / sourceParent.length : 1;
      const dimensionsScalingReqd = rescaleAsRequired && !parent && skelDimensionsRatio && (skelDimensionsRatio.x !== 1 || skelDimensionsRatio.y !== 1 || skelDimensionsRatio.z !== 1);
      const destKeys = this.animations[0].getKeys();
      let orig;
      let origTranslation;
      let mat;
      for (let key = 0, nKeys = sourceKeys.length; key < nKeys; key++) {
        orig = sourceKeys[key];
        if (orig.frame >= from && orig.frame <= to) {
          if (rescaleAsRequired) {
            mat = orig.value.clone();
            if (parentScalingReqd) {
              origTranslation = mat.getTranslation();
              mat.setTranslation(origTranslation.scaleInPlace(parentRatio));
            } else if (dimensionsScalingReqd && skelDimensionsRatio) {
              origTranslation = mat.getTranslation();
              mat.setTranslation(origTranslation.multiplyInPlace(skelDimensionsRatio));
            } else {
              mat = orig.value;
            }
          } else {
            mat = orig.value;
          }
          destKeys.push({ frame: orig.frame + frameOffset, value: mat });
        }
      }
      this.animations[0].createRange(rangeName, from + frameOffset, to + frameOffset);
      return true;
    };
  }
  if (!sceneClass) {
    return;
  }
  sceneClass.prototype._animate = function(customDeltaTime) {
    if (!this.animationsEnabled) {
      return;
    }
    const now = PrecisionDate.Now;
    if (!this._animationTimeLast) {
      if (this._pendingData.length > 0) {
        return;
      }
      this._animationTimeLast = now;
    }
    this.deltaTime = customDeltaTime !== void 0 ? customDeltaTime : this.useConstantAnimationDeltaTime ? 16 : (now - this._animationTimeLast) * this.animationTimeScale;
    this._animationTimeLast = now;
    const animatables = this._activeAnimatables;
    if (animatables.length === 0) {
      return;
    }
    this._animationTime += this.deltaTime;
    const animationTime = this._animationTime;
    for (let index = 0; index < animatables.length; index++) {
      const animatable = animatables[index];
      if (!animatable._animate(animationTime) && animatable.disposeOnEnd) {
        index--;
      }
    }
    ProcessLateAnimationBindings(this);
  };
  sceneClass.prototype.sortActiveAnimatables = function() {
    this._activeAnimatables.sort((a, b) => {
      return a.playOrder - b.playOrder;
    });
  };
  sceneClass.prototype.beginWeightedAnimation = function(target, from, to, weight = 1, loop, speedRatio = 1, onAnimationEnd, animatable, targetMask, onAnimationLoop, isAdditive = false) {
    const returnedAnimatable = this.beginAnimation(target, from, to, loop, speedRatio, onAnimationEnd, animatable, false, targetMask, onAnimationLoop, isAdditive);
    returnedAnimatable.weight = weight;
    return returnedAnimatable;
  };
  sceneClass.prototype.beginAnimation = function(target, from, to, loop, speedRatio = 1, onAnimationEnd, animatable, stopCurrent = true, targetMask, onAnimationLoop, isAdditive = false) {
    if (speedRatio < 0) {
      const tmp = from;
      from = to;
      to = tmp;
      speedRatio = -speedRatio;
    }
    if (from > to) {
      speedRatio = -speedRatio;
    }
    if (stopCurrent) {
      this.stopAnimation(target, void 0, targetMask);
    }
    if (!animatable) {
      animatable = new Animatable(this, target, from, to, loop, speedRatio, onAnimationEnd, void 0, onAnimationLoop, isAdditive);
    }
    const shouldRunTargetAnimations = targetMask ? targetMask(target) : true;
    if (target.animations && shouldRunTargetAnimations) {
      animatable.appendAnimations(target, target.animations);
    }
    if (target.getAnimatables) {
      const animatables = target.getAnimatables();
      for (let index = 0; index < animatables.length; index++) {
        this.beginAnimation(animatables[index], from, to, loop, speedRatio, onAnimationEnd, animatable, stopCurrent, targetMask, onAnimationLoop);
      }
    }
    animatable.reset();
    return animatable;
  };
  sceneClass.prototype.beginHierarchyAnimation = function(target, directDescendantsOnly, from, to, loop, speedRatio = 1, onAnimationEnd, animatable, stopCurrent = true, targetMask, onAnimationLoop, isAdditive = false) {
    const children = target.getDescendants(directDescendantsOnly);
    const result = [];
    result.push(this.beginAnimation(target, from, to, loop, speedRatio, onAnimationEnd, animatable, stopCurrent, targetMask, void 0, isAdditive));
    for (const child of children) {
      result.push(this.beginAnimation(child, from, to, loop, speedRatio, onAnimationEnd, animatable, stopCurrent, targetMask, void 0, isAdditive));
    }
    return result;
  };
  sceneClass.prototype.beginDirectAnimation = function(target, animations, from, to, loop, speedRatio = 1, onAnimationEnd, onAnimationLoop, isAdditive = false) {
    if (speedRatio < 0) {
      const tmp = from;
      from = to;
      to = tmp;
      speedRatio = -speedRatio;
    }
    if (from > to) {
      speedRatio = -speedRatio;
    }
    const animatable = new Animatable(this, target, from, to, loop, speedRatio, onAnimationEnd, animations, onAnimationLoop, isAdditive);
    return animatable;
  };
  sceneClass.prototype.beginDirectHierarchyAnimation = function(target, directDescendantsOnly, animations, from, to, loop, speedRatio, onAnimationEnd, onAnimationLoop, isAdditive = false) {
    const children = target.getDescendants(directDescendantsOnly);
    const result = [];
    result.push(this.beginDirectAnimation(target, animations, from, to, loop, speedRatio, onAnimationEnd, onAnimationLoop, isAdditive));
    for (const child of children) {
      result.push(this.beginDirectAnimation(child, animations, from, to, loop, speedRatio, onAnimationEnd, onAnimationLoop, isAdditive));
    }
    return result;
  };
  sceneClass.prototype.getAnimatableByTarget = function(target) {
    for (let index = 0; index < this._activeAnimatables.length; index++) {
      if (this._activeAnimatables[index].target === target) {
        return this._activeAnimatables[index];
      }
    }
    return null;
  };
  sceneClass.prototype.getAllAnimatablesByTarget = function(target) {
    const result = [];
    for (let index = 0; index < this._activeAnimatables.length; index++) {
      if (this._activeAnimatables[index].target === target) {
        result.push(this._activeAnimatables[index]);
      }
    }
    return result;
  };
  sceneClass.prototype.stopAnimation = function(target, animationName, targetMask) {
    const animatables = this.getAllAnimatablesByTarget(target);
    for (const animatable of animatables) {
      animatable.stop(animationName, targetMask);
    }
  };
  sceneClass.prototype.stopAllAnimations = function() {
    if (this._activeAnimatables) {
      for (let i = 0; i < this._activeAnimatables.length; i++) {
        this._activeAnimatables[i].stop(void 0, void 0, true);
      }
      this._activeAnimatables.length = 0;
    }
    for (const group of this.animationGroups) {
      group.stop();
    }
  };
}
AddAnimationExtensions(Scene, Bone);
class TargetedAnimation {
  /**
   * Returns the string "TargetedAnimation"
   * @returns "TargetedAnimation"
   */
  getClassName() {
    return "TargetedAnimation";
  }
  /**
   * Serialize the object
   * @returns the JSON object representing the current entity
   */
  serialize() {
    const serializationObject = {};
    serializationObject.animation = this.animation.serialize();
    serializationObject.targetId = this.target.id;
    return serializationObject;
  }
}
class AnimationGroup {
  /**
   * Gets or sets the mask associated with this animation group. This mask is used to filter which objects should be animated.
   */
  get mask() {
    return this._mask;
  }
  set mask(value) {
    if (this._mask === value) {
      return;
    }
    this._mask = value;
    this.syncWithMask(true);
  }
  /**
   * Makes sure that the animations are either played or stopped according to the animation group mask.
   * Note however that the call won't have any effect if the animation group has not been started yet.
   * @param forceUpdate If true, forces to loop over the animatables even if no mask is defined (used internally, you shouldn't need to use it). Default: false.
   */
  syncWithMask(forceUpdate = false) {
    if (!this.mask && !forceUpdate) {
      this._numActiveAnimatables = this._targetedAnimations.length;
      return;
    }
    this._numActiveAnimatables = 0;
    for (let i = 0; i < this._animatables.length; ++i) {
      const animatable = this._animatables[i];
      if (!this.mask || this.mask.disabled || this.mask.retainsTarget(animatable.target.name)) {
        this._numActiveAnimatables++;
        if (animatable.paused) {
          animatable.restart();
        }
      } else {
        if (!animatable.paused) {
          animatable.pause();
        }
      }
    }
  }
  /**
   * Removes all animations for the targets not retained by the animation group mask.
   * Use this function if you know you won't need those animations anymore and if you want to free memory.
   */
  removeUnmaskedAnimations() {
    if (!this.mask || this.mask.disabled) {
      return;
    }
    for (let i = 0; i < this._animatables.length; ++i) {
      const animatable = this._animatables[i];
      if (!this.mask.retainsTarget(animatable.target.name)) {
        animatable.stop();
        this._animatables.splice(i, 1);
        --i;
      }
    }
    for (let index = 0; index < this._targetedAnimations.length; index++) {
      const targetedAnimation = this._targetedAnimations[index];
      if (!this.mask.retainsTarget(targetedAnimation.target.name)) {
        this._targetedAnimations.splice(index, 1);
        --index;
      }
    }
  }
  /**
   * Gets or sets the first frame
   */
  get from() {
    return this._from;
  }
  set from(value) {
    if (this._from === value) {
      return;
    }
    this._from = value;
    for (let index = 0; index < this._animatables.length; index++) {
      const animatable = this._animatables[index];
      animatable.fromFrame = this._from;
    }
  }
  /**
   * Gets or sets the last frame
   */
  get to() {
    return this._to;
  }
  set to(value) {
    if (this._to === value) {
      return;
    }
    this._to = value;
    for (let index = 0; index < this._animatables.length; index++) {
      const animatable = this._animatables[index];
      animatable.toFrame = this._to;
    }
  }
  /**
   * Define if the animations are started
   */
  get isStarted() {
    return this._isStarted;
  }
  /**
   * Gets a value indicating that the current group is playing
   */
  get isPlaying() {
    return this._isStarted && !this._isPaused;
  }
  /**
   * Gets or sets the speed ratio to use for all animations
   */
  get speedRatio() {
    return this._speedRatio;
  }
  /**
   * Gets or sets the speed ratio to use for all animations
   */
  set speedRatio(value) {
    if (this._speedRatio === value) {
      return;
    }
    this._speedRatio = value;
    for (let index = 0; index < this._animatables.length; index++) {
      const animatable = this._animatables[index];
      animatable.speedRatio = this._speedRatio;
    }
  }
  /**
   * Gets or sets if all animations should loop or not
   */
  get loopAnimation() {
    return this._loopAnimation;
  }
  set loopAnimation(value) {
    if (this._loopAnimation === value) {
      return;
    }
    this._loopAnimation = value;
    for (let index = 0; index < this._animatables.length; index++) {
      const animatable = this._animatables[index];
      animatable.loopAnimation = this._loopAnimation;
    }
  }
  /**
   * Gets or sets if all animations should be evaluated additively
   */
  get isAdditive() {
    return this._isAdditive;
  }
  set isAdditive(value) {
    if (this._isAdditive === value) {
      return;
    }
    this._isAdditive = value;
    for (let index = 0; index < this._animatables.length; index++) {
      const animatable = this._animatables[index];
      animatable.isAdditive = this._isAdditive;
    }
  }
  /**
   * Gets or sets the weight to apply to all animations of the group
   */
  get weight() {
    return this._weight;
  }
  set weight(value) {
    if (this._weight === value) {
      return;
    }
    this._weight = value;
    this.setWeightForAllAnimatables(this._weight);
  }
  /**
   * Gets the targeted animations for this animation group
   */
  get targetedAnimations() {
    return this._targetedAnimations;
  }
  /**
   * returning the list of animatables controlled by this animation group.
   */
  get animatables() {
    return this._animatables;
  }
  /**
   * Gets the list of target animations
   */
  get children() {
    return this._targetedAnimations;
  }
  /**
   * Gets or sets the order of play of the animation group (default: 0)
   */
  get playOrder() {
    return this._playOrder;
  }
  set playOrder(value) {
    if (this._playOrder === value) {
      return;
    }
    this._playOrder = value;
    if (this._animatables.length > 0) {
      for (let i = 0; i < this._animatables.length; i++) {
        this._animatables[i].playOrder = this._playOrder;
      }
      this._scene.sortActiveAnimatables();
    }
  }
  /**
   * Allows the animations of the animation group to blend with current running animations
   * Note that a null value means that each animation will use their own existing blending configuration (Animation.enableBlending)
   */
  get enableBlending() {
    return this._enableBlending;
  }
  set enableBlending(value) {
    if (this._enableBlending === value) {
      return;
    }
    this._enableBlending = value;
    if (value !== null) {
      for (let i = 0; i < this._targetedAnimations.length; ++i) {
        this._targetedAnimations[i].animation.enableBlending = value;
      }
    }
  }
  /**
   * Gets or sets the animation blending speed
   * Note that a null value means that each animation will use their own existing blending configuration (Animation.blendingSpeed)
   */
  get blendingSpeed() {
    return this._blendingSpeed;
  }
  set blendingSpeed(value) {
    if (this._blendingSpeed === value) {
      return;
    }
    this._blendingSpeed = value;
    if (value !== null) {
      for (let i = 0; i < this._targetedAnimations.length; ++i) {
        this._targetedAnimations[i].animation.blendingSpeed = value;
      }
    }
  }
  /**
   * Gets the length (in seconds) of the animation group
   * This function assumes that all animations are played at the same framePerSecond speed!
   * Note: you can only call this method after you've added at least one targeted animation!
   * @param from Starting frame range (default is AnimationGroup.from)
   * @param to Ending frame range (default is AnimationGroup.to)
   * @returns The length in seconds
   */
  getLength(from, to) {
    from = from ?? this._from;
    to = to ?? this._to;
    const fps = this.targetedAnimations[0].animation.framePerSecond * this._speedRatio;
    return (to - from) / fps;
  }
  /**
   * Merge the array of animation groups into a new animation group
   * @param animationGroups List of animation groups to merge
   * @param disposeSource If true, animation groups will be disposed after being merged (default: true)
   * @param normalize If true, animation groups will be normalized before being merged, so that all animations have the same "from" and "to" frame (default: false)
   * @param weight Weight for the new animation group. If not provided, it will inherit the weight from the first animation group of the array
   * @returns The new animation group or null if no animation groups were passed
   */
  static MergeAnimationGroups(animationGroups, disposeSource = true, normalize = false, weight) {
    if (animationGroups.length === 0) {
      return null;
    }
    weight = weight ?? animationGroups[0].weight;
    let beginFrame = Number.MAX_VALUE;
    let endFrame = -Number.MAX_VALUE;
    if (normalize) {
      for (const animationGroup of animationGroups) {
        if (animationGroup.from < beginFrame) {
          beginFrame = animationGroup.from;
        }
        if (animationGroup.to > endFrame) {
          endFrame = animationGroup.to;
        }
      }
    }
    const mergedAnimationGroup = new AnimationGroup(animationGroups[0].name + "_merged", animationGroups[0]._scene, weight);
    for (const animationGroup of animationGroups) {
      if (normalize) {
        animationGroup.normalize(beginFrame, endFrame);
      }
      for (const targetedAnimation of animationGroup.targetedAnimations) {
        mergedAnimationGroup.addTargetedAnimation(targetedAnimation.animation, targetedAnimation.target);
      }
      if (disposeSource) {
        animationGroup.dispose();
      }
    }
    return mergedAnimationGroup;
  }
  /**
   * Instantiates a new Animation Group.
   * This helps managing several animations at once.
   * @see https://doc.babylonjs.com/features/featuresDeepDive/animation/groupAnimations
   * @param name Defines the name of the group
   * @param scene Defines the scene the group belongs to
   * @param weight Defines the weight to use for animations in the group (-1.0 by default, meaning "no weight")
   * @param playOrder Defines the order of play of the animation group (default is 0)
   */
  constructor(name, scene = null, weight = -1, playOrder = 0) {
    this.name = name;
    this._targetedAnimations = new Array();
    this._animatables = new Array();
    this._from = Number.MAX_VALUE;
    this._to = -Number.MAX_VALUE;
    this._speedRatio = 1;
    this._loopAnimation = false;
    this._isAdditive = false;
    this._weight = -1;
    this._playOrder = 0;
    this._enableBlending = null;
    this._blendingSpeed = null;
    this._numActiveAnimatables = 0;
    this._shouldStart = true;
    this._parentContainer = null;
    this.onAnimationEndObservable = new Observable();
    this.onAnimationLoopObservable = new Observable();
    this.onAnimationGroupLoopObservable = new Observable();
    this.onAnimationGroupEndObservable = new Observable();
    this.onAnimationGroupPauseObservable = new Observable();
    this.onAnimationGroupPlayObservable = new Observable();
    this.metadata = null;
    this._mask = null;
    this._animationLoopFlags = [];
    this._scene = scene || EngineStore.LastCreatedScene;
    this._weight = weight;
    this._playOrder = playOrder;
    this.uniqueId = this._scene.getUniqueId();
    this._scene.addAnimationGroup(this);
  }
  /**
   * Add an animation (with its target) in the group
   * @param animation defines the animation we want to add
   * @param target defines the target of the animation
   * @returns the TargetedAnimation object
   */
  addTargetedAnimation(animation, target) {
    const targetedAnimation = new TargetedAnimation();
    targetedAnimation.animation = animation;
    targetedAnimation.target = target;
    const keys = animation.getKeys();
    if (this._from > keys[0].frame) {
      this._from = keys[0].frame;
    }
    if (this._to < keys[keys.length - 1].frame) {
      this._to = keys[keys.length - 1].frame;
    }
    if (this._enableBlending !== null) {
      animation.enableBlending = this._enableBlending;
    }
    if (this._blendingSpeed !== null) {
      animation.blendingSpeed = this._blendingSpeed;
    }
    this._targetedAnimations.push(targetedAnimation);
    this._shouldStart = true;
    return targetedAnimation;
  }
  /**
   * Remove an animation from the group
   * @param animation defines the animation we want to remove
   */
  removeTargetedAnimation(animation) {
    for (let index = this._targetedAnimations.length - 1; index > -1; index--) {
      const targetedAnimation = this._targetedAnimations[index];
      if (targetedAnimation.animation === animation) {
        this._targetedAnimations.splice(index, 1);
      }
    }
  }
  /**
   * This function will normalize every animation in the group to make sure they all go from beginFrame to endFrame
   * It can add constant keys at begin or end
   * @param beginFrame defines the new begin frame for all animations or the smallest begin frame of all animations if null (defaults to null)
   * @param endFrame defines the new end frame for all animations or the largest end frame of all animations if null (defaults to null)
   * @returns the animation group
   */
  normalize(beginFrame = null, endFrame = null) {
    if (beginFrame == null) {
      beginFrame = this._from;
    }
    if (endFrame == null) {
      endFrame = this._to;
    }
    for (let index = 0; index < this._targetedAnimations.length; index++) {
      const targetedAnimation = this._targetedAnimations[index];
      const keys = targetedAnimation.animation.getKeys();
      const startKey = keys[0];
      const endKey = keys[keys.length - 1];
      if (startKey.frame > beginFrame) {
        const newKey = {
          frame: beginFrame,
          value: startKey.value,
          inTangent: startKey.inTangent,
          outTangent: startKey.outTangent,
          interpolation: startKey.interpolation
        };
        keys.splice(0, 0, newKey);
      }
      if (endKey.frame < endFrame) {
        const newKey = {
          frame: endFrame,
          value: endKey.value,
          inTangent: endKey.inTangent,
          outTangent: endKey.outTangent,
          interpolation: endKey.interpolation
        };
        keys.push(newKey);
      }
    }
    this._from = beginFrame;
    this._to = endFrame;
    return this;
  }
  _processLoop(animatable, targetedAnimation, index) {
    animatable.onAnimationLoop = () => {
      this.onAnimationLoopObservable.notifyObservers(targetedAnimation);
      if (this._animationLoopFlags[index]) {
        return;
      }
      this._animationLoopFlags[index] = true;
      this._animationLoopCount++;
      if (this._animationLoopCount === this._numActiveAnimatables) {
        this.onAnimationGroupLoopObservable.notifyObservers(this);
        this._animationLoopCount = 0;
        this._animationLoopFlags.length = 0;
      }
    };
  }
  /**
   * Start all animations on given targets
   * @param loop defines if animations must loop
   * @param speedRatio defines the ratio to apply to animation speed (1 by default)
   * @param from defines the from key (optional)
   * @param to defines the to key (optional)
   * @param isAdditive defines the additive state for the resulting animatables (optional)
   * @returns the current animation group
   */
  start(loop = false, speedRatio = 1, from, to, isAdditive) {
    if (this._isStarted || this._targetedAnimations.length === 0) {
      return this;
    }
    this._loopAnimation = loop;
    this._shouldStart = false;
    this._animationLoopCount = 0;
    this._animationLoopFlags.length = 0;
    for (let index = 0; index < this._targetedAnimations.length; index++) {
      const targetedAnimation = this._targetedAnimations[index];
      const animatable = this._scene.beginDirectAnimation(targetedAnimation.target, [targetedAnimation.animation], from !== void 0 ? from : this._from, to !== void 0 ? to : this._to, loop, speedRatio, void 0, void 0, isAdditive !== void 0 ? isAdditive : this._isAdditive);
      animatable.weight = this._weight;
      animatable.playOrder = this._playOrder;
      animatable.onAnimationEnd = () => {
        this.onAnimationEndObservable.notifyObservers(targetedAnimation);
        this._checkAnimationGroupEnded(animatable);
      };
      this._processLoop(animatable, targetedAnimation, index);
      this._animatables.push(animatable);
    }
    this.syncWithMask();
    this._scene.sortActiveAnimatables();
    this._speedRatio = speedRatio;
    this._isStarted = true;
    this._isPaused = false;
    this.onAnimationGroupPlayObservable.notifyObservers(this);
    return this;
  }
  /**
   * Pause all animations
   * @returns the animation group
   */
  pause() {
    if (!this._isStarted) {
      return this;
    }
    this._isPaused = true;
    for (let index = 0; index < this._animatables.length; index++) {
      const animatable = this._animatables[index];
      animatable.pause();
    }
    this.onAnimationGroupPauseObservable.notifyObservers(this);
    return this;
  }
  /**
   * Play all animations to initial state
   * This function will start() the animations if they were not started or will restart() them if they were paused
   * @param loop defines if animations must loop
   * @returns the animation group
   */
  play(loop) {
    if (this.isStarted && this._animatables.length && !this._shouldStart) {
      if (loop !== void 0) {
        this.loopAnimation = loop;
      }
      this.restart();
    } else {
      this.stop();
      this.start(loop, this._speedRatio);
    }
    return this;
  }
  /**
   * Reset all animations to initial state
   * @returns the animation group
   */
  reset() {
    if (!this._isStarted) {
      this.play();
      this.goToFrame(0);
      this.stop(true);
      return this;
    }
    for (let index = 0; index < this._animatables.length; index++) {
      const animatable = this._animatables[index];
      animatable.reset();
    }
    return this;
  }
  /**
   * Restart animations from after pausing it
   * @returns the animation group
   */
  restart() {
    if (!this._isStarted) {
      return this;
    }
    for (let index = 0; index < this._animatables.length; index++) {
      const animatable = this._animatables[index];
      animatable.restart();
    }
    this.syncWithMask();
    this._isPaused = false;
    this.onAnimationGroupPlayObservable.notifyObservers(this);
    return this;
  }
  /**
   * Stop all animations
   * @param skipOnAnimationEnd defines if the system should not raise onAnimationEnd. Default is false
   * @returns the animation group
   */
  stop(skipOnAnimationEnd = false) {
    if (!this._isStarted) {
      return this;
    }
    const list = this._animatables.slice();
    for (let index = 0; index < list.length; index++) {
      list[index].stop(void 0, void 0, true, skipOnAnimationEnd);
    }
    let curIndex = 0;
    for (let index = 0; index < this._scene._activeAnimatables.length; index++) {
      const animatable = this._scene._activeAnimatables[index];
      if (animatable._runtimeAnimations.length > 0) {
        this._scene._activeAnimatables[curIndex++] = animatable;
      } else if (skipOnAnimationEnd) {
        this._checkAnimationGroupEnded(animatable, skipOnAnimationEnd);
      }
    }
    this._scene._activeAnimatables.length = curIndex;
    this._isStarted = false;
    return this;
  }
  /**
   * Set animation weight for all animatables
   *
   * @since 6.12.4
   *  You can pass the weight to the AnimationGroup constructor, or use the weight property to set it after the group has been created,
   *  making it easier to define the overall animation weight than calling setWeightForAllAnimatables() after the animation group has been started
   * @param weight defines the weight to use
   * @returns the animationGroup
   * @see https://doc.babylonjs.com/features/featuresDeepDive/animation/advanced_animations#animation-weights
   */
  setWeightForAllAnimatables(weight) {
    for (let index = 0; index < this._animatables.length; index++) {
      const animatable = this._animatables[index];
      animatable.weight = weight;
    }
    return this;
  }
  /**
   * Synchronize and normalize all animatables with a source animatable
   * @param root defines the root animatable to synchronize with (null to stop synchronizing)
   * @returns the animationGroup
   * @see https://doc.babylonjs.com/features/featuresDeepDive/animation/advanced_animations#animation-weights
   */
  syncAllAnimationsWith(root) {
    for (let index = 0; index < this._animatables.length; index++) {
      const animatable = this._animatables[index];
      animatable.syncWith(root);
    }
    return this;
  }
  /**
   * Goes to a specific frame in this animation group. Note that the animation group must be in playing or paused status
   * @param frame the frame number to go to
   * @param useWeight defines whether the animation weight should be applied to the image to be jumped to (false by default)
   * @returns the animationGroup
   */
  goToFrame(frame, useWeight = false) {
    if (!this._isStarted) {
      return this;
    }
    for (let index = 0; index < this._animatables.length; index++) {
      const animatable = this._animatables[index];
      animatable.goToFrame(frame, useWeight);
    }
    return this;
  }
  /**
   * Helper to get the current frame. This will return 0 if the AnimationGroup is not running, and it might return wrong results if multiple animations are running in different frames.
   * @returns current animation frame.
   */
  getCurrentFrame() {
    var _a;
    return ((_a = this.animatables[0]) == null ? void 0 : _a.masterFrame) || 0;
  }
  /**
   * Dispose all associated resources
   */
  dispose() {
    if (this.isStarted) {
      this.stop();
    }
    this._targetedAnimations.length = 0;
    this._animatables.length = 0;
    const index = this._scene.animationGroups.indexOf(this);
    if (index > -1) {
      this._scene.animationGroups.splice(index, 1);
    }
    if (this._parentContainer) {
      const index2 = this._parentContainer.animationGroups.indexOf(this);
      if (index2 > -1) {
        this._parentContainer.animationGroups.splice(index2, 1);
      }
      this._parentContainer = null;
    }
    this.onAnimationEndObservable.clear();
    this.onAnimationGroupEndObservable.clear();
    this.onAnimationGroupPauseObservable.clear();
    this.onAnimationGroupPlayObservable.clear();
    this.onAnimationLoopObservable.clear();
    this.onAnimationGroupLoopObservable.clear();
  }
  _checkAnimationGroupEnded(animatable, skipOnAnimationEnd = false) {
    const idx = this._animatables.indexOf(animatable);
    if (idx > -1) {
      this._animatables.splice(idx, 1);
    }
    if (this._animatables.length === this._targetedAnimations.length - this._numActiveAnimatables) {
      this._isStarted = false;
      if (!skipOnAnimationEnd) {
        this.onAnimationGroupEndObservable.notifyObservers(this);
      }
      this._animatables.length = 0;
    }
  }
  /**
   * Clone the current animation group and returns a copy
   * @param newName defines the name of the new group
   * @param targetConverter defines an optional function used to convert current animation targets to new ones
   * @param cloneAnimations defines if the animations should be cloned or referenced
   * @returns the new animation group
   */
  clone(newName, targetConverter, cloneAnimations = false) {
    const newGroup = new AnimationGroup(newName || this.name, this._scene, this._weight, this._playOrder);
    newGroup._from = this.from;
    newGroup._to = this.to;
    newGroup._speedRatio = this.speedRatio;
    newGroup._loopAnimation = this.loopAnimation;
    newGroup._isAdditive = this.isAdditive;
    newGroup._enableBlending = this.enableBlending;
    newGroup._blendingSpeed = this.blendingSpeed;
    newGroup.metadata = this.metadata;
    newGroup.mask = this.mask;
    for (const targetAnimation of this._targetedAnimations) {
      newGroup.addTargetedAnimation(cloneAnimations ? targetAnimation.animation.clone() : targetAnimation.animation, targetConverter ? targetConverter(targetAnimation.target) : targetAnimation.target);
    }
    return newGroup;
  }
  /**
   * Serializes the animationGroup to an object
   * @returns Serialized object
   */
  serialize() {
    const serializationObject = {};
    serializationObject.name = this.name;
    serializationObject.from = this.from;
    serializationObject.to = this.to;
    serializationObject.speedRatio = this.speedRatio;
    serializationObject.loopAnimation = this.loopAnimation;
    serializationObject.isAdditive = this.isAdditive;
    serializationObject.weight = this.weight;
    serializationObject.playOrder = this.playOrder;
    serializationObject.enableBlending = this.enableBlending;
    serializationObject.blendingSpeed = this.blendingSpeed;
    serializationObject.targetedAnimations = [];
    for (let targetedAnimationIndex = 0; targetedAnimationIndex < this.targetedAnimations.length; targetedAnimationIndex++) {
      const targetedAnimation = this.targetedAnimations[targetedAnimationIndex];
      serializationObject.targetedAnimations[targetedAnimationIndex] = targetedAnimation.serialize();
    }
    if (Tags && Tags.HasTags(this)) {
      serializationObject.tags = Tags.GetTags(this);
    }
    if (this.metadata) {
      serializationObject.metadata = this.metadata;
    }
    return serializationObject;
  }
  // Statics
  /**
   * Returns a new AnimationGroup object parsed from the source provided.
   * @param parsedAnimationGroup defines the source
   * @param scene defines the scene that will receive the animationGroup
   * @returns a new AnimationGroup
   */
  static Parse(parsedAnimationGroup, scene) {
    const animationGroup = new AnimationGroup(parsedAnimationGroup.name, scene, parsedAnimationGroup.weight, parsedAnimationGroup.playOrder);
    for (let i = 0; i < parsedAnimationGroup.targetedAnimations.length; i++) {
      const targetedAnimation = parsedAnimationGroup.targetedAnimations[i];
      const animation = Animation.Parse(targetedAnimation.animation);
      const id = targetedAnimation.targetId;
      if (targetedAnimation.animation.property === "influence") {
        const morphTarget = scene.getMorphTargetById(id);
        if (morphTarget) {
          animationGroup.addTargetedAnimation(animation, morphTarget);
        }
      } else {
        const targetNode = scene.getNodeById(id);
        if (targetNode != null) {
          animationGroup.addTargetedAnimation(animation, targetNode);
        }
      }
    }
    if (Tags) {
      Tags.AddTagsTo(animationGroup, parsedAnimationGroup.tags);
    }
    if (parsedAnimationGroup.from !== null && parsedAnimationGroup.to !== null) {
      animationGroup.normalize(parsedAnimationGroup.from, parsedAnimationGroup.to);
    }
    if (parsedAnimationGroup.speedRatio !== void 0) {
      animationGroup._speedRatio = parsedAnimationGroup.speedRatio;
    }
    if (parsedAnimationGroup.loopAnimation !== void 0) {
      animationGroup._loopAnimation = parsedAnimationGroup.loopAnimation;
    }
    if (parsedAnimationGroup.isAdditive !== void 0) {
      animationGroup._isAdditive = parsedAnimationGroup.isAdditive;
    }
    if (parsedAnimationGroup.weight !== void 0) {
      animationGroup._weight = parsedAnimationGroup.weight;
    }
    if (parsedAnimationGroup.playOrder !== void 0) {
      animationGroup._playOrder = parsedAnimationGroup.playOrder;
    }
    if (parsedAnimationGroup.enableBlending !== void 0) {
      animationGroup._enableBlending = parsedAnimationGroup.enableBlending;
    }
    if (parsedAnimationGroup.blendingSpeed !== void 0) {
      animationGroup._blendingSpeed = parsedAnimationGroup.blendingSpeed;
    }
    if (parsedAnimationGroup.metadata !== void 0) {
      animationGroup.metadata = parsedAnimationGroup.metadata;
    }
    return animationGroup;
  }
  /** @internal */
  static MakeAnimationAdditive(sourceAnimationGroup, referenceFrameOrOptions, range, cloneOriginal = false, clonedName) {
    let options;
    if (typeof referenceFrameOrOptions === "object") {
      options = referenceFrameOrOptions;
    } else {
      options = {
        referenceFrame: referenceFrameOrOptions,
        range,
        cloneOriginalAnimationGroup: cloneOriginal,
        clonedAnimationName: clonedName
      };
    }
    let animationGroup = sourceAnimationGroup;
    if (options.cloneOriginalAnimationGroup) {
      animationGroup = sourceAnimationGroup.clone(options.clonedAnimationGroupName || animationGroup.name);
    }
    const targetedAnimations = animationGroup.targetedAnimations;
    for (let index = 0; index < targetedAnimations.length; index++) {
      const targetedAnimation = targetedAnimations[index];
      targetedAnimation.animation = Animation.MakeAnimationAdditive(targetedAnimation.animation, options);
    }
    animationGroup.isAdditive = true;
    if (options.clipKeys) {
      let from = Number.MAX_VALUE;
      let to = -Number.MAX_VALUE;
      const targetedAnimations2 = animationGroup.targetedAnimations;
      for (let index = 0; index < targetedAnimations2.length; index++) {
        const targetedAnimation = targetedAnimations2[index];
        const animation = targetedAnimation.animation;
        const keys = animation.getKeys();
        if (from > keys[0].frame) {
          from = keys[0].frame;
        }
        if (to < keys[keys.length - 1].frame) {
          to = keys[keys.length - 1].frame;
        }
      }
      animationGroup._from = from;
      animationGroup._to = to;
    }
    return animationGroup;
  }
  /**
   * Creates a new animation, keeping only the keys that are inside a given key range
   * @param sourceAnimationGroup defines the animation group on which to operate
   * @param fromKey defines the lower bound of the range
   * @param toKey defines the upper bound of the range
   * @param name defines the name of the new animation group. If not provided, use the same name as animationGroup
   * @param dontCloneAnimations defines whether or not the animations should be cloned before clipping the keys. Default is false, so animations will be cloned
   * @returns a new animation group stripped from all the keys outside the given range
   */
  static ClipKeys(sourceAnimationGroup, fromKey, toKey, name, dontCloneAnimations) {
    const animationGroup = sourceAnimationGroup.clone(name || sourceAnimationGroup.name);
    return AnimationGroup.ClipKeysInPlace(animationGroup, fromKey, toKey, dontCloneAnimations);
  }
  /**
   * Updates an existing animation, keeping only the keys that are inside a given key range
   * @param animationGroup defines the animation group on which to operate
   * @param fromKey defines the lower bound of the range
   * @param toKey defines the upper bound of the range
   * @param dontCloneAnimations defines whether or not the animations should be cloned before clipping the keys. Default is false, so animations will be cloned
   * @returns the animationGroup stripped from all the keys outside the given range
   */
  static ClipKeysInPlace(animationGroup, fromKey, toKey, dontCloneAnimations) {
    return AnimationGroup.ClipInPlace(animationGroup, fromKey, toKey, dontCloneAnimations, false);
  }
  /**
   * Creates a new animation, keeping only the frames that are inside a given frame range
   * @param sourceAnimationGroup defines the animation group on which to operate
   * @param fromFrame defines the lower bound of the range
   * @param toFrame defines the upper bound of the range
   * @param name defines the name of the new animation group. If not provided, use the same name as animationGroup
   * @param dontCloneAnimations defines whether or not the animations should be cloned before clipping the frames. Default is false, so animations will be cloned
   * @returns a new animation group stripped from all the frames outside the given range
   */
  static ClipFrames(sourceAnimationGroup, fromFrame, toFrame, name, dontCloneAnimations) {
    const animationGroup = sourceAnimationGroup.clone(name || sourceAnimationGroup.name);
    return AnimationGroup.ClipFramesInPlace(animationGroup, fromFrame, toFrame, dontCloneAnimations);
  }
  /**
   * Updates an existing animation, keeping only the frames that are inside a given frame range
   * @param animationGroup defines the animation group on which to operate
   * @param fromFrame defines the lower bound of the range
   * @param toFrame defines the upper bound of the range
   * @param dontCloneAnimations defines whether or not the animations should be cloned before clipping the frames. Default is false, so animations will be cloned
   * @returns the animationGroup stripped from all the frames outside the given range
   */
  static ClipFramesInPlace(animationGroup, fromFrame, toFrame, dontCloneAnimations) {
    return AnimationGroup.ClipInPlace(animationGroup, fromFrame, toFrame, dontCloneAnimations, true);
  }
  /**
   * Updates an existing animation, keeping only the keys that are inside a given key or frame range
   * @param animationGroup defines the animation group on which to operate
   * @param start defines the lower bound of the range
   * @param end defines the upper bound of the range
   * @param dontCloneAnimations defines whether or not the animations should be cloned before clipping the keys. Default is false, so animations will be cloned
   * @param useFrame defines if the range is defined by frame numbers or key indices (default is false which means use key indices)
   * @returns the animationGroup stripped from all the keys outside the given range
   */
  static ClipInPlace(animationGroup, start, end, dontCloneAnimations, useFrame = false) {
    let from = Number.MAX_VALUE;
    let to = -Number.MAX_VALUE;
    const targetedAnimations = animationGroup.targetedAnimations;
    for (let index = 0; index < targetedAnimations.length; index++) {
      const targetedAnimation = targetedAnimations[index];
      const animation = dontCloneAnimations ? targetedAnimation.animation : targetedAnimation.animation.clone();
      if (useFrame) {
        animation.createKeyForFrame(start);
        animation.createKeyForFrame(end);
      }
      const keys = animation.getKeys();
      const newKeys = [];
      let startFrame = Number.MAX_VALUE;
      for (let k = 0; k < keys.length; k++) {
        const key = keys[k];
        if (!useFrame && k >= start && k <= end || useFrame && key.frame >= start && key.frame <= end) {
          const newKey = {
            frame: key.frame,
            value: key.value.clone ? key.value.clone() : key.value,
            inTangent: key.inTangent,
            outTangent: key.outTangent,
            interpolation: key.interpolation,
            lockedTangent: key.lockedTangent
          };
          if (startFrame === Number.MAX_VALUE) {
            startFrame = newKey.frame;
          }
          newKey.frame -= startFrame;
          newKeys.push(newKey);
        }
      }
      if (newKeys.length === 0) {
        targetedAnimations.splice(index, 1);
        index--;
        continue;
      }
      if (from > newKeys[0].frame) {
        from = newKeys[0].frame;
      }
      if (to < newKeys[newKeys.length - 1].frame) {
        to = newKeys[newKeys.length - 1].frame;
      }
      animation.setKeys(newKeys, true);
      targetedAnimation.animation = animation;
    }
    animationGroup._from = from;
    animationGroup._to = to;
    return animationGroup;
  }
  /**
   * Returns the string "AnimationGroup"
   * @returns "AnimationGroup"
   */
  getClassName() {
    return "AnimationGroup";
  }
  /**
   * Creates a detailed string about the object
   * @param fullDetails defines if the output string will support multiple levels of logging within scene loading
   * @returns a string representing the object
   */
  toString(fullDetails) {
    let ret = "Name: " + this.name;
    ret += ", type: " + this.getClassName();
    if (fullDetails) {
      ret += ", from: " + this._from;
      ret += ", to: " + this._to;
      ret += ", isStarted: " + this._isStarted;
      ret += ", speedRatio: " + this._speedRatio;
      ret += ", targetedAnimations length: " + this._targetedAnimations.length;
      ret += ", animatables length: " + this._animatables;
    }
    return ret;
  }
}
export {
  AnimationGroup,
  TargetedAnimation
};
