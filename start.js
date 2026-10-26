import {createServer} from './server.js';
const port=Number(process.env.PORT||3000),host='127.0.0.1',username=process.env.ADMIN_USER,password=process.env.ADMIN_PASSWORD;
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('PORT must be1024–65535');
if(!username||!password||password.length<14)throw Error('Set ADMIN_USER and ADMIN_PASSWORD (14+ characters). No default credential.');
const {server,store}=createServer({database:process.env.DATABASE||'.data/qiyiq.sqlite',origin:'http://'+host+':'+port,admin:{username,password}});server.listen(port,host,()=>console.log('QiyiqFrame http://'+host+':'+port));for(const signal of['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>store.close()));
