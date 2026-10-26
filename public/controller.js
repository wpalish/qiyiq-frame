import {inspectImage} from './image-header.js';
import {normalizeRecipe,normalizeSettings,geometry} from './geometry.js';
const defaults=()=>({mode:'contain',width:1000,height:1000,matte:'white',crop:null});
const hash=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
function render(bitmap,g,settings){
 const canvas=document.createElement('canvas');canvas.width=settings.width;canvas.height=settings.height;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas2D unavailable');
 if(settings.matte==='white'){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);}
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';const s=g.source,d=g.destination;
 if(settings.mode==='crop') {
  // Canvas interpolation may sample outside a drawImage source rectangle.
  // Materialize its exact integer pixels first so resizing cannot borrow neighbors.
  const crop=document.createElement('canvas');crop.width=s.width;crop.height=s.height;
  try{const cut=crop.getContext('2d');if(!cut)throw Error('Canvas2D unavailable');cut.imageSmoothingEnabled=false;cut.drawImage(bitmap,s.x,s.y,s.width,s.height,0,0,s.width,s.height);ctx.drawImage(crop,0,0,s.width,s.height,d.x,d.y,d.width,d.height);}
  finally{crop.width=0;crop.height=0;}
 }else ctx.drawImage(bitmap,s.x,s.y,s.width,s.height,d.x,d.y,d.width,d.height);
 return canvas;
}
const encode=canvas=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG encoding failed')),'image/png'));
export class ImageSession {
 constructor(dependencies={}) {
  this.dep={hash,inspect:inspectImage,decode:async(bytes,header)=>createImageBitmap(new Blob([bytes],{type:header.format==='png'?'image/png':'image/jpeg'})),render,encode,releaseCanvas:c=>{c.width=0;c.height=0;},urlCreate:blob=>URL.createObjectURL(blob),urlRevoke:url=>URL.revokeObjectURL(url),now:()=>Date.now(),changed:()=>{},...dependencies};
  this.generation=0;this.actor=null;this._bitmap=null;this._preview=null;this._source=null;this._settings=null;this._geometry=null;this._output=null;this.blocked=true;this.inputValid=false;this.error=null;this.loadingGeneration=null;this.exportInFlight=false;this.loadQueue=Promise.resolve();
 }
 get bitmap(){return this._bitmap;}
 get state(){return {source:structuredClone(this._source),settings:structuredClone(this._settings),geometry:structuredClone(this._geometry),preview:this._preview,output:this._output?{...this._output,manifest:structuredClone(this._output.manifest)}:null,blocked:this.blocked,error:this.error,loading:this.loadingGeneration!==null,exporting:this.exportInFlight};}
 changed(){this.dep.changed(this.state);}
 invalidate(){this.generation++;if(this._output){this.dep.urlRevoke(this._output.pngUrl);this.dep.urlRevoke(this._output.manifestUrl);}this._output=null;this.blocked=true;this.error=null;return this.generation;}
 identity(name){
  if(name===this.actor)return;
  this.invalidate();this.actor=name;this.loadingGeneration=null;this.inputValid=false;
  this._bitmap?.close();if(this._preview)this.dep.releaseCanvas(this._preview);
  this._bitmap=null;this._preview=null;this._source=null;this._settings=null;this._geometry=null;this.changed();
 }
 load(file,{recipe=null}={}) {
  const token=this.invalidate();this.inputValid=false;this.loadingGeneration=token;
  let frozenRecipe=null,recipeError=null;
  try{frozenRecipe=recipe?normalizeRecipe({title:recipe.title,source:recipe.source,settings:recipe.settings}):null;}catch(e){recipeError=e;}
  this.changed();
  this.loadQueue=this.loadQueue.catch(()=>{}).then(async()=>{
   let bitmap=null,preview=null;
   const current=()=>this.generation===token&&!!this.actor;
   try {
    if(!current())return {status:'stale'};
    if(!file||!Number.isSafeInteger(file.size)||file.size<1||file.size>8388608)throw Error('File must be1–8388608 bytes');
    if(recipeError)throw recipeError;const saved=frozenRecipe;
    const bytes=new Uint8Array(await file.arrayBuffer());if(!current())return {status:'stale'};
    if(bytes.byteLength!==file.size)throw Error('File length changed');
    const header=this.dep.inspect(bytes),sha256=await this.dep.hash(bytes);if(!current())return {status:'stale'};
    const source={...header,sha256};
    if(saved&&['format','sha256','byteLength','width','height'].some(k=>source[k]!==saved.source[k]))throw Error('Reselect the exact saved source file');
    bitmap=await this.dep.decode(bytes,header);
    if(!current()){bitmap.close();bitmap=null;return {status:'stale'};}
    if(bitmap.width!==source.width||bitmap.height!==source.height)throw Error('Decoded/header dimensions differ');
    const settings=saved?saved.settings:defaults(),g=geometry(source,settings);preview=this.dep.render(bitmap,g,settings);
    if(!current()){bitmap.close();bitmap=null;this.dep.releaseCanvas(preview);preview=null;return {status:'stale'};}
    this._bitmap?.close();if(this._preview)this.dep.releaseCanvas(this._preview);
    this._bitmap=bitmap;bitmap=null;this._preview=preview;preview=null;this._source=source;this._settings=settings;this._geometry=g;this.inputValid=true;this.blocked=false;this.error=null;
    return {status:'ready'};
   }catch(e){bitmap?.close();if(preview)this.dep.releaseCanvas(preview);if(current()){this.error=e.message;this.blocked=true;return {status:'error',message:e.message};}return {status:'stale'};}
   finally{if(this.loadingGeneration===token)this.loadingGeneration=null;this.changed();}
  });
  return this.loadQueue;
 }
 settings(value){
  this.invalidate();
  try{
   if(!this.actor||!this._source||!this._bitmap||!this.inputValid)throw Error('Reselect a valid source first');
   const settings=normalizeSettings(this._source,value),g=geometry(this._source,settings),preview=this.dep.render(this._bitmap,g,settings);
   if(this._preview)this.dep.releaseCanvas(this._preview);
   this._preview=preview;this._settings=settings;this._geometry=g;this.blocked=false;return this.state;
  }catch(e){this.error=e.message;this.blocked=true;throw e;}finally{this.changed();}
 }
 async prepareExport(){
  if(this.exportInFlight)return {status:'busy'};
  if(this.blocked||!this.actor||!this._preview)return {status:'blocked'};
  if(this._output)return {status:'ready'};
  const token=this.generation,current=()=>this.generation===token&&!!this.actor;
  const source=structuredClone(this._source),settings=structuredClone(this._settings),g=structuredClone(this._geometry),canvas=this._preview;
  this.exportInFlight=true;this.changed();
  try{
   const blob=await this.dep.encode(canvas);if(!current())return {status:'stale'};
   const bytes=new Uint8Array(await blob.arrayBuffer()),header=this.dep.inspect(bytes);
   if(header.format!=='png'||header.width!==settings.width||header.height!==settings.height)throw Error('Encoded PNG dimensions differ');
   const sha256=await this.dep.hash(bytes);if(!current())return {status:'stale'};
   const manifest={format:'qiyiq-frame-export-v1',generatedAt:new Date(this.dep.now()).toISOString(),source,settings,geometry:g,output:{format:'png',width:header.width,height:header.height,sha256,byteLength:bytes.length},limits:'Numeric geometry and byte consistency only; no rights, recovered detail, quality or marketplace approval.'};
   let pngUrl=null,manifestUrl=null;
   try{pngUrl=this.dep.urlCreate(blob);manifestUrl=this.dep.urlCreate(new Blob([JSON.stringify(manifest,null,2)+'\n'],{type:'application/json'}));}
   catch(e){if(pngUrl)this.dep.urlRevoke(pngUrl);if(manifestUrl)this.dep.urlRevoke(manifestUrl);throw e;}
   this._output={pngUrl,manifestUrl,manifest};return {status:'ready'};
  }catch(e){if(current()){this.error=e.message;return {status:'error',message:e.message};}return {status:'stale'};}
  finally{this.exportInFlight=false;this.changed();}
 }
}
