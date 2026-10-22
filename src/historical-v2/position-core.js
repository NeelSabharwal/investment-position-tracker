const MP=require('./multi-portfolio');
'use strict';
// Shared deterministic logic, embedded verbatim in n8n Code nodes. No network access.
const crypto = require('crypto');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const canon = x => JSON.stringify(x, function(k,v){return v && typeof v==='object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((a,k)=>(a[k]=v[k],a),{}) : v;});
const clone = x => JSON.parse(JSON.stringify(x));
function schemaErrors(x,s,p='$') {
 const out=[]; const types=Array.isArray(s.type)?s.type:[s.type];
 const actual=x===null?'null':Array.isArray(x)?'array':typeof x==='object'?'object':typeof x;
 if(s.enum&&!s.enum.some(v=>canon(v)===canon(x)))out.push(p+':enum');
 if(s.type&&!types.some(t=>t===actual||(t==='integer'&&typeof x==='number'&&Number.isInteger(x))))return out.concat(p+':type');
 if(actual==='object') {for(const k of s.required||[])if(!(k in x))out.push(p+'.'+k+':missing'); for(const k of Object.keys(x)) {if(s.properties?.[k])out.push(...schemaErrors(x[k],s.properties[k],p+'.'+k));else if(s.additionalProperties===false)out.push(p+'.'+k+':extra');}}
 if(actual==='array'){if(x.length>(s.maxItems??Infinity))out.push(p+':maxItems');for(let i=0;i<x.length;i++)out.push(...schemaErrors(x[i],s.items||{},p+'['+i+']'));}
 if(actual==='string'){if(x.length<(s.minLength||0)||x.length>(s.maxLength??Infinity))out.push(p+':length');if(s.pattern&&!new RegExp(s.pattern).test(x))out.push(p+':pattern');}
 if(actual==='number'&&s.minimum!==undefined&&x<s.minimum)out.push(p+':minimum');return out;
}
function isoDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;}
function dateInText(date,text){if(text.includes(date))return true;const [y,m,d]=date.split('-').map(Number);const name=['January','February','March','April','May','June','July','August','September','October','November','December'][m-1];return !!name&&new RegExp('\\b'+name+' '+d+',? '+y+'\\b','i').test(text);}
function utc(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(s)&&isoDate(s.slice(0,10))&&!Number.isNaN(Date.parse(s));}
function fixtureInput(c){return {schema_version:'1.0',message_key:c.message_key,source_id:c.source_id,received_at:c.received_at,normalized_text:c.text,content_policy:c.paid_content?'BLOCK_EXTERNAL_AI':'FICTIONAL_ONLY',is_fixture:!c.paid_content,config_version:1,author_verified:true};}
function privacyGateV1(input, fixtures, schemas){
 const errors=schemaErrors(input,schemas.input);if(errors.length)throw new Error('INPUT_SCHEMA:'+errors.slice(0,3).join(','));
 const f=fixtures.find(c=>c.message_key===input.message_key);
 if(!f||f.text!==input.normalized_text||f.source_id!==input.source_id||f.received_at!==input.received_at)throw new Error('FIXTURE_ALLOWLIST_MISMATCH');
 if(input.content_policy!=='FICTIONAL_ONLY'||input.is_fixture!==true||input.author_verified!==true||input.config_version!==1||f.paid_content||f.unknown_source||f.source_enabled===false)throw new Error('PRIVACY_OR_SOURCE_BLOCKED');
 if(!utc(input.received_at))throw new Error('INVALID_RECEIPT_TIMESTAMP');
 // Phase 2 accepts canonical plain text only; MIME/HTML/thread normalization belongs to A.
 if(/<\/?(?:html|script|style|blockquote)\b/i.test(input.normalized_text))throw new Error('UNNORMALIZED_CONTENT');
 return clone(input);
}
function privacyGate(input,fixtures,schemas){return ['2.0','2.1'].includes(input?.schema_version)?MP.gate(input):privacyGateV1(input,fixtures,schemas);}
function analyzeV1(input, model, schemas, modelId='gemini-2.5-flash-lite'){
 const issues=[]; const errors=schemaErrors(model,schemas.model);const sourceValid=!errors.length&&model.source_id===input.source_id;
 const result={schema_version:'1.0',message_key:input.message_key,source_id:input.source_id,classification:'INVALID',events:[],validation:{schema_valid:!errors.length,evidence_valid:false,source_valid:sourceValid,eligible_for_position_manager:false,issues:[]},review_required:true,provenance:{model_id:modelId,prompt_version:'2.0',normalization_version:'1.0',content_sha256:sha(input.normalized_text)}};
 if(errors.length||!sourceValid){result.validation.issues=errors.length?errors.slice(0,20):['SOURCE_MISMATCH'];return result;}
 if(model.classification==='NO_TRADE'){result.classification=model.events.length?'INVALID':'NO_TRADE';result.validation.evidence_valid=!model.events.length;result.review_required=!!model.events.length;result.validation.issues=model.events.length?['NO_TRADE_WITH_EVENTS']:[];return result;}
 if(model.classification==='TRADE'&&!model.events.length)issues.push('TRADE_WITHOUT_EVENTS');
 const offsets=[];let uncertain=model.classification==='UNCERTAIN'||model.uncertainties.length>0;
 for(const e of model.events){
  const quote=e.evidence_quote;const start=input.normalized_text.indexOf(quote);const unique=start>=0&&input.normalized_text.indexOf(quote,start+1)<0;
  if(!unique)issues.push('EVIDENCE_NOT_UNIQUE');
  if(!e.ticker||!/^[A-Z][A-Z0-9.\-]{0,9}$/.test(e.ticker)||!new RegExp('(^|[^A-Z0-9])'+String(e.ticker).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^A-Z0-9]|$)').test(quote))issues.push('TICKER_NOT_EXPLICIT');
  // Dates and company names are optional. Their absence must not invalidate an explicit trade.
  const optionalMissingFields=['company_name','announcement_date','announcement_timestamp'];
  if(!e.action||e.missing_fields.some(field=>!optionalMissingFields.includes(field)))issues.push('MISSING_REQUIRED_FIELDS');
  if(e.company_name&&!input.normalized_text.includes(e.company_name))issues.push('COMPANY_NOT_EXPLICIT');
  if(e.announcement_date&&(!isoDate(e.announcement_date)||!dateInText(e.announcement_date,input.normalized_text)))issues.push('INVALID_OR_UNSUPPORTED_DATE');
  if(e.announcement_timestamp&&(!utc(e.announcement_timestamp)||!input.normalized_text.includes(e.announcement_timestamp)))issues.push('INVALID_OR_UNSUPPORTED_TIMESTAMP');
  if(e.announcement_timestamp&&e.announcement_date&&e.announcement_timestamp.slice(0,10)!==e.announcement_date)issues.push('DATE_TIMESTAMP_CONFLICT');
  if(e.announcement_timestamp&&Date.parse(e.announcement_timestamp)>Date.parse(input.received_at))issues.push('FUTURE_ANNOUNCEMENT');
  if(e.certainty!=='HIGH'||e.ambiguities.length)uncertain=true;
  if(/\b(last week|last month|yesterday|previously|earlier this|ago)\b/i.test(quote)&&!e.announcement_date&&!e.announcement_timestamp)uncertain=true;
  const verb={OPEN:/\b(reopened|opened|initiated)\b/i,ADD:/\b(added|increased)\b/i,REDUCE:/\b(reduced|trimmed)\b/i,CLOSE:/\b(closed|entire|fully exited|no longer hold)\b/i};
  if(e.action&&verb[e.action]&&!verb[e.action].test(quote))uncertain=true;
  if(/\b(not|never|might|may|considering|plan to|will|would|if)\b/i.test(quote))uncertain=true;
  offsets.push({...clone(e),evidence_start:unique?start:null,evidence_end:unique?start+quote.length:null});
 }
 offsets.sort((a,b)=>(a.evidence_start??Infinity)-(b.evidence_start??Infinity));
 for(let i=1;i<offsets.length;i++)if(offsets[i].evidence_start<offsets[i-1].evidence_end)issues.push('OVERLAPPING_EVIDENCE');
 result.events=offsets.map((e,i)=>({event_id:sha('event-v1|'+input.message_key+'|'+i),event_index:i,ticker:e.ticker,company_name:e.company_name,action:e.action,announcement_date:e.announcement_date,announced_at:e.announcement_timestamp,effective_at:e.announcement_timestamp||input.received_at,time_basis:e.announcement_timestamp?'EXPLICIT_TIMESTAMP':'RECEIVED_FALLBACK',evidence_quote:e.evidence_quote,evidence_start:e.evidence_start,evidence_end:e.evidence_end,certainty:e.certainty,missing_fields:e.missing_fields,ambiguities:e.ambiguities}));
 result.classification=issues.length?'INVALID':uncertain?'UNCERTAIN':'VALID_TRADE';result.validation.evidence_valid=!issues.some(x=>/EVIDENCE|EXPLICIT|DATE|TIMESTAMP/.test(x));result.validation.eligible_for_position_manager=result.classification==='VALID_TRADE';result.validation.issues=[...new Set(issues.concat(model.uncertainties))].slice(0,20);result.review_required=result.classification!=='VALID_TRADE';return result;
}
function analyze(input,model,schemas,modelId){if(['2.0','2.1'].includes(input?.schema_version))return MP.analyze(input,model,modelId);const r=analyzeV1(input,model,schemas,modelId);if(r.classification==='NO_TRADE'&&model?.uncertainties?.length){r.classification='UNCERTAIN';r.review_required=true;r.validation.issues.push('NO_TRADE_WITH_UNCERTAINTY');}return r;}
function managerGateV1(input,analysis,fixtures,schemas){
 privacyGate(input,fixtures,schemas);
 if(schemaErrors(analysis,schemas.output).length)throw new Error('ANALYSIS_SCHEMA');
 if(analysis.message_key!==input.message_key||analysis.source_id!==input.source_id||analysis.provenance.content_sha256!==sha(input.normalized_text))throw new Error('ANALYSIS_INPUT_MISMATCH');
 const model={schema_version:'1.0',source_id:input.source_id,classification:'TRADE',uncertainties:[],events:analysis.events.map(e=>({ticker:e.ticker,company_name:e.company_name,action:e.action,announcement_date:e.announcement_date,announcement_timestamp:e.announced_at,evidence_quote:e.evidence_quote,certainty:e.certainty,missing_fields:e.missing_fields,ambiguities:e.ambiguities}))};
 const derived=analyze(input,model,schemas,analysis.provenance.model_id);
 if(!analysis.validation.eligible_for_position_manager||analysis.classification!=='VALID_TRADE'||analysis.review_required||!derived.validation.eligible_for_position_manager||canon(derived.events)!==canon(analysis.events))throw new Error('INELIGIBLE_ANALYSIS');
 return true;
}
function managerGate(input,analysis,fixtures,schemas){return ['2.0','2.1'].includes(input?.schema_version)?MP.managerGate(input,analysis):managerGateV1(input,analysis,fixtures,schemas);}
function rowObject(row, headers){return Object.fromEntries(headers.map((h,i)=>[h,row[i]??'']));}
function tableRows(snapshot,table,headers){return MP.tableRows(snapshot,table,headers);}
function toRow(o,table,headers){return headers[table].map(k=>o[k]??'');}
function cleanRow(o){const x=clone(o);delete x._row;return x;}
function eventHash(e){const x=cleanRow(e);delete x.payload_hash;return sha(canon(x));}
function foldV1(history,now){
 const states={};const seen={};
 for(const row of history){const e=cleanRow(row);if(e.payload_hash!==eventHash(e))throw new Error('HISTORY_HASH_CONFLICT');if(seen[e.event_id]){if(canon(seen[e.event_id])!==canon(e))throw new Error('EVENT_ID_CONFLICT');throw new Error('DUPLICATE_HISTORY_ROWS_REVIEW');}seen[e.event_id]=e;
  if(e.position_key!==e.source_id+'|'+e.ticker)throw new Error('POSITION_KEY_CONFLICT');
  const old=states[e.position_key];if((old?.last_event_id||'')!==(e.previous_event_id||''))throw new Error('HISTORY_CHAIN_CONFLICT');
  if(old&&Date.parse(e.effective_at)<Date.parse(old.latest_effective_at))throw new Error('HISTORY_ORDER_CONFLICT');
  if(e.action==='OPEN'?old&&old.status!=='CLOSED':!old||old.status!=='OPEN')throw new Error('HISTORY_TRANSITION_CONFLICT');
  const isOpen=e.action==='OPEN';const cycle=isOpen?sha('cycle-v1|'+e.event_id):old.cycle_id;if(cycle!==e.cycle_id)throw new Error('CYCLE_CONFLICT');
  const ids=(old?old._events:[]).concat([[e.event_id,e.payload_hash]]);
  states[e.position_key]={position_key:e.position_key,source_id:e.source_id,ticker:e.ticker,company_name:e.company_name||old?.company_name||'',status:e.action==='CLOSE'?'CLOSED':'OPEN',cycle_id:cycle,cycle_number:(old?.cycle_number||0)+(isOpen?1:0),opened_event_id:isOpen?e.event_id:old.opened_event_id,closed_event_id:e.action==='CLOSE'?e.event_id:'',last_event_id:e.event_id,last_action:e.action,latest_effective_at:e.effective_at,accepted_event_count:ids.length,projection_hash:sha(canon(ids)),rebuilt_at:now,_events:ids};
 }return states;
}
function fold(history,now,logs=[],sources=[]){return MP.fold(history,now,foldV1,logs,sources);}
function planEvents(input,analysis,history,now){
 const events=[];const all=clone(history);let states=fold(all,now);
 for(const e of analysis.events){const key=input.source_id+'|'+e.ticker;const prev=states[key];
  if(e.action==='OPEN'?prev&&prev.status!=='CLOSED':!prev||prev.status!=='OPEN')throw new Error('STATE_TRANSITION:'+e.action+':'+(prev?.status||'NONE'));
  if(prev&&(Date.parse(e.effective_at)<Date.parse(prev.latest_effective_at)||(e.announcement_date&&e.announcement_date<prev.latest_effective_at.slice(0,10))))throw new Error('LATE_EVENT_REVIEW');
  const row={event_id:e.event_id,operation_id:sha('op-v1|'+input.message_key),message_key:input.message_key,source_id:input.source_id,position_key:key,event_index:e.event_index,ticker:e.ticker,company_name:e.company_name||'',action:e.action,announcement_date:e.announcement_date||'',announced_at:e.announced_at||'',effective_at:e.effective_at,time_basis:e.time_basis,accepted_at:now,evidence_json:canon({quote:e.evidence_quote,start:e.evidence_start,end:e.evidence_end}),cycle_id:e.action==='OPEN'?sha('cycle-v1|'+e.event_id):prev.cycle_id,previous_event_id:prev?.last_event_id||'',analysis_version:'prompt-2.0/schema-1.0/normalization-1.0',review_id:'',schema_version:'1.0'};row.payload_hash=eventHash(row);events.push(row);all.push(row);states=fold(all,now);
 }return events;
}
// One durable write per call, always followed by a fresh full-table read.
function planStepV1(input,analysis,snapshot,ctx,headers){
 const now=ctx.now, recordId='message:'+input.message_key;
 const tables=Object.fromEntries(Object.keys(headers).map(t=>[t,tableRows(snapshot,t,headers)]));
 const history=tables['Trade History'], positions=tables['Current Positions'], logs=tables['Processing Log'],sources=tables.Sources;
 const source=tables.Sources.filter(s=>s.source_id===input.source_id);if(source.length!==1||source[0].content_policy!=='FICTIONAL_ONLY'||JSON.parse(source[0].source_rules_json||'{}').fixture_only!==true)throw new Error('SOURCE_CONFIG_BLOCKED');
 // Disabled Sources are allowed ONLY on this allowlisted, inactive Phase 2 fixture route.
 const records=logs.filter(l=>l.record_id===recordId);if(records.length>1)throw new Error('DUPLICATE_LOG_ROWS');let log=records[0];
 const write=(table,row,o,label)=>({done:false,label,table,row,values:[toRow(o,table,headers)]});
 const done=(status,extra={})=>({done:true,status,message_key:input.message_key,notifications:'SUPPRESSED',...extra});
 const baseLog=()=>({record_id:recordId,record_type:'MESSAGE',message_key:input.message_key,gmail_message_id:input.message_key,source_id:input.source_id,received_at:input.received_at,content_hash:analysis.provenance.content_sha256,origin_ref:'',operation_id:sha('op-v1|'+input.message_key),stage:'PREPARED',status:'PROCESSING',analysis_checkpoint_json:'',progress_json:'{}',notification_json:canon({status:'SUPPRESSED',reason:'PHASE2_FICTIONAL'}),attempt_count:1,next_retry_at:'',error_category:'',error_code:'',error_summary:'',review_json:'',execution_id:ctx.execution_id,created_at:now,updated_at:now,completed_at:'',schema_version:'1.0'});
 const review=(code)=>{if(log?.status==='REVIEW'||log?.status==='BLOCKED')return done(log.status,{reason:log.error_code});const row=log?{...cleanRow(log)}:baseLog();Object.assign(row,{status:'REVIEW',error_category:'STATE',error_code:code.slice(0,120),error_summary:'No automatic continuation; inspect frozen checkpoint and history.',review_json:canon({required:true,reason:code}),updated_at:now});return write('Processing Log',log?log._row:snapshot['Processing Log'].length+1,row,'REVIEW');};
 try{
  fold(history,now);
  if(new Set(positions.map(p=>p.position_key)).size!==positions.length)throw new Error('DUPLICATE_POSITION_ROWS');
  if(log?.status==='REVIEW'||log?.status==='BLOCKED')return done(log.status,{reason:log.error_code});
  if(!log){
   if(logs.some(l=>l.content_hash===analysis.provenance.content_sha256&&l.source_id===input.source_id&&l.message_key!==input.message_key))return review('POSSIBLE_CROSS_MESSAGE_DUPLICATE');
   if(history.some(e=>e.message_key===input.message_key))return review('HISTORY_WITHOUT_CHECKPOINT');
   const events=planEvents(input,analysis,history,now);const keys=[...new Set(events.map(e=>e.position_key))];
   const cp={version:'2.0',input_hash:sha(canon(input)),analysis_hash:sha(canon(analysis)),events,base_history_hash:sha(canon(history.filter(e=>keys.includes(e.position_key)).map(cleanRow))),keys};
   const raw=canon(cp);if(raw.length>20000)throw new Error('CHECKPOINT_TOO_LARGE');
   const row={...baseLog(),analysis_checkpoint_json:raw};return write('Processing Log',snapshot['Processing Log'].length+1,row,'CHECKPOINT');
  }
  const cp=JSON.parse(log.analysis_checkpoint_json);if(cp.version!=='2.0'||cp.input_hash!==sha(canon(input))||cp.analysis_hash!==sha(canon(analysis)))throw new Error('FROZEN_INPUT_CONFLICT');
  const plannedIds=new Set(cp.events.map(e=>e.event_id));
  const base=history.filter(e=>cp.keys.includes(e.position_key)&&!plannedIds.has(e.event_id));
  if(sha(canon(base.map(cleanRow)))!==cp.base_history_hash) {
   // Completed replays can have later legitimate events; reconcile their projection from all history.
   if(log.status!=='COMPLETE')throw new Error('STALE_PREFLIGHT_STATE');
  }
  if(log.status!=='COMPLETE'&&log.execution_id!==ctx.execution_id){
   if(Number(log.attempt_count)>=3){return write('Processing Log',log._row,{...cleanRow(log),status:'BLOCKED',error_category:'TRANSIENT',error_code:'ATTEMPT_LIMIT',review_json:canon({required:true,reason:'Three total attempts exhausted'}),updated_at:now},'RETRY_LIMIT');}
   return write('Processing Log',log._row,{...cleanRow(log),attempt_count:Number(log.attempt_count)+1,execution_id:ctx.execution_id,updated_at:now},'ATTEMPT');
  }
  for(const e of cp.events){const found=history.filter(h=>h.event_id===e.event_id);if(found.length>1||found.some(h=>canon(cleanRow(h))!==canon(e)))throw new Error('EVENT_PAYLOAD_CONFLICT');if(!found.length){if(log.status==='COMPLETE')throw new Error('COMPLETE_HISTORY_MISSING');return write('Trade History',snapshot['Trade History'].length+1,e,'HISTORY');}}
  const states=fold(history,now,logs,sources);
  for(const key of cp.keys){const expected={...states[key]};delete expected._events;const existing=positions.find(p=>p.position_key===key);const comparable=x=>{const y=cleanRow(x);delete y.rebuilt_at;return y;};if(!existing||canon(comparable(existing))!==canon(comparable(expected)))return write('Current Positions',existing?existing._row:snapshot['Current Positions'].length+1,expected,'PROJECTION');}
  if(log.status!=='COMPLETE')return write('Processing Log',log._row,{...cleanRow(log),stage:'DONE',status:'COMPLETE',progress_json:canon({accepted_event_ids:cp.events.map(e=>e.event_id),projection_verified:true}),updated_at:now,completed_at:now},'COMPLETE');
  return done(ctx.was_complete?'DUPLICATE':'COMPLETE',{event_ids:cp.events.map(e=>e.event_id),history_rows:history.length,positions:cp.keys.map(k=>{const p={...states[k]};delete p._events;return p;})});
 }catch(e){return review(String(e.message));}
}
function planStep(input,analysis,snapshot,ctx,headers){if(input.schema_version==='1.0'&&MP.baseline.tables(snapshot)['Processing Log'].some(r=>r.record_type==='BASELINE_BATCH'&&r.schema_version==='2.1'))return MP.baseline.legacyReconcile(input,analysis,snapshot,ctx,foldV1);return ['2.0','2.1'].includes(input?.schema_version)?MP.planStep(input,analysis,snapshot,ctx,headers,foldV1):planStepV1(input,analysis,snapshot,ctx,headers);}
function applyMemoryWrite(snapshot,action){const table=snapshot[action.table];if(!table)throw new Error('UNKNOWN_TABLE');while(table.length<action.row)table.push([]);table[action.row-1]=clone(action.values[0]);}
function emptyDatabase(headers,sources){return Object.fromEntries(Object.keys(headers).map(k=>[k,[headers[k],...(k==='Sources'?clone(sources):[])]]));}
function runMemory(input,analysis,db,ctx,headers,fault=null){
 const trace=[];ctx={...ctx,was_complete:tableRows(db,'Processing Log',headers).some(l=>l.message_key===input.message_key&&l.status==='COMPLETE')};
 for(let i=0;i<50;i++){const next=planStep(input,analysis,db,ctx,headers);if(next.done)return {...next,trace};trace.push(next.label);if(fault?.when==='before'&&next.label===fault.label&&trace.filter(x=>x===next.label).length===(fault.occurrence||1))throw new Error('INJECTED_BEFORE_'+next.label);applyMemoryWrite(db,next);if(fault?.when==='after'&&next.label===fault.label&&trace.filter(x=>x===next.label).length===(fault.occurrence||1))throw new Error('INJECTED_AFTER_'+next.label);}
 throw new Error('STEP_LIMIT');
}
module.exports={sha,canon,clone,schemaErrors,fixtureInput,privacyGate,analyze,managerGate,rowObject,tableRows,toRow,cleanRow,eventHash,fold,planEvents,planStep,applyMemoryWrite,emptyDatabase,runMemory};
