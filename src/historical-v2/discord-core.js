const MP=require('./multi-portfolio');
'use strict';
const crypto=require('crypto');
const {sha,canon,clone,tableRows,toRow,fold}=require('./state-reader');
const SNOW=/^[1-9][0-9]{16,19}$/;
const TICKER=/^[A-Z][A-Z0-9]{0,5}(?:[.-][A-Z0-9]{1,2})?$/;
function ephemeral(content){return {content,allowed_mentions:{parse:[]},flags:64};}
function denial(status,code){return {route:0,status:code,http_status:status,ack:status===200?{type:4,data:ephemeral('Request rejected: '+code+'.')}:{error:code},sent:false,suppressed:true};}
function verifySignature(raw,headers,keyHex,nowMs){
 if(!Buffer.isBuffer(raw)||raw.length===0||raw.length>65536)return {ok:false,code:'INVALID_RAW_BODY'};
 const h=Object.fromEntries(Object.entries(headers||{}).map(([k,v])=>[k.toLowerCase(),v]));
 const sig=h['x-signature-ed25519'],timestamp=h['x-signature-timestamp'];
 if(typeof sig!=='string'||!/^[0-9a-fA-F]{128}$/.test(sig)||typeof timestamp!=='string'||!/^\d{10}$/.test(timestamp))return {ok:false,code:'INVALID_SIGNATURE_HEADERS'};
 if(typeof keyHex!=='string'||!/^[0-9a-fA-F]{64}$/.test(keyHex))return {ok:false,code:'PUBLIC_KEY_NOT_CONFIGURED'};
 if(Math.abs(nowMs-Number(timestamp)*1000)>300000)return {ok:false,code:'STALE_SIGNATURE_TIMESTAMP'};
 try{
  const key=crypto.createPublicKey({key:Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),Buffer.from(keyHex,'hex')]),format:'der',type:'spki'});
  if(!crypto.verify(null,Buffer.concat([Buffer.from(timestamp),raw]),key,Buffer.from(sig,'hex')))return {ok:false,code:'INVALID_SIGNATURE'};
  return {ok:true};
 }catch(e){return {ok:false,code:'SIGNATURE_VERIFICATION_FAILED'};}
}
function authorize(raw,headers,config,nowMs){
 const v=verifySignature(raw,headers,config.public_key,nowMs);if(!v.ok)return denial(401,v.code);
 let b;try{b=JSON.parse(raw.toString('utf8'));}catch(e){return denial(400,'INVALID_JSON');}
 if(!b||Array.isArray(b)||b.application_id!==config.application_id||!SNOW.test(b.application_id))return denial(403,'APPLICATION_NOT_ALLOWED');
 if(b.type===1)return {route:0,status:'PING',http_status:200,ack:{type:1},sent:false,suppressed:true};
 if(b.type!==2||b.data?.type!==1)return denial(200,'UNSUPPORTED_INTERACTION');
 if(typeof b.id!=='string'||!SNOW.test(b.id)||!SNOW.test(b.guild_id)||!config.guild_ids.includes(b.guild_id))return denial(200,'GUILD_NOT_ALLOWED');
 const uid=b.member?.user?.id,roles=b.member?.roles;
 if(!SNOW.test(uid)||b.member?.user?.bot===true||!Array.isArray(roles)||!roles.every(r=>typeof r==='string'&&SNOW.test(r)))return denial(200,'MEMBER_NOT_ALLOWED');
 const reader=config.reader_user_ids.includes(uid)||config.reader_role_ids.some(r=>roles.includes(r));
 const analyzer=config.analyzer_user_ids.includes(uid)||config.analyzer_role_ids.some(r=>roles.includes(r));
 const name=b.data.name;
 if(!['positions','history','analyze'].includes(name))return denial(200,'UNKNOWN_COMMAND');
 if(!(name==='analyze'?analyzer:reader))return denial(200,'FORBIDDEN');
 const spec=name==='history'?{ticker:3,source:3,page:4}:name==='positions'?{source:3,page:4}:{source:3,reprocess:5};
 const opts=b.data.options??[];if(!Array.isArray(opts)||opts.length>3)return denial(200,'INVALID_OPTIONS');
 const args={};for(const o of opts){
  if(!o||!Object.hasOwn(spec,o.name)||Object.hasOwn(args,o.name)||o.type!==spec[o.name]||Object.keys(o).some(k=>!['name','type','value'].includes(k)))return denial(200,'INVALID_OPTIONS');
  if(o.type===3&&(typeof o.value!=='string'||o.value.length>40)||o.type===4&&(!Number.isInteger(o.value)||o.value<1||o.value>100)||o.type===5&&typeof o.value!=='boolean')return denial(200,'INVALID_OPTIONS');
  args[o.name]=o.value;
 }
 if(name==='history'){
  if(typeof args.ticker!=='string')return denial(200,'TICKER_REQUIRED');
  args.ticker=args.ticker.trim().toUpperCase();if(!TICKER.test(args.ticker))return denial(200,'INVALID_TICKER');
 }
 if(args.source!==undefined&&!/^[a-z][a-z0-9_]{0,39}$/.test(args.source))return denial(200,'INVALID_SOURCE');
 if(name!=='analyze')args.page=args.page||1;else args.reprocess=args.reprocess??false;
 const command={interaction_id:b.id,application_id:b.application_id,guild_id:b.guild_id,user_id:uid,name,args};
 return {route:1,status:'AUTHORIZED',http_status:200,ack:{type:5,data:{flags:64}},command,request_hash:sha(canon(command)),sent:false,suppressed:true};
}
function snapshotOf(response,headers){
 if(response?.error||response?.statusCode&&response.statusCode!==200)throw new Error('SHEETS_UNAVAILABLE');
 const body=response.body??response;
 if(!Array.isArray(body.valueRanges)||body.valueRanges.length!==4)throw new Error('SNAPSHOT_INCOMPLETE');
 const db={};Object.keys(headers).forEach((name,i)=>{db[name]=body.valueRanges[i].values||[];tableRows(db,name,headers);});return db;
}
function safeSnapshot(db,headers,now){
 const sources=tableRows(db,'Sources',headers),history=tableRows(db,'Trade History',headers),positions=tableRows(db,'Current Positions',headers),logs=tableRows(db,'Processing Log',headers);
 const unique=(rows,key)=>new Set(rows.map(x=>x[key])).size===rows.length;
 if(new Set(sources.map(s=>MP.dataset(s)+'|'+s.source_id)).size!==sources.length||!unique(positions,'position_key')||!unique(logs,'record_id'))throw new Error('DUPLICATE_DATABASE_ID');
 if(history.some(e=>!TICKER.test(e.ticker)||!['OPEN','ADD','REDUCE','CLOSE'].includes(e.action)||!Number.isFinite(Date.parse(e.effective_at))))throw new Error('INVALID_HISTORY');
 const states=fold(history,now,logs,sources);
 if(positions.length!==Object.keys(states).length)throw new Error('POSITION_PROJECTION_INCOMPLETE');
 for(const p of positions){const expected=states[p.position_key];if(!expected||headers['Current Positions'].filter(k=>k!=='rebuilt_at').some(k=>canon(p[k]??'')!==canon(expected[k]??'')))throw new Error('POSITION_PROJECTION_CONFLICT');}
 if(history.some(e=>!sources.some(s=>s.source_id===e.source_id&&MP.dataset(s)===MP.dataset(e))))throw new Error('UNKNOWN_HISTORY_SOURCE');
 return {sources,history,positions,logs};
}
function output(status,content,extra={}){return {route:0,status,preview:ephemeral(content),sent:false,suppressed:true,...extra};}
function paginate(title,lines,page){
 const size=8,pages=Math.max(1,Math.ceil(lines.length/size));
 if(page>pages)return output('PAGE_OUT_OF_RANGE','Page '+page+' is out of range. Available pages: 1–'+pages+'.');
 const content=title+'\n'+(lines.length?lines.slice((page-1)*size,page*size).join('\n'):'No matching records.')+'\nPage '+page+'/'+pages+' · '+lines.length+' total.\nFictional demo. Author-reported updates; holdings are not independently verified.';
 if(content.length>2000)throw new Error('DISCORD_CONTENT_LIMIT');return output('READY',content,{total:lines.length,page,pages});
}
function resolveCommand(auth,db,ctx,config,headers,catalog){
 if(auth.route!==1||!auth.command||config.fixture_mode!==true||config.suppress_responses!==true)return output('BLOCKED','Command processing is disabled.');
 const {sources,history,positions,logs}=safeSnapshot(db,headers,ctx.now),c=auth.command,args=c.args;
 if(args.source&&!sources.some(s=>s.source_id===args.source))return output('UNKNOWN_SOURCE','Unknown source ID. Use a configured source ID such as dick_capital or atlas_demo.');
 const bySource=x=>MP.dataset(x)==='fictional'&&(!args.source||x.source_id===args.source);
 if(c.name==='positions')return paginate('Currently open positions'+(args.source?' · '+args.source:''),positions.filter(p=>p.status==='OPEN'&&bySource(p)).sort((a,b)=>(a.source_id+'|'+a.ticker).localeCompare(b.source_id+'|'+b.ticker)).map(p=>p.source_id+' · '+(p.portfolio_id||'legacy_fixture')+' · '+p.ticker+' · '+(p.baseline_record_id?(p.last_action||'BASELINE')+' · baseline-backed · '+p.accepted_event_count+' subsequent trades':p.last_action)+' · cycle '+p.cycle_number+' · '+p.latest_effective_at+(p.baseline_record_id?' ('+MP.baseline.dateLabel(p,logs)+')':'')),args.page);
 if(c.name==='history')return paginate('Accepted history · '+args.ticker,history.filter(e=>e.ticker===args.ticker&&bySource(e)).sort((a,b)=>Date.parse(b.effective_at)-Date.parse(a.effective_at)||b._row-a._row).map(e=>e.source_id+' · '+(e.portfolio_id||'legacy_fixture')+' · '+e.action+' · '+e.effective_at+' · '+(e.time_basis==='RECEIVED_FALLBACK'?'received-time fallback':'reported date')),args.page);
 const rid='command:discord:'+c.interaction_id,dups=logs.filter(x=>x.record_id===rid);
 if(dups.length){const r=dups[0];if(r.content_hash!==auth.request_hash)return output('INTERACTION_ID_CONFLICT','This interaction ID conflicts with a recorded request. Manual review is required.');let cp;try{cp=JSON.parse(r.analysis_checkpoint_json);}catch(e){throw new Error('COMMAND_CHECKPOINT_INVALID');}if(cp.version!=='4.0'||sha(canon(cp.command))!==r.content_hash||cp.target_hash!==sha(canon(cp.request)))throw new Error('COMMAND_CHECKPOINT_CONFLICT');return output('DUPLICATE_COMMAND','This analysis request is already recorded and remains blocked pending deployment approval. No analysis was dispatched.',{record_id:rid,message_key:r.message_key});}
 const permitted=sources.filter(s=>bySource(s)&&s.content_policy==='FICTIONAL_ONLY'&&JSON.parse(s.source_rules_json||'{}').fixture_only===true).map(s=>s.source_id);
 const candidates=catalog.filter(f=>permitted.includes(f.source_id)&&Date.parse(f.received_at)<=Date.parse(ctx.now)).sort((a,b)=>Date.parse(b.received_at)-Date.parse(a.received_at)||b.test_id.localeCompare(a.test_id));
 const latest=candidates.find(f=>args.reprocess||!logs.some(r=>['INTAKE','MESSAGE'].includes(r.record_type)&&r.message_key===f.message_key));
 if(!latest)return output('NO_ELIGIBLE_NOTIFICATION','No unprocessed fictional notification is eligible. Completed or uncertain messages are not silently retried.');
 const reserved=logs.find(r=>r.record_type==='COMMAND'&&r.message_key===latest.message_key&&['BLOCKED','IN_FLIGHT','PROCESSING'].includes(r.status));
 if(reserved)return output('ANALYSIS_ALREADY_REQUESTED','An analysis request for this notification is already recorded. No additional request was created.',{record_id:reserved.record_id,message_key:latest.message_key});
 const request=clone(latest.request);
 if(request.phase3_fixture_mode!==true||request.suppress_notifications!==true||request.envelope.id!==latest.test_id||request.envelope.text!==latest.text||Number(request.envelope.internalDate)!==Date.parse(latest.received_at))throw new Error('CATALOG_CONFLICT');
 const cp={version:'4.0',command:c,request,target_hash:sha(canon(request)),requires_review:args.reprocess,dispatch_gate:'UNPUBLISHED_DEPENDENCIES_AND_SINGLE_WRITER_REQUIRED'};
 const record=Object.fromEntries(headers['Processing Log'].map(k=>[k,'']));Object.assign(record,{record_id:rid,record_type:'COMMAND',message_key:latest.message_key,source_id:latest.source_id,received_at:ctx.now,content_hash:auth.request_hash,origin_ref:'discord-fixture:'+c.interaction_id,operation_id:sha('discord-request-v1|'+c.interaction_id),stage:args.reprocess?'REPROCESS_REVIEW':'AWAITING_DISPATCH_APPROVAL',status:'BLOCKED',analysis_checkpoint_json:canon(cp),progress_json:canon({dispatched:false,ai_calls:0,position_writes:0}),notification_json:canon({status:'SUPPRESSED',sent:false}),attempt_count:0,error_category:'DEPLOYMENT_GATE',error_code:args.reprocess?'REPROCESS_REVIEW_REQUIRED':'NESTED_DRAFT_EXECUTION_BLOCKED',error_summary:'No analysis dispatched. Publication and a serialized writer require approval.',review_json:canon({review_required:true,reason:args.reprocess?'Reprocessing must not overwrite accepted history or bypass an existing review.':'Inspect frozen request; do not auto-dispatch.'}),execution_id:String(ctx.execution_id),created_at:ctx.now,updated_at:ctx.now,schema_version:'4.0'});
 const row=db['Processing Log'].length+1;if(row>=1000)throw new Error('CAPACITY_REVIEW:Processing Log');
 return {route:1,status:'PREPARE_ANALYSIS_REQUEST',record_id:rid,message_key:latest.message_key,record,row,body:{valueInputOption:'RAW',data:[{range:"'Processing Log'!A"+row+':'+String.fromCharCode(64+headers['Processing Log'].length)+row,majorDimension:'ROWS',values:[toRow(record,'Processing Log',headers)]}]}};
}
function verifyRecorded(plan,db,headers){
 const rows=tableRows(db,'Processing Log',headers).filter(r=>r.record_id===plan.record_id);
 if(rows.length!==1||canon(toRow(rows[0],'Processing Log',headers))!==canon(toRow(plan.record,'Processing Log',headers)))return output('WRITE_OUTCOME_UNCERTAIN','The analysis request could not be verified. Do not blindly retry a database write; reread and reconcile first.',{record_id:plan.record_id});
 return output('ANALYSIS_REQUEST_RECORDED','Analysis request recorded for '+plan.message_key+'. Dispatch is blocked while workflows are unpublished. No AI call or position change was made.',{record_id:plan.record_id,message_key:plan.message_key,dispatched:false});
}
function safeResolve(auth,response,ctx,config,headers,catalog){try{return resolveCommand(auth,snapshotOf(response,headers),ctx,config,headers,catalog);}catch(e){return output('DEPENDENCY_OR_DATA_ERROR','The database could not be read consistently. Please retry later; unresolved data conflicts require review.',{diagnostic_code:/^[A-Z_: ]+$/.test(e.message)?e.message:'DATABASE_CHECK_FAILED'});}}
function fixtureConfig(publicKey){return {public_key:publicKey,application_id:'910000000000000001',guild_ids:['910000000000000002'],reader_user_ids:['910000000000000003'],reader_role_ids:['910000000000000005'],analyzer_user_ids:['910000000000000003'],analyzer_role_ids:[],fixture_mode:true,suppress_responses:true};}
function signedFixture(name,args={},id='910000000000000101',mutate=null,nowMs=Date.now()){
 const keys=crypto.generateKeyPairSync('ed25519'),pub=keys.publicKey.export({type:'spki',format:'der'}).subarray(-32).toString('hex'),cfg=fixtureConfig(pub);
 const b={id,token:'FICTIONAL_INTERACTION_TOKEN_DO_NOT_USE',application_id:cfg.application_id,type:2,guild_id:cfg.guild_ids[0],member:{user:{id:cfg.reader_user_ids[0],bot:false},roles:[]},data:{id:'910000000000000010',type:1,name,options:Object.entries(args).map(([name,value])=>({name,type:typeof value==='string'?3:typeof value==='boolean'?5:4,value}))}};
 if(mutate)mutate(b);const raw=Buffer.from(JSON.stringify(b)),ts=String(Math.floor(nowMs/1000)),sig=crypto.sign(null,Buffer.concat([Buffer.from(ts),raw]),keys.privateKey).toString('hex');
 return {raw,headers:{'x-signature-ed25519':sig,'x-signature-timestamp':ts},config:cfg,nowMs};
}
module.exports={verifySignature,authorize,snapshotOf,safeSnapshot,resolveCommand,verifyRecorded,safeResolve,fixtureConfig,signedFixture,ephemeral,output,sha,canon,clone};
