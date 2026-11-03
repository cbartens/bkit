import { readFileSync,writeFileSync,renameSync,mkdirSync,openSync,closeSync,unlinkSync,rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join,dirname } from "node:path";
import { fileURLToPath } from "node:url";
const self=fileURLToPath(import.meta.url);
const base=join(dirname(self),"recovery-runtime");
const hash=x=>createHash("sha256").update(x).digest("hex");
const atomic=(path,text)=>{writeFileSync(path+".next",text);renameSync(path+".next",path);};
if(process.argv[2]==="compete"){
 try{const fd=openSync(join(base,"installer.lock"),"wx");closeSync(fd);console.log("unexpected acquired");process.exit(1);}
 catch(e){console.log("competing lock="+e.code);process.exit(e.code==="EEXIST"?0:1);}
}
if(process.argv[2]==="mutate"){
 const state=join(base,"state.json"),settings=join(base,"settings.json");
 const intent={before:hash("before"),after:hash("after"),owned:["synthetic-grant"]};
 atomic(state,JSON.stringify({intent}));
 if(process.argv[3]==="after")atomic(settings,"after");
 process.exit(17);
}
mkdirSync(base,{recursive:true});
try{
 const fd=openSync(join(base,"installer.lock"),"wx");closeSync(fd);
 const c=spawnSync(process.execPath,[self,"compete"],{encoding:"utf8"});
 console.log(JSON.stringify({case:"exclusive-lock",status:c.status,stdout:c.stdout.trim(),stderr:c.stderr.trim()}));
 unlinkSync(join(base,"installer.lock"));
 for(const phase of ["before","after","conflict"]){
  atomic(join(base,"settings.json"),"before");
  const r=spawnSync(process.execPath,[self,"mutate",phase==="after"?"after":"before"],{encoding:"utf8"});
  if(phase==="conflict")atomic(join(base,"settings.json"),"edited");
  const state=JSON.parse(readFileSync(join(base,"state.json"),"utf8"));
  const actual=hash(readFileSync(join(base,"settings.json")));
  const result=actual===state.intent.before?"not-landed":actual===state.intent.after?"landed":"conflict-preserved";
  console.log(JSON.stringify({case:phase,interruptedExit:r.status,recovery:result,intentPresent:!!state.intent,ownedEntries:state.intent.owned.length}));
  if(result!==({before:"not-landed",after:"landed",conflict:"conflict-preserved"})[phase]||r.status!==17)throw Error("primitive contract failed");
 }
 console.log("S3 SETTLED for process-interruption primitives on this local filesystem only; production state writers, stale-lock recovery, unrelated editors and power-loss durability were not tested.");
}finally{rmSync(base,{recursive:true,force:true});}
