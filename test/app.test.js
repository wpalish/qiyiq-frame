import test from 'node:test';import assert from 'node:assert/strict';import {createHash}from'node:crypto';import{deflateSync}from'node:zlib';
import{png,pngSignature,ihdr,chunk}from'./image-fixtures.js';
const tick=()=>new Promise(r=>setImmediate(r));const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
const sha=b=>createHash('sha256').update(b).digest('hex');
const original=png(),newer=png(chunk('tEXt',Buffer.from('own\0newer'))),file=b=>new File([b],'SYN.png',{type:'image/png'});
const bitmap=()=>({width:3,height:2,close(){}});
const output=(w,h)=>Buffer.concat([pngSignature,ihdr(w,h),chunk('IDAT',deflateSync(Buffer.alloc((w*4+1)*h))),chunk('IEND')]);
// Only browser primitives are doubled: real app, ImageSession, parser and geometry run.
// Assertions use user-visible fields/captions/download availability, never a hidden model hook.
class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.attributes={};this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.checked=false;this.files=[];this.validity={valid:true};this.dataset={};this.classList={toggle(){}};}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
 async fire(type){for(const fn of this.listeners[type]||[])await fn({preventDefault(){},submitter:this});}
 replaceChildren(...items){this.children=items;}append(...items){this.children.push(...items);}get firstChild(){return this.children[0];}
 setAttribute(k,v){this.attributes[k]=String(v);}removeAttribute(k){delete this.attributes[k];if(k==='href')delete this.href;}
 querySelectorAll(){return [];}focus(){}click(){return this.fire('click');}
 getContext(){return{drawImage(){},fillRect(){}};}
 toBlob(fn){fn(Element.encodingFailed?null:new Blob([output(this.width,this.height)],{type:'image/png'}));}
}
async function app(t,{decode=async()=>bitmap(),demo=async()=>new Response(original),recipes=[]}={}){
 Element.encodingFailed=false;
 const old={};for(const k of['document','window','fetch','createImageBitmap'])old[k]=globalThis[k];
 const elements=new Map(),el=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
 for(const [id,value]of Object.entries({width:'1000',height:'1000',mode:'contain',matte:'white','crop-x':'0','crop-y':'0','crop-width':'1','crop-height':'1'}))el(id).value=value;
 el('geometry-form').querySelectorAll=()=>['width','height','crop-x','crop-y','crop-width','crop-height'].map(el);
 const user={name:'alpha',role:'operator',csrf:'synthetic-csrf'};
 globalThis.document={getElementById:el,querySelectorAll:()=>[],createElement:tag=>new Element(tag),documentElement:{lang:'ru'},addEventListener(){},hidden:false};
 globalThis.window={addEventListener(){}};globalThis.createImageBitmap=decode;
 globalThis.fetch=async path=>path==='/synthetic.png'?demo():Response.json(path==='/api/session'?{user}:path==='/api/state'?{revision:0,data:{recipes,keys:[]}}:{});
 t.after(()=>{for(const[k,v]of Object.entries(old))globalThis[k]=v;});
 await import('../public/app.js?case='+crypto.randomUUID());
 await until(()=>el('revision').textContent==='Ревизия 0');
 const choose=async bytes=>{el('image-file').files=[file(bytes)];await el('image-file').fire('change');};
 return{el,choose};
}
// WebCrypto runs outside the JS turn. A fixed setImmediate iteration budget can
// expire in milliseconds on CI before its worker completes; observe the same
// actual UI condition with a bounded elapsed-time deadline instead.
async function until(condition){const deadline=performance.now()+2000;while(performance.now()<deadline){if(condition())return;await new Promise(resolve=>setTimeout(resolve,10));}assert.fail('UI condition did not settle within 2000ms');}
const saved={id:'11111111-1111-4111-8111-111111111111',title:'SYN_SAVED_CROP',owner:'alpha',createdAt:'2026-10-26T00:00:00.000Z',archivedAt:null,source:{format:'png',sha256:sha(original),byteLength:original.length,width:3,height:2},settings:{mode:'crop',width:123,height:124,matte:'transparent',crop:{x:1,y:0,width:2,height:2}}};

