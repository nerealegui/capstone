import{p as j}from"./chunk-IUKPXING-_Vy5pVHr.js";import{D as U,n as Z,o as q,s as H,g as J,c as K,b as Q,_ as u,l as F,t as X,d as Y,E as tt,I as et,P as at,j as rt}from"./mermaid.core-B6vJIFB8.js";import{p as nt}from"./mermaid-parser.core-CzRr_s6m.js";import{d as N}from"./arc-Ctxh2KTd.js";import{o as it}from"./ordinal-BeghXfj9.js";import{a as y,t as z,n as ot}from"./step-Ce-xBr2D.js";import"./index-Do3LSwBC.js";import"./svelte/svelte.js";import"./dispatch-kxCwF96_.js";import"./select-BigU4G0v.js";import"./_baseUniq-DXMskI19.js";import"./_basePickBy-CcJrA3Wy.js";import"./clone-0qGIwlhl.js";import"./init-Dmth1JHB.js";function st(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function lt(t){return t}function ct(){var t=lt,a=st,m=null,o=y(0),d=y(z),x=y(0);function i(e){var r,l=(e=ot(e)).length,c,A,h=0,p=new Array(l),n=new Array(l),v=+o.apply(this,arguments),w=Math.min(z,Math.max(-z,d.apply(this,arguments)-v)),f,T=Math.min(Math.abs(w)/l,x.apply(this,arguments)),$=T*(w<0?-1:1),g;for(r=0;r<l;++r)(g=n[p[r]=r]=+t(e[r],r,e))>0&&(h+=g);for(a!=null?p.sort(function(S,D){return a(n[S],n[D])}):m!=null&&p.sort(function(S,D){return m(e[S],e[D])}),r=0,A=h?(w-l*$)/h:0;r<l;++r,v=f)c=p[r],g=n[c],f=v+(g>0?g*A:0)+$,n[c]={data:e[c],index:r,value:g,startAngle:v,endAngle:f,padAngle:T};return n}return i.value=function(e){return arguments.length?(t=typeof e=="function"?e:y(+e),i):t},i.sortValues=function(e){return arguments.length?(a=e,m=null,i):a},i.sort=function(e){return arguments.length?(m=e,a=null,i):m},i.startAngle=function(e){return arguments.length?(o=typeof e=="function"?e:y(+e),i):o},i.endAngle=function(e){return arguments.length?(d=typeof e=="function"?e:y(+e),i):d},i.padAngle=function(e){return arguments.length?(x=typeof e=="function"?e:y(+e),i):x},i}var O=U.pie,G={sections:new Map,showData:!1,config:O},b=G.sections,P=G.showData,pt=structuredClone(O),ut=u(()=>structuredClone(pt),"getConfig"),dt=u(()=>{b=new Map,P=G.showData,X()},"clear"),gt=u(({label:t,value:a})=>{b.has(t)||(b.set(t,a),F.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),ft=u(()=>b,"getSections"),mt=u(t=>{P=t},"setShowData"),ht=u(()=>P,"getShowData"),R={getConfig:ut,clear:dt,setDiagramTitle:Z,getDiagramTitle:q,setAccTitle:H,getAccTitle:J,setAccDescription:K,getAccDescription:Q,addSection:gt,getSections:ft,setShowData:mt,getShowData:ht},vt=u((t,a)=>{j(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),St={parse:u(async t=>{const a=await nt("pie",t);F.debug(a),vt(a,R)},"parse")},yt=u(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),xt=yt,At=u(t=>{const a=[...t.entries()].map(o=>({label:o[0],value:o[1]})).sort((o,d)=>d.value-o.value);return ct().value(o=>o.value)(a)},"createPieArcs"),wt=u((t,a,m,o)=>{F.debug(`rendering pie chart
`+t);const d=o.db,x=Y(),i=tt(d.getConfig(),x.pie),e=40,r=18,l=4,c=450,A=c,h=et(a),p=h.append("g");p.attr("transform","translate("+A/2+","+c/2+")");const{themeVariables:n}=x;let[v]=at(n.pieOuterStrokeWidth);v??=2;const w=i.textPosition,f=Math.min(A,c)/2-e,T=N().innerRadius(0).outerRadius(f),$=N().innerRadius(f*w).outerRadius(f*w);p.append("circle").attr("cx",0).attr("cy",0).attr("r",f+v/2).attr("class","pieOuterCircle");const g=d.getSections(),S=At(g),D=[n.pie1,n.pie2,n.pie3,n.pie4,n.pie5,n.pie6,n.pie7,n.pie8,n.pie9,n.pie10,n.pie11,n.pie12],C=it(D);p.selectAll("mySlices").data(S).enter().append("path").attr("d",T).attr("fill",s=>C(s.data.label)).attr("class","pieCircle");let W=0;g.forEach(s=>{W+=s}),p.selectAll("mySlices").data(S).enter().append("text").text(s=>(s.data.value/W*100).toFixed(0)+"%").attr("transform",s=>"translate("+$.centroid(s)+")").style("text-anchor","middle").attr("class","slice"),p.append("text").text(d.getDiagramTitle()).attr("x",0).attr("y",-(c-50)/2).attr("class","pieTitleText");const M=p.selectAll(".legend").data(C.domain()).enter().append("g").attr("class","legend").attr("transform",(s,E)=>{const k=r+l,_=k*C.domain().length/2,B=12*r,V=E*k-_;return"translate("+B+","+V+")"});M.append("rect").attr("width",r).attr("height",r).style("fill",C).style("stroke",C),M.data(S).append("text").attr("x",r+l).attr("y",r-l).text(s=>{const{label:E,value:k}=s.data;return d.getShowData()?`${E} [${k}]`:E});const L=Math.max(...M.selectAll("text").nodes().map(s=>s?.getBoundingClientRect().width??0)),I=A+e+r+l+L;h.attr("viewBox",`0 0 ${I} ${c}`),rt(h,c,I,i.useMaxWidth)},"draw"),Dt={draw:wt},Ot={parser:St,db:R,renderer:Dt,styles:xt};export{Ot as diagram};
//# sourceMappingURL=pieDiagram-OC6WZ2SS-CvvouhZm.js.map
