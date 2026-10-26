import {deflateSync} from 'node:zlib';
// Own synthetic encoder, independent of production parser; no external image assets.
function crc(data) {let c=0xffffffff;for(const b of data){c^=b;for(let n=0;n<8;n++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;}return (c^0xffffffff)>>>0;}
export function chunk(name,data=Buffer.alloc(0)) {const type=Buffer.from(name),len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([type,data])));return Buffer.concat([len,type,data,sum]);}
export const pngSignature=Buffer.from([137,80,78,71,13,10,26,10]);
export function ihdr(width=3,height=2,depth=8,color=6,compression=0,filter=0,interlace=0) {const b=Buffer.alloc(13);b.writeUInt32BE(width);b.writeUInt32BE(height,4);b.set([depth,color,compression,filter,interlace],8);return chunk('IHDR',b);}
export const idat=chunk('IDAT',deflateSync(Buffer.from([0,255,0,0,255,0,255,0,255,0,0,255,255,0,255,255,255,255,0,0,0,0,255,255,0,255])));
export const png=(...extra)=>Buffer.concat([pngSignature,ihdr(),...extra,idat,chunk('IEND')]);
export function segment(marker,data) {const len=Buffer.alloc(2);len.writeUInt16BE(data.length+2);return Buffer.concat([Buffer.from([255,marker]),len,data]);}
// Framing fixture only. A browser decode must separately reject invalid entropy data.
export function jpeg({frame=0xc0,width=3,height=2,extra=[]}={}) {const sof=Buffer.from([8,height>>8,height&255,width>>8,width&255,3,1,0x11,0,2,0x11,0,3,0x11,0]);return Buffer.concat([Buffer.from([255,216]),...extra,segment(frame,sof),segment(0xda,Buffer.from([3,1,0,2,0,3,0,0,63,0])),Buffer.from([0x12,0xff,0,0x34,0xff,0xd0,0x56,255,217])]);}
