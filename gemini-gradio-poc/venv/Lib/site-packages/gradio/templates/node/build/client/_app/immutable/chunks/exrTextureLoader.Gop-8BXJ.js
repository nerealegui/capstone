import { aj as Clamp, h as Logger, b as Tools } from "./index.B4f7kVg_.js";
const INT32_SIZE = 4;
const FLOAT32_SIZE = 4;
const INT8_SIZE = 1;
const INT16_SIZE = 2;
const ULONG_SIZE = 8;
const USHORT_RANGE = 1 << 16;
const BITMAP_SIZE = USHORT_RANGE >> 3;
const HUF_ENCBITS = 16;
const HUF_DECBITS = 14;
const HUF_ENCSIZE = (1 << HUF_ENCBITS) + 1;
const HUF_DECSIZE = 1 << HUF_DECBITS;
const HUF_DECMASK = HUF_DECSIZE - 1;
const SHORT_ZEROCODE_RUN = 59;
const LONG_ZEROCODE_RUN = 63;
const SHORTEST_LONG_RUN = 2 + LONG_ZEROCODE_RUN - SHORT_ZEROCODE_RUN;
var CompressionCodes;
(function(CompressionCodes2) {
  CompressionCodes2[CompressionCodes2["NO_COMPRESSION"] = 0] = "NO_COMPRESSION";
  CompressionCodes2[CompressionCodes2["RLE_COMPRESSION"] = 1] = "RLE_COMPRESSION";
  CompressionCodes2[CompressionCodes2["ZIPS_COMPRESSION"] = 2] = "ZIPS_COMPRESSION";
  CompressionCodes2[CompressionCodes2["ZIP_COMPRESSION"] = 3] = "ZIP_COMPRESSION";
  CompressionCodes2[CompressionCodes2["PIZ_COMPRESSION"] = 4] = "PIZ_COMPRESSION";
  CompressionCodes2[CompressionCodes2["PXR24_COMPRESSION"] = 5] = "PXR24_COMPRESSION";
})(CompressionCodes || (CompressionCodes = {}));
var LineOrders;
(function(LineOrders2) {
  LineOrders2[LineOrders2["INCREASING_Y"] = 0] = "INCREASING_Y";
  LineOrders2[LineOrders2["DECREASING_Y"] = 1] = "DECREASING_Y";
})(LineOrders || (LineOrders = {}));
const _tables = _GenerateTables();
function _GenerateTables() {
  const buffer = new ArrayBuffer(4);
  const floatView = new Float32Array(buffer);
  const uint32View = new Uint32Array(buffer);
  const baseTable = new Uint32Array(512);
  const shiftTable = new Uint32Array(512);
  for (let i = 0; i < 256; ++i) {
    const e = i - 127;
    if (e < -27) {
      baseTable[i] = 0;
      baseTable[i | 256] = 32768;
      shiftTable[i] = 24;
      shiftTable[i | 256] = 24;
    } else if (e < -14) {
      baseTable[i] = 1024 >> -e - 14;
      baseTable[i | 256] = 1024 >> -e - 14 | 32768;
      shiftTable[i] = -e - 1;
      shiftTable[i | 256] = -e - 1;
    } else if (e <= 15) {
      baseTable[i] = e + 15 << 10;
      baseTable[i | 256] = e + 15 << 10 | 32768;
      shiftTable[i] = 13;
      shiftTable[i | 256] = 13;
    } else if (e < 128) {
      baseTable[i] = 31744;
      baseTable[i | 256] = 64512;
      shiftTable[i] = 24;
      shiftTable[i | 256] = 24;
    } else {
      baseTable[i] = 31744;
      baseTable[i | 256] = 64512;
      shiftTable[i] = 13;
      shiftTable[i | 256] = 13;
    }
  }
  const mantissaTable = new Uint32Array(2048);
  const exponentTable = new Uint32Array(64);
  const offsetTable = new Uint32Array(64);
  for (let i = 1; i < 1024; ++i) {
    let m = i << 13;
    let e = 0;
    while ((m & 8388608) === 0) {
      m <<= 1;
      e -= 8388608;
    }
    m &= ~8388608;
    e += 947912704;
    mantissaTable[i] = m | e;
  }
  for (let i = 1024; i < 2048; ++i) {
    mantissaTable[i] = 939524096 + (i - 1024 << 13);
  }
  for (let i = 1; i < 31; ++i) {
    exponentTable[i] = i << 23;
  }
  exponentTable[31] = 1199570944;
  exponentTable[32] = 2147483648;
  for (let i = 33; i < 63; ++i) {
    exponentTable[i] = 2147483648 + (i - 32 << 23);
  }
  exponentTable[63] = 3347054592;
  for (let i = 1; i < 64; ++i) {
    if (i !== 32) {
      offsetTable[i] = 1024;
    }
  }
  return {
    floatView,
    uint32View,
    baseTable,
    shiftTable,
    mantissaTable,
    exponentTable,
    offsetTable
  };
}
function ParseNullTerminatedString(buffer, offset) {
  const uintBuffer = new Uint8Array(buffer);
  let endOffset = 0;
  while (uintBuffer[offset.value + endOffset] != 0) {
    endOffset += 1;
  }
  const stringValue = new TextDecoder().decode(uintBuffer.slice(offset.value, offset.value + endOffset));
  offset.value = offset.value + endOffset + 1;
  return stringValue;
}
function ParseInt32(dataView, offset) {
  const value = dataView.getInt32(offset.value, true);
  offset.value += INT32_SIZE;
  return value;
}
function ParseUint32(dataView, offset) {
  const value = dataView.getUint32(offset.value, true);
  offset.value += INT32_SIZE;
  return value;
}
function ParseUint8(dataView, offset) {
  const value = dataView.getUint8(offset.value);
  offset.value += INT8_SIZE;
  return value;
}
function ParseUint16(dataView, offset) {
  const value = dataView.getUint16(offset.value, true);
  offset.value += INT16_SIZE;
  return value;
}
function ParseUint8Array(array, offset) {
  const value = array[offset.value];
  offset.value += INT8_SIZE;
  return value;
}
function ParseInt64(dataView, offset) {
  let int;
  if ("getBigInt64" in DataView.prototype) {
    int = Number(dataView.getBigInt64(offset.value, true));
  } else {
    int = dataView.getUint32(offset.value + 4, true) + Number(dataView.getUint32(offset.value, true) << 32);
  }
  offset.value += ULONG_SIZE;
  return int;
}
function ParseFloat32(dataView, offset) {
  const value = dataView.getFloat32(offset.value, true);
  offset.value += FLOAT32_SIZE;
  return value;
}
function ParseFloat16(dataView, offset) {
  return DecodeFloat16(ParseUint16(dataView, offset));
}
function DecodeFloat16(binary) {
  const exponent = (binary & 31744) >> 10;
  const fraction = binary & 1023;
  return (binary >> 15 ? -1 : 1) * (exponent ? exponent === 31 ? fraction ? NaN : Infinity : Math.pow(2, exponent - 15) * (1 + fraction / 1024) : 6103515625e-14 * (fraction / 1024));
}
function ToHalfFloat(value) {
  if (Math.abs(value) > 65504) {
    throw new Error("Value out of range.Consider using float instead of half-float.");
  }
  value = Clamp(value, -65504, 65504);
  _tables.floatView[0] = value;
  const f = _tables.uint32View[0];
  const e = f >> 23 & 511;
  return _tables.baseTable[e] + ((f & 8388607) >> _tables.shiftTable[e]);
}
function DecodeFloat32(dataView, offset) {
  return ToHalfFloat(ParseFloat32(dataView, offset));
}
function ParseFixedLengthString(buffer, offset, size) {
  const stringValue = new TextDecoder().decode(new Uint8Array(buffer).slice(offset.value, offset.value + size));
  offset.value = offset.value + size;
  return stringValue;
}
function ParseRational(dataView, offset) {
  const x = ParseInt32(dataView, offset);
  const y = ParseUint32(dataView, offset);
  return [x, y];
}
function ParseTimecode(dataView, offset) {
  const x = ParseUint32(dataView, offset);
  const y = ParseUint32(dataView, offset);
  return [x, y];
}
function ParseV2f(dataView, offset) {
  const x = ParseFloat32(dataView, offset);
  const y = ParseFloat32(dataView, offset);
  return [x, y];
}
function ParseV3f(dataView, offset) {
  const x = ParseFloat32(dataView, offset);
  const y = ParseFloat32(dataView, offset);
  const z = ParseFloat32(dataView, offset);
  return [x, y, z];
}
function ParseChlist(dataView, offset, size) {
  const startOffset = offset.value;
  const channels = [];
  while (offset.value < startOffset + size - 1) {
    const name = ParseNullTerminatedString(dataView.buffer, offset);
    const pixelType = ParseInt32(dataView, offset);
    const pLinear = ParseUint8(dataView, offset);
    offset.value += 3;
    const xSampling = ParseInt32(dataView, offset);
    const ySampling = ParseInt32(dataView, offset);
    channels.push({
      name,
      pixelType,
      pLinear,
      xSampling,
      ySampling
    });
  }
  offset.value += 1;
  return channels;
}
function ParseChromaticities(dataView, offset) {
  const redX = ParseFloat32(dataView, offset);
  const redY = ParseFloat32(dataView, offset);
  const greenX = ParseFloat32(dataView, offset);
  const greenY = ParseFloat32(dataView, offset);
  const blueX = ParseFloat32(dataView, offset);
  const blueY = ParseFloat32(dataView, offset);
  const whiteX = ParseFloat32(dataView, offset);
  const whiteY = ParseFloat32(dataView, offset);
  return { redX, redY, greenX, greenY, blueX, blueY, whiteX, whiteY };
}
function ParseCompression(dataView, offset) {
  return ParseUint8(dataView, offset);
}
function ParseBox2i(dataView, offset) {
  const xMin = ParseInt32(dataView, offset);
  const yMin = ParseInt32(dataView, offset);
  const xMax = ParseInt32(dataView, offset);
  const yMax = ParseInt32(dataView, offset);
  return { xMin, yMin, xMax, yMax };
}
function ParseLineOrder(dataView, offset) {
  const lineOrder = ParseUint8(dataView, offset);
  return LineOrders[lineOrder];
}
function ParseValue(dataView, offset, type, size) {
  switch (type) {
    case "string":
    case "stringvector":
    case "iccProfile":
      return ParseFixedLengthString(dataView.buffer, offset, size);
    case "chlist":
      return ParseChlist(dataView, offset, size);
    case "chromaticities":
      return ParseChromaticities(dataView, offset);
    case "compression":
      return ParseCompression(dataView, offset);
    case "box2i":
      return ParseBox2i(dataView, offset);
    case "lineOrder":
      return ParseLineOrder(dataView, offset);
    case "float":
      return ParseFloat32(dataView, offset);
    case "v2f":
      return ParseV2f(dataView, offset);
    case "v3f":
      return ParseV3f(dataView, offset);
    case "int":
      return ParseInt32(dataView, offset);
    case "rational":
      return ParseRational(dataView, offset);
    case "timecode":
      return ParseTimecode(dataView, offset);
    case "preview":
      offset.value += size;
      return "skipped";
    default:
      offset.value += size;
      return void 0;
  }
}
function Predictor(source) {
  for (let t = 1; t < source.length; t++) {
    const d = source[t - 1] + source[t] - 128;
    source[t] = d;
  }
}
function InterleaveScalar(source, out) {
  let t1 = 0;
  let t2 = Math.floor((source.length + 1) / 2);
  let s = 0;
  const stop = source.length - 1;
  while (true) {
    if (s > stop) {
      break;
    }
    out[s++] = source[t1++];
    if (s > stop) {
      break;
    }
    out[s++] = source[t2++];
  }
}
const EXR_MAGIC = 20000630;
function GetExrHeader(dataView, offset) {
  if (dataView.getUint32(0, true) != EXR_MAGIC) {
    throw new Error("Incorrect OpenEXR format");
  }
  const version = dataView.getUint8(4);
  const specData = dataView.getUint8(5);
  const spec = {
    singleTile: !!(specData & 2),
    longName: !!(specData & 4),
    deepFormat: !!(specData & 8),
    multiPart: !!(specData & 16)
  };
  offset.value = 8;
  const headerData = {};
  let keepReading = true;
  while (keepReading) {
    const attributeName = ParseNullTerminatedString(dataView.buffer, offset);
    if (!attributeName) {
      keepReading = false;
    } else {
      const attributeType = ParseNullTerminatedString(dataView.buffer, offset);
      const attributeSize = ParseUint32(dataView, offset);
      const attributeValue = ParseValue(dataView, offset, attributeType, attributeSize);
      if (attributeValue === void 0) {
        Logger.Warn(`Unknown header attribute type ${attributeType}'.`);
      } else {
        headerData[attributeName] = attributeValue;
      }
    }
  }
  if ((specData & ~4) != 0) {
    throw new Error("Unsupported file format");
  }
  return { version, spec, ...headerData };
}
const NBITS = 16;
const A_OFFSET = 1 << NBITS - 1;
const MOD_MASK = (1 << NBITS) - 1;
function ReverseLutFromBitmap(bitmap, lut) {
  let k = 0;
  for (let i = 0; i < USHORT_RANGE; ++i) {
    if (i == 0 || bitmap[i >> 3] & 1 << (i & 7)) {
      lut[k++] = i;
    }
  }
  const n = k - 1;
  while (k < USHORT_RANGE)
    lut[k++] = 0;
  return n;
}
function HufClearDecTable(hdec) {
  for (let i = 0; i < HUF_DECSIZE; i++) {
    hdec[i] = {};
    hdec[i].len = 0;
    hdec[i].lit = 0;
    hdec[i].p = null;
  }
}
function GetBits(nBits, c, lc, array, offset) {
  while (lc < nBits) {
    c = c << 8 | ParseUint8Array(array, offset);
    lc += 8;
  }
  lc -= nBits;
  return {
    l: c >> lc & (1 << nBits) - 1,
    c,
    lc
  };
}
function GetChar(c, lc, array, offset) {
  c = c << 8 | ParseUint8Array(array, offset);
  lc += 8;
  return {
    c,
    lc
  };
}
function GetCode(po, rlc, c, lc, array, offset, outBuffer, outBufferOffset, outBufferEndOffset) {
  if (po == rlc) {
    if (lc < 8) {
      const gc = GetChar(c, lc, array, offset);
      c = gc.c;
      lc = gc.lc;
    }
    lc -= 8;
    let cs = c >> lc;
    cs = new Uint8Array([cs])[0];
    if (outBufferOffset.value + cs > outBufferEndOffset) {
      return null;
    }
    const s = outBuffer[outBufferOffset.value - 1];
    while (cs-- > 0) {
      outBuffer[outBufferOffset.value++] = s;
    }
  } else if (outBufferOffset.value < outBufferEndOffset) {
    outBuffer[outBufferOffset.value++] = po;
  } else {
    return null;
  }
  return { c, lc };
}
const HufTableBuffer = new Array(59);
function HufCanonicalCodeTable(hcode) {
  for (let i = 0; i <= 58; ++i)
    HufTableBuffer[i] = 0;
  for (let i = 0; i < HUF_ENCSIZE; ++i)
    HufTableBuffer[hcode[i]] += 1;
  let c = 0;
  for (let i = 58; i > 0; --i) {
    const nc = c + HufTableBuffer[i] >> 1;
    HufTableBuffer[i] = c;
    c = nc;
  }
  for (let i = 0; i < HUF_ENCSIZE; ++i) {
    const l = hcode[i];
    if (l > 0)
      hcode[i] = l | HufTableBuffer[l]++ << 6;
  }
}
function HufUnpackEncTable(array, offset, ni, im, iM, hcode) {
  const p = offset;
  let c = 0;
  let lc = 0;
  for (; im <= iM; im++) {
    if (p.value - offset.value > ni) {
      return;
    }
    let gb = GetBits(6, c, lc, array, p);
    const l = gb.l;
    c = gb.c;
    lc = gb.lc;
    hcode[im] = l;
    if (l == LONG_ZEROCODE_RUN) {
      if (p.value - offset.value > ni) {
        throw new Error("Error in HufUnpackEncTable");
      }
      gb = GetBits(8, c, lc, array, p);
      let zerun = gb.l + SHORTEST_LONG_RUN;
      c = gb.c;
      lc = gb.lc;
      if (im + zerun > iM + 1) {
        throw new Error("Error in HufUnpackEncTable");
      }
      while (zerun--)
        hcode[im++] = 0;
      im--;
    } else if (l >= SHORT_ZEROCODE_RUN) {
      let zerun = l - SHORT_ZEROCODE_RUN + 2;
      if (im + zerun > iM + 1) {
        throw new Error("Error in HufUnpackEncTable");
      }
      while (zerun--)
        hcode[im++] = 0;
      im--;
    }
  }
  HufCanonicalCodeTable(hcode);
}
function HufLength(code) {
  return code & 63;
}
function HufCode(code) {
  return code >> 6;
}
function HufBuildDecTable(hcode, im, iM, hdecod) {
  for (; im <= iM; im++) {
    const c = HufCode(hcode[im]);
    const l = HufLength(hcode[im]);
    if (c >> l) {
      throw new Error("Invalid table entry");
    }
    if (l > HUF_DECBITS) {
      const pl = hdecod[c >> l - HUF_DECBITS];
      if (pl.len) {
        throw new Error("Invalid table entry");
      }
      pl.lit++;
      if (pl.p) {
        const p = pl.p;
        pl.p = new Array(pl.lit);
        for (let i = 0; i < pl.lit - 1; ++i) {
          pl.p[i] = p[i];
        }
      } else {
        pl.p = new Array(1);
      }
      pl.p[pl.lit - 1] = im;
    } else if (l) {
      let plOffset = 0;
      for (let i = 1 << HUF_DECBITS - l; i > 0; i--) {
        const pl = hdecod[(c << HUF_DECBITS - l) + plOffset];
        if (pl.len || pl.p) {
          throw new Error("Invalid table entry");
        }
        pl.len = l;
        pl.lit = im;
        plOffset++;
      }
    }
  }
  return true;
}
function HufDecode(encodingTable, decodingTable, array, offset, ni, rlc, no, outBuffer, outOffset) {
  let c = 0;
  let lc = 0;
  const outBufferEndOffset = no;
  const inOffsetEnd = Math.trunc(offset.value + (ni + 7) / 8);
  while (offset.value < inOffsetEnd) {
    let gc = GetChar(c, lc, array, offset);
    c = gc.c;
    lc = gc.lc;
    while (lc >= HUF_DECBITS) {
      const index = c >> lc - HUF_DECBITS & HUF_DECMASK;
      const pl = decodingTable[index];
      if (pl.len) {
        lc -= pl.len;
        const gCode = GetCode(pl.lit, rlc, c, lc, array, offset, outBuffer, outOffset, outBufferEndOffset);
        if (gCode) {
          c = gCode.c;
          lc = gCode.lc;
        }
      } else {
        if (!pl.p) {
          throw new Error("hufDecode issues");
        }
        let j;
        for (j = 0; j < pl.lit; j++) {
          const l = HufLength(encodingTable[pl.p[j]]);
          while (lc < l && offset.value < inOffsetEnd) {
            gc = GetChar(c, lc, array, offset);
            c = gc.c;
            lc = gc.lc;
          }
          if (lc >= l) {
            if (HufCode(encodingTable[pl.p[j]]) == (c >> lc - l & (1 << l) - 1)) {
              lc -= l;
              const gCode = GetCode(pl.p[j], rlc, c, lc, array, offset, outBuffer, outOffset, outBufferEndOffset);
              if (gCode) {
                c = gCode.c;
                lc = gCode.lc;
              }
              break;
            }
          }
        }
        if (j == pl.lit) {
          throw new Error("HufDecode issues");
        }
      }
    }
  }
  const i = 8 - ni & 7;
  c >>= i;
  lc -= i;
  while (lc > 0) {
    const pl = decodingTable[c << HUF_DECBITS - lc & HUF_DECMASK];
    if (pl.len) {
      lc -= pl.len;
      const gCode = GetCode(pl.lit, rlc, c, lc, array, offset, outBuffer, outOffset, outBufferEndOffset);
      if (gCode) {
        c = gCode.c;
        lc = gCode.lc;
      }
    } else {
      throw new Error("HufDecode issues");
    }
  }
  return true;
}
function HufUncompress(array, dataView, offset, nCompressed, outBuffer, nRaw) {
  const outOffset = { value: 0 };
  const initialInOffset = offset.value;
  const im = ParseUint32(dataView, offset);
  const iM = ParseUint32(dataView, offset);
  offset.value += 4;
  const nBits = ParseUint32(dataView, offset);
  offset.value += 4;
  if (im < 0 || im >= HUF_ENCSIZE || iM < 0 || iM >= HUF_ENCSIZE) {
    throw new Error("Wrong HUF_ENCSIZE");
  }
  const freq = new Array(HUF_ENCSIZE);
  const hdec = new Array(HUF_DECSIZE);
  HufClearDecTable(hdec);
  const ni = nCompressed - (offset.value - initialInOffset);
  HufUnpackEncTable(array, offset, ni, im, iM, freq);
  if (nBits > 8 * (nCompressed - (offset.value - initialInOffset))) {
    throw new Error("Wrong hufUncompress");
  }
  HufBuildDecTable(freq, im, iM, hdec);
  HufDecode(freq, hdec, array, offset, nBits, iM, nRaw, outBuffer, outOffset);
}
function UInt16(value) {
  return value & 65535;
}
function Int16(value) {
  const ref = UInt16(value);
  return ref > 32767 ? ref - 65536 : ref;
}
function Wdec14(l, h) {
  const ls = Int16(l);
  const hs = Int16(h);
  const hi = hs;
  const ai = ls + (hi & 1) + (hi >> 1);
  const as = ai;
  const bs = ai - hi;
  return { a: as, b: bs };
}
function Wdec16(l, h) {
  const m = UInt16(l);
  const d = UInt16(h);
  const bb = m - (d >> 1) & MOD_MASK;
  const aa = d + bb - A_OFFSET & MOD_MASK;
  return { a: aa, b: bb };
}
function Wav2Decode(buffer, j, nx, ox, ny, oy, mx) {
  const w14 = mx < 1 << 14;
  const n = nx > ny ? ny : nx;
  let p = 1;
  let p2;
  let py;
  while (p <= n)
    p <<= 1;
  p >>= 1;
  p2 = p;
  p >>= 1;
  while (p >= 1) {
    py = 0;
    const ey = py + oy * (ny - p2);
    const oy1 = oy * p;
    const oy2 = oy * p2;
    const ox1 = ox * p;
    const ox2 = ox * p2;
    let i00, i01, i10, i11;
    for (; py <= ey; py += oy2) {
      let px = py;
      const ex = py + ox * (nx - p2);
      for (; px <= ex; px += ox2) {
        const p01 = px + ox1;
        const p10 = px + oy1;
        const p11 = p10 + ox1;
        if (w14) {
          let result = Wdec14(buffer[px + j], buffer[p10 + j]);
          i00 = result.a;
          i10 = result.b;
          result = Wdec14(buffer[p01 + j], buffer[p11 + j]);
          i01 = result.a;
          i11 = result.b;
          result = Wdec14(i00, i01);
          buffer[px + j] = result.a;
          buffer[p01 + j] = result.b;
          result = Wdec14(i10, i11);
          buffer[p10 + j] = result.a;
          buffer[p11 + j] = result.b;
        } else {
          let result = Wdec16(buffer[px + j], buffer[p10 + j]);
          i00 = result.a;
          i10 = result.b;
          result = Wdec16(buffer[p01 + j], buffer[p11 + j]);
          i01 = result.a;
          i11 = result.b;
          result = Wdec16(i00, i01);
          buffer[px + j] = result.a;
          buffer[p01 + j] = result.b;
          result = Wdec16(i10, i11);
          buffer[p10 + j] = result.a;
          buffer[p11 + j] = result.b;
        }
      }
      if (nx & p) {
        const p10 = px + oy1;
        let result;
        if (w14) {
          result = Wdec14(buffer[px + j], buffer[p10 + j]);
        } else {
          result = Wdec16(buffer[px + j], buffer[p10 + j]);
        }
        i00 = result.a;
        buffer[p10 + j] = result.b;
        buffer[px + j] = i00;
      }
    }
    if (ny & p) {
      let px = py;
      const ex = py + ox * (nx - p2);
      for (; px <= ex; px += ox2) {
        const p01 = px + ox1;
        let result;
        if (w14) {
          result = Wdec14(buffer[px + j], buffer[p01 + j]);
        } else {
          result = Wdec16(buffer[px + j], buffer[p01 + j]);
        }
        i00 = result.a;
        buffer[p01 + j] = result.b;
        buffer[px + j] = i00;
      }
    }
    p2 = p;
    p >>= 1;
  }
  return py;
}
function ApplyLut(lut, data, nData) {
  for (let i = 0; i < nData; ++i) {
    data[i] = lut[data[i]];
  }
}
function DecodeRunLength(source) {
  let size = source.byteLength;
  const out = new Array();
  let p = 0;
  const reader = new DataView(source);
  while (size > 0) {
    const l = reader.getInt8(p++);
    if (l < 0) {
      const count = -l;
      size -= count + 1;
      for (let i = 0; i < count; i++) {
        out.push(reader.getUint8(p++));
      }
    } else {
      const count = l;
      size -= 2;
      const value = reader.getUint8(p++);
      for (let i = 0; i < count + 1; i++) {
        out.push(value);
      }
    }
  }
  return out;
}
function UncompressRAW(decoder) {
  return new DataView(decoder.array.buffer, decoder.offset.value, decoder.size);
}
function UncompressRLE(decoder) {
  const compressed = decoder.viewer.buffer.slice(decoder.offset.value, decoder.offset.value + decoder.size);
  const rawBuffer = new Uint8Array(DecodeRunLength(compressed));
  const tmpBuffer = new Uint8Array(rawBuffer.length);
  Predictor(rawBuffer);
  InterleaveScalar(rawBuffer, tmpBuffer);
  return new DataView(tmpBuffer.buffer);
}
function UncompressZIP(decoder) {
  const compressed = decoder.array.slice(decoder.offset.value, decoder.offset.value + decoder.size);
  const rawBuffer = fflate.unzlibSync(compressed);
  const tmpBuffer = new Uint8Array(rawBuffer.length);
  Predictor(rawBuffer);
  InterleaveScalar(rawBuffer, tmpBuffer);
  return new DataView(tmpBuffer.buffer);
}
function UncompressPXR(decoder) {
  const compressed = decoder.array.slice(decoder.offset.value, decoder.offset.value + decoder.size);
  const rawBuffer = fflate.unzlibSync(compressed);
  const sz = decoder.lines * decoder.channels * decoder.width;
  const tmpBuffer = decoder.type == 1 ? new Uint16Array(sz) : new Uint32Array(sz);
  let tmpBufferEnd = 0;
  let writePtr = 0;
  const ptr = new Array(4);
  for (let y = 0; y < decoder.lines; y++) {
    for (let c = 0; c < decoder.channels; c++) {
      let pixel = 0;
      switch (decoder.type) {
        case 1:
          ptr[0] = tmpBufferEnd;
          ptr[1] = ptr[0] + decoder.width;
          tmpBufferEnd = ptr[1] + decoder.width;
          for (let j = 0; j < decoder.width; ++j) {
            const diff = rawBuffer[ptr[0]++] << 8 | rawBuffer[ptr[1]++];
            pixel += diff;
            tmpBuffer[writePtr] = pixel;
            writePtr++;
          }
          break;
        case 2:
          ptr[0] = tmpBufferEnd;
          ptr[1] = ptr[0] + decoder.width;
          ptr[2] = ptr[1] + decoder.width;
          tmpBufferEnd = ptr[2] + decoder.width;
          for (let j = 0; j < decoder.width; ++j) {
            const diff = rawBuffer[ptr[0]++] << 24 | rawBuffer[ptr[1]++] << 16 | rawBuffer[ptr[2]++] << 8;
            pixel += diff;
            tmpBuffer[writePtr] = pixel;
            writePtr++;
          }
          break;
      }
    }
  }
  return new DataView(tmpBuffer.buffer);
}
function UncompressPIZ(decoder) {
  const inDataView = decoder.viewer;
  const inOffset = { value: decoder.offset.value };
  const outBuffer = new Uint16Array(decoder.width * decoder.scanlineBlockSize * (decoder.channels * decoder.type));
  const bitmap = new Uint8Array(BITMAP_SIZE);
  let outBufferEnd = 0;
  const pizChannelData = new Array(decoder.channels);
  for (let i = 0; i < decoder.channels; i++) {
    pizChannelData[i] = {};
    pizChannelData[i]["start"] = outBufferEnd;
    pizChannelData[i]["end"] = pizChannelData[i]["start"];
    pizChannelData[i]["nx"] = decoder.width;
    pizChannelData[i]["ny"] = decoder.lines;
    pizChannelData[i]["size"] = decoder.type;
    outBufferEnd += pizChannelData[i].nx * pizChannelData[i].ny * pizChannelData[i].size;
  }
  const minNonZero = ParseUint16(inDataView, inOffset);
  const maxNonZero = ParseUint16(inDataView, inOffset);
  if (maxNonZero >= BITMAP_SIZE) {
    throw new Error("Wrong PIZ_COMPRESSION BITMAP_SIZE");
  }
  if (minNonZero <= maxNonZero) {
    for (let i = 0; i < maxNonZero - minNonZero + 1; i++) {
      bitmap[i + minNonZero] = ParseUint8(inDataView, inOffset);
    }
  }
  const lut = new Uint16Array(USHORT_RANGE);
  const maxValue = ReverseLutFromBitmap(bitmap, lut);
  const length = ParseUint32(inDataView, inOffset);
  HufUncompress(decoder.array, inDataView, inOffset, length, outBuffer, outBufferEnd);
  for (let i = 0; i < decoder.channels; ++i) {
    const cd = pizChannelData[i];
    for (let j = 0; j < pizChannelData[i].size; ++j) {
      Wav2Decode(outBuffer, cd.start + j, cd.nx, cd.size, cd.ny, cd.nx * cd.size, maxValue);
    }
  }
  ApplyLut(lut, outBuffer, outBufferEnd);
  let tmpOffset = 0;
  const tmpBuffer = new Uint8Array(outBuffer.buffer.byteLength);
  for (let y = 0; y < decoder.lines; y++) {
    for (let c = 0; c < decoder.channels; c++) {
      const cd = pizChannelData[c];
      const n = cd.nx * cd.size;
      const cp = new Uint8Array(outBuffer.buffer, cd.end * INT16_SIZE, n * INT16_SIZE);
      tmpBuffer.set(cp, tmpOffset);
      tmpOffset += n * INT16_SIZE;
      cd.end += n;
    }
  }
  return new DataView(tmpBuffer.buffer);
}
var EXROutputType;
(function(EXROutputType2) {
  EXROutputType2[EXROutputType2["Float"] = 0] = "Float";
  EXROutputType2[EXROutputType2["HalfFloat"] = 1] = "HalfFloat";
})(EXROutputType || (EXROutputType = {}));
class ExrLoaderGlobalConfiguration {
}
ExrLoaderGlobalConfiguration.DefaultOutputType = EXROutputType.HalfFloat;
ExrLoaderGlobalConfiguration.FFLATEUrl = "https://unpkg.com/fflate@0.8.2";
async function CreateDecoderAsync(header, dataView, offset, outputType) {
  const decoder = {
    size: 0,
    viewer: dataView,
    array: new Uint8Array(dataView.buffer),
    offset,
    width: header.dataWindow.xMax - header.dataWindow.xMin + 1,
    height: header.dataWindow.yMax - header.dataWindow.yMin + 1,
    channels: header.channels.length,
    channelLineOffsets: {},
    scanOrder: () => 0,
    bytesPerLine: 0,
    outLineWidth: 0,
    lines: 0,
    scanlineBlockSize: 0,
    inputSize: null,
    type: 0,
    uncompress: null,
    getter: () => 0,
    format: 5,
    outputChannels: 0,
    decodeChannels: {},
    blockCount: null,
    byteArray: null,
    linearSpace: false,
    textureType: 0
  };
  switch (header.compression) {
    case CompressionCodes.NO_COMPRESSION:
      decoder.lines = 1;
      decoder.uncompress = UncompressRAW;
      break;
    case CompressionCodes.RLE_COMPRESSION:
      decoder.lines = 1;
      decoder.uncompress = UncompressRLE;
      break;
    case CompressionCodes.ZIPS_COMPRESSION:
      decoder.lines = 1;
      decoder.uncompress = UncompressZIP;
      await Tools.LoadScriptAsync(ExrLoaderGlobalConfiguration.FFLATEUrl);
      break;
    case CompressionCodes.ZIP_COMPRESSION:
      decoder.lines = 16;
      decoder.uncompress = UncompressZIP;
      await Tools.LoadScriptAsync(ExrLoaderGlobalConfiguration.FFLATEUrl);
      break;
    case CompressionCodes.PIZ_COMPRESSION:
      decoder.lines = 32;
      decoder.uncompress = UncompressPIZ;
      break;
    case CompressionCodes.PXR24_COMPRESSION:
      decoder.lines = 16;
      decoder.uncompress = UncompressPXR;
      await Tools.LoadScriptAsync(ExrLoaderGlobalConfiguration.FFLATEUrl);
      break;
    default:
      throw new Error(CompressionCodes[header.compression] + " is unsupported");
  }
  decoder.scanlineBlockSize = decoder.lines;
  const channels = {};
  for (const channel of header.channels) {
    switch (channel.name) {
      case "Y":
      case "R":
      case "G":
      case "B":
      case "A":
        channels[channel.name] = true;
        decoder.type = channel.pixelType;
    }
  }
  let fillAlpha = false;
  if (channels.R && channels.G && channels.B) {
    fillAlpha = !channels.A;
    decoder.outputChannels = 4;
    decoder.decodeChannels = { R: 0, G: 1, B: 2, A: 3 };
  } else if (channels.Y) {
    decoder.outputChannels = 1;
    decoder.decodeChannels = { Y: 0 };
  } else {
    throw new Error("EXRLoader.parse: file contains unsupported data channels.");
  }
  if (decoder.type === 1) {
    switch (outputType) {
      case EXROutputType.Float:
        decoder.getter = ParseFloat16;
        decoder.inputSize = INT16_SIZE;
        break;
      case EXROutputType.HalfFloat:
        decoder.getter = ParseUint16;
        decoder.inputSize = INT16_SIZE;
        break;
    }
  } else if (decoder.type === 2) {
    switch (outputType) {
      case EXROutputType.Float:
        decoder.getter = ParseFloat32;
        decoder.inputSize = FLOAT32_SIZE;
        break;
      case EXROutputType.HalfFloat:
        decoder.getter = DecodeFloat32;
        decoder.inputSize = FLOAT32_SIZE;
    }
  } else {
    throw new Error("Unsupported pixelType " + decoder.type + " for " + header.compression);
  }
  decoder.blockCount = decoder.height / decoder.scanlineBlockSize;
  for (let i = 0; i < decoder.blockCount; i++) {
    ParseInt64(dataView, offset);
  }
  const size = decoder.width * decoder.height * decoder.outputChannels;
  switch (outputType) {
    case EXROutputType.Float:
      decoder.byteArray = new Float32Array(size);
      decoder.textureType = 1;
      if (fillAlpha) {
        decoder.byteArray.fill(1, 0, size);
      }
      break;
    case EXROutputType.HalfFloat:
      decoder.byteArray = new Uint16Array(size);
      decoder.textureType = 2;
      if (fillAlpha) {
        decoder.byteArray.fill(15360, 0, size);
      }
      break;
    default:
      throw new Error("Unsupported type: " + outputType);
  }
  let byteOffset = 0;
  for (const channel of header.channels) {
    if (decoder.decodeChannels[channel.name] !== void 0) {
      decoder.channelLineOffsets[channel.name] = byteOffset * decoder.width;
    }
    byteOffset += channel.pixelType * 2;
  }
  decoder.bytesPerLine = decoder.width * byteOffset;
  decoder.outLineWidth = decoder.width * decoder.outputChannels;
  if (header.lineOrder === "INCREASING_Y") {
    decoder.scanOrder = (y) => y;
  } else {
    decoder.scanOrder = (y) => decoder.height - 1 - y;
  }
  if (decoder.outputChannels == 4) {
    decoder.format = 5;
    decoder.linearSpace = true;
  } else {
    decoder.format = 6;
    decoder.linearSpace = false;
  }
  return decoder;
}
function ScanData(decoder, header, dataView, offset) {
  const tmpOffset = { value: 0 };
  for (let scanlineBlockIdx = 0; scanlineBlockIdx < decoder.height / decoder.scanlineBlockSize; scanlineBlockIdx++) {
    const line = ParseInt32(dataView, offset) - header.dataWindow.yMin;
    decoder.size = ParseUint32(dataView, offset);
    decoder.lines = line + decoder.scanlineBlockSize > decoder.height ? decoder.height - line : decoder.scanlineBlockSize;
    const isCompressed = decoder.size < decoder.lines * decoder.bytesPerLine;
    const viewer = isCompressed && decoder.uncompress ? decoder.uncompress(decoder) : UncompressRAW(decoder);
    offset.value += decoder.size;
    for (let line_y = 0; line_y < decoder.scanlineBlockSize; line_y++) {
      const scan_y = scanlineBlockIdx * decoder.scanlineBlockSize;
      const true_y = line_y + decoder.scanOrder(scan_y);
      if (true_y >= decoder.height) {
        continue;
      }
      const lineOffset = line_y * decoder.bytesPerLine;
      const outLineOffset = (decoder.height - 1 - true_y) * decoder.outLineWidth;
      for (let channelID = 0; channelID < decoder.channels; channelID++) {
        const name = header.channels[channelID].name;
        const lOff = decoder.channelLineOffsets[name];
        const cOff = decoder.decodeChannels[name];
        if (cOff === void 0) {
          continue;
        }
        tmpOffset.value = lineOffset + lOff;
        for (let x = 0; x < decoder.width; x++) {
          const outIndex = outLineOffset + x * decoder.outputChannels + cOff;
          if (decoder.byteArray) {
            decoder.byteArray[outIndex] = decoder.getter(viewer, tmpOffset);
          }
        }
      }
    }
  }
}
class _ExrTextureLoader {
  constructor() {
    this.supportCascades = false;
  }
  /**
   * Uploads the cube texture data to the WebGL texture. It has already been bound.
   * @param _data contains the texture data
   * @param _texture defines the BabylonJS internal texture
   * @param _createPolynomials will be true if polynomials have been requested
   * @param _onLoad defines the callback to trigger once the texture is ready
   * @param _onError defines the callback to trigger in case of error
   * Cube texture are not supported by .exr files
   */
  loadCubeData(_data, _texture, _createPolynomials, _onLoad, _onError) {
    throw ".exr not supported in Cube.";
  }
  /**
   * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
   * @param data contains the texture data
   * @param texture defines the BabylonJS internal texture
   * @param callback defines the method to call once ready to upload
   */
  async loadData(data, texture, callback) {
    const dataView = new DataView(data.buffer);
    const offset = { value: 0 };
    const header = GetExrHeader(dataView, offset);
    const decoder = await CreateDecoderAsync(header, dataView, offset, ExrLoaderGlobalConfiguration.DefaultOutputType);
    ScanData(decoder, header, dataView, offset);
    const width = header.dataWindow.xMax - header.dataWindow.xMin + 1;
    const height = header.dataWindow.yMax - header.dataWindow.yMin + 1;
    callback(width, height, texture.generateMipMaps, false, () => {
      const engine = texture.getEngine();
      texture.format = header.format;
      texture.type = decoder.textureType;
      texture.invertY = false;
      texture._gammaSpace = !header.linearSpace;
      if (decoder.byteArray) {
        engine._uploadDataToTextureDirectly(texture, decoder.byteArray, 0, 0, void 0, true);
      }
    });
  }
}
export {
  _ExrTextureLoader
};
