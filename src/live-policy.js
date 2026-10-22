'use strict';
// Dick Capital policy v3.0. Pure, deterministic, no credentials or network.
const crypto = require('crypto');
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const canon = x => JSON.stringify(x, (k,v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])) : v);
const copy = x => JSON.parse(JSON.stringify(x));
const POLICY = 'dick-owner-rules-2026-10-22-v1';
const GROUP = 'e54d273b-63a3-4542-8a49-d5af2d84c264';
const SID = '1re2wClNHgrLDp8uSXF4Leb_TqPLV4jTW7OGxR2sKjqM';
const EVENT_KEYS = ['action','ambiguities','announcement_date','announcement_timestamp','certainty','company_name','evidence_quote','missing_fields','portfolio_evidence_quote','portfolio_label','reported_action','reported_metadata','ticker'];
const escape = s => String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const fail = s => {throw Error(s);};
function guard(i) {
 if (!i || i.schema_version!=='2.1' || i.dataset_id!=='real' || i.source_id!=='dick_capital' || i.content_policy!=='AUTHOR_APPROVED_LIVE' || i.is_fixture!==false || i.author_verified!==true || i.message_kind!=='SUBSCRIBER_CHAT') fail('LIVE_SOURCE_BLOCKED');
 if (!/^real:mailbox:[a-f0-9]{10,40}$/i.test(i.message_key||'') || i.gmail_message_id!==i.message_key.split(':').pop()) fail('LIVE_MESSAGE_ID_INVALID');
 if (typeof i.normalized_text!=='string' || i.normalized_text.length<10 || i.normalized_text.length>60000 || !Number.isFinite(Date.parse(i.received_at))) fail('LIVE_CONTENT_INVALID');
 if (!i.origin || typeof i.origin.item_key!=='string' || typeof i.origin.canonical_url!=='string') fail('LIVE_ORIGIN_INVALID');
 if (canon(Object.keys(i.portfolio_catalog||{}).sort())!==canon(['long_term','trading'])) fail('LIVE_PORTFOLIO_CATALOG_INVALID');
 return i;
}
const norm = s => String(s||'').trim().replace(/\s+Update\s*:?$/i,'').replace(/:$/,'').replace(/\s+/g,' ').toLowerCase();
function alias(s,catalog) {const a=Object.entries(catalog).filter(([id,p])=>[p.display_name,...(p.aliases||[])].some(v=>norm(v)===norm(s)));return a.length===1?a[0][0]:null;}
function actionFromEvidence(q,ticker) {
 // No source rule overrides a hypothetical, negation, quotation, research or summary.
 if (/\b(not|never|might|may|consider|considering|plan|planning|would|could|if|interview|watchlist|research|yesterday|previously|last week|still hold|currently hold|allocation report|snapshot)\b/i.test(q)) return {action:null,reason:'NON_CURRENT_OR_NON_TRANSACTION_CONTEXT'};
 const flags=[];
 if (/\b(reduced|trimmed)\b/i.test(q) || /\bsold\s+(?:some|part|half|a portion|\d+(?:\.\d+)?\s*%)/i.test(q)) flags.push('REDUCE');
 if (/\b(added|increased)\b/i.test(q)) flags.push('ADD');
 if (/\b(closed|fully exited|sold all|sold everything)\b/i.test(q)) flags.push('CLOSE');
 if (/\bsold\b/i.test(q) && !flags.includes('REDUCE') && !/\b(shares|some|partial|portion|half|remaining)\b|%/i.test(q)) flags.push('CLOSE');
 if (/\b(opened|reopened|initiated)\b/i.test(q) || /\b(bought|purchased)\b/i.test(q) && !flags.includes('ADD')) flags.push('OPEN');
 const short=new RegExp('^\\s*(\\d+(?:\\.\\d+)?)\\s*%\\s+(?:position\\s+in\\s+)?\\$?'+escape(ticker)+'\\s+at\\s+([$€£]?)\\s*(\\d+(?:\\.\\d+)?)\\s*[.!]?\\s*$','i').exec(q);
 if(short && Number(short[1])>0 && Number(short[1])<=100) flags.push('OPEN');
 const unique=[...new Set(flags)];
 return unique.length===1 ? {action:unique[0],basis:short?'OWNER_ALLOCATION_PRICE_SHORTHAND':/\bsold\b/i.test(q)&&unique[0]==='CLOSE'?'OWNER_BARE_SOLD_FULL_EXIT':'EXPLICIT_OR_OWNER_PURCHASE_RULE',policy_version:POLICY} : {action:null,reason:unique.length?'MULTIPLE_ACTIONS_ONE_CANDIDATE':'ACTION_NOT_ESTABLISHED'};
}
function analyze(i,m) {
 guard(i);const text=i.normalized_text,issues=[],candidates=[],events=[],mentions=[];
 const output={schema_version:'2.1',dataset_id:'real',source_id:i.source_id,message_key:i.message_key,classification:'INVALID',events,candidates,observations:[],non_trade_mentions:mentions,uncertainties:[],review_required:true,live_review_only:true,validation:{schema_valid:false,evidence_valid:false,source_valid:true,eligible_for_position_manager:false,issues},provenance:{model_id:'gemini-3.5-flash-lite',prompt_version:POLICY,normalization_version:'chat-sections-live-3.0',content_sha256:sha(text),origin_item_key:i.origin.item_key},extraction:m};
 if (!m || canon(Object.keys(m).sort())!==canon(['classification','events','non_trade_mentions','schema_version','source_id','uncertainties']) || m.schema_version!=='2.1' || m.source_id!==i.source_id || !['TRADE','NO_TRADE','UNCERTAIN'].includes(m.classification) || !Array.isArray(m.events) || m.events.length>10 || !Array.isArray(m.non_trade_mentions) || m.non_trade_mentions.length>20 || !Array.isArray(m.uncertainties) || m.uncertainties.length>20 || m.uncertainties.some(x=>typeof x!=='string')) {issues.push('LIVE_SCHEMA_INVALID');return output;}
 output.validation.schema_valid=true; output.uncertainties=copy(m.uncertainties);
 const headings=[];let offset=0;for(const line of text.split('\n')){const pid=alias(line,i.portfolio_catalog);if(pid)headings.push({pid,line,start:offset});offset+=line.length+1;}
 for(const e of m.events){
  const local=[];if(!e||canon(Object.keys(e).sort())!==canon(EVENT_KEYS)) {issues.push('EVENT_SCHEMA_INVALID');continue;}
  const ticker=typeof e.ticker==='string'?e.ticker.replace(/^\$/,''):null,q=e.evidence_quote,start=typeof q==='string'?text.indexOf(q):-1;
  if(typeof q!=='string'||!q.length||q.length>500||start<0||text.indexOf(q,start+1)>=0)local.push('EVIDENCE_NOT_UNIQUE_EXACT');
  if(!ticker||!/^[A-Z][A-Z0-9]{0,9}(?:[.-][A-Z0-9]{1,5})?$/.test(ticker)||!new RegExp('(^|[^A-Z0-9.])\\$?'+escape(ticker)+'(?=$|[^A-Z0-9.]|\\.(?![A-Z0-9]))').test(q||''))local.push('TICKER_EVIDENCE_INVALID');
  const pid=alias(e.portfolio_label,i.portfolio_catalog),h=headings.filter(h=>h.start<start).at(-1);
  if(!pid||!h||h.pid!==pid||alias(e.portfolio_evidence_quote,i.portfolio_catalog)!==pid||!h.line.includes(e.portfolio_evidence_quote||'')||!e.portfolio_evidence_quote)local.push('PORTFOLIO_SECTION_CONFLICT');
  if(!['HIGH','MEDIUM','LOW'].includes(e.certainty)||!Array.isArray(e.missing_fields)||!Array.isArray(e.ambiguities)||e.missing_fields?.some(x=>typeof x!=='string')||e.ambiguities?.some(x=>typeof x!=='string'))local.push('CERTAINTY_SCHEMA_INVALID');
  if(!['OPEN','ADD','REDUCE','CLOSE','BUY','SELL',null].includes(e.reported_action)||!['OPEN','ADD','REDUCE','CLOSE',null].includes(e.action))local.push('ACTION_SCHEMA_INVALID');
  const resolution=actionFromEvidence(typeof q==='string'?q:'',ticker||''),action=resolution.action;
  if(e.action&&action&&e.action!==action)local.push('ACTION_EVIDENCE_CONFLICT');
  if(e.certainty!=='HIGH')local.push('LOW_CONFIDENCE');
  const missing=(Array.isArray(e.missing_fields)?e.missing_fields:[]).filter(x=>!['action','reported_action','company_name','announcement_date','announcement_timestamp'].includes(x));
  if(missing.length||!Array.isArray(e.ambiguities)||e.ambiguities.length)local.push('UNRESOLVED_MODEL_FIELDS');
  for(const [f,valid] of [['announcement_date',v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v],['announcement_timestamp',v=>Number.isFinite(Date.parse(v))]])if(e[f]!==null&&(typeof e[f]!=='string'||!valid(e[f])||!text.includes(e[f])))local.push('DATE_EVIDENCE_INVALID');
  const md=e.reported_metadata;
  if(md!==null){
   if(typeof md!=='object'||canon(Object.keys(md).sort())!==canon(['allocation_percent','currency_code','currency_symbol','transaction_price']))local.push('METADATA_SCHEMA_INVALID');
   else {
    if(md.allocation_percent!==null&&(!Number.isFinite(md.allocation_percent)||md.allocation_percent<0||md.allocation_percent>100||!new RegExp('(^|[^0-9.])'+escape(md.allocation_percent)+'\\s*%').test(q)))local.push('ALLOCATION_EVIDENCE_INVALID');
    if(md.transaction_price!==null&&(!Number.isFinite(md.transaction_price)||md.transaction_price<0||!new RegExp('(?:[$€£]\\s*|at\\s+)'+escape(md.transaction_price)+'(?:0*)'+'(?=$|[^0-9.]|\\.(?![0-9]))').test(q)))local.push('PRICE_EVIDENCE_INVALID');
    if(md.currency_symbol!==null&&(!['$','€','£'].includes(md.currency_symbol)||!q.includes(md.currency_symbol)))local.push('CURRENCY_EVIDENCE_INVALID');
    if(md.currency_code!==null&&(typeof md.currency_code!=='string'||!new RegExp('\\b'+escape(md.currency_code)+'\\b').test(q)))local.push('CURRENCY_CODE_UNSUPPORTED');
   }
  }
  const c={...copy(e),ticker,company_name:e.company_name&&text.includes(e.company_name)?e.company_name:null,action,reported_action:e.reported_action,portfolio_id:pid,portfolio_evidence:h?{quote:e.portfolio_evidence_quote,start:text.indexOf(e.portfolio_evidence_quote,h.start),end:text.indexOf(e.portfolio_evidence_quote,h.start)+e.portfolio_evidence_quote.length}:null,candidate_type:action?'TRADE_EVENT':'POSITION_OBSERVATION',evidence_start:start,evidence_end:start+(q?.length||0),resolution,missing_fields:missing,issues:local};
  candidates.push(c);issues.push(...local);
 }
 candidates.sort((a,b)=>a.evidence_start-b.evidence_start||String(a.ticker).localeCompare(String(b.ticker)));
 if(new Set(candidates.map(c=>c.evidence_start+'|'+c.portfolio_id+'|'+c.ticker)).size!==candidates.length)issues.push('DUPLICATE_CANDIDATE');
 for(const x of m.non_trade_mentions){if(!x||canon(Object.keys(x).sort())!==canon(['evidence_quote','reason','ticker'])||typeof x.evidence_quote!=='string'||!text.includes(x.evidence_quote)||typeof x.reason!=='string'||typeof x.ticker!=='string'||!x.evidence_quote.includes(x.ticker))issues.push('MENTION_EVIDENCE_INVALID');else mentions.push(copy(x));}
 if(m.classification==='NO_TRADE'&&candidates.length)issues.push('NO_TRADE_WITH_CANDIDATES');
 for(const line of text.split('\n'))if(/\b(opened|reopened|initiated|bought|purchased|added|increased|reduced|trimmed|sold|closed)\b/i.test(line)||/^\s*\d+(?:\.\d+)?\s*%\s+[A-Z][A-Z0-9.]+\s+at\s+/.test(line)){if(!candidates.some(c=>line.includes(c.evidence_quote))&&!mentions.some(c=>line.includes(c.evidence_quote)))issues.push('POSSIBLE_UNEXTRACTED_ACTIVITY');}
 if(m.uncertainties.length)issues.push('MODEL_UNCERTAINTY');
 if(i.origin.group_id!==GROUP||!i.origin.post_id||i.origin.item_key!==GROUP+'/'+i.origin.post_id||i.origin.canonical_url!=='https://substack.com/chat/group/'+GROUP+'/post/'+i.origin.post_id)issues.push('POST_IDENTITY_REQUIRED_FOR_WRITE');
 output.observations=candidates.filter(c=>!c.action);
 output.validation.evidence_valid=issues.length===0;
 if(!candidates.length&&!issues.length&&m.classification==='NO_TRADE'){output.classification='NO_TRADE';output.review_required=false;return output;}
 if(candidates.length&&!issues.length&&!output.observations.length){
  candidates.forEach((c,n)=>events.push({...c,event_index:n,event_id:sha('live-event-v1|'+i.source_id+'|'+i.origin.item_key+'|'+n),normalized_action:c.action,announced_at:c.announcement_timestamp,effective_at:c.announcement_timestamp||i.received_at,time_basis:c.announcement_timestamp?'EXPLICIT_TIMESTAMP':'MESSAGE_RECEIVED_AT'}));
  output.classification='VALID_TRADE';output.validation.eligible_for_position_manager=true;output.review_required=false;output.live_review_only=false;
 }else output.classification=output.validation.schema_valid?'UNCERTAIN':'INVALID';
 return output;
}
function managerGate(i,a){guard(i);if(a?.classification!=='VALID_TRADE'||!a.validation?.eligible_for_position_manager||a.review_required||canon(a)!==canon(analyze(i,a.extraction)))fail('LIVE_ANALYSIS_REVALIDATION_FAILED');return true;}
function plan(i,a,db,ctx,M,legacy){
 managerGate(i,a);const H=M.H2,t=M.baseline.tables(db),logs=t['Processing Log'],history=t['Trade History'],id='message:'+i.message_key,matching=logs.filter(r=>r.record_id===id);
 if(matching.length>1)fail('DUPLICATE_LOG_ROWS');const log=matching[0];
 const clean=o=>{const x=copy(o);delete x._row;return x;};
 const write=(table,value,old,label)=>{const values=[M.row(value,table)];if(!old)return {done:false,label,table,append:true,values,api_url:'https://sheets.googleapis.com/v4/spreadsheets/'+SID+'/values/'+encodeURIComponent("'"+table+"'!A:"+String.fromCharCode(64+H[table].length))+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',body:{majorDimension:'ROWS',values}};return {done:false,label,table,row:old._row,values,body:{valueInputOption:'RAW',data:[{range:"'"+table+"'!A"+old._row+':'+String.fromCharCode(64+H[table].length)+old._row,values}]}};};
 const base=()=>({...Object.fromEntries(H['Processing Log'].map(k=>[k,''])),record_id:id,record_type:'MESSAGE',message_key:i.message_key,gmail_message_id:i.gmail_message_id,source_id:i.source_id,received_at:i.received_at,content_hash:sha(i.normalized_text),origin_ref:i.origin.canonical_url,operation_id:sha('op-v2|real|'+i.source_id+'|'+i.origin.item_key),stage:'PREPARED',status:'PROCESSING',notification_json:canon({status:'SUPPRESSED',sent:false}),attempt_count:1,execution_id:ctx.execution_id,created_at:ctx.now,updated_at:ctx.now,schema_version:'2.1',dataset_id:'real'});
 const review=code=>{if(log&&['REVIEW','BLOCKED'].includes(log.status))return {done:true,status:log.status,reason:log.error_code,message_key:i.message_key};return write('Processing Log',{...(log?clean(log):base()),status:'REVIEW',stage:'STATE_REVIEW',error_category:'STATE_OR_INTEGRITY',error_code:code,error_summary:'Automatic update stopped; review evidence and recorded history.',review_json:canon({required:true,reason:code,policy_version:POLICY}),analysis_checkpoint_json:log?.analysis_checkpoint_json||canon({version:'live-manager-review-3.0',input:i,analysis:a}),updated_at:ctx.now},log,'REVIEW');};
 try{
  if(log&&['REVIEW','BLOCKED'].includes(log.status))return review(log.error_code);
  const src=t.Sources.filter(s=>s.dataset_id==='real'&&s.source_id===i.source_id);if(src.length!==1||!['true',true].includes(src[0].enabled)||src[0].content_policy!=='AUTHOR_APPROVED_LIVE'||JSON.parse(src[0].source_rules_json||'{}').automatic_position_updates!==true||JSON.parse(src[0].source_rules_json||'{}').interpretation_policy!==POLICY)fail('LIVE_SOURCE_AUTOMATION_DISABLED');
  if(canon(JSON.parse(src[0].portfolios_json))!==canon(i.portfolio_catalog))fail('SOURCE_PORTFOLIO_CONFIG_CHANGED');
  const baselines=M.baseline.committed(logs,t.Sources);let state=M.fold(history,ctx.now,legacy,logs,t.Sources),cp;
  if(!log){
   const previous=logs.filter(l=>l.record_type==='MESSAGE'&&l.dataset_id==='real'&&l.source_id===i.source_id&&l.origin_ref===i.origin.canonical_url&&l.message_key!==i.message_key&&l.status!=='DUPLICATE');
   if(previous.length){if(previous.length!==1||previous[0].content_hash!==sha(i.normalized_text))fail('POST_CONTENT_CHANGED');if(previous[0].status!=='COMPLETE')fail('ORIGIN_OPERATION_INCOMPLETE');return write('Processing Log',{...base(),status:'DUPLICATE',stage:'DONE',progress_json:canon({duplicate_of:previous[0].record_id}),completed_at:ctx.now},null,'DUPLICATE');}
   if(history.some(e=>e.message_key===i.message_key))fail('HISTORY_WITHOUT_CHECKPOINT');
   const made=[];
   for(const e of a.events){const k=M.key('real',i.source_id,e.portfolio_id,e.ticker),p=state[k],b=p?._baseline;
    if(e.action==='OPEN'&&p?.status==='OPEN')fail('CONTRADICTORY_OPEN_WHILE_HELD');
    if(e.action!=='OPEN'&&(!p||p.status!=='OPEN'))fail(p?'CONTRADICTORY_ACTION_WHILE_CLOSED':'MISSING_BASELINE');
    if(p?.latest_effective_at&&Date.parse(e.effective_at)<Date.parse(p.latest_effective_at))fail('LATE_EVENT_REVIEW');
    const r={event_id:e.event_id,operation_id:base().operation_id,message_key:i.message_key,source_id:i.source_id,position_key:k,event_index:e.event_index,ticker:e.ticker,company_name:e.company_name||'',action:e.action,announcement_date:e.announcement_date||'',announced_at:e.announced_at||'',effective_at:e.effective_at,time_basis:e.time_basis,accepted_at:ctx.now,evidence_json:canon({quote:e.evidence_quote,start:e.evidence_start,end:e.evidence_end,portfolio:e.portfolio_evidence,reported_action:e.reported_action,normalization:{action:e.action,resolution:e.resolution,coverage:{complete:false,basis:'LATEST_REPORTED_STATE_NOT_VERIFIED_TRANSACTION_HISTORY',reason:'GMAIL_MAY_OMIT_CHAT_REPLIES'}},baseline_ref:b?{record_id:b.record_id,snapshot_hash:b.snapshot_hash}:null}),cycle_id:e.action==='OPEN'?sha('cycle-v2|'+e.event_id):p.cycle_id,previous_event_id:p?.last_event_id||'',analysis_version:POLICY,review_id:i.owner_confirmation?.review_id||'',schema_version:'2.1',dataset_id:'real',portfolio_id:e.portfolio_id,origin_item_key:i.origin.item_key,reported_metadata_json:e.reported_metadata?canon(e.reported_metadata):''};r.payload_hash=M.eventHash(r);made.push(r);state=M.fold(history.concat(made),ctx.now,legacy,logs,t.Sources);
   }
   const keys=[...new Set(made.map(e=>e.position_key))];cp={version:'live-manager-3.0',input_hash:sha(canon(i)),analysis_hash:sha(canon(a)),input:i,analysis:a,events:made,keys,baseline_hash:sha(canon(baselines)),base_history_hash:sha(canon(history.filter(e=>keys.includes(e.position_key)).map(clean)))};
   for(const other of logs.filter(l=>l.record_type==='MESSAGE'&&l.dataset_id==='real'&&!['COMPLETE','DUPLICATE'].includes(l.status))){let prior;try{prior=JSON.parse(other.analysis_checkpoint_json||'{}');}catch{fail('OTHER_CHECKPOINT_CORRUPT');}if((prior.keys||prior.events?.map(e=>e.position_key)||[]).some(k=>keys.includes(k)))fail('PRIOR_POSITION_OPERATION_UNFINISHED');}
   if(canon(cp).length>45000)fail('CHECKPOINT_TOO_LARGE');return write('Processing Log',{...base(),analysis_checkpoint_json:canon(cp)},null,'CHECKPOINT');
  }
  if(log.status==='DUPLICATE')return {done:true,status:'DUPLICATE',message_key:i.message_key};
  cp=JSON.parse(log.analysis_checkpoint_json);if(cp.version!=='live-manager-3.0'||cp.input_hash!==sha(canon(i))||cp.analysis_hash!==sha(canon(a))||cp.baseline_hash!==sha(canon(baselines)))fail('FROZEN_INPUT_CONFLICT');
  const ids=new Set(cp.events.map(e=>e.event_id));if(log.status!=='COMPLETE'&&cp.base_history_hash!==sha(canon(history.filter(e=>cp.keys.includes(e.position_key)&&!ids.has(e.event_id)).map(clean))))fail('STALE_PREFLIGHT_STATE');
  if(log.status!=='COMPLETE'&&log.execution_id!==ctx.execution_id){if(Number(log.attempt_count)>=3)fail('ATTEMPT_LIMIT');return write('Processing Log',{...clean(log),attempt_count:Number(log.attempt_count)+1,execution_id:ctx.execution_id,updated_at:ctx.now},log,'ATTEMPT');}
  for(const e of cp.events){const same=history.filter(x=>x.event_id===e.event_id);if(same.length>1||same.some(x=>canon(clean(x))!==canon(e)))fail('EVENT_PAYLOAD_CONFLICT');if(!same.length){if(log.status==='COMPLETE')fail('COMPLETE_HISTORY_MISSING');return write('Trade History',e,null,'HISTORY');}}
  state=M.fold(history,ctx.now,legacy,logs,t.Sources);
  for(const k of cp.keys){const expected=M.baseline.project(state[k]),ps=t['Current Positions'].filter(p=>p.position_key===k);if(ps.length>1)fail('DUPLICATE_POSITION_ROWS');if(!ps.length||!M.baseline.equalPosition(ps[0],expected))return write('Current Positions',expected,ps[0],'PROJECTION');}
  if(log.status!=='COMPLETE')return write('Processing Log',{...clean(log),status:'COMPLETE',stage:'DONE',updated_at:ctx.now,completed_at:ctx.now,progress_json:canon({event_ids:cp.events.map(e=>e.event_id),projection_verified:true,policy_version:POLICY})},log,'COMPLETE');
  return {done:true,status:ctx.was_complete?'DUPLICATE':'COMPLETE',message_key:i.message_key,event_ids:cp.events.map(e=>e.event_id),positions:cp.keys.map(k=>M.baseline.project(state[k])),notifications:'SUPPRESSED'};
 }catch(e){return review(String(e.message));}
}
module.exports={POLICY,guard,analyze,managerGate,plan,actionFromEvidence,canon,sha};
