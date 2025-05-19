import { h as Logger } from "./index.B4f7kVg_.js";
const _TYPE_INDEXED = 1;
const _TYPE_RGB = 2;
const _TYPE_GREY = 3;
const _TYPE_RLE_INDEXED = 9;
const _TYPE_RLE_RGB = 10;
const _TYPE_RLE_GREY = 11;
const _ORIGIN_MASK = 48;
const _ORIGIN_SHIFT = 4;
const _ORIGIN_BL = 0;
const _ORIGIN_BR = 1;
const _ORIGIN_UL = 2;
const _ORIGIN_UR = 3;
function GetTGAHeader(data) {
  let offset = 0;
  const header = {
    id_length: data[offset++],
    colormap_type: data[offset++],
    image_type: data[offset++],
    colormap_index: data[offset++] | data[offset++] << 8,
    colormap_length: data[offset++] | data[offset++] << 8,
    colormap_size: data[offset++],
    origin: [data[offset++] | data[offset++] << 8, data[offset++] | data[offset++] << 8],
    width: data[offset++] | data[offset++] << 8,
    height: data[offset++] | data[offset++] << 8,
    pixel_size: data[offset++],
    flags: data[offset++]
  };
  return header;
}
function UploadContent(texture, data) {
  if (data.length < 19) {
    Logger.Error("Unable to load TGA file - Not enough data to contain header");
    return;
  }
  let offset = 18;
  const header = GetTGAHeader(data);
  if (header.id_length + offset > data.length) {
    Logger.Error("Unable to load TGA file - Not enough data");
    return;
  }
  offset += header.id_length;
  let use_rle = false;
  let use_pal = false;
  let use_grey = false;
  switch (header.image_type) {
    case _TYPE_RLE_INDEXED:
      use_rle = true;
    case _TYPE_INDEXED:
      use_pal = true;
      break;
    case _TYPE_RLE_RGB:
      use_rle = true;
    case _TYPE_RGB:
      break;
    case _TYPE_RLE_GREY:
      use_rle = true;
    case _TYPE_GREY:
      use_grey = true;
      break;
  }
  let pixel_data;
  const pixel_size = header.pixel_size >> 3;
  const pixel_total = header.width * header.height * pixel_size;
  let palettes;
  if (use_pal) {
    palettes = data.subarray(offset, offset += header.colormap_length * (header.colormap_size >> 3));
  }
  if (use_rle) {
    pixel_data = new Uint8Array(pixel_total);
    let c, count, i;
    let localOffset = 0;
    const pixels = new Uint8Array(pixel_size);
    while (offset < pixel_total && localOffset < pixel_total) {
      c = data[offset++];
      count = (c & 127) + 1;
      if (c & 128) {
        for (i = 0; i < pixel_size; ++i) {
          pixels[i] = data[offset++];
        }
        for (i = 0; i < count; ++i) {
          pixel_data.set(pixels, localOffset + i * pixel_size);
        }
        localOffset += pixel_size * count;
      } else {
        count *= pixel_size;
        for (i = 0; i < count; ++i) {
          pixel_data[localOffset + i] = data[offset++];
        }
        localOffset += count;
      }
    }
  } else {
    pixel_data = data.subarray(offset, offset += use_pal ? header.width * header.height : pixel_total);
  }
  let x_start, y_start, x_step, y_step, y_end, x_end;
  switch ((header.flags & _ORIGIN_MASK) >> _ORIGIN_SHIFT) {
    default:
    case _ORIGIN_UL:
      x_start = 0;
      x_step = 1;
      x_end = header.width;
      y_start = 0;
      y_step = 1;
      y_end = header.height;
      break;
    case _ORIGIN_BL:
      x_start = 0;
      x_step = 1;
      x_end = header.width;
      y_start = header.height - 1;
      y_step = -1;
      y_end = -1;
      break;
    case _ORIGIN_UR:
      x_start = header.width - 1;
      x_step = -1;
      x_end = -1;
      y_start = 0;
      y_step = 1;
      y_end = header.height;
      break;
    case _ORIGIN_BR:
      x_start = header.width - 1;
      x_step = -1;
      x_end = -1;
      y_start = header.height - 1;
      y_step = -1;
      y_end = -1;
      break;
  }
  const func = "_getImageData" + (use_grey ? "Grey" : "") + header.pixel_size + "bits";
  const imageData = TGATools[func](header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end);
  const engine = texture.getEngine();
  engine._uploadDataToTextureDirectly(texture, imageData);
}
function _getImageData8bits(header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end) {
  const image = pixel_data, colormap = palettes;
  const width = header.width, height = header.height;
  let color, i = 0, x, y;
  const imageData = new Uint8Array(width * height * 4);
  for (y = y_start; y !== y_end; y += y_step) {
    for (x = x_start; x !== x_end; x += x_step, i++) {
      color = image[i];
      imageData[(x + width * y) * 4 + 3] = 255;
      imageData[(x + width * y) * 4 + 2] = colormap[color * 3 + 0];
      imageData[(x + width * y) * 4 + 1] = colormap[color * 3 + 1];
      imageData[(x + width * y) * 4 + 0] = colormap[color * 3 + 2];
    }
  }
  return imageData;
}
function _getImageData16bits(header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end) {
  const image = pixel_data;
  const width = header.width, height = header.height;
  let color, i = 0, x, y;
  const imageData = new Uint8Array(width * height * 4);
  for (y = y_start; y !== y_end; y += y_step) {
    for (x = x_start; x !== x_end; x += x_step, i += 2) {
      color = image[i + 0] + (image[i + 1] << 8);
      const r = ((color & 31744) >> 10) * 255 / 31 | 0;
      const g = ((color & 992) >> 5) * 255 / 31 | 0;
      const b = (color & 31) * 255 / 31 | 0;
      imageData[(x + width * y) * 4 + 0] = r;
      imageData[(x + width * y) * 4 + 1] = g;
      imageData[(x + width * y) * 4 + 2] = b;
      imageData[(x + width * y) * 4 + 3] = color & 32768 ? 0 : 255;
    }
  }
  return imageData;
}
function _getImageData24bits(header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end) {
  const image = pixel_data;
  const width = header.width, height = header.height;
  let i = 0, x, y;
  const imageData = new Uint8Array(width * height * 4);
  for (y = y_start; y !== y_end; y += y_step) {
    for (x = x_start; x !== x_end; x += x_step, i += 3) {
      imageData[(x + width * y) * 4 + 3] = 255;
      imageData[(x + width * y) * 4 + 2] = image[i + 0];
      imageData[(x + width * y) * 4 + 1] = image[i + 1];
      imageData[(x + width * y) * 4 + 0] = image[i + 2];
    }
  }
  return imageData;
}
function _getImageData32bits(header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end) {
  const image = pixel_data;
  const width = header.width, height = header.height;
  let i = 0, x, y;
  const imageData = new Uint8Array(width * height * 4);
  for (y = y_start; y !== y_end; y += y_step) {
    for (x = x_start; x !== x_end; x += x_step, i += 4) {
      imageData[(x + width * y) * 4 + 2] = image[i + 0];
      imageData[(x + width * y) * 4 + 1] = image[i + 1];
      imageData[(x + width * y) * 4 + 0] = image[i + 2];
      imageData[(x + width * y) * 4 + 3] = image[i + 3];
    }
  }
  return imageData;
}
function _getImageDataGrey8bits(header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end) {
  const image = pixel_data;
  const width = header.width, height = header.height;
  let color, i = 0, x, y;
  const imageData = new Uint8Array(width * height * 4);
  for (y = y_start; y !== y_end; y += y_step) {
    for (x = x_start; x !== x_end; x += x_step, i++) {
      color = image[i];
      imageData[(x + width * y) * 4 + 0] = color;
      imageData[(x + width * y) * 4 + 1] = color;
      imageData[(x + width * y) * 4 + 2] = color;
      imageData[(x + width * y) * 4 + 3] = 255;
    }
  }
  return imageData;
}
function _getImageDataGrey16bits(header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end) {
  const image = pixel_data;
  const width = header.width, height = header.height;
  let i = 0, x, y;
  const imageData = new Uint8Array(width * height * 4);
  for (y = y_start; y !== y_end; y += y_step) {
    for (x = x_start; x !== x_end; x += x_step, i += 2) {
      imageData[(x + width * y) * 4 + 0] = image[i + 0];
      imageData[(x + width * y) * 4 + 1] = image[i + 0];
      imageData[(x + width * y) * 4 + 2] = image[i + 0];
      imageData[(x + width * y) * 4 + 3] = image[i + 1];
    }
  }
  return imageData;
}
const TGATools = {
  /**
   * Gets the header of a TGA file
   * @param data defines the TGA data
   * @returns the header
   */
  GetTGAHeader,
  /**
   * Uploads TGA content to a Babylon Texture
   * @internal
   */
  UploadContent,
  /** @internal */
  _getImageData8bits,
  /** @internal */
  _getImageData16bits,
  /** @internal */
  _getImageData24bits,
  /** @internal */
  _getImageData32bits,
  /** @internal */
  _getImageDataGrey8bits,
  /** @internal */
  _getImageDataGrey16bits
};
class _TGATextureLoader {
  constructor() {
    this.supportCascades = false;
  }
  /**
   * Uploads the cube texture data to the WebGL texture. It has already been bound.
   */
  loadCubeData() {
    throw ".env not supported in Cube.";
  }
  /**
   * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
   * @param data contains the texture data
   * @param texture defines the BabylonJS internal texture
   * @param callback defines the method to call once ready to upload
   */
  loadData(data, texture, callback) {
    const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const header = GetTGAHeader(bytes);
    callback(header.width, header.height, texture.generateMipMaps, false, () => {
      UploadContent(texture, bytes);
    });
  }
}
export {
  _TGATextureLoader
};
