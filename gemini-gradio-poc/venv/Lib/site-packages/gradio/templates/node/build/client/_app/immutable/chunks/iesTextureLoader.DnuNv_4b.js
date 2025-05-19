import { aR as Lerp } from "./index.B4f7kVg_.js";
function lineToArray(line) {
  return line.split(" ").filter((x) => x !== "").map((x) => parseFloat(x));
}
function readArray(dataPointer, count, targetArray) {
  while (targetArray.length !== count) {
    const line = lineToArray(dataPointer.lines[dataPointer.index++]);
    targetArray.push(...line);
  }
}
function interpolateCandelaValues(data, phi, theta) {
  let phiIndex = 0;
  let thetaIndex = 0;
  let startTheta = 0;
  let endTheta = 0;
  let startPhi = 0;
  let endPhi = 0;
  for (let index = 0; index < data.numberOfHorizontalAngles - 1; index++) {
    if (theta < data.horizontalAngles[index + 1] || index === data.numberOfHorizontalAngles - 2) {
      thetaIndex = index;
      startTheta = data.horizontalAngles[index];
      endTheta = data.horizontalAngles[index + 1];
      break;
    }
  }
  for (let index = 0; index < data.numberOfVerticalAngles - 1; index++) {
    if (phi < data.verticalAngles[index + 1] || index === data.numberOfVerticalAngles - 2) {
      phiIndex = index;
      startPhi = data.verticalAngles[index];
      endPhi = data.verticalAngles[index + 1];
      break;
    }
  }
  const deltaTheta = endTheta - startTheta;
  const deltaPhi = endPhi - startPhi;
  if (deltaPhi === 0) {
    return 0;
  }
  const t1 = deltaTheta === 0 ? 0 : (theta - startTheta) / deltaTheta;
  const t2 = (phi - startPhi) / deltaPhi;
  const nextThetaIndex = deltaTheta === 0 ? thetaIndex : thetaIndex + 1;
  const v1 = Lerp(data.candelaValues[thetaIndex][phiIndex], data.candelaValues[nextThetaIndex][phiIndex], t1);
  const v2 = Lerp(data.candelaValues[thetaIndex][phiIndex + 1], data.candelaValues[nextThetaIndex][phiIndex + 1], t1);
  const v = Lerp(v1, v2, t2);
  return v;
}
function LoadIESData(uint8Array) {
  const decoder = new TextDecoder("utf-8");
  const source = decoder.decode(uint8Array);
  const dataPointer = {
    lines: source.split("\n"),
    index: 0
  };
  const data = { version: dataPointer.lines[0], candelaValues: [], horizontalAngles: [], verticalAngles: [], numberOfHorizontalAngles: 0, numberOfVerticalAngles: 0 };
  dataPointer.index = 1;
  while (dataPointer.lines.length > 0 && !dataPointer.lines[dataPointer.index].includes("TILT=")) {
    dataPointer.index++;
  }
  if (dataPointer.lines[dataPointer.index].includes("INCLUDE"))
    ;
  dataPointer.index++;
  const header = lineToArray(dataPointer.lines[dataPointer.index++]);
  data.numberOfLights = header[0];
  data.lumensPerLamp = header[1];
  data.candelaMultiplier = header[2];
  data.numberOfVerticalAngles = header[3];
  data.numberOfHorizontalAngles = header[4];
  data.photometricType = header[5];
  data.unitsType = header[6];
  data.width = header[7];
  data.length = header[8];
  data.height = header[9];
  const additionalData = lineToArray(dataPointer.lines[dataPointer.index++]);
  data.ballastFactor = additionalData[0];
  data.fileGenerationType = additionalData[1];
  data.inputWatts = additionalData[2];
  for (let index = 0; index < data.numberOfHorizontalAngles; index++) {
    data.candelaValues[index] = [];
  }
  readArray(dataPointer, data.numberOfVerticalAngles, data.verticalAngles);
  readArray(dataPointer, data.numberOfHorizontalAngles, data.horizontalAngles);
  for (let index = 0; index < data.numberOfHorizontalAngles; index++) {
    readArray(dataPointer, data.numberOfVerticalAngles, data.candelaValues[index]);
  }
  let maxCandela = -1;
  for (let index = 0; index < data.numberOfHorizontalAngles; index++) {
    for (let subIndex = 0; subIndex < data.numberOfVerticalAngles; subIndex++) {
      data.candelaValues[index][subIndex] *= data.candelaValues[index][subIndex] * data.candelaMultiplier * data.ballastFactor * data.fileGenerationType;
      maxCandela = Math.max(maxCandela, data.candelaValues[index][subIndex]);
    }
  }
  if (maxCandela > 0) {
    for (let index = 0; index < data.numberOfHorizontalAngles; index++) {
      for (let subIndex = 0; subIndex < data.numberOfVerticalAngles; subIndex++) {
        data.candelaValues[index][subIndex] /= maxCandela;
      }
    }
  }
  const height = 180;
  const width = height * 2;
  const size = width * height;
  const arrayBuffer = new Float32Array(width * height);
  const startTheta = data.horizontalAngles[0];
  const endTheta = data.horizontalAngles[data.numberOfHorizontalAngles - 1];
  for (let index = 0; index < size; index++) {
    let theta = index % width;
    const phi = Math.floor(index / width);
    if (endTheta - startTheta !== 0 && (theta < startTheta || theta >= endTheta)) {
      theta %= endTheta * 2;
      if (theta > endTheta) {
        theta = endTheta * 2 - theta;
      }
    }
    arrayBuffer[phi + theta * height] = interpolateCandelaValues(data, phi, theta);
  }
  return {
    width: width / 2,
    height: 1,
    data: arrayBuffer
  };
}
class _IESTextureLoader {
  constructor() {
    this.supportCascades = false;
  }
  /**
   * Uploads the cube texture data to the WebGL texture. It has already been bound.
   */
  loadCubeData() {
    throw ".ies not supported in Cube.";
  }
  /**
   * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
   * @param data contains the texture data
   * @param texture defines the BabylonJS internal texture
   * @param callback defines the method to call once ready to upload
   */
  loadData(data, texture, callback) {
    const uint8array = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const textureData = LoadIESData(uint8array);
    callback(textureData.width, textureData.height, false, false, () => {
      const engine = texture.getEngine();
      texture.type = 1;
      texture.format = 6;
      texture._gammaSpace = false;
      engine._uploadDataToTextureDirectly(texture, textureData.data);
    });
  }
}
export {
  _IESTextureLoader
};