// Break caught: a demo fetch claims its generation too late and overwrites a newer file.
test('demo intent immediately removes downloads and held response cannot replace newer local file',async t=>{
 const held=deferred();const{el,choose}=await app(t,{demo:()=>held.promise});await choose(original);await until(()=>el('source-hash').textContent.includes(sha(original)));await el('prepare').fire('click');assert.ok(el('download-png').href);
 const pending=el('demo').fire('click');const removed=el('downloads').hidden&&!el('download-png').href&&el('prepare').disabled;
 await choose(newer);await until(()=>el('source-hash').textContent.includes(sha(newer)));el('width').value='111';await el('geometry-form').fire('input');await el('prepare').fire('click');const ready=el('download-png').href;
 held.resolve(new Response(original));await pending;await tick();
 assert.equal(removed,true,'a new image intent must immediately revoke old output');assert.ok(el('source-hash').textContent.includes(sha(newer)));assert.equal(el('width').value,'111');assert.equal(el('download-png').href,ready);
});
test('settings and later recipe selection cancel a held demo without loading its bytes',async t=>{
 const held=deferred();const{el,choose}=await app(t,{demo:()=>held.promise,recipes:[saved]});await choose(newer);await until(()=>el('source-hash').textContent.includes(sha(newer)));
 const pending=el('demo').fire('click');el('width').value='115';await el('geometry-form').fire('input');
 held.resolve(new Response(original));await pending;await tick();assert.ok(el('source-hash').textContent.includes(sha(newer)));assert.equal(el('width').value,'115');
 const held2=deferred();const currentFetch=globalThis.fetch;globalThis.fetch=path=>path==='/synthetic.png'?held2.promise:currentFetch(path);
 const pending2=el('demo').fire('click');await el('recipe-list').children[0].children[1].children[0].fire('click');held2.resolve(new Response(original));await pending2;await tick();assert.equal(el('pending-recipe').hidden,false);assert.ok(el('source-hash').textContent.includes(sha(newer)));assert.equal(el('prepare').disabled,true);
});
// Break caught: a metadata epoch change discards reconciliation of an accepted current file.
test('same-account metadata refresh during decode reconciles accepted default geometry into controls',async t=>{
 const held=deferred();let started=false;const{el,choose}=await app(t,{decode:()=>{started=true;return held.promise;}});el('width').value='777';await choose(original);await until(()=>started);await el('refresh').fire('click');held.resolve(bitmap());await until(()=>el('source-hash').textContent.includes(sha(original)));await tick();
 assert.equal(String(el('width').value),'1000');assert.equal(String(el('height').value),'1000');assert.match(el('result-measure').textContent,/1000×1000/);assert.equal(el('prepare').disabled,false);
});
test('refresh during saved-file decode completes exact recipe controls title and pending selection',async t=>{
 const held=deferred();let started=false;const{el,choose}=await app(t,{decode:()=>{started=true;return held.promise;},recipes:[saved]});
 el('width').value='777';await el('recipe-list').children[0].children[1].children[0].fire('click');await choose(original);await until(()=>started);await el('refresh').fire('click');held.resolve(bitmap());await until(()=>el('source-hash').textContent.includes(sha(original)));await tick();
 assert.equal(String(el('width').value),'123');assert.equal(String(el('height').value),'124');assert.equal(el('mode').value,'crop');assert.equal(String(el('crop-x').value),'1');assert.equal(el('recipe-title').value,'SYN_SAVED_CROP');assert.equal(el('pending-recipe').hidden,true);assert.equal(el('cancel-reopen').hidden,true);assert.equal(el('prepare').disabled,false);
});
test('logout suppresses a held image completion including controls title and source',async t=>{
 const held=deferred();let started=false;const{el,choose}=await app(t,{decode:()=>{started=true;return held.promise;},recipes:[saved]});await el('recipe-list').children[0].children[1].children[0].fire('click');await choose(original);await until(()=>started);await el('logout').fire('click');held.resolve(bitmap());await tick();await tick();
 assert.equal(el('source-hash').textContent,'');assert.equal(el('recipe-title').value,'');assert.equal(el('workspace').hidden,true);assert.equal(el('pending-recipe').hidden,true);assert.equal(el('prepare').disabled,true);
});
// UI F1: a rejected first file cannot claim an unavailable previous result exists.
test('rejection distinguishes empty first selection from an actually retained replacement preview',async t=>{
 const{el,choose}=await app(t,{recipes:[saved]});await el('recipe-list').children[0].children[1].children[0].fire('click');await choose(newer);await until(()=>el('message').textContent.includes('Файл не принят'));
 assert.doesNotMatch(el('message').textContent,/Последний корректный результат сохранён/);assert.equal(el('source-hash').textContent,'');assert.equal(el('prepare').disabled,true);assert.ok(el('export-state').textContent.includes(sha(original)));
 await choose(original);await until(()=>el('source-hash').textContent.includes(sha(original)));await choose(Buffer.from('<svg/>'));await until(()=>el('message').textContent.includes('сохранён'));
 assert.ok(el('source-hash').textContent.includes(sha(original)));assert.match(el('message').textContent,/сохранён/);assert.equal(el('prepare').disabled,true);
});
// UI F2: source-dependent limits must be actionable even though native min/max accept X.
test('crop error identifies X and its source bound in RU and KK with an associated invalid field',async t=>{
 const{el,choose}=await app(t);await choose(original);await until(()=>el('source-hash').textContent.includes(sha(original)));
 for(const language of['ru','kk']){el('language').value=language;await el('language').fire('change');el('mode').value='crop';el('crop-x').value='3';el('crop-y').value='0';el('crop-width').value='1';el('crop-height').value='1';await el('geometry-form').fire('input');
  const message=el('export-state').textContent;assert.match(message,/X/);assert.match(message,/0–2/);assert.doesNotMatch(message,/Invalid|Reselect|Crop exceeds/);assert.equal(el('crop-x').attributes['aria-invalid'],'true');assert.equal(el('crop-x').attributes['aria-describedby'],'export-state');assert.equal(el('prepare').disabled,true);
 }
 el('crop-x').value='2';await el('geometry-form').fire('input');assert.equal(el('crop-x').attributes['aria-invalid'],undefined);assert.equal(el('prepare').disabled,false);
});
test('unsupported file recovery is localized in both UI languages without parser implementation text',async t=>{
 const{el,choose}=await app(t);for(const language of['ru','kk']){el('language').value=language;await el('language').fire('change');await choose(Buffer.from('<svg/>'));await until(()=>!el('export-state').textContent.includes('декод'));
  const message=el('export-state').textContent;assert.match(message,/PNG\/JPEG/);assert.doesNotMatch(message,/Only single-frame|supported|Input must|File must/);assert.match(message,language==='ru'?/Выберите/:/таңдаңыз/);
 }
});
test('encoding failure uses localized export recovery instead of raw encoder text',async t=>{
 const{el,choose}=await app(t);await choose(original);await until(()=>el('source-hash').textContent.includes(sha(original)));el('language').value='kk';await el('language').fire('change');Element.encodingFailed=true;await el('prepare').fire('click');
 assert.doesNotMatch(el('message').textContent,/encoding failed/);assert.match(el('message').textContent,/PNG/);assert.match(el('message').textContent,/қайта/);assert.equal(el('download-png').href,undefined);
});
// UI F3: clearing identity must clear visible geometry, but metadata refresh must not.
test('identity reset restores visible geometry defaults while same-account refresh preserves live values',async t=>{
 const{el,choose}=await app(t);await choose(original);await until(()=>el('source-hash').textContent.includes(sha(original)));el('mode').value='crop';el('width').value='111';el('height').value='112';el('matte').value='transparent';el('crop-x').value='1';el('crop-y').value='0';el('crop-width').value='2';el('crop-height').value='2';await el('geometry-form').fire('input');await el('refresh').fire('click');assert.equal(el('width').value,'111');assert.equal(el('mode').value,'crop');
 await el('logout').fire('click');for(const[id,want]of Object.entries({width:'1000',height:'1000',mode:'contain',matte:'white','crop-x':'0','crop-y':'0','crop-width':'1','crop-height':'1'}))assert.equal(String(el(id).value),want,id);assert.equal(el('crop-fields').hidden,true);assert.equal(el('prepare').disabled,true);assert.equal(el('source-hash').textContent,'');
});
