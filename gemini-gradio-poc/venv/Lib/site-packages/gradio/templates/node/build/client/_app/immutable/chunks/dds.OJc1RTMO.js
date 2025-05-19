import { au as FromHalfFloat, av as ToHalfFloat, aj as Clamp, h as Logger, aw as CubeMapToSphericalPolynomialTools } from "./index.B4f7kVg_.js";
import "./abstractEngine.cubeTexture.D7wk1UsP.js";
const DDS_MAGIC = 542327876;
const DDSD_MIPMAPCOUNT = 131072;
const DDSCAPS2_CUBEMAP = 512;
const DDPF_FOURCC = 4, DDPF_RGB = 64, DDPF_LUMINANCE = 131072;
function FourCCToInt32(value) {
  return value.charCodeAt(0) + (value.charCodeAt(1) << 8) + (value.charCodeAt(2) << 16) + (value.charCodeAt(3) << 24);
}
function Int32ToFourCC(value) {
  return String.fromCharCode(value & 255, value >> 8 & 255, value >> 16 & 255, value >> 24 & 255);
}
const FOURCC_DXT1 = FourCCToInt32("DXT1");
const FOURCC_DXT3 = FourCCToInt32("DXT3");
const FOURCC_DXT5 = FourCCToInt32("DXT5");
const FOURCC_DX10 = FourCCToInt32("DX10");
const FOURCC_D3DFMT_R16G16B16A16F = 113;
const FOURCC_D3DFMT_R32G32B32A32F = 116;
const DXGI_FORMAT_R32G32B32A32_FLOAT = 2;
const DXGI_FORMAT_R16G16B16A16_FLOAT = 10;
const DXGI_FORMAT_B8G8R8X8_UNORM = 88;
const headerLengthInt = 31;
const off_magic = 0;
const off_size = 1;
const off_flags = 2;
const off_height = 3;
const off_width = 4;
const off_mipmapCount = 7;
const off_pfFlags = 20;
const off_pfFourCC = 21;
const off_RGBbpp = 22;
const off_RMask = 23;
const off_GMask = 24;
const off_BMask = 25;
const off_AMask = 26;
const off_caps2 = 28;
const off_dxgiFormat = 32;
class DDSTools {
  /**
   * Gets DDS information from an array buffer
   * @param data defines the array buffer view to read data from
   * @returns the DDS information
   */
  static GetDDSInfo(data) {
    const header = new Int32Array(data.buffer, data.byteOffset, headerLengthInt);
    const extendedHeader = new Int32Array(data.buffer, data.byteOffset, headerLengthInt + 4);
    let mipmapCount = 1;
    if (header[off_flags] & DDSD_MIPMAPCOUNT) {
      mipmapCount = Math.max(1, header[off_mipmapCount]);
    }
    const fourCC = header[off_pfFourCC];
    const dxgiFormat = fourCC === FOURCC_DX10 ? extendedHeader[off_dxgiFormat] : 0;
    let textureType = 0;
    switch (fourCC) {
      case FOURCC_D3DFMT_R16G16B16A16F:
        textureType = 2;
        break;
      case FOURCC_D3DFMT_R32G32B32A32F:
        textureType = 1;
        break;
      case FOURCC_DX10:
        if (dxgiFormat === DXGI_FORMAT_R16G16B16A16_FLOAT) {
          textureType = 2;
          break;
        }
        if (dxgiFormat === DXGI_FORMAT_R32G32B32A32_FLOAT) {
          textureType = 1;
          break;
        }
    }
    return {
      width: header[off_width],
      height: header[off_height],
      mipmapCount,
      isFourCC: (header[off_pfFlags] & DDPF_FOURCC) === DDPF_FOURCC,
      isRGB: (header[off_pfFlags] & DDPF_RGB) === DDPF_RGB,
      isLuminance: (header[off_pfFlags] & DDPF_LUMINANCE) === DDPF_LUMINANCE,
      isCube: (header[off_caps2] & DDSCAPS2_CUBEMAP) === DDSCAPS2_CUBEMAP,
      isCompressed: fourCC === FOURCC_DXT1 || fourCC === FOURCC_DXT3 || fourCC === FOURCC_DXT5,
      dxgiFormat,
      textureType
    };
  }
  static _GetHalfFloatAsFloatRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, lod) {
    const destArray = new Float32Array(dataLength);
    const srcData = new Uint16Array(arrayBuffer, dataOffset);
    let index = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcPos = (x + y * width) * 4;
        destArray[index] = FromHalfFloat(srcData[srcPos]);
        destArray[index + 1] = FromHalfFloat(srcData[srcPos + 1]);
        destArray[index + 2] = FromHalfFloat(srcData[srcPos + 2]);
        if (DDSTools.StoreLODInAlphaChannel) {
          destArray[index + 3] = lod;
        } else {
          destArray[index + 3] = FromHalfFloat(srcData[srcPos + 3]);
        }
        index += 4;
      }
    }
    return destArray;
  }
  static _GetHalfFloatRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, lod) {
    if (DDSTools.StoreLODInAlphaChannel) {
      const destArray = new Uint16Array(dataLength);
      const srcData = new Uint16Array(arrayBuffer, dataOffset);
      let index = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const srcPos = (x + y * width) * 4;
          destArray[index] = srcData[srcPos];
          destArray[index + 1] = srcData[srcPos + 1];
          destArray[index + 2] = srcData[srcPos + 2];
          destArray[index + 3] = ToHalfFloat(lod);
          index += 4;
        }
      }
      return destArray;
    }
    return new Uint16Array(arrayBuffer, dataOffset, dataLength);
  }
  static _GetFloatRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, lod) {
    if (DDSTools.StoreLODInAlphaChannel) {
      const destArray = new Float32Array(dataLength);
      const srcData = new Float32Array(arrayBuffer, dataOffset);
      let index = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const srcPos = (x + y * width) * 4;
          destArray[index] = srcData[srcPos];
          destArray[index + 1] = srcData[srcPos + 1];
          destArray[index + 2] = srcData[srcPos + 2];
          destArray[index + 3] = lod;
          index += 4;
        }
      }
      return destArray;
    }
    return new Float32Array(arrayBuffer, dataOffset, dataLength);
  }
  static _GetFloatAsHalfFloatRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, lod) {
    const destArray = new Uint16Array(dataLength);
    const srcData = new Float32Array(arrayBuffer, dataOffset);
    let index = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        destArray[index] = ToHalfFloat(srcData[index]);
        destArray[index + 1] = ToHalfFloat(srcData[index + 1]);
        destArray[index + 2] = ToHalfFloat(srcData[index + 2]);
        if (DDSTools.StoreLODInAlphaChannel) {
          destArray[index + 3] = ToHalfFloat(lod);
        } else {
          destArray[index + 3] = ToHalfFloat(srcData[index + 3]);
        }
        index += 4;
      }
    }
    return destArray;
  }
  static _GetFloatAsUIntRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, lod) {
    const destArray = new Uint8Array(dataLength);
    const srcData = new Float32Array(arrayBuffer, dataOffset);
    let index = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcPos = (x + y * width) * 4;
        destArray[index] = Clamp(srcData[srcPos]) * 255;
        destArray[index + 1] = Clamp(srcData[srcPos + 1]) * 255;
        destArray[index + 2] = Clamp(srcData[srcPos + 2]) * 255;
        if (DDSTools.StoreLODInAlphaChannel) {
          destArray[index + 3] = lod;
        } else {
          destArray[index + 3] = Clamp(srcData[srcPos + 3]) * 255;
        }
        index += 4;
      }
    }
    return destArray;
  }
  static _GetHalfFloatAsUIntRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, lod) {
    const destArray = new Uint8Array(dataLength);
    const srcData = new Uint16Array(arrayBuffer, dataOffset);
    let index = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcPos = (x + y * width) * 4;
        destArray[index] = Clamp(FromHalfFloat(srcData[srcPos])) * 255;
        destArray[index + 1] = Clamp(FromHalfFloat(srcData[srcPos + 1])) * 255;
        destArray[index + 2] = Clamp(FromHalfFloat(srcData[srcPos + 2])) * 255;
        if (DDSTools.StoreLODInAlphaChannel) {
          destArray[index + 3] = lod;
        } else {
          destArray[index + 3] = Clamp(FromHalfFloat(srcData[srcPos + 3])) * 255;
        }
        index += 4;
      }
    }
    return destArray;
  }
  static _GetRGBAArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, rOffset, gOffset, bOffset, aOffset) {
    const byteArray = new Uint8Array(dataLength);
    const srcData = new Uint8Array(arrayBuffer, dataOffset);
    let index = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcPos = (x + y * width) * 4;
        byteArray[index] = srcData[srcPos + rOffset];
        byteArray[index + 1] = srcData[srcPos + gOffset];
        byteArray[index + 2] = srcData[srcPos + bOffset];
        byteArray[index + 3] = srcData[srcPos + aOffset];
        index += 4;
      }
    }
    return byteArray;
  }
  static _ExtractLongWordOrder(value) {
    if (value === 0 || value === 255 || value === -16777216) {
      return 0;
    }
    return 1 + DDSTools._ExtractLongWordOrder(value >> 8);
  }
  static _GetRGBArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer, rOffset, gOffset, bOffset) {
    const byteArray = new Uint8Array(dataLength);
    const srcData = new Uint8Array(arrayBuffer, dataOffset);
    let index = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcPos = (x + y * width) * 3;
        byteArray[index] = srcData[srcPos + rOffset];
        byteArray[index + 1] = srcData[srcPos + gOffset];
        byteArray[index + 2] = srcData[srcPos + bOffset];
        index += 3;
      }
    }
    return byteArray;
  }
  static _GetLuminanceArrayBuffer(width, height, dataOffset, dataLength, arrayBuffer) {
    const byteArray = new Uint8Array(dataLength);
    const srcData = new Uint8Array(arrayBuffer, dataOffset);
    let index = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcPos = x + y * width;
        byteArray[index] = srcData[srcPos];
        index++;
      }
    }
    return byteArray;
  }
  /**
   * Uploads DDS Levels to a Babylon Texture
   * @internal
   */
  static UploadDDSLevels(engine, texture, data, info, loadMipmaps, faces, lodIndex = -1, currentFace, destTypeMustBeFilterable = true) {
    let sphericalPolynomialFaces = null;
    if (info.sphericalPolynomial) {
      sphericalPolynomialFaces = [];
    }
    const ext = !!engine.getCaps().s3tc;
    texture.generateMipMaps = loadMipmaps;
    const header = new Int32Array(data.buffer, data.byteOffset, headerLengthInt);
    let fourCC, width, height, dataLength = 0, dataOffset;
    let byteArray, mipmapCount, mip;
    let internalCompressedFormat = 0;
    let blockBytes = 1;
    if (header[off_magic] !== DDS_MAGIC) {
      Logger.Error("Invalid magic number in DDS header");
      return;
    }
    if (!info.isFourCC && !info.isRGB && !info.isLuminance) {
      Logger.Error("Unsupported format, must contain a FourCC, RGB or LUMINANCE code");
      return;
    }
    if (info.isCompressed && !ext) {
      Logger.Error("Compressed textures are not supported on this platform.");
      return;
    }
    let bpp = header[off_RGBbpp];
    dataOffset = header[off_size] + 4;
    let computeFormats = false;
    if (info.isFourCC) {
      fourCC = header[off_pfFourCC];
      switch (fourCC) {
        case FOURCC_DXT1:
          blockBytes = 8;
          internalCompressedFormat = 33777;
          break;
        case FOURCC_DXT3:
          blockBytes = 16;
          internalCompressedFormat = 33778;
          break;
        case FOURCC_DXT5:
          blockBytes = 16;
          internalCompressedFormat = 33779;
          break;
        case FOURCC_D3DFMT_R16G16B16A16F:
          computeFormats = true;
          bpp = 64;
          break;
        case FOURCC_D3DFMT_R32G32B32A32F:
          computeFormats = true;
          bpp = 128;
          break;
        case FOURCC_DX10: {
          dataOffset += 5 * 4;
          let supported = false;
          switch (info.dxgiFormat) {
            case DXGI_FORMAT_R16G16B16A16_FLOAT:
              computeFormats = true;
              bpp = 64;
              supported = true;
              break;
            case DXGI_FORMAT_R32G32B32A32_FLOAT:
              computeFormats = true;
              bpp = 128;
              supported = true;
              break;
            case DXGI_FORMAT_B8G8R8X8_UNORM:
              info.isRGB = true;
              info.isFourCC = false;
              bpp = 32;
              supported = true;
              break;
          }
          if (supported) {
            break;
          }
        }
        default:
          Logger.Error(["Unsupported FourCC code:", Int32ToFourCC(fourCC)]);
          return;
      }
    }
    const rOffset = DDSTools._ExtractLongWordOrder(header[off_RMask]);
    const gOffset = DDSTools._ExtractLongWordOrder(header[off_GMask]);
    const bOffset = DDSTools._ExtractLongWordOrder(header[off_BMask]);
    const aOffset = DDSTools._ExtractLongWordOrder(header[off_AMask]);
    if (computeFormats) {
      internalCompressedFormat = engine._getRGBABufferInternalSizedFormat(info.textureType);
    }
    mipmapCount = 1;
    if (header[off_flags] & DDSD_MIPMAPCOUNT && loadMipmaps !== false) {
      mipmapCount = Math.max(1, header[off_mipmapCount]);
    }
    const startFace = currentFace || 0;
    const caps = engine.getCaps();
    for (let face = startFace; face < faces; face++) {
      width = header[off_width];
      height = header[off_height];
      for (mip = 0; mip < mipmapCount; ++mip) {
        if (lodIndex === -1 || lodIndex === mip) {
          const i = lodIndex === -1 ? mip : 0;
          if (!info.isCompressed && info.isFourCC) {
            texture.format = 5;
            dataLength = width * height * 4;
            let floatArray = null;
            if (engine._badOS || engine._badDesktopOS || !caps.textureHalfFloat && !caps.textureFloat) {
              if (bpp === 128) {
                floatArray = DDSTools._GetFloatAsUIntRGBAArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, i);
                if (sphericalPolynomialFaces && i == 0) {
                  sphericalPolynomialFaces.push(DDSTools._GetFloatRGBAArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, i));
                }
              } else if (bpp === 64) {
                floatArray = DDSTools._GetHalfFloatAsUIntRGBAArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, i);
                if (sphericalPolynomialFaces && i == 0) {
                  sphericalPolynomialFaces.push(DDSTools._GetHalfFloatAsFloatRGBAArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, i));
                }
              }
              texture.type = 0;
            } else {
              const floatAvailable = caps.textureFloat && (destTypeMustBeFilterable && caps.textureFloatLinearFiltering || !destTypeMustBeFilterable);
              const halfFloatAvailable = caps.textureHalfFloat && (destTypeMustBeFilterable && caps.textureHalfFloatLinearFiltering || !destTypeMustBeFilterable);
              const destType = (bpp === 128 || bpp === 64 && !halfFloatAvailable) && floatAvailable ? 1 : (bpp === 64 || bpp === 128 && !floatAvailable) && halfFloatAvailable ? 2 : 0;
              let dataGetter;
              let dataGetterPolynomial = null;
              switch (bpp) {
                case 128: {
                  switch (destType) {
                    case 1:
                      dataGetter = DDSTools._GetFloatRGBAArrayBuffer;
                      dataGetterPolynomial = null;
                      break;
                    case 2:
                      dataGetter = DDSTools._GetFloatAsHalfFloatRGBAArrayBuffer;
                      dataGetterPolynomial = DDSTools._GetFloatRGBAArrayBuffer;
                      break;
                    case 0:
                      dataGetter = DDSTools._GetFloatAsUIntRGBAArrayBuffer;
                      dataGetterPolynomial = DDSTools._GetFloatRGBAArrayBuffer;
                      break;
                  }
                  break;
                }
                default: {
                  switch (destType) {
                    case 1:
                      dataGetter = DDSTools._GetHalfFloatAsFloatRGBAArrayBuffer;
                      dataGetterPolynomial = null;
                      break;
                    case 2:
                      dataGetter = DDSTools._GetHalfFloatRGBAArrayBuffer;
                      dataGetterPolynomial = DDSTools._GetHalfFloatAsFloatRGBAArrayBuffer;
                      break;
                    case 0:
                      dataGetter = DDSTools._GetHalfFloatAsUIntRGBAArrayBuffer;
                      dataGetterPolynomial = DDSTools._GetHalfFloatAsFloatRGBAArrayBuffer;
                      break;
                  }
                  break;
                }
              }
              texture.type = destType;
              floatArray = dataGetter(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, i);
              if (sphericalPolynomialFaces && i == 0) {
                sphericalPolynomialFaces.push(dataGetterPolynomial ? dataGetterPolynomial(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, i) : floatArray);
              }
            }
            if (floatArray) {
              engine._uploadDataToTextureDirectly(texture, floatArray, face, i);
            }
          } else if (info.isRGB) {
            texture.type = 0;
            if (bpp === 24) {
              texture.format = 4;
              dataLength = width * height * 3;
              byteArray = DDSTools._GetRGBArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, rOffset, gOffset, bOffset);
              engine._uploadDataToTextureDirectly(texture, byteArray, face, i);
            } else {
              texture.format = 5;
              dataLength = width * height * 4;
              byteArray = DDSTools._GetRGBAArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer, rOffset, gOffset, bOffset, aOffset);
              engine._uploadDataToTextureDirectly(texture, byteArray, face, i);
            }
          } else if (info.isLuminance) {
            const unpackAlignment = engine._getUnpackAlignement();
            const unpaddedRowSize = width;
            const paddedRowSize = Math.floor((width + unpackAlignment - 1) / unpackAlignment) * unpackAlignment;
            dataLength = paddedRowSize * (height - 1) + unpaddedRowSize;
            byteArray = DDSTools._GetLuminanceArrayBuffer(width, height, data.byteOffset + dataOffset, dataLength, data.buffer);
            texture.format = 1;
            texture.type = 0;
            engine._uploadDataToTextureDirectly(texture, byteArray, face, i);
          } else {
            dataLength = Math.max(4, width) / 4 * Math.max(4, height) / 4 * blockBytes;
            byteArray = new Uint8Array(data.buffer, data.byteOffset + dataOffset, dataLength);
            texture.type = 0;
            engine._uploadCompressedDataToTextureDirectly(texture, internalCompressedFormat, width, height, byteArray, face, i);
          }
        }
        dataOffset += bpp ? width * height * (bpp / 8) : dataLength;
        width *= 0.5;
        height *= 0.5;
        width = Math.max(1, width);
        height = Math.max(1, height);
      }
      if (currentFace !== void 0) {
        break;
      }
    }
    if (sphericalPolynomialFaces && sphericalPolynomialFaces.length > 0) {
      info.sphericalPolynomial = CubeMapToSphericalPolynomialTools.ConvertCubeMapToSphericalPolynomial({
        size: header[off_width],
        right: sphericalPolynomialFaces[0],
        left: sphericalPolynomialFaces[1],
        up: sphericalPolynomialFaces[2],
        down: sphericalPolynomialFaces[3],
        front: sphericalPolynomialFaces[4],
        back: sphericalPolynomialFaces[5],
        format: 5,
        type: 1,
        gammaSpace: false
      });
    } else {
      info.sphericalPolynomial = void 0;
    }
  }
}
DDSTools.StoreLODInAlphaChannel = false;
export {
  DDSTools
};
