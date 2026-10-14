const robotCache=new Map();
const agent='AI-Frontier-local';
export function robotsAllows(text,target,agentName=agent){
 const groups=[];let group={agents:[],rules:[]};let hasRules=false;
 for(const line of text.split(/\r?\n/)){
  const clean=line.split('#')[0].trim();const colon=clean.indexOf(':');if(colon<0)continue;
  const key=clean.slice(0,colon).trim().toLowerCase(),value=clean.slice(colon+1).trim();
  if(key==='user-agent'){
   if(hasRules){groups.push(group);group={agents:[],rules:[]};hasRules=false;}
   group.agents.push(value.toLowerCase());
  }else if((key==='allow'||key==='disallow')&&group.agents.length){hasRules=true;if(value)group.rules.push({allow:key==='allow',pattern:value});}
 }
 groups.push(group);
 const specific=groups.filter(g=>g.agents.some(a=>a!=='*'&&agentName.toLowerCase().startsWith(a)));
 const applicable=specific.length?specific:groups.filter(g=>g.agents.includes('*'));
 const rules=applicable.flatMap(g=>g.rules).filter(rule=>{
  const end=rule.pattern.endsWith('$');const pattern=end?rule.pattern.slice(0,-1):rule.pattern;
  const escaped=pattern.split('*').map(part=>part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*');
  return new RegExp('^'+escaped+(end?'$':'')).test(target);
 });
 rules.sort((a,b)=>b.pattern.replace(/[*$]/g,'').length-a.pattern.replace(/[*$]/g,'').length||Number(b.allow)-Number(a.allow));
 return !rules.length||rules[0].allow;
}
export async function fetchPublicPage(url,headers={}){
 const parsed=new URL(url);
 if(!robotCache.has(parsed.origin)){
  const response=await fetch(parsed.origin+'/robots.txt',{headers:{'User-Agent':agent},signal:AbortSignal.timeout(15000)});
  if(response.status===404)robotCache.set(parsed.origin,'');
  else {if(!response.ok)throw new Error(`robots.txt 无法核对（HTTP ${response.status}），停止采集`);robotCache.set(parsed.origin,await response.text());}
 }
 if(!robotsAllows(robotCache.get(parsed.origin),parsed.pathname+parsed.search))throw new Error('robots.txt 禁止采集此页面');
 return fetch(url,{headers:{...headers,'User-Agent':agent},signal:AbortSignal.timeout(25000)});
}
