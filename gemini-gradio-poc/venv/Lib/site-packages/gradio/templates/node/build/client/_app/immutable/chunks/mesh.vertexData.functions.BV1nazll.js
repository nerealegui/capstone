function getByteIndex(bitIndex) {
  return Math.floor(bitIndex / 8);
}
function getBitMask(bitIndex) {
  return 1 << bitIndex % 8;
}
class BitArray {
  /**
   * Creates a new bit array with a fixed size.
   * @param size The number of bits to store.
   */
  constructor(size) {
    this.size = size;
    this._byteArray = new Uint8Array(Math.ceil(this.size / 8));
  }
  /**
   * Gets the current value at the specified index.
   * @param bitIndex The index to get the value from.
   * @returns The value at the specified index.
   */
  get(bitIndex) {
    if (bitIndex >= this.size) {
      throw new RangeError("Bit index out of range");
    }
    const byteIndex = getByteIndex(bitIndex);
    const bitMask = getBitMask(bitIndex);
    return (this._byteArray[byteIndex] & bitMask) !== 0;
  }
  /**
   * Sets the value at the specified index.
   * @param bitIndex The index to set the value at.
   * @param value The value to set.
   */
  set(bitIndex, value) {
    if (bitIndex >= this.size) {
      throw new RangeError("Bit index out of range");
    }
    const byteIndex = getByteIndex(bitIndex);
    const bitMask = getBitMask(bitIndex);
    if (value) {
      this._byteArray[byteIndex] |= bitMask;
    } else {
      this._byteArray[byteIndex] &= ~bitMask;
    }
  }
}
function OptimizeIndices(indices) {
  const faces = [];
  const faceCount = indices.length / 3;
  for (let i = 0; i < faceCount; i++) {
    faces.push([indices[i * 3], indices[i * 3 + 1], indices[i * 3 + 2]]);
  }
  const vertexToFaceMap = /* @__PURE__ */ new Map();
  faces.forEach((face, faceIndex) => {
    face.forEach((vertex) => {
      let face2 = vertexToFaceMap.get(vertex);
      if (!face2) {
        vertexToFaceMap.set(vertex, face2 = []);
      }
      face2.push(faceIndex);
    });
  });
  const visited = new BitArray(faceCount);
  const sortedFaces = [];
  const deepFirstSearchStack = (startFaceIndex) => {
    const stack = [startFaceIndex];
    while (stack.length > 0) {
      const currentFaceIndex = stack.pop();
      if (visited.get(currentFaceIndex)) {
        continue;
      }
      visited.set(currentFaceIndex, true);
      sortedFaces.push(faces[currentFaceIndex]);
      faces[currentFaceIndex].forEach((vertex) => {
        const neighbors = vertexToFaceMap.get(vertex);
        if (!neighbors) {
          return;
        }
        neighbors.forEach((neighborFaceIndex) => {
          if (!visited.get(neighborFaceIndex)) {
            stack.push(neighborFaceIndex);
          }
        });
      });
    }
  };
  for (let i = 0; i < faceCount; i++) {
    if (!visited.get(i)) {
      deepFirstSearchStack(i);
    }
  }
  let index = 0;
  sortedFaces.forEach((face) => {
    indices[index++] = face[0];
    indices[index++] = face[1];
    indices[index++] = face[2];
  });
}
export {
  OptimizeIndices
};
