import { C as Color3, T as Texture, aS as Color4, ay as Vector2, V as Vector3, aa as VertexBuffer, h as Logger, aT as Geometry, ab as Mesh, aU as VertexData, aV as OBJFileLoaderMetadata, b as Tools, af as RegisterSceneLoaderPlugin } from "./index.B4f7kVg_.js";
import { A as AssetContainer } from "./assetContainer.Bu7qjjhL.js";
import { S as StandardMaterial } from "./standardMaterial.WcLfkp_h.js";
class MTLFileLoader {
  constructor() {
    this.materials = [];
  }
  /**
   * This function will read the mtl file and create each material described inside
   * This function could be improve by adding :
   * -some component missing (Ni, Tf...)
   * -including the specific options available
   *
   * @param scene defines the scene the material will be created in
   * @param data defines the mtl data to parse
   * @param rootUrl defines the rooturl to use in order to load relative dependencies
   * @param assetContainer defines the asset container to store the material in (can be null)
   */
  parseMTL(scene, data, rootUrl, assetContainer) {
    if (data instanceof ArrayBuffer) {
      return;
    }
    const lines = data.split("\n");
    const delimiter_pattern = /\s+/;
    let color;
    let material = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length === 0 || line.charAt(0) === "#") {
        continue;
      }
      const pos = line.indexOf(" ");
      let key = pos >= 0 ? line.substring(0, pos) : line;
      key = key.toLowerCase();
      const value = pos >= 0 ? line.substring(pos + 1).trim() : "";
      if (key === "newmtl") {
        if (material) {
          this.materials.push(material);
        }
        scene._blockEntityCollection = !!assetContainer;
        material = new StandardMaterial(value, scene);
        material._parentContainer = assetContainer;
        scene._blockEntityCollection = false;
      } else if (key === "kd" && material) {
        color = value.split(delimiter_pattern, 3).map(parseFloat);
        material.diffuseColor = Color3.FromArray(color);
      } else if (key === "ka" && material) {
        color = value.split(delimiter_pattern, 3).map(parseFloat);
        material.ambientColor = Color3.FromArray(color);
      } else if (key === "ks" && material) {
        color = value.split(delimiter_pattern, 3).map(parseFloat);
        material.specularColor = Color3.FromArray(color);
      } else if (key === "ke" && material) {
        color = value.split(delimiter_pattern, 3).map(parseFloat);
        material.emissiveColor = Color3.FromArray(color);
      } else if (key === "ns" && material) {
        material.specularPower = parseFloat(value);
      } else if (key === "d" && material) {
        material.alpha = parseFloat(value);
      } else if (key === "map_ka" && material) {
        material.ambientTexture = MTLFileLoader._GetTexture(rootUrl, value, scene);
      } else if (key === "map_kd" && material) {
        material.diffuseTexture = MTLFileLoader._GetTexture(rootUrl, value, scene);
      } else if (key === "map_ks" && material) {
        material.specularTexture = MTLFileLoader._GetTexture(rootUrl, value, scene);
      } else if (key === "map_ns")
        ;
      else if (key === "map_bump" && material) {
        const values = value.split(delimiter_pattern);
        const bumpMultiplierIndex = values.indexOf("-bm");
        let bumpMultiplier = null;
        if (bumpMultiplierIndex >= 0) {
          bumpMultiplier = values[bumpMultiplierIndex + 1];
          values.splice(bumpMultiplierIndex, 2);
        }
        material.bumpTexture = MTLFileLoader._GetTexture(rootUrl, values.join(" "), scene);
        if (material.bumpTexture && bumpMultiplier !== null) {
          material.bumpTexture.level = parseFloat(bumpMultiplier);
        }
      } else if (key === "map_d" && material) {
        material.opacityTexture = MTLFileLoader._GetTexture(rootUrl, value, scene);
      } else
        ;
    }
    if (material) {
      this.materials.push(material);
    }
  }
  /**
   * Gets the texture for the material.
   *
   * If the material is imported from input file,
   * We sanitize the url to ensure it takes the texture from aside the material.
   *
   * @param rootUrl The root url to load from
   * @param value The value stored in the mtl
   * @param scene
   * @returns The Texture
   */
  static _GetTexture(rootUrl, value, scene) {
    if (!value) {
      return null;
    }
    let url = rootUrl;
    if (rootUrl === "file:") {
      let lastDelimiter = value.lastIndexOf("\\");
      if (lastDelimiter === -1) {
        lastDelimiter = value.lastIndexOf("/");
      }
      if (lastDelimiter > -1) {
        url += value.substring(lastDelimiter + 1);
      } else {
        url += value;
      }
    } else {
      url += value;
    }
    return new Texture(url, scene, false, MTLFileLoader.INVERT_TEXTURE_Y);
  }
}
MTLFileLoader.INVERT_TEXTURE_Y = true;
class SolidParser {
  /**
   * Creates a new SolidParser
   * @param materialToUse defines the array to fill with the list of materials to use (it will be filled by the parse function)
   * @param babylonMeshesArray defines the array to fill with the list of loaded meshes (it will be filled by the parse function)
   * @param loadingOptions defines the loading options to use
   */
  constructor(materialToUse, babylonMeshesArray, loadingOptions) {
    this._positions = [];
    this._normals = [];
    this._uvs = [];
    this._colors = [];
    this._extColors = [];
    this._meshesFromObj = [];
    this._indicesForBabylon = [];
    this._wrappedPositionForBabylon = [];
    this._wrappedUvsForBabylon = [];
    this._wrappedColorsForBabylon = [];
    this._wrappedNormalsForBabylon = [];
    this._tuplePosNorm = [];
    this._curPositionInIndices = 0;
    this._hasMeshes = false;
    this._unwrappedPositionsForBabylon = [];
    this._unwrappedColorsForBabylon = [];
    this._unwrappedNormalsForBabylon = [];
    this._unwrappedUVForBabylon = [];
    this._triangles = [];
    this._materialNameFromObj = "";
    this._objMeshName = "";
    this._increment = 1;
    this._isFirstMaterial = true;
    this._grayColor = new Color4(0.5, 0.5, 0.5, 1);
    this._hasLineData = false;
    this._materialToUse = materialToUse;
    this._babylonMeshesArray = babylonMeshesArray;
    this._loadingOptions = loadingOptions;
  }
  /**
   * Search for obj in the given array.
   * This function is called to check if a couple of data already exists in an array.
   *
   * If found, returns the index of the founded tuple index. Returns -1 if not found
   * @param arr Array<{ normals: Array<number>, idx: Array<number> }>
   * @param obj Array<number>
   * @returns {boolean}
   */
  _isInArray(arr, obj) {
    if (!arr[obj[0]]) {
      arr[obj[0]] = { normals: [], idx: [] };
    }
    const idx = arr[obj[0]].normals.indexOf(obj[1]);
    return idx === -1 ? -1 : arr[obj[0]].idx[idx];
  }
  _isInArrayUV(arr, obj) {
    if (!arr[obj[0]]) {
      arr[obj[0]] = { normals: [], idx: [], uv: [] };
    }
    const idx = arr[obj[0]].normals.indexOf(obj[1]);
    if (idx != 1 && obj[2] === arr[obj[0]].uv[idx]) {
      return arr[obj[0]].idx[idx];
    }
    return -1;
  }
  /**
   * This function set the data for each triangle.
   * Data are position, normals and uvs
   * If a tuple of (position, normal) is not set, add the data into the corresponding array
   * If the tuple already exist, add only their indice
   *
   * @param indicePositionFromObj Integer The index in positions array
   * @param indiceUvsFromObj Integer The index in uvs array
   * @param indiceNormalFromObj Integer The index in normals array
   * @param positionVectorFromOBJ Vector3 The value of position at index objIndice
   * @param textureVectorFromOBJ Vector3 The value of uvs
   * @param normalsVectorFromOBJ Vector3 The value of normals at index objNormale
   * @param positionColorsFromOBJ
   */
  _setData(indicePositionFromObj, indiceUvsFromObj, indiceNormalFromObj, positionVectorFromOBJ, textureVectorFromOBJ, normalsVectorFromOBJ, positionColorsFromOBJ) {
    let _index;
    if (this._loadingOptions.optimizeWithUV) {
      _index = this._isInArrayUV(this._tuplePosNorm, [indicePositionFromObj, indiceNormalFromObj, indiceUvsFromObj]);
    } else {
      _index = this._isInArray(this._tuplePosNorm, [indicePositionFromObj, indiceNormalFromObj]);
    }
    if (_index === -1) {
      this._indicesForBabylon.push(this._wrappedPositionForBabylon.length);
      this._wrappedPositionForBabylon.push(positionVectorFromOBJ);
      textureVectorFromOBJ = textureVectorFromOBJ ?? new Vector2(0, 0);
      this._wrappedUvsForBabylon.push(textureVectorFromOBJ);
      this._wrappedNormalsForBabylon.push(normalsVectorFromOBJ);
      if (positionColorsFromOBJ !== void 0) {
        this._wrappedColorsForBabylon.push(positionColorsFromOBJ);
      }
      this._tuplePosNorm[indicePositionFromObj].normals.push(indiceNormalFromObj);
      this._tuplePosNorm[indicePositionFromObj].idx.push(this._curPositionInIndices++);
      if (this._loadingOptions.optimizeWithUV) {
        this._tuplePosNorm[indicePositionFromObj].uv.push(indiceUvsFromObj);
      }
    } else {
      this._indicesForBabylon.push(_index);
    }
  }
  /**
   * Transform Vector() and BABYLON.Color() objects into numbers in an array
   */
  _unwrapData() {
    try {
      for (let l = 0; l < this._wrappedPositionForBabylon.length; l++) {
        this._unwrappedPositionsForBabylon.push(this._wrappedPositionForBabylon[l].x * this._handednessSign, this._wrappedPositionForBabylon[l].y, this._wrappedPositionForBabylon[l].z);
        this._unwrappedNormalsForBabylon.push(this._wrappedNormalsForBabylon[l].x * this._handednessSign, this._wrappedNormalsForBabylon[l].y, this._wrappedNormalsForBabylon[l].z);
        this._unwrappedUVForBabylon.push(this._wrappedUvsForBabylon[l].x, this._wrappedUvsForBabylon[l].y);
        if (this._loadingOptions.importVertexColors) {
          this._unwrappedColorsForBabylon.push(this._wrappedColorsForBabylon[l].r, this._wrappedColorsForBabylon[l].g, this._wrappedColorsForBabylon[l].b, this._wrappedColorsForBabylon[l].a);
        }
      }
      this._wrappedPositionForBabylon.length = 0;
      this._wrappedNormalsForBabylon.length = 0;
      this._wrappedUvsForBabylon.length = 0;
      this._wrappedColorsForBabylon.length = 0;
      this._tuplePosNorm.length = 0;
      this._curPositionInIndices = 0;
    } catch (e) {
      throw new Error("Unable to unwrap data while parsing OBJ data.");
    }
  }
  /**
   * Create triangles from polygons
   * It is important to notice that a triangle is a polygon
   * We get 5 patterns of face defined in OBJ File :
   * facePattern1 = ["1","2","3","4","5","6"]
   * facePattern2 = ["1/1","2/2","3/3","4/4","5/5","6/6"]
   * facePattern3 = ["1/1/1","2/2/2","3/3/3","4/4/4","5/5/5","6/6/6"]
   * facePattern4 = ["1//1","2//2","3//3","4//4","5//5","6//6"]
   * facePattern5 = ["-1/-1/-1","-2/-2/-2","-3/-3/-3","-4/-4/-4","-5/-5/-5","-6/-6/-6"]
   * Each pattern is divided by the same method
   * @param faces Array[String] The indices of elements
   * @param v Integer The variable to increment
   */
  _getTriangles(faces, v) {
    for (let faceIndex = v; faceIndex < faces.length - 1; faceIndex++) {
      this._pushTriangle(faces, faceIndex);
    }
  }
  /**
   * To get color between color and extension color
   * @param index Integer The index of the element in the array
   * @returns value of target color
   */
  _getColor(index) {
    if (this._loadingOptions.importVertexColors) {
      return this._extColors[index] ?? this._colors[index];
    } else {
      return void 0;
    }
  }
  /**
   * Create triangles and push the data for each polygon for the pattern 1
   * In this pattern we get vertice positions
   * @param face
   * @param v
   */
  _setDataForCurrentFaceWithPattern1(face, v) {
    this._getTriangles(face, v);
    for (let k = 0; k < this._triangles.length; k++) {
      const indicePositionFromObj = parseInt(this._triangles[k]) - 1;
      this._setData(
        indicePositionFromObj,
        0,
        0,
        // In the pattern 1, normals and uvs are not defined
        this._positions[indicePositionFromObj],
        // Get the vectors data
        Vector2.Zero(),
        Vector3.Up(),
        // Create default vectors
        this._getColor(indicePositionFromObj)
      );
    }
    this._triangles.length = 0;
  }
  /**
   * Create triangles and push the data for each polygon for the pattern 2
   * In this pattern we get vertice positions and uvs
   * @param face
   * @param v
   */
  _setDataForCurrentFaceWithPattern2(face, v) {
    this._getTriangles(face, v);
    for (let k = 0; k < this._triangles.length; k++) {
      const point = this._triangles[k].split("/");
      const indicePositionFromObj = parseInt(point[0]) - 1;
      const indiceUvsFromObj = parseInt(point[1]) - 1;
      this._setData(
        indicePositionFromObj,
        indiceUvsFromObj,
        0,
        //Default value for normals
        this._positions[indicePositionFromObj],
        //Get the values for each element
        this._uvs[indiceUvsFromObj] ?? Vector2.Zero(),
        Vector3.Up(),
        //Default value for normals
        this._getColor(indicePositionFromObj)
      );
    }
    this._triangles.length = 0;
  }
  /**
   * Create triangles and push the data for each polygon for the pattern 3
   * In this pattern we get vertice positions, uvs and normals
   * @param face
   * @param v
   */
  _setDataForCurrentFaceWithPattern3(face, v) {
    this._getTriangles(face, v);
    for (let k = 0; k < this._triangles.length; k++) {
      const point = this._triangles[k].split("/");
      const indicePositionFromObj = parseInt(point[0]) - 1;
      const indiceUvsFromObj = parseInt(point[1]) - 1;
      const indiceNormalFromObj = parseInt(point[2]) - 1;
      this._setData(
        indicePositionFromObj,
        indiceUvsFromObj,
        indiceNormalFromObj,
        this._positions[indicePositionFromObj],
        this._uvs[indiceUvsFromObj] ?? Vector2.Zero(),
        this._normals[indiceNormalFromObj] ?? Vector3.Up()
        //Set the vector for each component
      );
    }
    this._triangles.length = 0;
  }
  /**
   * Create triangles and push the data for each polygon for the pattern 4
   * In this pattern we get vertice positions and normals
   * @param face
   * @param v
   */
  _setDataForCurrentFaceWithPattern4(face, v) {
    this._getTriangles(face, v);
    for (let k = 0; k < this._triangles.length; k++) {
      const point = this._triangles[k].split("//");
      const indicePositionFromObj = parseInt(point[0]) - 1;
      const indiceNormalFromObj = parseInt(point[1]) - 1;
      this._setData(
        indicePositionFromObj,
        1,
        //Default value for uv
        indiceNormalFromObj,
        this._positions[indicePositionFromObj],
        //Get each vector of data
        Vector2.Zero(),
        this._normals[indiceNormalFromObj],
        this._getColor(indicePositionFromObj)
      );
    }
    this._triangles.length = 0;
  }
  /*
   * Create triangles and push the data for each polygon for the pattern 3
   * In this pattern we get vertice positions, uvs and normals
   * @param face
   * @param v
   */
  _setDataForCurrentFaceWithPattern5(face, v) {
    this._getTriangles(face, v);
    for (let k = 0; k < this._triangles.length; k++) {
      const point = this._triangles[k].split("/");
      const indicePositionFromObj = this._positions.length + parseInt(point[0]);
      const indiceUvsFromObj = this._uvs.length + parseInt(point[1]);
      const indiceNormalFromObj = this._normals.length + parseInt(point[2]);
      this._setData(
        indicePositionFromObj,
        indiceUvsFromObj,
        indiceNormalFromObj,
        this._positions[indicePositionFromObj],
        this._uvs[indiceUvsFromObj],
        this._normals[indiceNormalFromObj],
        //Set the vector for each component
        this._getColor(indicePositionFromObj)
      );
    }
    this._triangles.length = 0;
  }
  _addPreviousObjMesh() {
    if (this._meshesFromObj.length > 0) {
      this._handledMesh = this._meshesFromObj[this._meshesFromObj.length - 1];
      this._unwrapData();
      if (this._loadingOptions.useLegacyBehavior) {
        this._indicesForBabylon.reverse();
      }
      this._handledMesh.indices = this._indicesForBabylon.slice();
      this._handledMesh.positions = this._unwrappedPositionsForBabylon.slice();
      this._handledMesh.normals = this._unwrappedNormalsForBabylon.slice();
      this._handledMesh.uvs = this._unwrappedUVForBabylon.slice();
      this._handledMesh.hasLines = this._hasLineData;
      if (this._loadingOptions.importVertexColors) {
        this._handledMesh.colors = this._unwrappedColorsForBabylon.slice();
      }
      this._indicesForBabylon.length = 0;
      this._unwrappedPositionsForBabylon.length = 0;
      this._unwrappedColorsForBabylon.length = 0;
      this._unwrappedNormalsForBabylon.length = 0;
      this._unwrappedUVForBabylon.length = 0;
      this._hasLineData = false;
    }
  }
  _optimizeNormals(mesh) {
    const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
    const normals = mesh.getVerticesData(VertexBuffer.NormalKind);
    const mapVertices = {};
    if (!positions || !normals) {
      return;
    }
    for (let i = 0; i < positions.length / 3; i++) {
      const x = positions[i * 3 + 0];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const key = x + "_" + y + "_" + z;
      let lst = mapVertices[key];
      if (!lst) {
        lst = [];
        mapVertices[key] = lst;
      }
      lst.push(i);
    }
    const normal = new Vector3();
    for (const key in mapVertices) {
      const lst = mapVertices[key];
      if (lst.length < 2) {
        continue;
      }
      const v0Idx = lst[0];
      for (let i = 1; i < lst.length; ++i) {
        const vIdx = lst[i];
        normals[v0Idx * 3 + 0] += normals[vIdx * 3 + 0];
        normals[v0Idx * 3 + 1] += normals[vIdx * 3 + 1];
        normals[v0Idx * 3 + 2] += normals[vIdx * 3 + 2];
      }
      normal.copyFromFloats(normals[v0Idx * 3 + 0], normals[v0Idx * 3 + 1], normals[v0Idx * 3 + 2]);
      normal.normalize();
      for (let i = 0; i < lst.length; ++i) {
        const vIdx = lst[i];
        normals[vIdx * 3 + 0] = normal.x;
        normals[vIdx * 3 + 1] = normal.y;
        normals[vIdx * 3 + 2] = normal.z;
      }
    }
    mesh.setVerticesData(VertexBuffer.NormalKind, normals);
  }
  static _IsLineElement(line) {
    return line.startsWith("l");
  }
  static _IsObjectElement(line) {
    return line.startsWith("o");
  }
  static _IsGroupElement(line) {
    return line.startsWith("g");
  }
  static _GetZbrushMRGB(line, notParse) {
    if (!line.startsWith("mrgb"))
      return null;
    line = line.replace("mrgb", "").trim();
    if (notParse)
      return [];
    const regex = /[a-z0-9]/g;
    const regArray = line.match(regex);
    if (!regArray || regArray.length % 8 !== 0) {
      return [];
    }
    const array = [];
    for (let regIndex = 0; regIndex < regArray.length / 8; regIndex++) {
      const r = regArray[regIndex * 8 + 2] + regArray[regIndex * 8 + 3];
      const g = regArray[regIndex * 8 + 4] + regArray[regIndex * 8 + 5];
      const b = regArray[regIndex * 8 + 6] + regArray[regIndex * 8 + 7];
      array.push(new Color4(parseInt(r, 16) / 255, parseInt(g, 16) / 255, parseInt(b, 16) / 255, 1));
    }
    return array;
  }
  /**
   * Function used to parse an OBJ string
   * @param meshesNames defines the list of meshes to load (all if not defined)
   * @param data defines the OBJ string
   * @param scene defines the hosting scene
   * @param assetContainer defines the asset container to load data in
   * @param onFileToLoadFound defines a callback that will be called if a MTL file is found
   */
  parse(meshesNames, data, scene, assetContainer, onFileToLoadFound) {
    var _a;
    data = data.replace(/#MRGB/g, "mrgb");
    data = data.replace(/#.*$/gm, "").trim();
    if (this._loadingOptions.useLegacyBehavior) {
      this._pushTriangle = (faces, faceIndex) => this._triangles.push(faces[0], faces[faceIndex], faces[faceIndex + 1]);
      this._handednessSign = 1;
    } else if (scene.useRightHandedSystem) {
      this._pushTriangle = (faces, faceIndex) => this._triangles.push(faces[0], faces[faceIndex + 1], faces[faceIndex]);
      this._handednessSign = 1;
    } else {
      this._pushTriangle = (faces, faceIndex) => this._triangles.push(faces[0], faces[faceIndex], faces[faceIndex + 1]);
      this._handednessSign = -1;
    }
    const linesOBJ = data.split("\n");
    const lineLines = [];
    let currentGroup = [];
    lineLines.push(currentGroup);
    for (let i = 0; i < linesOBJ.length; i++) {
      const line = linesOBJ[i].trim().replace(/\s\s/g, " ");
      if (line.length === 0 || line.charAt(0) === "#") {
        continue;
      }
      if (SolidParser._IsGroupElement(line) || SolidParser._IsObjectElement(line)) {
        currentGroup = [];
        lineLines.push(currentGroup);
      }
      if (SolidParser._IsLineElement(line)) {
        const lineValues = line.split(" ");
        for (let i2 = 1; i2 < lineValues.length - 1; i2++) {
          currentGroup.push(`l ${lineValues[i2]} ${lineValues[i2 + 1]}`);
        }
      } else {
        currentGroup.push(line);
      }
    }
    const lines = lineLines.flat();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().replace(/\s\s/g, " ");
      let result;
      if (line.length === 0 || line.charAt(0) === "#") {
        continue;
      } else if (SolidParser.VertexPattern.test(line)) {
        result = line.match(/[^ ]+/g);
        this._positions.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])));
        if (this._loadingOptions.importVertexColors) {
          if (result.length >= 7) {
            const r = parseFloat(result[4]);
            const g = parseFloat(result[5]);
            const b = parseFloat(result[6]);
            this._colors.push(new Color4(r > 1 ? r / 255 : r, g > 1 ? g / 255 : g, b > 1 ? b / 255 : b, result.length === 7 || result[7] === void 0 ? 1 : parseFloat(result[7])));
          } else {
            this._colors.push(this._grayColor);
          }
        }
      } else if ((result = SolidParser.NormalPattern.exec(line)) !== null) {
        this._normals.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])));
      } else if ((result = SolidParser.UVPattern.exec(line)) !== null) {
        this._uvs.push(new Vector2(parseFloat(result[1]) * this._loadingOptions.UVScaling.x, parseFloat(result[2]) * this._loadingOptions.UVScaling.y));
      } else if ((result = SolidParser.FacePattern3.exec(line)) !== null) {
        this._setDataForCurrentFaceWithPattern3(
          result[1].trim().split(" "),
          // ["1/1/1", "2/2/2", "3/3/3"]
          1
        );
      } else if ((result = SolidParser.FacePattern4.exec(line)) !== null) {
        this._setDataForCurrentFaceWithPattern4(
          result[1].trim().split(" "),
          // ["1//1", "2//2", "3//3"]
          1
        );
      } else if ((result = SolidParser.FacePattern5.exec(line)) !== null) {
        this._setDataForCurrentFaceWithPattern5(
          result[1].trim().split(" "),
          // ["-1/-1/-1", "-2/-2/-2", "-3/-3/-3"]
          1
        );
      } else if ((result = SolidParser.FacePattern2.exec(line)) !== null) {
        this._setDataForCurrentFaceWithPattern2(
          result[1].trim().split(" "),
          // ["1/1", "2/2", "3/3"]
          1
        );
      } else if ((result = SolidParser.FacePattern1.exec(line)) !== null) {
        this._setDataForCurrentFaceWithPattern1(
          result[1].trim().split(" "),
          // ["1", "2", "3"]
          1
        );
      } else if ((result = SolidParser.LinePattern1.exec(line)) !== null) {
        this._setDataForCurrentFaceWithPattern1(
          result[1].trim().split(" "),
          // ["1", "2"]
          0
        );
        this._hasLineData = true;
      } else if ((result = SolidParser.LinePattern2.exec(line)) !== null) {
        this._setDataForCurrentFaceWithPattern2(
          result[1].trim().split(" "),
          // ["1/1", "2/2"]
          0
        );
        this._hasLineData = true;
      } else if (result = SolidParser._GetZbrushMRGB(line, !this._loadingOptions.importVertexColors)) {
        result.forEach((element) => {
          this._extColors.push(element);
        });
      } else if ((result = SolidParser.LinePattern3.exec(line)) !== null) {
        this._setDataForCurrentFaceWithPattern3(
          result[1].trim().split(" "),
          // ["1/1/1", "2/2/2"]
          0
        );
        this._hasLineData = true;
      } else if (SolidParser.GroupDescriptor.test(line) || SolidParser.ObjectDescriptor.test(line)) {
        const objMesh = {
          name: line.substring(2).trim(),
          //Set the name of the current obj mesh
          indices: null,
          positions: null,
          normals: null,
          uvs: null,
          colors: null,
          materialName: this._materialNameFromObj,
          isObject: SolidParser.ObjectDescriptor.test(line)
        };
        this._addPreviousObjMesh();
        this._meshesFromObj.push(objMesh);
        this._hasMeshes = true;
        this._isFirstMaterial = true;
        this._increment = 1;
      } else if (SolidParser.UseMtlDescriptor.test(line)) {
        this._materialNameFromObj = line.substring(7).trim();
        if (!this._isFirstMaterial || !this._hasMeshes) {
          this._addPreviousObjMesh();
          const objMesh = (
            //Set the name of the current obj mesh
            {
              name: (this._objMeshName || "mesh") + "_mm" + this._increment.toString(),
              //Set the name of the current obj mesh
              indices: null,
              positions: null,
              normals: null,
              uvs: null,
              colors: null,
              materialName: this._materialNameFromObj,
              isObject: false
            }
          );
          this._increment++;
          this._meshesFromObj.push(objMesh);
          this._hasMeshes = true;
        }
        if (this._hasMeshes && this._isFirstMaterial) {
          this._meshesFromObj[this._meshesFromObj.length - 1].materialName = this._materialNameFromObj;
          this._isFirstMaterial = false;
        }
      } else if (SolidParser.MtlLibGroupDescriptor.test(line)) {
        onFileToLoadFound(line.substring(7).trim());
      } else if (SolidParser.SmoothDescriptor.test(line))
        ;
      else {
        Logger.Log("Unhandled expression at line : " + line);
      }
    }
    if (this._hasMeshes) {
      this._handledMesh = this._meshesFromObj[this._meshesFromObj.length - 1];
      if (this._loadingOptions.useLegacyBehavior) {
        this._indicesForBabylon.reverse();
      }
      this._unwrapData();
      this._handledMesh.indices = this._indicesForBabylon;
      this._handledMesh.positions = this._unwrappedPositionsForBabylon;
      this._handledMesh.normals = this._unwrappedNormalsForBabylon;
      this._handledMesh.uvs = this._unwrappedUVForBabylon;
      this._handledMesh.hasLines = this._hasLineData;
      if (this._loadingOptions.importVertexColors) {
        this._handledMesh.colors = this._unwrappedColorsForBabylon;
      }
    }
    if (!this._hasMeshes) {
      let newMaterial = null;
      if (this._indicesForBabylon.length) {
        if (this._loadingOptions.useLegacyBehavior) {
          this._indicesForBabylon.reverse();
        }
        this._unwrapData();
      } else {
        for (const pos of this._positions) {
          this._unwrappedPositionsForBabylon.push(pos.x, pos.y, pos.z);
        }
        if (this._normals.length) {
          for (const normal of this._normals) {
            this._unwrappedNormalsForBabylon.push(normal.x, normal.y, normal.z);
          }
        }
        if (this._uvs.length) {
          for (const uv of this._uvs) {
            this._unwrappedUVForBabylon.push(uv.x, uv.y);
          }
        }
        if (this._extColors.length) {
          for (const color of this._extColors) {
            this._unwrappedColorsForBabylon.push(color.r, color.g, color.b, color.a);
          }
        } else {
          if (this._colors.length) {
            for (const color of this._colors) {
              this._unwrappedColorsForBabylon.push(color.r, color.g, color.b, color.a);
            }
          }
        }
        if (!this._materialNameFromObj) {
          newMaterial = new StandardMaterial(Geometry.RandomId(), scene);
          newMaterial.pointsCloud = true;
          this._materialNameFromObj = newMaterial.name;
          if (!this._normals.length) {
            newMaterial.disableLighting = true;
            newMaterial.emissiveColor = Color3.White();
          }
        }
      }
      this._meshesFromObj.push({
        name: Geometry.RandomId(),
        indices: this._indicesForBabylon,
        positions: this._unwrappedPositionsForBabylon,
        colors: this._unwrappedColorsForBabylon,
        normals: this._unwrappedNormalsForBabylon,
        uvs: this._unwrappedUVForBabylon,
        materialName: this._materialNameFromObj,
        directMaterial: newMaterial,
        isObject: true,
        hasLines: this._hasLineData
      });
    }
    for (let j = 0; j < this._meshesFromObj.length; j++) {
      if (meshesNames && this._meshesFromObj[j].name) {
        if (meshesNames instanceof Array) {
          if (meshesNames.indexOf(this._meshesFromObj[j].name) === -1) {
            continue;
          }
        } else {
          if (this._meshesFromObj[j].name !== meshesNames) {
            continue;
          }
        }
      }
      this._handledMesh = this._meshesFromObj[j];
      scene._blockEntityCollection = !!assetContainer;
      const babylonMesh = new Mesh(this._meshesFromObj[j].name, scene);
      babylonMesh._parentContainer = assetContainer;
      scene._blockEntityCollection = false;
      this._handledMesh._babylonMesh = babylonMesh;
      if (!this._handledMesh.isObject) {
        for (let k = j - 1; k >= 0; --k) {
          if (this._meshesFromObj[k].isObject && this._meshesFromObj[k]._babylonMesh) {
            babylonMesh.parent = this._meshesFromObj[k]._babylonMesh;
            break;
          }
        }
      }
      this._materialToUse.push(this._meshesFromObj[j].materialName);
      if (this._handledMesh.hasLines) {
        babylonMesh._internalMetadata ?? (babylonMesh._internalMetadata = {});
        babylonMesh._internalMetadata["_isLine"] = true;
      }
      if (((_a = this._handledMesh.positions) == null ? void 0 : _a.length) === 0) {
        this._babylonMeshesArray.push(babylonMesh);
        continue;
      }
      const vertexData = new VertexData();
      vertexData.uvs = this._handledMesh.uvs;
      vertexData.indices = this._handledMesh.indices;
      vertexData.positions = this._handledMesh.positions;
      if (this._loadingOptions.computeNormals) {
        const normals = new Array();
        VertexData.ComputeNormals(this._handledMesh.positions, this._handledMesh.indices, normals);
        vertexData.normals = normals;
      } else {
        vertexData.normals = this._handledMesh.normals;
      }
      if (this._loadingOptions.importVertexColors) {
        vertexData.colors = this._handledMesh.colors;
      }
      vertexData.applyToMesh(babylonMesh);
      if (this._loadingOptions.invertY) {
        babylonMesh.scaling.y *= -1;
      }
      if (this._loadingOptions.optimizeNormals) {
        this._optimizeNormals(babylonMesh);
      }
      this._babylonMeshesArray.push(babylonMesh);
      if (this._handledMesh.directMaterial) {
        babylonMesh.material = this._handledMesh.directMaterial;
      }
    }
  }
}
SolidParser.ObjectDescriptor = /^o/;
SolidParser.GroupDescriptor = /^g/;
SolidParser.MtlLibGroupDescriptor = /^mtllib /;
SolidParser.UseMtlDescriptor = /^usemtl /;
SolidParser.SmoothDescriptor = /^s /;
SolidParser.VertexPattern = /^v(\s+[\d|.|+|\-|e|E]+){3,7}/;
SolidParser.NormalPattern = /^vn(\s+[\d|.|+|\-|e|E]+)( +[\d|.|+|\-|e|E]+)( +[\d|.|+|\-|e|E]+)/;
SolidParser.UVPattern = /^vt(\s+[\d|.|+|\-|e|E]+)( +[\d|.|+|\-|e|E]+)/;
SolidParser.FacePattern1 = /^f\s+(([\d]{1,}[\s]?){3,})+/;
SolidParser.FacePattern2 = /^f\s+((([\d]{1,}\/[\d]{1,}[\s]?){3,})+)/;
SolidParser.FacePattern3 = /^f\s+((([\d]{1,}\/[\d]{1,}\/[\d]{1,}[\s]?){3,})+)/;
SolidParser.FacePattern4 = /^f\s+((([\d]{1,}\/\/[\d]{1,}[\s]?){3,})+)/;
SolidParser.FacePattern5 = /^f\s+(((-[\d]{1,}\/-[\d]{1,}\/-[\d]{1,}[\s]?){3,})+)/;
SolidParser.LinePattern1 = /^l\s+(([\d]{1,}[\s]?){2,})+/;
SolidParser.LinePattern2 = /^l\s+((([\d]{1,}\/[\d]{1,}[\s]?){2,})+)/;
SolidParser.LinePattern3 = /^l\s+((([\d]{1,}\/[\d]{1,}\/[\d]{1,}[\s]?){2,})+)/;
class OBJFileLoader {
  /**
   * Invert Y-Axis of referenced textures on load
   */
  static get INVERT_TEXTURE_Y() {
    return MTLFileLoader.INVERT_TEXTURE_Y;
  }
  static set INVERT_TEXTURE_Y(value) {
    MTLFileLoader.INVERT_TEXTURE_Y = value;
  }
  /**
   * Creates loader for .OBJ files
   *
   * @param loadingOptions options for loading and parsing OBJ/MTL files.
   */
  constructor(loadingOptions) {
    this.name = OBJFileLoaderMetadata.name;
    this.extensions = OBJFileLoaderMetadata.extensions;
    this._assetContainer = null;
    this._loadingOptions = { ...OBJFileLoader._DefaultLoadingOptions, ...loadingOptions ?? {} };
  }
  static get _DefaultLoadingOptions() {
    return {
      computeNormals: OBJFileLoader.COMPUTE_NORMALS,
      optimizeNormals: OBJFileLoader.OPTIMIZE_NORMALS,
      importVertexColors: OBJFileLoader.IMPORT_VERTEX_COLORS,
      invertY: OBJFileLoader.INVERT_Y,
      invertTextureY: OBJFileLoader.INVERT_TEXTURE_Y,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      UVScaling: OBJFileLoader.UV_SCALING,
      materialLoadingFailsSilently: OBJFileLoader.MATERIAL_LOADING_FAILS_SILENTLY,
      optimizeWithUV: OBJFileLoader.OPTIMIZE_WITH_UV,
      skipMaterials: OBJFileLoader.SKIP_MATERIALS,
      useLegacyBehavior: OBJFileLoader.USE_LEGACY_BEHAVIOR
    };
  }
  /**
   * Calls synchronously the MTL file attached to this obj.
   * Load function or importMesh function don't enable to load 2 files in the same time asynchronously.
   * Without this function materials are not displayed in the first frame (but displayed after).
   * In consequence it is impossible to get material information in your HTML file
   *
   * @param url The URL of the MTL file
   * @param rootUrl defines where to load data from
   * @param onSuccess Callback function to be called when the MTL file is loaded
   * @param onFailure
   */
  _loadMTL(url, rootUrl, onSuccess, onFailure) {
    const pathOfFile = rootUrl + url;
    Tools.LoadFile(pathOfFile, onSuccess, void 0, void 0, false, (request, exception) => {
      onFailure(pathOfFile, exception);
    });
  }
  /** @internal */
  createPlugin(options) {
    return new OBJFileLoader(options[OBJFileLoaderMetadata.name]);
  }
  /**
   * If the data string can be loaded directly.
   * @returns if the data can be loaded directly
   */
  canDirectLoad() {
    return false;
  }
  /**
   * Imports one or more meshes from the loaded OBJ data and adds them to the scene
   * @param meshesNames a string or array of strings of the mesh names that should be loaded from the file
   * @param scene the scene the meshes should be added to
   * @param data the OBJ data to load
   * @param rootUrl root url to load from
   * @returns a promise containing the loaded meshes, particles, skeletons and animations
   */
  importMeshAsync(meshesNames, scene, data, rootUrl) {
    return this._parseSolid(meshesNames, scene, data, rootUrl).then((meshes) => {
      return {
        meshes,
        particleSystems: [],
        skeletons: [],
        animationGroups: [],
        transformNodes: [],
        geometries: [],
        lights: [],
        spriteManagers: []
      };
    });
  }
  /**
   * Imports all objects from the loaded OBJ data and adds them to the scene
   * @param scene the scene the objects should be added to
   * @param data the OBJ data to load
   * @param rootUrl root url to load from
   * @returns a promise which completes when objects have been loaded to the scene
   */
  loadAsync(scene, data, rootUrl) {
    return this.importMeshAsync(null, scene, data, rootUrl).then(() => {
    });
  }
  /**
   * Load into an asset container.
   * @param scene The scene to load into
   * @param data The data to import
   * @param rootUrl The root url for scene and resources
   * @returns The loaded asset container
   */
  loadAssetContainerAsync(scene, data, rootUrl) {
    const container = new AssetContainer(scene);
    this._assetContainer = container;
    return this.importMeshAsync(null, scene, data, rootUrl).then((result) => {
      result.meshes.forEach((mesh) => container.meshes.push(mesh));
      result.meshes.forEach((mesh) => {
        const material = mesh.material;
        if (material) {
          if (container.materials.indexOf(material) == -1) {
            container.materials.push(material);
            const textures = material.getActiveTextures();
            textures.forEach((t) => {
              if (container.textures.indexOf(t) == -1) {
                container.textures.push(t);
              }
            });
          }
        }
      });
      this._assetContainer = null;
      return container;
    }).catch((ex) => {
      this._assetContainer = null;
      throw ex;
    });
  }
  /**
   * Read the OBJ file and create an Array of meshes.
   * Each mesh contains all information given by the OBJ and the MTL file.
   * i.e. vertices positions and indices, optional normals values, optional UV values, optional material
   * @param meshesNames defines a string or array of strings of the mesh names that should be loaded from the file
   * @param scene defines the scene where are displayed the data
   * @param data defines the content of the obj file
   * @param rootUrl defines the path to the folder
   * @returns the list of loaded meshes
   */
  _parseSolid(meshesNames, scene, data, rootUrl) {
    let fileToLoad = "";
    const materialsFromMTLFile = new MTLFileLoader();
    const materialToUse = [];
    const babylonMeshesArray = [];
    data = data.replace(/#.*$/gm, "").trim();
    const solidParser = new SolidParser(materialToUse, babylonMeshesArray, this._loadingOptions);
    solidParser.parse(meshesNames, data, scene, this._assetContainer, (fileName) => {
      fileToLoad = fileName;
    });
    const mtlPromises = [];
    if (fileToLoad !== "" && !this._loadingOptions.skipMaterials) {
      mtlPromises.push(new Promise((resolve, reject) => {
        this._loadMTL(fileToLoad, rootUrl, (dataLoaded) => {
          try {
            materialsFromMTLFile.parseMTL(scene, dataLoaded, rootUrl, this._assetContainer);
            for (let n = 0; n < materialsFromMTLFile.materials.length; n++) {
              let startIndex = 0;
              const _indices = [];
              let _index;
              while ((_index = materialToUse.indexOf(materialsFromMTLFile.materials[n].name, startIndex)) > -1) {
                _indices.push(_index);
                startIndex = _index + 1;
              }
              if (_index === -1 && _indices.length === 0) {
                materialsFromMTLFile.materials[n].dispose();
              } else {
                for (let o = 0; o < _indices.length; o++) {
                  const mesh = babylonMeshesArray[_indices[o]];
                  const material = materialsFromMTLFile.materials[n];
                  mesh.material = material;
                  if (!mesh.getTotalIndices()) {
                    material.pointsCloud = true;
                  }
                }
              }
            }
            resolve();
          } catch (e) {
            Tools.Warn(`Error processing MTL file: '${fileToLoad}'`);
            if (this._loadingOptions.materialLoadingFailsSilently) {
              resolve();
            } else {
              reject(e);
            }
          }
        }, (pathOfFile, exception) => {
          Tools.Warn(`Error downloading MTL file: '${fileToLoad}'`);
          if (this._loadingOptions.materialLoadingFailsSilently) {
            resolve();
          } else {
            reject(exception);
          }
        });
      }));
    }
    return Promise.all(mtlPromises).then(() => {
      const isLine = (mesh) => {
        var _a;
        return Boolean(((_a = mesh._internalMetadata) == null ? void 0 : _a["_isLine"]) ?? false);
      };
      babylonMeshesArray.forEach((mesh) => {
        if (isLine(mesh)) {
          let mat = mesh.material ?? new StandardMaterial(mesh.name + "_line", scene);
          const needClone = mat.getBindedMeshes().filter((e) => !isLine(e)).length > 0;
          if (needClone) {
            mat = mat.clone(mat.name + "_line") ?? mat;
          }
          mat.wireframe = true;
          mesh.material = mat;
          if (mesh._internalMetadata) {
            mesh._internalMetadata["_isLine"] = void 0;
          }
        }
      });
      return babylonMeshesArray;
    });
  }
}
OBJFileLoader.OPTIMIZE_WITH_UV = true;
OBJFileLoader.INVERT_Y = false;
OBJFileLoader.IMPORT_VERTEX_COLORS = false;
OBJFileLoader.COMPUTE_NORMALS = false;
OBJFileLoader.OPTIMIZE_NORMALS = false;
OBJFileLoader.UV_SCALING = new Vector2(1, 1);
OBJFileLoader.SKIP_MATERIALS = false;
OBJFileLoader.MATERIAL_LOADING_FAILS_SILENTLY = true;
OBJFileLoader.USE_LEGACY_BEHAVIOR = false;
RegisterSceneLoaderPlugin(new OBJFileLoader());
export {
  OBJFileLoader
};
