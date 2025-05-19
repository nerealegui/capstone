import { aH as Epsilon, V as Vector3, aI as IntersectionInfo, a as TmpVectors, M as Matrix, ak as EngineStore, k as BuildArray, aJ as PickingInfo, aK as _ImportHelper, aL as Camera, p as Scene } from "./index.B4f7kVg_.js";
const PickingCustomization = {
  internalPickerForMesh: void 0
};
class Ray {
  /**
   * Creates a new ray
   * @param origin origin point
   * @param direction direction
   * @param length length of the ray
   * @param epsilon The epsilon value to use when calculating the ray/triangle intersection (default: Epsilon from math constants)
   */
  constructor(origin, direction, length = Number.MAX_VALUE, epsilon = Epsilon) {
    this.origin = origin;
    this.direction = direction;
    this.length = length;
    this.epsilon = epsilon;
  }
  // Methods
  /**
   * Clone the current ray
   * @returns a new ray
   */
  clone() {
    return new Ray(this.origin.clone(), this.direction.clone(), this.length);
  }
  /**
   * Checks if the ray intersects a box
   * This does not account for the ray length by design to improve perfs.
   * @param minimum bound of the box
   * @param maximum bound of the box
   * @param intersectionTreshold extra extend to be added to the box in all direction
   * @returns if the box was hit
   */
  intersectsBoxMinMax(minimum, maximum, intersectionTreshold = 0) {
    const newMinimum = Ray._TmpVector3[0].copyFromFloats(minimum.x - intersectionTreshold, minimum.y - intersectionTreshold, minimum.z - intersectionTreshold);
    const newMaximum = Ray._TmpVector3[1].copyFromFloats(maximum.x + intersectionTreshold, maximum.y + intersectionTreshold, maximum.z + intersectionTreshold);
    let d = 0;
    let maxValue = Number.MAX_VALUE;
    let inv;
    let min;
    let max;
    let temp;
    if (Math.abs(this.direction.x) < 1e-7) {
      if (this.origin.x < newMinimum.x || this.origin.x > newMaximum.x) {
        return false;
      }
    } else {
      inv = 1 / this.direction.x;
      min = (newMinimum.x - this.origin.x) * inv;
      max = (newMaximum.x - this.origin.x) * inv;
      if (max === -Infinity) {
        max = Infinity;
      }
      if (min > max) {
        temp = min;
        min = max;
        max = temp;
      }
      d = Math.max(min, d);
      maxValue = Math.min(max, maxValue);
      if (d > maxValue) {
        return false;
      }
    }
    if (Math.abs(this.direction.y) < 1e-7) {
      if (this.origin.y < newMinimum.y || this.origin.y > newMaximum.y) {
        return false;
      }
    } else {
      inv = 1 / this.direction.y;
      min = (newMinimum.y - this.origin.y) * inv;
      max = (newMaximum.y - this.origin.y) * inv;
      if (max === -Infinity) {
        max = Infinity;
      }
      if (min > max) {
        temp = min;
        min = max;
        max = temp;
      }
      d = Math.max(min, d);
      maxValue = Math.min(max, maxValue);
      if (d > maxValue) {
        return false;
      }
    }
    if (Math.abs(this.direction.z) < 1e-7) {
      if (this.origin.z < newMinimum.z || this.origin.z > newMaximum.z) {
        return false;
      }
    } else {
      inv = 1 / this.direction.z;
      min = (newMinimum.z - this.origin.z) * inv;
      max = (newMaximum.z - this.origin.z) * inv;
      if (max === -Infinity) {
        max = Infinity;
      }
      if (min > max) {
        temp = min;
        min = max;
        max = temp;
      }
      d = Math.max(min, d);
      maxValue = Math.min(max, maxValue);
      if (d > maxValue) {
        return false;
      }
    }
    return true;
  }
  /**
   * Checks if the ray intersects a box
   * This does not account for the ray lenght by design to improve perfs.
   * @param box the bounding box to check
   * @param intersectionTreshold extra extend to be added to the BoundingBox in all direction
   * @returns if the box was hit
   */
  intersectsBox(box, intersectionTreshold = 0) {
    return this.intersectsBoxMinMax(box.minimum, box.maximum, intersectionTreshold);
  }
  /**
   * If the ray hits a sphere
   * @param sphere the bounding sphere to check
   * @param intersectionTreshold extra extend to be added to the BoundingSphere in all direction
   * @returns true if it hits the sphere
   */
  intersectsSphere(sphere, intersectionTreshold = 0) {
    const x = sphere.center.x - this.origin.x;
    const y = sphere.center.y - this.origin.y;
    const z = sphere.center.z - this.origin.z;
    const pyth = x * x + y * y + z * z;
    const radius = sphere.radius + intersectionTreshold;
    const rr = radius * radius;
    if (pyth <= rr) {
      return true;
    }
    const dot = x * this.direction.x + y * this.direction.y + z * this.direction.z;
    if (dot < 0) {
      return false;
    }
    const temp = pyth - dot * dot;
    return temp <= rr;
  }
  /**
   * If the ray hits a triange
   * @param vertex0 triangle vertex
   * @param vertex1 triangle vertex
   * @param vertex2 triangle vertex
   * @returns intersection information if hit
   */
  intersectsTriangle(vertex0, vertex1, vertex2) {
    const edge1 = Ray._TmpVector3[0];
    const edge2 = Ray._TmpVector3[1];
    const pvec = Ray._TmpVector3[2];
    const tvec = Ray._TmpVector3[3];
    const qvec = Ray._TmpVector3[4];
    vertex1.subtractToRef(vertex0, edge1);
    vertex2.subtractToRef(vertex0, edge2);
    Vector3.CrossToRef(this.direction, edge2, pvec);
    const det = Vector3.Dot(edge1, pvec);
    if (det === 0) {
      return null;
    }
    const invdet = 1 / det;
    this.origin.subtractToRef(vertex0, tvec);
    const bv = Vector3.Dot(tvec, pvec) * invdet;
    if (bv < -this.epsilon || bv > 1 + this.epsilon) {
      return null;
    }
    Vector3.CrossToRef(tvec, edge1, qvec);
    const bw = Vector3.Dot(this.direction, qvec) * invdet;
    if (bw < -this.epsilon || bv + bw > 1 + this.epsilon) {
      return null;
    }
    const distance = Vector3.Dot(edge2, qvec) * invdet;
    if (distance > this.length) {
      return null;
    }
    return new IntersectionInfo(1 - bv - bw, bv, distance);
  }
  /**
   * Checks if ray intersects a plane
   * @param plane the plane to check
   * @returns the distance away it was hit
   */
  intersectsPlane(plane) {
    let distance;
    const result1 = Vector3.Dot(plane.normal, this.direction);
    if (Math.abs(result1) < 999999997475243e-21) {
      return null;
    } else {
      const result2 = Vector3.Dot(plane.normal, this.origin);
      distance = (-plane.d - result2) / result1;
      if (distance < 0) {
        if (distance < -999999997475243e-21) {
          return null;
        } else {
          return 0;
        }
      }
      return distance;
    }
  }
  /**
   * Calculate the intercept of a ray on a given axis
   * @param axis to check 'x' | 'y' | 'z'
   * @param offset from axis interception (i.e. an offset of 1y is intercepted above ground)
   * @returns a vector containing the coordinates where 'axis' is equal to zero (else offset), or null if there is no intercept.
   */
  intersectsAxis(axis, offset = 0) {
    switch (axis) {
      case "y": {
        const t = (this.origin.y - offset) / this.direction.y;
        if (t > 0) {
          return null;
        }
        return new Vector3(this.origin.x + this.direction.x * -t, offset, this.origin.z + this.direction.z * -t);
      }
      case "x": {
        const t = (this.origin.x - offset) / this.direction.x;
        if (t > 0) {
          return null;
        }
        return new Vector3(offset, this.origin.y + this.direction.y * -t, this.origin.z + this.direction.z * -t);
      }
      case "z": {
        const t = (this.origin.z - offset) / this.direction.z;
        if (t > 0) {
          return null;
        }
        return new Vector3(this.origin.x + this.direction.x * -t, this.origin.y + this.direction.y * -t, offset);
      }
      default:
        return null;
    }
  }
  /**
   * Checks if ray intersects a mesh. The ray is defined in WORLD space. A mesh triangle can be picked both from its front and back sides,
   * irrespective of orientation.
   * @param mesh the mesh to check
   * @param fastCheck defines if the first intersection will be used (and not the closest)
   * @param trianglePredicate defines an optional predicate used to select faces when a mesh intersection is detected
   * @param onlyBoundingInfo defines a boolean indicating if picking should only happen using bounding info (false by default)
   * @param worldToUse defines the world matrix to use to get the world coordinate of the intersection point
   * @param skipBoundingInfo a boolean indicating if we should skip the bounding info check
   * @returns picking info of the intersection
   */
  intersectsMesh(mesh, fastCheck, trianglePredicate, onlyBoundingInfo = false, worldToUse, skipBoundingInfo = false) {
    const tm = TmpVectors.Matrix[0];
    mesh.getWorldMatrix().invertToRef(tm);
    if (this._tmpRay) {
      Ray.TransformToRef(this, tm, this._tmpRay);
    } else {
      this._tmpRay = Ray.Transform(this, tm);
    }
    return mesh.intersects(this._tmpRay, fastCheck, trianglePredicate, onlyBoundingInfo, worldToUse, skipBoundingInfo);
  }
  /**
   * Checks if ray intersects a mesh
   * @param meshes the meshes to check
   * @param fastCheck defines if the first intersection will be used (and not the closest)
   * @param results array to store result in
   * @returns Array of picking infos
   */
  intersectsMeshes(meshes, fastCheck, results) {
    if (results) {
      results.length = 0;
    } else {
      results = [];
    }
    for (let i = 0; i < meshes.length; i++) {
      const pickInfo = this.intersectsMesh(meshes[i], fastCheck);
      if (pickInfo.hit) {
        results.push(pickInfo);
      }
    }
    results.sort(this._comparePickingInfo);
    return results;
  }
  _comparePickingInfo(pickingInfoA, pickingInfoB) {
    if (pickingInfoA.distance < pickingInfoB.distance) {
      return -1;
    } else if (pickingInfoA.distance > pickingInfoB.distance) {
      return 1;
    } else {
      return 0;
    }
  }
  /**
   * Intersection test between the ray and a given segment within a given tolerance (threshold)
   * @param sega the first point of the segment to test the intersection against
   * @param segb the second point of the segment to test the intersection against
   * @param threshold the tolerance margin, if the ray doesn't intersect the segment but is close to the given threshold, the intersection is successful
   * @returns the distance from the ray origin to the intersection point if there's intersection, or -1 if there's no intersection
   */
  intersectionSegment(sega, segb, threshold) {
    const o = this.origin;
    const u = TmpVectors.Vector3[0];
    const rsegb = TmpVectors.Vector3[1];
    const v = TmpVectors.Vector3[2];
    const w = TmpVectors.Vector3[3];
    segb.subtractToRef(sega, u);
    this.direction.scaleToRef(Ray._Rayl, v);
    o.addToRef(v, rsegb);
    sega.subtractToRef(o, w);
    const a = Vector3.Dot(u, u);
    const b = Vector3.Dot(u, v);
    const c = Vector3.Dot(v, v);
    const d = Vector3.Dot(u, w);
    const e = Vector3.Dot(v, w);
    const D = a * c - b * b;
    let sN, sD = D;
    let tN, tD = D;
    if (D < Ray._Smallnum) {
      sN = 0;
      sD = 1;
      tN = e;
      tD = c;
    } else {
      sN = b * e - c * d;
      tN = a * e - b * d;
      if (sN < 0) {
        sN = 0;
        tN = e;
        tD = c;
      } else if (sN > sD) {
        sN = sD;
        tN = e + b;
        tD = c;
      }
    }
    if (tN < 0) {
      tN = 0;
      if (-d < 0) {
        sN = 0;
      } else if (-d > a) {
        sN = sD;
      } else {
        sN = -d;
        sD = a;
      }
    } else if (tN > tD) {
      tN = tD;
      if (-d + b < 0) {
        sN = 0;
      } else if (-d + b > a) {
        sN = sD;
      } else {
        sN = -d + b;
        sD = a;
      }
    }
    const sc = Math.abs(sN) < Ray._Smallnum ? 0 : sN / sD;
    const tc = Math.abs(tN) < Ray._Smallnum ? 0 : tN / tD;
    const qtc = TmpVectors.Vector3[4];
    v.scaleToRef(tc, qtc);
    const qsc = TmpVectors.Vector3[5];
    u.scaleToRef(sc, qsc);
    qsc.addInPlace(w);
    const dP = TmpVectors.Vector3[6];
    qsc.subtractToRef(qtc, dP);
    const isIntersected = tc > 0 && tc <= this.length && dP.lengthSquared() < threshold * threshold;
    if (isIntersected) {
      return qsc.length();
    }
    return -1;
  }
  /**
   * Update the ray from viewport position
   * @param x position
   * @param y y position
   * @param viewportWidth viewport width
   * @param viewportHeight viewport height
   * @param world world matrix
   * @param view view matrix
   * @param projection projection matrix
   * @param enableDistantPicking defines if picking should handle large values for mesh position/scaling (false by default)
   * @returns this ray updated
   */
  update(x, y, viewportWidth, viewportHeight, world, view, projection, enableDistantPicking = false) {
    if (enableDistantPicking) {
      if (!Ray._RayDistant) {
        Ray._RayDistant = Ray.Zero();
      }
      Ray._RayDistant.unprojectRayToRef(x, y, viewportWidth, viewportHeight, Matrix.IdentityReadOnly, view, projection);
      const tm = TmpVectors.Matrix[0];
      world.invertToRef(tm);
      Ray.TransformToRef(Ray._RayDistant, tm, this);
    } else {
      this.unprojectRayToRef(x, y, viewportWidth, viewportHeight, world, view, projection);
    }
    return this;
  }
  // Statics
  /**
   * Creates a ray with origin and direction of 0,0,0
   * @returns the new ray
   */
  static Zero() {
    return new Ray(Vector3.Zero(), Vector3.Zero());
  }
  /**
   * Creates a new ray from screen space and viewport
   * @param x position
   * @param y y position
   * @param viewportWidth viewport width
   * @param viewportHeight viewport height
   * @param world world matrix
   * @param view view matrix
   * @param projection projection matrix
   * @returns new ray
   */
  static CreateNew(x, y, viewportWidth, viewportHeight, world, view, projection) {
    const result = Ray.Zero();
    return result.update(x, y, viewportWidth, viewportHeight, world, view, projection);
  }
  /**
   * Function will create a new transformed ray starting from origin and ending at the end point. Ray's length will be set, and ray will be
   * transformed to the given world matrix.
   * @param origin The origin point
   * @param end The end point
   * @param world a matrix to transform the ray to. Default is the identity matrix.
   * @returns the new ray
   */
  static CreateNewFromTo(origin, end, world = Matrix.IdentityReadOnly) {
    const result = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
    return Ray.CreateFromToToRef(origin, end, result, world);
  }
  /**
   * Function will update a transformed ray starting from origin and ending at the end point. Ray's length will be set, and ray will be
   * transformed to the given world matrix.
   * @param origin The origin point
   * @param end The end point
   * @param result the object to store the result
   * @param world a matrix to transform the ray to. Default is the identity matrix.
   * @returns the ref ray
   */
  static CreateFromToToRef(origin, end, result, world = Matrix.IdentityReadOnly) {
    result.origin.copyFrom(origin);
    const direction = end.subtractToRef(origin, result.direction);
    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
    result.length = length;
    result.direction.normalize();
    return Ray.TransformToRef(result, world, result);
  }
  /**
   * Transforms a ray by a matrix
   * @param ray ray to transform
   * @param matrix matrix to apply
   * @returns the resulting new ray
   */
  static Transform(ray, matrix) {
    const result = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
    Ray.TransformToRef(ray, matrix, result);
    return result;
  }
  /**
   * Transforms a ray by a matrix
   * @param ray ray to transform
   * @param matrix matrix to apply
   * @param result ray to store result in
   * @returns the updated result ray
   */
  static TransformToRef(ray, matrix, result) {
    Vector3.TransformCoordinatesToRef(ray.origin, matrix, result.origin);
    Vector3.TransformNormalToRef(ray.direction, matrix, result.direction);
    result.length = ray.length;
    result.epsilon = ray.epsilon;
    const dir = result.direction;
    const len = dir.length();
    if (!(len === 0 || len === 1)) {
      const num = 1 / len;
      dir.x *= num;
      dir.y *= num;
      dir.z *= num;
      result.length *= len;
    }
    return result;
  }
  /**
   * Unproject a ray from screen space to object space
   * @param sourceX defines the screen space x coordinate to use
   * @param sourceY defines the screen space y coordinate to use
   * @param viewportWidth defines the current width of the viewport
   * @param viewportHeight defines the current height of the viewport
   * @param world defines the world matrix to use (can be set to Identity to go to world space)
   * @param view defines the view matrix to use
   * @param projection defines the projection matrix to use
   */
  unprojectRayToRef(sourceX, sourceY, viewportWidth, viewportHeight, world, view, projection) {
    const matrix = TmpVectors.Matrix[0];
    world.multiplyToRef(view, matrix);
    matrix.multiplyToRef(projection, matrix);
    matrix.invert();
    const engine = EngineStore.LastCreatedEngine;
    const nearScreenSource = TmpVectors.Vector3[0];
    nearScreenSource.x = sourceX / viewportWidth * 2 - 1;
    nearScreenSource.y = -(sourceY / viewportHeight * 2 - 1);
    nearScreenSource.z = (engine == null ? void 0 : engine.useReverseDepthBuffer) ? 1 : (engine == null ? void 0 : engine.isNDCHalfZRange) ? 0 : -1;
    const farScreenSource = TmpVectors.Vector3[1].copyFromFloats(nearScreenSource.x, nearScreenSource.y, 1 - 1e-8);
    const nearVec3 = TmpVectors.Vector3[2];
    const farVec3 = TmpVectors.Vector3[3];
    Vector3._UnprojectFromInvertedMatrixToRef(nearScreenSource, matrix, nearVec3);
    Vector3._UnprojectFromInvertedMatrixToRef(farScreenSource, matrix, farVec3);
    this.origin.copyFrom(nearVec3);
    farVec3.subtractToRef(nearVec3, this.direction);
    this.direction.normalize();
  }
}
Ray._TmpVector3 = BuildArray(6, Vector3.Zero);
Ray._RayDistant = Ray.Zero();
Ray._Smallnum = 1e-8;
Ray._Rayl = 1e9;
function CreatePickingRay(scene, x, y, world, camera, cameraViewSpace = false) {
  const result = Ray.Zero();
  CreatePickingRayToRef(scene, x, y, world, result, camera, cameraViewSpace);
  return result;
}
function CreatePickingRayToRef(scene, x, y, world, result, camera, cameraViewSpace = false, enableDistantPicking = false) {
  const engine = scene.getEngine();
  if (!camera && !(camera = scene.activeCamera)) {
    return scene;
  }
  const cameraViewport = camera.viewport;
  const renderHeight = engine.getRenderHeight();
  const { x: vx, y: vy, width, height } = cameraViewport.toGlobal(engine.getRenderWidth(), renderHeight);
  const levelInv = 1 / engine.getHardwareScalingLevel();
  x = x * levelInv - vx;
  y = y * levelInv - (renderHeight - vy - height);
  result.update(x, y, width, height, world ? world : Matrix.IdentityReadOnly, cameraViewSpace ? Matrix.IdentityReadOnly : camera.getViewMatrix(), camera.getProjectionMatrix(), enableDistantPicking);
  return scene;
}
function CreatePickingRayInCameraSpace(scene, x, y, camera) {
  const result = Ray.Zero();
  CreatePickingRayInCameraSpaceToRef(scene, x, y, result, camera);
  return result;
}
function CreatePickingRayInCameraSpaceToRef(scene, x, y, result, camera) {
  if (!PickingInfo) {
    return scene;
  }
  const engine = scene.getEngine();
  if (!camera && !(camera = scene.activeCamera)) {
    throw new Error("Active camera not set");
  }
  const cameraViewport = camera.viewport;
  const renderHeight = engine.getRenderHeight();
  const { x: vx, y: vy, width, height } = cameraViewport.toGlobal(engine.getRenderWidth(), renderHeight);
  const identity = Matrix.Identity();
  const levelInv = 1 / engine.getHardwareScalingLevel();
  x = x * levelInv - vx;
  y = y * levelInv - (renderHeight - vy - height);
  result.update(x, y, width, height, identity, identity, camera.getProjectionMatrix());
  return scene;
}
function InternalPickForMesh(pickingInfo, rayFunction, mesh, world, fastCheck, onlyBoundingInfo, trianglePredicate, skipBoundingInfo) {
  const ray = rayFunction(world, mesh.enableDistantPicking);
  const result = mesh.intersects(ray, fastCheck, trianglePredicate, onlyBoundingInfo, world, skipBoundingInfo);
  if (!result || !result.hit) {
    return null;
  }
  if (!fastCheck && pickingInfo != null && result.distance >= pickingInfo.distance) {
    return null;
  }
  return result;
}
function InternalPick(scene, rayFunction, predicate, fastCheck, onlyBoundingInfo, trianglePredicate) {
  let pickingInfo = null;
  const computeWorldMatrixForCamera = !!(scene.activeCameras && scene.activeCameras.length > 1 && scene.cameraToUseForPointers !== scene.activeCamera);
  const currentCamera = scene.cameraToUseForPointers || scene.activeCamera;
  const picker = PickingCustomization.internalPickerForMesh || InternalPickForMesh;
  for (let meshIndex = 0; meshIndex < scene.meshes.length; meshIndex++) {
    const mesh = scene.meshes[meshIndex];
    if (predicate) {
      if (!predicate(mesh, -1)) {
        continue;
      }
    } else if (!mesh.isEnabled() || !mesh.isVisible || !mesh.isPickable) {
      continue;
    }
    const forceCompute = computeWorldMatrixForCamera && mesh.isWorldMatrixCameraDependent();
    const world = mesh.computeWorldMatrix(forceCompute, currentCamera);
    if (mesh.hasThinInstances && mesh.thinInstanceEnablePicking) {
      const result = picker(pickingInfo, rayFunction, mesh, world, true, true, trianglePredicate);
      if (result) {
        if (onlyBoundingInfo) {
          return result;
        }
        const tmpMatrix = TmpVectors.Matrix[1];
        const thinMatrices = mesh.thinInstanceGetWorldMatrices();
        for (let index = 0; index < thinMatrices.length; index++) {
          if (predicate && !predicate(mesh, index)) {
            continue;
          }
          const thinMatrix = thinMatrices[index];
          thinMatrix.multiplyToRef(world, tmpMatrix);
          const result2 = picker(pickingInfo, rayFunction, mesh, tmpMatrix, fastCheck, onlyBoundingInfo, trianglePredicate, true);
          if (result2) {
            pickingInfo = result2;
            pickingInfo.thinInstanceIndex = index;
            if (fastCheck) {
              return pickingInfo;
            }
          }
        }
      }
    } else {
      const result = picker(pickingInfo, rayFunction, mesh, world, fastCheck, onlyBoundingInfo, trianglePredicate);
      if (result) {
        pickingInfo = result;
        if (fastCheck) {
          return pickingInfo;
        }
      }
    }
  }
  return pickingInfo || new PickingInfo();
}
function InternalMultiPick(scene, rayFunction, predicate, trianglePredicate) {
  if (!PickingInfo) {
    return null;
  }
  const pickingInfos = [];
  const computeWorldMatrixForCamera = !!(scene.activeCameras && scene.activeCameras.length > 1 && scene.cameraToUseForPointers !== scene.activeCamera);
  const currentCamera = scene.cameraToUseForPointers || scene.activeCamera;
  const picker = PickingCustomization.internalPickerForMesh || InternalPickForMesh;
  for (let meshIndex = 0; meshIndex < scene.meshes.length; meshIndex++) {
    const mesh = scene.meshes[meshIndex];
    if (predicate) {
      if (!predicate(mesh, -1)) {
        continue;
      }
    } else if (!mesh.isEnabled() || !mesh.isVisible || !mesh.isPickable) {
      continue;
    }
    const forceCompute = computeWorldMatrixForCamera && mesh.isWorldMatrixCameraDependent();
    const world = mesh.computeWorldMatrix(forceCompute, currentCamera);
    if (mesh.hasThinInstances && mesh.thinInstanceEnablePicking) {
      const result = picker(null, rayFunction, mesh, world, true, true, trianglePredicate);
      if (result) {
        const tmpMatrix = TmpVectors.Matrix[1];
        const thinMatrices = mesh.thinInstanceGetWorldMatrices();
        for (let index = 0; index < thinMatrices.length; index++) {
          if (predicate && !predicate(mesh, index)) {
            continue;
          }
          const thinMatrix = thinMatrices[index];
          thinMatrix.multiplyToRef(world, tmpMatrix);
          const result2 = picker(null, rayFunction, mesh, tmpMatrix, false, false, trianglePredicate, true);
          if (result2) {
            result2.thinInstanceIndex = index;
            pickingInfos.push(result2);
          }
        }
      }
    } else {
      const result = picker(null, rayFunction, mesh, world, false, false, trianglePredicate);
      if (result) {
        pickingInfos.push(result);
      }
    }
  }
  return pickingInfos;
}
function PickWithBoundingInfo(scene, x, y, predicate, fastCheck, camera) {
  if (!PickingInfo) {
    return null;
  }
  const result = InternalPick(scene, (world) => {
    if (!scene._tempPickingRay) {
      scene._tempPickingRay = Ray.Zero();
    }
    CreatePickingRayToRef(scene, x, y, world, scene._tempPickingRay, camera || null);
    return scene._tempPickingRay;
  }, predicate, fastCheck, true);
  if (result) {
    result.ray = CreatePickingRay(scene, x, y, Matrix.Identity(), camera || null);
  }
  return result;
}
function Pick(scene, x, y, predicate, fastCheck, camera, trianglePredicate, _enableDistantPicking = false) {
  const result = InternalPick(scene, (world, enableDistantPicking) => {
    if (!scene._tempPickingRay) {
      scene._tempPickingRay = Ray.Zero();
    }
    CreatePickingRayToRef(scene, x, y, world, scene._tempPickingRay, camera || null, false, enableDistantPicking);
    return scene._tempPickingRay;
  }, predicate, fastCheck, false, trianglePredicate);
  if (result) {
    result.ray = CreatePickingRay(scene, x, y, Matrix.Identity(), camera || null);
  }
  return result;
}
function PickWithRay(scene, ray, predicate, fastCheck, trianglePredicate) {
  const result = InternalPick(scene, (world) => {
    if (!scene._pickWithRayInverseMatrix) {
      scene._pickWithRayInverseMatrix = Matrix.Identity();
    }
    world.invertToRef(scene._pickWithRayInverseMatrix);
    if (!scene._cachedRayForTransform) {
      scene._cachedRayForTransform = Ray.Zero();
    }
    Ray.TransformToRef(ray, scene._pickWithRayInverseMatrix, scene._cachedRayForTransform);
    return scene._cachedRayForTransform;
  }, predicate, fastCheck, false, trianglePredicate);
  if (result) {
    result.ray = ray;
  }
  return result;
}
function MultiPick(scene, x, y, predicate, camera, trianglePredicate) {
  return InternalMultiPick(scene, (world) => CreatePickingRay(scene, x, y, world, camera || null), predicate, trianglePredicate);
}
function MultiPickWithRay(scene, ray, predicate, trianglePredicate) {
  return InternalMultiPick(scene, (world) => {
    if (!scene._pickWithRayInverseMatrix) {
      scene._pickWithRayInverseMatrix = Matrix.Identity();
    }
    world.invertToRef(scene._pickWithRayInverseMatrix);
    if (!scene._cachedRayForTransform) {
      scene._cachedRayForTransform = Ray.Zero();
    }
    Ray.TransformToRef(ray, scene._pickWithRayInverseMatrix, scene._cachedRayForTransform);
    return scene._cachedRayForTransform;
  }, predicate, trianglePredicate);
}
function GetForwardRay(camera, length = 100, transform, origin) {
  return GetForwardRayToRef(camera, new Ray(Vector3.Zero(), Vector3.Zero(), length), length, transform, origin);
}
function GetForwardRayToRef(camera, refRay, length = 100, transform, origin) {
  if (!transform) {
    transform = camera.getWorldMatrix();
  }
  refRay.length = length;
  if (origin) {
    refRay.origin.copyFrom(origin);
  } else {
    refRay.origin.copyFrom(camera.position);
  }
  const forward = TmpVectors.Vector3[2];
  forward.set(0, 0, camera._scene.useRightHandedSystem ? -1 : 1);
  const worldForward = TmpVectors.Vector3[3];
  Vector3.TransformNormalToRef(forward, transform, worldForward);
  Vector3.NormalizeToRef(worldForward, refRay.direction);
  return refRay;
}
function AddRayExtensions(sceneClass, cameraClass) {
  if (cameraClass) {
    cameraClass.prototype.getForwardRay = function(length = 100, transform, origin) {
      return GetForwardRayToRef(this, new Ray(Vector3.Zero(), Vector3.Zero(), length), length, transform, origin);
    };
    cameraClass.prototype.getForwardRayToRef = function(refRay, length = 100, transform, origin) {
      return GetForwardRayToRef(this, refRay, length, transform, origin);
    };
  }
  if (!sceneClass) {
    return;
  }
  _ImportHelper._IsPickingAvailable = true;
  sceneClass.prototype.createPickingRay = function(x, y, world, camera, cameraViewSpace = false) {
    return CreatePickingRay(this, x, y, world, camera, cameraViewSpace);
  };
}
AddRayExtensions(Scene, Camera);
Scene.prototype.createPickingRayToRef = function(x, y, world, result, camera, cameraViewSpace = false, enableDistantPicking = false) {
  return CreatePickingRayToRef(this, x, y, world, result, camera, cameraViewSpace, enableDistantPicking);
};
Scene.prototype.createPickingRayInCameraSpace = function(x, y, camera) {
  return CreatePickingRayInCameraSpace(this, x, y, camera);
};
Scene.prototype.createPickingRayInCameraSpaceToRef = function(x, y, result, camera) {
  return CreatePickingRayInCameraSpaceToRef(this, x, y, result, camera);
};
Scene.prototype.pickWithBoundingInfo = function(x, y, predicate, fastCheck, camera) {
  return PickWithBoundingInfo(this, x, y, predicate, fastCheck, camera);
};
Scene.prototype.pick = function(x, y, predicate, fastCheck, camera, trianglePredicate, _enableDistantPicking = false) {
  return Pick(this, x, y, predicate, fastCheck, camera, trianglePredicate, _enableDistantPicking);
};
Scene.prototype.pickWithRay = function(ray, predicate, fastCheck, trianglePredicate) {
  return PickWithRay(this, ray, predicate, fastCheck, trianglePredicate);
};
Scene.prototype.multiPick = function(x, y, predicate, camera, trianglePredicate) {
  return MultiPick(this, x, y, predicate, camera, trianglePredicate);
};
Scene.prototype.multiPickWithRay = function(ray, predicate, trianglePredicate) {
  return MultiPickWithRay(this, ray, predicate, trianglePredicate);
};
export {
  AddRayExtensions,
  CreatePickingRay,
  CreatePickingRayInCameraSpace,
  CreatePickingRayInCameraSpaceToRef,
  CreatePickingRayToRef,
  GetForwardRay,
  GetForwardRayToRef,
  MultiPick,
  MultiPickWithRay,
  Pick,
  PickWithBoundingInfo,
  PickWithRay,
  PickingCustomization,
  Ray
};
