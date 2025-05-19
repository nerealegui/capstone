import { F as FlowGraphUnaryOperationBlock } from "./flowGraphUnaryOperationBlock.JXfHGDC4.js";
import { c as RichTypeBoolean, b as RichTypeNumber, j as RichTypeFlowGraphInteger, F as FlowGraphInteger } from "./declarationMapper.uCBvEQca.js";
import { R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphBooleanToFloat extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeBoolean, RichTypeNumber, (a) => +a, "FlowGraphBooleanToFloat", config);
  }
}
RegisterClass("FlowGraphBooleanToFloat", FlowGraphBooleanToFloat);
class FlowGraphBooleanToInt extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeBoolean, RichTypeFlowGraphInteger, (a) => FlowGraphInteger.FromValue(+a), "FlowGraphBooleanToInt", config);
  }
}
RegisterClass("FlowGraphBooleanToInt", FlowGraphBooleanToInt);
class FlowGraphFloatToBoolean extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeNumber, RichTypeBoolean, (a) => !!a, "FlowGraphFloatToBoolean", config);
  }
}
RegisterClass("FlowGraphFloatToBoolean", FlowGraphFloatToBoolean);
class FlowGraphIntToBoolean extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeFlowGraphInteger, RichTypeBoolean, (a) => !!a.value, "FlowGraphIntToBoolean", config);
  }
}
RegisterClass("FlowGraphIntToBoolean", FlowGraphIntToBoolean);
class FlowGraphIntToFloat extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeFlowGraphInteger, RichTypeNumber, (a) => a.value, "FlowGraphIntToFloat", config);
  }
}
RegisterClass("FlowGraphIntToFloat", FlowGraphIntToFloat);
class FlowGraphFloatToInt extends FlowGraphUnaryOperationBlock {
  constructor(config) {
    super(RichTypeNumber, RichTypeFlowGraphInteger, (a) => {
      const roundingMode = config == null ? void 0 : config.roundingMode;
      switch (roundingMode) {
        case "floor":
          return FlowGraphInteger.FromValue(Math.floor(a));
        case "ceil":
          return FlowGraphInteger.FromValue(Math.ceil(a));
        case "round":
          return FlowGraphInteger.FromValue(Math.round(a));
        default:
          return FlowGraphInteger.FromValue(a);
      }
    }, "FlowGraphFloatToInt", config);
  }
}
RegisterClass("FlowGraphFloatToInt", FlowGraphFloatToInt);
export {
  FlowGraphBooleanToFloat,
  FlowGraphBooleanToInt,
  FlowGraphFloatToBoolean,
  FlowGraphFloatToInt,
  FlowGraphIntToBoolean,
  FlowGraphIntToFloat
};
