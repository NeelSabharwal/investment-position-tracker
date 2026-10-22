'use strict';
const crypto=require('crypto');
const LOCK_ID=73015001,LOCK_KEY='ipt_writer_lock_v1';
const WRITERS=['6oUxCXrJa2EiqgEn','dVNGCbyQwSKhrfee'];
function owner(workflowId,executionId,now){const v=JSON.stringify({version:1,owner:crypto.randomUUID(),workflow_id:workflowId,execution_id:String(executionId),created_at:now});if(!validOwner(v))throw Error('INVALID_WRITER_IDENTITY');return v;}
function validOwner(v){try{const o=JSON.parse(v);return o.version===1&&WRITERS.includes(o.workflow_id)&&/^\d+$/.test(o.execution_id)&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(o.owner)&&Number.isFinite(Date.parse(o.created_at));}catch{return false;}}
function bodyOf(r){let b=r?.body??r;try{if(b?._readableState?.buffer)b=Buffer.concat(b._readableState.buffer.map(x=>Buffer.from(x.data??x))).toString('utf8');return typeof b==='string'?JSON.parse(b):b;}catch{return {};}}
function create(v){if(!validOwner(v))throw Error('INVALID_WRITER_IDENTITY');return {requests:[{createDeveloperMetadata:{developerMetadata:{metadataId:LOCK_ID,metadataKey:LOCK_KEY,metadataValue:v,visibility:'DOCUMENT',location:{spreadsheet:true}}}}]};}
function owns(r,v){const b=bodyOf(r);return validOwner(v)&&!r?.error&&(!r?.statusCode||r.statusCode===200)&&b?.metadataId===LOCK_ID&&b.metadataKey===LOCK_KEY&&b.metadataValue===v&&b.visibility==='DOCUMENT'&&b.location?.spreadsheet===true;}
function release(v){if(!validOwner(v))throw Error('INVALID_WRITER_IDENTITY');return {requests:[{deleteDeveloperMetadata:{dataFilter:{developerMetadataLookup:{metadataId:LOCK_ID,metadataKey:LOCK_KEY,metadataValue:v,visibility:'DOCUMENT'}}}}]};}
function released(r,v){const ds=bodyOf(r)?.replies?.[0]?.deleteDeveloperMetadata?.deletedDeveloperMetadata||[];return !r?.error&&(!r?.statusCode||r.statusCode===200)&&ds.length===1&&ds[0].metadataId===LOCK_ID&&ds[0].metadataValue===v;}
module.exports={LOCK_ID,LOCK_KEY,WRITERS,owner,validOwner,bodyOf,create,owns,release,released};
