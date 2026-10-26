const bad=message=>{throw new Error(message);};
const u16=(b,p)=>(b[p]<<8)|b[p+1];
const u32=(b,p)=>(b[p]*0x1000000)+(b[p+1]<<16)+(b[p+2]<<8)+b[p+3];
const ascii=(b,p,n)=>String.fromCharCode(...b.subarray(p,p+n));
function dimensions(width,height) {
 if(!width||!height||width>16000||height>16000||width*height>16000000)bad('Source exceeds dimension/pixel limit');
 return {width,height};
}
function crc32(bytes,start,end) {
 let c=0xffffffff;
 for(let p=start;p<end;p++){c^=bytes[p];for(let i=0;i<8;i++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;}
 return (c^0xffffffff)>>>0;
}
function pngHeader(b) {
 if(b.length<45||ascii(b,1,3)!=='PNG'||b[4]!==13||b[5]!==10||b[6]!==26||b[7]!==10)bad('Invalid PNG signature');
 let p=8,count=0,size,color,depth,palette=false,data=false,dataEnded=false,ended=false,transparency=false;
 while(p<b.length) {
  if(++count>10000||p+12>b.length)bad('PNG chunk limit or truncation');
  const len=u32(b,p),type=ascii(b,p+4,4),start=p+8,end=start+len;
  if(!/^[A-Za-z]{2}[A-Z][A-Za-z]$/.test(type)||end+4>b.length)bad('Invalid PNG chunk framing');
  if(crc32(b,p+4,end)!==u32(b,end))bad('PNG CRC mismatch');
  if(count===1&&type!=='IHDR')bad('PNG header must be first');
  if(['acTL','fcTL','fdAT','eXIf'].includes(type))bad('Animated/EXIF PNG is unsupported; flatten first');
  if(type==='IHDR') {
   if(size||len!==13)bad('Invalid or duplicate PNG header');
   size=dimensions(u32(b,start),u32(b,start+4));depth=b[start+8];color=b[start+9];
   const allowed={0:[1,2,4,8,16],2:[8,16],3:[1,2,4,8],4:[8,16],6:[8,16]};
   if(!allowed[color]?.includes(depth)||b[start+10]!==0||b[start+11]!==0||b[start+12]>1)bad('Unsupported PNG method');
  } else if(type==='PLTE') {
   if(palette||data||[0,4].includes(color)||len<3||len>768||len%3||color===3&&len/3>2**depth)bad('Invalid PNG palette');
   palette=true;
  } else if(type==='tRNS') {
   if(transparency||data||!([0,2,3].includes(color))||color===0&&len!==2||color===2&&len!==6||color===3&&(!palette||len<1||len>256))bad('Invalid PNG transparency');
   transparency=true;
  } else if(type==='IDAT') {
   if(dataEnded||color===3&&!palette)bad('Invalid PNG data order');
   data=true;
  } else if(type==='IEND') {
   if(!data||len!==0||end+4!==b.length)bad('Missing PNG data or nonfinal end');
   ended=true;
  } else if(type[0]===type[0].toUpperCase())bad('Unknown critical PNG chunk');
  if(data&&type!=='IDAT')dataEnded=true;
  p=end+4;
  if(ended)break;
 }
 if(!size||!ended)bad('Incomplete PNG');
 return {format:'png',...size,byteLength:b.length};
}
function jpegHeader(b) {
 let p=2,size,scans=0,markers=0,entropy=false;
 while(p<b.length) {
  if(++markers>10000||b[p++]!==255)bad('Invalid JPEG marker');
  while(p<b.length&&b[p]===255)p++;
  if(p>=b.length)bad('Truncated JPEG marker');
  const marker=b[p++];
  if(marker===0xd9) {
   if(!size||!scans||!entropy||p!==b.length)bad('Incomplete or nonfinal JPEG');
   return {format:'jpeg',...size,byteLength:b.length};
  }
  if(marker===0xd8||marker===0||marker>=0xd0&&marker<=0xd7||marker===1||marker===0xdc||marker===0xde||marker===0xdf)bad('Unsupported JPEG marker');
  if(p+2>b.length)bad('Truncated JPEG segment');
  const len=u16(b,p),start=p+2,end=p+len;
  if(len<2||end>b.length)bad('JPEG segment exceeds input');
  if(marker===0xe1&&len>=8&&ascii(b,start,6)==='Exif\0\0')bad('JPEG EXIF unsupported; flatten orientation first');
  if(marker===0xe2&&len>=6&&ascii(b,start,4)==='MPF\0')bad('Multiple JPEG pictures unsupported');
  if(marker>=0xc0&&marker<=0xcf&&![0xc4,0xc8,0xcc].includes(marker)) {
   if(![0xc0,0xc2].includes(marker)||size||len<11||b[start]!==8)bad('Unsupported or duplicate JPEG frame');
   const components=b[start+5];
   if(![1,3].includes(components)||len!==8+components*3)bad('Unsupported JPEG components');
   size=dimensions(u16(b,start+3),u16(b,start+1));
  }
  if(marker===0xda) {
   const components=b[start];
   if(!size||![1,2,3].includes(components)||len!==6+2*components)bad('Invalid JPEG scan');
   scans++;p=end;
   while(p<b.length) {
    if(b[p]!==255){entropy=true;p++;continue;}
    const markStart=p;while(p<b.length&&b[p]===255)p++;
    if(p>=b.length)bad('Truncated JPEG entropy marker');
    if(b[p]===0){entropy=true;p++;continue;}
    if(b[p]>=0xd0&&b[p]<=0xd7){p++;continue;}
    p=markStart;break;
   }
  } else p=end;
 }
 bad('JPEG end missing');
}
// This checks bounded framing and metadata, not complete compressed image validity.
// Browser decode and exact decoded/header dimension agreement remain mandatory.
export function inspectImage(bytes) {
 if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length>8388608)bad('Input must be1–8388608 bytes');
 if(bytes[0]===137)return pngHeader(bytes);
 if(bytes[0]===255&&bytes[1]===216)return jpegHeader(bytes);
 bad('Only single-frame PNG/JPEG are supported');
}
