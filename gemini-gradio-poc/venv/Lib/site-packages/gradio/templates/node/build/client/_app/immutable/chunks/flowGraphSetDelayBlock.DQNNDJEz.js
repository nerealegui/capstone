import { a as FlowGraphAsyncExecutionBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { b as RichTypeNumber } from "./declarationMapper.uCBvEQca.js";
import { O as Observable, h as Logger, R as RegisterClass } from "./index.B4f7kVg_.js";
var TimerState;
(function(TimerState2) {
  TimerState2[TimerState2["INIT"] = 0] = "INIT";
  TimerState2[TimerState2["STARTED"] = 1] = "STARTED";
  TimerState2[TimerState2["ENDED"] = 2] = "ENDED";
})(TimerState || (TimerState = {}));
class AdvancedTimer {
  /**
   * Will construct a new advanced timer based on the options provided. Timer will not start until start() is called.
   * @param options construction options for this advanced timer
   */
  constructor(options) {
    this.onEachCountObservable = new Observable();
    this.onTimerAbortedObservable = new Observable();
    this.onTimerEndedObservable = new Observable();
    this.onStateChangedObservable = new Observable();
    this._observer = null;
    this._breakOnNextTick = false;
    this._tick = (payload) => {
      const now = Date.now();
      this._timer = now - this._startTime;
      const data = {
        startTime: this._startTime,
        currentTime: now,
        deltaTime: this._timer,
        completeRate: this._timer / this._timeToEnd,
        payload
      };
      const shouldBreak = this._breakOnNextTick || this._breakCondition(data);
      if (shouldBreak || this._timer >= this._timeToEnd) {
        this._stop(data, shouldBreak);
      } else {
        this.onEachCountObservable.notifyObservers(data);
      }
    };
    this._setState(
      0
      /* TimerState.INIT */
    );
    this._contextObservable = options.contextObservable;
    this._observableParameters = options.observableParameters ?? {};
    this._breakCondition = options.breakCondition ?? (() => false);
    this._timeToEnd = options.timeout;
    if (options.onEnded) {
      this.onTimerEndedObservable.add(options.onEnded);
    }
    if (options.onTick) {
      this.onEachCountObservable.add(options.onTick);
    }
    if (options.onAborted) {
      this.onTimerAbortedObservable.add(options.onAborted);
    }
  }
  /**
   * set a breaking condition for this timer. Default is to never break during count
   * @param predicate the new break condition. Returns true to break, false otherwise
   */
  set breakCondition(predicate) {
    this._breakCondition = predicate;
  }
  /**
   * Reset ALL associated observables in this advanced timer
   */
  clearObservables() {
    this.onEachCountObservable.clear();
    this.onTimerAbortedObservable.clear();
    this.onTimerEndedObservable.clear();
    this.onStateChangedObservable.clear();
  }
  /**
   * Will start a new iteration of this timer. Only one instance of this timer can run at a time.
   *
   * @param timeToEnd how much time to measure until timer ended
   */
  start(timeToEnd = this._timeToEnd) {
    if (this._state === 1) {
      throw new Error("Timer already started. Please stop it before starting again");
    }
    this._timeToEnd = timeToEnd;
    this._startTime = Date.now();
    this._timer = 0;
    this._observer = this._contextObservable.add(this._tick, this._observableParameters.mask, this._observableParameters.insertFirst, this._observableParameters.scope);
    this._setState(
      1
      /* TimerState.STARTED */
    );
  }
  /**
   * Will force a stop on the next tick.
   */
  stop() {
    if (this._state !== 1) {
      return;
    }
    this._breakOnNextTick = true;
  }
  /**
   * Dispose this timer, clearing all resources
   */
  dispose() {
    if (this._observer) {
      this._contextObservable.remove(this._observer);
    }
    this.clearObservables();
  }
  _setState(newState) {
    this._state = newState;
    this.onStateChangedObservable.notifyObservers(this._state);
  }
  _stop(data, aborted = false) {
    this._contextObservable.remove(this._observer);
    this._setState(
      2
      /* TimerState.ENDED */
    );
    if (aborted) {
      this.onTimerAbortedObservable.notifyObservers(data);
    } else {
      this.onTimerEndedObservable.notifyObservers(data);
    }
  }
}
class FlowGraphSetDelayBlock extends FlowGraphAsyncExecutionBlock {
  constructor(config) {
    super(config);
    this.cancel = this._registerSignalInput("cancel");
    this.duration = this.registerDataInput("duration", RichTypeNumber);
    this.lastDelayIndex = this.registerDataOutput("lastDelayIndex", RichTypeNumber, -1);
  }
  _preparePendingTasks(context) {
    const duration = this.duration.getValue(context);
    if (duration < 0 || isNaN(duration) || !isFinite(duration)) {
      return this._reportError(context, "Invalid duration in SetDelay block");
    }
    const activeDelays = context._getGlobalContextVariable("activeDelays", 0);
    if (activeDelays >= FlowGraphSetDelayBlock.MaxParallelDelayCount) {
      return this._reportError(context, "Max parallel delays reached");
    }
    const lastDelayIndex = context._getGlobalContextVariable("lastDelayIndex", -1);
    const timers = context._getExecutionVariable(this, "pendingDelays", []);
    const scene = context.configuration.scene;
    const timer = new AdvancedTimer({
      timeout: duration * 1e3,
      // duration is in seconds
      contextObservable: scene.onBeforeRenderObservable,
      onEnded: () => this._onEnded(timer, context)
    });
    timer.start();
    const newIndex = lastDelayIndex + 1;
    this.lastDelayIndex.setValue(newIndex, context);
    context._setGlobalContextVariable("lastDelayIndex", newIndex);
    timers[newIndex] = timer;
    context._setExecutionVariable(this, "pendingDelays", timers);
  }
  _cancelPendingTasks(context) {
    const timers = context._getExecutionVariable(this, "pendingDelays", []);
    for (const timer of timers) {
      timer == null ? void 0 : timer.dispose();
    }
    context._deleteExecutionVariable(this, "pendingDelays");
    this.lastDelayIndex.setValue(-1, context);
  }
  _execute(context, callingSignal) {
    if (callingSignal === this.cancel) {
      this._cancelPendingTasks(context);
      return;
    } else {
      this._preparePendingTasks(context);
      this.out._activateSignal(context);
    }
  }
  getClassName() {
    return "FlowGraphSetDelayBlock";
  }
  _onEnded(timer, context) {
    const timers = context._getExecutionVariable(this, "pendingDelays", []);
    const index = timers.indexOf(timer);
    if (index !== -1) {
      timers.splice(index, 1);
    } else {
      Logger.Warn("FlowGraphTimerBlock: Timer ended but was not found in the running timers list");
    }
    context._removePendingBlock(this);
    this.done._activateSignal(context);
  }
}
FlowGraphSetDelayBlock.MaxParallelDelayCount = 100;
RegisterClass("FlowGraphSetDelayBlock", FlowGraphSetDelayBlock);
export {
  FlowGraphSetDelayBlock
};
