import { T as Texture, an as unregisterGLTFExtension, ao as registerGLTFExtension } from "./index.B4f7kVg_.js";
import { GLTFLoader } from "./glTFLoader.D0mNbVQS.js";
const NAME = "KHR_texture_transform";
class KHR_texture_transform {
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
   * @internal
   */
  loadTextureInfoAsync(context, textureInfo, assign) {
    return GLTFLoader.LoadExtensionAsync(context, textureInfo, this.name, (extensionContext, extension) => {
      return this._loader.loadTextureInfoAsync(context, textureInfo, (babylonTexture) => {
        if (!(babylonTexture instanceof Texture)) {
          throw new Error(`${extensionContext}: Texture type not supported`);
        }
        if (extension.offset) {
          babylonTexture.uOffset = extension.offset[0];
          babylonTexture.vOffset = extension.offset[1];
        }
        babylonTexture.uRotationCenter = 0;
        babylonTexture.vRotationCenter = 0;
        if (extension.rotation) {
          babylonTexture.wAng = -extension.rotation;
        }
        if (extension.scale) {
          babylonTexture.uScale = extension.scale[0];
          babylonTexture.vScale = extension.scale[1];
        }
        if (extension.texCoord != void 0) {
          babylonTexture.coordinatesIndex = extension.texCoord;
        }
        assign(babylonTexture);
      });
    });
  }
}
unregisterGLTFExtension(NAME);
registerGLTFExtension(NAME, true, (loader) => new KHR_texture_transform(loader));
export {
  KHR_texture_transform
};
