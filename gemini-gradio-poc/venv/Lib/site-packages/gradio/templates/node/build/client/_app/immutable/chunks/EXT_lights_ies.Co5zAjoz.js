import { V as Vector3, aq as Light, C as Color3, T as Texture, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { a as SpotLight } from "./objectModelMapping.r8gj80Ia.js";
import { ArrayItem, GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "EXT_lights_ies";
class EXT_lights_ies {
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
    delete this._lights;
  }
  /** @internal */
  onLoading() {
    const extensions = this._loader.gltf.extensions;
    if (extensions && extensions[this.name]) {
      const extension = extensions[this.name];
      this._lights = extension.lights;
      ArrayItem.Assign(this._lights);
    }
  }
  /**
   * @internal
   */
  loadNodeAsync(context, node, assign) {
    return GLTFLoader.LoadExtensionAsync(context, node, this.name, async (extensionContext, extension) => {
      this._loader._allMaterialsDirtyRequired = true;
      let babylonSpotLight;
      let light;
      const transformNode = await this._loader.loadNodeAsync(context, node, (babylonMesh) => {
        light = ArrayItem.Get(extensionContext, this._lights, extension.light);
        const name2 = light.name || babylonMesh.name;
        this._loader.babylonScene._blockEntityCollection = !!this._loader._assetContainer;
        babylonSpotLight = new SpotLight(name2, Vector3.Zero(), Vector3.Backward(), 0, 1, this._loader.babylonScene);
        babylonSpotLight.angle = Math.PI / 2;
        babylonSpotLight.innerAngle = 0;
        babylonSpotLight._parentContainer = this._loader._assetContainer;
        this._loader.babylonScene._blockEntityCollection = false;
        light._babylonLight = babylonSpotLight;
        babylonSpotLight.falloffType = Light.FALLOFF_GLTF;
        babylonSpotLight.diffuse = extension.color ? Color3.FromArray(extension.color) : Color3.White();
        babylonSpotLight.intensity = extension.multiplier || 1;
        babylonSpotLight.range = Number.MAX_VALUE;
        babylonSpotLight.parent = babylonMesh;
        this._loader._babylonLights.push(babylonSpotLight);
        GLTFLoader.AddPointerMetadata(babylonSpotLight, extensionContext);
        assign(babylonMesh);
      });
      let bufferData;
      if (light.uri) {
        bufferData = await this._loader.loadUriAsync(context, light, light.uri);
      } else {
        const bufferView = ArrayItem.Get(`${context}/bufferView`, this._loader.gltf.bufferViews, light.bufferView);
        bufferData = await this._loader.loadBufferViewAsync(`/bufferViews/${bufferView.index}`, bufferView);
      }
      babylonSpotLight.iesProfileTexture = new Texture(name + "_iesProfile", this._loader.babylonScene, true, false, void 0, null, null, bufferData, true, void 0, void 0, void 0, void 0, ".ies");
      return transformNode;
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new EXT_lights_ies(loader));
export {
  EXT_lights_ies
};
