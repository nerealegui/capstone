import { j as RichTypeFlowGraphInteger, F as FlowGraphInteger, R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { C as Color3, aS as Color4, R as RegisterClass } from "./index.B4f7kVg_.js";
import { F as FlowGraphCachedOperationBlock } from "./flowGraphCachedOperationBlock.BYccI7XF.js";
const pathHasTemplatesRegex = new RegExp(/\/\{(\w+)\}\//g);
class FlowGraphPathConverterComponent {
  constructor(path, ownerBlock) {
    this.path = path;
    this.ownerBlock = ownerBlock;
    this.templatedInputs = [];
    let match = pathHasTemplatesRegex.exec(path);
    const templateSet = /* @__PURE__ */ new Set();
    while (match) {
      const [, matchGroup] = match;
      if (templateSet.has(matchGroup)) {
        throw new Error("Duplicate template variable detected.");
      }
      templateSet.add(matchGroup);
      this.templatedInputs.push(ownerBlock.registerDataInput(matchGroup, RichTypeFlowGraphInteger, new FlowGraphInteger(0)));
      match = pathHasTemplatesRegex.exec(path);
    }
  }
  /**
   * Get the accessor for the path.
   * @param pathConverter the path converter to use to convert the path to an object accessor.
   * @param context the context to use.
   * @returns the accessor for the path.
   * @throws if the value for a templated input is invalid.
   */
  getAccessor(pathConverter, context) {
    let finalPath = this.path;
    for (const templatedInput of this.templatedInputs) {
      const valueToReplace = templatedInput.getValue(context).value;
      if (typeof valueToReplace !== "number" || valueToReplace < 0) {
        throw new Error("Invalid value for templated input.");
      }
      finalPath = finalPath.replace(`{${templatedInput.name}}`, valueToReplace.toString());
    }
    return pathConverter.convert(finalPath);
  }
}
class FlowGraphJsonPointerParserBlock extends FlowGraphCachedOperationBlock {
  constructor(config) {
    super(RichTypeAny, config);
    this.config = config;
    this.object = this.registerDataOutput("object", RichTypeAny);
    this.propertyName = this.registerDataOutput("propertyName", RichTypeAny);
    this.setterFunction = this.registerDataOutput("setFunction", RichTypeAny, this._setPropertyValue.bind(this));
    this.getterFunction = this.registerDataOutput("getFunction", RichTypeAny, this._getPropertyValue.bind(this));
    this.generateAnimationsFunction = this.registerDataOutput("generateAnimationsFunction", RichTypeAny, this._getInterpolationAnimationPropertyInfo.bind(this));
    this.templateComponent = new FlowGraphPathConverterComponent(config.jsonPointer, this);
  }
  _doOperation(context) {
    var _a, _b, _c;
    const accessorContainer = this.templateComponent.getAccessor(this.config.pathConverter, context);
    const value = accessorContainer.info.get(accessorContainer.object);
    const object = (_b = (_a = accessorContainer.info).getTarget) == null ? void 0 : _b.call(_a, accessorContainer.object);
    const propertyName = (_c = accessorContainer.info.getPropertyName) == null ? void 0 : _c[0](accessorContainer.object);
    if (!object) {
      throw new Error("Object is undefined");
    } else {
      this.object.setValue(object, context);
      if (propertyName) {
        this.propertyName.setValue(propertyName, context);
      }
    }
    return value;
  }
  _setPropertyValue(_target, _propertyName, value, context) {
    var _a, _b;
    const accessorContainer = this.templateComponent.getAccessor(this.config.pathConverter, context);
    const type = accessorContainer.info.type;
    if (type.startsWith("Color")) {
      value = ToColor(value, type);
    }
    (_b = (_a = accessorContainer.info).set) == null ? void 0 : _b.call(_a, value, accessorContainer.object);
  }
  _getPropertyValue(_target, _propertyName, context) {
    const accessorContainer = this.templateComponent.getAccessor(this.config.pathConverter, context);
    return accessorContainer.info.get(accessorContainer.object);
  }
  _getInterpolationAnimationPropertyInfo(_target, _propertyName, context) {
    const accessorContainer = this.templateComponent.getAccessor(this.config.pathConverter, context);
    return (keys, fps, animationType, easingFunction) => {
      var _a;
      const animations = [];
      const type = accessorContainer.info.type;
      if (type.startsWith("Color")) {
        keys = keys.map((key) => {
          return {
            frame: key.frame,
            value: ToColor(key.value, type)
          };
        });
      }
      (_a = accessorContainer.info.interpolation) == null ? void 0 : _a.forEach((info, index) => {
        var _a2;
        const name = ((_a2 = accessorContainer.info.getPropertyName) == null ? void 0 : _a2[index](accessorContainer.object)) || "Animation-interpolation-" + index;
        let newKeys = keys;
        if (animationType !== info.type) {
          newKeys = keys.map((key) => {
            return {
              frame: key.frame,
              value: info.getValue(void 0, key.value.asArray ? key.value.asArray() : [key.value], 0, 1)
            };
          });
        }
        const animationData = info.buildAnimations(accessorContainer.object, name, 60, newKeys);
        animationData.forEach((animation) => {
          if (easingFunction) {
            animation.babylonAnimation.setEasingFunction(easingFunction);
          }
          animations.push(animation.babylonAnimation);
        });
      });
      return animations;
    };
  }
  /**
   * Gets the class name of this block
   * @returns the class name
   */
  getClassName() {
    return "FlowGraphJsonPointerParserBlock";
  }
}
function ToColor(value, expectedValue) {
  if (value.getClassName().startsWith("Color")) {
    return value;
  }
  if (expectedValue === "Color3") {
    return new Color3(value.x, value.y, value.z);
  } else if (expectedValue === "Color4") {
    return new Color4(value.x, value.y, value.z, value.w);
  }
  return value;
}
RegisterClass("FlowGraphJsonPointerParserBlock", FlowGraphJsonPointerParserBlock);
export {
  FlowGraphJsonPointerParserBlock
};
