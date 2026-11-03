import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const base=join(dirname(fileURLToPath(import.meta.url)),"client-runtime");
mkdirSync(base,{recursive:true});
const seen=[];
const second=createServer((req,res)=>{seen.push("second:"+req.url);res.end("second");});
await new Promise(r=>second.listen(0,"127.0.0.1",r));
const secondPort=second.address().port;
const first=createServer((req,res)=>{seen.push("first:"+req.url);if(req.url==="/redirect"){res.writeHead(302,{location:"http://127.0.0.1:"+secondPort+"/landed"});}res.end("first");});
await new Promise(r=>first.listen(0,"127.0.0.1",r));
const port=first.address().port;
const origin="http://127.0.0.1:"+port;
writeFileSync(join(base,".curlrc"),'url = "'+origin+'/hidden"\n');
const env={...process.env,CURL_HOME:base,NO_PROXY:"127.0.0.1,localhost",no_proxy:"127.0.0.1,localhost"};
async function run(label,args,shell=false){
 seen.length=0;
 const outputs=await new Promise(resolve=>{
  const p=spawn(shell?"/bin/sh":"curl",shell?["-c",args]:["-q","--silent","--show-error","--max-time","2","--globoff",...args],{env});
  let stdout="",stderr="";p.stdout.on("data",x=>stdout+=x);p.stderr.on("data",x=>stderr+=x);
  p.on("error",e=>resolve({error:e.code}));p.on("close",status=>resolve({status,stdout,stderr}));
 });
 console.log(JSON.stringify({case:label,...outputs,requests:[...seen]}));
}
console.log("node="+process.version);
console.log(spawnSync("curl",["--version"],{encoding:"utf8"}).stdout.split("\n")[0]);
console.log(JSON.stringify({nodeAuthority:new URL(origin+"/a;b?x=1&y=2").host}));
await run("ordinary-and-default-config-disabled",[origin+"/ok"]);
await run("quoted-separators","curl -q --silent --show-error --max-time 2 --globoff '"+origin+"/a;b?x=1&y=2'",true);
await run("multiple-targets",[origin+"/one",origin+"/two"]);
await run("redirect-not-followed",[origin+"/redirect"]);
const wget=spawnSync("wget",["--version"],{encoding:"utf8"});
console.log(JSON.stringify({program:"wget",status:wget.status,error:wget.error?.code,stdout:wget.stdout,stderr:wget.stderr}));
console.log("S2 BLOCKED: curl controls above observed locally; GNU Wget is unavailable and no completed bounded bkit lexer/profile exists to compare. No agreement is claimed for untested authorities or options.");
await Promise.all([new Promise(r=>first.close(r)),new Promise(r=>second.close(r))]);
rmSync(base,{recursive:true,force:true});
