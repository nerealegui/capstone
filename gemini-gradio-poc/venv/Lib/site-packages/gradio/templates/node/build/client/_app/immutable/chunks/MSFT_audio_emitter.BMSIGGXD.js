import { b5 as _WarnImport, R as RegisterClass, A as AbstractEngine, O as Observable, V as Vector3, ak as EngineStore, h as Logger, b as Tools, b7 as _retryWithInterval, p as Scene, b2 as SceneComponentConstants, M as Matrix, b0 as PrecisionDate, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { ArrayItem, GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
import "./audioEngine.BQI0FyFO.js";
class AnimationEvent {
  /**
   * Initializes the animation event
   * @param frame The frame for which the event is triggered
   * @param action The event to perform when triggered
   * @param onlyOnce Specifies if the event should be triggered only once
   */
  constructor(frame, action, onlyOnce) {
    this.frame = frame;
    this.action = action;
    this.onlyOnce = onlyOnce;
    this.isDone = false;
  }
  /** @internal */
  _clone() {
    return new AnimationEvent(this.frame, this.action, this.onlyOnce);
  }
}
class Sound {
  /**
   * Does the sound loop after it finishes playing once.
   */
  get loop() {
    return this._loop;
  }
  set loop(value) {
    if (value === this._loop) {
      return;
    }
    this._loop = value;
    this.updateOptions({ loop: value });
  }
  /**
   * Gets the current time for the sound.
   */
  get currentTime() {
    var _a;
    if (this._htmlAudioElement) {
      return this._htmlAudioElement.currentTime;
    }
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.audioContext) && (this.isPlaying || this.isPaused)) {
      const timeSinceLastStart = this.isPaused ? 0 : AbstractEngine.audioEngine.audioContext.currentTime - this._startTime;
      return this._currentTime + timeSinceLastStart;
    }
    return 0;
  }
  /**
   * Does this sound enables spatial sound.
   * @see https://doc.babylonjs.com/features/featuresDeepDive/audio/playingSoundsMusic#creating-a-spatial-3d-sound
   */
  get spatialSound() {
    return this._spatialSound;
  }
  /**
   * Does this sound enables spatial sound.
   * @see https://doc.babylonjs.com/features/featuresDeepDive/audio/playingSoundsMusic#creating-a-spatial-3d-sound
   */
  set spatialSound(newValue) {
    if (newValue == this._spatialSound) {
      return;
    }
    const wasPlaying = this.isPlaying;
    this.pause();
    if (newValue) {
      this._spatialSound = newValue;
      this._updateSpatialParameters();
    } else {
      this._disableSpatialSound();
    }
    if (wasPlaying) {
      this.play();
    }
  }
  /**
   * Create a sound and attach it to a scene
   * @param name Name of your sound
   * @param urlOrArrayBuffer Url to the sound to load async or ArrayBuffer, it also works with MediaStreams and AudioBuffers
   * @param scene defines the scene the sound belongs to
   * @param readyToPlayCallback Provide a callback function if you'd like to load your code once the sound is ready to be played
   * @param options Objects to provide with the current available options: autoplay, loop, volume, spatialSound, maxDistance, rolloffFactor, refDistance, distanceModel, panningModel, streaming
   */
  constructor(name, urlOrArrayBuffer, scene, readyToPlayCallback = null, options) {
    var _a;
    this.autoplay = false;
    this._loop = false;
    this.useCustomAttenuation = false;
    this.isPlaying = false;
    this.isPaused = false;
    this.refDistance = 1;
    this.rolloffFactor = 1;
    this.maxDistance = 100;
    this.distanceModel = "linear";
    this.metadata = null;
    this.onEndedObservable = new Observable();
    this._spatialSound = false;
    this._panningModel = "equalpower";
    this._playbackRate = 1;
    this._streaming = false;
    this._startTime = 0;
    this._currentTime = 0;
    this._position = Vector3.Zero();
    this._localDirection = new Vector3(1, 0, 0);
    this._volume = 1;
    this._isReadyToPlay = false;
    this._isDirectional = false;
    this._coneInnerAngle = 360;
    this._coneOuterAngle = 360;
    this._coneOuterGain = 0;
    this._isOutputConnected = false;
    this._urlType = "Unknown";
    this.name = name;
    scene = scene || EngineStore.LastCreatedScene;
    if (!scene) {
      return;
    }
    this._scene = scene;
    Sound._SceneComponentInitialization(scene);
    this._readyToPlayCallback = readyToPlayCallback;
    this._customAttenuationFunction = (currentVolume, currentDistance, maxDistance, refDistance, rolloffFactor) => {
      if (currentDistance < maxDistance) {
        return currentVolume * (1 - currentDistance / maxDistance);
      } else {
        return 0;
      }
    };
    if (options) {
      this.autoplay = options.autoplay || false;
      this._loop = options.loop || false;
      if (options.volume !== void 0) {
        this._volume = options.volume;
      }
      this._spatialSound = options.spatialSound ?? false;
      this.maxDistance = options.maxDistance ?? 100;
      this.useCustomAttenuation = options.useCustomAttenuation ?? false;
      this.rolloffFactor = options.rolloffFactor || 1;
      this.refDistance = options.refDistance || 1;
      this.distanceModel = options.distanceModel || "linear";
      this._playbackRate = options.playbackRate || 1;
      this._streaming = options.streaming ?? false;
      this._length = options.length;
      this._offset = options.offset;
    }
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && AbstractEngine.audioEngine.audioContext) {
      this._soundGain = AbstractEngine.audioEngine.audioContext.createGain();
      this._soundGain.gain.value = this._volume;
      this._inputAudioNode = this._soundGain;
      this._outputAudioNode = this._soundGain;
      if (this._spatialSound) {
        this._createSpatialParameters();
      }
      this._scene.mainSoundTrack.addSound(this);
      let validParameter = true;
      if (urlOrArrayBuffer) {
        try {
          if (typeof urlOrArrayBuffer === "string") {
            this._urlType = "String";
            this._url = urlOrArrayBuffer;
          } else if (urlOrArrayBuffer instanceof ArrayBuffer) {
            this._urlType = "ArrayBuffer";
          } else if (urlOrArrayBuffer instanceof HTMLMediaElement) {
            this._urlType = "MediaElement";
          } else if (urlOrArrayBuffer instanceof MediaStream) {
            this._urlType = "MediaStream";
          } else if (urlOrArrayBuffer instanceof AudioBuffer) {
            this._urlType = "AudioBuffer";
          } else if (Array.isArray(urlOrArrayBuffer)) {
            this._urlType = "Array";
          }
          let urls = [];
          let codecSupportedFound = false;
          switch (this._urlType) {
            case "MediaElement":
              this._streaming = true;
              this._isReadyToPlay = true;
              this._streamingSource = AbstractEngine.audioEngine.audioContext.createMediaElementSource(urlOrArrayBuffer);
              if (this.autoplay) {
                this.play(0, this._offset, this._length);
              }
              if (this._readyToPlayCallback) {
                this._readyToPlayCallback();
              }
              break;
            case "MediaStream":
              this._streaming = true;
              this._isReadyToPlay = true;
              this._streamingSource = AbstractEngine.audioEngine.audioContext.createMediaStreamSource(urlOrArrayBuffer);
              if (this.autoplay) {
                this.play(0, this._offset, this._length);
              }
              if (this._readyToPlayCallback) {
                this._readyToPlayCallback();
              }
              break;
            case "ArrayBuffer":
              if (urlOrArrayBuffer.byteLength > 0) {
                codecSupportedFound = true;
                this._soundLoaded(urlOrArrayBuffer);
              }
              break;
            case "AudioBuffer":
              this._audioBufferLoaded(urlOrArrayBuffer);
              break;
            case "String":
              urls.push(urlOrArrayBuffer);
            case "Array":
              if (urls.length === 0) {
                urls = urlOrArrayBuffer;
              }
              for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                codecSupportedFound = options && options.skipCodecCheck || url.indexOf(".mp3", url.length - 4) !== -1 && AbstractEngine.audioEngine.isMP3supported || url.indexOf(".ogg", url.length - 4) !== -1 && AbstractEngine.audioEngine.isOGGsupported || url.indexOf(".wav", url.length - 4) !== -1 || url.indexOf(".m4a", url.length - 4) !== -1 || url.indexOf(".mp4", url.length - 4) !== -1 || url.indexOf("blob:") !== -1;
                if (codecSupportedFound) {
                  if (!this._streaming) {
                    this._scene._loadFile(url, (data) => {
                      this._soundLoaded(data);
                    }, void 0, true, true, (exception) => {
                      if (exception) {
                        Logger.Error("XHR " + exception.status + " error on: " + url + ".");
                      }
                      Logger.Error("Sound creation aborted.");
                      this._scene.mainSoundTrack.removeSound(this);
                    });
                  } else {
                    this._htmlAudioElement = new Audio(url);
                    this._htmlAudioElement.controls = false;
                    this._htmlAudioElement.loop = this.loop;
                    Tools.SetCorsBehavior(url, this._htmlAudioElement);
                    this._htmlAudioElement.preload = "auto";
                    this._htmlAudioElement.addEventListener("canplaythrough", () => {
                      this._isReadyToPlay = true;
                      if (this.autoplay) {
                        this.play(0, this._offset, this._length);
                      }
                      if (this._readyToPlayCallback) {
                        this._readyToPlayCallback();
                      }
                    }, { once: true });
                    document.body.appendChild(this._htmlAudioElement);
                    this._htmlAudioElement.load();
                  }
                  break;
                }
              }
              break;
            default:
              validParameter = false;
              break;
          }
          if (!validParameter) {
            Logger.Error("Parameter must be a URL to the sound, an Array of URLs (.mp3 & .ogg) or an ArrayBuffer of the sound.");
          } else {
            if (!codecSupportedFound) {
              this._isReadyToPlay = true;
              if (this._readyToPlayCallback) {
                setTimeout(() => {
                  if (this._readyToPlayCallback) {
                    this._readyToPlayCallback();
                  }
                }, 1e3);
              }
            }
          }
        } catch (ex) {
          Logger.Error("Unexpected error. Sound creation aborted.");
          this._scene.mainSoundTrack.removeSound(this);
        }
      }
    } else {
      this._scene.mainSoundTrack.addSound(this);
      if (AbstractEngine.audioEngine && !AbstractEngine.audioEngine.WarnedWebAudioUnsupported) {
        Logger.Error("Web Audio is not supported by your browser.");
        AbstractEngine.audioEngine.WarnedWebAudioUnsupported = true;
      }
      if (this._readyToPlayCallback) {
        setTimeout(() => {
          if (this._readyToPlayCallback) {
            this._readyToPlayCallback();
          }
        }, 1e3);
      }
    }
  }
  /**
   * Release the sound and its associated resources
   */
  dispose() {
    var _a;
    if ((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) {
      if (this.isPlaying) {
        this.stop();
      }
      this._isReadyToPlay = false;
      if (this.soundTrackId === -1) {
        this._scene.mainSoundTrack.removeSound(this);
      } else if (this._scene.soundTracks) {
        this._scene.soundTracks[this.soundTrackId].removeSound(this);
      }
      if (this._soundGain) {
        this._soundGain.disconnect();
        this._soundGain = null;
      }
      if (this._soundPanner) {
        this._soundPanner.disconnect();
        this._soundPanner = null;
      }
      if (this._soundSource) {
        this._soundSource.disconnect();
        this._soundSource = null;
      }
      this._audioBuffer = null;
      if (this._htmlAudioElement) {
        this._htmlAudioElement.pause();
        this._htmlAudioElement.src = "";
        document.body.removeChild(this._htmlAudioElement);
        this._htmlAudioElement = null;
      }
      if (this._streamingSource) {
        this._streamingSource.disconnect();
        this._streamingSource = null;
      }
      if (this._connectedTransformNode && this._registerFunc) {
        this._connectedTransformNode.unregisterAfterWorldMatrixUpdate(this._registerFunc);
        this._connectedTransformNode = null;
      }
      this._clearTimeoutsAndObservers();
    }
  }
  /**
   * Gets if the sounds is ready to be played or not.
   * @returns true if ready, otherwise false
   */
  isReady() {
    return this._isReadyToPlay;
  }
  /**
   * Get the current class name.
   * @returns current class name
   */
  getClassName() {
    return "Sound";
  }
  _audioBufferLoaded(buffer) {
    var _a;
    if (!((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.audioContext)) {
      return;
    }
    this._audioBuffer = buffer;
    this._isReadyToPlay = true;
    if (this.autoplay) {
      this.play(0, this._offset, this._length);
    }
    if (this._readyToPlayCallback) {
      this._readyToPlayCallback();
    }
  }
  _soundLoaded(audioData) {
    var _a;
    if (!((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.audioContext)) {
      return;
    }
    AbstractEngine.audioEngine.audioContext.decodeAudioData(audioData, (buffer) => {
      this._audioBufferLoaded(buffer);
    }, (err) => {
      Logger.Error("Error while decoding audio data for: " + this.name + " / Error: " + err);
    });
  }
  /**
   * Sets the data of the sound from an audiobuffer
   * @param audioBuffer The audioBuffer containing the data
   */
  setAudioBuffer(audioBuffer) {
    var _a;
    if ((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) {
      this._audioBuffer = audioBuffer;
      this._isReadyToPlay = true;
    }
  }
  /**
   * Updates the current sounds options such as maxdistance, loop...
   * @param options A JSON object containing values named as the object properties
   */
  updateOptions(options) {
    if (options) {
      this.loop = options.loop ?? this.loop;
      this.maxDistance = options.maxDistance ?? this.maxDistance;
      this.useCustomAttenuation = options.useCustomAttenuation ?? this.useCustomAttenuation;
      this.rolloffFactor = options.rolloffFactor ?? this.rolloffFactor;
      this.refDistance = options.refDistance ?? this.refDistance;
      this.distanceModel = options.distanceModel ?? this.distanceModel;
      this._playbackRate = options.playbackRate ?? this._playbackRate;
      this._length = options.length ?? void 0;
      this.spatialSound = options.spatialSound ?? this._spatialSound;
      this._setOffset(options.offset ?? void 0);
      this.setVolume(options.volume ?? this._volume);
      this._updateSpatialParameters();
      if (this.isPlaying) {
        if (this._streaming && this._htmlAudioElement) {
          this._htmlAudioElement.playbackRate = this._playbackRate;
          if (this._htmlAudioElement.loop !== this.loop) {
            this._htmlAudioElement.loop = this.loop;
          }
        } else {
          if (this._soundSource) {
            this._soundSource.playbackRate.value = this._playbackRate;
            if (this._soundSource.loop !== this.loop) {
              this._soundSource.loop = this.loop;
            }
            if (this._offset !== void 0 && this._soundSource.loopStart !== this._offset) {
              this._soundSource.loopStart = this._offset;
            }
            if (this._length !== void 0 && this._length !== this._soundSource.loopEnd) {
              this._soundSource.loopEnd = (this._offset | 0) + this._length;
            }
          }
        }
      }
    }
  }
  _createSpatialParameters() {
    var _a;
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && AbstractEngine.audioEngine.audioContext) {
      if (this._scene.headphone) {
        this._panningModel = "HRTF";
      }
      this._soundPanner = this._soundPanner ?? AbstractEngine.audioEngine.audioContext.createPanner();
      if (this._soundPanner && this._outputAudioNode) {
        this._updateSpatialParameters();
        this._soundPanner.connect(this._outputAudioNode);
        this._inputAudioNode = this._soundPanner;
      }
    }
  }
  _disableSpatialSound() {
    var _a;
    if (!this._spatialSound) {
      return;
    }
    this._inputAudioNode = this._soundGain;
    (_a = this._soundPanner) == null ? void 0 : _a.disconnect();
    this._soundPanner = null;
    this._spatialSound = false;
  }
  _updateSpatialParameters() {
    if (!this._spatialSound) {
      return;
    }
    if (this._soundPanner) {
      if (this.useCustomAttenuation) {
        this._soundPanner.distanceModel = "linear";
        this._soundPanner.maxDistance = Number.MAX_VALUE;
        this._soundPanner.refDistance = 1;
        this._soundPanner.rolloffFactor = 1;
        this._soundPanner.panningModel = this._panningModel;
      } else {
        this._soundPanner.distanceModel = this.distanceModel;
        this._soundPanner.maxDistance = this.maxDistance;
        this._soundPanner.refDistance = this.refDistance;
        this._soundPanner.rolloffFactor = this.rolloffFactor;
        this._soundPanner.panningModel = this._panningModel;
      }
    } else {
      this._createSpatialParameters();
    }
  }
  /**
   * Switch the panning model to HRTF:
   * Renders a stereo output of higher quality than equalpower — it uses a convolution with measured impulse responses from human subjects.
   * @see https://doc.babylonjs.com/features/featuresDeepDive/audio/playingSoundsMusic#creating-a-spatial-3d-sound
   */
  switchPanningModelToHRTF() {
    this._panningModel = "HRTF";
    this._switchPanningModel();
  }
  /**
   * Switch the panning model to Equal Power:
   * Represents the equal-power panning algorithm, generally regarded as simple and efficient. equalpower is the default value.
   * @see https://doc.babylonjs.com/features/featuresDeepDive/audio/playingSoundsMusic#creating-a-spatial-3d-sound
   */
  switchPanningModelToEqualPower() {
    this._panningModel = "equalpower";
    this._switchPanningModel();
  }
  _switchPanningModel() {
    var _a;
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && this._spatialSound && this._soundPanner) {
      this._soundPanner.panningModel = this._panningModel;
    }
  }
  /**
   * Connect this sound to a sound track audio node like gain...
   * @param soundTrackAudioNode the sound track audio node to connect to
   */
  connectToSoundTrackAudioNode(soundTrackAudioNode) {
    var _a;
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && this._outputAudioNode) {
      if (this._isOutputConnected) {
        this._outputAudioNode.disconnect();
      }
      this._outputAudioNode.connect(soundTrackAudioNode);
      this._isOutputConnected = true;
    }
  }
  /**
   * Transform this sound into a directional source
   * @param coneInnerAngle Size of the inner cone in degree
   * @param coneOuterAngle Size of the outer cone in degree
   * @param coneOuterGain Volume of the sound outside the outer cone (between 0.0 and 1.0)
   */
  setDirectionalCone(coneInnerAngle, coneOuterAngle, coneOuterGain) {
    if (coneOuterAngle < coneInnerAngle) {
      Logger.Error("setDirectionalCone(): outer angle of the cone must be superior or equal to the inner angle.");
      return;
    }
    this._coneInnerAngle = coneInnerAngle;
    this._coneOuterAngle = coneOuterAngle;
    this._coneOuterGain = coneOuterGain;
    this._isDirectional = true;
    if (this.isPlaying && this.loop) {
      this.stop();
      this.play(0, this._offset, this._length);
    }
  }
  /**
   * Gets or sets the inner angle for the directional cone.
   */
  get directionalConeInnerAngle() {
    return this._coneInnerAngle;
  }
  /**
   * Gets or sets the inner angle for the directional cone.
   */
  set directionalConeInnerAngle(value) {
    var _a;
    if (value != this._coneInnerAngle) {
      if (this._coneOuterAngle < value) {
        Logger.Error("directionalConeInnerAngle: outer angle of the cone must be superior or equal to the inner angle.");
        return;
      }
      this._coneInnerAngle = value;
      if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && this._spatialSound && this._soundPanner) {
        this._soundPanner.coneInnerAngle = this._coneInnerAngle;
      }
    }
  }
  /**
   * Gets or sets the outer angle for the directional cone.
   */
  get directionalConeOuterAngle() {
    return this._coneOuterAngle;
  }
  /**
   * Gets or sets the outer angle for the directional cone.
   */
  set directionalConeOuterAngle(value) {
    var _a;
    if (value != this._coneOuterAngle) {
      if (value < this._coneInnerAngle) {
        Logger.Error("directionalConeOuterAngle: outer angle of the cone must be superior or equal to the inner angle.");
        return;
      }
      this._coneOuterAngle = value;
      if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && this._spatialSound && this._soundPanner) {
        this._soundPanner.coneOuterAngle = this._coneOuterAngle;
      }
    }
  }
  /**
   * Sets the position of the emitter if spatial sound is enabled
   * @param newPosition Defines the new position
   */
  setPosition(newPosition) {
    var _a;
    if (newPosition.equals(this._position)) {
      return;
    }
    this._position.copyFrom(newPosition);
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && this._spatialSound && this._soundPanner && !isNaN(this._position.x) && !isNaN(this._position.y) && !isNaN(this._position.z)) {
      this._soundPanner.positionX.value = this._position.x;
      this._soundPanner.positionY.value = this._position.y;
      this._soundPanner.positionZ.value = this._position.z;
    }
  }
  /**
   * Sets the local direction of the emitter if spatial sound is enabled
   * @param newLocalDirection Defines the new local direction
   */
  setLocalDirectionToMesh(newLocalDirection) {
    var _a;
    this._localDirection = newLocalDirection;
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && this._connectedTransformNode && this.isPlaying) {
      this._updateDirection();
    }
  }
  _updateDirection() {
    if (!this._connectedTransformNode || !this._soundPanner) {
      return;
    }
    const mat = this._connectedTransformNode.getWorldMatrix();
    const direction = Vector3.TransformNormal(this._localDirection, mat);
    direction.normalize();
    this._soundPanner.orientationX.value = direction.x;
    this._soundPanner.orientationY.value = direction.y;
    this._soundPanner.orientationZ.value = direction.z;
  }
  /** @internal */
  updateDistanceFromListener() {
    var _a;
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && this._connectedTransformNode && this.useCustomAttenuation && this._soundGain && this._scene.activeCamera) {
      const distance = this._scene.audioListenerPositionProvider ? this._connectedTransformNode.position.subtract(this._scene.audioListenerPositionProvider()).length() : this._connectedTransformNode.getDistanceToCamera(this._scene.activeCamera);
      this._soundGain.gain.value = this._customAttenuationFunction(this._volume, distance, this.maxDistance, this.refDistance, this.rolloffFactor);
    }
  }
  /**
   * Sets a new custom attenuation function for the sound.
   * @param callback Defines the function used for the attenuation
   * @see https://doc.babylonjs.com/features/featuresDeepDive/audio/playingSoundsMusic#creating-your-own-custom-attenuation-function
   */
  setAttenuationFunction(callback) {
    this._customAttenuationFunction = callback;
  }
  /**
   * Play the sound
   * @param time (optional) Start the sound after X seconds. Start immediately (0) by default.
   * @param offset (optional) Start the sound at a specific time in seconds
   * @param length (optional) Sound duration (in seconds)
   */
  play(time, offset, length) {
    var _a, _b, _c, _d;
    if (this._isReadyToPlay && this._scene.audioEnabled && ((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.audioContext)) {
      try {
        this._clearTimeoutsAndObservers();
        let startTime = time ? ((_b = AbstractEngine.audioEngine) == null ? void 0 : _b.audioContext.currentTime) + time : (_c = AbstractEngine.audioEngine) == null ? void 0 : _c.audioContext.currentTime;
        if (!this._soundSource || !this._streamingSource) {
          if (this._spatialSound && this._soundPanner) {
            if (!isNaN(this._position.x) && !isNaN(this._position.y) && !isNaN(this._position.z)) {
              this._soundPanner.positionX.value = this._position.x;
              this._soundPanner.positionY.value = this._position.y;
              this._soundPanner.positionZ.value = this._position.z;
            }
            if (this._isDirectional) {
              this._soundPanner.coneInnerAngle = this._coneInnerAngle;
              this._soundPanner.coneOuterAngle = this._coneOuterAngle;
              this._soundPanner.coneOuterGain = this._coneOuterGain;
              if (this._connectedTransformNode) {
                this._updateDirection();
              } else {
                this._soundPanner.setOrientation(this._localDirection.x, this._localDirection.y, this._localDirection.z);
              }
            }
          }
        }
        if (this._streaming) {
          if (!this._streamingSource && this._htmlAudioElement) {
            this._streamingSource = AbstractEngine.audioEngine.audioContext.createMediaElementSource(this._htmlAudioElement);
            this._htmlAudioElement.onended = () => {
              this._onended();
            };
            this._htmlAudioElement.playbackRate = this._playbackRate;
          }
          if (this._streamingSource) {
            this._streamingSource.disconnect();
            if (this._inputAudioNode) {
              this._streamingSource.connect(this._inputAudioNode);
            }
          }
          if (this._htmlAudioElement) {
            const tryToPlay = () => {
              var _a2, _b2;
              if ((_a2 = AbstractEngine.audioEngine) == null ? void 0 : _a2.unlocked) {
                if (!this._htmlAudioElement) {
                  return;
                }
                this._htmlAudioElement.currentTime = offset ?? 0;
                const playPromise = this._htmlAudioElement.play();
                if (playPromise !== void 0) {
                  playPromise.catch(() => {
                    var _a3, _b3;
                    (_a3 = AbstractEngine.audioEngine) == null ? void 0 : _a3.lock();
                    if (this.loop || this.autoplay) {
                      this._audioUnlockedObserver = (_b3 = AbstractEngine.audioEngine) == null ? void 0 : _b3.onAudioUnlockedObservable.addOnce(() => {
                        tryToPlay();
                      });
                    }
                  });
                }
              } else {
                if (this.loop || this.autoplay) {
                  this._audioUnlockedObserver = (_b2 = AbstractEngine.audioEngine) == null ? void 0 : _b2.onAudioUnlockedObservable.addOnce(() => {
                    tryToPlay();
                  });
                }
              }
            };
            tryToPlay();
          }
        } else {
          const tryToPlay = () => {
            var _a2, _b2, _c2;
            if ((_a2 = AbstractEngine.audioEngine) == null ? void 0 : _a2.audioContext) {
              length = length || this._length;
              if (offset !== void 0) {
                this._setOffset(offset);
              }
              if (this._soundSource) {
                const oldSource = this._soundSource;
                oldSource.onended = () => {
                  oldSource.disconnect();
                };
              }
              this._soundSource = (_b2 = AbstractEngine.audioEngine) == null ? void 0 : _b2.audioContext.createBufferSource();
              if (this._soundSource && this._inputAudioNode) {
                this._soundSource.buffer = this._audioBuffer;
                this._soundSource.connect(this._inputAudioNode);
                this._soundSource.loop = this.loop;
                if (offset !== void 0) {
                  this._soundSource.loopStart = offset;
                }
                if (length !== void 0) {
                  this._soundSource.loopEnd = (offset | 0) + length;
                }
                this._soundSource.playbackRate.value = this._playbackRate;
                this._soundSource.onended = () => {
                  this._onended();
                };
                startTime = time ? ((_c2 = AbstractEngine.audioEngine) == null ? void 0 : _c2.audioContext.currentTime) + time : AbstractEngine.audioEngine.audioContext.currentTime;
                const actualOffset = ((this.isPaused ? this.currentTime : 0) + (this._offset ?? 0)) % this._soundSource.buffer.duration;
                this._soundSource.start(startTime, actualOffset, this.loop ? void 0 : length);
              }
            }
          };
          if (((_d = AbstractEngine.audioEngine) == null ? void 0 : _d.audioContext.state) === "suspended") {
            this._tryToPlayTimeout = setTimeout(() => {
              var _a2;
              if (((_a2 = AbstractEngine.audioEngine) == null ? void 0 : _a2.audioContext.state) === "suspended") {
                AbstractEngine.audioEngine.lock();
                if (this.loop || this.autoplay) {
                  this._audioUnlockedObserver = AbstractEngine.audioEngine.onAudioUnlockedObservable.addOnce(() => {
                    tryToPlay();
                  });
                }
              } else {
                tryToPlay();
              }
            }, 500);
          } else {
            tryToPlay();
          }
        }
        this._startTime = startTime;
        this.isPlaying = true;
        this.isPaused = false;
      } catch (ex) {
        Logger.Error("Error while trying to play audio: " + this.name + ", " + ex.message);
      }
    }
  }
  _onended() {
    this.isPlaying = false;
    this._startTime = 0;
    this._currentTime = 0;
    if (this.onended) {
      this.onended();
    }
    this.onEndedObservable.notifyObservers(this);
  }
  /**
   * Stop the sound
   * @param time (optional) Stop the sound after X seconds. Stop immediately (0) by default.
   */
  stop(time) {
    var _a, _b;
    if (this.isPlaying) {
      this._clearTimeoutsAndObservers();
      if (this._streaming) {
        if (this._htmlAudioElement) {
          this._htmlAudioElement.pause();
          if (this._htmlAudioElement.currentTime > 0) {
            this._htmlAudioElement.currentTime = 0;
          }
        } else {
          (_a = this._streamingSource) == null ? void 0 : _a.disconnect();
        }
        this.isPlaying = false;
      } else if (((_b = AbstractEngine.audioEngine) == null ? void 0 : _b.audioContext) && this._soundSource) {
        const stopTime = time ? AbstractEngine.audioEngine.audioContext.currentTime + time : void 0;
        this._soundSource.onended = () => {
          this.isPlaying = false;
          this.isPaused = false;
          this._startTime = 0;
          this._currentTime = 0;
          if (this._soundSource) {
            this._soundSource.onended = () => void 0;
          }
          this._onended();
        };
        this._soundSource.stop(stopTime);
      } else {
        this.isPlaying = false;
      }
    } else if (this.isPaused) {
      this.isPaused = false;
      this._startTime = 0;
      this._currentTime = 0;
    }
  }
  /**
   * Put the sound in pause
   */
  pause() {
    var _a, _b;
    if (this.isPlaying) {
      this._clearTimeoutsAndObservers();
      if (this._streaming) {
        if (this._htmlAudioElement) {
          this._htmlAudioElement.pause();
        } else {
          (_a = this._streamingSource) == null ? void 0 : _a.disconnect();
        }
        this.isPlaying = false;
        this.isPaused = true;
      } else if (((_b = AbstractEngine.audioEngine) == null ? void 0 : _b.audioContext) && this._soundSource) {
        this._soundSource.onended = () => void 0;
        this._soundSource.stop();
        this.isPlaying = false;
        this.isPaused = true;
        this._currentTime += AbstractEngine.audioEngine.audioContext.currentTime - this._startTime;
      }
    }
  }
  /**
   * Sets a dedicated volume for this sounds
   * @param newVolume Define the new volume of the sound
   * @param time Define time for gradual change to new volume
   */
  setVolume(newVolume, time) {
    var _a;
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && this._soundGain) {
      if (time && AbstractEngine.audioEngine.audioContext) {
        this._soundGain.gain.cancelScheduledValues(AbstractEngine.audioEngine.audioContext.currentTime);
        this._soundGain.gain.setValueAtTime(this._soundGain.gain.value, AbstractEngine.audioEngine.audioContext.currentTime);
        this._soundGain.gain.linearRampToValueAtTime(newVolume, AbstractEngine.audioEngine.audioContext.currentTime + time);
      } else {
        this._soundGain.gain.value = newVolume;
      }
    }
    this._volume = newVolume;
  }
  /**
   * Set the sound play back rate
   * @param newPlaybackRate Define the playback rate the sound should be played at
   */
  setPlaybackRate(newPlaybackRate) {
    this._playbackRate = newPlaybackRate;
    if (this.isPlaying) {
      if (this._streaming && this._htmlAudioElement) {
        this._htmlAudioElement.playbackRate = this._playbackRate;
      } else if (this._soundSource) {
        this._soundSource.playbackRate.value = this._playbackRate;
      }
    }
  }
  /**
   * Gets the sound play back rate.
   * @returns the  play back rate of the sound
   */
  getPlaybackRate() {
    return this._playbackRate;
  }
  /**
   * Gets the volume of the sound.
   * @returns the volume of the sound
   */
  getVolume() {
    return this._volume;
  }
  /**
   * Attach the sound to a dedicated mesh
   * @param transformNode The transform node to connect the sound with
   * @see https://doc.babylonjs.com/features/featuresDeepDive/audio/playingSoundsMusic#attaching-a-sound-to-a-mesh
   */
  attachToMesh(transformNode) {
    if (this._connectedTransformNode && this._registerFunc) {
      this._connectedTransformNode.unregisterAfterWorldMatrixUpdate(this._registerFunc);
      this._registerFunc = null;
    }
    this._connectedTransformNode = transformNode;
    if (!this._spatialSound) {
      this._spatialSound = true;
      this._createSpatialParameters();
      if (this.isPlaying && this.loop) {
        this.stop();
        this.play(0, this._offset, this._length);
      }
    }
    this._onRegisterAfterWorldMatrixUpdate(this._connectedTransformNode);
    this._registerFunc = (transformNode2) => this._onRegisterAfterWorldMatrixUpdate(transformNode2);
    this._connectedTransformNode.registerAfterWorldMatrixUpdate(this._registerFunc);
  }
  /**
   * Detach the sound from the previously attached mesh
   * @see https://doc.babylonjs.com/features/featuresDeepDive/audio/playingSoundsMusic#attaching-a-sound-to-a-mesh
   */
  detachFromMesh() {
    if (this._connectedTransformNode && this._registerFunc) {
      this._connectedTransformNode.unregisterAfterWorldMatrixUpdate(this._registerFunc);
      this._registerFunc = null;
      this._connectedTransformNode = null;
    }
  }
  _onRegisterAfterWorldMatrixUpdate(node) {
    var _a;
    if (!node.getBoundingInfo) {
      this.setPosition(node.absolutePosition);
    } else {
      const mesh = node;
      const boundingInfo = mesh.getBoundingInfo();
      this.setPosition(boundingInfo.boundingSphere.centerWorld);
    }
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && this._isDirectional && this.isPlaying) {
      this._updateDirection();
    }
  }
  /**
   * Clone the current sound in the scene.
   * @returns the new sound clone
   */
  clone() {
    if (!this._streaming) {
      const setBufferAndRun = () => {
        _retryWithInterval(() => this._isReadyToPlay, () => {
          clonedSound._audioBuffer = this.getAudioBuffer();
          clonedSound._isReadyToPlay = true;
          if (clonedSound.autoplay) {
            clonedSound.play(0, this._offset, this._length);
          }
        }, void 0, 300);
      };
      const currentOptions = {
        autoplay: this.autoplay,
        loop: this.loop,
        volume: this._volume,
        spatialSound: this._spatialSound,
        maxDistance: this.maxDistance,
        useCustomAttenuation: this.useCustomAttenuation,
        rolloffFactor: this.rolloffFactor,
        refDistance: this.refDistance,
        distanceModel: this.distanceModel
      };
      const clonedSound = new Sound(this.name + "_cloned", new ArrayBuffer(0), this._scene, null, currentOptions);
      if (this.useCustomAttenuation) {
        clonedSound.setAttenuationFunction(this._customAttenuationFunction);
      }
      clonedSound.setPosition(this._position);
      clonedSound.setPlaybackRate(this._playbackRate);
      setBufferAndRun();
      return clonedSound;
    } else {
      return null;
    }
  }
  /**
   * Gets the current underlying audio buffer containing the data
   * @returns the audio buffer
   */
  getAudioBuffer() {
    return this._audioBuffer;
  }
  /**
   * Gets the WebAudio AudioBufferSourceNode, lets you keep track of and stop instances of this Sound.
   * @returns the source node
   */
  getSoundSource() {
    return this._soundSource;
  }
  /**
   * Gets the WebAudio GainNode, gives you precise control over the gain of instances of this Sound.
   * @returns the gain node
   */
  getSoundGain() {
    return this._soundGain;
  }
  /**
   * Serializes the Sound in a JSON representation
   * @returns the JSON representation of the sound
   */
  serialize() {
    const serializationObject = {
      name: this.name,
      url: this._url,
      autoplay: this.autoplay,
      loop: this.loop,
      volume: this._volume,
      spatialSound: this._spatialSound,
      maxDistance: this.maxDistance,
      rolloffFactor: this.rolloffFactor,
      refDistance: this.refDistance,
      distanceModel: this.distanceModel,
      playbackRate: this._playbackRate,
      panningModel: this._panningModel,
      soundTrackId: this.soundTrackId,
      metadata: this.metadata
    };
    if (this._spatialSound) {
      if (this._connectedTransformNode) {
        serializationObject.connectedMeshId = this._connectedTransformNode.id;
      }
      serializationObject.position = this._position.asArray();
      serializationObject.refDistance = this.refDistance;
      serializationObject.distanceModel = this.distanceModel;
      serializationObject.isDirectional = this._isDirectional;
      serializationObject.localDirectionToMesh = this._localDirection.asArray();
      serializationObject.coneInnerAngle = this._coneInnerAngle;
      serializationObject.coneOuterAngle = this._coneOuterAngle;
      serializationObject.coneOuterGain = this._coneOuterGain;
    }
    return serializationObject;
  }
  /**
   * Parse a JSON representation of a sound to instantiate in a given scene
   * @param parsedSound Define the JSON representation of the sound (usually coming from the serialize method)
   * @param scene Define the scene the new parsed sound should be created in
   * @param rootUrl Define the rooturl of the load in case we need to fetch relative dependencies
   * @param sourceSound Define a sound place holder if do not need to instantiate a new one
   * @returns the newly parsed sound
   */
  static Parse(parsedSound, scene, rootUrl, sourceSound) {
    const soundName = parsedSound.name;
    let soundUrl;
    if (parsedSound.url) {
      soundUrl = rootUrl + parsedSound.url;
    } else {
      soundUrl = rootUrl + soundName;
    }
    const options = {
      autoplay: parsedSound.autoplay,
      loop: parsedSound.loop,
      volume: parsedSound.volume,
      spatialSound: parsedSound.spatialSound,
      maxDistance: parsedSound.maxDistance,
      rolloffFactor: parsedSound.rolloffFactor,
      refDistance: parsedSound.refDistance,
      distanceModel: parsedSound.distanceModel,
      playbackRate: parsedSound.playbackRate
    };
    let newSound;
    if (!sourceSound) {
      newSound = new Sound(soundName, soundUrl, scene, () => {
        scene.removePendingData(newSound);
      }, options);
      scene.addPendingData(newSound);
    } else {
      const setBufferAndRun = () => {
        _retryWithInterval(() => sourceSound._isReadyToPlay, () => {
          newSound._audioBuffer = sourceSound.getAudioBuffer();
          newSound._isReadyToPlay = true;
          if (newSound.autoplay) {
            newSound.play(0, newSound._offset, newSound._length);
          }
        }, void 0, 300);
      };
      newSound = new Sound(soundName, new ArrayBuffer(0), scene, null, options);
      setBufferAndRun();
    }
    if (parsedSound.position) {
      const soundPosition = Vector3.FromArray(parsedSound.position);
      newSound.setPosition(soundPosition);
    }
    if (parsedSound.isDirectional) {
      newSound.setDirectionalCone(parsedSound.coneInnerAngle || 360, parsedSound.coneOuterAngle || 360, parsedSound.coneOuterGain || 0);
      if (parsedSound.localDirectionToMesh) {
        const localDirectionToMesh = Vector3.FromArray(parsedSound.localDirectionToMesh);
        newSound.setLocalDirectionToMesh(localDirectionToMesh);
      }
    }
    if (parsedSound.connectedMeshId) {
      const connectedMesh = scene.getMeshById(parsedSound.connectedMeshId);
      if (connectedMesh) {
        newSound.attachToMesh(connectedMesh);
      }
    }
    if (parsedSound.metadata) {
      newSound.metadata = parsedSound.metadata;
    }
    return newSound;
  }
  _setOffset(value) {
    if (this._offset === value) {
      return;
    }
    if (this.isPaused) {
      this.stop();
      this.isPaused = false;
    }
    this._offset = value;
  }
  _clearTimeoutsAndObservers() {
    var _a;
    if (this._tryToPlayTimeout) {
      clearTimeout(this._tryToPlayTimeout);
      this._tryToPlayTimeout = null;
    }
    if (this._audioUnlockedObserver) {
      (_a = AbstractEngine.audioEngine) == null ? void 0 : _a.onAudioUnlockedObservable.remove(this._audioUnlockedObserver);
      this._audioUnlockedObserver = null;
    }
  }
}
Sound._SceneComponentInitialization = (_) => {
  throw _WarnImport("AudioSceneComponent");
};
RegisterClass("BABYLON.Sound", Sound);
class WeightedSound {
  /**
   * Creates a new WeightedSound from the list of sounds given.
   * @param loop When true a Sound will be selected and played when the current playing Sound completes.
   * @param sounds Array of Sounds that will be selected from.
   * @param weights Array of number values for selection weights; length must equal sounds, values will be normalized to 1
   */
  constructor(loop, sounds, weights) {
    this.loop = false;
    this._coneInnerAngle = 360;
    this._coneOuterAngle = 360;
    this._volume = 1;
    this.isPlaying = false;
    this.isPaused = false;
    this._sounds = [];
    this._weights = [];
    if (sounds.length !== weights.length) {
      throw new Error("Sounds length does not equal weights length");
    }
    this.loop = loop;
    this._weights = weights;
    let weightSum = 0;
    for (const weight of weights) {
      weightSum += weight;
    }
    const invWeightSum = weightSum > 0 ? 1 / weightSum : 0;
    for (let i = 0; i < this._weights.length; i++) {
      this._weights[i] *= invWeightSum;
    }
    this._sounds = sounds;
    for (const sound of this._sounds) {
      sound.onEndedObservable.add(() => {
        this._onended();
      });
    }
  }
  /**
   * The size of cone in degrees for a directional sound in which there will be no attenuation.
   */
  get directionalConeInnerAngle() {
    return this._coneInnerAngle;
  }
  /**
   * The size of cone in degrees for a directional sound in which there will be no attenuation.
   */
  set directionalConeInnerAngle(value) {
    if (value !== this._coneInnerAngle) {
      if (this._coneOuterAngle < value) {
        Logger.Error("directionalConeInnerAngle: outer angle of the cone must be superior or equal to the inner angle.");
        return;
      }
      this._coneInnerAngle = value;
      for (const sound of this._sounds) {
        sound.directionalConeInnerAngle = value;
      }
    }
  }
  /**
   * Size of cone in degrees for a directional sound outside of which there will be no sound.
   * Listener angles between innerAngle and outerAngle will falloff linearly.
   */
  get directionalConeOuterAngle() {
    return this._coneOuterAngle;
  }
  /**
   * Size of cone in degrees for a directional sound outside of which there will be no sound.
   * Listener angles between innerAngle and outerAngle will falloff linearly.
   */
  set directionalConeOuterAngle(value) {
    if (value !== this._coneOuterAngle) {
      if (value < this._coneInnerAngle) {
        Logger.Error("directionalConeOuterAngle: outer angle of the cone must be superior or equal to the inner angle.");
        return;
      }
      this._coneOuterAngle = value;
      for (const sound of this._sounds) {
        sound.directionalConeOuterAngle = value;
      }
    }
  }
  /**
   * Playback volume.
   */
  get volume() {
    return this._volume;
  }
  /**
   * Playback volume.
   */
  set volume(value) {
    if (value !== this._volume) {
      for (const sound of this._sounds) {
        sound.setVolume(value);
      }
    }
  }
  _onended() {
    if (this._currentIndex !== void 0) {
      this._sounds[this._currentIndex].autoplay = false;
    }
    if (this.loop && this.isPlaying) {
      this.play();
    } else {
      this.isPlaying = false;
    }
  }
  /**
   * Suspend playback
   */
  pause() {
    if (this.isPlaying) {
      this.isPaused = true;
      if (this._currentIndex !== void 0) {
        this._sounds[this._currentIndex].pause();
      }
    }
  }
  /**
   * Stop playback
   */
  stop() {
    this.isPlaying = false;
    if (this._currentIndex !== void 0) {
      this._sounds[this._currentIndex].stop();
    }
  }
  /**
   * Start playback.
   * @param startOffset Position the clip head at a specific time in seconds.
   */
  play(startOffset) {
    if (!this.isPaused) {
      this.stop();
      const randomValue = Math.random();
      let total = 0;
      for (let i = 0; i < this._weights.length; i++) {
        total += this._weights[i];
        if (randomValue <= total) {
          this._currentIndex = i;
          break;
        }
      }
    }
    const sound = this._sounds[this._currentIndex ?? 0];
    if (sound.isReady()) {
      sound.play(0, this.isPaused ? void 0 : startOffset);
    } else {
      sound.autoplay = true;
    }
    this.isPlaying = true;
    this.isPaused = false;
  }
}
class SoundTrack {
  /**
   * Creates a new sound track.
   * @see https://doc.babylonjs.com/features/featuresDeepDive/audio/playingSoundsMusic#using-sound-tracks
   * @param scene Define the scene the sound track belongs to
   * @param options
   */
  constructor(scene, options = {}) {
    this.id = -1;
    this._isInitialized = false;
    scene = scene || EngineStore.LastCreatedScene;
    if (!scene) {
      return;
    }
    this._scene = scene;
    this.soundCollection = [];
    this._options = options;
    if (!this._options.mainTrack && this._scene.soundTracks) {
      this._scene.soundTracks.push(this);
      this.id = this._scene.soundTracks.length - 1;
    }
  }
  _initializeSoundTrackAudioGraph() {
    var _a;
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && AbstractEngine.audioEngine.audioContext) {
      this._outputAudioNode = AbstractEngine.audioEngine.audioContext.createGain();
      this._outputAudioNode.connect(AbstractEngine.audioEngine.masterGain);
      if (this._options) {
        if (this._options.volume) {
          this._outputAudioNode.gain.value = this._options.volume;
        }
      }
      this._isInitialized = true;
    }
  }
  /**
   * Release the sound track and its associated resources
   */
  dispose() {
    if (AbstractEngine.audioEngine && AbstractEngine.audioEngine.canUseWebAudio) {
      if (this._connectedAnalyser) {
        this._connectedAnalyser.stopDebugCanvas();
      }
      while (this.soundCollection.length) {
        this.soundCollection[0].dispose();
      }
      if (this._outputAudioNode) {
        this._outputAudioNode.disconnect();
      }
      this._outputAudioNode = null;
    }
  }
  /**
   * Adds a sound to this sound track
   * @param sound define the sound to add
   * @ignoreNaming
   */
  addSound(sound) {
    var _a;
    if (!this._isInitialized) {
      this._initializeSoundTrackAudioGraph();
    }
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && this._outputAudioNode) {
      sound.connectToSoundTrackAudioNode(this._outputAudioNode);
    }
    if (sound.soundTrackId !== void 0) {
      if (sound.soundTrackId === -1) {
        this._scene.mainSoundTrack.removeSound(sound);
      } else if (this._scene.soundTracks) {
        this._scene.soundTracks[sound.soundTrackId].removeSound(sound);
      }
    }
    this.soundCollection.push(sound);
    sound.soundTrackId = this.id;
  }
  /**
   * Removes a sound to this sound track
   * @param sound define the sound to remove
   * @ignoreNaming
   */
  removeSound(sound) {
    const index = this.soundCollection.indexOf(sound);
    if (index !== -1) {
      this.soundCollection.splice(index, 1);
    }
  }
  /**
   * Set a global volume for the full sound track.
   * @param newVolume Define the new volume of the sound track
   */
  setVolume(newVolume) {
    var _a;
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && this._outputAudioNode) {
      this._outputAudioNode.gain.value = newVolume;
    }
  }
  /**
   * Switch the panning model to HRTF:
   * Renders a stereo output of higher quality than equalpower — it uses a convolution with measured impulse responses from human subjects.
   * @see https://doc.babylonjs.com/features/featuresDeepDive/audio/playingSoundsMusic#creating-a-spatial-3d-sound
   */
  switchPanningModelToHRTF() {
    var _a;
    if ((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) {
      for (let i = 0; i < this.soundCollection.length; i++) {
        this.soundCollection[i].switchPanningModelToHRTF();
      }
    }
  }
  /**
   * Switch the panning model to Equal Power:
   * Represents the equal-power panning algorithm, generally regarded as simple and efficient. equalpower is the default value.
   * @see https://doc.babylonjs.com/features/featuresDeepDive/audio/playingSoundsMusic#creating-a-spatial-3d-sound
   */
  switchPanningModelToEqualPower() {
    var _a;
    if ((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) {
      for (let i = 0; i < this.soundCollection.length; i++) {
        this.soundCollection[i].switchPanningModelToEqualPower();
      }
    }
  }
  /**
   * Connect the sound track to an audio analyser allowing some amazing
   * synchronization between the sounds/music and your visualization (VuMeter for instance).
   * @see https://doc.babylonjs.com/features/featuresDeepDive/audio/playingSoundsMusic#using-the-analyser
   * @param analyser The analyser to connect to the engine
   */
  connectToAnalyser(analyser) {
    var _a;
    if (this._connectedAnalyser) {
      this._connectedAnalyser.stopDebugCanvas();
    }
    this._connectedAnalyser = analyser;
    if (((_a = AbstractEngine.audioEngine) == null ? void 0 : _a.canUseWebAudio) && this._outputAudioNode) {
      this._outputAudioNode.disconnect();
      this._connectedAnalyser.connectAudioNodes(this._outputAudioNode, AbstractEngine.audioEngine.masterGain);
    }
  }
}
Object.defineProperty(Scene.prototype, "mainSoundTrack", {
  get: function() {
    let compo = this._getComponent(SceneComponentConstants.NAME_AUDIO);
    if (!compo) {
      compo = new AudioSceneComponent(this);
      this._addComponent(compo);
    }
    if (!this._mainSoundTrack) {
      this._mainSoundTrack = new SoundTrack(this, { mainTrack: true });
    }
    return this._mainSoundTrack;
  },
  enumerable: true,
  configurable: true
});
Scene.prototype.getSoundByName = function(name) {
  let index;
  for (index = 0; index < this.mainSoundTrack.soundCollection.length; index++) {
    if (this.mainSoundTrack.soundCollection[index].name === name) {
      return this.mainSoundTrack.soundCollection[index];
    }
  }
  if (this.soundTracks) {
    for (let sdIndex = 0; sdIndex < this.soundTracks.length; sdIndex++) {
      for (index = 0; index < this.soundTracks[sdIndex].soundCollection.length; index++) {
        if (this.soundTracks[sdIndex].soundCollection[index].name === name) {
          return this.soundTracks[sdIndex].soundCollection[index];
        }
      }
    }
  }
  return null;
};
Object.defineProperty(Scene.prototype, "audioEnabled", {
  get: function() {
    let compo = this._getComponent(SceneComponentConstants.NAME_AUDIO);
    if (!compo) {
      compo = new AudioSceneComponent(this);
      this._addComponent(compo);
    }
    return compo.audioEnabled;
  },
  set: function(value) {
    let compo = this._getComponent(SceneComponentConstants.NAME_AUDIO);
    if (!compo) {
      compo = new AudioSceneComponent(this);
      this._addComponent(compo);
    }
    if (value) {
      compo.enableAudio();
    } else {
      compo.disableAudio();
    }
  },
  enumerable: true,
  configurable: true
});
Object.defineProperty(Scene.prototype, "headphone", {
  get: function() {
    let compo = this._getComponent(SceneComponentConstants.NAME_AUDIO);
    if (!compo) {
      compo = new AudioSceneComponent(this);
      this._addComponent(compo);
    }
    return compo.headphone;
  },
  set: function(value) {
    let compo = this._getComponent(SceneComponentConstants.NAME_AUDIO);
    if (!compo) {
      compo = new AudioSceneComponent(this);
      this._addComponent(compo);
    }
    if (value) {
      compo.switchAudioModeForHeadphones();
    } else {
      compo.switchAudioModeForNormalSpeakers();
    }
  },
  enumerable: true,
  configurable: true
});
Object.defineProperty(Scene.prototype, "audioListenerPositionProvider", {
  get: function() {
    let compo = this._getComponent(SceneComponentConstants.NAME_AUDIO);
    if (!compo) {
      compo = new AudioSceneComponent(this);
      this._addComponent(compo);
    }
    return compo.audioListenerPositionProvider;
  },
  set: function(value) {
    let compo = this._getComponent(SceneComponentConstants.NAME_AUDIO);
    if (!compo) {
      compo = new AudioSceneComponent(this);
      this._addComponent(compo);
    }
    if (value && typeof value !== "function") {
      throw new Error("The value passed to [Scene.audioListenerPositionProvider] must be a function that returns a Vector3");
    } else {
      compo.audioListenerPositionProvider = value;
    }
  },
  enumerable: true,
  configurable: true
});
Object.defineProperty(Scene.prototype, "audioListenerRotationProvider", {
  get: function() {
    let compo = this._getComponent(SceneComponentConstants.NAME_AUDIO);
    if (!compo) {
      compo = new AudioSceneComponent(this);
      this._addComponent(compo);
    }
    return compo.audioListenerRotationProvider;
  },
  set: function(value) {
    let compo = this._getComponent(SceneComponentConstants.NAME_AUDIO);
    if (!compo) {
      compo = new AudioSceneComponent(this);
      this._addComponent(compo);
    }
    if (value && typeof value !== "function") {
      throw new Error("The value passed to [Scene.audioListenerRotationProvider] must be a function that returns a Vector3");
    } else {
      compo.audioListenerRotationProvider = value;
    }
  },
  enumerable: true,
  configurable: true
});
Object.defineProperty(Scene.prototype, "audioPositioningRefreshRate", {
  get: function() {
    let compo = this._getComponent(SceneComponentConstants.NAME_AUDIO);
    if (!compo) {
      compo = new AudioSceneComponent(this);
      this._addComponent(compo);
    }
    return compo.audioPositioningRefreshRate;
  },
  set: function(value) {
    let compo = this._getComponent(SceneComponentConstants.NAME_AUDIO);
    if (!compo) {
      compo = new AudioSceneComponent(this);
      this._addComponent(compo);
    }
    compo.audioPositioningRefreshRate = value;
  },
  enumerable: true,
  configurable: true
});
class AudioSceneComponent {
  /**
   * Gets whether audio is enabled or not.
   * Please use related enable/disable method to switch state.
   */
  get audioEnabled() {
    return this._audioEnabled;
  }
  /**
   * Gets whether audio is outputting to headphone or not.
   * Please use the according Switch methods to change output.
   */
  get headphone() {
    return this._headphone;
  }
  /**
   * Creates a new instance of the component for the given scene
   * @param scene Defines the scene to register the component in
   */
  constructor(scene) {
    this.name = SceneComponentConstants.NAME_AUDIO;
    this._audioEnabled = true;
    this._headphone = false;
    this.audioPositioningRefreshRate = 500;
    this.audioListenerPositionProvider = null;
    this.audioListenerRotationProvider = null;
    this._cachedCameraDirection = new Vector3();
    this._cachedCameraPosition = new Vector3();
    this._lastCheck = 0;
    this._invertMatrixTemp = new Matrix();
    this._cameraDirectionTemp = new Vector3();
    scene = scene || EngineStore.LastCreatedScene;
    if (!scene) {
      return;
    }
    this.scene = scene;
    scene.soundTracks = [];
    scene.sounds = [];
  }
  /**
   * Registers the component in a given scene
   */
  register() {
    this.scene._afterRenderStage.registerStep(SceneComponentConstants.STEP_AFTERRENDER_AUDIO, this, this._afterRender);
  }
  /**
   * Rebuilds the elements related to this component in case of
   * context lost for instance.
   */
  rebuild() {
  }
  /**
   * Serializes the component data to the specified json object
   * @param serializationObject The object to serialize to
   */
  serialize(serializationObject) {
    serializationObject.sounds = [];
    if (this.scene.soundTracks) {
      for (let index = 0; index < this.scene.soundTracks.length; index++) {
        const soundtrack = this.scene.soundTracks[index];
        for (let soundId = 0; soundId < soundtrack.soundCollection.length; soundId++) {
          serializationObject.sounds.push(soundtrack.soundCollection[soundId].serialize());
        }
      }
    }
  }
  /**
   * Adds all the elements from the container to the scene
   * @param container the container holding the elements
   */
  addFromContainer(container) {
    if (!container.sounds) {
      return;
    }
    container.sounds.forEach((sound) => {
      sound.play();
      sound.autoplay = true;
      this.scene.mainSoundTrack.addSound(sound);
    });
  }
  /**
   * Removes all the elements in the container from the scene
   * @param container contains the elements to remove
   * @param dispose if the removed element should be disposed (default: false)
   */
  removeFromContainer(container, dispose = false) {
    if (!container.sounds) {
      return;
    }
    container.sounds.forEach((sound) => {
      sound.stop();
      sound.autoplay = false;
      this.scene.mainSoundTrack.removeSound(sound);
      if (dispose) {
        sound.dispose();
      }
    });
  }
  /**
   * Disposes the component and the associated resources.
   */
  dispose() {
    const scene = this.scene;
    if (scene._mainSoundTrack) {
      scene.mainSoundTrack.dispose();
    }
    if (scene.soundTracks) {
      for (let scIndex = 0; scIndex < scene.soundTracks.length; scIndex++) {
        scene.soundTracks[scIndex].dispose();
      }
    }
  }
  /**
   * Disables audio in the associated scene.
   */
  disableAudio() {
    const scene = this.scene;
    this._audioEnabled = false;
    if (AbstractEngine.audioEngine && AbstractEngine.audioEngine.audioContext) {
      AbstractEngine.audioEngine.audioContext.suspend();
    }
    let i;
    for (i = 0; i < scene.mainSoundTrack.soundCollection.length; i++) {
      scene.mainSoundTrack.soundCollection[i].pause();
    }
    if (scene.soundTracks) {
      for (i = 0; i < scene.soundTracks.length; i++) {
        for (let j = 0; j < scene.soundTracks[i].soundCollection.length; j++) {
          scene.soundTracks[i].soundCollection[j].pause();
        }
      }
    }
  }
  /**
   * Enables audio in the associated scene.
   */
  enableAudio() {
    const scene = this.scene;
    this._audioEnabled = true;
    if (AbstractEngine.audioEngine && AbstractEngine.audioEngine.audioContext) {
      AbstractEngine.audioEngine.audioContext.resume();
    }
    let i;
    for (i = 0; i < scene.mainSoundTrack.soundCollection.length; i++) {
      if (scene.mainSoundTrack.soundCollection[i].isPaused) {
        scene.mainSoundTrack.soundCollection[i].play();
      }
    }
    if (scene.soundTracks) {
      for (i = 0; i < scene.soundTracks.length; i++) {
        for (let j = 0; j < scene.soundTracks[i].soundCollection.length; j++) {
          if (scene.soundTracks[i].soundCollection[j].isPaused) {
            scene.soundTracks[i].soundCollection[j].play();
          }
        }
      }
    }
  }
  /**
   * Switch audio to headphone output.
   */
  switchAudioModeForHeadphones() {
    const scene = this.scene;
    this._headphone = true;
    scene.mainSoundTrack.switchPanningModelToHRTF();
    if (scene.soundTracks) {
      for (let i = 0; i < scene.soundTracks.length; i++) {
        scene.soundTracks[i].switchPanningModelToHRTF();
      }
    }
  }
  /**
   * Switch audio to normal speakers.
   */
  switchAudioModeForNormalSpeakers() {
    const scene = this.scene;
    this._headphone = false;
    scene.mainSoundTrack.switchPanningModelToEqualPower();
    if (scene.soundTracks) {
      for (let i = 0; i < scene.soundTracks.length; i++) {
        scene.soundTracks[i].switchPanningModelToEqualPower();
      }
    }
  }
  _afterRender() {
    const now = PrecisionDate.Now;
    if (this._lastCheck && now - this._lastCheck < this.audioPositioningRefreshRate) {
      return;
    }
    this._lastCheck = now;
    const scene = this.scene;
    if (!this._audioEnabled || !scene._mainSoundTrack || !scene.soundTracks || scene._mainSoundTrack.soundCollection.length === 0 && scene.soundTracks.length === 1) {
      return;
    }
    const audioEngine = AbstractEngine.audioEngine;
    if (!audioEngine) {
      return;
    }
    if (audioEngine.audioContext) {
      let listeningCamera = scene.activeCamera;
      if (scene.activeCameras && scene.activeCameras.length > 0) {
        listeningCamera = scene.activeCameras[0];
      }
      if (this.audioListenerPositionProvider) {
        const position = this.audioListenerPositionProvider();
        audioEngine.audioContext.listener.setPosition(position.x || 0, position.y || 0, position.z || 0);
      } else if (listeningCamera) {
        if (!this._cachedCameraPosition.equals(listeningCamera.globalPosition)) {
          this._cachedCameraPosition.copyFrom(listeningCamera.globalPosition);
          audioEngine.audioContext.listener.setPosition(listeningCamera.globalPosition.x, listeningCamera.globalPosition.y, listeningCamera.globalPosition.z);
        }
      } else {
        audioEngine.audioContext.listener.setPosition(0, 0, 0);
      }
      if (this.audioListenerRotationProvider) {
        const rotation = this.audioListenerRotationProvider();
        audioEngine.audioContext.listener.setOrientation(rotation.x || 0, rotation.y || 0, rotation.z || 0, 0, 1, 0);
      } else if (listeningCamera) {
        if (listeningCamera.rigCameras && listeningCamera.rigCameras.length > 0) {
          listeningCamera = listeningCamera.rigCameras[0];
        }
        listeningCamera.getViewMatrix().invertToRef(this._invertMatrixTemp);
        Vector3.TransformNormalToRef(AudioSceneComponent._CameraDirection, this._invertMatrixTemp, this._cameraDirectionTemp);
        this._cameraDirectionTemp.normalize();
        if (!isNaN(this._cameraDirectionTemp.x) && !isNaN(this._cameraDirectionTemp.y) && !isNaN(this._cameraDirectionTemp.z)) {
          if (!this._cachedCameraDirection.equals(this._cameraDirectionTemp)) {
            this._cachedCameraDirection.copyFrom(this._cameraDirectionTemp);
            audioEngine.audioContext.listener.setOrientation(this._cameraDirectionTemp.x, this._cameraDirectionTemp.y, this._cameraDirectionTemp.z, 0, 1, 0);
          }
        }
      } else {
        audioEngine.audioContext.listener.setOrientation(0, 0, 0, 0, 1, 0);
      }
      let i;
      for (i = 0; i < scene.mainSoundTrack.soundCollection.length; i++) {
        const sound = scene.mainSoundTrack.soundCollection[i];
        if (sound.useCustomAttenuation) {
          sound.updateDistanceFromListener();
        }
      }
      if (scene.soundTracks) {
        for (i = 0; i < scene.soundTracks.length; i++) {
          for (let j = 0; j < scene.soundTracks[i].soundCollection.length; j++) {
            const sound = scene.soundTracks[i].soundCollection[j];
            if (sound.useCustomAttenuation) {
              sound.updateDistanceFromListener();
            }
          }
        }
      }
    }
  }
}
AudioSceneComponent._CameraDirection = new Vector3(0, 0, -1);
Sound._SceneComponentInitialization = (scene) => {
  let compo = scene._getComponent(SceneComponentConstants.NAME_AUDIO);
  if (!compo) {
    compo = new AudioSceneComponent(scene);
    scene._addComponent(compo);
  }
};
const NAME = "MSFT_audio_emitter";
class MSFT_audio_emitter {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this._loader = loader;
    this.enabled = this._loader.isExtensionUsed(NAME);
  }
  /** @internal */
  dispose() {
    this._loader = null;
    this._clips = null;
    this._emitters = null;
  }
  /** @internal */
  onLoading() {
    const extensions = this._loader.gltf.extensions;
    if (extensions && extensions[this.name]) {
      const extension = extensions[this.name];
      this._clips = extension.clips;
      this._emitters = extension.emitters;
      ArrayItem.Assign(this._clips);
      ArrayItem.Assign(this._emitters);
    }
  }
  /**
   * @internal
   */
  loadSceneAsync(context, scene) {
    return GLTFLoader.LoadExtensionAsync(context, scene, this.name, (extensionContext, extension) => {
      const promises = new Array();
      promises.push(this._loader.loadSceneAsync(context, scene));
      for (const emitterIndex of extension.emitters) {
        const emitter = ArrayItem.Get(`${extensionContext}/emitters`, this._emitters, emitterIndex);
        if (emitter.refDistance != void 0 || emitter.maxDistance != void 0 || emitter.rolloffFactor != void 0 || emitter.distanceModel != void 0 || emitter.innerAngle != void 0 || emitter.outerAngle != void 0) {
          throw new Error(`${extensionContext}: Direction or Distance properties are not allowed on emitters attached to a scene`);
        }
        promises.push(this._loadEmitterAsync(`${extensionContext}/emitters/${emitter.index}`, emitter));
      }
      return Promise.all(promises).then(() => {
      });
    });
  }
  /**
   * @internal
   */
  loadNodeAsync(context, node, assign) {
    return GLTFLoader.LoadExtensionAsync(context, node, this.name, (extensionContext, extension) => {
      const promises = new Array();
      return this._loader.loadNodeAsync(extensionContext, node, (babylonMesh) => {
        for (const emitterIndex of extension.emitters) {
          const emitter = ArrayItem.Get(`${extensionContext}/emitters`, this._emitters, emitterIndex);
          promises.push(this._loadEmitterAsync(`${extensionContext}/emitters/${emitter.index}`, emitter).then(() => {
            for (const sound of emitter._babylonSounds) {
              sound.attachToMesh(babylonMesh);
              if (emitter.innerAngle != void 0 || emitter.outerAngle != void 0) {
                sound.setLocalDirectionToMesh(Vector3.Forward());
                sound.setDirectionalCone(2 * Tools.ToDegrees(emitter.innerAngle == void 0 ? Math.PI : emitter.innerAngle), 2 * Tools.ToDegrees(emitter.outerAngle == void 0 ? Math.PI : emitter.outerAngle), 0);
              }
            }
          }));
        }
        assign(babylonMesh);
      }).then((babylonMesh) => {
        return Promise.all(promises).then(() => {
          return babylonMesh;
        });
      });
    });
  }
  /**
   * @internal
   */
  loadAnimationAsync(context, animation) {
    return GLTFLoader.LoadExtensionAsync(context, animation, this.name, (extensionContext, extension) => {
      return this._loader.loadAnimationAsync(context, animation).then((babylonAnimationGroup) => {
        const promises = new Array();
        ArrayItem.Assign(extension.events);
        for (const event of extension.events) {
          promises.push(this._loadAnimationEventAsync(`${extensionContext}/events/${event.index}`, context, animation, event, babylonAnimationGroup));
        }
        return Promise.all(promises).then(() => {
          return babylonAnimationGroup;
        });
      });
    });
  }
  _loadClipAsync(context, clip) {
    if (clip._objectURL) {
      return clip._objectURL;
    }
    let promise;
    if (clip.uri) {
      promise = this._loader.loadUriAsync(context, clip, clip.uri);
    } else {
      const bufferView = ArrayItem.Get(`${context}/bufferView`, this._loader.gltf.bufferViews, clip.bufferView);
      promise = this._loader.loadBufferViewAsync(`/bufferViews/${bufferView.index}`, bufferView);
    }
    clip._objectURL = promise.then((data) => {
      return URL.createObjectURL(new Blob([data], { type: clip.mimeType }));
    });
    return clip._objectURL;
  }
  _loadEmitterAsync(context, emitter) {
    emitter._babylonSounds = emitter._babylonSounds || [];
    if (!emitter._babylonData) {
      const clipPromises = new Array();
      const name = emitter.name || `emitter${emitter.index}`;
      const options = {
        loop: false,
        autoplay: false,
        volume: emitter.volume == void 0 ? 1 : emitter.volume
      };
      for (let i = 0; i < emitter.clips.length; i++) {
        const clipContext = `/extensions/${this.name}/clips`;
        const clip = ArrayItem.Get(clipContext, this._clips, emitter.clips[i].clip);
        clipPromises.push(this._loadClipAsync(`${clipContext}/${emitter.clips[i].clip}`, clip).then((objectURL) => {
          const sound = emitter._babylonSounds[i] = new Sound(name, objectURL, this._loader.babylonScene, null, options);
          sound.refDistance = emitter.refDistance || 1;
          sound.maxDistance = emitter.maxDistance || 256;
          sound.rolloffFactor = emitter.rolloffFactor || 1;
          sound.distanceModel = emitter.distanceModel || "exponential";
        }));
      }
      const promise = Promise.all(clipPromises).then(() => {
        const weights = emitter.clips.map((clip) => {
          return clip.weight || 1;
        });
        const weightedSound = new WeightedSound(emitter.loop || false, emitter._babylonSounds, weights);
        if (emitter.innerAngle) {
          weightedSound.directionalConeInnerAngle = 2 * Tools.ToDegrees(emitter.innerAngle);
        }
        if (emitter.outerAngle) {
          weightedSound.directionalConeOuterAngle = 2 * Tools.ToDegrees(emitter.outerAngle);
        }
        if (emitter.volume) {
          weightedSound.volume = emitter.volume;
        }
        emitter._babylonData.sound = weightedSound;
      });
      emitter._babylonData = {
        loaded: promise
      };
    }
    return emitter._babylonData.loaded;
  }
  _getEventAction(context, sound, action, time, startOffset) {
    switch (action) {
      case "play": {
        return (currentFrame) => {
          const frameOffset = (startOffset || 0) + (currentFrame - time);
          sound.play(frameOffset);
        };
      }
      case "stop": {
        return () => {
          sound.stop();
        };
      }
      case "pause": {
        return () => {
          sound.pause();
        };
      }
      default: {
        throw new Error(`${context}: Unsupported action ${action}`);
      }
    }
  }
  _loadAnimationEventAsync(context, animationContext, animation, event, babylonAnimationGroup) {
    if (babylonAnimationGroup.targetedAnimations.length == 0) {
      return Promise.resolve();
    }
    const babylonAnimation = babylonAnimationGroup.targetedAnimations[0];
    const emitterIndex = event.emitter;
    const emitter = ArrayItem.Get(`/extensions/${this.name}/emitters`, this._emitters, emitterIndex);
    return this._loadEmitterAsync(context, emitter).then(() => {
      const sound = emitter._babylonData.sound;
      if (sound) {
        const babylonAnimationEvent = new AnimationEvent(event.time, this._getEventAction(context, sound, event.action, event.time, event.startOffset));
        babylonAnimation.animation.addEvent(babylonAnimationEvent);
        babylonAnimationGroup.onAnimationGroupEndObservable.add(() => {
          sound.stop();
        });
        babylonAnimationGroup.onAnimationGroupPauseObservable.add(() => {
          sound.pause();
        });
      }
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new MSFT_audio_emitter(loader));
export {
  MSFT_audio_emitter
};
