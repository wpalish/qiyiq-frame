const fail=message=>{const e=new Error(message);e.status=400;throw e;};
export function objectKeys(value,allowed,name='object') {
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)fail('Invalid '+name);
 const actual=Object.keys(value);
 if(actual.length!==allowed.length||actual.some(k=>!allowed.includes(k)))fail('Unexpected or missing '+name+' fields');
}
export function integer(value,min,max,name) {
 if(!Number.isSafeInteger(value)||value<min||value>max)fail('Invalid '+name);
 return value;
}
export function normalizeSource(value) {
 objectKeys(value,['format','sha256','byteLength','width','height'],'source');
 if(!['png','jpeg'].includes(value.format)||typeof value.sha256!=='string'||!/^[a-f0-9]{64}$/.test(value.sha256))fail('Invalid source format/fingerprint');
 integer(value.byteLength,1,8388608,'source bytes');
 integer(value.width,1,16000,'source width');integer(value.height,1,16000,'source height');
 if(value.width*value.height>16000000)fail('Source exceeds16MP');
 return {...value};
}
export function normalizeSettings(source,value) {
 objectKeys(value,['mode','width','height','matte','crop'],'settings');
 if(!['contain','crop'].includes(value.mode)||!['transparent','white'].includes(value.matte))fail('Invalid mode or matte');
 integer(value.width,100,3000,'output width');integer(value.height,100,3000,'output height');
 let crop=null;
 if(value.mode==='contain') {if(value.crop!==null)fail('Contain has no crop');}
 else {
  objectKeys(value.crop,['x','y','width','height'],'crop');
  const r=value.crop;integer(r.x,0,source.width-1,'crop x');integer(r.y,0,source.height-1,'crop y');
  integer(r.width,1,source.width,'crop width');integer(r.height,1,source.height,'crop height');
  if(r.x+r.width>source.width||r.y+r.height>source.height)fail('Crop exceeds source');
  crop={...r};
 }
 return {...value,crop};
}
export function normalizeRecipe(value) {
 objectKeys(value,['title','source','settings'],'recipe');
 if(typeof value.title!=='string'||!value.title.trim()||value.title.trim().length>120)fail('Title must contain1–120UTF16 units');
 const source=normalizeSource(value.source),settings=normalizeSettings(source,value.settings);
 return {title:value.title.trim(),source,settings};
}
export function geometry(source,value) {
 source=normalizeSource(source);const settings=normalizeSettings(source,value);
 const src=settings.mode==='crop'?settings.crop:{x:0,y:0,width:source.width,height:source.height};
 let width=settings.width,height=settings.height;
 if(settings.mode==='contain') {
  const scale=Math.min(settings.width/src.width,settings.height/src.height);
  width=Math.max(1,Math.min(settings.width,Math.round(src.width*scale)));
  height=Math.max(1,Math.min(settings.height,Math.round(src.height*scale)));
 }
 return {source:{...src},destination:{x:Math.floor((settings.width-width)/2),y:Math.floor((settings.height-height)/2),width,height},upscaled:width>src.width||height>src.height,distorted:settings.mode==='crop'&&settings.width*src.height!==settings.height*src.width};
}
