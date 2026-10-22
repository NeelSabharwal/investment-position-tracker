'use strict';
const D=require('./discord-core');
const A=require('./interaction-adapter');
const S=require('./analysis-dispatch');
const READ_COMMANDS=['positions','history'];
const TOKEN=/^[A-Za-z0-9._~+\/=-]{20,2048}$/;
const MODE='FICTIONAL_COMMANDS';
const APPROVED_COMMANDS=['positions','history','analyze'];
function transport(code,status){return {route:0,http_status:code,status,ack:{error:status},sent:false,suppressed:true};}
function policy(c){
 return c.endpoint_mode===MODE&&c.fictional_data_only===true&&c.suppress_responses===false&&c.private_read_replies===true&&c.analyze_enabled===true&&c.notifications_enabled===false&&
 c.application_id==='1561105644948430858'&&D.canon(c.guild_ids)==='["1561045409378467900"]'&&D.canon(c.reader_user_ids)==='["1554849344686006403"]'&&c.reader_role_ids?.length===0&&c.analyzer_role_ids?.length===0&&D.canon(c.approved_commands)===D.canon(APPROVED_COMMANDS);
}
function endpointDecision(raw,headers,c,nowMs){
 const auth=D.authorize(raw,headers,c,nowMs);
 if(auth.http_status!==200)return transport(auth.http_status,auth.status);
 if(auth.status==='PING')return ['VERIFY_ONLY',MODE].includes(c.endpoint_mode)?{...auth,delivery_allowed:false}:transport(503,'ENDPOINT_DISABLED');
 if(auth.status!=='AUTHORIZED')return transport(403,auth.status);
 if(c.endpoint_mode==='VERIFY_ONLY')return transport(503,'COMMAND_RESPONSES_NOT_APPROVED');
 if(!policy(c))return transport(503,'READ_REPLY_CONFIGURATION_BLOCKED');
 if(!APPROVED_COMMANDS.includes(auth.command.name))return transport(403,'COMMAND_DISABLED');
 // Only parse again after Ed25519 validation of the original bytes and identity checks.
 const b=JSON.parse(raw.toString('utf8'));
 if(b.data.id!==c.command_ids[auth.command.name]||(b.data.guild_id!==undefined&&b.data.guild_id!==auth.command.guild_id))return transport(403,'COMMAND_REGISTRATION_NOT_ALLOWED');
 if(typeof b.token!=='string'||!TOKEN.test(b.token))return transport(400,'INVALID_INTERACTION_TOKEN');
 return {...auth,status:'PRIVATE_READ_DEFERRED',ack:{type:5,data:{flags:64}},suppressed:false,delivery_allowed:true,delivery:{token:b.token,received_at:nowMs},fixture_data_only:true};
}
function canDeliver(auth,c,mode,nowMs){
 return mode==='production'&&policy(c)&&auth?.route===1&&auth.status==='PRIVATE_READ_DEFERRED'&&auth.delivery_allowed===true&&auth.fixture_data_only===true&&
 auth.ack?.type===5&&auth.ack.data?.flags===64&&auth.command?.application_id===c.application_id&&c.guild_ids.includes(auth.command.guild_id)&&c.reader_user_ids.includes(auth.command.user_id)&&APPROVED_COMMANDS.includes(auth.command.name)&&
 typeof auth.delivery?.token==='string'&&TOKEN.test(auth.delivery.token)&&!auth.delivery.token.startsWith('FICTIONAL')&&Number.isFinite(auth.delivery.received_at)&&nowMs>=auth.delivery.received_at&&nowMs-auth.delivery.received_at<840000;
}
function readPreview(auth,response,ctx,c,headers,allowlist){
 if(!policy(c)||!READ_COMMANDS.includes(auth?.command?.name))return D.output('BLOCKED','This command is disabled.');
 // Existing resolver is a pure suppressed preview renderer; only this adapter may deliver it.
 return A.resolveFictional(auth,response,ctx,{fixture_mode:true,suppress_responses:true},headers,[],allowlist);
}
function makeEdit(auth,response,ctx,c,headers,allowlist,mode){
 if(!canDeliver(auth,c,mode,Date.parse(ctx.now)))return null;
 const preview=auth.command.name==='analyze'?D.output('ANALYSIS_RESULT',S.text(response.analysis_result||{})):readPreview(auth,response,ctx,c,headers,allowlist);
 const permitted=['ANALYSIS_RESULT','READY','UNKNOWN_SOURCE','PAGE_OUT_OF_RANGE','DEPENDENCY_OR_DATA_ERROR'];
 if(!permitted.includes(preview.status)||preview.route!==0||preview.preview?.flags!==64||typeof preview.preview.content!=='string'||preview.preview.content.length>2000)throw Error('PRIVATE_REPLY_GUARD_FAILED');
 return {url:'https://discord.com/api/v10/webhooks/'+c.application_id+'/'+encodeURIComponent(auth.delivery.token)+'/messages/@original',body:{content:preview.preview.content,allowed_mentions:{parse:[]}},command:auth.command.name,interaction_id:auth.command.interaction_id,result_status:preview.status,attempt:1};
}
function responseBody(response){
 let body=response?.body??{};
 try{
  if(body?._readableState?.buffer){const b=body._readableState.buffer;if(!Array.isArray(b))return {};const chunks=b.map(x=>Buffer.from(x?.data??x));if(chunks.reduce((n,b)=>n+b.length,0)>32768)return {};body=Buffer.concat(chunks).toString('utf8');}
  if(typeof body==='string'){if(body.length>32768)return {};body=JSON.parse(body);}
  return body&&typeof body==='object'?body:{};
 }catch(e){return {};}
}
function deliveryOutcome(response,edit,attempt){
 const code=Number(response?.statusCode)||0,b=responseBody(response);
 const success=code===200&&typeof b.id==='string'&&/^[1-9][0-9]{16,19}$/.test(b.id)&&(Number(b.flags)&64)===64&&b.content===edit.body.content;
 const retryable=code===0||code===408||code===429||code>=500&&code<=599;
 let wait=1;
 if(code===429){const h=Object.fromEntries(Object.entries(response.headers||{}).map(([k,v])=>[k.toLowerCase(),v]));const delays=[b.retry_after,h['retry-after']].filter(v=>v!==undefined&&v!==null&&v!=='').map(Number);wait=delays.length&&delays.every(Number.isFinite)?Math.max(1,...delays)+0.1:Infinity;}
 const retry=attempt===1&&!success&&retryable&&wait<=10;
 const result={route:retry?1:0,status:success?'PRIVATE_REPLY_DELIVERED':retry?'RETRY_PRIVATE_EDIT':code===200?'DELIVERY_UNVERIFIED':'PRIVATE_REPLY_UNRESOLVED',command:edit.command,interaction_id:edit.interaction_id,result_status:edit.result_status,http_status:code,attempts:attempt,ephemeral_confirmed:success,manual_review:!success&&!retry};
 if(retry)result.retry_after_seconds=wait;
 return result; // Never copy tokens, URLs, raw response bodies or error strings into audit output.
}
module.exports={MODE,policy,endpointDecision,canDeliver,readPreview,makeEdit,responseBody,deliveryOutcome};
