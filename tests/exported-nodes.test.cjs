'use strict';
// Offline: execute only named pure regression nodes, never their n8n graphs.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const variant=process.argv[2]||'draft';if(!['draft','published'].includes(variant))throw Error('Variant must be draft or published');
const selected={
 A:['Run Phase 3 checks'],
 B:['Run 50 fictional checks','Verify real preview safeguards'],
 C:['Run 50 fixture and recovery checks'],
 D:['Run signature and command checks','Test private read replies','Test analysis dispatch and ownership'],
 E:['Run Phase 3 recovery checks','Run shared recovery checks','Run portfolio regression checks','Run baseline regression checks']
};
const records=[];
(async()=>{
for(const [letter,names] of Object.entries(selected)){
 const wf=JSON.parse(fs.readFileSync(path.join(root,'workflows',variant,letter+'.json')));
 for(const name of names){
  const node=wf.nodes.find(n=>n.name===name);
  if(!node)throw Error('Missing regression node: '+letter+'/'+name);
  const context=vm.createContext({Buffer,console,Date,require:n=>{if(n==='crypto')return require('node:crypto');throw Error('Offline runner forbids module '+n);},$execution:{mode:'test',id:'9000'},$input:{first:()=>({json:{}}),all:()=>[{json:{}}]},$:n=>{throw Error('Unexpected external node reference '+n);}});
  try{
   const output=await new vm.Script('(async function(){'+node.parameters.jsCode+'\n})()').runInContext(context,{timeout:30000});
   records.push({workflow:letter,node:name,status:'completed',output});
  }catch(e){records.push({workflow:letter,node:name,status:'failed',error:e.message});}
 }
}
fs.mkdirSync(path.join(root,'evidence'),{recursive:true});
fs.writeFileSync(path.join(root,'evidence/exported-node-tests-'+variant+'.json'),JSON.stringify({kind:'Offline fictional regression; no n8n execution or external requests',variant,ran_at:new Date().toISOString(),records},null,2)+'\n');
for(const r of records){const o=r.output?.[0]?.json;console.log(r.workflow,r.node,r.status,JSON.stringify(o?Object.fromEntries(Object.entries(o).filter(([k])=>!['results','tests','checks','fixtures','positions','history','log'].includes(k))):r.error));}
if(records.some(r=>r.status==='failed'||r.output?.some(i=>i.json?.failed>0||i.json?.passed===false||i.json?.ok===false)))process.exitCode=1;
})();
