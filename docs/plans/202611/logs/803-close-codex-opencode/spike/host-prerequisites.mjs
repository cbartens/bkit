import { mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const base=join(dirname(fileURLToPath(import.meta.url)), "host-runtime");
mkdirSync(base,{recursive:true});
const env={...process.env,XDG_DATA_HOME:join(base,"data"),XDG_CONFIG_HOME:join(base,"config"),XDG_CACHE_HOME:join(base,"cache"),XDG_STATE_HOME:join(base,"state")};
for(const name of ["opencode","codex"]){
 const r=spawnSync(name,["--version"],{env,encoding:"utf8",timeout:15000});
 console.log(JSON.stringify({program:name,status:r.status,error:r.error?.code,stdout:r.stdout?.trim(),stderr:r.stderr?.trim()}));
}
console.log("S1 BLOCKED: no supported-version matrix or V1 binary supplied; no loaded dedicated probe plugin, shell positive control or repeated-denial session executed. Version discovery is not enforcement proof.");
rmSync(base,{recursive:true,force:true});
