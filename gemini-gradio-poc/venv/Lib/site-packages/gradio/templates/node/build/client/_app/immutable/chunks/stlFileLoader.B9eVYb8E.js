import { ae as STLFileLoaderMetadata, ab as Mesh, b as Tools, aa as VertexBuffer, af as RegisterSceneLoaderPlugin } from "./index.B4f7kVg_.js";
import { A as AssetContainer } from "./assetContainer.Bu7qjjhL.js";
import "./standardMaterial.WcLfkp_h.js";
class STLFileLoader {
  constructor() {
    this.solidPattern = /solid (\S*)([\S\s]*?)endsolid[ ]*(\S*)/g;
    this.facetsPattern = /facet([\s\S]*?)endfacet/g;
    this.normalPattern = /normal[\s]+([-+]?[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+/g;
    this.vertexPattern = /vertex[\s]+([-+]?[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+/g;
    this.name = STLFileLoaderMetadata.name;
    this.extensions = STLFileLoaderMetadata.extensions;
  }
  /**
   * Import meshes into a scene.
   * @param meshesNames An array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
   * @param scene The scene to import into
   * @param data The data to import
   * @param rootUrl The root url for scene and resources
   * @param meshes The meshes array to import into
   * @returns True if successful or false otherwise
   */
  importMesh(meshesNames, scene, data, rootUrl, meshes) {
    let matches;
    if (typeof data !== "string") {
      if (this._isBinary(data)) {
        const babylonMesh = new Mesh("stlmesh", scene);
        this._parseBinary(babylonMesh, data);
        if (meshes) {
          meshes.push(babylonMesh);
        }
        return true;
      }
      data = new TextDecoder().decode(new Uint8Array(data));
    }
    while (matches = this.solidPattern.exec(data)) {
      let meshName = matches[1];
      const meshNameFromEnd = matches[3];
      if (meshNameFromEnd && meshName != meshNameFromEnd) {
        Tools.Error("Error in STL, solid name != endsolid name");
        return false;
      }
      if (meshesNames && meshName) {
        if (meshesNames instanceof Array) {
          if (!meshesNames.indexOf(meshName)) {
            continue;
          }
        } else {
          if (meshName !== meshesNames) {
            continue;
          }
        }
      }
      meshName = meshName || "stlmesh";
      const babylonMesh = new Mesh(meshName, scene);
      this._parseASCII(babylonMesh, matches[2]);
      if (meshes) {
        meshes.push(babylonMesh);
      }
    }
    return true;
  }
  /**
   * Load into a scene.
   * @param scene The scene to load into
   * @param data The data to import
   * @param rootUrl The root url for scene and resources
   * @returns true if successful or false otherwise
   */
  load(scene, data, rootUrl) {
    const result = this.importMesh(null, scene, data, rootUrl, null);
    return result;
  }
  /**
   * Load into an asset container.
   * @param scene The scene to load into
   * @param data The data to import
   * @param rootUrl The root url for scene and resources
   * @returns The loaded asset container
   */
  loadAssetContainer(scene, data, rootUrl) {
    const container = new AssetContainer(scene);
    scene._blockEntityCollection = true;
    this.importMesh(null, scene, data, rootUrl, container.meshes);
    scene._blockEntityCollection = false;
    return container;
  }
  _isBinary(data) {
    const reader = new DataView(data);
    if (reader.byteLength <= 80) {
      return false;
    }
    const faceSize = 32 / 8 * 3 + 32 / 8 * 3 * 3 + 16 / 8;
    const nFaces = reader.getUint32(80, true);
    if (80 + 32 / 8 + nFaces * faceSize === reader.byteLength) {
      return true;
    }
    const ascii = [115, 111, 108, 105, 100];
    for (let off = 0; off < 5; off++) {
      if (reader.getUint8(off) !== ascii[off]) {
        return true;
      }
    }
    return false;
  }
  _parseBinary(mesh, data) {
    const reader = new DataView(data);
    const faces = reader.getUint32(80, true);
    const dataOffset = 84;
    const faceLength = 12 * 4 + 2;
    let offset = 0;
    const positions = new Float32Array(faces * 3 * 3);
    const normals = new Float32Array(faces * 3 * 3);
    const indices = new Uint32Array(faces * 3);
    let indicesCount = 0;
    for (let face = 0; face < faces; face++) {
      const start = dataOffset + face * faceLength;
      const normalX = reader.getFloat32(start, true);
      const normalY = reader.getFloat32(start + 4, true);
      const normalZ = reader.getFloat32(start + 8, true);
      for (let i = 1; i <= 3; i++) {
        const vertexstart = start + i * 12;
        positions[offset] = reader.getFloat32(vertexstart, true);
        normals[offset] = normalX;
        if (!STLFileLoader.DO_NOT_ALTER_FILE_COORDINATES) {
          positions[offset + 2] = reader.getFloat32(vertexstart + 4, true);
          positions[offset + 1] = reader.getFloat32(vertexstart + 8, true);
          normals[offset + 2] = normalY;
          normals[offset + 1] = normalZ;
        } else {
          positions[offset + 1] = reader.getFloat32(vertexstart + 4, true);
          positions[offset + 2] = reader.getFloat32(vertexstart + 8, true);
          normals[offset + 1] = normalY;
          normals[offset + 2] = normalZ;
        }
        offset += 3;
      }
      if (STLFileLoader.DO_NOT_ALTER_FILE_COORDINATES) {
        indices[indicesCount] = indicesCount;
        indices[indicesCount + 1] = indicesCount + 2;
        indices[indicesCount + 2] = indicesCount + 1;
        indicesCount += 3;
      } else {
        indices[indicesCount] = indicesCount++;
        indices[indicesCount] = indicesCount++;
        indices[indicesCount] = indicesCount++;
      }
    }
    mesh.setVerticesData(VertexBuffer.PositionKind, positions);
    mesh.setVerticesData(VertexBuffer.NormalKind, normals);
    mesh.setIndices(indices);
    mesh.computeWorldMatrix(true);
  }
  _parseASCII(mesh, solidData) {
    const positions = [];
    const normals = [];
    const indices = [];
    let indicesCount = 0;
    let matches;
    while (matches = this.facetsPattern.exec(solidData)) {
      const facet = matches[1];
      const normalMatches = this.normalPattern.exec(facet);
      this.normalPattern.lastIndex = 0;
      if (!normalMatches) {
        continue;
      }
      const normal = [Number(normalMatches[1]), Number(normalMatches[5]), Number(normalMatches[3])];
      let vertexMatch;
      while (vertexMatch = this.vertexPattern.exec(facet)) {
        if (!STLFileLoader.DO_NOT_ALTER_FILE_COORDINATES) {
          positions.push(Number(vertexMatch[1]), Number(vertexMatch[5]), Number(vertexMatch[3]));
          normals.push(normal[0], normal[1], normal[2]);
        } else {
          positions.push(Number(vertexMatch[1]), Number(vertexMatch[3]), Number(vertexMatch[5]));
          normals.push(normal[0], normal[2], normal[1]);
        }
      }
      if (STLFileLoader.DO_NOT_ALTER_FILE_COORDINATES) {
        indices.push(indicesCount, indicesCount + 2, indicesCount + 1);
        indicesCount += 3;
      } else {
        indices.push(indicesCount++, indicesCount++, indicesCount++);
      }
      this.vertexPattern.lastIndex = 0;
    }
    this.facetsPattern.lastIndex = 0;
    mesh.setVerticesData(VertexBuffer.PositionKind, positions);
    mesh.setVerticesData(VertexBuffer.NormalKind, normals);
    mesh.setIndices(indices);
    mesh.computeWorldMatrix(true);
  }
}
STLFileLoader.DO_NOT_ALTER_FILE_COORDINATES = false;
RegisterSceneLoaderPlugin(new STLFileLoader());
export {
  STLFileLoader
};
