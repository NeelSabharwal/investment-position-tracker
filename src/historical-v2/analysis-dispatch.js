'use strict';
const crypto=require('crypto');
const D=require('./discord-core');
const A=require('./interaction-adapter');
const I=require('./intake-core');
const LOCK_ID=73015001,LOCK_KEY='ipt_writer_lock_v1',WORKFLOW_D='6oUxCXrJa2EiqgEn';
const TERMINAL=['COMPLETE','NO_TRADE','REVIEW','BLOCKED','SKIPPED'];
function owner(executionId,now){return JSON.stringify({version:1,owner:crypto.randomUUID(),workflow_id:WORKFLOW_D,execution_id:String(executionId),created_at:now});}
function validOwner(value){try{const o=JSON.parse(value);return o.version===1&&o.workflow_id===WORKFLOW_D&&/^\d+$/.test(o.execution_id)&&/^[0-9a-f-]{36}$/.test(o.owner)&&Number.isFinite(Date.parse(o.created_at));}catch(e){return false;}}
function createLock(value){if(!validOwner(value))throw Error('INVALID_WRITER_IDENTITY');return {requests:[{createDeveloperMetadata:{developerMetadata:{metadataId:LOCK_ID,metadataKey:LOCK_KEY,metadataValue:value,visibility:'DOCUMENT',location:{spreadsheet:true}}}}]};}
function releaseLock(value){if(!validOwner(value))throw Error('INVALID_WRITER_IDENTITY');return {requests:[{deleteDeveloperMetadata:{dataFilter:{developerMetadataLookup:{metadataId:LOCK_ID,metadataKey:LOCK_KEY,metadataValue:value,visibility:'DOCUMENT'}}}}]};}
function bodyOf(r){let b=r?.body??r;try{if(b?._readableState?.buffer){b=Buffer.concat(b._readableState.buffer.map(x=>Buffer.from(x.data??x))).toString('utf8');}return typeof b==='string'?JSON.parse(b):b;}catch(e){return {};}}
function owns(response,value){const b=bodyOf(response);return (!response?.statusCode||response.statusCode===200)&&b.metadataId===LOCK_ID&&b.metadataKey===LOCK_KEY&&b.metadataValue===value&&b.visibility==='DOCUMENT'&&b.location?.spreadsheet===true;}
function released(response,value){const ds=bodyOf(response)?.replies?.[0]?.deleteDeveloperMetadata?.deletedDeveloperMetadata??[];return (!response.statusCode||response.statusCode===200)&&ds.length===1&&ds[0].metadataId===LOCK_ID&&ds[0].metadataValue===value;}
function result(status,extra={}){return {status,fictional:true,notifications:'SUPPRESSED',...extra};}
function commandGate(command){return command?.application_id==='1561105644948430858'&&command.guild_id==='1561045409378467900'&&command.user_id==='1554849344686006403'&&command.name==='analyze'&&/^[1-9][0-9]{16,19}$/.test(command.interaction_id)&&typeof command.args?.reprocess==='boolean'&&(!command.args.source||/^[a-z][a-z0-9_]{0,39}$/.test(command.args.source));}
function frozenRequest(record,catalog){const cp=JSON.parse(record.analysis_checkpoint_json||'{}');if(cp.version!=='4.1'||D.sha(D.canon(cp.command))!==record.content_hash||cp.request_hash!==D.sha(D.canon(cp.request)))throw Error('COMMAND_CHECKPOINT_CONFLICT');const f=catalog.find(f=>f.message_key===record.message_key);if(!f||D.canon(cp.request)!==D.canon(f.request))throw Error('COMMAND_FIXTURE_CONFLICT');return cp;}
function writePlan(row,record,action,request,headers){return {route:1,action,row,record,request,body:{valueInputOption:'RAW',data:[{range:"'Processing Log'!A"+row+':'+String.fromCharCode(64+headers['Processing Log'].length)+row,majorDimension:'ROWS',values:[headers['Processing Log'].map(k=>record[k]??'')]}]}};}
function plan(job,response,ctx,headers,catalog,allowlist,fixtures,schemas){
 if(!commandGate(job.command)||!validOwner(job.writer_lock))throw Error('ANALYSIS_DISPATCH_NOT_AUTHORIZED');
 const db=D.snapshotOf(response,headers);A.assertFictionalDataset(db,headers,allowlist);
 // Read commands require a complete projection. Recovery must also accept a verified frozen C operation with an interrupted projection.
 const logs=db['Processing Log'].slice(1).filter(r=>r.some(v=>v!==''&&v!==null)).map((r,i)=>({...Object.fromEntries(headers['Processing Log'].map((k,j)=>[k,r[j]??''])),_row:i+2}));
 if(new Set(logs.map(r=>r.record_id)).size!==logs.length)throw Error('DUPLICATE_LOG_ROWS');
 const c=job.command,id='command:discord:'+c.interaction_id,hash=D.sha(D.canon(c)),old=logs.find(r=>r.record_id===id),match=l=>!c.args.source||l.source_id===c.args.source;
 if(old){
  if(old.content_hash!==hash)return {route:0,result:result('INTERACTION_ID_CONFLICT')};
  if(TERMINAL.includes(old.status))return {route:0,result:result(old.status,{duplicate:true,message_key:old.message_key,review_required:['REVIEW','BLOCKED'].includes(old.status)})};
  const cp=frozenRequest(old,catalog),intake=logs.find(l=>l.record_id==='intake:'+old.message_key);
  if(intake&&TERMINAL.includes(intake.status))return finish({row:old._row,record:old},result(intake.status,{message_key:old.message_key}),response,ctx,headers);
  if(intake?.status==='RETRY_WAIT'&&Date.parse(intake.next_retry_at)>Date.parse(ctx.now))return {route:0,result:result('NOT_DUE',{message_key:old.message_key,retry_at:intake.next_retry_at})};
  if(intake?.status==='IN_FLIGHT'&&Date.parse(ctx.now)-Date.parse(intake.updated_at)<I.STALE_MS)return {route:0,result:result('BUSY',{message_key:old.message_key})};
  const r={...old};delete r._row;Object.assign(r,{status:'IN_FLIGHT',stage:'DISPATCH_PENDING',updated_at:ctx.now,execution_id:ctx.execution_id,attempt_count:Number(r.attempt_count)+1});
  return writePlan(old._row,r,'DISPATCH',cp.request,headers);
 }
 if(c.args.source&&!db.Sources.slice(1).some(r=>r[0]===c.args.source))return {route:0,result:result('UNKNOWN_SOURCE')};
 if(c.args.reprocess)return {route:0,result:result('REPROCESS_REVIEW_REQUIRED',{review_required:true})};
 const selected=I.selectRecovery(db,ctx.now,headers,fixtures,schemas);
 const due=logs.filter(l=>l.record_type==='INTAKE'&&match(l)&&(l.status==='RETRY_WAIT'&&Date.parse(l.next_retry_at)<=Date.parse(ctx.now)||l.status==='IN_FLIGHT'&&Date.parse(ctx.now)-Date.parse(l.updated_at)>=I.STALE_MS)).sort((a,b)=>Date.parse(a.next_retry_at||a.updated_at)-Date.parse(b.next_retry_at||b.updated_at));
 let f,kind='FRESH';
 if(due.length){const cp=I.checkpoint(due[0]);I.intakeGate(cp.request,fixtures,schemas);f=catalog.find(x=>x.message_key===due[0].message_key);if(!f||D.canon(I.intakeGate(f.request,fixtures,schemas))!==D.canon(cp.request))throw Error('RECOVERY_FIXTURE_CONFLICT');kind='RECOVERY';}
 else {
  f=catalog.filter(x=>match(x)&&Date.parse(x.received_at)<=Date.parse(ctx.now)&&!logs.some(l=>l.message_key===x.message_key&&(['INTAKE','MESSAGE'].includes(l.record_type)||l.record_type==='COMMAND'&&['BLOCKED','IN_FLIGHT','PROCESSING'].includes(l.status)))).sort((a,b)=>Date.parse(b.received_at)-Date.parse(a.received_at)||b.test_id.localeCompare(a.test_id))[0];
 }
 if(!f){const pending=logs.find(l=>l.record_type==='INTAKE'&&match(l)&&l.status==='RETRY_WAIT');return {route:0,result:result(pending?'NOT_DUE':'NO_ELIGIBLE_NOTIFICATION',pending?{retry_at:pending.next_retry_at}:{})};}
 if(kind==='FRESH')D.safeSnapshot(db,headers,ctx.now);
 const cp={version:'4.1',command:c,request:D.clone(f.request),request_hash:D.sha(D.canon(f.request)),dispatch_kind:kind};
 const r=Object.fromEntries(headers['Processing Log'].map(k=>[k,'']));
 Object.assign(r,{record_id:id,record_type:'COMMAND',message_key:f.message_key,source_id:f.source_id,received_at:ctx.now,content_hash:hash,origin_ref:'discord:'+c.interaction_id,operation_id:D.sha('discord-request-v1|'+c.interaction_id),stage:'DISPATCH_PENDING',status:'IN_FLIGHT',analysis_checkpoint_json:D.canon(cp),progress_json:D.canon({dispatches:0,analysis_complete:false}),notification_json:D.canon({status:'SUPPRESSED',sent:false}),attempt_count:1,execution_id:ctx.execution_id,created_at:ctx.now,updated_at:ctx.now,schema_version:'4.1'});
 const row=db['Processing Log'].length+1;if(row>=1000)throw Error('CAPACITY_REVIEW');return writePlan(row,r,'DISPATCH',f.request,headers);
}
function verify(plan,response,headers){const db=D.snapshotOf(response,headers),rows=db['Processing Log'];const same=rows.slice(1).filter(r=>r[0]===plan.record.record_id);if(same.length!==1||D.canon(headers['Processing Log'].map((k,i)=>same[0][i]??''))!==D.canon(headers['Processing Log'].map(k=>plan.record[k]??''))||rows[plan.row-1]?.[0]!==plan.record.record_id)throw Error('COMMAND_WRITE_UNVERIFIED');return plan;}
function finish(plan,child,response,ctx,headers){
 if(child?.error||!['COMPLETE','NO_TRADE','REVIEW','BLOCKED','RETRY_WAIT','BUSY','NOT_DUE','SKIPPED'].includes(child?.status)||child.message_key!==plan.record.message_key)throw Error('CHILD_OUTCOME_UNCERTAIN_LOCK_RETAINED');
 const db=D.snapshotOf(response,headers),intakes=db['Processing Log'].slice(1).filter(r=>r[0]==='intake:'+plan.record.message_key);
 if(intakes.length!==1)throw Error('INTAKE_OUTCOME_MISSING');const intake=Object.fromEntries(headers['Processing Log'].map((k,i)=>[k,intakes[0][i]??'']));
 if(!['BUSY','NOT_DUE'].includes(child.status)&&intake.status!==child.status)throw Error('INTAKE_OUTCOME_CONFLICT');
 const r=D.clone(plan.record),status=intake.status;Object.assign(r,{stage:status==='RETRY_WAIT'?'RECOVERY_PENDING':TERMINAL.includes(status)?'DISPATCH_FINISHED':'AWAITING_REVIEW',status,progress_json:D.canon({dispatches:Number(r.attempt_count),intake_status:status,analysis_complete:status==='COMPLETE',b_calls:JSON.parse(intake.progress_json||'{}').b_calls||0,c_calls:JSON.parse(intake.progress_json||'{}').c_calls||0}),updated_at:ctx.now,completed_at:TERMINAL.includes(status)?ctx.now:'',next_retry_at:intake.next_retry_at||'',error_category:intake.error_category||'',error_code:intake.error_code||'',review_json:intake.review_json||''});
 const out=writePlan(plan.row,r,'RETURN',null,headers);out.result=result(status,{message_key:r.message_key,review_required:['REVIEW','BLOCKED'].includes(status),retry_at:r.next_retry_at||null,duplicate:child.duplicate===true});return out;
}
function text(r){
 const id=r.message_key?String(r.message_key).split(':').pop():'';
 const lines={COMPLETE:'Fictional analysis completed for '+id+'. Accepted updates and current positions were verified.',NO_TRADE:'Fictional analysis completed for '+id+': no trade was reported.',REVIEW:'Fictional analysis of '+id+' requires review. Ambiguous or inconsistent updates were not applied.',BLOCKED:'Analysis is blocked for review. No additional processing was dispatched.',BUSY:'Another analysis is running. Please try again after it finishes.',LOCK_BUSY:'Another analysis owns the writer lock. Retry after it finishes; a stopped run may need recovery review.',LOCK_UNAVAILABLE:'The writer lock could not be verified. No analysis was started.',RETRY_WAIT:'A temporary dependency failed for '+id+'. Its checkpoint is saved. Retry /analyze after '+(r.retry_at||'the retry delay')+'.',NOT_DUE:'The saved retry is not due yet. Try after '+(r.retry_at||'the retry delay')+'.',NO_ELIGIBLE_NOTIFICATION:'No unprocessed fictional notification is eligible. Existing review cases were left unchanged.',REPROCESS_REVIEW_REQUIRED:'Reprocessing requires a reviewed decision. Existing accepted events and review cases were left unchanged.',UNKNOWN_SOURCE:'Unknown source. Use dick_capital or atlas_demo.',INTERACTION_ID_CONFLICT:'This interaction conflicts with an existing request. Manual review is required.',LOCK_TEST_HELD:'Writer-lock integration test completed.',LOCK_RELEASE_UNCONFIRMED:'Processing stopped, but writer-lock release could not be confirmed. Manual review is required.'};
 return (r.duplicate?'This request was already handled. ':'')+(lines[r.status]||'Analysis needs manual review. No automatic retry was started.')+'\nFictional demo. Automatic notifications remain suppressed.';
}
module.exports={LOCK_ID,LOCK_KEY,owner,validOwner,createLock,releaseLock,bodyOf,owns,released,result,commandGate,plan,verify,finish,text};
