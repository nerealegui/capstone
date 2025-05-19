import { j as ShaderStore, R as RegisterClass, P as PushMaterial, E as PrepareDefinesForMisc, F as PrepareDefinesForFrameBoundValues, H as PrepareDefinesForAttributes, U as PrepareAttributesForInstances, Z as PrepareUniformsAndSamplersList, $ as addClipPlaneUniforms, aL as Camera, a2 as bindClipPlane, a4 as BindFogParameters, a6 as BindLogDepth, S as SerializationHelper, a8 as MaterialDefines, aa as VertexBuffer, bq as functions, br as HighestCommonFactor, ab as Mesh, M as Matrix, V as Vector3, aU as VertexData, bs as SubMesh, a as TmpVectors, h as Logger, ak as EngineStore, bt as runCoroutineAsync, b as Tools, av as ToHalfFloat, bu as runCoroutineSync, ay as Vector2, bv as createYieldingScheduler, aS as Color4, Q as Quaternion, C as Color3, az as Vector4, bw as RandomRange, B as BaseTexture, bx as SPLATFileLoaderMetadata, af as RegisterSceneLoaderPlugin } from "./index.B4f7kVg_.js";
import { _ as __vitePreload } from "./preload-helper.DpQnamwV.js";
import "./fogFragment.B-BPFZA3.js";
import "./logDepthDeclaration.DDK4d2Eq.js";
import "./logDepthVertex.DCXnsELF.js";
import "./helperFunctions.D96OHM8v.js";
import "./fogFragment.CYvbIHgh.js";
import "./logDepthDeclaration.CHdBqvuk.js";
import "./meshUboDeclaration.D-mXPC7t.js";
import "./helperFunctions.BjB2cuO9.js";
import "./logDepthVertex.rABUOPSR.js";
import { R as RawTexture } from "./rawTexture.BYaiLY3K.js";
import "./thinInstanceMesh.DAersNY-.js";
import { A as AssetContainer } from "./assetContainer.Bu7qjjhL.js";
import { Ray } from "./ray.DKxdJC3H.js";
import { S as StandardMaterial } from "./standardMaterial.WcLfkp_h.js";
const name$9 = "gaussianSplattingFragmentDeclaration";
const shader$9 = `vec4 gaussianColor(vec4 inColor)
{float A=-dot(vPosition,vPosition);if (A<-4.0) discard;float B=exp(A)*inColor.a;
#include<logDepthFragment>
vec3 color=inColor.rgb;
#ifdef FOG
#include<fogFragment>
#endif
return vec4(color,B);}
`;
if (!ShaderStore.IncludesShadersStore[name$9]) {
  ShaderStore.IncludesShadersStore[name$9] = shader$9;
}
const name$8 = "gaussianSplattingPixelShader";
const shader$8 = `#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
varying vec4 vColor;varying vec2 vPosition;
#include<gaussianSplattingFragmentDeclaration>
void main () { 
#include<clipPlaneFragment>
gl_FragColor=gaussianColor(vColor);}
`;
if (!ShaderStore.ShadersStore[name$8]) {
  ShaderStore.ShadersStore[name$8] = shader$8;
}
const gaussianSplattingPixelShader = { name: name$8, shader: shader$8 };
const gaussianSplatting_fragment$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  gaussianSplattingPixelShader
}, Symbol.toStringTag, { value: "Module" }));
const name$7 = "gaussianSplattingVertexDeclaration";
const shader$7 = `attribute vec2 position;uniform mat4 view;uniform mat4 projection;uniform mat4 world;uniform vec4 vEyePosition;`;
if (!ShaderStore.IncludesShadersStore[name$7]) {
  ShaderStore.IncludesShadersStore[name$7] = shader$7;
}
const name$6 = "gaussianSplattingUboDeclaration";
const shader$6 = `#include<sceneUboDeclaration>
#include<meshUboDeclaration>
attribute vec2 position;`;
if (!ShaderStore.IncludesShadersStore[name$6]) {
  ShaderStore.IncludesShadersStore[name$6] = shader$6;
}
const name$5 = "gaussianSplatting";
const shader$5 = `#if !defined(WEBGL2) && !defined(WEBGPU) && !defined(NATIVE)
mat3 transpose(mat3 matrix) {return mat3(matrix[0][0],matrix[1][0],matrix[2][0],
matrix[0][1],matrix[1][1],matrix[2][1],
matrix[0][2],matrix[1][2],matrix[2][2]);}
#endif
vec2 getDataUV(float index,vec2 textureSize) {float y=floor(index/textureSize.x);float x=index-y*textureSize.x;return vec2((x+0.5)/textureSize.x,(y+0.5)/textureSize.y);}
#if SH_DEGREE>0
ivec2 getDataUVint(float index,vec2 textureSize) {float y=floor(index/textureSize.x);float x=index-y*textureSize.x;return ivec2(uint(x+0.5),uint(y+0.5));}
#endif
struct Splat {vec4 center;vec4 color;vec4 covA;vec4 covB;
#if SH_DEGREE>0
uvec4 sh0; 
#endif
#if SH_DEGREE>1
uvec4 sh1;
#endif
#if SH_DEGREE>2
uvec4 sh2;
#endif
};Splat readSplat(float splatIndex)
{Splat splat;vec2 splatUV=getDataUV(splatIndex,dataTextureSize);splat.center=texture2D(centersTexture,splatUV);splat.color=texture2D(colorsTexture,splatUV);splat.covA=texture2D(covariancesATexture,splatUV)*splat.center.w;splat.covB=texture2D(covariancesBTexture,splatUV)*splat.center.w;
#if SH_DEGREE>0
ivec2 splatUVint=getDataUVint(splatIndex,dataTextureSize);splat.sh0=texelFetch(shTexture0,splatUVint,0);
#endif
#if SH_DEGREE>1
splat.sh1=texelFetch(shTexture1,splatUVint,0);
#endif
#if SH_DEGREE>2
splat.sh2=texelFetch(shTexture2,splatUVint,0);
#endif
return splat;}
#if defined(WEBGL2) || defined(WEBGPU) || defined(NATIVE)
vec3 computeColorFromSHDegree(vec3 dir,const vec3 sh[16])
{const float SH_C0=0.28209479;const float SH_C1=0.48860251;float SH_C2[5];SH_C2[0]=1.092548430;SH_C2[1]=-1.09254843;SH_C2[2]=0.315391565;SH_C2[3]=-1.09254843;SH_C2[4]=0.546274215;float SH_C3[7];SH_C3[0]=-0.59004358;SH_C3[1]=2.890611442;SH_C3[2]=-0.45704579;SH_C3[3]=0.373176332;SH_C3[4]=-0.45704579;SH_C3[5]=1.445305721;SH_C3[6]=-0.59004358;vec3 result=/*SH_C0**/sh[0];
#if SH_DEGREE>0
float x=dir.x;float y=dir.y;float z=dir.z;result+=- SH_C1*y*sh[1]+SH_C1*z*sh[2]-SH_C1*x*sh[3];
#if SH_DEGREE>1
float xx=x*x,yy=y*y,zz=z*z;float xy=x*y,yz=y*z,xz=x*z;result+=
SH_C2[0]*xy*sh[4] +
SH_C2[1]*yz*sh[5] +
SH_C2[2]*(2.0*zz-xx-yy)*sh[6] +
SH_C2[3]*xz*sh[7] +
SH_C2[4]*(xx-yy)*sh[8];
#if SH_DEGREE>2
result+=
SH_C3[0]*y*(3.0*xx-yy)*sh[9] +
SH_C3[1]*xy*z*sh[10] +
SH_C3[2]*y*(4.0*zz-xx-yy)*sh[11] +
SH_C3[3]*z*(2.0*zz-3.0*xx-3.0*yy)*sh[12] +
SH_C3[4]*x*(4.0*zz-xx-yy)*sh[13] +
SH_C3[5]*z*(xx-yy)*sh[14] +
SH_C3[6]*x*(xx-3.0*yy)*sh[15];
#endif
#endif
#endif
return result;}
vec4 decompose(uint value)
{vec4 components=vec4(
float((value ) & 255u),
float((value>>uint( 8)) & 255u),
float((value>>uint(16)) & 255u),
float((value>>uint(24)) & 255u));return components*vec4(2./255.)-vec4(1.);}
vec3 computeSH(Splat splat,vec3 color,vec3 dir)
{vec3 sh[16];sh[0]=color;
#if SH_DEGREE>0
vec4 sh00=decompose(splat.sh0.x);vec4 sh01=decompose(splat.sh0.y);vec4 sh02=decompose(splat.sh0.z);sh[1]=vec3(sh00.x,sh00.y,sh00.z);sh[2]=vec3(sh00.w,sh01.x,sh01.y);sh[3]=vec3(sh01.z,sh01.w,sh02.x);
#endif
#if SH_DEGREE>1
vec4 sh03=decompose(splat.sh0.w);vec4 sh04=decompose(splat.sh1.x);vec4 sh05=decompose(splat.sh1.y);sh[4]=vec3(sh02.y,sh02.z,sh02.w);sh[5]=vec3(sh03.x,sh03.y,sh03.z);sh[6]=vec3(sh03.w,sh04.x,sh04.y);sh[7]=vec3(sh04.z,sh04.w,sh05.x);sh[8]=vec3(sh05.y,sh05.z,sh05.w);
#endif
#if SH_DEGREE>2
vec4 sh06=decompose(splat.sh1.z);vec4 sh07=decompose(splat.sh1.w);vec4 sh08=decompose(splat.sh2.x);vec4 sh09=decompose(splat.sh2.y);vec4 sh10=decompose(splat.sh2.z);vec4 sh11=decompose(splat.sh2.w);sh[9]=vec3(sh06.x,sh06.y,sh06.z);sh[10]=vec3(sh06.w,sh07.x,sh07.y);sh[11]=vec3(sh07.z,sh07.w,sh08.x);sh[12]=vec3(sh08.y,sh08.z,sh08.w);sh[13]=vec3(sh09.x,sh09.y,sh09.z);sh[14]=vec3(sh09.w,sh10.x,sh10.y);sh[15]=vec3(sh10.z,sh10.w,sh11.x); 
#endif
return computeColorFromSHDegree(dir,sh);}
#else
vec3 computeSH(Splat splat,vec3 color,vec3 dir)
{return color;}
#endif
vec4 gaussianSplatting(vec2 meshPos,vec3 worldPos,vec2 scale,vec3 covA,vec3 covB,mat4 worldMatrix,mat4 viewMatrix,mat4 projectionMatrix)
{mat4 modelView=viewMatrix*worldMatrix;vec4 camspace=viewMatrix*vec4(worldPos,1.);vec4 pos2d=projectionMatrix*camspace;float bounds=1.2*pos2d.w;if (pos2d.z<-pos2d.w || pos2d.x<-bounds || pos2d.x>bounds
|| pos2d.y<-bounds || pos2d.y>bounds) {return vec4(0.0,0.0,2.0,1.0);}
mat3 Vrk=mat3(
covA.x,covA.y,covA.z,
covA.y,covB.x,covB.y,
covA.z,covB.y,covB.z
);mat3 J=mat3(
focal.x/camspace.z,0.,-(focal.x*camspace.x)/(camspace.z*camspace.z),
0.,focal.y/camspace.z,-(focal.y*camspace.y)/(camspace.z*camspace.z),
0.,0.,0.
);mat3 invy=mat3(1,0,0,0,-1,0,0,0,1);mat3 T=invy*transpose(mat3(modelView))*J;mat3 cov2d=transpose(T)*Vrk*T;float mid=(cov2d[0][0]+cov2d[1][1])/2.0;float radius=length(vec2((cov2d[0][0]-cov2d[1][1])/2.0,cov2d[0][1]));float epsilon=0.0001;float lambda1=mid+radius+epsilon,lambda2=mid-radius+epsilon;if (lambda2<0.0)
{return vec4(0.0,0.0,2.0,1.0);}
vec2 diagonalVector=normalize(vec2(cov2d[0][1],lambda1-cov2d[0][0]));vec2 majorAxis=min(sqrt(2.0*lambda1),1024.0)*diagonalVector;vec2 minorAxis=min(sqrt(2.0*lambda2),1024.0)*vec2(diagonalVector.y,-diagonalVector.x);vec2 vCenter=vec2(pos2d);return vec4(
vCenter 
+ ((meshPos.x*majorAxis
+ meshPos.y*minorAxis)*invViewport*pos2d.w)*scale,pos2d.zw);}`;
if (!ShaderStore.IncludesShadersStore[name$5]) {
  ShaderStore.IncludesShadersStore[name$5] = shader$5;
}
const name$4 = "gaussianSplattingVertexShader";
const shader$4 = `#include<__decl__gaussianSplattingVertex>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#include<logDepthDeclaration>
#include<helperFunctions>
attribute float splatIndex;uniform vec2 invViewport;uniform vec2 dataTextureSize;uniform vec2 focal;uniform sampler2D covariancesATexture;uniform sampler2D covariancesBTexture;uniform sampler2D centersTexture;uniform sampler2D colorsTexture;
#if SH_DEGREE>0
uniform highp usampler2D shTexture0;
#endif
#if SH_DEGREE>1
uniform highp usampler2D shTexture1;
#endif
#if SH_DEGREE>2
uniform highp usampler2D shTexture2;
#endif
varying vec4 vColor;varying vec2 vPosition;
#include<gaussianSplatting>
void main () {Splat splat=readSplat(splatIndex);vec3 covA=splat.covA.xyz;vec3 covB=vec3(splat.covA.w,splat.covB.xy);vec4 worldPos=world*vec4(splat.center.xyz,1.0);vColor=splat.color;vPosition=position;
#if SH_DEGREE>0
mat3 worldRot=mat3(world);mat3 normWorldRot=inverseMat3(worldRot);vec3 dir=normalize(normWorldRot*(worldPos.xyz-vEyePosition.xyz));dir*=vec3(1.,1.,-1.); 
vColor.xyz=computeSH(splat,splat.color.xyz,dir);
#endif
gl_Position=gaussianSplatting(position,worldPos.xyz,vec2(1.,1.),covA,covB,world,view,projection);
#include<clipPlaneVertex>
#include<fogVertex>
#include<logDepthVertex>
}
`;
if (!ShaderStore.ShadersStore[name$4]) {
  ShaderStore.ShadersStore[name$4] = shader$4;
}
const gaussianSplattingVertexShader = { name: name$4, shader: shader$4 };
const gaussianSplatting_vertex$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  gaussianSplattingVertexShader
}, Symbol.toStringTag, { value: "Module" }));
const name$3 = "gaussianSplattingFragmentDeclaration";
const shader$3 = `fn gaussianColor(inColor: vec4f,inPosition: vec2f)->vec4f
{var A : f32=-dot(inPosition,inPosition);if (A>-4.0)
{var B: f32=exp(A)*inColor.a;
#include<logDepthFragment>
var color: vec3f=inColor.rgb;
#ifdef FOG
#include<fogFragment>
#endif
return vec4f(color,B);} else {return vec4f(0.0);}}
`;
if (!ShaderStore.IncludesShadersStoreWGSL[name$3]) {
  ShaderStore.IncludesShadersStoreWGSL[name$3] = shader$3;
}
const name$2 = "gaussianSplattingPixelShader";
const shader$2 = `#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
varying vColor: vec4f;varying vPosition: vec2f;
#include<gaussianSplattingFragmentDeclaration>
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {
#include<clipPlaneFragment>
fragmentOutputs.color=gaussianColor(input.vColor,input.vPosition);}
`;
if (!ShaderStore.ShadersStoreWGSL[name$2]) {
  ShaderStore.ShadersStoreWGSL[name$2] = shader$2;
}
const gaussianSplattingPixelShaderWGSL = { name: name$2, shader: shader$2 };
const gaussianSplatting_fragment = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  gaussianSplattingPixelShaderWGSL
}, Symbol.toStringTag, { value: "Module" }));
const name$1 = "gaussianSplatting";
const shader$1 = `fn getDataUV(index: f32,dataTextureSize: vec2f)->vec2<f32> {let y: f32=floor(index/dataTextureSize.x);let x: f32=index-y*dataTextureSize.x;return vec2f((x+0.5),(y+0.5));}
struct Splat {center: vec4f,
color: vec4f,
covA: vec4f,
covB: vec4f,
#if SH_DEGREE>0
sh0: vec4<u32>,
#endif
#if SH_DEGREE>1
sh1: vec4<u32>,
#endif
#if SH_DEGREE>2
sh2: vec4<u32>,
#endif
};fn readSplat(splatIndex: f32,dataTextureSize: vec2f)->Splat {var splat: Splat;let splatUV=getDataUV(splatIndex,dataTextureSize);let splatUVi32=vec2<i32>(i32(splatUV.x),i32(splatUV.y));splat.center=textureLoad(centersTexture,splatUVi32,0);splat.color=textureLoad(colorsTexture,splatUVi32,0);splat.covA=textureLoad(covariancesATexture,splatUVi32,0)*splat.center.w;splat.covB=textureLoad(covariancesBTexture,splatUVi32,0)*splat.center.w;
#if SH_DEGREE>0
splat.sh0=textureLoad(shTexture0,splatUVi32,0);
#endif
#if SH_DEGREE>1
splat.sh1=textureLoad(shTexture1,splatUVi32,0);
#endif
#if SH_DEGREE>2
splat.sh2=textureLoad(shTexture2,splatUVi32,0);
#endif
return splat;}
fn computeColorFromSHDegree(dir: vec3f,sh: array<vec3<f32>,16>)->vec3f
{let SH_C0: f32=0.28209479;let SH_C1: f32=0.48860251;var SH_C2: array<f32,5>=array<f32,5>(
1.092548430,
-1.09254843,
0.315391565,
-1.09254843,
0.546274215
);var SH_C3: array<f32,7>=array<f32,7>(
-0.59004358,
2.890611442,
-0.45704579,
0.373176332,
-0.45704579,
1.445305721,
-0.59004358
);var result: vec3f=/*SH_C0**/sh[0];
#if SH_DEGREE>0
let x: f32=dir.x;let y: f32=dir.y;let z: f32=dir.z;result+=-SH_C1*y*sh[1]+SH_C1*z*sh[2]-SH_C1*x*sh[3];
#if SH_DEGREE>1
let xx: f32=x*x;let yy: f32=y*y;let zz: f32=z*z;let xy: f32=x*y;let yz: f32=y*z;let xz: f32=x*z;result+=
SH_C2[0]*xy*sh[4] +
SH_C2[1]*yz*sh[5] +
SH_C2[2]*(2.0f*zz-xx-yy)*sh[6] +
SH_C2[3]*xz*sh[7] +
SH_C2[4]*(xx-yy)*sh[8];
#if SH_DEGREE>2
result+=
SH_C3[0]*y*(3.0f*xx-yy)*sh[9] +
SH_C3[1]*xy*z*sh[10] +
SH_C3[2]*y*(4.0f*zz-xx-yy)*sh[11] +
SH_C3[3]*z*(2.0f*zz-3.0f*xx-3.0f*yy)*sh[12] +
SH_C3[4]*x*(4.0f*zz-xx-yy)*sh[13] +
SH_C3[5]*z*(xx-yy)*sh[14] +
SH_C3[6]*x*(xx-3.0f*yy)*sh[15];
#endif
#endif
#endif
return result;}
fn decompose(value: u32)->vec4f
{let components : vec4f=vec4f(
f32((value ) & 255u),
f32((value>>u32( 8)) & 255u),
f32((value>>u32(16)) & 255u),
f32((value>>u32(24)) & 255u));return components*vec4f(2./255.)-vec4f(1.);}
fn computeSH(splat: Splat,color: vec3f,dir: vec3f)->vec3f
{var sh: array<vec3<f32>,16>;sh[0]=color;
#if SH_DEGREE>0
let sh00: vec4f=decompose(splat.sh0.x);let sh01: vec4f=decompose(splat.sh0.y);let sh02: vec4f=decompose(splat.sh0.z);sh[1]=vec3f(sh00.x,sh00.y,sh00.z);sh[2]=vec3f(sh00.w,sh01.x,sh01.y);sh[3]=vec3f(sh01.z,sh01.w,sh02.x);
#endif
#if SH_DEGREE>1
let sh03: vec4f=decompose(splat.sh0.w);let sh04: vec4f=decompose(splat.sh1.x);let sh05: vec4f=decompose(splat.sh1.y);sh[4]=vec3f(sh02.y,sh02.z,sh02.w);sh[5]=vec3f(sh03.x,sh03.y,sh03.z);sh[6]=vec3f(sh03.w,sh04.x,sh04.y);sh[7]=vec3f(sh04.z,sh04.w,sh05.x);sh[8]=vec3f(sh05.y,sh05.z,sh05.w);
#endif
#if SH_DEGREE>2
let sh06: vec4f=decompose(splat.sh1.z);let sh07: vec4f=decompose(splat.sh1.w);let sh08: vec4f=decompose(splat.sh2.x);let sh09: vec4f=decompose(splat.sh2.y);let sh10: vec4f=decompose(splat.sh2.z);let sh11: vec4f=decompose(splat.sh2.w);sh[9]=vec3f(sh06.x,sh06.y,sh06.z);sh[10]=vec3f(sh06.w,sh07.x,sh07.y);sh[11]=vec3f(sh07.z,sh07.w,sh08.x);sh[12]=vec3f(sh08.y,sh08.z,sh08.w);sh[13]=vec3f(sh09.x,sh09.y,sh09.z);sh[14]=vec3f(sh09.w,sh10.x,sh10.y);sh[15]=vec3f(sh10.z,sh10.w,sh11.x); 
#endif
return computeColorFromSHDegree(dir,sh);}
fn gaussianSplatting(
meshPos: vec2<f32>,
worldPos: vec3<f32>,
scale: vec2<f32>,
covA: vec3<f32>,
covB: vec3<f32>,
worldMatrix: mat4x4<f32>,
viewMatrix: mat4x4<f32>,
projectionMatrix: mat4x4<f32>,
focal: vec2f,
invViewport: vec2f
)->vec4f {let modelView=viewMatrix*worldMatrix;let camspace=viewMatrix*vec4f(worldPos,1.0);let pos2d=projectionMatrix*camspace;let bounds=1.2*pos2d.w;if (pos2d.z<0. || pos2d.x<-bounds || pos2d.x>bounds || pos2d.y<-bounds || pos2d.y>bounds) {return vec4f(0.0,0.0,2.0,1.0);}
let Vrk=mat3x3<f32>(
covA.x,covA.y,covA.z,
covA.y,covB.x,covB.y,
covA.z,covB.y,covB.z
);let J=mat3x3<f32>(
focal.x/camspace.z,0.0,-(focal.x*camspace.x)/(camspace.z*camspace.z),
0.0,focal.y/camspace.z,-(focal.y*camspace.y)/(camspace.z*camspace.z),
0.0,0.0,0.0
);let invy=mat3x3<f32>(
1.0,0.0,0.0,
0.0,-1.0,0.0,
0.0,0.0,1.0
);let T=invy*transpose(mat3x3<f32>(
modelView[0].xyz,
modelView[1].xyz,
modelView[2].xyz))*J;let cov2d=transpose(T)*Vrk*T;let mid=(cov2d[0][0]+cov2d[1][1])/2.0;let radius=length(vec2<f32>((cov2d[0][0]-cov2d[1][1])/2.0,cov2d[0][1]));let lambda1=mid+radius;let lambda2=mid-radius;if (lambda2<0.0) {return vec4f(0.0,0.0,2.0,1.0);}
let diagonalVector=normalize(vec2<f32>(cov2d[0][1],lambda1-cov2d[0][0]));let majorAxis=min(sqrt(2.0*lambda1),1024.0)*diagonalVector;let minorAxis=min(sqrt(2.0*lambda2),1024.0)*vec2<f32>(diagonalVector.y,-diagonalVector.x);let vCenter=vec2<f32>(pos2d.x,pos2d.y);return vec4f(
vCenter+((meshPos.x*majorAxis+meshPos.y*minorAxis)*invViewport*pos2d.w)*scale,
pos2d.z,
pos2d.w
);}
`;
if (!ShaderStore.IncludesShadersStoreWGSL[name$1]) {
  ShaderStore.IncludesShadersStoreWGSL[name$1] = shader$1;
}
const name = "gaussianSplattingVertexShader";
const shader = `#include<sceneUboDeclaration>
#include<meshUboDeclaration>
#include<helperFunctions>
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#include<logDepthDeclaration>
attribute splatIndex: f32;attribute position: vec2f;uniform invViewport: vec2f;uniform dataTextureSize: vec2f;uniform focal: vec2f;var covariancesATexture: texture_2d<f32>;var covariancesBTexture: texture_2d<f32>;var centersTexture: texture_2d<f32>;var colorsTexture: texture_2d<f32>;
#if SH_DEGREE>0
var shTexture0: texture_2d<u32>;
#endif
#if SH_DEGREE>1
var shTexture1: texture_2d<u32>;
#endif
#if SH_DEGREE>2
var shTexture2: texture_2d<u32>;
#endif
varying vColor: vec4f;varying vPosition: vec2f;
#include<gaussianSplatting>
@vertex
fn main(input : VertexInputs)->FragmentInputs {var splat: Splat=readSplat(input.splatIndex,uniforms.dataTextureSize);var covA: vec3f=splat.covA.xyz;var covB: vec3f=vec3f(splat.covA.w,splat.covB.xy);let worldPos: vec4f=mesh.world*vec4f(splat.center.xyz,1.0);vertexOutputs.vPosition=input.position;
#if SH_DEGREE>0
let worldRot: mat3x3f= mat3x3f(mesh.world[0].xyz,mesh.world[1].xyz,mesh.world[2].xyz);let normWorldRot: mat3x3f=inverseMat3(worldRot);var dir: vec3f=normalize(normWorldRot*(worldPos.xyz-scene.vEyePosition.xyz));dir*=vec3f(1.,1.,-1.); 
vertexOutputs.vColor=vec4f(computeSH(splat,splat.color.xyz,dir),1.0);
#else
vertexOutputs.vColor=splat.color;
#endif
vertexOutputs.position=gaussianSplatting(input.position,worldPos.xyz,vec2f(1.0,1.0),covA,covB,mesh.world,scene.view,scene.projection,uniforms.focal,uniforms.invViewport);
#include<clipPlaneVertex>
#include<fogVertex>
#include<logDepthVertex>
}
`;
if (!ShaderStore.ShadersStoreWGSL[name]) {
  ShaderStore.ShadersStoreWGSL[name] = shader;
}
const gaussianSplattingVertexShaderWGSL = { name, shader };
const gaussianSplatting_vertex = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  gaussianSplattingVertexShaderWGSL
}, Symbol.toStringTag, { value: "Module" }));
class GaussianSplattingMaterialDefines extends MaterialDefines {
  /**
   * Constructor of the defines.
   */
  constructor() {
    super();
    this.FOG = false;
    this.THIN_INSTANCES = true;
    this.LOGARITHMICDEPTH = false;
    this.CLIPPLANE = false;
    this.CLIPPLANE2 = false;
    this.CLIPPLANE3 = false;
    this.CLIPPLANE4 = false;
    this.CLIPPLANE5 = false;
    this.CLIPPLANE6 = false;
    this.SH_DEGREE = 0;
    this.rebuild();
  }
}
class GaussianSplattingMaterial extends PushMaterial {
  /**
   * Instantiates a Gaussian Splatting Material in the given scene
   * @param name The friendly name of the material
   * @param scene The scene to add the material to
   */
  constructor(name2, scene) {
    super(name2, scene);
    this.backFaceCulling = false;
  }
  /**
   * Gets a boolean indicating that current material needs to register RTT
   */
  get hasRenderTargetTextures() {
    return false;
  }
  /**
   * Specifies whether or not this material should be rendered in alpha test mode.
   * @returns false
   */
  needAlphaTesting() {
    return false;
  }
  /**
   * Specifies whether or not this material should be rendered in alpha blend mode.
   * @returns true
   */
  needAlphaBlending() {
    return true;
  }
  /**
   * Checks whether the material is ready to be rendered for a given mesh.
   * @param mesh The mesh to render
   * @param subMesh The submesh to check against
   * @returns true if all the dependencies are ready (Textures, Effects...)
   */
  isReadyForSubMesh(mesh, subMesh) {
    const useInstances = true;
    const drawWrapper = subMesh._drawWrapper;
    if (drawWrapper.effect && this.isFrozen) {
      if (drawWrapper._wasPreviouslyReady && drawWrapper._wasPreviouslyUsingInstances === useInstances) {
        return true;
      }
    }
    if (!subMesh.materialDefines) {
      subMesh.materialDefines = new GaussianSplattingMaterialDefines();
    }
    const scene = this.getScene();
    const defines = subMesh.materialDefines;
    if (this._isReadyForSubMesh(subMesh)) {
      return true;
    }
    const engine = scene.getEngine();
    PrepareDefinesForMisc(mesh, scene, this._useLogarithmicDepth, this.pointsCloud, this.fogEnabled, false, defines);
    PrepareDefinesForFrameBoundValues(scene, engine, this, defines, useInstances, null, true);
    PrepareDefinesForAttributes(mesh, defines, false, false);
    if (engine.version > 1 || engine.isWebGPU) {
      defines["SH_DEGREE"] = mesh.shDegree;
    }
    if (defines.isDirty) {
      defines.markAsProcessed();
      scene.resetCachedMaterial();
      const attribs = [VertexBuffer.PositionKind, "splatIndex"];
      PrepareAttributesForInstances(attribs, defines);
      const uniforms = ["world", "view", "projection", "vFogInfos", "vFogColor", "logarithmicDepthConstant", "invViewport", "dataTextureSize", "focal", "vEyePosition"];
      const samplers = ["covariancesATexture", "covariancesBTexture", "centersTexture", "colorsTexture", "shTexture0", "shTexture1", "shTexture2"];
      const uniformBuffers = ["Scene", "Mesh"];
      PrepareUniformsAndSamplersList({
        uniformsNames: uniforms,
        uniformBuffersNames: uniformBuffers,
        samplers,
        defines
      });
      addClipPlaneUniforms(uniforms);
      const join = defines.toString();
      const effect = scene.getEngine().createEffect("gaussianSplatting", {
        attributes: attribs,
        uniformsNames: uniforms,
        uniformBuffersNames: uniformBuffers,
        samplers,
        defines: join,
        onCompiled: this.onCompiled,
        onError: this.onError,
        indexParameters: {},
        shaderLanguage: this._shaderLanguage,
        extraInitializationsAsync: async () => {
          if (this._shaderLanguage === 1) {
            await Promise.all([__vitePreload(() => Promise.resolve().then(() => gaussianSplatting_fragment), true ? void 0 : void 0, import.meta.url), __vitePreload(() => Promise.resolve().then(() => gaussianSplatting_vertex), true ? void 0 : void 0, import.meta.url)]);
          } else {
            await Promise.all([__vitePreload(() => Promise.resolve().then(() => gaussianSplatting_fragment$1), true ? void 0 : void 0, import.meta.url), __vitePreload(() => Promise.resolve().then(() => gaussianSplatting_vertex$1), true ? void 0 : void 0, import.meta.url)]);
          }
        }
      }, engine);
      subMesh.setEffect(effect, defines, this._materialContext);
    }
    if (!subMesh.effect || !subMesh.effect.isReady()) {
      return false;
    }
    defines._renderId = scene.getRenderId();
    drawWrapper._wasPreviouslyReady = true;
    drawWrapper._wasPreviouslyUsingInstances = useInstances;
    return true;
  }
  /**
   * Bind material effect for a specific Gaussian Splatting mesh
   * @param mesh Gaussian splatting mesh
   * @param effect Splatting material or node material
   * @param scene scene that contains mesh and camera used for rendering
   */
  static BindEffect(mesh, effect, scene) {
    var _a, _b;
    const engine = scene.getEngine();
    const camera = scene.activeCamera;
    const renderWidth = engine.getRenderWidth();
    const renderHeight = engine.getRenderHeight();
    const numberOfRigs = ((_a = camera == null ? void 0 : camera.rigParent) == null ? void 0 : _a.rigCameras.length) || 1;
    effect.setFloat2("invViewport", 1 / (renderWidth / numberOfRigs), 1 / renderHeight);
    let focal = 1e3;
    if (camera) {
      const t = camera.getProjectionMatrix().m[5];
      if (camera.fovMode == Camera.FOVMODE_VERTICAL_FIXED) {
        focal = renderHeight * t / 2;
      } else {
        focal = renderWidth * t / 2;
      }
    }
    effect.setFloat2("focal", focal, focal);
    const gsMesh = mesh;
    if (gsMesh.covariancesATexture) {
      const textureSize = gsMesh.covariancesATexture.getSize();
      effect.setFloat2("dataTextureSize", textureSize.width, textureSize.height);
      effect.setTexture("covariancesATexture", gsMesh.covariancesATexture);
      effect.setTexture("covariancesBTexture", gsMesh.covariancesBTexture);
      effect.setTexture("centersTexture", gsMesh.centersTexture);
      effect.setTexture("colorsTexture", gsMesh.colorsTexture);
      if (gsMesh.shTextures) {
        for (let i = 0; i < ((_b = gsMesh.shTextures) == null ? void 0 : _b.length); i++) {
          effect.setTexture(`shTexture${i}`, gsMesh.shTextures[i]);
        }
      }
    }
  }
  /**
   * Binds the submesh to this material by preparing the effect and shader to draw
   * @param world defines the world transformation matrix
   * @param mesh defines the mesh containing the submesh
   * @param subMesh defines the submesh to bind the material to
   */
  bindForSubMesh(world, mesh, subMesh) {
    const scene = this.getScene();
    const defines = subMesh.materialDefines;
    if (!defines) {
      return;
    }
    const effect = subMesh.effect;
    if (!effect) {
      return;
    }
    this._activeEffect = effect;
    mesh.getMeshUniformBuffer().bindToEffect(effect, "Mesh");
    mesh.transferToEffect(world);
    const mustRebind = this._mustRebind(scene, effect, subMesh, mesh.visibility);
    if (mustRebind) {
      this.bindView(effect);
      this.bindViewProjection(effect);
      GaussianSplattingMaterial.BindEffect(mesh, this._activeEffect, scene);
      bindClipPlane(effect, this, scene);
    } else if (scene.getEngine()._features.needToAlwaysBindUniformBuffers) {
      this._needToBindSceneUbo = true;
    }
    BindFogParameters(scene, mesh, effect);
    if (this.useLogarithmicDepth) {
      BindLogDepth(defines, effect, scene);
    }
    this._afterBind(mesh, this._activeEffect, subMesh);
  }
  /**
   * Clones the material.
   * @param name The cloned name.
   * @returns The cloned material.
   */
  clone(name2) {
    return SerializationHelper.Clone(() => new GaussianSplattingMaterial(name2, this.getScene()), this);
  }
  /**
   * Serializes the current material to its JSON representation.
   * @returns The JSON representation.
   */
  serialize() {
    const serializationObject = super.serialize();
    serializationObject.customType = "BABYLON.GaussianSplattingMaterial";
    return serializationObject;
  }
  /**
   * Gets the class name of the material
   * @returns "GaussianSplattingMaterial"
   */
  getClassName() {
    return "GaussianSplattingMaterial";
  }
  /**
   * Parse a JSON input to create back a Gaussian Splatting material.
   * @param source The JSON data to parse
   * @param scene The scene to create the parsed material in
   * @param rootUrl The root url of the assets the material depends upon
   * @returns the instantiated GaussianSplattingMaterial.
   */
  static Parse(source, scene, rootUrl) {
    return SerializationHelper.Parse(() => new GaussianSplattingMaterial(source.name, scene), source, scene, rootUrl);
  }
}
RegisterClass("BABYLON.GaussianSplattingMaterial", GaussianSplattingMaterial);
const HCF = HighestCommonFactor;
const Scalar = {
  ...functions,
  /**
   * Two pi constants convenient for computation.
   */
  TwoPi: Math.PI * 2,
  /**
   * Returns -1 if value is negative and +1 is value is positive.
   * @param value the value
   * @returns the value itself if it's equal to zero.
   */
  Sign: Math.sign,
  /**
   * the log2 of value.
   * @param value the value to compute log2 of
   * @returns the log2 of value.
   */
  Log2: Math.log2,
  /**
   * Returns the highest common factor of two integers.
   * @param a first parameter
   * @param b second parameter
   * @returns HCF of a and b
   */
  HCF
};
const unpackUnorm = (value, bits) => {
  const t = (1 << bits) - 1;
  return (value & t) / t;
};
const unpack111011 = (value, result) => {
  result.x = unpackUnorm(value >>> 21, 11);
  result.y = unpackUnorm(value >>> 11, 10);
  result.z = unpackUnorm(value, 11);
};
const unpack8888 = (value, result) => {
  result[0] = unpackUnorm(value >>> 24, 8) * 255;
  result[1] = unpackUnorm(value >>> 16, 8) * 255;
  result[2] = unpackUnorm(value >>> 8, 8) * 255;
  result[3] = unpackUnorm(value, 8) * 255;
};
const unpackRot = (value, result) => {
  const norm = 1 / (Math.sqrt(2) * 0.5);
  const a = (unpackUnorm(value >>> 20, 10) - 0.5) * norm;
  const b = (unpackUnorm(value >>> 10, 10) - 0.5) * norm;
  const c = (unpackUnorm(value, 10) - 0.5) * norm;
  const m = Math.sqrt(1 - (a * a + b * b + c * c));
  switch (value >>> 30) {
    case 0:
      result.set(m, a, b, c);
      break;
    case 1:
      result.set(a, m, b, c);
      break;
    case 2:
      result.set(a, b, m, c);
      break;
    case 3:
      result.set(a, b, c, m);
      break;
  }
};
var PLYType;
(function(PLYType2) {
  PLYType2[PLYType2["FLOAT"] = 0] = "FLOAT";
  PLYType2[PLYType2["INT"] = 1] = "INT";
  PLYType2[PLYType2["UINT"] = 2] = "UINT";
  PLYType2[PLYType2["DOUBLE"] = 3] = "DOUBLE";
  PLYType2[PLYType2["UCHAR"] = 4] = "UCHAR";
  PLYType2[PLYType2["UNDEFINED"] = 5] = "UNDEFINED";
})(PLYType || (PLYType = {}));
var PLYValue;
(function(PLYValue2) {
  PLYValue2[PLYValue2["MIN_X"] = 0] = "MIN_X";
  PLYValue2[PLYValue2["MIN_Y"] = 1] = "MIN_Y";
  PLYValue2[PLYValue2["MIN_Z"] = 2] = "MIN_Z";
  PLYValue2[PLYValue2["MAX_X"] = 3] = "MAX_X";
  PLYValue2[PLYValue2["MAX_Y"] = 4] = "MAX_Y";
  PLYValue2[PLYValue2["MAX_Z"] = 5] = "MAX_Z";
  PLYValue2[PLYValue2["MIN_SCALE_X"] = 6] = "MIN_SCALE_X";
  PLYValue2[PLYValue2["MIN_SCALE_Y"] = 7] = "MIN_SCALE_Y";
  PLYValue2[PLYValue2["MIN_SCALE_Z"] = 8] = "MIN_SCALE_Z";
  PLYValue2[PLYValue2["MAX_SCALE_X"] = 9] = "MAX_SCALE_X";
  PLYValue2[PLYValue2["MAX_SCALE_Y"] = 10] = "MAX_SCALE_Y";
  PLYValue2[PLYValue2["MAX_SCALE_Z"] = 11] = "MAX_SCALE_Z";
  PLYValue2[PLYValue2["PACKED_POSITION"] = 12] = "PACKED_POSITION";
  PLYValue2[PLYValue2["PACKED_ROTATION"] = 13] = "PACKED_ROTATION";
  PLYValue2[PLYValue2["PACKED_SCALE"] = 14] = "PACKED_SCALE";
  PLYValue2[PLYValue2["PACKED_COLOR"] = 15] = "PACKED_COLOR";
  PLYValue2[PLYValue2["X"] = 16] = "X";
  PLYValue2[PLYValue2["Y"] = 17] = "Y";
  PLYValue2[PLYValue2["Z"] = 18] = "Z";
  PLYValue2[PLYValue2["SCALE_0"] = 19] = "SCALE_0";
  PLYValue2[PLYValue2["SCALE_1"] = 20] = "SCALE_1";
  PLYValue2[PLYValue2["SCALE_2"] = 21] = "SCALE_2";
  PLYValue2[PLYValue2["DIFFUSE_RED"] = 22] = "DIFFUSE_RED";
  PLYValue2[PLYValue2["DIFFUSE_GREEN"] = 23] = "DIFFUSE_GREEN";
  PLYValue2[PLYValue2["DIFFUSE_BLUE"] = 24] = "DIFFUSE_BLUE";
  PLYValue2[PLYValue2["OPACITY"] = 25] = "OPACITY";
  PLYValue2[PLYValue2["F_DC_0"] = 26] = "F_DC_0";
  PLYValue2[PLYValue2["F_DC_1"] = 27] = "F_DC_1";
  PLYValue2[PLYValue2["F_DC_2"] = 28] = "F_DC_2";
  PLYValue2[PLYValue2["F_DC_3"] = 29] = "F_DC_3";
  PLYValue2[PLYValue2["ROT_0"] = 30] = "ROT_0";
  PLYValue2[PLYValue2["ROT_1"] = 31] = "ROT_1";
  PLYValue2[PLYValue2["ROT_2"] = 32] = "ROT_2";
  PLYValue2[PLYValue2["ROT_3"] = 33] = "ROT_3";
  PLYValue2[PLYValue2["MIN_COLOR_R"] = 34] = "MIN_COLOR_R";
  PLYValue2[PLYValue2["MIN_COLOR_G"] = 35] = "MIN_COLOR_G";
  PLYValue2[PLYValue2["MIN_COLOR_B"] = 36] = "MIN_COLOR_B";
  PLYValue2[PLYValue2["MAX_COLOR_R"] = 37] = "MAX_COLOR_R";
  PLYValue2[PLYValue2["MAX_COLOR_G"] = 38] = "MAX_COLOR_G";
  PLYValue2[PLYValue2["MAX_COLOR_B"] = 39] = "MAX_COLOR_B";
  PLYValue2[PLYValue2["SH_0"] = 40] = "SH_0";
  PLYValue2[PLYValue2["SH_1"] = 41] = "SH_1";
  PLYValue2[PLYValue2["SH_2"] = 42] = "SH_2";
  PLYValue2[PLYValue2["SH_3"] = 43] = "SH_3";
  PLYValue2[PLYValue2["SH_4"] = 44] = "SH_4";
  PLYValue2[PLYValue2["SH_5"] = 45] = "SH_5";
  PLYValue2[PLYValue2["SH_6"] = 46] = "SH_6";
  PLYValue2[PLYValue2["SH_7"] = 47] = "SH_7";
  PLYValue2[PLYValue2["SH_8"] = 48] = "SH_8";
  PLYValue2[PLYValue2["SH_9"] = 49] = "SH_9";
  PLYValue2[PLYValue2["SH_10"] = 50] = "SH_10";
  PLYValue2[PLYValue2["SH_11"] = 51] = "SH_11";
  PLYValue2[PLYValue2["SH_12"] = 52] = "SH_12";
  PLYValue2[PLYValue2["SH_13"] = 53] = "SH_13";
  PLYValue2[PLYValue2["SH_14"] = 54] = "SH_14";
  PLYValue2[PLYValue2["SH_15"] = 55] = "SH_15";
  PLYValue2[PLYValue2["SH_16"] = 56] = "SH_16";
  PLYValue2[PLYValue2["SH_17"] = 57] = "SH_17";
  PLYValue2[PLYValue2["SH_18"] = 58] = "SH_18";
  PLYValue2[PLYValue2["SH_19"] = 59] = "SH_19";
  PLYValue2[PLYValue2["SH_20"] = 60] = "SH_20";
  PLYValue2[PLYValue2["SH_21"] = 61] = "SH_21";
  PLYValue2[PLYValue2["SH_22"] = 62] = "SH_22";
  PLYValue2[PLYValue2["SH_23"] = 63] = "SH_23";
  PLYValue2[PLYValue2["SH_24"] = 64] = "SH_24";
  PLYValue2[PLYValue2["SH_25"] = 65] = "SH_25";
  PLYValue2[PLYValue2["SH_26"] = 66] = "SH_26";
  PLYValue2[PLYValue2["SH_27"] = 67] = "SH_27";
  PLYValue2[PLYValue2["SH_28"] = 68] = "SH_28";
  PLYValue2[PLYValue2["SH_29"] = 69] = "SH_29";
  PLYValue2[PLYValue2["SH_30"] = 70] = "SH_30";
  PLYValue2[PLYValue2["SH_31"] = 71] = "SH_31";
  PLYValue2[PLYValue2["SH_32"] = 72] = "SH_32";
  PLYValue2[PLYValue2["SH_33"] = 73] = "SH_33";
  PLYValue2[PLYValue2["SH_34"] = 74] = "SH_34";
  PLYValue2[PLYValue2["SH_35"] = 75] = "SH_35";
  PLYValue2[PLYValue2["SH_36"] = 76] = "SH_36";
  PLYValue2[PLYValue2["SH_37"] = 77] = "SH_37";
  PLYValue2[PLYValue2["SH_38"] = 78] = "SH_38";
  PLYValue2[PLYValue2["SH_39"] = 79] = "SH_39";
  PLYValue2[PLYValue2["SH_40"] = 80] = "SH_40";
  PLYValue2[PLYValue2["SH_41"] = 81] = "SH_41";
  PLYValue2[PLYValue2["SH_42"] = 82] = "SH_42";
  PLYValue2[PLYValue2["SH_43"] = 83] = "SH_43";
  PLYValue2[PLYValue2["SH_44"] = 84] = "SH_44";
  PLYValue2[PLYValue2["UNDEFINED"] = 85] = "UNDEFINED";
})(PLYValue || (PLYValue = {}));
class GaussianSplattingMesh extends Mesh {
  /**
   * SH degree. 0 = no sh (default). 1 = 3 parameters. 2 = 8 parameters. 3 = 15 parameters.
   */
  get shDegree() {
    return this._shDegree;
  }
  /**
   * returns the splats data array buffer that contains in order : postions (3 floats), size (3 floats), color (4 bytes), orientation quaternion (4 bytes)
   */
  get splatsData() {
    return this._splatsData;
  }
  /**
   * Gets the covariancesA texture
   */
  get covariancesATexture() {
    return this._covariancesATexture;
  }
  /**
   * Gets the covariancesB texture
   */
  get covariancesBTexture() {
    return this._covariancesBTexture;
  }
  /**
   * Gets the centers texture
   */
  get centersTexture() {
    return this._centersTexture;
  }
  /**
   * Gets the colors texture
   */
  get colorsTexture() {
    return this._colorsTexture;
  }
  /**
   * Gets the SH textures
   */
  get shTextures() {
    return this._shTextures;
  }
  /**
   * set rendering material
   */
  set material(value) {
    this._material = value;
    this._material.backFaceCulling = true;
    this._material.cullBackFaces = false;
    value.resetDrawCache();
  }
  /**
   * get rendering material
   */
  get material() {
    return this._material;
  }
  /**
   * Creates a new gaussian splatting mesh
   * @param name defines the name of the mesh
   * @param url defines the url to load from (optional)
   * @param scene defines the hosting scene (optional)
   * @param keepInRam keep datas in ram for editing purpose
   */
  constructor(name2, url = null, scene = null, keepInRam = false) {
    super(name2, scene);
    this._vertexCount = 0;
    this._worker = null;
    this._frameIdLastUpdate = -1;
    this._modelViewMatrix = Matrix.Identity();
    this._canPostToWorker = true;
    this._readyToDisplay = false;
    this._covariancesATexture = null;
    this._covariancesBTexture = null;
    this._centersTexture = null;
    this._colorsTexture = null;
    this._splatPositions = null;
    this._splatIndex = null;
    this._shTextures = null;
    this._splatsData = null;
    this._sh = null;
    this._keepInRam = false;
    this._delayedTextureUpdate = null;
    this._oldDirection = new Vector3();
    this._useRGBACovariants = false;
    this._material = null;
    this._tmpCovariances = [0, 0, 0, 0, 0, 0];
    this._sortIsDirty = false;
    this._shDegree = 0;
    const vertexData = new VertexData();
    vertexData.positions = [-3, -2, 0, 3, -2, 0, 0, 4, 0];
    vertexData.indices = [0, 1, 2];
    vertexData.applyToMesh(this);
    this.subMeshes = [];
    new SubMesh(0, 0, 3, 0, 3, this);
    this.setEnabled(false);
    this._useRGBACovariants = !this.getEngine().isWebGPU && this.getEngine().version === 1;
    this._keepInRam = keepInRam;
    if (url) {
      this.loadFileAsync(url);
    }
    this._material = new GaussianSplattingMaterial(this.name + "_material", this._scene);
  }
  /**
   * Returns the class name
   * @returns "GaussianSplattingMesh"
   */
  getClassName() {
    return "GaussianSplattingMesh";
  }
  /**
   * Returns the total number of vertices (splats) within the mesh
   * @returns the total number of vertices
   */
  getTotalVertices() {
    return this._vertexCount;
  }
  /**
   * Is this node ready to be used/rendered
   * @param completeCheck defines if a complete check (including materials and lights) has to be done (false by default)
   * @returns true when ready
   */
  isReady(completeCheck = false) {
    if (!super.isReady(completeCheck, true)) {
      return false;
    }
    if (!this._readyToDisplay) {
      this._postToWorker(true);
      return false;
    }
    return true;
  }
  /** @internal */
  _postToWorker(forced = false) {
    const frameId = this.getScene().getFrameId();
    if ((forced || frameId !== this._frameIdLastUpdate) && this._worker && this._scene.activeCamera && this._canPostToWorker) {
      const cameraMatrix = this._scene.activeCamera.getViewMatrix();
      this.getWorldMatrix().multiplyToRef(cameraMatrix, this._modelViewMatrix);
      cameraMatrix.invertToRef(TmpVectors.Matrix[0]);
      this.getWorldMatrix().multiplyToRef(TmpVectors.Matrix[0], TmpVectors.Matrix[1]);
      Vector3.TransformNormalToRef(Vector3.Forward(this._scene.useRightHandedSystem), TmpVectors.Matrix[1], TmpVectors.Vector3[2]);
      TmpVectors.Vector3[2].normalize();
      const dot = Vector3.Dot(TmpVectors.Vector3[2], this._oldDirection);
      if (forced || Math.abs(dot - 1) >= 0.01) {
        this._oldDirection.copyFrom(TmpVectors.Vector3[2]);
        this._frameIdLastUpdate = frameId;
        this._canPostToWorker = false;
        this._worker.postMessage({ view: this._modelViewMatrix.m, depthMix: this._depthMix, useRightHandedSystem: this._scene.useRightHandedSystem }, [
          this._depthMix.buffer
        ]);
      }
    }
  }
  /**
   * Triggers the draw call for the mesh. Usually, you don't need to call this method by your own because the mesh rendering is handled by the scene rendering manager
   * @param subMesh defines the subMesh to render
   * @param enableAlphaMode defines if alpha mode can be changed
   * @param effectiveMeshReplacement defines an optional mesh used to provide info for the rendering
   * @returns the current mesh
   */
  render(subMesh, enableAlphaMode, effectiveMeshReplacement) {
    this._postToWorker();
    return super.render(subMesh, enableAlphaMode, effectiveMeshReplacement);
  }
  static _TypeNameToEnum(name2) {
    switch (name2) {
      case "float":
        return 0;
      case "int":
        return 1;
      case "uint":
        return 2;
      case "double":
        return 3;
      case "uchar":
        return 4;
    }
    return 5;
  }
  static _ValueNameToEnum(name2) {
    switch (name2) {
      case "min_x":
        return 0;
      case "min_y":
        return 1;
      case "min_z":
        return 2;
      case "max_x":
        return 3;
      case "max_y":
        return 4;
      case "max_z":
        return 5;
      case "min_scale_x":
        return 6;
      case "min_scale_y":
        return 7;
      case "min_scale_z":
        return 8;
      case "max_scale_x":
        return 9;
      case "max_scale_y":
        return 10;
      case "max_scale_z":
        return 11;
      case "packed_position":
        return 12;
      case "packed_rotation":
        return 13;
      case "packed_scale":
        return 14;
      case "packed_color":
        return 15;
      case "x":
        return 16;
      case "y":
        return 17;
      case "z":
        return 18;
      case "scale_0":
        return 19;
      case "scale_1":
        return 20;
      case "scale_2":
        return 21;
      case "diffuse_red":
      case "red":
        return 22;
      case "diffuse_green":
      case "green":
        return 23;
      case "diffuse_blue":
      case "blue":
        return 24;
      case "f_dc_0":
        return 26;
      case "f_dc_1":
        return 27;
      case "f_dc_2":
        return 28;
      case "f_dc_3":
        return 29;
      case "opacity":
        return 25;
      case "rot_0":
        return 30;
      case "rot_1":
        return 31;
      case "rot_2":
        return 32;
      case "rot_3":
        return 33;
      case "min_r":
        return 34;
      case "min_g":
        return 35;
      case "min_b":
        return 36;
      case "max_r":
        return 37;
      case "max_g":
        return 38;
      case "max_b":
        return 39;
      case "f_rest_0":
        return 40;
      case "f_rest_1":
        return 41;
      case "f_rest_2":
        return 42;
      case "f_rest_3":
        return 43;
      case "f_rest_4":
        return 44;
      case "f_rest_5":
        return 45;
      case "f_rest_6":
        return 46;
      case "f_rest_7":
        return 47;
      case "f_rest_8":
        return 48;
      case "f_rest_9":
        return 49;
      case "f_rest_10":
        return 50;
      case "f_rest_11":
        return 51;
      case "f_rest_12":
        return 52;
      case "f_rest_13":
        return 53;
      case "f_rest_14":
        return 54;
      case "f_rest_15":
        return 55;
      case "f_rest_16":
        return 56;
      case "f_rest_17":
        return 57;
      case "f_rest_18":
        return 58;
      case "f_rest_19":
        return 59;
      case "f_rest_20":
        return 60;
      case "f_rest_21":
        return 61;
      case "f_rest_22":
        return 62;
      case "f_rest_23":
        return 63;
      case "f_rest_24":
        return 64;
      case "f_rest_25":
        return 65;
      case "f_rest_26":
        return 66;
      case "f_rest_27":
        return 67;
      case "f_rest_28":
        return 68;
      case "f_rest_29":
        return 69;
      case "f_rest_30":
        return 70;
      case "f_rest_31":
        return 71;
      case "f_rest_32":
        return 72;
      case "f_rest_33":
        return 73;
      case "f_rest_34":
        return 74;
      case "f_rest_35":
        return 75;
      case "f_rest_36":
        return 76;
      case "f_rest_37":
        return 77;
      case "f_rest_38":
        return 78;
      case "f_rest_39":
        return 79;
      case "f_rest_40":
        return 80;
      case "f_rest_41":
        return 81;
      case "f_rest_42":
        return 82;
      case "f_rest_43":
        return 83;
      case "f_rest_44":
        return 84;
    }
    return 85;
  }
  /**
   * Parse a PLY file header and returns metas infos on splats and chunks
   * @param data the loaded buffer
   * @returns a PLYHeader
   */
  static ParseHeader(data) {
    const ubuf = new Uint8Array(data);
    const header = new TextDecoder().decode(ubuf.slice(0, 1024 * 10));
    const headerEnd = "end_header\n";
    const headerEndIndex = header.indexOf(headerEnd);
    if (headerEndIndex < 0 || !header) {
      return null;
    }
    const vertexCount = parseInt(/element vertex (\d+)\n/.exec(header)[1]);
    const chunkElement = /element chunk (\d+)\n/.exec(header);
    let chunkCount = 0;
    if (chunkElement) {
      chunkCount = parseInt(chunkElement[1]);
    }
    let rowVertexOffset = 0;
    let rowChunkOffset = 0;
    const offsets = {
      double: 8,
      int: 4,
      uint: 4,
      float: 4,
      short: 2,
      ushort: 2,
      uchar: 1,
      list: 0
    };
    let ElementMode;
    (function(ElementMode2) {
      ElementMode2[ElementMode2["Vertex"] = 0] = "Vertex";
      ElementMode2[ElementMode2["Chunk"] = 1] = "Chunk";
    })(ElementMode || (ElementMode = {}));
    let chunkMode = 1;
    const vertexProperties = [];
    const chunkProperties = [];
    const filtered = header.slice(0, headerEndIndex).split("\n");
    let shDegree = 0;
    for (const prop of filtered) {
      if (prop.startsWith("property ")) {
        const [, typeName, name2] = prop.split(" ");
        const value = GaussianSplattingMesh._ValueNameToEnum(name2);
        if (value >= 84) {
          shDegree = 3;
        } else if (value >= 64) {
          shDegree = 2;
        } else if (value >= 48) {
          shDegree = 1;
        }
        const type = GaussianSplattingMesh._TypeNameToEnum(typeName);
        if (chunkMode == 1) {
          chunkProperties.push({ value, type, offset: rowChunkOffset });
          rowChunkOffset += offsets[typeName];
        } else if (chunkMode == 0) {
          vertexProperties.push({ value, type, offset: rowVertexOffset });
          rowVertexOffset += offsets[typeName];
        }
        if (!offsets[typeName]) {
          Logger.Warn(`Unsupported property type: ${typeName}.`);
        }
      } else if (prop.startsWith("element ")) {
        const [, type] = prop.split(" ");
        if (type == "chunk") {
          chunkMode = 1;
        } else if (type == "vertex") {
          chunkMode = 0;
        }
      }
    }
    const dataView = new DataView(data, headerEndIndex + headerEnd.length);
    const buffer = new ArrayBuffer(GaussianSplattingMesh._RowOutputLength * vertexCount);
    let shBuffer = null;
    let shCoefficientCount = 0;
    if (shDegree) {
      const shVectorCount = (shDegree + 1) * (shDegree + 1) - 1;
      shCoefficientCount = shVectorCount * 3;
      shBuffer = new ArrayBuffer(shCoefficientCount * vertexCount);
    }
    return {
      vertexCount,
      chunkCount,
      rowVertexLength: rowVertexOffset,
      rowChunkLength: rowChunkOffset,
      vertexProperties,
      chunkProperties,
      dataView,
      buffer,
      shDegree,
      shCoefficientCount,
      shBuffer
    };
  }
  static _GetCompressedChunks(header, offset) {
    if (!header.chunkCount) {
      return null;
    }
    const dataView = header.dataView;
    const compressedChunks = new Array(header.chunkCount);
    for (let i = 0; i < header.chunkCount; i++) {
      const currentChunk = {
        min: new Vector3(),
        max: new Vector3(),
        minScale: new Vector3(),
        maxScale: new Vector3(),
        minColor: new Vector3(0, 0, 0),
        maxColor: new Vector3(1, 1, 1)
      };
      compressedChunks[i] = currentChunk;
      for (let propertyIndex = 0; propertyIndex < header.chunkProperties.length; propertyIndex++) {
        const property = header.chunkProperties[propertyIndex];
        let value;
        switch (property.type) {
          case 0:
            value = dataView.getFloat32(property.offset + offset.value, true);
            break;
          default:
            continue;
        }
        switch (property.value) {
          case 0:
            currentChunk.min.x = value;
            break;
          case 1:
            currentChunk.min.y = value;
            break;
          case 2:
            currentChunk.min.z = value;
            break;
          case 3:
            currentChunk.max.x = value;
            break;
          case 4:
            currentChunk.max.y = value;
            break;
          case 5:
            currentChunk.max.z = value;
            break;
          case 6:
            currentChunk.minScale.x = value;
            break;
          case 7:
            currentChunk.minScale.y = value;
            break;
          case 8:
            currentChunk.minScale.z = value;
            break;
          case 9:
            currentChunk.maxScale.x = value;
            break;
          case 10:
            currentChunk.maxScale.y = value;
            break;
          case 11:
            currentChunk.maxScale.z = value;
            break;
          case 34:
            currentChunk.minColor.x = value;
            break;
          case 35:
            currentChunk.minColor.y = value;
            break;
          case 36:
            currentChunk.minColor.z = value;
            break;
          case 37:
            currentChunk.maxColor.x = value;
            break;
          case 38:
            currentChunk.maxColor.y = value;
            break;
          case 39:
            currentChunk.maxColor.z = value;
            break;
        }
      }
      offset.value += header.rowChunkLength;
    }
    return compressedChunks;
  }
  static _GetSplat(header, index, compressedChunks, offset) {
    const q = TmpVectors.Quaternion[0];
    const temp3 = TmpVectors.Vector3[0];
    const rowOutputLength = GaussianSplattingMesh._RowOutputLength;
    const buffer = header.buffer;
    const dataView = header.dataView;
    const position = new Float32Array(buffer, index * rowOutputLength, 3);
    const scale = new Float32Array(buffer, index * rowOutputLength + 12, 3);
    const rgba = new Uint8ClampedArray(buffer, index * rowOutputLength + 24, 4);
    const rot = new Uint8ClampedArray(buffer, index * rowOutputLength + 28, 4);
    let sh = null;
    if (header.shBuffer) {
      sh = new Uint8ClampedArray(header.shBuffer, index * header.shCoefficientCount, header.shCoefficientCount);
    }
    const chunkIndex = index >> 8;
    let r0 = 255;
    let r1 = 0;
    let r2 = 0;
    let r3 = 0;
    const plySH = [];
    for (let propertyIndex = 0; propertyIndex < header.vertexProperties.length; propertyIndex++) {
      const property = header.vertexProperties[propertyIndex];
      let value;
      switch (property.type) {
        case 0:
          value = dataView.getFloat32(offset.value + property.offset, true);
          break;
        case 1:
          value = dataView.getInt32(offset.value + property.offset, true);
          break;
        case 2:
          value = dataView.getUint32(offset.value + property.offset, true);
          break;
        case 3:
          value = dataView.getFloat64(offset.value + property.offset, true);
          break;
        case 4:
          value = dataView.getUint8(offset.value + property.offset);
          break;
        default:
          continue;
      }
      switch (property.value) {
        case 12:
          {
            const compressedChunk = compressedChunks[chunkIndex];
            unpack111011(value, temp3);
            position[0] = Scalar.Lerp(compressedChunk.min.x, compressedChunk.max.x, temp3.x);
            position[1] = -Scalar.Lerp(compressedChunk.min.y, compressedChunk.max.y, temp3.y);
            position[2] = Scalar.Lerp(compressedChunk.min.z, compressedChunk.max.z, temp3.z);
          }
          break;
        case 13:
          {
            unpackRot(value, q);
            r0 = q.w;
            r1 = q.z;
            r2 = q.y;
            r3 = q.x;
          }
          break;
        case 14:
          {
            const compressedChunk = compressedChunks[chunkIndex];
            unpack111011(value, temp3);
            scale[0] = Math.exp(Scalar.Lerp(compressedChunk.minScale.x, compressedChunk.maxScale.x, temp3.x));
            scale[1] = Math.exp(Scalar.Lerp(compressedChunk.minScale.y, compressedChunk.maxScale.y, temp3.y));
            scale[2] = Math.exp(Scalar.Lerp(compressedChunk.minScale.z, compressedChunk.maxScale.z, temp3.z));
          }
          break;
        case 15:
          {
            const compressedChunk = compressedChunks[chunkIndex];
            unpack8888(value, rgba);
            rgba[0] = Scalar.Lerp(compressedChunk.minColor.x, compressedChunk.maxColor.x, rgba[0] / 255) * 255;
            rgba[1] = Scalar.Lerp(compressedChunk.minColor.y, compressedChunk.maxColor.y, rgba[1] / 255) * 255;
            rgba[2] = Scalar.Lerp(compressedChunk.minColor.z, compressedChunk.maxColor.z, rgba[2] / 255) * 255;
          }
          break;
        case 16:
          position[0] = value;
          break;
        case 17:
          position[1] = -value;
          break;
        case 18:
          position[2] = -value;
          break;
        case 19:
          scale[0] = Math.exp(value);
          break;
        case 20:
          scale[1] = Math.exp(value);
          break;
        case 21:
          scale[2] = Math.exp(value);
          break;
        case 22:
          rgba[0] = value;
          break;
        case 23:
          rgba[1] = value;
          break;
        case 24:
          rgba[2] = value;
          break;
        case 26:
          rgba[0] = (0.5 + GaussianSplattingMesh._SH_C0 * value) * 255;
          break;
        case 27:
          rgba[1] = (0.5 + GaussianSplattingMesh._SH_C0 * value) * 255;
          break;
        case 28:
          rgba[2] = (0.5 + GaussianSplattingMesh._SH_C0 * value) * 255;
          break;
        case 29:
          rgba[3] = (0.5 + GaussianSplattingMesh._SH_C0 * value) * 255;
          break;
        case 25:
          rgba[3] = 1 / (1 + Math.exp(-value)) * 255;
          break;
        case 30:
          r0 = value;
          break;
        case 31:
          r1 = value;
          break;
        case 32:
          r2 = value;
          break;
        case 33:
          r3 = value;
          break;
      }
      if (sh && property.value >= 40 && property.value <= 84) {
        const clampedValue = Scalar.Clamp(value * 127.5 + 127.5, 0, 255);
        const shIndex = property.value - 40;
        plySH[shIndex] = clampedValue;
      }
    }
    if (sh) {
      const shDim = header.shDegree == 1 ? 3 : header.shDegree == 2 ? 8 : 15;
      for (let j = 0; j < shDim; j++) {
        sh[j * 3 + 0] = plySH[j];
        sh[j * 3 + 1] = plySH[j + shDim];
        sh[j * 3 + 2] = plySH[j + shDim * 2];
      }
    }
    q.set(r1, r2, r3, r0);
    q.normalize();
    rot[0] = q.w * 128 + 128;
    rot[1] = q.x * 128 + 128;
    rot[2] = q.y * 128 + 128;
    rot[3] = q.z * 128 + 128;
    offset.value += header.rowVertexLength;
  }
  /**
   * Converts a .ply data with SH coefficients splat
   * if data array buffer is not ply, returns the original buffer
   * @param data the .ply data to load
   * @param useCoroutine use coroutine and yield
   * @returns the loaded splat buffer and optional array of sh coefficients
   */
  static *ConvertPLYWithSHToSplat(data, useCoroutine = false) {
    const header = GaussianSplattingMesh.ParseHeader(data);
    if (!header) {
      return { buffer: data };
    }
    const offset = { value: 0 };
    const compressedChunks = GaussianSplattingMesh._GetCompressedChunks(header, offset);
    for (let i = 0; i < header.vertexCount; i++) {
      GaussianSplattingMesh._GetSplat(header, i, compressedChunks, offset);
      if (i % GaussianSplattingMesh._PlyConversionBatchSize === 0 && useCoroutine) {
        yield;
      }
    }
    let sh = null;
    if (header.shDegree && header.shBuffer) {
      const textureCount = Math.ceil(header.shCoefficientCount / 16);
      let shIndexRead = 0;
      const ubuf = new Uint8Array(header.shBuffer);
      sh = [];
      const splatCount = header.vertexCount;
      const engine = EngineStore.LastCreatedEngine;
      if (engine) {
        const width = engine.getCaps().maxTextureSize;
        const height = Math.ceil(splatCount / width);
        for (let textureIndex = 0; textureIndex < textureCount; textureIndex++) {
          const texture = new Uint8Array(height * width * 4 * 4);
          sh.push(texture);
        }
        for (let i = 0; i < splatCount; i++) {
          for (let shIndexWrite = 0; shIndexWrite < header.shCoefficientCount; shIndexWrite++) {
            const shValue = ubuf[shIndexRead++];
            const textureIndex = Math.floor(shIndexWrite / 16);
            const shArray = sh[textureIndex];
            const byteIndexInTexture = shIndexWrite % 16;
            const offsetPerSplat = i * 16;
            shArray[byteIndexInTexture + offsetPerSplat] = shValue;
          }
        }
      }
    }
    return { buffer: header.buffer, sh };
  }
  /**
   * Converts a .ply data array buffer to splat
   * if data array buffer is not ply, returns the original buffer
   * @param data the .ply data to load
   * @param useCoroutine use coroutine and yield
   * @returns the loaded splat buffer without SH coefficient, whether ply contains or not SH.
   */
  static *ConvertPLYToSplat(data, useCoroutine = false) {
    const header = GaussianSplattingMesh.ParseHeader(data);
    if (!header) {
      return data;
    }
    const offset = { value: 0 };
    const compressedChunks = GaussianSplattingMesh._GetCompressedChunks(header, offset);
    for (let i = 0; i < header.vertexCount; i++) {
      GaussianSplattingMesh._GetSplat(header, i, compressedChunks, offset);
      if (i % GaussianSplattingMesh._PlyConversionBatchSize === 0 && useCoroutine) {
        yield;
      }
    }
    return header.buffer;
  }
  /**
   * Converts a .ply data array buffer to splat
   * if data array buffer is not ply, returns the original buffer
   * @param data the .ply data to load
   * @returns the loaded splat buffer
   */
  static async ConvertPLYToSplatAsync(data) {
    return runCoroutineAsync(GaussianSplattingMesh.ConvertPLYToSplat(data, true), createYieldingScheduler());
  }
  /**
   * Converts a .ply with SH data array buffer to splat
   * if data array buffer is not ply, returns the original buffer
   * @param data the .ply data to load
   * @returns the loaded splat buffer with SH
   */
  static async ConvertPLYWithSHToSplatAsync(data) {
    return runCoroutineAsync(GaussianSplattingMesh.ConvertPLYWithSHToSplat(data, true), createYieldingScheduler());
  }
  /**
   * Loads a .splat Gaussian Splatting array buffer asynchronously
   * @param data arraybuffer containing splat file
   * @returns a promise that resolves when the operation is complete
   */
  loadDataAsync(data) {
    return this.updateDataAsync(data);
  }
  /**
   * Loads a .splat Gaussian or .ply Splatting file asynchronously
   * @param url path to the splat file to load
   * @returns a promise that resolves when the operation is complete
   * @deprecated Please use SceneLoader.ImportMeshAsync instead
   */
  loadFileAsync(url) {
    return Tools.LoadFileAsync(url, true).then(async (plyBuffer) => {
      GaussianSplattingMesh.ConvertPLYWithSHToSplatAsync(plyBuffer).then((splatsData) => {
        this.updateDataAsync(splatsData.buffer, splatsData.sh);
      });
    });
  }
  /**
   * Releases resources associated with this mesh.
   * @param doNotRecurse Set to true to not recurse into each children (recurse into each children by default)
   */
  dispose(doNotRecurse) {
    var _a, _b, _c, _d, _e;
    (_a = this._covariancesATexture) == null ? void 0 : _a.dispose();
    (_b = this._covariancesBTexture) == null ? void 0 : _b.dispose();
    (_c = this._centersTexture) == null ? void 0 : _c.dispose();
    (_d = this._colorsTexture) == null ? void 0 : _d.dispose();
    if (this._shTextures) {
      this._shTextures.forEach((shTexture) => {
        shTexture.dispose();
      });
    }
    this._covariancesATexture = null;
    this._covariancesBTexture = null;
    this._centersTexture = null;
    this._colorsTexture = null;
    this._shTextures = null;
    (_e = this._worker) == null ? void 0 : _e.terminate();
    this._worker = null;
    super.dispose(doNotRecurse, true);
  }
  _copyTextures(source) {
    var _a, _b, _c, _d;
    this._covariancesATexture = (_a = source.covariancesATexture) == null ? void 0 : _a.clone();
    this._covariancesBTexture = (_b = source.covariancesBTexture) == null ? void 0 : _b.clone();
    this._centersTexture = (_c = source.centersTexture) == null ? void 0 : _c.clone();
    this._colorsTexture = (_d = source.colorsTexture) == null ? void 0 : _d.clone();
    if (source._shTextures) {
      this._shTextures = [];
      this._shTextures.forEach((shTexture) => {
        var _a2;
        (_a2 = this._shTextures) == null ? void 0 : _a2.push(shTexture.clone());
      });
    }
  }
  /**
   * Returns a new Mesh object generated from the current mesh properties.
   * @param name is a string, the name given to the new mesh
   * @returns a new Gaussian Splatting Mesh
   */
  clone(name2 = "") {
    const newGS = new GaussianSplattingMesh(name2, void 0, this.getScene());
    newGS._copySource(this);
    newGS.makeGeometryUnique();
    newGS._vertexCount = this._vertexCount;
    newGS._copyTextures(this);
    newGS._modelViewMatrix = Matrix.Identity();
    newGS._splatPositions = this._splatPositions;
    newGS._readyToDisplay = false;
    newGS._instanciateWorker();
    const binfo = this.getBoundingInfo();
    newGS.getBoundingInfo().reConstruct(binfo.minimum, binfo.maximum, this.getWorldMatrix());
    newGS.forcedInstanceCount = newGS._vertexCount;
    newGS.setEnabled(true);
    return newGS;
  }
  _makeSplat(index, fBuffer, uBuffer, covA, covB, colorArray, minimum, maximum) {
    const matrixRotation = TmpVectors.Matrix[0];
    const matrixScale = TmpVectors.Matrix[1];
    const quaternion = TmpVectors.Quaternion[0];
    const covBSItemSize = this._useRGBACovariants ? 4 : 2;
    const x = fBuffer[8 * index + 0];
    const y = -fBuffer[8 * index + 1];
    const z = fBuffer[8 * index + 2];
    this._splatPositions[4 * index + 0] = x;
    this._splatPositions[4 * index + 1] = y;
    this._splatPositions[4 * index + 2] = z;
    minimum.minimizeInPlaceFromFloats(x, y, z);
    maximum.maximizeInPlaceFromFloats(x, y, z);
    quaternion.set((uBuffer[32 * index + 28 + 1] - 127.5) / 127.5, (uBuffer[32 * index + 28 + 2] - 127.5) / 127.5, (uBuffer[32 * index + 28 + 3] - 127.5) / 127.5, -(uBuffer[32 * index + 28 + 0] - 127.5) / 127.5);
    quaternion.toRotationMatrix(matrixRotation);
    Matrix.ScalingToRef(fBuffer[8 * index + 3 + 0] * 2, fBuffer[8 * index + 3 + 1] * 2, fBuffer[8 * index + 3 + 2] * 2, matrixScale);
    const M = matrixRotation.multiplyToRef(matrixScale, TmpVectors.Matrix[0]).m;
    const covariances = this._tmpCovariances;
    covariances[0] = M[0] * M[0] + M[1] * M[1] + M[2] * M[2];
    covariances[1] = M[0] * M[4] + M[1] * M[5] + M[2] * M[6];
    covariances[2] = M[0] * M[8] + M[1] * M[9] + M[2] * M[10];
    covariances[3] = M[4] * M[4] + M[5] * M[5] + M[6] * M[6];
    covariances[4] = M[4] * M[8] + M[5] * M[9] + M[6] * M[10];
    covariances[5] = M[8] * M[8] + M[9] * M[9] + M[10] * M[10];
    let factor = -1e4;
    for (let covIndex = 0; covIndex < 6; covIndex++) {
      factor = Math.max(factor, Math.abs(covariances[covIndex]));
    }
    this._splatPositions[4 * index + 3] = factor;
    const transform = factor;
    covA[index * 4 + 0] = ToHalfFloat(covariances[0] / transform);
    covA[index * 4 + 1] = ToHalfFloat(covariances[1] / transform);
    covA[index * 4 + 2] = ToHalfFloat(covariances[2] / transform);
    covA[index * 4 + 3] = ToHalfFloat(covariances[3] / transform);
    covB[index * covBSItemSize + 0] = ToHalfFloat(covariances[4] / transform);
    covB[index * covBSItemSize + 1] = ToHalfFloat(covariances[5] / transform);
    colorArray[index * 4 + 0] = uBuffer[32 * index + 24 + 0];
    colorArray[index * 4 + 1] = uBuffer[32 * index + 24 + 1];
    colorArray[index * 4 + 2] = uBuffer[32 * index + 24 + 2];
    colorArray[index * 4 + 3] = uBuffer[32 * index + 24 + 3];
  }
  _updateTextures(covA, covB, colorArray, sh) {
    const textureSize = this._getTextureSize(this._vertexCount);
    const createTextureFromData = (data, width, height, format) => {
      return new RawTexture(data, width, height, format, this._scene, false, false, 2, 1);
    };
    const createTextureFromDataU8 = (data, width, height, format) => {
      return new RawTexture(data, width, height, format, this._scene, false, false, 2, 0);
    };
    const createTextureFromDataU32 = (data, width, height, format) => {
      return new RawTexture(data, width, height, format, this._scene, false, false, 1, 7);
    };
    const createTextureFromDataF16 = (data, width, height, format) => {
      return new RawTexture(data, width, height, format, this._scene, false, false, 2, 2);
    };
    if (this._covariancesATexture) {
      this._delayedTextureUpdate = { covA, covB, colors: colorArray, centers: this._splatPositions, sh };
      const positions = Float32Array.from(this._splatPositions);
      const vertexCount = this._vertexCount;
      this._worker.postMessage({ positions, vertexCount }, [positions.buffer]);
      this._postToWorker(true);
    } else {
      this._covariancesATexture = createTextureFromDataF16(covA, textureSize.x, textureSize.y, 5);
      this._covariancesBTexture = createTextureFromDataF16(covB, textureSize.x, textureSize.y, this._useRGBACovariants ? 5 : 7);
      this._centersTexture = createTextureFromData(this._splatPositions, textureSize.x, textureSize.y, 5);
      this._colorsTexture = createTextureFromDataU8(colorArray, textureSize.x, textureSize.y, 5);
      if (sh) {
        this._shTextures = [];
        sh.forEach((shData) => {
          const buffer = new Uint32Array(shData.buffer);
          const shTexture = createTextureFromDataU32(buffer, textureSize.x, textureSize.y, 11);
          shTexture.wrapU = 0;
          shTexture.wrapV = 0;
          this._shTextures.push(shTexture);
        });
      }
      this._instanciateWorker();
    }
  }
  *_updateData(data, isAsync, sh) {
    if (!this._covariancesATexture) {
      this._readyToDisplay = false;
    }
    const uBuffer = new Uint8Array(data);
    const fBuffer = new Float32Array(uBuffer.buffer);
    if (this._keepInRam) {
      this._splatsData = data;
      if (sh) {
        this._sh = sh;
      }
    }
    const vertexCount = uBuffer.length / GaussianSplattingMesh._RowOutputLength;
    if (vertexCount != this._vertexCount) {
      this._updateSplatIndexBuffer(vertexCount);
    }
    this._vertexCount = vertexCount;
    this._shDegree = sh ? sh.length : 0;
    const textureSize = this._getTextureSize(vertexCount);
    const textureLength = textureSize.x * textureSize.y;
    const lineCountUpdate = GaussianSplattingMesh.ProgressiveUpdateAmount ?? textureSize.y;
    const textureLengthPerUpdate = textureSize.x * lineCountUpdate;
    this._splatPositions = new Float32Array(4 * textureLength);
    const covA = new Uint16Array(textureLength * 4);
    const covB = new Uint16Array((this._useRGBACovariants ? 4 : 2) * textureLength);
    const colorArray = new Uint8Array(textureLength * 4);
    const minimum = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    const maximum = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
    if (GaussianSplattingMesh.ProgressiveUpdateAmount) {
      this._updateTextures(covA, covB, colorArray, sh);
      this.setEnabled(true);
      const partCount = Math.ceil(textureSize.y / lineCountUpdate);
      for (let partIndex = 0; partIndex < partCount; partIndex++) {
        const updateLine = partIndex * lineCountUpdate;
        const splatIndexBase = updateLine * textureSize.x;
        for (let i = 0; i < textureLengthPerUpdate; i++) {
          this._makeSplat(splatIndexBase + i, fBuffer, uBuffer, covA, covB, colorArray, minimum, maximum);
        }
        this._updateSubTextures(this._splatPositions, covA, covB, colorArray, updateLine, Math.min(lineCountUpdate, textureSize.y - updateLine));
        this.getBoundingInfo().reConstruct(minimum, maximum, this.getWorldMatrix());
        if (isAsync) {
          yield;
        }
      }
      const positions = Float32Array.from(this._splatPositions);
      const vertexCount2 = this._vertexCount;
      this._worker.postMessage({ positions, vertexCount: vertexCount2 }, [positions.buffer]);
      this._sortIsDirty = true;
    } else {
      for (let i = 0; i < vertexCount; i++) {
        this._makeSplat(i, fBuffer, uBuffer, covA, covB, colorArray, minimum, maximum);
        if (isAsync && i % GaussianSplattingMesh._SplatBatchSize === 0) {
          yield;
        }
      }
      this._updateTextures(covA, covB, colorArray, sh);
      this.getBoundingInfo().reConstruct(minimum, maximum, this.getWorldMatrix());
      this.setEnabled(true);
    }
    this._postToWorker(true);
  }
  /**
   * Update asynchronously the buffer
   * @param data array buffer containing center, color, orientation and scale of splats
   * @param sh optional array of uint8 array for SH data
   * @returns a promise
   */
  async updateDataAsync(data, sh) {
    return runCoroutineAsync(this._updateData(data, true, sh), createYieldingScheduler());
  }
  /**
   * @experimental
   * Update data from GS (position, orientation, color, scaling)
   * @param data array that contain all the datas
   * @param sh optional array of uint8 array for SH data
   */
  updateData(data, sh) {
    runCoroutineSync(this._updateData(data, false, sh));
  }
  /**
   * Refreshes the bounding info, taking into account all the thin instances defined
   * @returns the current Gaussian Splatting
   */
  refreshBoundingInfo() {
    this.thinInstanceRefreshBoundingInfo(false);
    return this;
  }
  // in case size is different
  _updateSplatIndexBuffer(vertexCount) {
    if (!this._splatIndex || vertexCount > this._splatIndex.length) {
      this._splatIndex = new Float32Array(vertexCount);
      this.thinInstanceSetBuffer("splatIndex", this._splatIndex, 1, false);
    }
    this.forcedInstanceCount = vertexCount;
  }
  _updateSubTextures(centers, covA, covB, colors, lineStart, lineCount, sh) {
    const updateTextureFromData = (texture, data, width, lineStart2, lineCount2) => {
      this.getEngine().updateTextureData(texture.getInternalTexture(), data, 0, lineStart2, width, lineCount2, 0, 0, false);
    };
    const textureSize = this._getTextureSize(this._vertexCount);
    const covBSItemSize = this._useRGBACovariants ? 4 : 2;
    const texelStart = lineStart * textureSize.x;
    const texelCount = lineCount * textureSize.x;
    const covAView = new Uint16Array(covA.buffer, texelStart * 4 * Uint16Array.BYTES_PER_ELEMENT, texelCount * 4);
    const covBView = new Uint16Array(covB.buffer, texelStart * covBSItemSize * Uint16Array.BYTES_PER_ELEMENT, texelCount * covBSItemSize);
    const colorsView = new Uint8Array(colors.buffer, texelStart * 4, texelCount * 4);
    const centersView = new Float32Array(centers.buffer, texelStart * 4 * Float32Array.BYTES_PER_ELEMENT, texelCount * 4);
    updateTextureFromData(this._covariancesATexture, covAView, textureSize.x, lineStart, lineCount);
    updateTextureFromData(this._covariancesBTexture, covBView, textureSize.x, lineStart, lineCount);
    updateTextureFromData(this._centersTexture, centersView, textureSize.x, lineStart, lineCount);
    updateTextureFromData(this._colorsTexture, colorsView, textureSize.x, lineStart, lineCount);
    if (sh) {
      for (let i = 0; i < sh.length; i++) {
        const componentCount = 4;
        const shView = new Uint8Array(this._sh[i].buffer, texelStart * componentCount, texelCount * componentCount);
        updateTextureFromData(this._shTextures[i], shView, textureSize.x, lineStart, lineCount);
      }
    }
  }
  _instanciateWorker() {
    var _a;
    if (!this._vertexCount) {
      return;
    }
    this._updateSplatIndexBuffer(this._vertexCount);
    (_a = this._worker) == null ? void 0 : _a.terminate();
    this._worker = new Worker(URL.createObjectURL(new Blob(["(", GaussianSplattingMesh._CreateWorker.toString(), ")(self)"], {
      type: "application/javascript"
    })));
    this._depthMix = new BigInt64Array(this._vertexCount);
    const positions = Float32Array.from(this._splatPositions);
    const vertexCount = this._vertexCount;
    this._worker.postMessage({ positions, vertexCount }, [positions.buffer]);
    this._worker.onmessage = (e) => {
      this._depthMix = e.data.depthMix;
      const indexMix = new Uint32Array(e.data.depthMix.buffer);
      if (this._splatIndex) {
        for (let j = 0; j < this._vertexCount; j++) {
          this._splatIndex[j] = indexMix[2 * j];
        }
      }
      if (this._delayedTextureUpdate) {
        const textureSize = this._getTextureSize(vertexCount);
        this._updateSubTextures(this._delayedTextureUpdate.centers, this._delayedTextureUpdate.covA, this._delayedTextureUpdate.covB, this._delayedTextureUpdate.colors, 0, textureSize.y, this._delayedTextureUpdate.sh);
        this._delayedTextureUpdate = null;
      }
      this.thinInstanceBufferUpdated("splatIndex");
      this._canPostToWorker = true;
      this._readyToDisplay = true;
      if (this._sortIsDirty) {
        this._postToWorker(true);
        this._sortIsDirty = false;
      }
    };
  }
  _getTextureSize(length) {
    const engine = this._scene.getEngine();
    const width = engine.getCaps().maxTextureSize;
    let height = 1;
    if (engine.version === 1 && !engine.isWebGPU) {
      while (width * height < length) {
        height *= 2;
      }
    } else {
      height = Math.ceil(length / width);
    }
    if (height > width) {
      Logger.Error("GaussianSplatting texture size: (" + width + ", " + height + "), maxTextureSize: " + width);
      height = width;
    }
    return new Vector2(width, height);
  }
}
GaussianSplattingMesh._RowOutputLength = 3 * 4 + 3 * 4 + 4 + 4;
GaussianSplattingMesh._SH_C0 = 0.28209479177387814;
GaussianSplattingMesh._SplatBatchSize = 327680;
GaussianSplattingMesh._PlyConversionBatchSize = 32768;
GaussianSplattingMesh.ProgressiveUpdateAmount = 0;
GaussianSplattingMesh._CreateWorker = function(self) {
  let vertexCount = 0;
  let positions;
  let depthMix;
  let indices;
  let floatMix;
  self.onmessage = (e) => {
    if (e.data.positions) {
      positions = e.data.positions;
      vertexCount = e.data.vertexCount;
    } else {
      const viewProj = e.data.view;
      if (!positions || !viewProj) {
        throw new Error("positions or view is not defined!");
      }
      depthMix = e.data.depthMix;
      indices = new Uint32Array(depthMix.buffer);
      floatMix = new Float32Array(depthMix.buffer);
      for (let j = 0; j < vertexCount; j++) {
        indices[2 * j] = j;
      }
      let depthFactor = -1;
      if (e.data.useRightHandedSystem) {
        depthFactor = 1;
      }
      for (let j = 0; j < vertexCount; j++) {
        floatMix[2 * j + 1] = 1e4 + (viewProj[2] * positions[4 * j + 0] + viewProj[6] * positions[4 * j + 1] + viewProj[10] * positions[4 * j + 2]) * depthFactor;
      }
      depthMix.sort();
      self.postMessage({ depthMix }, [depthMix.buffer]);
    }
  };
};
class CloudPoint {
  /**
   * Creates a Point Cloud object.
   * Don't create particles manually, use instead the PCS internal tools like _addParticle()
   * @param particleIndex (integer) is the particle index in the PCS pool. It's also the particle identifier.
   * @param group (PointsGroup) is the group the particle belongs to
   * @param groupId (integer) is the group identifier in the PCS.
   * @param idxInGroup (integer) is the index of the particle in the current point group (ex: the 10th point of addPoints(30))
   * @param pcs defines the PCS it is associated to
   */
  constructor(particleIndex, group, groupId, idxInGroup, pcs) {
    this.idx = 0;
    this.color = new Color4(1, 1, 1, 1);
    this.position = Vector3.Zero();
    this.rotation = Vector3.Zero();
    this.uv = new Vector2(0, 0);
    this.velocity = Vector3.Zero();
    this.pivot = Vector3.Zero();
    this.translateFromPivot = false;
    this._pos = 0;
    this._ind = 0;
    this.groupId = 0;
    this.idxInGroup = 0;
    this._stillInvisible = false;
    this._rotationMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    this.parentId = null;
    this._globalPosition = Vector3.Zero();
    this.idx = particleIndex;
    this._group = group;
    this.groupId = groupId;
    this.idxInGroup = idxInGroup;
    this._pcs = pcs;
  }
  /**
   * get point size
   */
  get size() {
    return this.size;
  }
  /**
   * Set point size
   */
  set size(scale) {
    this.size = scale;
  }
  /**
   * Legacy support, changed quaternion to rotationQuaternion
   */
  get quaternion() {
    return this.rotationQuaternion;
  }
  /**
   * Legacy support, changed quaternion to rotationQuaternion
   */
  set quaternion(q) {
    this.rotationQuaternion = q;
  }
  /**
   * Returns a boolean. True if the particle intersects a mesh, else false
   * The intersection is computed on the particle position and Axis Aligned Bounding Box (AABB) or Sphere
   * @param target is the object (point or mesh) what the intersection is computed against
   * @param isSphere is boolean flag when false (default) bounding box of mesh is used, when true the bounding sphere is used
   * @returns true if it intersects
   */
  intersectsMesh(target, isSphere) {
    if (!target.hasBoundingInfo) {
      return false;
    }
    if (!this._pcs.mesh) {
      throw new Error("Point Cloud System doesnt contain the Mesh");
    }
    if (isSphere) {
      return target.getBoundingInfo().boundingSphere.intersectsPoint(this.position.add(this._pcs.mesh.position));
    }
    const bbox = target.getBoundingInfo().boundingBox;
    const maxX = bbox.maximumWorld.x;
    const minX = bbox.minimumWorld.x;
    const maxY = bbox.maximumWorld.y;
    const minY = bbox.minimumWorld.y;
    const maxZ = bbox.maximumWorld.z;
    const minZ = bbox.minimumWorld.z;
    const x = this.position.x + this._pcs.mesh.position.x;
    const y = this.position.y + this._pcs.mesh.position.y;
    const z = this.position.z + this._pcs.mesh.position.z;
    return minX <= x && x <= maxX && minY <= y && y <= maxY && minZ <= z && z <= maxZ;
  }
  /**
   * get the rotation matrix of the particle
   * @internal
   */
  getRotationMatrix(m) {
    let quaternion;
    if (this.rotationQuaternion) {
      quaternion = this.rotationQuaternion;
    } else {
      quaternion = TmpVectors.Quaternion[0];
      const rotation = this.rotation;
      Quaternion.RotationYawPitchRollToRef(rotation.y, rotation.x, rotation.z, quaternion);
    }
    quaternion.toRotationMatrix(m);
  }
}
class PointsGroup {
  /**
   * Get or set the groupId
   * @deprecated Please use groupId instead
   */
  get groupID() {
    return this.groupId;
  }
  set groupID(groupID) {
    this.groupId = groupID;
  }
  /**
   * Creates a points group object. This is an internal reference to produce particles for the PCS.
   * PCS internal tool, don't use it manually.
   * @internal
   */
  constructor(id, posFunction) {
    this.groupId = id;
    this._positionFunction = posFunction;
  }
}
var PointColor;
(function(PointColor2) {
  PointColor2[PointColor2["Color"] = 2] = "Color";
  PointColor2[PointColor2["UV"] = 1] = "UV";
  PointColor2[PointColor2["Random"] = 0] = "Random";
  PointColor2[PointColor2["Stated"] = 3] = "Stated";
})(PointColor || (PointColor = {}));
class PointsCloudSystem {
  /**
   * Gets the particle positions computed by the Point Cloud System
   */
  get positions() {
    return this._positions32;
  }
  /**
   * Gets the particle colors computed by the Point Cloud System
   */
  get colors() {
    return this._colors32;
  }
  /**
   * Gets the particle uvs computed by the Point Cloud System
   */
  get uvs() {
    return this._uvs32;
  }
  /**
   * Creates a PCS (Points Cloud System) object
   * @param name (String) is the PCS name, this will be the underlying mesh name
   * @param pointSize (number) is the size for each point. Has no effect on a WebGPU engine.
   * @param scene (Scene) is the scene in which the PCS is added
   * @param options defines the options of the PCS e.g.
   * * updatable (optional boolean, default true) : if the PCS must be updatable or immutable
   */
  constructor(name2, pointSize, scene, options) {
    this.particles = new Array();
    this.nbParticles = 0;
    this.counter = 0;
    this.vars = {};
    this._promises = [];
    this._positions = new Array();
    this._indices = new Array();
    this._normals = new Array();
    this._colors = new Array();
    this._uvs = new Array();
    this._updatable = true;
    this._isVisibilityBoxLocked = false;
    this._alwaysVisible = false;
    this._groups = new Array();
    this._groupCounter = 0;
    this._computeParticleColor = true;
    this._computeParticleTexture = true;
    this._computeParticleRotation = true;
    this._computeBoundingBox = false;
    this._isReady = false;
    this.name = name2;
    this._size = pointSize;
    this._scene = scene || EngineStore.LastCreatedScene;
    if (options && options.updatable !== void 0) {
      this._updatable = options.updatable;
    } else {
      this._updatable = true;
    }
  }
  /**
   * Builds the PCS underlying mesh. Returns a standard Mesh.
   * If no points were added to the PCS, the returned mesh is just a single point.
   * @param material The material to use to render the mesh. If not provided, will create a default one
   * @returns a promise for the created mesh
   */
  buildMeshAsync(material) {
    return Promise.all(this._promises).then(() => {
      this._isReady = true;
      return this._buildMesh(material);
    });
  }
  /**
   * @internal
   */
  _buildMesh(material) {
    if (this.nbParticles === 0) {
      this.addPoints(1);
    }
    this._positions32 = new Float32Array(this._positions);
    this._uvs32 = new Float32Array(this._uvs);
    this._colors32 = new Float32Array(this._colors);
    const vertexData = new VertexData();
    vertexData.set(this._positions32, VertexBuffer.PositionKind);
    if (this._uvs32.length > 0) {
      vertexData.set(this._uvs32, VertexBuffer.UVKind);
    }
    let ec = 0;
    if (this._colors32.length > 0) {
      ec = 1;
      vertexData.set(this._colors32, VertexBuffer.ColorKind);
    }
    const mesh = new Mesh(this.name, this._scene);
    vertexData.applyToMesh(mesh, this._updatable);
    this.mesh = mesh;
    this._positions = null;
    this._uvs = null;
    this._colors = null;
    if (!this._updatable) {
      this.particles.length = 0;
    }
    let mat = material;
    if (!mat) {
      mat = new StandardMaterial("point cloud material", this._scene);
      mat.emissiveColor = new Color3(ec, ec, ec);
      mat.disableLighting = true;
      mat.pointsCloud = true;
      mat.pointSize = this._size;
    }
    mesh.material = mat;
    return new Promise((resolve) => resolve(mesh));
  }
  // adds a new particle object in the particles array
  _addParticle(idx, group, groupId, idxInGroup) {
    const cp = new CloudPoint(idx, group, groupId, idxInGroup, this);
    this.particles.push(cp);
    return cp;
  }
  _randomUnitVector(particle) {
    particle.position = new Vector3(Math.random(), Math.random(), Math.random());
    particle.color = new Color4(1, 1, 1, 1);
  }
  _getColorIndicesForCoord(pointsGroup, x, y, width) {
    const imageData = pointsGroup._groupImageData;
    const color = y * (width * 4) + x * 4;
    const colorIndices = [color, color + 1, color + 2, color + 3];
    const redIndex = colorIndices[0];
    const greenIndex = colorIndices[1];
    const blueIndex = colorIndices[2];
    const alphaIndex = colorIndices[3];
    const redForCoord = imageData[redIndex];
    const greenForCoord = imageData[greenIndex];
    const blueForCoord = imageData[blueIndex];
    const alphaForCoord = imageData[alphaIndex];
    return new Color4(redForCoord / 255, greenForCoord / 255, blueForCoord / 255, alphaForCoord);
  }
  _setPointsColorOrUV(mesh, pointsGroup, isVolume, colorFromTexture, hasTexture, color, range, uvSetIndex) {
    uvSetIndex = uvSetIndex ?? 0;
    if (isVolume) {
      mesh.updateFacetData();
    }
    const boundInfo = mesh.getBoundingInfo();
    const diameter = 2 * boundInfo.boundingSphere.radius;
    let meshPos = mesh.getVerticesData(VertexBuffer.PositionKind);
    const meshInd = mesh.getIndices();
    const meshUV = mesh.getVerticesData(VertexBuffer.UVKind + (uvSetIndex ? uvSetIndex + 1 : ""));
    const meshCol = mesh.getVerticesData(VertexBuffer.ColorKind);
    const place = Vector3.Zero();
    mesh.computeWorldMatrix();
    const meshMatrix = mesh.getWorldMatrix();
    if (!meshMatrix.isIdentity()) {
      meshPos = meshPos.slice(0);
      for (let p = 0; p < meshPos.length / 3; p++) {
        Vector3.TransformCoordinatesFromFloatsToRef(meshPos[3 * p], meshPos[3 * p + 1], meshPos[3 * p + 2], meshMatrix, place);
        meshPos[3 * p] = place.x;
        meshPos[3 * p + 1] = place.y;
        meshPos[3 * p + 2] = place.z;
      }
    }
    let idxPoints = 0;
    let id0 = 0;
    let id1 = 0;
    let id2 = 0;
    let v0X = 0;
    let v0Y = 0;
    let v0Z = 0;
    let v1X = 0;
    let v1Y = 0;
    let v1Z = 0;
    let v2X = 0;
    let v2Y = 0;
    let v2Z = 0;
    const vertex0 = Vector3.Zero();
    const vertex1 = Vector3.Zero();
    const vertex2 = Vector3.Zero();
    const vec0 = Vector3.Zero();
    const vec1 = Vector3.Zero();
    let uv0X = 0;
    let uv0Y = 0;
    let uv1X = 0;
    let uv1Y = 0;
    let uv2X = 0;
    let uv2Y = 0;
    const uv0 = Vector2.Zero();
    const uv1 = Vector2.Zero();
    const uv2 = Vector2.Zero();
    const uvec0 = Vector2.Zero();
    const uvec1 = Vector2.Zero();
    let col0X = 0;
    let col0Y = 0;
    let col0Z = 0;
    let col0A = 0;
    let col1X = 0;
    let col1Y = 0;
    let col1Z = 0;
    let col1A = 0;
    let col2X = 0;
    let col2Y = 0;
    let col2Z = 0;
    let col2A = 0;
    const col0 = Vector4.Zero();
    const col1 = Vector4.Zero();
    const col2 = Vector4.Zero();
    const colvec0 = Vector4.Zero();
    const colvec1 = Vector4.Zero();
    let lamda = 0;
    let mu = 0;
    range = range ? range : 0;
    let facetPoint;
    let uvPoint;
    let colPoint = new Vector4(0, 0, 0, 0);
    let norm = Vector3.Zero();
    let tang = Vector3.Zero();
    let biNorm = Vector3.Zero();
    let angle = 0;
    let facetPlaneVec = Vector3.Zero();
    let gap = 0;
    let distance = 0;
    const ray = new Ray(Vector3.Zero(), new Vector3(1, 0, 0));
    let pickInfo;
    let direction = Vector3.Zero();
    for (let index = 0; index < meshInd.length / 3; index++) {
      id0 = meshInd[3 * index];
      id1 = meshInd[3 * index + 1];
      id2 = meshInd[3 * index + 2];
      v0X = meshPos[3 * id0];
      v0Y = meshPos[3 * id0 + 1];
      v0Z = meshPos[3 * id0 + 2];
      v1X = meshPos[3 * id1];
      v1Y = meshPos[3 * id1 + 1];
      v1Z = meshPos[3 * id1 + 2];
      v2X = meshPos[3 * id2];
      v2Y = meshPos[3 * id2 + 1];
      v2Z = meshPos[3 * id2 + 2];
      vertex0.set(v0X, v0Y, v0Z);
      vertex1.set(v1X, v1Y, v1Z);
      vertex2.set(v2X, v2Y, v2Z);
      vertex1.subtractToRef(vertex0, vec0);
      vertex2.subtractToRef(vertex1, vec1);
      if (meshUV) {
        uv0X = meshUV[2 * id0];
        uv0Y = meshUV[2 * id0 + 1];
        uv1X = meshUV[2 * id1];
        uv1Y = meshUV[2 * id1 + 1];
        uv2X = meshUV[2 * id2];
        uv2Y = meshUV[2 * id2 + 1];
        uv0.set(uv0X, uv0Y);
        uv1.set(uv1X, uv1Y);
        uv2.set(uv2X, uv2Y);
        uv1.subtractToRef(uv0, uvec0);
        uv2.subtractToRef(uv1, uvec1);
      }
      if (meshCol && colorFromTexture) {
        col0X = meshCol[4 * id0];
        col0Y = meshCol[4 * id0 + 1];
        col0Z = meshCol[4 * id0 + 2];
        col0A = meshCol[4 * id0 + 3];
        col1X = meshCol[4 * id1];
        col1Y = meshCol[4 * id1 + 1];
        col1Z = meshCol[4 * id1 + 2];
        col1A = meshCol[4 * id1 + 3];
        col2X = meshCol[4 * id2];
        col2Y = meshCol[4 * id2 + 1];
        col2Z = meshCol[4 * id2 + 2];
        col2A = meshCol[4 * id2 + 3];
        col0.set(col0X, col0Y, col0Z, col0A);
        col1.set(col1X, col1Y, col1Z, col1A);
        col2.set(col2X, col2Y, col2Z, col2A);
        col1.subtractToRef(col0, colvec0);
        col2.subtractToRef(col1, colvec1);
      }
      let width;
      let height;
      let deltaS;
      let deltaV;
      let h;
      let s;
      let v;
      let hsvCol;
      const statedColor = new Color3(0, 0, 0);
      const colPoint3 = new Color3(0, 0, 0);
      let pointColors;
      let particle;
      for (let i = 0; i < pointsGroup._groupDensity[index]; i++) {
        idxPoints = this.particles.length;
        this._addParticle(idxPoints, pointsGroup, this._groupCounter, index + i);
        particle = this.particles[idxPoints];
        lamda = Math.sqrt(RandomRange(0, 1));
        mu = RandomRange(0, 1);
        facetPoint = vertex0.add(vec0.scale(lamda)).add(vec1.scale(lamda * mu));
        if (isVolume) {
          norm = mesh.getFacetNormal(index).normalize().scale(-1);
          tang = vec0.clone().normalize();
          biNorm = Vector3.Cross(norm, tang);
          angle = RandomRange(0, 2 * Math.PI);
          facetPlaneVec = tang.scale(Math.cos(angle)).add(biNorm.scale(Math.sin(angle)));
          angle = RandomRange(0.1, Math.PI / 2);
          direction = facetPlaneVec.scale(Math.cos(angle)).add(norm.scale(Math.sin(angle)));
          ray.origin = facetPoint.add(direction.scale(1e-5));
          ray.direction = direction;
          ray.length = diameter;
          pickInfo = ray.intersectsMesh(mesh);
          if (pickInfo.hit) {
            distance = pickInfo.pickedPoint.subtract(facetPoint).length();
            gap = RandomRange(0, 1) * distance;
            facetPoint.addInPlace(direction.scale(gap));
          }
        }
        particle.position = facetPoint.clone();
        this._positions.push(particle.position.x, particle.position.y, particle.position.z);
        if (colorFromTexture !== void 0) {
          if (meshUV) {
            uvPoint = uv0.add(uvec0.scale(lamda)).add(uvec1.scale(lamda * mu));
            if (colorFromTexture) {
              if (hasTexture && pointsGroup._groupImageData !== null) {
                width = pointsGroup._groupImgWidth;
                height = pointsGroup._groupImgHeight;
                pointColors = this._getColorIndicesForCoord(pointsGroup, Math.round(uvPoint.x * width), Math.round(uvPoint.y * height), width);
                particle.color = pointColors;
                this._colors.push(pointColors.r, pointColors.g, pointColors.b, pointColors.a);
              } else {
                if (meshCol) {
                  colPoint = col0.add(colvec0.scale(lamda)).add(colvec1.scale(lamda * mu));
                  particle.color = new Color4(colPoint.x, colPoint.y, colPoint.z, colPoint.w);
                  this._colors.push(colPoint.x, colPoint.y, colPoint.z, colPoint.w);
                } else {
                  colPoint = col0.set(Math.random(), Math.random(), Math.random(), 1);
                  particle.color = new Color4(colPoint.x, colPoint.y, colPoint.z, colPoint.w);
                  this._colors.push(colPoint.x, colPoint.y, colPoint.z, colPoint.w);
                }
              }
            } else {
              particle.uv = uvPoint.clone();
              this._uvs.push(particle.uv.x, particle.uv.y);
            }
          }
        } else {
          if (color) {
            statedColor.set(color.r, color.g, color.b);
            deltaS = RandomRange(-range, range);
            deltaV = RandomRange(-range, range);
            hsvCol = statedColor.toHSV();
            h = hsvCol.r;
            s = hsvCol.g + deltaS;
            v = hsvCol.b + deltaV;
            if (s < 0) {
              s = 0;
            }
            if (s > 1) {
              s = 1;
            }
            if (v < 0) {
              v = 0;
            }
            if (v > 1) {
              v = 1;
            }
            Color3.HSVtoRGBToRef(h, s, v, colPoint3);
            colPoint.set(colPoint3.r, colPoint3.g, colPoint3.b, 1);
          } else {
            colPoint = col0.set(Math.random(), Math.random(), Math.random(), 1);
          }
          particle.color = new Color4(colPoint.x, colPoint.y, colPoint.z, colPoint.w);
          this._colors.push(colPoint.x, colPoint.y, colPoint.z, colPoint.w);
        }
      }
    }
  }
  // stores mesh texture in dynamic texture for color pixel retrieval
  // when pointColor type is color for surface points
  _colorFromTexture(mesh, pointsGroup, isVolume) {
    if (mesh.material === null) {
      Logger.Warn(mesh.name + "has no material.");
      pointsGroup._groupImageData = null;
      this._setPointsColorOrUV(mesh, pointsGroup, isVolume, true, false);
      return;
    }
    const mat = mesh.material;
    const textureList = mat.getActiveTextures();
    if (textureList.length === 0) {
      Logger.Warn(mesh.name + "has no usable texture.");
      pointsGroup._groupImageData = null;
      this._setPointsColorOrUV(mesh, pointsGroup, isVolume, true, false);
      return;
    }
    const clone = mesh.clone();
    clone.setEnabled(false);
    this._promises.push(new Promise((resolve) => {
      BaseTexture.WhenAllReady(textureList, () => {
        let n = pointsGroup._textureNb;
        if (n < 0) {
          n = 0;
        }
        if (n > textureList.length - 1) {
          n = textureList.length - 1;
        }
        const finalize = () => {
          pointsGroup._groupImgWidth = textureList[n].getSize().width;
          pointsGroup._groupImgHeight = textureList[n].getSize().height;
          this._setPointsColorOrUV(clone, pointsGroup, isVolume, true, true, void 0, void 0, textureList[n].coordinatesIndex);
          clone.dispose();
          resolve();
        };
        pointsGroup._groupImageData = null;
        const dataPromise = textureList[n].readPixels();
        if (!dataPromise) {
          finalize();
        } else {
          dataPromise.then((data) => {
            pointsGroup._groupImageData = data;
            finalize();
          });
        }
      });
    }));
  }
  // calculates the point density per facet of a mesh for surface points
  _calculateDensity(nbPoints, positions, indices) {
    let id0;
    let id1;
    let id2;
    let v0X;
    let v0Y;
    let v0Z;
    let v1X;
    let v1Y;
    let v1Z;
    let v2X;
    let v2Y;
    let v2Z;
    const vertex0 = Vector3.Zero();
    const vertex1 = Vector3.Zero();
    const vertex2 = Vector3.Zero();
    const vec0 = Vector3.Zero();
    const vec1 = Vector3.Zero();
    const normal = Vector3.Zero();
    let area;
    const cumulativeAreas = [];
    let surfaceArea = 0;
    const nbFacets = indices.length / 3;
    for (let index = 0; index < nbFacets; index++) {
      id0 = indices[3 * index];
      id1 = indices[3 * index + 1];
      id2 = indices[3 * index + 2];
      v0X = positions[3 * id0];
      v0Y = positions[3 * id0 + 1];
      v0Z = positions[3 * id0 + 2];
      v1X = positions[3 * id1];
      v1Y = positions[3 * id1 + 1];
      v1Z = positions[3 * id1 + 2];
      v2X = positions[3 * id2];
      v2Y = positions[3 * id2 + 1];
      v2Z = positions[3 * id2 + 2];
      vertex0.set(v0X, v0Y, v0Z);
      vertex1.set(v1X, v1Y, v1Z);
      vertex2.set(v2X, v2Y, v2Z);
      vertex1.subtractToRef(vertex0, vec0);
      vertex2.subtractToRef(vertex1, vec1);
      Vector3.CrossToRef(vec0, vec1, normal);
      area = 0.5 * normal.length();
      surfaceArea += area;
      cumulativeAreas[index] = surfaceArea;
    }
    const density = new Array(nbFacets);
    let remainingPoints = nbPoints;
    for (let index = nbFacets - 1; index > 0; index--) {
      const cumulativeArea = cumulativeAreas[index];
      if (cumulativeArea === 0) {
        density[index] = 0;
      } else {
        const area2 = cumulativeArea - cumulativeAreas[index - 1];
        const facetPointsWithFraction = area2 / cumulativeArea * remainingPoints;
        const floored = Math.floor(facetPointsWithFraction);
        const fraction = facetPointsWithFraction - floored;
        const extraPoint = Number(Math.random() < fraction);
        const facetPoints = floored + extraPoint;
        density[index] = facetPoints;
        remainingPoints -= facetPoints;
      }
    }
    density[0] = remainingPoints;
    return density;
  }
  /**
   * Adds points to the PCS in random positions within a unit sphere
   * @param nb (positive integer) the number of particles to be created from this model
   * @param pointFunction is an optional javascript function to be called for each particle on PCS creation
   * @returns the number of groups in the system
   */
  addPoints(nb, pointFunction = this._randomUnitVector) {
    const pointsGroup = new PointsGroup(this._groupCounter, pointFunction);
    let cp;
    let idx = this.nbParticles;
    for (let i = 0; i < nb; i++) {
      cp = this._addParticle(idx, pointsGroup, this._groupCounter, i);
      if (pointsGroup && pointsGroup._positionFunction) {
        pointsGroup._positionFunction(cp, idx, i);
      }
      this._positions.push(cp.position.x, cp.position.y, cp.position.z);
      if (cp.color) {
        this._colors.push(cp.color.r, cp.color.g, cp.color.b, cp.color.a);
      }
      if (cp.uv) {
        this._uvs.push(cp.uv.x, cp.uv.y);
      }
      idx++;
    }
    this.nbParticles += nb;
    this._groupCounter++;
    return this._groupCounter;
  }
  /**
   * Adds points to the PCS from the surface of the model shape
   * @param mesh is any Mesh object that will be used as a surface model for the points
   * @param nb (positive integer) the number of particles to be created from this model
   * @param colorWith determines whether a point is colored using color (default), uv, random, stated or none (invisible)
   * @param color (color4) to be used when colorWith is stated or color (number) when used to specify texture position
   * @param range (number from 0 to 1) to determine the variation in shape and tone for a stated color
   * @returns the number of groups in the system
   */
  addSurfacePoints(mesh, nb, colorWith, color, range) {
    let colored = colorWith ? colorWith : 0;
    if (isNaN(colored) || colored < 0 || colored > 3) {
      colored = 0;
    }
    const meshPos = mesh.getVerticesData(VertexBuffer.PositionKind);
    const meshInd = mesh.getIndices();
    this._groups.push(this._groupCounter);
    const pointsGroup = new PointsGroup(this._groupCounter, null);
    pointsGroup._groupDensity = this._calculateDensity(nb, meshPos, meshInd);
    if (colored === 2) {
      pointsGroup._textureNb = color ? color : 0;
    } else {
      color = color ? color : new Color4(1, 1, 1, 1);
    }
    switch (colored) {
      case 2:
        this._colorFromTexture(mesh, pointsGroup, false);
        break;
      case 1:
        this._setPointsColorOrUV(mesh, pointsGroup, false, false, false);
        break;
      case 0:
        this._setPointsColorOrUV(mesh, pointsGroup, false);
        break;
      case 3:
        this._setPointsColorOrUV(mesh, pointsGroup, false, void 0, void 0, color, range);
        break;
    }
    this.nbParticles += nb;
    this._groupCounter++;
    return this._groupCounter - 1;
  }
  /**
   * Adds points to the PCS inside the model shape
   * @param mesh is any Mesh object that will be used as a surface model for the points
   * @param nb (positive integer) the number of particles to be created from this model
   * @param colorWith determines whether a point is colored using color (default), uv, random, stated or none (invisible)
   * @param color (color4) to be used when colorWith is stated or color (number) when used to specify texture position
   * @param range (number from 0 to 1) to determine the variation in shape and tone for a stated color
   * @returns the number of groups in the system
   */
  addVolumePoints(mesh, nb, colorWith, color, range) {
    let colored = colorWith ? colorWith : 0;
    if (isNaN(colored) || colored < 0 || colored > 3) {
      colored = 0;
    }
    const meshPos = mesh.getVerticesData(VertexBuffer.PositionKind);
    const meshInd = mesh.getIndices();
    this._groups.push(this._groupCounter);
    const pointsGroup = new PointsGroup(this._groupCounter, null);
    pointsGroup._groupDensity = this._calculateDensity(nb, meshPos, meshInd);
    if (colored === 2) {
      pointsGroup._textureNb = color ? color : 0;
    } else {
      color = color ? color : new Color4(1, 1, 1, 1);
    }
    switch (colored) {
      case 2:
        this._colorFromTexture(mesh, pointsGroup, true);
        break;
      case 1:
        this._setPointsColorOrUV(mesh, pointsGroup, true, false, false);
        break;
      case 0:
        this._setPointsColorOrUV(mesh, pointsGroup, true);
        break;
      case 3:
        this._setPointsColorOrUV(mesh, pointsGroup, true, void 0, void 0, color, range);
        break;
    }
    this.nbParticles += nb;
    this._groupCounter++;
    return this._groupCounter - 1;
  }
  /**
   *  Sets all the particles : this method actually really updates the mesh according to the particle positions, rotations, colors, textures, etc.
   *  This method calls `updateParticle()` for each particle of the SPS.
   *  For an animated SPS, it is usually called within the render loop.
   * @param start The particle index in the particle array where to start to compute the particle property values _(default 0)_
   * @param end The particle index in the particle array where to stop to compute the particle property values _(default nbParticle - 1)_
   * @param update If the mesh must be finally updated on this call after all the particle computations _(default true)_
   * @returns the PCS.
   */
  setParticles(start = 0, end = this.nbParticles - 1, update = true) {
    var _a, _b;
    if (!this._updatable || !this._isReady) {
      return this;
    }
    this.beforeUpdateParticles(start, end, update);
    const rotMatrix = TmpVectors.Matrix[0];
    const mesh = this.mesh;
    const colors32 = this._colors32;
    const positions32 = this._positions32;
    const uvs32 = this._uvs32;
    const tempVectors = TmpVectors.Vector3;
    const camAxisX = tempVectors[5].copyFromFloats(1, 0, 0);
    const camAxisY = tempVectors[6].copyFromFloats(0, 1, 0);
    const camAxisZ = tempVectors[7].copyFromFloats(0, 0, 1);
    const minimum = tempVectors[8].setAll(Number.MAX_VALUE);
    const maximum = tempVectors[9].setAll(-Number.MAX_VALUE);
    Matrix.IdentityToRef(rotMatrix);
    let idx = 0;
    if ((_a = this.mesh) == null ? void 0 : _a.isFacetDataEnabled) {
      this._computeBoundingBox = true;
    }
    end = end >= this.nbParticles ? this.nbParticles - 1 : end;
    if (this._computeBoundingBox) {
      if (start != 0 || end != this.nbParticles - 1) {
        const boundingInfo = (_b = this.mesh) == null ? void 0 : _b.getBoundingInfo();
        if (boundingInfo) {
          minimum.copyFrom(boundingInfo.minimum);
          maximum.copyFrom(boundingInfo.maximum);
        }
      }
    }
    idx = 0;
    let pindex = 0;
    let cindex = 0;
    let uindex = 0;
    for (let p = start; p <= end; p++) {
      const particle = this.particles[p];
      idx = particle.idx;
      pindex = 3 * idx;
      cindex = 4 * idx;
      uindex = 2 * idx;
      this.updateParticle(particle);
      const particleRotationMatrix = particle._rotationMatrix;
      const particlePosition = particle.position;
      const particleGlobalPosition = particle._globalPosition;
      if (this._computeParticleRotation) {
        particle.getRotationMatrix(rotMatrix);
      }
      const particleHasParent = particle.parentId !== null;
      if (particleHasParent) {
        const parent = this.particles[particle.parentId];
        const parentRotationMatrix = parent._rotationMatrix;
        const parentGlobalPosition = parent._globalPosition;
        const rotatedY2 = particlePosition.x * parentRotationMatrix[1] + particlePosition.y * parentRotationMatrix[4] + particlePosition.z * parentRotationMatrix[7];
        const rotatedX2 = particlePosition.x * parentRotationMatrix[0] + particlePosition.y * parentRotationMatrix[3] + particlePosition.z * parentRotationMatrix[6];
        const rotatedZ2 = particlePosition.x * parentRotationMatrix[2] + particlePosition.y * parentRotationMatrix[5] + particlePosition.z * parentRotationMatrix[8];
        particleGlobalPosition.x = parentGlobalPosition.x + rotatedX2;
        particleGlobalPosition.y = parentGlobalPosition.y + rotatedY2;
        particleGlobalPosition.z = parentGlobalPosition.z + rotatedZ2;
        if (this._computeParticleRotation) {
          const rotMatrixValues = rotMatrix.m;
          particleRotationMatrix[0] = rotMatrixValues[0] * parentRotationMatrix[0] + rotMatrixValues[1] * parentRotationMatrix[3] + rotMatrixValues[2] * parentRotationMatrix[6];
          particleRotationMatrix[1] = rotMatrixValues[0] * parentRotationMatrix[1] + rotMatrixValues[1] * parentRotationMatrix[4] + rotMatrixValues[2] * parentRotationMatrix[7];
          particleRotationMatrix[2] = rotMatrixValues[0] * parentRotationMatrix[2] + rotMatrixValues[1] * parentRotationMatrix[5] + rotMatrixValues[2] * parentRotationMatrix[8];
          particleRotationMatrix[3] = rotMatrixValues[4] * parentRotationMatrix[0] + rotMatrixValues[5] * parentRotationMatrix[3] + rotMatrixValues[6] * parentRotationMatrix[6];
          particleRotationMatrix[4] = rotMatrixValues[4] * parentRotationMatrix[1] + rotMatrixValues[5] * parentRotationMatrix[4] + rotMatrixValues[6] * parentRotationMatrix[7];
          particleRotationMatrix[5] = rotMatrixValues[4] * parentRotationMatrix[2] + rotMatrixValues[5] * parentRotationMatrix[5] + rotMatrixValues[6] * parentRotationMatrix[8];
          particleRotationMatrix[6] = rotMatrixValues[8] * parentRotationMatrix[0] + rotMatrixValues[9] * parentRotationMatrix[3] + rotMatrixValues[10] * parentRotationMatrix[6];
          particleRotationMatrix[7] = rotMatrixValues[8] * parentRotationMatrix[1] + rotMatrixValues[9] * parentRotationMatrix[4] + rotMatrixValues[10] * parentRotationMatrix[7];
          particleRotationMatrix[8] = rotMatrixValues[8] * parentRotationMatrix[2] + rotMatrixValues[9] * parentRotationMatrix[5] + rotMatrixValues[10] * parentRotationMatrix[8];
        }
      } else {
        particleGlobalPosition.x = 0;
        particleGlobalPosition.y = 0;
        particleGlobalPosition.z = 0;
        if (this._computeParticleRotation) {
          const rotMatrixValues = rotMatrix.m;
          particleRotationMatrix[0] = rotMatrixValues[0];
          particleRotationMatrix[1] = rotMatrixValues[1];
          particleRotationMatrix[2] = rotMatrixValues[2];
          particleRotationMatrix[3] = rotMatrixValues[4];
          particleRotationMatrix[4] = rotMatrixValues[5];
          particleRotationMatrix[5] = rotMatrixValues[6];
          particleRotationMatrix[6] = rotMatrixValues[8];
          particleRotationMatrix[7] = rotMatrixValues[9];
          particleRotationMatrix[8] = rotMatrixValues[10];
        }
      }
      const pivotBackTranslation = tempVectors[11];
      if (particle.translateFromPivot) {
        pivotBackTranslation.setAll(0);
      } else {
        pivotBackTranslation.copyFrom(particle.pivot);
      }
      const tmpVertex = tempVectors[0];
      tmpVertex.copyFrom(particle.position);
      const vertexX = tmpVertex.x - particle.pivot.x;
      const vertexY = tmpVertex.y - particle.pivot.y;
      const vertexZ = tmpVertex.z - particle.pivot.z;
      let rotatedX = vertexX * particleRotationMatrix[0] + vertexY * particleRotationMatrix[3] + vertexZ * particleRotationMatrix[6];
      let rotatedY = vertexX * particleRotationMatrix[1] + vertexY * particleRotationMatrix[4] + vertexZ * particleRotationMatrix[7];
      let rotatedZ = vertexX * particleRotationMatrix[2] + vertexY * particleRotationMatrix[5] + vertexZ * particleRotationMatrix[8];
      rotatedX += pivotBackTranslation.x;
      rotatedY += pivotBackTranslation.y;
      rotatedZ += pivotBackTranslation.z;
      const px = positions32[pindex] = particleGlobalPosition.x + camAxisX.x * rotatedX + camAxisY.x * rotatedY + camAxisZ.x * rotatedZ;
      const py = positions32[pindex + 1] = particleGlobalPosition.y + camAxisX.y * rotatedX + camAxisY.y * rotatedY + camAxisZ.y * rotatedZ;
      const pz = positions32[pindex + 2] = particleGlobalPosition.z + camAxisX.z * rotatedX + camAxisY.z * rotatedY + camAxisZ.z * rotatedZ;
      if (this._computeBoundingBox) {
        minimum.minimizeInPlaceFromFloats(px, py, pz);
        maximum.maximizeInPlaceFromFloats(px, py, pz);
      }
      if (this._computeParticleColor && particle.color) {
        const color = particle.color;
        const colors322 = this._colors32;
        colors322[cindex] = color.r;
        colors322[cindex + 1] = color.g;
        colors322[cindex + 2] = color.b;
        colors322[cindex + 3] = color.a;
      }
      if (this._computeParticleTexture && particle.uv) {
        const uv = particle.uv;
        const uvs322 = this._uvs32;
        uvs322[uindex] = uv.x;
        uvs322[uindex + 1] = uv.y;
      }
    }
    if (mesh) {
      if (update) {
        if (this._computeParticleColor) {
          mesh.updateVerticesData(VertexBuffer.ColorKind, colors32, false, false);
        }
        if (this._computeParticleTexture) {
          mesh.updateVerticesData(VertexBuffer.UVKind, uvs32, false, false);
        }
        mesh.updateVerticesData(VertexBuffer.PositionKind, positions32, false, false);
      }
      if (this._computeBoundingBox) {
        if (mesh.hasBoundingInfo) {
          mesh.getBoundingInfo().reConstruct(minimum, maximum, mesh._worldMatrix);
        } else {
          mesh.buildBoundingInfo(minimum, maximum, mesh._worldMatrix);
        }
      }
    }
    this.afterUpdateParticles(start, end, update);
    return this;
  }
  /**
   * Disposes the PCS.
   */
  dispose() {
    var _a;
    (_a = this.mesh) == null ? void 0 : _a.dispose();
    this.vars = null;
    this._positions = null;
    this._indices = null;
    this._normals = null;
    this._uvs = null;
    this._colors = null;
    this._indices32 = null;
    this._positions32 = null;
    this._uvs32 = null;
    this._colors32 = null;
  }
  /**
   * Visibility helper : Recomputes the visible size according to the mesh bounding box
   * doc :
   * @returns the PCS.
   */
  refreshVisibleSize() {
    var _a;
    if (!this._isVisibilityBoxLocked) {
      (_a = this.mesh) == null ? void 0 : _a.refreshBoundingInfo();
    }
    return this;
  }
  /**
   * Visibility helper : Sets the size of a visibility box, this sets the underlying mesh bounding box.
   * @param size the size (float) of the visibility box
   * note : this doesn't lock the PCS mesh bounding box.
   * doc :
   */
  setVisibilityBox(size) {
    if (!this.mesh) {
      return;
    }
    const vis = size / 2;
    this.mesh.buildBoundingInfo(new Vector3(-vis, -vis, -vis), new Vector3(vis, vis, vis));
  }
  /**
   * Gets whether the PCS is always visible or not
   * doc :
   */
  get isAlwaysVisible() {
    return this._alwaysVisible;
  }
  /**
   * Sets the PCS as always visible or not
   * doc :
   */
  set isAlwaysVisible(val) {
    if (!this.mesh) {
      return;
    }
    this._alwaysVisible = val;
    this.mesh.alwaysSelectAsActiveMesh = val;
  }
  /**
   * Tells to `setParticles()` to compute the particle rotations or not
   * Default value : false. The PCS is faster when it's set to false
   * Note : particle rotations are only applied to parent particles
   * Note : the particle rotations aren't stored values, so setting `computeParticleRotation` to false will prevents the particle to rotate
   */
  set computeParticleRotation(val) {
    this._computeParticleRotation = val;
  }
  /**
   * Tells to `setParticles()` to compute the particle colors or not.
   * Default value : true. The PCS is faster when it's set to false.
   * Note : the particle colors are stored values, so setting `computeParticleColor` to false will keep yet the last colors set.
   */
  set computeParticleColor(val) {
    this._computeParticleColor = val;
  }
  set computeParticleTexture(val) {
    this._computeParticleTexture = val;
  }
  /**
   * Gets if `setParticles()` computes the particle colors or not.
   * Default value : false. The PCS is faster when it's set to false.
   * Note : the particle colors are stored values, so setting `computeParticleColor` to false will keep yet the last colors set.
   */
  get computeParticleColor() {
    return this._computeParticleColor;
  }
  /**
   * Gets if `setParticles()` computes the particle textures or not.
   * Default value : false. The PCS is faster when it's set to false.
   * Note : the particle textures are stored values, so setting `computeParticleTexture` to false will keep yet the last colors set.
   */
  get computeParticleTexture() {
    return this._computeParticleTexture;
  }
  /**
   * Tells to `setParticles()` to compute or not the mesh bounding box when computing the particle positions.
   */
  set computeBoundingBox(val) {
    this._computeBoundingBox = val;
  }
  /**
   * Gets if `setParticles()` computes or not the mesh bounding box when computing the particle positions.
   */
  get computeBoundingBox() {
    return this._computeBoundingBox;
  }
  // =======================================================================
  // Particle behavior logic
  // these following methods may be overwritten by users to fit their needs
  /**
   * This function does nothing. It may be overwritten to set all the particle first values.
   * The PCS doesn't call this function, you may have to call it by your own.
   * doc :
   */
  initParticles() {
  }
  /**
   * This function does nothing. It may be overwritten to recycle a particle
   * The PCS doesn't call this function, you can to call it
   * doc :
   * @param particle The particle to recycle
   * @returns the recycled particle
   */
  recycleParticle(particle) {
    return particle;
  }
  /**
   * Updates a particle : this function should  be overwritten by the user.
   * It is called on each particle by `setParticles()`. This is the place to code each particle behavior.
   * doc :
   * @example : just set a particle position or velocity and recycle conditions
   * @param particle The particle to update
   * @returns the updated particle
   */
  updateParticle(particle) {
    return particle;
  }
  /**
   * This will be called before any other treatment by `setParticles()` and will be passed three parameters.
   * This does nothing and may be overwritten by the user.
   * @param start the particle index in the particle array where to start to iterate, same than the value passed to setParticle()
   * @param stop the particle index in the particle array where to stop to iterate, same than the value passed to setParticle()
   * @param update the boolean update value actually passed to setParticles()
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  beforeUpdateParticles(start, stop, update) {
  }
  /**
   * This will be called  by `setParticles()` after all the other treatments and just before the actual mesh update.
   * This will be passed three parameters.
   * This does nothing and may be overwritten by the user.
   * @param start the particle index in the particle array where to start to iterate, same than the value passed to setParticle()
   * @param stop the particle index in the particle array where to stop to iterate, same than the value passed to setParticle()
   * @param update the boolean update value actually passed to setParticles()
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterUpdateParticles(start, stop, update) {
  }
}
var Mode;
(function(Mode2) {
  Mode2[Mode2["Splat"] = 0] = "Splat";
  Mode2[Mode2["PointCloud"] = 1] = "PointCloud";
  Mode2[Mode2["Mesh"] = 2] = "Mesh";
  Mode2[Mode2["Reject"] = 3] = "Reject";
})(Mode || (Mode = {}));
class SPLATFileLoader {
  /**
   * Creates loader for gaussian splatting files
   * @param loadingOptions options for loading and parsing splat and PLY files.
   */
  constructor(loadingOptions = SPLATFileLoader._DefaultLoadingOptions) {
    this.name = SPLATFileLoaderMetadata.name;
    this._assetContainer = null;
    this.extensions = SPLATFileLoaderMetadata.extensions;
    this._loadingOptions = loadingOptions;
  }
  /** @internal */
  createPlugin(options) {
    return new SPLATFileLoader(options[SPLATFileLoaderMetadata.name]);
  }
  /**
   * Imports  from the loaded gaussian splatting data and adds them to the scene
   * @param meshesNames a string or array of strings of the mesh names that should be loaded from the file
   * @param scene the scene the meshes should be added to
   * @param data the gaussian splatting data to load
   * @param rootUrl root url to load from
   * @param onProgress callback called while file is loading
   * @param fileName Defines the name of the file to load
   * @returns a promise containing the loaded meshes, particles, skeletons and animations
   */
  async importMeshAsync(meshesNames, scene, data, rootUrl, onProgress, fileName) {
    return this._parse(meshesNames, scene, data, rootUrl).then((meshes) => {
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
  static _BuildPointCloud(pointcloud, data) {
    if (!data.byteLength) {
      return false;
    }
    const uBuffer = new Uint8Array(data);
    const fBuffer = new Float32Array(data);
    const rowLength = 3 * 4 + 3 * 4 + 4 + 4;
    const vertexCount = uBuffer.length / rowLength;
    const pointcloudfunc = function(particle, i) {
      const x = fBuffer[8 * i + 0];
      const y = fBuffer[8 * i + 1];
      const z = fBuffer[8 * i + 2];
      particle.position = new Vector3(x, y, z);
      const r = uBuffer[rowLength * i + 24 + 0] / 255;
      const g = uBuffer[rowLength * i + 24 + 1] / 255;
      const b = uBuffer[rowLength * i + 24 + 2] / 255;
      particle.color = new Color4(r, g, b, 1);
    };
    pointcloud.addPoints(vertexCount, pointcloudfunc);
    return true;
  }
  static _BuildMesh(scene, parsedPLY) {
    const mesh = new Mesh("PLYMesh", scene);
    const uBuffer = new Uint8Array(parsedPLY.data);
    const fBuffer = new Float32Array(parsedPLY.data);
    const rowLength = 3 * 4 + 3 * 4 + 4 + 4;
    const vertexCount = uBuffer.length / rowLength;
    const positions = [];
    const vertexData = new VertexData();
    for (let i = 0; i < vertexCount; i++) {
      const x = fBuffer[8 * i + 0];
      const y = fBuffer[8 * i + 1];
      const z = fBuffer[8 * i + 2];
      positions.push(x, y, z);
    }
    if (parsedPLY.hasVertexColors) {
      const colors = new Float32Array(vertexCount * 4);
      for (let i = 0; i < vertexCount; i++) {
        const r = uBuffer[rowLength * i + 24 + 0] / 255;
        const g = uBuffer[rowLength * i + 24 + 1] / 255;
        const b = uBuffer[rowLength * i + 24 + 2] / 255;
        colors[i * 4 + 0] = r;
        colors[i * 4 + 1] = g;
        colors[i * 4 + 2] = b;
        colors[i * 4 + 3] = 1;
      }
      vertexData.colors = colors;
    }
    vertexData.positions = positions;
    vertexData.indices = parsedPLY.faces;
    vertexData.applyToMesh(mesh);
    return mesh;
  }
  _parseSPZ(data, scene) {
    const ubuf = new Uint8Array(data);
    const ubufu32 = new Uint32Array(data.slice(0, 12));
    const splatCount = ubufu32[2];
    const shDegree = ubuf[12];
    const fractionalBits = ubuf[13];
    const reserved = ubuf[15];
    if (reserved || ubufu32[0] != 1347635022 || ubufu32[1] != 2) {
      return new Promise((resolve) => {
        resolve({ mode: 3, data: buffer, hasVertexColors: false });
      });
    }
    const rowOutputLength = 3 * 4 + 3 * 4 + 4 + 4;
    const buffer = new ArrayBuffer(rowOutputLength * splatCount);
    const positionScale = 1 / (1 << fractionalBits);
    const int32View = new Int32Array(1);
    const uint8View = new Uint8Array(int32View.buffer);
    const read24bComponent = function(u8, offset) {
      uint8View[0] = u8[offset + 0];
      uint8View[1] = u8[offset + 1];
      uint8View[2] = u8[offset + 2];
      uint8View[3] = u8[offset + 2] & 128 ? 255 : 0;
      return int32View[0] * positionScale;
    };
    let byteOffset = 16;
    const position = new Float32Array(buffer);
    const scale = new Float32Array(buffer);
    const rgba = new Uint8ClampedArray(buffer);
    const rot = new Uint8ClampedArray(buffer);
    let coordinateSign = 1;
    let quaternionOffset = 0;
    if (!this._loadingOptions.flipY) {
      coordinateSign = -1;
      quaternionOffset = 255;
    }
    for (let i = 0; i < splatCount; i++) {
      position[i * 8 + 0] = read24bComponent(ubuf, byteOffset + 0);
      position[i * 8 + 1] = coordinateSign * read24bComponent(ubuf, byteOffset + 3);
      position[i * 8 + 2] = coordinateSign * read24bComponent(ubuf, byteOffset + 6);
      byteOffset += 9;
    }
    const SH_C0 = 0.282;
    for (let i = 0; i < splatCount; i++) {
      for (let component = 0; component < 3; component++) {
        const byteValue = ubuf[byteOffset + splatCount + i * 3 + component];
        const value = (byteValue - 127.5) / (0.15 * 255);
        rgba[i * 32 + 24 + component] = Scalar.Clamp((0.5 + SH_C0 * value) * 255, 0, 255);
      }
      rgba[i * 32 + 24 + 3] = ubuf[byteOffset + i];
    }
    byteOffset += splatCount * 4;
    for (let i = 0; i < splatCount; i++) {
      scale[i * 8 + 3 + 0] = Math.exp(ubuf[byteOffset + 0] / 16 - 10);
      scale[i * 8 + 3 + 1] = Math.exp(ubuf[byteOffset + 1] / 16 - 10);
      scale[i * 8 + 3 + 2] = Math.exp(ubuf[byteOffset + 2] / 16 - 10);
      byteOffset += 3;
    }
    for (let i = 0; i < splatCount; i++) {
      const x = ubuf[byteOffset + 0];
      const y = ubuf[byteOffset + 1] * coordinateSign + quaternionOffset;
      const z = ubuf[byteOffset + 2] * coordinateSign + quaternionOffset;
      const nx = x / 127.5 - 1;
      const ny = y / 127.5 - 1;
      const nz = z / 127.5 - 1;
      rot[i * 32 + 28 + 1] = x;
      rot[i * 32 + 28 + 2] = y;
      rot[i * 32 + 28 + 3] = z;
      const v = 1 - (nx * nx + ny * ny + nz * nz);
      rot[i * 32 + 28 + 0] = 127.5 + Math.sqrt(v < 0 ? 0 : v) * 127.5;
      byteOffset += 3;
    }
    if (shDegree) {
      const shVectorCount = (shDegree + 1) * (shDegree + 1) - 1;
      const shComponentCount = shVectorCount * 3;
      const textureCount = Math.ceil(shComponentCount / 16);
      let shIndexRead = byteOffset;
      const sh = [];
      const engine = scene.getEngine();
      const width = engine.getCaps().maxTextureSize;
      const height = Math.ceil(splatCount / width);
      for (let textureIndex = 0; textureIndex < textureCount; textureIndex++) {
        const texture = new Uint8Array(height * width * 4 * 4);
        sh.push(texture);
      }
      for (let i = 0; i < splatCount; i++) {
        for (let shIndexWrite = 0; shIndexWrite < shComponentCount; shIndexWrite++) {
          const shValue = ubuf[shIndexRead++];
          const textureIndex = Math.floor(shIndexWrite / 16);
          const shArray = sh[textureIndex];
          const byteIndexInTexture = shIndexWrite % 16;
          const offsetPerSplat = i * 16;
          shArray[byteIndexInTexture + offsetPerSplat] = shValue;
        }
      }
      return new Promise((resolve) => {
        resolve({ mode: 0, data: buffer, hasVertexColors: false, sh });
      });
    }
    return new Promise((resolve) => {
      resolve({ mode: 0, data: buffer, hasVertexColors: false });
    });
  }
  _parse(meshesNames, scene, data, rootUrl) {
    const babylonMeshesArray = [];
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(data));
        controller.close();
      }
    });
    const decompressionStream = new DecompressionStream("gzip");
    const decompressedStream = readableStream.pipeThrough(decompressionStream);
    return new Promise((resolve) => {
      new Response(decompressedStream).arrayBuffer().then((buffer) => {
        this._parseSPZ(buffer, scene).then((parsedSPZ) => {
          scene._blockEntityCollection = !!this._assetContainer;
          const gaussianSplatting = new GaussianSplattingMesh("GaussianSplatting", null, scene, this._loadingOptions.keepInRam);
          gaussianSplatting._parentContainer = this._assetContainer;
          babylonMeshesArray.push(gaussianSplatting);
          gaussianSplatting.updateData(parsedSPZ.data, parsedSPZ.sh);
          scene._blockEntityCollection = false;
          resolve(babylonMeshesArray);
        });
      }).catch(() => {
        SPLATFileLoader._ConvertPLYToSplat(data).then(async (parsedPLY) => {
          scene._blockEntityCollection = !!this._assetContainer;
          switch (parsedPLY.mode) {
            case 0:
              {
                const gaussianSplatting = new GaussianSplattingMesh("GaussianSplatting", null, scene, this._loadingOptions.keepInRam);
                gaussianSplatting._parentContainer = this._assetContainer;
                babylonMeshesArray.push(gaussianSplatting);
                gaussianSplatting.updateData(parsedPLY.data, parsedPLY.sh);
              }
              break;
            case 1:
              {
                const pointcloud = new PointsCloudSystem("PointCloud", 1, scene);
                if (SPLATFileLoader._BuildPointCloud(pointcloud, parsedPLY.data)) {
                  await pointcloud.buildMeshAsync().then((mesh) => {
                    babylonMeshesArray.push(mesh);
                  });
                } else {
                  pointcloud.dispose();
                }
              }
              break;
            case 2:
              {
                if (parsedPLY.faces) {
                  babylonMeshesArray.push(SPLATFileLoader._BuildMesh(scene, parsedPLY));
                } else {
                  throw new Error("PLY mesh doesn't contain face informations.");
                }
              }
              break;
            default:
              throw new Error("Unsupported Splat mode");
          }
          scene._blockEntityCollection = false;
          resolve(babylonMeshesArray);
        });
      });
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
      this._assetContainer = null;
      return container;
    }).catch((ex) => {
      this._assetContainer = null;
      throw ex;
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
   * Code from https://github.com/dylanebert/gsplat.js/blob/main/src/loaders/PLYLoader.ts Under MIT license
   * Converts a .ply data array buffer to splat
   * if data array buffer is not ply, returns the original buffer
   * @param data the .ply data to load
   * @returns the loaded splat buffer
   */
  static _ConvertPLYToSplat(data) {
    const ubuf = new Uint8Array(data);
    const header = new TextDecoder().decode(ubuf.slice(0, 1024 * 10));
    const headerEnd = "end_header\n";
    const headerEndIndex = header.indexOf(headerEnd);
    if (headerEndIndex < 0 || !header) {
      return new Promise((resolve) => {
        resolve({ mode: 0, data });
      });
    }
    const vertexCount = parseInt(/element vertex (\d+)\n/.exec(header)[1]);
    const faceElement = /element face (\d+)\n/.exec(header);
    let faceCount = 0;
    if (faceElement) {
      faceCount = parseInt(faceElement[1]);
    }
    const chunkElement = /element chunk (\d+)\n/.exec(header);
    let chunkCount = 0;
    if (chunkElement) {
      chunkCount = parseInt(chunkElement[1]);
    }
    let rowVertexOffset = 0;
    let rowChunkOffset = 0;
    const offsets = {
      double: 8,
      int: 4,
      uint: 4,
      float: 4,
      short: 2,
      ushort: 2,
      uchar: 1,
      list: 0
    };
    let ElementMode;
    (function(ElementMode2) {
      ElementMode2[ElementMode2["Vertex"] = 0] = "Vertex";
      ElementMode2[ElementMode2["Chunk"] = 1] = "Chunk";
    })(ElementMode || (ElementMode = {}));
    let chunkMode = 1;
    const vertexProperties = [];
    const filtered = header.slice(0, headerEndIndex).split("\n");
    for (const prop of filtered) {
      if (prop.startsWith("property ")) {
        const [, type, name2] = prop.split(" ");
        if (chunkMode == 1) {
          rowChunkOffset += offsets[type];
        } else if (chunkMode == 0) {
          vertexProperties.push({ name: name2, type, offset: rowVertexOffset });
          rowVertexOffset += offsets[type];
        }
        if (!offsets[type]) {
          Logger.Warn(`Unsupported property type: ${type}.`);
        }
      } else if (prop.startsWith("element ")) {
        const [, type] = prop.split(" ");
        if (type == "chunk") {
          chunkMode = 1;
        } else if (type == "vertex") {
          chunkMode = 0;
        }
      }
    }
    const rowVertexLength = rowVertexOffset;
    const rowChunkLength = rowChunkOffset;
    return GaussianSplattingMesh.ConvertPLYWithSHToSplatAsync(data).then((splatsData) => {
      const dataView = new DataView(data, headerEndIndex + headerEnd.length);
      let offset = rowChunkLength * chunkCount + rowVertexLength * vertexCount;
      const faces = [];
      if (faceCount) {
        for (let i = 0; i < faceCount; i++) {
          const faceVertexCount = dataView.getUint8(offset);
          if (faceVertexCount != 3) {
            continue;
          }
          offset += 1;
          for (let j = 0; j < faceVertexCount; j++) {
            const vertexIndex = dataView.getUint32(offset + (2 - j) * 4, true);
            faces.push(vertexIndex);
          }
          offset += 12;
        }
      }
      if (chunkCount) {
        return new Promise((resolve) => {
          resolve({ mode: 0, data: splatsData.buffer, sh: splatsData.sh, faces, hasVertexColors: false });
        });
      }
      let propertyCount = 0;
      let propertyColorCount = 0;
      const splatProperties = ["x", "y", "z", "scale_0", "scale_1", "scale_2", "opacity", "rot_0", "rot_1", "rot_2", "rot_3"];
      const splatColorProperties = ["red", "green", "blue", "f_dc_0", "f_dc_1", "f_dc_2"];
      for (let propertyIndex = 0; propertyIndex < vertexProperties.length; propertyIndex++) {
        const property = vertexProperties[propertyIndex];
        if (splatProperties.includes(property.name)) {
          propertyCount++;
        }
        if (splatColorProperties.includes(property.name)) {
          propertyColorCount++;
        }
      }
      const hasMandatoryProperties = propertyCount == splatProperties.length && propertyColorCount == 3;
      const currentMode = faceCount ? 2 : hasMandatoryProperties ? 0 : 1;
      return new Promise((resolve) => {
        resolve({ mode: currentMode, data: splatsData.buffer, sh: splatsData.sh, faces, hasVertexColors: !!propertyColorCount });
      });
    });
  }
}
SPLATFileLoader._DefaultLoadingOptions = {
  keepInRam: false,
  flipY: false
};
RegisterSceneLoaderPlugin(new SPLATFileLoader());
export {
  SPLATFileLoader
};
