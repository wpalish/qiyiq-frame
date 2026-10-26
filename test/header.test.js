import test from 'node:test';import assert from 'node:assert/strict';
import {inspectImage} from '../public/image-header.js';
import {png,pngSignature,ihdr,idat,chunk,jpeg,segment} from './image-fixtures.js';
test('PNG reads dimensions only after complete bounded chunk/CRC validation',()=>assert.deepEqual(inspectImage(png()),{format:'png',width:3,height:2,byteLength:png().length}));
test('PNG rejects actual CRC corruption, truncated framing and trailing bytes',()=>{
 const corrupt=png();corrupt[29]^=1;
 for(const b of [corrupt,png().subarray(0,25),png().subarray(0,-1),Buffer.concat([png(),Buffer.from([0])]),Buffer.concat([pngSignature,ihdr(),chunk('IEND')]),Buffer.concat([pngSignature,ihdr(),idat])])assert.throws(()=>inspectImage(b));
});
test('PNG rejects animation, EXIF and unknown critical chunks even with correct CRC',()=>{
 for(const type of ['acTL','fcTL','fdAT','eXIf','ABCD'])assert.throws(()=>inspectImage(png(chunk(type,Buffer.alloc(8)))));
 assert.equal(inspectImage(png(chunk('tEXt',Buffer.from('own\0synthetic')))).width,3);
});
test('PNG rejects duplicate/out-of-order headers and invalid image methods',()=>{
 for(const parts of [[ihdr(),ihdr(),idat,chunk('IEND')],[chunk('tEXt'),ihdr(),idat,chunk('IEND')],...[ihdr(3,2,3,6),ihdr(3,2,8,5),ihdr(3,2,8,6,1),ihdr(3,2,8,6,0,1),ihdr(3,2,8,6,0,0,2)].map(h=>[h,idat,chunk('IEND')])])assert.throws(()=>inspectImage(Buffer.concat([pngSignature,...parts])));
});
test('PNG refuses declared decompression budget before invoking a decoder',()=>{
 for(const [w,h]of[[0,2],[16001,1],[4001,4000],[0xffffffff,1]])assert.throws(()=>inspectImage(Buffer.concat([pngSignature,ihdr(w,h),idat,chunk('IEND')])));
 assert.equal(inspectImage(Buffer.concat([pngSignature,ihdr(4000,4000),idat,chunk('IEND')])).width,4000);
});
test('JPEG framing accepts baseline/progressive headers and stuffed/restart scan bytes',()=>{
 for(const frame of [0xc0,0xc2])assert.deepEqual(inspectImage(jpeg({frame})),{format:'jpeg',width:3,height:2,byteLength:jpeg({frame}).length});
});
test('JPEG rejects EXIF and MPF instead of silently guessing orientation/frame',()=>{
 for(const e of [segment(0xe1,Buffer.from('Exif\0\0own')),segment(0xe2,Buffer.from('MPF\0own'))])assert.throws(()=>inspectImage(jpeg({extra:[e]})));
 assert.equal(inspectImage(jpeg({extra:[segment(0xe0,Buffer.from('JFIF\0own'))]})).height,2);
});
test('JPEG rejects unsupported frames, length overruns, absent scan and nonfinal EOI',()=>{
 const j=jpeg();const length=j.slice();length[4]=255;length[5]=255;
 for(const b of [jpeg({frame:0xc1}),jpeg({width:16001}),jpeg({width:4001,height:4000}),length,j.subarray(0,-1),Buffer.concat([j,Buffer.from([0])]),Buffer.from([255,216,255,217]),Buffer.concat([Buffer.from([255,216]),j])])assert.throws(()=>inspectImage(b));
});
test('magic and byte limits reject SVG/GIF/WebP, labels cannot override contents',()=>{
 for(const b of [Buffer.alloc(0),Buffer.alloc(8388609),Buffer.from('<svg/>'),Buffer.from('GIF89a'),Buffer.from('RIFFxxxxWEBP'),'png',{},null])assert.throws(()=>inspectImage(b));
});
