const MP=require('./multi-portfolio');
'use strict';
// Pure deterministic orchestration. Google Sheets calls live in HTTP nodes.
const base = require('./position-core');
const {sha,canon,clone,privacyGate,tableRows,toRow,cleanRow,schemaErrors,managerGate} = base;
const TERMINAL = ['COMPLETE','NO_TRADE','REVIEW','BLOCKED','SKIPPED'];
const STALE_MS = 15 * 60 * 1000;
function normalizeEnvelope(e) {
 if(!e||typeof e.id!=='string'||!/^P3\d{2}$/.test(e.id))throw new Error('FICTIONAL_MESSAGE_ID_REQUIRED');
 let text=e.text;
 if(text===undefined&&e.payload?.mimeType==='text/plain'&&typeof e.payload?.body?.data==='string')text=Buffer.from(e.payload.body.data,'base64url').toString('utf8');
 if(typeof text!=='string'||text.length>16000)throw new Error('PLAIN_TEXT_REQUIRED');
 text=text.replace(/\r\n?/g,'\n').replace(/\u00a0/g,' ').trim();
 if(/<\/?(?:html|script|style|blockquote)\b/i.test(text))throw new Error('HTML_REQUIRES_REVIEW');
 const received=new Date(Number(e.internalDate));if(!Number.isFinite(received.getTime()))throw new Error('INVALID_RECEIPT_TIMESTAMP');
 return {id:e.id,internalDate:String(received.getTime()),from:String(e.from||'').trim().toLowerCase(),list_id:String(e.list_id||'').trim().toLowerCase(),text,subject:String(e.subject||'Fictional test').slice(0,200)};
}
function intakeGateV1(request,fixtures,schemas){
 if(request.phase3_fixture_mode!==true||request.suppress_notifications!==true)throw new Error('PHASE3_FICTIONAL_SUPPRESSION_REQUIRED');
 const envelope=normalizeEnvelope(request.envelope);
 const f=fixtures.find(x=>x.message_key==='fixture:mailbox:'+envelope.id);
 if(!f||f.text!==envelope.text||f.received_at!==new Date(Number(envelope.internalDate)).toISOString().replace('.000Z','Z'))throw new Error('FIXTURE_ALLOWLIST_MISMATCH');
 const input=base.fixtureInput(f);privacyGate(input,fixtures,schemas);
 return {envelope,input,phase3_fixture_mode:true,suppress_notifications:true};
}
function intakeGate(request,fixtures,schemas){return /^(?:MP|BL)[0-9]{3}$/.test(request?.envelope?.id||'')?MP.intakeGate(request):intakeGateV1(request,fixtures,schemas);}
function tablesOf(body,headers){
 if(!Array.isArray(body.valueRanges)||body.valueRanges.length!==4)throw new Error('SNAPSHOT_INCOMPLETE');
 const snapshot=Object.fromEntries(Object.keys(headers).map((n,i)=>[n,body.valueRanges[i].values||[]]));
 for(const name of Object.keys(headers))tableRows(snapshot,name,headers);
 return snapshot;
}
function logWrite(row,record,route,headers){
 const obj=Object.fromEntries(headers['Processing Log'].map(k=>[k,record[k]??''])),values=[toRow(obj,'Processing Log',headers)];
 return {route,record:obj,row,body:{valueInputOption:'RAW',data:[{range:"'Processing Log'!A"+row+':'+String.fromCharCode(64+headers['Processing Log'].length)+row,majorDimension:'ROWS',values}]}};
}
function checkpoint(record){
 const cp=JSON.parse(record.analysis_checkpoint_json||'{}');
 if(cp.version!=='3.0'||!cp.request||cp.input_hash!==sha(canon(cp.request.input))||cp.envelope_hash!==sha(canon(cp.request.envelope)))throw new Error('INTAKE_CHECKPOINT_CONFLICT');
 if(cp.analysis&&cp.analysis_hash!==sha(canon(cp.analysis)))throw new Error('ANALYSIS_CHECKPOINT_CONFLICT');
 return cp;
}
function sourceCheckV1(req,snapshot,headers){
 const sources=tableRows(snapshot,'Sources',headers);
 const matches=sources.filter(s=>JSON.parse(s.sender_emails_json||'[]').includes(req.envelope.from)&&JSON.parse(s.list_ids_json||'[]').includes(req.envelope.list_id));
 if(matches.length!==1||matches[0].source_id!==req.input.source_id)return 'SOURCE_IDENTITY_MISMATCH';
 const s=matches[0];
 if(s.content_policy!=='FICTIONAL_ONLY'||JSON.parse(s.source_rules_json||'{}').fixture_only!==true||Number(s.config_version)!==req.input.config_version)return 'SOURCE_CONFIG_BLOCKED';
 // Disabled sources are permitted only after the exact fixture gate above.
 return null;
}
function sourceCheck(req,snapshot,headers){if(!['2.0','2.1'].includes(req.input.schema_version))return sourceCheckV1(req,snapshot,headers);const matches=MP.tableRows(snapshot,'Sources',headers).filter(s=>s.source_id===req.input.source_id&&MP.dataset(s)===req.input.dataset_id);if(matches.length!==1)return 'SOURCE_IDENTITY_MISMATCH';const s=matches[0];return s.content_policy==='FICTIONAL_ONLY'&&JSON.parse(s.source_rules_json||'{}').fixture_only===true&&JSON.parse(s.sender_emails_json||'[]').includes(req.envelope.from)&&JSON.parse(s.list_ids_json||'[]').includes(req.envelope.list_id)&&MP.canon(JSON.parse(s.portfolios_json||'{}'))===MP.canon(req.input.portfolio_catalog)?null:'SOURCE_CONFIG_BLOCKED';}
function terminal(record,duplicate=false){return {route:0,status:record.status,message_key:record.message_key,duplicate,attempt_count:Number(record.attempt_count),error_code:record.error_code||null,next_retry_at:record.next_retry_at||null,notifications:'SUPPRESSED',review_required:['REVIEW','BLOCKED'].includes(record.status)};}
function beginIntakeLegacy(req,snapshot,ctx,headers){
 const logs=tableRows(snapshot,'Processing Log',headers),id='intake:'+req.input.message_key;
 const found=logs.filter(x=>x.record_id===id);if(found.length>1)throw new Error('DUPLICATE_INTAKE_ROWS');
 let old=found[0],cp=old?checkpoint(old):{version:'3.0',request:req,input_hash:sha(canon(req.input)),envelope_hash:sha(canon(req.envelope)),analysis:null,analysis_hash:null};
 if(cp.input_hash!==sha(canon(req.input))||cp.envelope_hash!==sha(canon(req.envelope)))throw new Error('FROZEN_INTAKE_CONFLICT');
 if(old&&TERMINAL.includes(old.status))return terminal(old,true);
 if(old?.next_retry_at&&Date.parse(old.next_retry_at)>Date.parse(ctx.now))return {...terminal(old),status:'NOT_DUE'};
 if(old?.status==='IN_FLIGHT'&&Date.parse(ctx.now)-Date.parse(old.updated_at)<STALE_MS)return {...terminal(old),status:'BUSY'};
 const row=old?old._row:snapshot['Processing Log'].length+1;
 const r=old?cleanRow(old):{record_id:id,record_type:'INTAKE',message_key:req.input.message_key,gmail_message_id:req.envelope.id,source_id:req.input.source_id,received_at:req.input.received_at,content_hash:sha(req.input.normalized_text),origin_ref:req.input.origin?.canonical_url||'FICTIONAL_ENVELOPE',operation_id:sha('op-v1|'+req.input.message_key),analysis_checkpoint_json:canon(cp),progress_json:canon({b_calls:0,c_calls:0}),notification_json:canon({status:'SUPPRESSED',reason:'PHASE3_FICTIONAL',sent:false}),attempt_count:0,created_at:ctx.now,schema_version:req.input.schema_version,dataset_id:req.input.dataset_id||''};
 const sourceError=sourceCheck(req,snapshot,headers);
 const duplicate=logs.some(x=>x.source_id===req.input.source_id&&MP.dataset(x)===(req.input.dataset_id||'fictional')&&x.content_hash===r.content_hash&&x.message_key!==r.message_key);
 const max=Number(r.attempt_count)>=3;
 Object.assign(r,{execution_id:ctx.execution_id,updated_at:ctx.now,next_retry_at:'',completed_at:'',error_category:'',error_code:'',error_summary:'',review_json:''});
 if(sourceError||duplicate||max){
  Object.assign(r,{stage:'STOPPED',status:sourceError||max?'BLOCKED':'REVIEW',error_category:sourceError?'SOURCE':max?'TECHNICAL':'DUPLICATE',error_code:sourceError||(max?'ATTEMPT_LIMIT':'POSSIBLE_CROSS_MESSAGE_DUPLICATE'),review_json:canon({required:true}),completed_at:ctx.now});
  return logWrite(row,r,1,headers);
 }
 r.attempt_count=Number(r.attempt_count)+1;r.status='IN_FLIGHT';r.stage=cp.analysis?'MANAGER_PENDING':'ANALYZER_PENDING';
 const p=JSON.parse(r.progress_json);if(cp.analysis)p.c_calls++;else p.b_calls++;r.progress_json=canon(p);
 return logWrite(row,r,1,headers);
}
function beginIntake(req,snapshot,ctx,headers){const plan=beginIntakeLegacy(req,snapshot,ctx,headers);if(!['2.0','2.1'].includes(req.input.schema_version)||!plan.record||plan.record.status==='BLOCKED')return plan;const logs=MP.tableRows(snapshot,'Processing Log',headers);if(logs.some(l=>l.record_id==='intake:'+req.input.message_key))return plan;const prior=logs.filter(l=>l.record_type==='INTAKE'&&l.dataset_id===req.input.dataset_id&&l.source_id===req.input.source_id&&l.origin_ref===req.input.origin.canonical_url&&l.message_key!==req.input.message_key);if(!prior.length)return plan;const r=MP.clean?MP.clean(plan.record):MP.clone(plan.record);const p=prior[0];if(prior.length!==1||p.content_hash!==MP.sha(req.input.normalized_text)||p.status!=='COMPLETE'){Object.assign(r,{status:'REVIEW',stage:'ORIGIN_REVIEW',error_category:'DUPLICATE',error_code:prior.length!==1?'ORIGIN_LEDGER_CONFLICT':p.content_hash!==MP.sha(req.input.normalized_text)?'POST_CONTENT_CHANGED':'ORIGIN_OPERATION_INCOMPLETE',review_json:MP.canon({required:true}),progress_json:MP.canon({b_calls:0,c_calls:0,origin:req.input.origin}),completed_at:ctx.now});}else{Object.assign(r,{status:'COMPLETE',stage:'DUPLICATE_DELIVERY',error_category:'',error_code:'',review_json:'',progress_json:MP.canon({b_calls:0,c_calls:0,duplicate_of:p.record_id,origin:req.input.origin}),completed_at:ctx.now});}return logWrite(plan.row,r,1,headers);}
function verifyWrite(plan,snapshot,headers){
 const rows=tableRows(snapshot,'Processing Log',headers),matches=rows.filter(x=>x.record_id===plan.record.record_id);
 if(matches.length!==1||matches[0]._row!==plan.row||canon(cleanRow(matches[0]))!==canon(plan.record))throw new Error('WRITE_NOT_VERIFIED');
 return {...plan,record:cleanRow(matches[0])};
}
function dispatch(plan){
 if(TERMINAL.includes(plan.record.status)||plan.record.status==='RETRY_WAIT')return terminal(plan.record);
 const cp=checkpoint(plan.record);
 return {...plan,route:cp.analysis?2:1,input:cp.request.input,analysis:cp.analysis,storage_mode:'GOOGLE_SHEETS',phase2_fixture_mode:true};
}
function technicalFailure(raw,dependency){
 if(raw?.technical_failure)return {...raw.technical_failure,dependency};
 const e=raw?.error??raw;const rawText=typeof e==='string'?e:JSON.stringify(e||{});
 const status=Number(raw?.statusCode??e?.httpCode??e?.statusCode??e?.status??raw?.body?.error?.code??0)||Number(rawText.match(/\b(408|429|500|502|503|504|401|403|404)\b/)?.[1]||0);
 const timeout=/ETIMEDOUT|ESOCKETTIMEDOUT|ECONNRESET|EAI_AGAIN|timed?\s*out|IPT_TEST_TRANSIENT/i.test(rawText);
 const retryable=[408,429,500,502,503,504].includes(status)||timeout;
 const headers=raw?.headers||{};const retryHeader=headers['retry-after']||headers['Retry-After'];
 let retryAfter=Number(retryHeader)||0;if(retryHeader&&!retryAfter)retryAfter=Math.max(0,Math.ceil((Date.parse(retryHeader)-Date.now())/1000));
 return {dependency,category:retryable?'TRANSIENT':'PERMANENT_OR_UNKNOWN',code:status?'HTTP_'+status:timeout?'NETWORK_TIMEOUT_OR_RESET':'DEPENDENCY_FAILURE',retryable,retry_after_seconds:Number.isFinite(retryAfter)?Math.min(86400,Math.max(0,retryAfter)):0};
}
function stopTechnical(plan,failure,now,headers){
 const r=clone(plan.record),retry=failure.retryable&&Number(r.attempt_count)<3;
 const delay=Math.max(Number(r.attempt_count)===1?30:120,failure.retry_after_seconds||0);
 Object.assign(r,{status:retry?'RETRY_WAIT':'BLOCKED',stage:'DEPENDENCY_FAILED',next_retry_at:retry?new Date(Date.parse(now)+delay*1000).toISOString():'',error_category:failure.category,error_code:failure.code,error_summary:failure.dependency+' request failed; inspect execution metadata.',review_json:retry?'':canon({required:true,reason:Number(r.attempt_count)>=3?'ATTEMPT_LIMIT':failure.code}),updated_at:now,completed_at:retry?'':now});
 return logWrite(plan.row,r,1,headers);
}
function afterAnalyzer(plan,result,now,headers,fixtures,schemas){
 if(result?.technical_failure||result?.error)return stopTechnical(plan,technicalFailure(result,'Gemini'),now,headers);
 const r=clone(plan.record),cp=checkpoint(r);
 if((['2.0','2.1'].includes(cp.request.input.schema_version)?MP.canon(MP.analyze(cp.request.input,result?.extraction,result?.provenance?.model_id))!==MP.canon(result):schemaErrors(result,schemas.output).length)||result.message_key!==cp.request.input.message_key||result.source_id!==cp.request.input.source_id||result.provenance.content_sha256!==sha(cp.request.input.normalized_text))return stopTechnical(plan,{dependency:'Analyzer contract',category:'VALIDATION',code:'ANALYZER_CONTRACT_INVALID',retryable:false},now,headers);
 cp.analysis=result;cp.analysis_hash=sha(canon(result));
 if(result.classification==='VALID_TRADE')managerGate(cp.request.input,result,fixtures,schemas);
 const valid=result.classification==='VALID_TRADE'&&result.validation.eligible_for_position_manager&&!result.review_required;
 const status=valid?'IN_FLIGHT':result.classification==='NO_TRADE'?'NO_TRADE':'REVIEW';
 const p=JSON.parse(r.progress_json);if(valid)p.c_calls++;
 Object.assign(r,{analysis_checkpoint_json:canon(cp),progress_json:canon(p),stage:valid?'MANAGER_PENDING':'CLASSIFIED',status,updated_at:now,completed_at:valid?'':now,review_json:status==='REVIEW'?canon({required:true,classification:result.classification,issues:result.validation.issues}):''});
 if(r.analysis_checkpoint_json.length>40000)throw new Error('CHECKPOINT_TOO_LARGE');
 return logWrite(plan.row,r,1,headers);
}
function afterManager(plan,result,now,headers){
 if(result?.error||result?.technical_failure)return stopTechnical(plan,technicalFailure(result,'Position Manager'),now,headers);
 if(!result?.done||!['COMPLETE','DUPLICATE','REVIEW','BLOCKED'].includes(result.status)||result.message_key!==plan.record.message_key)return stopTechnical(plan,{dependency:'Position Manager contract',category:'VALIDATION',code:'MANAGER_CONTRACT_INVALID',retryable:false},now,headers);
 const r=clone(plan.record),cp=checkpoint(r),success=['COMPLETE','DUPLICATE'].includes(result.status);
 const content=success?'Fictional reported updates: '+cp.analysis.events.map(e=>cp.request.input.source_id+' · '+(e.portfolio_id?e.portfolio_id+' · ':'')+e.ticker+' · '+e.action).join('; '):'Manual review required: '+(result.reason||result.status);
 Object.assign(r,{status:success?'COMPLETE':result.status,stage:success?'DONE':'MANAGER_REVIEW',notification_json:canon({status:'SUPPRESSED',reason:'PHASE3_FICTIONAL',sent:false,preview:{content,allowed_mentions:{parse:[]}}}),progress_json:canon({...JSON.parse(r.progress_json),event_ids:result.event_ids||[],manager_status:result.status,projection_verified:success}),updated_at:now,completed_at:now,error_category:success?'':'STATE',error_code:result.reason||'',review_json:success?'':canon({required:true,reason:result.reason||result.status})});
 return logWrite(plan.row,r,1,headers);
}
function selectRecovery(snapshot,now,headers,fixtures,schemas){
 const logs=tableRows(snapshot,'Processing Log',headers),intakes=logs.filter(x=>x.record_type==='INTAKE');
 if(new Set(logs.map(x=>x.record_id)).size!==logs.length)throw new Error('DUPLICATE_LOG_ROWS');
 const report={notifications:'SUPPRESSED',review:logs.filter(x=>['REVIEW','BLOCKED'].includes(x.status)).map(x=>({record_id:x.record_id,status:x.status,reason:x.error_code||(x.review_json?JSON.parse(x.review_json).classification||JSON.parse(x.review_json).reason:null)||'Inspect review_json'})),orphan_operations:logs.filter(x=>x.record_type==='MESSAGE'&&!['COMPLETE','REVIEW','BLOCKED'].includes(x.status)&&!intakes.some(i=>i.message_key===x.message_key)).map(x=>({record_id:x.record_id,reason:'NO_INTAKE_CHECKPOINT_MANUAL_REVIEW'}))};
 const due=intakes.filter(x=>x.status==='RETRY_WAIT'&&x.next_retry_at&&Date.parse(x.next_retry_at)<=Date.parse(now)||x.status==='IN_FLIGHT'&&Date.parse(now)-Date.parse(x.updated_at)>=STALE_MS).sort((a,b)=>Date.parse(a.next_retry_at||a.updated_at)-Date.parse(b.next_retry_at||b.updated_at));
 const valid=[];
 for(const r of due){try {const cp=checkpoint(r);const request=intakeGate(cp.request,fixtures,schemas);if(canon(request)!==canon(cp.request))throw new Error('CHECKPOINT_REQUEST_MISMATCH');valid.push({record_id:r.record_id,request});}catch(e){report.review.push({record_id:r.record_id,status:'REVIEW_REQUIRED',reason:e.message});}}
 return {route:valid.length?1:0,status:valid.length?'RECOVERY_SELECTED':'NO_DUE_WORK',due_count:valid.length,selected:valid[0]||null,report};
}
function errorRecord(error,ctx,headers,snapshot,allowedWorkflowIds){
 const workflowId=String(error.workflow?.id||'');const executionId=String(error.execution?.id||'');
 if(!allowedWorkflowIds.includes(workflowId)||!/^\d+$/.test(executionId))throw new Error('UNSUPPORTED_ERROR_EVENT');
 const logs=tableRows(snapshot,'Processing Log',headers),id='error:'+workflowId+':'+executionId;
 const found=logs.filter(x=>x.record_id===id);if(found.length>1)throw new Error('DUPLICATE_ERROR_ROWS');if(found.length)return {route:0,status:'DUPLICATE_ERROR',notifications:'SUPPRESSED'};
 const record=Object.fromEntries(headers['Processing Log'].map(k=>[k,'']));
 Object.assign(record,{record_id:id,record_type:'ERROR',stage:'UNCAUGHT_FAILURE',status:'REVIEW',origin_ref:'n8n:'+workflowId+':'+executionId,error_category:'TECHNICAL',error_code:'UNCAUGHT_WORKFLOW_FAILURE',error_summary:'Inspect the referenced n8n execution. Recovery scan checks durable intake records.',notification_json:canon({status:'SUPPRESSED',sent:false}),review_json:canon({required:true}),attempt_count:0,execution_id:ctx.execution_id,created_at:ctx.now,updated_at:ctx.now,schema_version:'1.0'});
 return logWrite(snapshot['Processing Log'].length+1,record,1,headers);
}
module.exports={normalizeEnvelope,intakeGate,tablesOf,logWrite,checkpoint,sourceCheck,terminal,beginIntake,verifyWrite,dispatch,technicalFailure,stopTechnical,afterAnalyzer,afterManager,selectRecovery,errorRecord,STALE_MS};
