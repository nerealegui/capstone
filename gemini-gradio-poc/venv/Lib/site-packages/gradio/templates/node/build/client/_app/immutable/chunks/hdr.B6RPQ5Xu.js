import { V as Vector3 } from "./index.B4f7kVg_.js";
class PanoramaToCubeMapTools {
  /**
   * Converts a panorama stored in RGB right to left up to down format into a cubemap (6 faces).
   *
   * @param float32Array The source data.
   * @param inputWidth The width of the input panorama.
   * @param inputHeight The height of the input panorama.
   * @param size The willing size of the generated cubemap (each faces will be size * size pixels)
   * @param supersample enable supersampling the cubemap
   * @returns The cubemap data
   */
  static ConvertPanoramaToCubemap(float32Array, inputWidth, inputHeight, size, supersample = false) {
    if (!float32Array) {
      throw "ConvertPanoramaToCubemap: input cannot be null";
    }
    if (float32Array.length != inputWidth * inputHeight * 3) {
      throw "ConvertPanoramaToCubemap: input size is wrong";
    }
    const textureFront = this.CreateCubemapTexture(size, this.FACE_FRONT, float32Array, inputWidth, inputHeight, supersample);
    const textureBack = this.CreateCubemapTexture(size, this.FACE_BACK, float32Array, inputWidth, inputHeight, supersample);
    const textureLeft = this.CreateCubemapTexture(size, this.FACE_LEFT, float32Array, inputWidth, inputHeight, supersample);
    const textureRight = this.CreateCubemapTexture(size, this.FACE_RIGHT, float32Array, inputWidth, inputHeight, supersample);
    const textureUp = this.CreateCubemapTexture(size, this.FACE_UP, float32Array, inputWidth, inputHeight, supersample);
    const textureDown = this.CreateCubemapTexture(size, this.FACE_DOWN, float32Array, inputWidth, inputHeight, supersample);
    return {
      front: textureFront,
      back: textureBack,
      left: textureLeft,
      right: textureRight,
      up: textureUp,
      down: textureDown,
      size,
      type: 1,
      format: 4,
      gammaSpace: false
    };
  }
  static CreateCubemapTexture(texSize, faceData, float32Array, inputWidth, inputHeight, supersample = false) {
    const buffer = new ArrayBuffer(texSize * texSize * 4 * 3);
    const textureArray = new Float32Array(buffer);
    const samples = supersample ? Math.max(1, Math.round(inputWidth / 4 / texSize)) : 1;
    const sampleFactor = 1 / samples;
    const sampleFactorSqr = sampleFactor * sampleFactor;
    const rotDX1 = faceData[1].subtract(faceData[0]).scale(sampleFactor / texSize);
    const rotDX2 = faceData[3].subtract(faceData[2]).scale(sampleFactor / texSize);
    const dy = 1 / texSize;
    let fy = 0;
    for (let y = 0; y < texSize; y++) {
      for (let sy = 0; sy < samples; sy++) {
        let xv1 = faceData[0];
        let xv2 = faceData[2];
        for (let x = 0; x < texSize; x++) {
          for (let sx = 0; sx < samples; sx++) {
            const v = xv2.subtract(xv1).scale(fy).add(xv1);
            v.normalize();
            const color = this.CalcProjectionSpherical(v, float32Array, inputWidth, inputHeight);
            textureArray[y * texSize * 3 + x * 3 + 0] += color.r * sampleFactorSqr;
            textureArray[y * texSize * 3 + x * 3 + 1] += color.g * sampleFactorSqr;
            textureArray[y * texSize * 3 + x * 3 + 2] += color.b * sampleFactorSqr;
            xv1 = xv1.add(rotDX1);
            xv2 = xv2.add(rotDX2);
          }
        }
        fy += dy * sampleFactor;
      }
    }
    return textureArray;
  }
  static CalcProjectionSpherical(vDir, float32Array, inputWidth, inputHeight) {
    let theta = Math.atan2(vDir.z, vDir.x);
    const phi = Math.acos(vDir.y);
    while (theta < -Math.PI) {
      theta += 2 * Math.PI;
    }
    while (theta > Math.PI) {
      theta -= 2 * Math.PI;
    }
    let dx = theta / Math.PI;
    const dy = phi / Math.PI;
    dx = dx * 0.5 + 0.5;
    let px = Math.round(dx * inputWidth);
    if (px < 0) {
      px = 0;
    } else if (px >= inputWidth) {
      px = inputWidth - 1;
    }
    let py = Math.round(dy * inputHeight);
    if (py < 0) {
      py = 0;
    } else if (py >= inputHeight) {
      py = inputHeight - 1;
    }
    const inputY = inputHeight - py - 1;
    const r = float32Array[inputY * inputWidth * 3 + px * 3 + 0];
    const g = float32Array[inputY * inputWidth * 3 + px * 3 + 1];
    const b = float32Array[inputY * inputWidth * 3 + px * 3 + 2];
    return {
      r,
      g,
      b
    };
  }
}
PanoramaToCubeMapTools.FACE_LEFT = [new Vector3(-1, -1, -1), new Vector3(1, -1, -1), new Vector3(-1, 1, -1), new Vector3(1, 1, -1)];
PanoramaToCubeMapTools.FACE_RIGHT = [new Vector3(1, -1, 1), new Vector3(-1, -1, 1), new Vector3(1, 1, 1), new Vector3(-1, 1, 1)];
PanoramaToCubeMapTools.FACE_FRONT = [new Vector3(1, -1, -1), new Vector3(1, -1, 1), new Vector3(1, 1, -1), new Vector3(1, 1, 1)];
PanoramaToCubeMapTools.FACE_BACK = [new Vector3(-1, -1, 1), new Vector3(-1, -1, -1), new Vector3(-1, 1, 1), new Vector3(-1, 1, -1)];
PanoramaToCubeMapTools.FACE_DOWN = [new Vector3(1, 1, -1), new Vector3(1, 1, 1), new Vector3(-1, 1, -1), new Vector3(-1, 1, 1)];
PanoramaToCubeMapTools.FACE_UP = [new Vector3(-1, -1, -1), new Vector3(-1, -1, 1), new Vector3(1, -1, -1), new Vector3(1, -1, 1)];
function ldexp(mantissa, exponent) {
  if (exponent > 1023) {
    return mantissa * Math.pow(2, 1023) * Math.pow(2, exponent - 1023);
  }
  if (exponent < -1074) {
    return mantissa * Math.pow(2, -1074) * Math.pow(2, exponent + 1074);
  }
  return mantissa * Math.pow(2, exponent);
}
function rgbe2float(float32array, red, green, blue, exponent, index) {
  if (exponent > 0) {
    exponent = ldexp(1, exponent - (128 + 8));
    float32array[index + 0] = red * exponent;
    float32array[index + 1] = green * exponent;
    float32array[index + 2] = blue * exponent;
  } else {
    float32array[index + 0] = 0;
    float32array[index + 1] = 0;
    float32array[index + 2] = 0;
  }
}
function readStringLine(uint8array, startIndex) {
  let line = "";
  let character = "";
  for (let i = startIndex; i < uint8array.length - startIndex; i++) {
    character = String.fromCharCode(uint8array[i]);
    if (character == "\n") {
      break;
    }
    line += character;
  }
  return line;
}
function RGBE_ReadHeader(uint8array) {
  let height = 0;
  let width = 0;
  let line = readStringLine(uint8array, 0);
  if (line[0] != "#" || line[1] != "?") {
    throw "Bad HDR Format.";
  }
  let endOfHeader = false;
  let findFormat = false;
  let lineIndex = 0;
  do {
    lineIndex += line.length + 1;
    line = readStringLine(uint8array, lineIndex);
    if (line == "FORMAT=32-bit_rle_rgbe") {
      findFormat = true;
    } else if (line.length == 0) {
      endOfHeader = true;
    }
  } while (!endOfHeader);
  if (!findFormat) {
    throw "HDR Bad header format, unsupported FORMAT";
  }
  lineIndex += line.length + 1;
  line = readStringLine(uint8array, lineIndex);
  const sizeRegexp = /^-Y (.*) \+X (.*)$/g;
  const match = sizeRegexp.exec(line);
  if (!match || match.length < 3) {
    throw "HDR Bad header format, no size";
  }
  width = parseInt(match[2]);
  height = parseInt(match[1]);
  if (width < 8 || width > 32767) {
    throw "HDR Bad header format, unsupported size";
  }
  lineIndex += line.length + 1;
  return {
    height,
    width,
    dataPosition: lineIndex
  };
}
function GetCubeMapTextureData(buffer, size, supersample = false) {
  const uint8array = new Uint8Array(buffer);
  const hdrInfo = RGBE_ReadHeader(uint8array);
  const data = RGBE_ReadPixels(uint8array, hdrInfo);
  const cubeMapData = PanoramaToCubeMapTools.ConvertPanoramaToCubemap(data, hdrInfo.width, hdrInfo.height, size, supersample);
  return cubeMapData;
}
function RGBE_ReadPixels(uint8array, hdrInfo) {
  return readRGBEPixelsRLE(uint8array, hdrInfo);
}
function readRGBEPixelsRLE(uint8array, hdrInfo) {
  let num_scanlines = hdrInfo.height;
  const scanline_width = hdrInfo.width;
  let a, b, c, d, count;
  let dataIndex = hdrInfo.dataPosition;
  let index = 0, endIndex = 0, i = 0;
  const scanLineArrayBuffer = new ArrayBuffer(scanline_width * 4);
  const scanLineArray = new Uint8Array(scanLineArrayBuffer);
  const resultBuffer = new ArrayBuffer(hdrInfo.width * hdrInfo.height * 4 * 3);
  const resultArray = new Float32Array(resultBuffer);
  while (num_scanlines > 0) {
    a = uint8array[dataIndex++];
    b = uint8array[dataIndex++];
    c = uint8array[dataIndex++];
    d = uint8array[dataIndex++];
    if (a != 2 || b != 2 || c & 128 || hdrInfo.width < 8 || hdrInfo.width > 32767) {
      return readRGBEPixelsNotRLE(uint8array, hdrInfo);
    }
    if ((c << 8 | d) != scanline_width) {
      throw "HDR Bad header format, wrong scan line width";
    }
    index = 0;
    for (i = 0; i < 4; i++) {
      endIndex = (i + 1) * scanline_width;
      while (index < endIndex) {
        a = uint8array[dataIndex++];
        b = uint8array[dataIndex++];
        if (a > 128) {
          count = a - 128;
          if (count == 0 || count > endIndex - index) {
            throw "HDR Bad Format, bad scanline data (run)";
          }
          while (count-- > 0) {
            scanLineArray[index++] = b;
          }
        } else {
          count = a;
          if (count == 0 || count > endIndex - index) {
            throw "HDR Bad Format, bad scanline data (non-run)";
          }
          scanLineArray[index++] = b;
          if (--count > 0) {
            for (let j = 0; j < count; j++) {
              scanLineArray[index++] = uint8array[dataIndex++];
            }
          }
        }
      }
    }
    for (i = 0; i < scanline_width; i++) {
      a = scanLineArray[i];
      b = scanLineArray[i + scanline_width];
      c = scanLineArray[i + 2 * scanline_width];
      d = scanLineArray[i + 3 * scanline_width];
      rgbe2float(resultArray, a, b, c, d, (hdrInfo.height - num_scanlines) * scanline_width * 3 + i * 3);
    }
    num_scanlines--;
  }
  return resultArray;
}
function readRGBEPixelsNotRLE(uint8array, hdrInfo) {
  let num_scanlines = hdrInfo.height;
  const scanline_width = hdrInfo.width;
  let a, b, c, d, i;
  let dataIndex = hdrInfo.dataPosition;
  const resultBuffer = new ArrayBuffer(hdrInfo.width * hdrInfo.height * 4 * 3);
  const resultArray = new Float32Array(resultBuffer);
  while (num_scanlines > 0) {
    for (i = 0; i < hdrInfo.width; i++) {
      a = uint8array[dataIndex++];
      b = uint8array[dataIndex++];
      c = uint8array[dataIndex++];
      d = uint8array[dataIndex++];
      rgbe2float(resultArray, a, b, c, d, (hdrInfo.height - num_scanlines) * scanline_width * 3 + i * 3);
    }
    num_scanlines--;
  }
  return resultArray;
}
export {
  GetCubeMapTextureData as G,
  RGBE_ReadHeader as R,
  RGBE_ReadPixels as a
};
