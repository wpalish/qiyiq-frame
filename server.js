import http from 'node:http';import {readFile} from 'node:fs/promises';
import {randomBytes,createHash,scryptSync,timingSafeEqual} from 'node:crypto';
import {RecipeStore} from './lib/store.js';import {definition} from './module.js';
import {body} from './lib/json.js';import {requireThat,problem,publicError,keys,username,UUID} from './lib/errors.js';
const random=()=>randomBytes(32).toString('hex'),digest=s=>createHash('sha256').update(s).digest('hex');
function passwordHash(password){requireThat(typeof password==='string'&&password.length>=14&&password.length<=200);const salt=random();return salt+':'+scryptSync(password,salt,64).toString('hex');}
function matches(password,hash){if(typeof password!=='string'||password.length>200)return false;const[salt,key]=hash.split(':'),a=scryptSync(password,salt,64),b=Buffer.from(key,'hex');return a.length===b.length&&timingSafeEqual(a,b);}
const cookies=req=>(req.headers.cookie||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith('qf_session=')).map(x=>x.slice(11));
export function createServer({database=':memory:',origin=null,admin,now=()=>Date.now()}={}) {
 const store=new RecipeStore(database,{now}),db=store.db,dummy=passwordHash(random());
 function createUser(input){keys(input,['username','password','role']);const name=username(input.username);requireThat(['admin','operator'].includes(input.role));const hash=passwordHash(input.password);requireThat(!db.prepare('SELECT 1 FROM users WHERE name=?').get(name),409);db.prepare('INSERT INTO users VALUES(?,?,?)').run(name,hash,input.role);return {username:name,role:input.role};}
 if(admin&&!db.prepare('SELECT 1 FROM users LIMIT 1').get())createUser({username:admin.username,password:admin.password,role:'admin'});
 function auth(req,role){const values=cookies(req);requireThat(values.length===1,401);const u=db.prepare('SELECT u.name,u.role,s.csrf FROM sessions s JOIN users u ON u.name=s.username WHERE s.digest=? AND s.expires>?').get(digest(values[0]),now());requireThat(u,401);requireThat(!role||u.role===role,403);if(req.method==='POST')requireThat(req.headers['x-csrf-token']===u.csrf,403);return {...u};}
 const user=u=>({user:{name:u.name,role:u.role,csrf:u.csrf}});
 const methods=new Map([['/health','GET'],['/api/config','GET'],['/api/login','POST'],['/api/session','GET'],['/api/logout','POST'],['/api/state','GET'],['/api/recipes','POST'],['/api/users','GET POST'],['/api/audit','GET'],['/api/backup','GET'],['/api/restore','POST']]);
 const statics=new Map([['/','index.html'],...['app.js','styles.css','controller.js','geometry.js','image-header.js','synthetic.png','fonts/noto-sans.ttf','fonts/OFL.txt'].map(f=>['/'+f,f])]);const rate=new Map();
 const server=http.createServer(async(req,res)=>{
  for(const[k,v]of Object.entries({'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self';base-uri 'none';object-src 'none';frame-ancestors 'none';form-action 'self';script-src 'self';style-src 'self';connect-src 'self';img-src 'self' blob:;font-src 'self'",'Cache-Control':'no-store'}))res.setHeader(k,v);
  const send=(status,data,headers={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(req.method==='HEAD'?'':JSON.stringify(data));};
  try{
   const expected=origin||'http://127.0.0.1:'+server.address().port,base=new URL(expected);requireThat(req.headers.host===base.host,403);requireThat(!req.headers.origin||req.headers.origin===expected,403);if(req.method==='POST')requireThat(req.headers.origin===expected,403);
   const raw=req.url||'/',url=new URL(raw,expected),path=raw.split('?')[0];requireThat(raw.startsWith('/')&&url.origin===expected&&path===url.pathname&&!path.includes('%'),404);requireThat(!url.search,400);
   const ip=req.socket.remoteAddress||'local',r=rate.get(ip)||{at:now(),count:0};if(now()-r.at>=60000){r.at=now();r.count=0;}requireThat(++r.count<=600,429);rate.set(ip,r);if(rate.size>2000)rate.clear();
   const archive=/^\/api\/recipes\/([0-9a-f-]+)\/archive$/.exec(path),isArchive=archive&&UUID.test(archive[1]),allowed=isArchive?'POST':methods.get(path);
   if(allowed){
    requireThat(allowed.split(' ').includes(req.method),405);
    if(path==='/health'){send(200,{status:'ok',product:definition.slug});return;}
    if(path==='/api/config'){send(200,definition);return;}
    if(path==='/api/login'){
     const input=await body(req);keys(input,['username','password']);const name=username(input.username);requireThat(typeof input.password==='string'&&input.password.length<=200);const key=digest(ip+':'+name),f=db.prepare('SELECT * FROM failures WHERE name=?').get(key);requireThat(!f||now()-f.since>=900000||f.count<15,429);
     const u=db.prepare('SELECT * FROM users WHERE name=?').get(name),matched=matches(input.password,u?.password||dummy);
     if(!u||!matched){db.prepare('INSERT INTO failures VALUES(?,1,?) ON CONFLICT(name) DO UPDATE SET count=CASE WHEN excluded.since-failures.since>=900000 THEN 1 ELSE failures.count+1 END,since=CASE WHEN excluded.since-failures.since>=900000 THEN excluded.since ELSE failures.since END').run(key,now());throw problem(401);}
     db.prepare('DELETE FROM failures WHERE name=?').run(key);const token=random(),csrf=random();db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(digest(token),name,csrf,now()+86400000);
     send(200,user({name,role:u.role,csrf}),{'Set-Cookie':`qf_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${base.protocol==='https:'?'; Secure':''}`});return;
    }
    const u=auth(req);
    if(path==='/api/session'){send(200,user(u));return;}
    if(path==='/api/logout'){keys(await body(req),[]);db.prepare('DELETE FROM sessions WHERE digest=?').run(digest(cookies(req)[0]));send(200,{loggedOut:true},{'Set-Cookie':'qf_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});return;}
    if(path==='/api/state'){send(200,store.snapshot());return;}
    if(path==='/api/recipes'){const b=await body(req);keys(b,['revision','requestKey','recipe']);send(200,store.command({...b,action:'create'},u));return;}
    if(isArchive){const b=await body(req);keys(b,['revision','requestKey']);send(200,store.command({...b,id:archive[1],action:'archive'},u));return;}
    auth(req,'admin');
    if(path==='/api/users'){
     if(req.method==='GET'){send(200,{users:db.prepare('SELECT name,role FROM users ORDER BY name').all()});return;}
     const b=await body(req);db.exec('BEGIN IMMEDIATE');try{auth(req,'admin');const created=createUser(b);db.exec('COMMIT');send(201,created);}catch(e){db.exec('ROLLBACK');throw e;}return;
    }
    if(path==='/api/audit'){send(200,{audit:db.prepare('SELECT seq,at,actor,action FROM audit ORDER BY seq DESC LIMIT 200').all()});return;}
    if(path==='/api/backup'){send(200,store.backup(u));return;}
    if(path==='/api/restore'){send(200,store.restore(await body(req),u));return;}
   }
   requireThat(!path.startsWith('/api/'),404);const file=statics.get(path);requireThat(file,404);requireThat(['GET','HEAD'].includes(req.method),405);
   const bytes=await readFile(new URL('./public/'+file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.png')?'image/png':file.endsWith('.ttf')?'font/ttf':file.endsWith('.txt')?'text/plain; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?'':bytes);
  }catch(e){if(!req.readableEnded)req.resume();const status=[400,401,403,404,405,409,413,429].includes(e.status)?e.status:500;send(status,publicError(status));}
 });
 server.requestTimeout=15000;server.headersTimeout=10000;return {server,store};
}
