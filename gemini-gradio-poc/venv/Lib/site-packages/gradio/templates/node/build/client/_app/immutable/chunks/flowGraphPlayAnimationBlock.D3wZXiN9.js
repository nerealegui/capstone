import { a as FlowGraphAsyncExecutionBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { b as RichTypeNumber, c as RichTypeBoolean, R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
import { AnimationGroup } from "./animationGroup.DVZgpxRT.js";
class FlowGraphPlayAnimationBlock extends FlowGraphAsyncExecutionBlock {
  constructor(config) {
    super(config, ["animationLoop", "animationEnd", "animationGroupLoop"]);
    this.config = config;
    this.speed = this.registerDataInput("speed", RichTypeNumber);
    this.loop = this.registerDataInput("loop", RichTypeBoolean);
    this.from = this.registerDataInput("from", RichTypeNumber, 0);
    this.to = this.registerDataInput("to", RichTypeNumber);
    this.currentFrame = this.registerDataOutput("currentFrame", RichTypeNumber);
    this.currentTime = this.registerDataOutput("currentTime", RichTypeNumber);
    this.currentAnimationGroup = this.registerDataOutput("currentAnimationGroup", RichTypeAny);
    this.animationGroup = this.registerDataInput("animationGroup", RichTypeAny, config == null ? void 0 : config.animationGroup);
    this.animation = this.registerDataInput("animation", RichTypeAny);
    this.object = this.registerDataInput("object", RichTypeAny);
  }
  /**
   * @internal
   * @param context
   */
  _preparePendingTasks(context) {
    const ag = this.animationGroup.getValue(context);
    const animation = this.animation.getValue(context);
    if (!ag && !animation) {
      return this._reportError(context, "No animation or animation group provided");
    } else {
      const currentAnimationGroup = this.currentAnimationGroup.getValue(context);
      if (currentAnimationGroup && currentAnimationGroup !== ag) {
        currentAnimationGroup.dispose();
      }
      let animationGroupToUse = ag;
      if (animation && !animationGroupToUse) {
        const target = this.object.getValue(context);
        if (!target) {
          return this._reportError(context, "No target object provided");
        }
        const animationsArray = Array.isArray(animation) ? animation : [animation];
        const name = animationsArray[0].name;
        animationGroupToUse = new AnimationGroup("flowGraphAnimationGroup-" + name + "-" + target.name, context.configuration.scene);
        let isInterpolation = false;
        const interpolationAnimations = context._getGlobalContextVariable("interpolationAnimations", []);
        for (const anim of animationsArray) {
          animationGroupToUse.addTargetedAnimation(anim, target);
          if (interpolationAnimations.indexOf(anim.uniqueId) !== -1) {
            isInterpolation = true;
          }
        }
        if (isInterpolation) {
          this._checkInterpolationDuplications(context, animationsArray, target);
        }
      }
      const speed = this.speed.getValue(context) || 1;
      const from = this.from.getValue(context) ?? 0;
      const to = this.to.getValue(context) || animationGroupToUse.to;
      const loop = !isFinite(to) || this.loop.getValue(context);
      this.currentAnimationGroup.setValue(animationGroupToUse, context);
      const currentlyRunningAnimationGroups = context._getGlobalContextVariable("currentlyRunningAnimationGroups", []);
      if (currentlyRunningAnimationGroups.indexOf(animationGroupToUse.uniqueId) !== -1) {
        animationGroupToUse.stop();
      }
      try {
        animationGroupToUse.start(loop, speed, from, to);
        animationGroupToUse.onAnimationGroupEndObservable.add(() => this._onAnimationGroupEnd(context));
        animationGroupToUse.onAnimationEndObservable.add(() => this._eventsSignalOutputs["animationEnd"]._activateSignal(context));
        animationGroupToUse.onAnimationLoopObservable.add(() => this._eventsSignalOutputs["animationLoop"]._activateSignal(context));
        animationGroupToUse.onAnimationGroupLoopObservable.add(() => this._eventsSignalOutputs["animationGroupLoop"]._activateSignal(context));
        currentlyRunningAnimationGroups.push(animationGroupToUse.uniqueId);
        context._setGlobalContextVariable("currentlyRunningAnimationGroups", currentlyRunningAnimationGroups);
      } catch (e) {
        this._reportError(context, e);
      }
    }
  }
  _reportError(context, error) {
    super._reportError(context, error);
    this.currentFrame.setValue(-1, context);
    this.currentTime.setValue(-1, context);
  }
  /**
   * @internal
   */
  _executeOnTick(_context) {
    var _a;
    const ag = this.currentAnimationGroup.getValue(_context);
    if (ag) {
      this.currentFrame.setValue(ag.getCurrentFrame(), _context);
      this.currentTime.setValue(((_a = ag.animatables[0]) == null ? void 0 : _a.elapsedTime) ?? 0, _context);
    }
  }
  _execute(context) {
    this._startPendingTasks(context);
  }
  _onAnimationGroupEnd(context) {
    this._removeFromCurrentlyRunning(context, this.currentAnimationGroup.getValue(context));
    this._resetAfterCanceled(context);
    this.done._activateSignal(context);
  }
  /**
   * The idea behind this function is to check every running animation group and check if the targeted animations it uses are interpolation animations.
   * If they are, we want to see that they don't collide with the current interpolation animations that are starting to play.
   * If they do, we want to stop the already-running animation group.
   * @internal
   */
  _checkInterpolationDuplications(context, animation, target) {
    const currentlyRunningAnimationGroups = context._getGlobalContextVariable("currentlyRunningAnimationGroups", []);
    for (const uniqueId of currentlyRunningAnimationGroups) {
      const ag = context.assetsContext.animationGroups.find((ag2) => ag2.uniqueId === uniqueId);
      if (ag) {
        for (const anim of ag.targetedAnimations) {
          for (const animToCheck of animation) {
            if (anim.animation.targetProperty === animToCheck.targetProperty && anim.target === target) {
              this._stopAnimationGroup(context, ag);
            }
          }
        }
      }
    }
  }
  _stopAnimationGroup(context, animationGroup) {
    animationGroup.stop(true);
    animationGroup.dispose();
    this._removeFromCurrentlyRunning(context, animationGroup);
  }
  _removeFromCurrentlyRunning(context, animationGroup) {
    const currentlyRunningAnimationGroups = context._getGlobalContextVariable("currentlyRunningAnimationGroups", []);
    const idx = currentlyRunningAnimationGroups.indexOf(animationGroup.uniqueId);
    if (idx !== -1) {
      currentlyRunningAnimationGroups.splice(idx, 1);
      context._setGlobalContextVariable("currentlyRunningAnimationGroups", currentlyRunningAnimationGroups);
    }
  }
  /**
   * @internal
   * Stop any currently running animations.
   */
  _cancelPendingTasks(context) {
    const ag = this.currentAnimationGroup.getValue(context);
    if (ag) {
      this._stopAnimationGroup(context, ag);
    }
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphPlayAnimationBlock";
  }
}
RegisterClass("FlowGraphPlayAnimationBlock", FlowGraphPlayAnimationBlock);
export {
  FlowGraphPlayAnimationBlock
};
