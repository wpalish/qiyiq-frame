import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRecipe,geometry} from '../public/geometry.js';
const source={format:'png',sha256:'a'.repeat(64),byteLength:100,width:1200,height:800};
const settings={mode:'contain',width:1000,height:1000,matte:'white',crop:null};
const recipe=()=>({title:' SYN_COLOUR ',source:structuredClone(source),settings:structuredClone(settings)});
test('contain rounds odd margins deterministically without clipping source',()=>assert.deepEqual(geometry(source,settings),{source:{x:0,y:0,width:1200,height:800},destination:{x:0,y:166,width:1000,height:667},upscaled:false,distorted:false}));
test('contain handles portrait and one-pixel dimension without a zero-size draw',()=>{
 assert.deepEqual(geometry({...source,width:800,height:1200},settings).destination,{x:166,y:0,width:667,height:1000});
 assert.deepEqual(geometry({...source,width:1,height:16000},{...settings,width:100,height:100}).destination,{x:49,y:0,width:1,height:100});
});
test('crop keeps exact integer rectangle and makes distortion/upscaling explicit',()=>assert.deepEqual(geometry(source,{...settings,mode:'crop',crop:{x:200,y:300,width:500,height:200}}),{source:{x:200,y:300,width:500,height:200},destination:{x:0,y:0,width:1000,height:1000},upscaled:true,distorted:true}));
test('recipe normalizes title but never changes frozen source or settings',()=>{const x=recipe();const before=structuredClone(x);const y=normalizeRecipe(x);assert.equal(y.title,'SYN_COLOUR');assert.deepEqual(x,before);assert.deepEqual(y.source,source);assert.deepEqual(y.settings,settings);});
test('strict keys and actual types reject forged metadata and coercion',()=>{
 for(const change of [x=>x.owner='client',x=>x.source.url='https://example.com',x=>x.source.width='1200',x=>x.source.sha256='A'.repeat(64),x=>x.source.format='svg',x=>x.source.byteLength=8388609,x=>x.source.byteLength=0,x=>x.settings.width='1000',x=>x.settings.mode='cover',x=>x.settings.matte='#fff',x=>x.title=42]){const x=recipe();change(x);assert.throws(()=>normalizeRecipe(x));}
});
test('source pixel and output limits refuse overflow, nonfinite and fractional numbers',()=>{
 for(const dims of [[4001,4000],[16001,1],[0,1],[NaN,2],[1.1,2]])assert.throws(()=>normalizeRecipe({...recipe(),source:{...source,width:dims[0],height:dims[1]}}));
 for(const n of [99,3001,100.5,Infinity,null])assert.throws(()=>normalizeRecipe({...recipe(),settings:{...settings,width:n}}));
 assert.equal(normalizeRecipe({...recipe(),source:{...source,width:4000,height:4000,byteLength:8388608},settings:{...settings,width:3000,height:3000}}).settings.width,3000);
});
test('crop refuses rectangles outside source, fractions and ignored contain coordinates',()=>{
 for(const crop of [{x:-1,y:0,width:1,height:1},{x:1199,y:0,width:2,height:1},{x:0,y:799,width:1,height:2},{x:0,y:0,width:0,height:1},{x:0.5,y:0,width:1,height:1},{x:0,y:0,width:1,height:1,angle:0},null])assert.throws(()=>normalizeRecipe({...recipe(),settings:{...settings,mode:'crop',crop}}));
 assert.throws(()=>normalizeRecipe({...recipe(),settings:{...settings,crop:{x:0,y:0,width:1,height:1}}}));
});
test('UTF16 title limit applies after outer trim and rejects empty actual strings',()=>{
 for(const title of ['', '  ', 'x'.repeat(121),'😀'.repeat(61),null])assert.throws(()=>normalizeRecipe({...recipe(),title}));
 assert.equal(normalizeRecipe({...recipe(),title:' '+ '😀'.repeat(60)+' '}).title.length,120);
});
