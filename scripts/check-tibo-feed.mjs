import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

function requireThat(ok,message){if(!ok)throw Error(message);}
function fields(value,allowed,label){requireThat(value&&typeof value==='object'&&!Array.isArray(value),`${label} 必须为对象`);for(const key of Object.keys(value))requireThat(allowed.includes(key),`${label} 含未约定字段：${key}`);}
function iso(value){
 if(typeof value!=='string')return false;
 const match=value.match(/^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/);
 if(!match||!Number.isFinite(Date.parse(value)))return false;
 const [,year,month,day]=match.map(Number);
 return month>=1&&month<=12&&day>=1&&day<=new Date(Date.UTC(year,month,0)).getUTCDate();
}
function post(value,main){
 fields(value,['id','url','author','text','publishedAt','publishedAtPrecision','publishedAtDisplay',...(main?['quotedPosts']:[])],'post');
 requireThat(typeof value.author==='string'&&/^[A-Za-z0-9_]{1,15}$/.test(value.author),'author 必须为账号 handle，不含 @');
 if(main)requireThat(value.author==='thsottiaux','本人帖文 author 必须为 thsottiaux');
 requireThat(typeof value.id==='string'&&/^\d+$/.test(value.id),'id 必须为数字字符串');
 requireThat(value.url===`https://x.com/${value.author}/status/${value.id}`,'url、作者与 id 不匹配');
 requireThat(typeof value.text==='string'&&value.text.trim().length>0&&value.text.length<=16000,'text 必须是非空完整原文，最多 16000 字符');
 requireThat(typeof value.publishedAtDisplay==='string'&&value.publishedAtDisplay.length<=200,'需提供 publishedAtDisplay，可为空字符串');
 requireThat(['unknown','minute','second'].includes(value.publishedAtPrecision),'publishedAtPrecision 无效');
 if(value.publishedAt===null)requireThat(value.publishedAtPrecision==='unknown','未知绝对时间需标注 unknown');
 else{
  requireThat(iso(value.publishedAt),'publishedAt 必须为带时区的有效 ISO 时间或 null');
  requireThat(value.publishedAtPrecision!=='unknown','已知绝对时间需注明精度');
  if(value.publishedAtPrecision==='minute')requireThat(new Date(value.publishedAt).getUTCSeconds()===0,'分钟精度的秒必须为 00');
 }
 if(main&&value.quotedPosts!==undefined){requireThat(Array.isArray(value.quotedPosts)&&value.quotedPosts.length<=10,'quotedPosts 最多 10 条');for(const quote of value.quotedPosts)post(quote,false);}
}
export function validateTiboFeed(data){
 fields(data,['schemaVersion','account','profileUrl','fetchedAt','status','retrievalMethod','error','posts'],'feed');
 requireThat(data.schemaVersion===1&&data.account==='thsottiaux'&&data.profileUrl==='https://x.com/thsottiaux','schemaVersion / account / profileUrl 不符合约定');
 requireThat(iso(data.fetchedAt)&&Date.parse(data.fetchedAt)<=Date.now()+300000,'fetchedAt 必须为实际 ISO 时间，不能晚于当前时间超过 5 分钟');
 requireThat(['ok','source_unavailable'].includes(data.status),'status 无效');
 requireThat(['direct_browser_text','direct_http_text','manual_copy','third_party'].includes(data.retrievalMethod),'retrievalMethod 无效');
 requireThat(data.error===null||(typeof data.error==='string'&&data.error.length<=2000),'error 必须为字符串或 null');
 requireThat(Array.isArray(data.posts)&&data.posts.length<=50,'posts 必须为数组，最多 50 条');
 if(data.status==='source_unavailable')requireThat(data.posts.length===0&&typeof data.error==='string'&&data.error.trim(),'失败记录需说明原因并保持 posts 为空');
 const urls=new Set();for(const item of data.posts){post(item,true);requireThat(!urls.has(item.url),'posts 存在重复原帖 URL');urls.add(item.url);}
 return data;
}
export async function readTiboFeed(){
 const raw=await readFile(new URL('../data/inbox/tibo-feed.json',import.meta.url),'utf8');
 requireThat(Buffer.byteLength(raw)<=1024*1024,'交接文件超过 1 MB');
 return validateTiboFeed(JSON.parse(raw.replace(/^\uFEFF/,'')));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{const feed=await readTiboFeed();console.log(JSON.stringify({valid:true,status:feed.status,posts:feed.posts.length,fetchedAt:feed.fetchedAt,stale:Date.now()-Date.parse(feed.fetchedAt)>3*3600000,method:feed.retrievalMethod}));}
 catch(error){console.error('交接文件校验失败：'+error.message);process.exitCode=1;}
}
