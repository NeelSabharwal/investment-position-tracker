const MP=require('./multi-portfolio');
const crypto=require('crypto');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const canon=x=>JSON.stringify(x,function(k,v){return v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((a,k)=>(a[k]=v[k],a),{}):v;});
const clone=x=>JSON.parse(JSON.stringify(x));
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

module.exports={sha,canon,clone,tableRows,toRow,fold};
