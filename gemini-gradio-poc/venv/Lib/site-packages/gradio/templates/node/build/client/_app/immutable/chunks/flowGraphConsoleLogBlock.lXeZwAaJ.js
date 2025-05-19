import { b as FlowGraphExecutionBlockWithOutSignal } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny } from "./declarationMapper.uCBvEQca.js";
import { h as Logger, R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphConsoleLogBlock extends FlowGraphExecutionBlockWithOutSignal {
  constructor(config) {
    super(config);
    this.message = this.registerDataInput("message", RichTypeAny);
    this.logType = this.registerDataInput("logType", RichTypeAny, "log");
    if (config == null ? void 0 : config.messageTemplate) {
      const matches = this._getTemplateMatches(config.messageTemplate);
      for (const match of matches) {
        this.registerDataInput(match, RichTypeAny);
      }
    }
  }
  /**
   * @internal
   */
  _execute(context) {
    const typeValue = this.logType.getValue(context);
    const messageValue = this._getMessageValue(context);
    if (typeValue === "warn") {
      Logger.Warn(messageValue);
    } else if (typeValue === "error") {
      Logger.Error(messageValue);
    } else {
      Logger.Log(messageValue);
    }
    this.out._activateSignal(context);
  }
  /**
   * @returns class name of the block.
   */
  getClassName() {
    return "FlowGraphConsoleLogBlock";
  }
  _getMessageValue(context) {
    var _a, _b;
    if ((_a = this.config) == null ? void 0 : _a.messageTemplate) {
      let template = this.config.messageTemplate;
      const matches = this._getTemplateMatches(template);
      for (const match of matches) {
        const value = (_b = this.getDataInput(match)) == null ? void 0 : _b.getValue(context);
        if (value !== void 0) {
          template = template.replace(new RegExp(`\\{${match}\\}`, "g"), value.toString());
        }
      }
      return template;
    } else {
      return this.message.getValue(context);
    }
  }
  _getTemplateMatches(template) {
    const regex = /\{([^}]+)\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(template)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }
}
RegisterClass("FlowGraphConsoleLogBlock", FlowGraphConsoleLogBlock);
export {
  FlowGraphConsoleLogBlock
};
