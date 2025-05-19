import { R as RegisterClass } from "./index.B4f7kVg_.js";
import { b as FlowGraphExecutionBlockWithOutSignal } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
class FlowGraphSetVariableBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config) {
    super(config);
    if (!config.variable && !config.variables) {
      throw new Error("FlowGraphSetVariableBlock: variable/variables is not defined");
    }
    if (config.variables && config.variable) {
      throw new Error("FlowGraphSetVariableBlock: variable and variables are both defined");
    }
    if (config.variables) {
      for (const variable of config.variables) {
        this.registerDataInput(variable, RichTypeAny);
      }
    } else {
      this.registerDataInput("value", RichTypeAny);
    }
  }
  _execute(context, _callingSignal) {
    var _a, _b;
    if ((_a = this.config) == null ? void 0 : _a.variables) {
      for (const variable of this.config.variables) {
        this._saveVariable(context, variable);
      }
    } else {
      this._saveVariable(context, (_b = this.config) == null ? void 0 : _b.variable, "value");
    }
    this.out._activateSignal(context);
  }
  _saveVariable(context, variableName, inputName) {
    var _a;
    const currentlyRunningAnimationGroups = context._getGlobalContextVariable("currentlyRunningAnimationGroups", []);
    for (const animationUniqueId of currentlyRunningAnimationGroups) {
      const animation = context.assetsContext.animationGroups[animationUniqueId];
      for (const targetAnimation of animation.targetedAnimations) {
        if (targetAnimation.target === context) {
          if (targetAnimation.target === context) {
            if (targetAnimation.animation.targetProperty === variableName) {
              animation.stop();
              const index = currentlyRunningAnimationGroups.indexOf(animationUniqueId);
              if (index > -1) {
                currentlyRunningAnimationGroups.splice(index, 1);
              }
              context._setGlobalContextVariable("currentlyRunningAnimationGroups", currentlyRunningAnimationGroups);
              break;
            }
          }
        }
      }
    }
    const value = (_a = this.getDataInput(inputName || variableName)) == null ? void 0 : _a.getValue(context);
    context.setVariable(variableName, value);
  }
  getClassName() {
    return "FlowGraphSetVariableBlock";
  }
  serialize(serializationObject) {
    var _a;
    super.serialize(serializationObject);
    serializationObject.config.variable = (_a = this.config) == null ? void 0 : _a.variable;
  }
}
RegisterClass("FlowGraphSetVariableBlock", FlowGraphSetVariableBlock);
export {
  FlowGraphSetVariableBlock
};
