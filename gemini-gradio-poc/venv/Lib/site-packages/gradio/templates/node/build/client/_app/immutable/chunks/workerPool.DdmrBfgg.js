class WorkerPool {
  /**
   * Constructor
   * @param workers Array of workers to use for actions
   */
  constructor(workers) {
    this._pendingActions = new Array();
    this._workerInfos = workers.map((worker) => ({
      workerPromise: Promise.resolve(worker),
      idle: true
    }));
  }
  /**
   * Terminates all workers and clears any pending actions.
   */
  dispose() {
    for (const workerInfo of this._workerInfos) {
      workerInfo.workerPromise.then((worker) => {
        worker.terminate();
      });
    }
    this._workerInfos.length = 0;
    this._pendingActions.length = 0;
  }
  /**
   * Pushes an action to the worker pool. If all the workers are active, the action will be
   * pended until a worker has completed its action.
   * @param action The action to perform. Call onComplete when the action is complete.
   */
  push(action) {
    if (!this._executeOnIdleWorker(action)) {
      this._pendingActions.push(action);
    }
  }
  _executeOnIdleWorker(action) {
    for (const workerInfo of this._workerInfos) {
      if (workerInfo.idle) {
        this._execute(workerInfo, action);
        return true;
      }
    }
    return false;
  }
  _execute(workerInfo, action) {
    workerInfo.idle = false;
    workerInfo.workerPromise.then((worker) => {
      action(worker, () => {
        const nextAction = this._pendingActions.shift();
        if (nextAction) {
          this._execute(workerInfo, nextAction);
        } else {
          workerInfo.idle = true;
        }
      });
    });
  }
}
class AutoReleaseWorkerPool extends WorkerPool {
  constructor(maxWorkers, createWorkerAsync, options = AutoReleaseWorkerPool.DefaultOptions) {
    super([]);
    this._maxWorkers = maxWorkers;
    this._createWorkerAsync = createWorkerAsync;
    this._options = options;
  }
  push(action) {
    if (!this._executeOnIdleWorker(action)) {
      if (this._workerInfos.length < this._maxWorkers) {
        const workerInfo = {
          workerPromise: this._createWorkerAsync(),
          idle: false
        };
        this._workerInfos.push(workerInfo);
        this._execute(workerInfo, action);
      } else {
        this._pendingActions.push(action);
      }
    }
  }
  _execute(workerInfo, action) {
    if (workerInfo.timeoutId) {
      clearTimeout(workerInfo.timeoutId);
      delete workerInfo.timeoutId;
    }
    super._execute(workerInfo, (worker, onComplete) => {
      action(worker, () => {
        onComplete();
        if (workerInfo.idle) {
          workerInfo.timeoutId = setTimeout(() => {
            workerInfo.workerPromise.then((worker2) => {
              worker2.terminate();
            });
            const indexOf = this._workerInfos.indexOf(workerInfo);
            if (indexOf !== -1) {
              this._workerInfos.splice(indexOf, 1);
            }
          }, this._options.idleTimeElapsedBeforeRelease);
        }
      });
    });
  }
}
AutoReleaseWorkerPool.DefaultOptions = {
  idleTimeElapsedBeforeRelease: 1e3
};
export {
  AutoReleaseWorkerPool as A
};
