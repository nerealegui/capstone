const __vite__fileDeps=["./rgbdDecode.fragment.CFSxigB8.js","./index.B4f7kVg_.js","./preload-helper.DpQnamwV.js","./helperFunctions.BjB2cuO9.js","./rgbdDecode.fragment.Cdc1REcX.js","./helperFunctions.D96OHM8v.js"],__vite__mapDeps=i=>i.map(i=>__vite__fileDeps[i]);
import { _ as __vitePreload } from "./preload-helper.DpQnamwV.js";
import { h as Logger, I as InternalTexture, B as BaseTexture, b as Tools, ag as ILog2, ah as PostProcess, ai as SphericalPolynomial, V as Vector3 } from "./index.B4f7kVg_.js";
import "./dumpTools.BsUe3V43.js";
const DefaultEnvironmentTextureImageType = "image/png";
const CurrentVersion = 2;
const MagicBytes = [134, 22, 135, 150, 246, 214, 150, 54];
function GetEnvInfo(data) {
  const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let pos = 0;
  for (let i = 0; i < MagicBytes.length; i++) {
    if (dataView.getUint8(pos++) !== MagicBytes[i]) {
      Logger.Error("Not a babylon environment map");
      return null;
    }
  }
  let manifestString = "";
  let charCode = 0;
  while (charCode = dataView.getUint8(pos++)) {
    manifestString += String.fromCharCode(charCode);
  }
  let manifest = JSON.parse(manifestString);
  manifest = normalizeEnvInfo(manifest);
  manifest.binaryDataPosition = pos;
  if (manifest.specular) {
    manifest.specular.lodGenerationScale = manifest.specular.lodGenerationScale || 0.8;
  }
  return manifest;
}
function normalizeEnvInfo(info) {
  if (info.version > CurrentVersion) {
    throw new Error(`Unsupported babylon environment map version "${info.version}". Latest supported version is "${CurrentVersion}".`);
  }
  if (info.version === 2) {
    return info;
  }
  info = { ...info, version: 2, imageType: DefaultEnvironmentTextureImageType };
  return info;
}
function CreateRadianceImageDataArrayBufferViews(data, info) {
  info = normalizeEnvInfo(info);
  const specularInfo = info.specular;
  let mipmapsCount = Math.log2(info.width);
  mipmapsCount = Math.round(mipmapsCount) + 1;
  if (specularInfo.mipmaps.length !== 6 * mipmapsCount) {
    throw new Error(`Unsupported specular mipmaps number "${specularInfo.mipmaps.length}"`);
  }
  const imageData = new Array(mipmapsCount);
  for (let i = 0; i < mipmapsCount; i++) {
    imageData[i] = new Array(6);
    for (let face = 0; face < 6; face++) {
      const imageInfo = specularInfo.mipmaps[i * 6 + face];
      imageData[i][face] = new Uint8Array(data.buffer, data.byteOffset + info.binaryDataPosition + imageInfo.position, imageInfo.length);
    }
  }
  return imageData;
}
function CreateIrradianceImageDataArrayBufferViews(data, info) {
  var _a;
  info = normalizeEnvInfo(info);
  const imageData = new Array(6);
  const irradianceTexture = (_a = info.irradiance) == null ? void 0 : _a.irradianceTexture;
  if (irradianceTexture) {
    if (irradianceTexture.faces.length !== 6) {
      throw new Error(`Incorrect irradiance texture faces number "${irradianceTexture.faces.length}"`);
    }
    for (let face = 0; face < 6; face++) {
      const imageInfo = irradianceTexture.faces[face];
      imageData[face] = new Uint8Array(data.buffer, data.byteOffset + info.binaryDataPosition + imageInfo.position, imageInfo.length);
    }
  }
  return imageData;
}
function UploadEnvLevelsAsync(texture, data, info) {
  var _a;
  info = normalizeEnvInfo(info);
  const specularInfo = info.specular;
  if (!specularInfo) {
    return Promise.resolve([]);
  }
  texture._lodGenerationScale = specularInfo.lodGenerationScale;
  const promises = [];
  const radianceImageData = CreateRadianceImageDataArrayBufferViews(data, info);
  promises.push(UploadRadianceLevelsAsync(texture, radianceImageData, info.imageType));
  const irradianceTexture = (_a = info.irradiance) == null ? void 0 : _a.irradianceTexture;
  if (irradianceTexture) {
    const irradianceImageData = CreateIrradianceImageDataArrayBufferViews(data, info);
    promises.push(UploadIrradianceLevelsAsync(texture, irradianceImageData, irradianceTexture.size, info.imageType));
  }
  return Promise.all(promises);
}
function _OnImageReadyAsync(image, engine, expandTexture, rgbdPostProcess, url, face, i, generateNonLODTextures, lodTextures, cubeRtt, texture) {
  return new Promise((resolve, reject) => {
    if (expandTexture) {
      const tempTexture = engine.createTexture(null, true, true, null, 1, null, (message) => {
        reject(message);
      }, image);
      rgbdPostProcess == null ? void 0 : rgbdPostProcess.onEffectCreatedObservable.addOnce((effect) => {
        effect.executeWhenCompiled(() => {
          rgbdPostProcess.externalTextureSamplerBinding = true;
          rgbdPostProcess.onApply = (effect2) => {
            effect2._bindTexture("textureSampler", tempTexture);
            effect2.setFloat2("scale", 1, engine._features.needsInvertingBitmap && image instanceof ImageBitmap ? -1 : 1);
          };
          if (!engine.scenes.length) {
            return;
          }
          engine.scenes[0].postProcessManager.directRender([rgbdPostProcess], cubeRtt, true, face, i);
          engine.restoreDefaultFramebuffer();
          tempTexture.dispose();
          URL.revokeObjectURL(url);
          resolve();
        });
      });
    } else {
      engine._uploadImageToTexture(texture, image, face, i);
      if (generateNonLODTextures) {
        const lodTexture = lodTextures[i];
        if (lodTexture) {
          engine._uploadImageToTexture(lodTexture._texture, image, face, 0);
        }
      }
      resolve();
    }
  });
}
async function UploadRadianceLevelsAsync(texture, imageData, imageType = DefaultEnvironmentTextureImageType) {
  const engine = texture.getEngine();
  texture.format = 5;
  texture.type = 0;
  texture.generateMipMaps = true;
  texture._cachedAnisotropicFilteringLevel = null;
  engine.updateTextureSamplingMode(3, texture);
  await _UploadLevelsAsync(texture, imageData, true, imageType);
  texture.isReady = true;
}
async function UploadIrradianceLevelsAsync(mainTexture, imageData, size, imageType = DefaultEnvironmentTextureImageType) {
  const engine = mainTexture.getEngine();
  const texture = new InternalTexture(
    engine,
    5
    /* InternalTextureSource.RenderTarget */
  );
  const baseTexture = new BaseTexture(engine, texture);
  mainTexture._irradianceTexture = baseTexture;
  texture.isCube = true;
  texture.format = 5;
  texture.type = 0;
  texture.generateMipMaps = true;
  texture._cachedAnisotropicFilteringLevel = null;
  texture.generateMipMaps = true;
  texture.width = size;
  texture.height = size;
  engine.updateTextureSamplingMode(3, texture);
  await _UploadLevelsAsync(texture, [imageData], false, imageType);
  engine.generateMipMapsForCubemap(texture);
  texture.isReady = true;
}
async function _UploadLevelsAsync(texture, imageData, canGenerateNonLODTextures, imageType = DefaultEnvironmentTextureImageType) {
  if (!Tools.IsExponentOfTwo(texture.width)) {
    throw new Error("Texture size must be a power of two");
  }
  const mipmapsCount = ILog2(texture.width) + 1;
  const engine = texture.getEngine();
  let expandTexture = false;
  let generateNonLODTextures = false;
  let rgbdPostProcess = null;
  let cubeRtt = null;
  let lodTextures = null;
  const caps = engine.getCaps();
  if (!caps.textureLOD) {
    expandTexture = false;
    generateNonLODTextures = canGenerateNonLODTextures;
  } else if (!engine._features.supportRenderAndCopyToLodForFloatTextures) {
    expandTexture = false;
  } else if (caps.textureHalfFloatRender && caps.textureHalfFloatLinearFiltering) {
    expandTexture = true;
    texture.type = 2;
  } else if (caps.textureFloatRender && caps.textureFloatLinearFiltering) {
    expandTexture = true;
    texture.type = 1;
  }
  let shaderLanguage = 0;
  if (expandTexture) {
    if (engine.isWebGPU) {
      shaderLanguage = 1;
      await __vitePreload(() => import("./rgbdDecode.fragment.CFSxigB8.js"), true ? __vite__mapDeps([0,1,2,3]) : void 0, import.meta.url);
    } else {
      await __vitePreload(() => import("./rgbdDecode.fragment.Cdc1REcX.js"), true ? __vite__mapDeps([4,1,2,5]) : void 0, import.meta.url);
    }
    rgbdPostProcess = new PostProcess("rgbdDecode", "rgbdDecode", null, null, 1, null, 3, engine, false, void 0, texture.type, void 0, null, false, void 0, shaderLanguage);
    texture._isRGBD = false;
    texture.invertY = false;
    cubeRtt = engine.createRenderTargetCubeTexture(texture.width, {
      generateDepthBuffer: false,
      generateMipMaps: true,
      generateStencilBuffer: false,
      samplingMode: 3,
      type: texture.type,
      format: 5
    });
  } else {
    texture._isRGBD = true;
    texture.invertY = true;
    if (generateNonLODTextures) {
      const mipSlices = 3;
      lodTextures = {};
      const scale = texture._lodGenerationScale;
      const offset = texture._lodGenerationOffset;
      for (let i = 0; i < mipSlices; i++) {
        const smoothness = i / (mipSlices - 1);
        const roughness = 1 - smoothness;
        const minLODIndex = offset;
        const maxLODIndex = (mipmapsCount - 1) * scale + offset;
        const lodIndex = minLODIndex + (maxLODIndex - minLODIndex) * roughness;
        const mipmapIndex = Math.round(Math.min(Math.max(lodIndex, 0), maxLODIndex));
        const glTextureFromLod = new InternalTexture(
          engine,
          2
          /* InternalTextureSource.Temp */
        );
        glTextureFromLod.isCube = true;
        glTextureFromLod.invertY = true;
        glTextureFromLod.generateMipMaps = false;
        engine.updateTextureSamplingMode(2, glTextureFromLod);
        const lodTexture = new BaseTexture(null);
        lodTexture._isCube = true;
        lodTexture._texture = glTextureFromLod;
        lodTextures[mipmapIndex] = lodTexture;
        switch (i) {
          case 0:
            texture._lodTextureLow = lodTexture;
            break;
          case 1:
            texture._lodTextureMid = lodTexture;
            break;
          case 2:
            texture._lodTextureHigh = lodTexture;
            break;
        }
      }
    }
  }
  const promises = [];
  for (let i = 0; i < imageData.length; i++) {
    for (let face = 0; face < 6; face++) {
      const bytes = imageData[i][face];
      const blob = new Blob([bytes], { type: imageType });
      const url = URL.createObjectURL(blob);
      let promise;
      if (engine._features.forceBitmapOverHTMLImageElement) {
        promise = engine.createImageBitmap(blob, { premultiplyAlpha: "none" }).then((img) => {
          return _OnImageReadyAsync(img, engine, expandTexture, rgbdPostProcess, url, face, i, generateNonLODTextures, lodTextures, cubeRtt, texture);
        });
      } else {
        const image = new Image();
        image.src = url;
        promise = new Promise((resolve, reject) => {
          image.onload = () => {
            _OnImageReadyAsync(image, engine, expandTexture, rgbdPostProcess, url, face, i, generateNonLODTextures, lodTextures, cubeRtt, texture).then(() => resolve()).catch((reason) => {
              reject(reason);
            });
          };
          image.onerror = (error) => {
            reject(error);
          };
        });
      }
      promises.push(promise);
    }
  }
  await Promise.all(promises);
  if (imageData.length < mipmapsCount) {
    let data;
    const size = Math.pow(2, mipmapsCount - 1 - imageData.length);
    const dataLength = size * size * 4;
    switch (texture.type) {
      case 0: {
        data = new Uint8Array(dataLength);
        break;
      }
      case 2: {
        data = new Uint16Array(dataLength);
        break;
      }
      case 1: {
        data = new Float32Array(dataLength);
        break;
      }
    }
    for (let i = imageData.length; i < mipmapsCount; i++) {
      for (let face = 0; face < 6; face++) {
        engine._uploadArrayBufferViewToTexture((cubeRtt == null ? void 0 : cubeRtt.texture) || texture, data, face, i);
      }
    }
  }
  if (cubeRtt) {
    const irradiance = texture._irradianceTexture;
    texture._irradianceTexture = null;
    engine._releaseTexture(texture);
    cubeRtt._swapAndDie(texture);
    texture._irradianceTexture = irradiance;
  }
  if (rgbdPostProcess) {
    rgbdPostProcess.dispose();
  }
  if (generateNonLODTextures) {
    if (texture._lodTextureHigh && texture._lodTextureHigh._texture) {
      texture._lodTextureHigh._texture.isReady = true;
    }
    if (texture._lodTextureMid && texture._lodTextureMid._texture) {
      texture._lodTextureMid._texture.isReady = true;
    }
    if (texture._lodTextureLow && texture._lodTextureLow._texture) {
      texture._lodTextureLow._texture.isReady = true;
    }
  }
}
function UploadEnvSpherical(texture, info) {
  info = normalizeEnvInfo(info);
  const irradianceInfo = info.irradiance;
  if (!irradianceInfo) {
    return;
  }
  const sp = new SphericalPolynomial();
  Vector3.FromArrayToRef(irradianceInfo.x, 0, sp.x);
  Vector3.FromArrayToRef(irradianceInfo.y, 0, sp.y);
  Vector3.FromArrayToRef(irradianceInfo.z, 0, sp.z);
  Vector3.FromArrayToRef(irradianceInfo.xx, 0, sp.xx);
  Vector3.FromArrayToRef(irradianceInfo.yy, 0, sp.yy);
  Vector3.FromArrayToRef(irradianceInfo.zz, 0, sp.zz);
  Vector3.FromArrayToRef(irradianceInfo.yz, 0, sp.yz);
  Vector3.FromArrayToRef(irradianceInfo.zx, 0, sp.zx);
  Vector3.FromArrayToRef(irradianceInfo.xy, 0, sp.xy);
  texture._sphericalPolynomial = sp;
}
function _UpdateRGBDAsync(internalTexture, data, sphericalPolynomial, lodScale, lodOffset) {
  const proxy = internalTexture.getEngine().createRawCubeTexture(null, internalTexture.width, internalTexture.format, internalTexture.type, internalTexture.generateMipMaps, internalTexture.invertY, internalTexture.samplingMode, internalTexture._compression);
  const proxyPromise = UploadRadianceLevelsAsync(proxy, data).then(() => internalTexture);
  internalTexture.onRebuildCallback = (_internalTexture) => {
    return {
      proxy: proxyPromise,
      isReady: true,
      isAsync: true
    };
  };
  internalTexture._source = 13;
  internalTexture._bufferViewArrayArray = data;
  internalTexture._lodGenerationScale = lodScale;
  internalTexture._lodGenerationOffset = lodOffset;
  internalTexture._sphericalPolynomial = sphericalPolynomial;
  return UploadRadianceLevelsAsync(internalTexture, data).then(() => {
    internalTexture.isReady = true;
    return internalTexture;
  });
}
export {
  GetEnvInfo as G,
  UploadEnvSpherical as U,
  _UpdateRGBDAsync as _,
  UploadEnvLevelsAsync as a
};
