import { b as Tools, aT as Geometry, aa as VertexBuffer, h as Logger, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { A as AutoReleaseWorkerPool } from "./workerPool.DdmrBfgg.js";
import { GLTFLoader, ArrayItem, LoadBoundingInfoFromPositionAccessor } from "./glTFLoader.D0mNbVQS.js";
function DecodeMesh(module, data, attributeIDs, onIndicesData, onAttributeData) {
  const decoderModule = module;
  let decoder = null;
  let buffer = null;
  let geometry = null;
  try {
    decoder = new decoderModule.Decoder();
    buffer = new decoderModule.DecoderBuffer();
    buffer.Init(data, data.byteLength);
    let status;
    const type = decoder.GetEncodedGeometryType(buffer);
    switch (type) {
      case decoderModule.TRIANGULAR_MESH: {
        const mesh = new decoderModule.Mesh();
        status = decoder.DecodeBufferToMesh(buffer, mesh);
        if (!status.ok() || mesh.ptr === 0) {
          throw new Error(status.error_msg());
        }
        const numFaces = mesh.num_faces();
        const numIndices = numFaces * 3;
        const byteLength = numIndices * 4;
        const ptr = decoderModule._malloc(byteLength);
        try {
          decoder.GetTrianglesUInt32Array(mesh, byteLength, ptr);
          const indices = new Uint32Array(numIndices);
          indices.set(new Uint32Array(decoderModule.HEAPF32.buffer, ptr, numIndices));
          onIndicesData(indices);
        } finally {
          decoderModule._free(ptr);
        }
        geometry = mesh;
        break;
      }
      case decoderModule.POINT_CLOUD: {
        const pointCloud = new decoderModule.PointCloud();
        status = decoder.DecodeBufferToPointCloud(buffer, pointCloud);
        if (!status.ok() || !pointCloud.ptr) {
          throw new Error(status.error_msg());
        }
        geometry = pointCloud;
        break;
      }
      default: {
        throw new Error(`Invalid geometry type ${type}`);
      }
    }
    const numPoints = geometry.num_points();
    const processAttribute = (decoder2, geometry2, kind, attribute) => {
      const dataType = attribute.data_type();
      const numComponents = attribute.num_components();
      const normalized = attribute.normalized();
      const byteStride = attribute.byte_stride();
      const byteOffset = attribute.byte_offset();
      const dataTypeInfo = {
        [decoderModule.DT_FLOAT32]: { typedArrayConstructor: Float32Array, heap: decoderModule.HEAPF32 },
        [decoderModule.DT_INT8]: { typedArrayConstructor: Int8Array, heap: decoderModule.HEAP8 },
        [decoderModule.DT_INT16]: { typedArrayConstructor: Int16Array, heap: decoderModule.HEAP16 },
        [decoderModule.DT_INT32]: { typedArrayConstructor: Int32Array, heap: decoderModule.HEAP32 },
        [decoderModule.DT_UINT8]: { typedArrayConstructor: Uint8Array, heap: decoderModule.HEAPU8 },
        [decoderModule.DT_UINT16]: { typedArrayConstructor: Uint16Array, heap: decoderModule.HEAPU16 },
        [decoderModule.DT_UINT32]: { typedArrayConstructor: Uint32Array, heap: decoderModule.HEAPU32 }
      };
      const info = dataTypeInfo[dataType];
      if (!info) {
        throw new Error(`Invalid data type ${dataType}`);
      }
      const numValues = numPoints * numComponents;
      const byteLength = numValues * info.typedArrayConstructor.BYTES_PER_ELEMENT;
      const ptr = decoderModule._malloc(byteLength);
      try {
        decoder2.GetAttributeDataArrayForAllPoints(geometry2, attribute, dataType, byteLength, ptr);
        const data2 = new info.typedArrayConstructor(info.heap.buffer, ptr, numValues);
        onAttributeData(kind, data2.slice(), numComponents, byteOffset, byteStride, normalized);
      } finally {
        decoderModule._free(ptr);
      }
    };
    if (attributeIDs) {
      for (const kind in attributeIDs) {
        const id = attributeIDs[kind];
        const attribute = decoder.GetAttributeByUniqueId(geometry, id);
        processAttribute(decoder, geometry, kind, attribute);
      }
    } else {
      const dracoAttributeTypes = {
        position: decoderModule.POSITION,
        normal: decoderModule.NORMAL,
        color: decoderModule.COLOR,
        uv: decoderModule.TEX_COORD
      };
      for (const kind in dracoAttributeTypes) {
        const id = decoder.GetAttributeId(geometry, dracoAttributeTypes[kind]);
        if (id !== -1) {
          const attribute = decoder.GetAttribute(geometry, id);
          processAttribute(decoder, geometry, kind, attribute);
        }
      }
    }
    return numPoints;
  } finally {
    if (geometry) {
      decoderModule.destroy(geometry);
    }
    if (buffer) {
      decoderModule.destroy(buffer);
    }
    if (decoder) {
      decoderModule.destroy(decoder);
    }
  }
}
function DecoderWorkerFunction() {
  let decoderPromise;
  onmessage = (event) => {
    const message = event.data;
    switch (message.id) {
      case "init": {
        if (message.url) {
          importScripts(message.url);
        }
        const initDecoderObject = message.wasmBinary ? { wasmBinary: message.wasmBinary } : {};
        decoderPromise = DracoDecoderModule(initDecoderObject);
        postMessage({ id: "initDone" });
        break;
      }
      case "decodeMesh": {
        if (!decoderPromise) {
          throw new Error("Draco decoder module is not available");
        }
        decoderPromise.then((decoder) => {
          const numPoints = DecodeMesh(decoder, message.dataView, message.attributes, (indices) => {
            postMessage({ id: "indices", data: indices }, [indices.buffer]);
          }, (kind, data, size, offset, stride, normalized) => {
            postMessage({ id: "attribute", kind, data, size, byteOffset: offset, byteStride: stride, normalized }, [data.buffer]);
          });
          postMessage({ id: "decodeMeshDone", totalVertices: numPoints });
        });
        break;
      }
    }
  };
}
function initializeWebWorker(worker, wasmBinary, moduleUrl) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      worker.removeEventListener("error", onError);
      worker.removeEventListener("message", onMessage);
      reject(error);
    };
    const onMessage = (event) => {
      if (event.data.id === "initDone") {
        worker.removeEventListener("error", onError);
        worker.removeEventListener("message", onMessage);
        resolve(worker);
      }
    };
    worker.addEventListener("error", onError);
    worker.addEventListener("message", onMessage);
    if (!wasmBinary) {
      worker.postMessage({
        id: "init",
        url: moduleUrl
      });
    } else {
      const clone = wasmBinary.slice(0);
      worker.postMessage({
        id: "init",
        url: moduleUrl,
        wasmBinary: clone
      }, [clone]);
    }
  });
}
function _GetDefaultNumWorkers() {
  if (typeof navigator !== "object" || !navigator.hardwareConcurrency) {
    return 1;
  }
  return Math.min(Math.floor(navigator.hardwareConcurrency * 0.5), 4);
}
function _IsConfigurationAvailable(config) {
  return !!(config.wasmUrl && (config.wasmBinary || config.wasmBinaryUrl) && typeof WebAssembly === "object" || config.fallbackUrl);
}
class DracoCodec {
  /**
   * Constructor
   * @param configuration The configuration for the DracoCodec instance.
   */
  constructor(configuration) {
    if (configuration.workerPool) {
      this._workerPoolPromise = Promise.resolve(configuration.workerPool);
      return;
    }
    const wasmBinaryProvided = configuration.wasmBinary;
    const numberOfWorkers = configuration.numWorkers ?? _GetDefaultNumWorkers();
    const useWorkers = numberOfWorkers && typeof Worker === "function" && typeof URL === "function";
    const urlNeeded = useWorkers || !configuration.jsModule;
    const codecInfo = configuration.wasmUrl && configuration.wasmBinaryUrl && typeof WebAssembly === "object" ? {
      url: urlNeeded ? Tools.GetBabylonScriptURL(configuration.wasmUrl, true) : "",
      wasmBinaryPromise: wasmBinaryProvided ? Promise.resolve(wasmBinaryProvided) : Tools.LoadFileAsync(Tools.GetBabylonScriptURL(configuration.wasmBinaryUrl, true))
    } : {
      url: urlNeeded ? Tools.GetBabylonScriptURL(configuration.fallbackUrl) : "",
      wasmBinaryPromise: Promise.resolve(void 0)
    };
    if (useWorkers) {
      this._workerPoolPromise = codecInfo.wasmBinaryPromise.then((wasmBinary) => {
        const workerContent = this._getWorkerContent();
        const workerBlobUrl = URL.createObjectURL(new Blob([workerContent], { type: "application/javascript" }));
        return new AutoReleaseWorkerPool(numberOfWorkers, () => {
          const worker = new Worker(workerBlobUrl);
          return initializeWebWorker(worker, wasmBinary, codecInfo.url);
        });
      });
    } else {
      this._modulePromise = codecInfo.wasmBinaryPromise.then(async (wasmBinary) => {
        if (!this._isModuleAvailable()) {
          if (!configuration.jsModule) {
            if (!codecInfo.url) {
              throw new Error("Draco codec module is not available");
            }
            await Tools.LoadBabylonScriptAsync(codecInfo.url);
          }
        }
        return this._createModuleAsync(wasmBinary, configuration.jsModule);
      });
    }
  }
  /**
   * Returns a promise that resolves when ready. Call this manually to ensure the draco codec is ready before use.
   * @returns a promise that resolves when ready
   */
  async whenReadyAsync() {
    if (this._workerPoolPromise) {
      await this._workerPoolPromise;
      return;
    }
    if (this._modulePromise) {
      await this._modulePromise;
      return;
    }
  }
  /**
   * Stop all async operations and release resources.
   */
  dispose() {
    if (this._workerPoolPromise) {
      this._workerPoolPromise.then((workerPool) => {
        workerPool.dispose();
      });
    }
    delete this._workerPoolPromise;
    delete this._modulePromise;
  }
}
class DracoDecoder extends DracoCodec {
  /**
   * Returns true if the decoder's `DefaultConfiguration` is available.
   */
  static get DefaultAvailable() {
    return _IsConfigurationAvailable(DracoDecoder.DefaultConfiguration);
  }
  /**
   * Default instance for the DracoDecoder.
   */
  static get Default() {
    DracoDecoder._Default ?? (DracoDecoder._Default = new DracoDecoder());
    return DracoDecoder._Default;
  }
  /**
   * Reset the default DracoDecoder object to null and disposing the removed default instance.
   * Note that if the workerPool is a member of the static DefaultConfiguration object it is recommended not to run dispose,
   * unless the static worker pool is no longer needed.
   * @param skipDispose set to true to not dispose the removed default instance
   */
  static ResetDefault(skipDispose) {
    if (DracoDecoder._Default) {
      if (!skipDispose) {
        DracoDecoder._Default.dispose();
      }
      DracoDecoder._Default = null;
    }
  }
  _isModuleAvailable() {
    return typeof DracoDecoderModule !== "undefined";
  }
  async _createModuleAsync(wasmBinary, jsModule) {
    const module = await (jsModule || DracoDecoderModule)({ wasmBinary });
    return { module };
  }
  _getWorkerContent() {
    return `${DecodeMesh}(${DecoderWorkerFunction})()`;
  }
  /**
   * Creates a new Draco decoder.
   * @param configuration Optional override of the configuration for the DracoDecoder. If not provided, defaults to {@link DracoDecoder.DefaultConfiguration}.
   */
  constructor(configuration = DracoDecoder.DefaultConfiguration) {
    super(configuration);
  }
  /**
   * Decode Draco compressed mesh data to mesh data.
   * @param data The ArrayBuffer or ArrayBufferView of the compressed Draco data
   * @param attributes A map of attributes from vertex buffer kinds to Draco unique ids
   * @param gltfNormalizedOverride A map of attributes from vertex buffer kinds to normalized flags to override the Draco normalization
   * @returns A promise that resolves with the decoded mesh data
   */
  decodeMeshToMeshDataAsync(data, attributes, gltfNormalizedOverride) {
    const dataView = data instanceof ArrayBuffer ? new Int8Array(data) : new Int8Array(data.buffer, data.byteOffset, data.byteLength);
    const applyGltfNormalizedOverride = (kind, normalized) => {
      if (gltfNormalizedOverride && gltfNormalizedOverride[kind] !== void 0) {
        if (normalized !== gltfNormalizedOverride[kind]) {
          Logger.Warn(`Normalized flag from Draco data (${normalized}) does not match normalized flag from glTF accessor (${gltfNormalizedOverride[kind]}). Using flag from glTF accessor.`);
        }
        return gltfNormalizedOverride[kind];
      } else {
        return normalized;
      }
    };
    if (this._workerPoolPromise) {
      return this._workerPoolPromise.then((workerPool) => {
        return new Promise((resolve, reject) => {
          workerPool.push((worker, onComplete) => {
            let resultIndices = null;
            const resultAttributes = [];
            const onError = (error) => {
              worker.removeEventListener("error", onError);
              worker.removeEventListener("message", onMessage);
              reject(error);
              onComplete();
            };
            const onMessage = (event) => {
              const message = event.data;
              switch (message.id) {
                case "indices": {
                  resultIndices = message.data;
                  break;
                }
                case "attribute": {
                  resultAttributes.push({
                    kind: message.kind,
                    data: message.data,
                    size: message.size,
                    byteOffset: message.byteOffset,
                    byteStride: message.byteStride,
                    normalized: applyGltfNormalizedOverride(message.kind, message.normalized)
                  });
                  break;
                }
                case "decodeMeshDone": {
                  worker.removeEventListener("error", onError);
                  worker.removeEventListener("message", onMessage);
                  resolve({ indices: resultIndices, attributes: resultAttributes, totalVertices: message.totalVertices });
                  onComplete();
                  break;
                }
              }
            };
            worker.addEventListener("error", onError);
            worker.addEventListener("message", onMessage);
            const dataViewCopy = dataView.slice();
            worker.postMessage({ id: "decodeMesh", dataView: dataViewCopy, attributes }, [dataViewCopy.buffer]);
          });
        });
      });
    }
    if (this._modulePromise) {
      return this._modulePromise.then((decoder) => {
        let resultIndices = null;
        const resultAttributes = [];
        const numPoints = DecodeMesh(decoder.module, dataView, attributes, (indices) => {
          resultIndices = indices;
        }, (kind, data2, size, byteOffset, byteStride, normalized) => {
          resultAttributes.push({
            kind,
            data: data2,
            size,
            byteOffset,
            byteStride,
            normalized
          });
        });
        return { indices: resultIndices, attributes: resultAttributes, totalVertices: numPoints };
      });
    }
    throw new Error("Draco decoder module is not available");
  }
  /**
   * Decode Draco compressed mesh data to Babylon geometry.
   * @param name The name to use when creating the geometry
   * @param scene The scene to use when creating the geometry
   * @param data The ArrayBuffer or ArrayBufferView of the Draco compressed data
   * @param attributes A map of attributes from vertex buffer kinds to Draco unique ids
   * @returns A promise that resolves with the decoded geometry
   */
  async decodeMeshToGeometryAsync(name, scene, data, attributes) {
    const meshData = await this.decodeMeshToMeshDataAsync(data, attributes);
    const geometry = new Geometry(name, scene);
    if (meshData.indices) {
      geometry.setIndices(meshData.indices);
    }
    for (const attribute of meshData.attributes) {
      geometry.setVerticesBuffer(new VertexBuffer(scene.getEngine(), attribute.data, attribute.kind, false, void 0, attribute.byteStride, void 0, attribute.byteOffset, attribute.size, void 0, attribute.normalized, true), meshData.totalVertices);
    }
    return geometry;
  }
  /** @internal */
  async _decodeMeshToGeometryForGltfAsync(name, scene, data, attributes, gltfNormalizedOverride, boundingInfo) {
    const meshData = await this.decodeMeshToMeshDataAsync(data, attributes, gltfNormalizedOverride);
    const geometry = new Geometry(name, scene);
    if (boundingInfo) {
      geometry._boundingInfo = boundingInfo;
      geometry.useBoundingInfoFromGeometry = true;
    }
    if (meshData.indices) {
      geometry.setIndices(meshData.indices);
    }
    for (const attribute of meshData.attributes) {
      geometry.setVerticesBuffer(new VertexBuffer(scene.getEngine(), attribute.data, attribute.kind, false, void 0, attribute.byteStride, void 0, attribute.byteOffset, attribute.size, void 0, attribute.normalized, true), meshData.totalVertices);
    }
    return geometry;
  }
}
DracoDecoder.DefaultConfiguration = {
  wasmUrl: `${Tools._DefaultCdnUrl}/draco_wasm_wrapper_gltf.js`,
  wasmBinaryUrl: `${Tools._DefaultCdnUrl}/draco_decoder_gltf.wasm`,
  fallbackUrl: `${Tools._DefaultCdnUrl}/draco_decoder_gltf.js`
};
DracoDecoder._Default = null;
const NAME = "KHR_draco_mesh_compression";
class KHR_draco_mesh_compression {
  /**
   * @internal
   */
  constructor(loader) {
    this.name = NAME;
    this.useNormalizedFlagFromAccessor = true;
    this._loader = loader;
    this.enabled = DracoDecoder.DefaultAvailable && this._loader.isExtensionUsed(NAME);
  }
  /** @internal */
  dispose() {
    delete this.dracoDecoder;
    this._loader = null;
  }
  /**
   * @internal
   */
  _loadVertexDataAsync(context, primitive, babylonMesh) {
    return GLTFLoader.LoadExtensionAsync(context, primitive, this.name, (extensionContext, extension) => {
      if (primitive.mode != void 0) {
        if (primitive.mode !== 4 && primitive.mode !== 5) {
          throw new Error(`${context}: Unsupported mode ${primitive.mode}`);
        }
      }
      const attributes = {};
      const normalized = {};
      const loadAttribute = (name, kind) => {
        const uniqueId = extension.attributes[name];
        if (uniqueId == void 0) {
          return;
        }
        babylonMesh._delayInfo = babylonMesh._delayInfo || [];
        if (babylonMesh._delayInfo.indexOf(kind) === -1) {
          babylonMesh._delayInfo.push(kind);
        }
        attributes[kind] = uniqueId;
        if (this.useNormalizedFlagFromAccessor) {
          const accessor = ArrayItem.TryGet(this._loader.gltf.accessors, primitive.attributes[name]);
          if (accessor) {
            normalized[kind] = accessor.normalized || false;
          }
        }
      };
      loadAttribute("POSITION", VertexBuffer.PositionKind);
      loadAttribute("NORMAL", VertexBuffer.NormalKind);
      loadAttribute("TANGENT", VertexBuffer.TangentKind);
      loadAttribute("TEXCOORD_0", VertexBuffer.UVKind);
      loadAttribute("TEXCOORD_1", VertexBuffer.UV2Kind);
      loadAttribute("TEXCOORD_2", VertexBuffer.UV3Kind);
      loadAttribute("TEXCOORD_3", VertexBuffer.UV4Kind);
      loadAttribute("TEXCOORD_4", VertexBuffer.UV5Kind);
      loadAttribute("TEXCOORD_5", VertexBuffer.UV6Kind);
      loadAttribute("JOINTS_0", VertexBuffer.MatricesIndicesKind);
      loadAttribute("WEIGHTS_0", VertexBuffer.MatricesWeightsKind);
      loadAttribute("COLOR_0", VertexBuffer.ColorKind);
      const bufferView = ArrayItem.Get(extensionContext, this._loader.gltf.bufferViews, extension.bufferView);
      if (!bufferView._dracoBabylonGeometry) {
        bufferView._dracoBabylonGeometry = this._loader.loadBufferViewAsync(`/bufferViews/${bufferView.index}`, bufferView).then((data) => {
          const dracoDecoder = this.dracoDecoder || DracoDecoder.Default;
          const positionAccessor = ArrayItem.TryGet(this._loader.gltf.accessors, primitive.attributes["POSITION"]);
          const babylonBoundingInfo = !this._loader.parent.alwaysComputeBoundingBox && !babylonMesh.skeleton && positionAccessor ? LoadBoundingInfoFromPositionAccessor(positionAccessor) : null;
          return dracoDecoder._decodeMeshToGeometryForGltfAsync(babylonMesh.name, this._loader.babylonScene, data, attributes, normalized, babylonBoundingInfo).catch((error) => {
            throw new Error(`${context}: ${error.message}`);
          });
        });
      }
      return bufferView._dracoBabylonGeometry;
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_draco_mesh_compression(loader));
export {
  KHR_draco_mesh_compression
};
