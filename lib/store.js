import {DatabaseSync,backup as sqliteBackup} from 'node:sqlite';
import {isDeepStrictEqual} from 'node:util';
import {mkdirSync} from 'node:fs';import {dirname} from 'node:path';
import {objectKeys,integer,normalizeRecipe,geometry} from '../public/geometry.js';
export function check(condition,status=400,message='Invalid request') {if(!condition){const e=new Error(message);e.status=status;throw e;}}
const uuid=value=>check(typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value));
const empty=()=>({recipes:[],keys:[]});
const iso=value=>{check(typeof value==='string'&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value);return value;};
function validateData(data,roleFor,at) {
 objectKeys(data,['recipes','keys'],'backup data');
 check(Array.isArray(data.recipes)&&data.recipes.length<=200&&Array.isArray(data.keys)&&data.keys.length<=1000);
 const ids=new Map(),events=new Map();
 for(const row of data.recipes) {
  objectKeys(row,['id','title','source','settings','geometry','owner','createdAt','archivedAt','archiveKey'],'saved recipe');uuid(row.id);check(!ids.has(row.id));ids.set(row.id,row);
  const normalized=normalizeRecipe({title:row.title,source:row.source,settings:row.settings});
  check(normalized.title===row.title&&isDeepStrictEqual(normalized.source,row.source)&&isDeepStrictEqual(normalized.settings,row.settings)&&isDeepStrictEqual(geometry(row.source,row.settings),row.geometry));
  check(typeof row.owner==='string'&&['admin','operator'].includes(roleFor(row.owner)));iso(row.createdAt);check(row.createdAt<=at);
  if(row.archivedAt===null)check(row.archiveKey===null);
  else {iso(row.archivedAt);uuid(row.archiveKey);check(row.createdAt<=row.archivedAt&&row.archivedAt<=at);}
 }
 let previous='',created=new Set(),archived=new Set();
 for(const event of data.keys) {
  objectKeys(event,['key','at','actor','action'],'event');uuid(event.key);check(!events.has(event.key));events.set(event.key,event);iso(event.at);
  check(event.at>=previous&&event.at<=at&&typeof event.actor==='string'&&['admin','operator'].includes(roleFor(event.actor)));previous=event.at;
  if(event.action==='create') {
   const row=ids.get(event.key);check(row&&row.owner===event.actor&&row.createdAt===event.at&&!created.has(row.id));created.add(row.id);
  } else if(event.action==='archive') {
   const row=data.recipes.find(r=>r.archiveKey===event.key);check(row&&created.has(row.id)&&!archived.has(row.id)&&row.owner===event.actor&&row.archivedAt===event.at);archived.add(row.id);
  } else check(event.action==='restore'&&roleFor(event.actor)==='admin'&&!ids.has(event.key)&&!data.recipes.some(r=>r.archiveKey===event.key));
 }
 for(const row of data.recipes)check(created.has(row.id)&&(row.archivedAt===null?!archived.has(row.id):archived.has(row.id)));
}
export class RecipeStore {
 constructor(path=':memory:',{now=()=>Date.now()}={}) {
  this.now=now;if(path!==':memory:')mkdirSync(dirname(path),{recursive:true,mode:0o700});this.db=new DatabaseSync(path);
  const app=0x51495949,id=this.db.prepare('PRAGMA application_id').get().application_id,version=this.db.prepare('PRAGMA user_version').get().user_version,n=this.db.prepare("SELECT count(*) n FROM sqlite_master WHERE name NOT LIKE 'sqlite_%'").get().n;
  if(!(id===0&&version===0&&n===0)&&!(id===app&&version===1)){this.db.close();check(false);}
  this.db.exec(`PRAGMA busy_timeout=5000;PRAGMA journal_mode=WAL;CREATE TABLE IF NOT EXISTS workspace(id INTEGER PRIMARY KEY CHECK(id=1),revision INTEGER NOT NULL,payload TEXT NOT NULL);CREATE TABLE IF NOT EXISTS audit(seq INTEGER PRIMARY KEY AUTOINCREMENT,requestKey TEXT UNIQUE NOT NULL,at TEXT NOT NULL,actor TEXT NOT NULL,action TEXT NOT NULL);CREATE TABLE IF NOT EXISTS users(name TEXT PRIMARY KEY,password TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('admin','operator')));CREATE TABLE IF NOT EXISTS sessions(digest TEXT PRIMARY KEY,username TEXT NOT NULL,csrf TEXT NOT NULL,expires INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS failures(name TEXT PRIMARY KEY,count INTEGER NOT NULL,since INTEGER NOT NULL);PRAGMA application_id=${app};PRAGMA user_version=1;`);
  this.db.prepare('INSERT OR IGNORE INTO workspace VALUES(1,0,?)').run(JSON.stringify(empty()));
 }
 close(){if(this.db?.isOpen)this.db.close();}
 snapshot(){const r=this.db.prepare('SELECT revision,payload FROM workspace WHERE id=1').get();return {revision:r.revision,data:JSON.parse(r.payload)};}
 roleFor(name){return this.db.prepare('SELECT role FROM users WHERE name=?').get(name)?.role;}
 actor(actor,admin=false){check(actor&&typeof actor.name==='string'&&['admin','operator'].includes(actor.role)&&this.roleFor(actor.name)===actor.role,403);if(admin)check(actor.role==='admin',403);}
 time(){const n=this.now();check(Number.isSafeInteger(n)&&n>=0&&Number.isFinite(new Date(n).getTime()),409,'Invalid server time');return new Date(n).toISOString();}
 transact(actor,change,admin=false){
  this.db.exec('BEGIN IMMEDIATE');
  try {
   this.actor(actor,admin);const current=this.snapshot(),at=this.time(),next=structuredClone(current.data),result=change(next,current,at);
   check(next.keys.length<1000);next.keys.push({key:result.key,at,actor:actor.name,action:result.action});
   this.db.prepare('UPDATE workspace SET revision=?,payload=? WHERE id=1').run(current.revision+1,JSON.stringify(next));
   this.db.prepare('INSERT INTO audit(requestKey,at,actor,action) VALUES(?,?,?,?)').run(result.key,at,actor.name,result.action);
   this.db.exec('COMMIT');return this.snapshot();
  }catch(e){this.db.exec('ROLLBACK');if(!e.status)e.status=400;throw e;}
 }
 fresh(data,key,at){uuid(key);check(!data.keys.some(k=>k.key===key)&&!data.recipes.some(r=>r.id===key||r.archiveKey===key),409,'Command key already used');check(!data.keys.length||at>=data.keys.at(-1).at,409,'Clock moved backwards');}
 command(input,actor){
  check(input&&['create','archive'].includes(input.action));objectKeys(input,input.action==='create'?['action','revision','requestKey','recipe']:['action','revision','requestKey','id'],'command');integer(input.revision,0,Number.MAX_SAFE_INTEGER,'revision');uuid(input.requestKey);
  const recipe=input.action==='create'?normalizeRecipe(input.recipe):null;if(input.action==='archive')uuid(input.id);
  return this.transact(actor,(next,current,at)=>{
   check(input.revision===current.revision,409,'Refresh metadata before saving');this.fresh(next,input.requestKey,at);
   if(input.action==='create') {
    check(next.recipes.length<200,409,'Recipe limit reached');next.recipes.push({id:input.requestKey,...recipe,geometry:geometry(recipe.source,recipe.settings),owner:actor.name,createdAt:at,archivedAt:null,archiveKey:null});
   }else {
    const row=next.recipes.find(r=>r.id===input.id);check(row,404,'Recipe not found');check(row.owner===actor.name,403,'Only creator can archive');check(row.archivedAt===null,409,'Already archived');row.archivedAt=at;row.archiveKey=input.requestKey;
   }
   return {key:input.requestKey,action:input.action};
  });
 }
 backup(actor){this.actor(actor,true);return {format:'qiyiq-frame-v1',data:this.snapshot().data};}
 restore(input,actor){
  objectKeys(input,['backup','revision','requestKey'],'restore');integer(input.revision,0,Number.MAX_SAFE_INTEGER,'revision');uuid(input.requestKey);objectKeys(input.backup,['format','data'],'backup');check(input.backup.format==='qiyiq-frame-v1');
  return this.transact(actor,(next,current,at)=>{
   check(input.revision===current.revision&&next.recipes.length===0&&next.keys.length===0,409,'Restore requires empty workspace');
   const restored=structuredClone(input.backup.data);validateData(restored,n=>this.roleFor(n),at);this.fresh(restored,input.requestKey,at);next.recipes=restored.recipes;next.keys=restored.keys;
   return {key:input.requestKey,action:'restore'};
  },true);
 }
 async backupFile(path){return sqliteBackup(this.db,path);}
}
