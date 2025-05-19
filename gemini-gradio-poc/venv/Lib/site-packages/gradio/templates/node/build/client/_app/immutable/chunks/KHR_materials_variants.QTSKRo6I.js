import { GLTFLoader, ArrayItem } from "./glTFLoader.D0mNbVQS.js";
import { ab as Mesh, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
const NAME = "KHR_materials_variants";
class KHR_materials_variants {
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
  }
  /**
   * Gets the list of available variant names for this asset.
   * @param rootNode The glTF root node
   * @returns the list of all the variant names for this model
   */
  static GetAvailableVariants(rootNode) {
    const extensionMetadata = this._GetExtensionMetadata(rootNode);
    if (!extensionMetadata) {
      return [];
    }
    return Object.keys(extensionMetadata.variants);
  }
  /**
   * Gets the list of available variant names for this asset.
   * @param rootNode The glTF root node
   * @returns the list of all the variant names for this model
   */
  getAvailableVariants(rootNode) {
    return KHR_materials_variants.GetAvailableVariants(rootNode);
  }
  /**
   * Select a variant given a variant name or a list of variant names.
   * @param rootNode The glTF root node
   * @param variantName The variant name(s) to select.
   */
  static SelectVariant(rootNode, variantName) {
    const extensionMetadata = this._GetExtensionMetadata(rootNode);
    if (!extensionMetadata) {
      throw new Error(`Cannot select variant on a glTF mesh that does not have the ${NAME} extension`);
    }
    const select = (variantName2) => {
      const entries = extensionMetadata.variants[variantName2];
      if (entries) {
        for (const entry of entries) {
          entry.mesh.material = entry.material;
        }
      }
    };
    if (variantName instanceof Array) {
      for (const name of variantName) {
        select(name);
      }
    } else {
      select(variantName);
    }
    extensionMetadata.lastSelected = variantName;
  }
  /**
   * Select a variant given a variant name or a list of variant names.
   * @param rootNode The glTF root node
   * @param variantName The variant name(s) to select.
   */
  selectVariant(rootNode, variantName) {
    KHR_materials_variants.SelectVariant(rootNode, variantName);
  }
  /**
   * Reset back to the original before selecting a variant.
   * @param rootNode The glTF root node
   */
  static Reset(rootNode) {
    const extensionMetadata = this._GetExtensionMetadata(rootNode);
    if (!extensionMetadata) {
      throw new Error(`Cannot reset on a glTF mesh that does not have the ${NAME} extension`);
    }
    for (const entry of extensionMetadata.original) {
      entry.mesh.material = entry.material;
    }
    extensionMetadata.lastSelected = null;
  }
  /**
   * Reset back to the original before selecting a variant.
   * @param rootNode The glTF root node
   */
  reset(rootNode) {
    KHR_materials_variants.Reset(rootNode);
  }
  /**
   * Gets the last selected variant name(s) or null if original.
   * @param rootNode The glTF root node
   * @returns The selected variant name(s).
   */
  static GetLastSelectedVariant(rootNode) {
    const extensionMetadata = this._GetExtensionMetadata(rootNode);
    if (!extensionMetadata) {
      throw new Error(`Cannot get the last selected variant on a glTF mesh that does not have the ${NAME} extension`);
    }
    return extensionMetadata.lastSelected;
  }
  /**
   * Gets the last selected variant name(s) or null if original.
   * @param rootNode The glTF root node
   * @returns The selected variant name(s).
   */
  getLastSelectedVariant(rootNode) {
    return KHR_materials_variants.GetLastSelectedVariant(rootNode);
  }
  static _GetExtensionMetadata(rootNode) {
    var _a, _b;
    return ((_b = (_a = rootNode == null ? void 0 : rootNode._internalMetadata) == null ? void 0 : _a.gltf) == null ? void 0 : _b[NAME]) || null;
  }
  /** @internal */
  onLoading() {
    const extensions = this._loader.gltf.extensions;
    if (extensions && extensions[this.name]) {
      const extension = extensions[this.name];
      this._variants = extension.variants;
    }
  }
  /** @internal */
  onReady() {
    var _a;
    const rootNode = this._loader.rootBabylonMesh;
    if (rootNode) {
      const options = this._loader.parent.extensionOptions[NAME];
      if (options == null ? void 0 : options.defaultVariant) {
        KHR_materials_variants.SelectVariant(rootNode, options.defaultVariant);
      }
      (_a = options == null ? void 0 : options.onLoaded) == null ? void 0 : _a.call(options, {
        get variants() {
          return KHR_materials_variants.GetAvailableVariants(rootNode);
        },
        get selectedVariant() {
          const lastSelectedVariant = KHR_materials_variants.GetLastSelectedVariant(rootNode);
          if (!lastSelectedVariant) {
            return KHR_materials_variants.GetAvailableVariants(rootNode)[0];
          }
          if (Array.isArray(lastSelectedVariant)) {
            return lastSelectedVariant[0];
          }
          return lastSelectedVariant;
        },
        set selectedVariant(variantName) {
          KHR_materials_variants.SelectVariant(rootNode, variantName);
        }
      });
    }
  }
  /**
   * @internal
   */
  _loadMeshPrimitiveAsync(context, name, node, mesh, primitive, assign) {
    return GLTFLoader.LoadExtensionAsync(context, primitive, this.name, (extensionContext, extension) => {
      const promises = new Array();
      promises.push(this._loader._loadMeshPrimitiveAsync(context, name, node, mesh, primitive, (babylonMesh) => {
        assign(babylonMesh);
        if (babylonMesh instanceof Mesh) {
          const babylonDrawMode = GLTFLoader._GetDrawMode(context, primitive.mode);
          const root = this._loader.rootBabylonMesh;
          const metadata = root ? root._internalMetadata = root._internalMetadata || {} : {};
          const gltf = metadata.gltf = metadata.gltf || {};
          const extensionMetadata = gltf[NAME] = gltf[NAME] || { lastSelected: null, original: [], variants: {} };
          extensionMetadata.original.push({ mesh: babylonMesh, material: babylonMesh.material });
          for (let mappingIndex = 0; mappingIndex < extension.mappings.length; ++mappingIndex) {
            const mapping = extension.mappings[mappingIndex];
            const material = ArrayItem.Get(`${extensionContext}/mappings/${mappingIndex}/material`, this._loader.gltf.materials, mapping.material);
            promises.push(this._loader._loadMaterialAsync(`#/materials/${mapping.material}`, material, babylonMesh, babylonDrawMode, (babylonMaterial) => {
              for (let mappingVariantIndex = 0; mappingVariantIndex < mapping.variants.length; ++mappingVariantIndex) {
                const variantIndex = mapping.variants[mappingVariantIndex];
                const variant = ArrayItem.Get(`/extensions/${NAME}/variants/${variantIndex}`, this._variants, variantIndex);
                extensionMetadata.variants[variant.name] = extensionMetadata.variants[variant.name] || [];
                extensionMetadata.variants[variant.name].push({
                  mesh: babylonMesh,
                  material: babylonMaterial
                });
                babylonMesh.onClonedObservable.add((newOne) => {
                  const newMesh = newOne;
                  let metadata2 = null;
                  let newRoot = newMesh;
                  do {
                    newRoot = newRoot.parent;
                    if (!newRoot) {
                      return;
                    }
                    metadata2 = KHR_materials_variants._GetExtensionMetadata(newRoot);
                  } while (metadata2 === null);
                  if (root && metadata2 === KHR_materials_variants._GetExtensionMetadata(root)) {
                    newRoot._internalMetadata = {};
                    for (const key in root._internalMetadata) {
                      newRoot._internalMetadata[key] = root._internalMetadata[key];
                    }
                    newRoot._internalMetadata.gltf = [];
                    for (const key in root._internalMetadata.gltf) {
                      newRoot._internalMetadata.gltf[key] = root._internalMetadata.gltf[key];
                    }
                    newRoot._internalMetadata.gltf[NAME] = { lastSelected: null, original: [], variants: {} };
                    for (const original of metadata2.original) {
                      newRoot._internalMetadata.gltf[NAME].original.push({
                        mesh: original.mesh,
                        material: original.material
                      });
                    }
                    for (const key in metadata2.variants) {
                      if (Object.prototype.hasOwnProperty.call(metadata2.variants, key)) {
                        newRoot._internalMetadata.gltf[NAME].variants[key] = [];
                        for (const variantEntry of metadata2.variants[key]) {
                          newRoot._internalMetadata.gltf[NAME].variants[key].push({
                            mesh: variantEntry.mesh,
                            material: variantEntry.material
                          });
                        }
                      }
                    }
                    metadata2 = newRoot._internalMetadata.gltf[NAME];
                  }
                  for (const target of metadata2.original) {
                    if (target.mesh === babylonMesh) {
                      target.mesh = newMesh;
                    }
                  }
                  for (const target of metadata2.variants[variant.name]) {
                    if (target.mesh === babylonMesh) {
                      target.mesh = newMesh;
                    }
                  }
                });
              }
            }));
          }
        }
      }));
      return Promise.all(promises).then(([babylonMesh]) => {
        return babylonMesh;
      });
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_materials_variants(loader));
export {
  KHR_materials_variants
};
