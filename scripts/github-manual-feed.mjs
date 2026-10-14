import {readFile} from 'node:fs/promises';
export const monthlySource='https://github.com/trending?since=monthly';
export function validateGithubFeed(feed,now=Date.now()){
 const fail=message=>{throw new Error('人工月榜交接：'+message);};
 if(feed?.schemaVersion!==1||feed.retrievalMethod!=='manual_browser_copy'||feed.period!=='monthly'||feed.sourceUrl!==monthlySource)fail('版本、采集方式或官方月榜来源不匹配');
 if(typeof feed.capturedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(feed.capturedAt)||!Number.isFinite(Date.parse(feed.capturedAt))||Date.parse(feed.capturedAt)>now)fail('需提供实际采集时间，含时区且不能在未来');
 if(!Array.isArray(feed.projects)||feed.projects.length<3||feed.projects.length>25)fail('按官方顺序提供 3–25 个项目');
 const names=new Set();
 for(const [index,p] of feed.projects.entries()){
  if(p.rank!==index+1||!/^[-\w.]+\/[-\w.]+$/.test(p.name||'')||names.has(p.name.toLowerCase())||p.url!==`https://github.com/${p.name}`)fail('排名、仓库名、重复项目或链接不合法');
  names.add(p.name.toLowerCase());
  for(const key of ['description','language','growth'])if(typeof p[key]!=='string'||p[key].length>2000)fail(`${p.name} 的 ${key} 必须是简短文本`);
  if(p.stars!==null&&(!Number.isSafeInteger(p.stars)||p.stars<0))fail('stars 必须是真实精确整数或 null');
  if(p.starsDisplay!==undefined&&(typeof p.starsDisplay!=='string'||p.starsDisplay.length>30))fail('starsDisplay 格式错误');
 }
 return feed;
}
export function monthlyBoardFromFeed(feed,old,now=Date.now()){
 validateGithubFeed(feed,now);
 if(old?.updatedAt&&Date.parse(feed.capturedAt)<=Date.parse(old.updatedAt))return {...old,error:null};
 return {id:'monthly',title:'趋势榜',description:'GitHub Trending · 本月；不是本站计算的涨幅榜',sourceUrl:monthlySource,updatedAt:feed.capturedAt,acquisitionMethod:'manual_browser_copy',error:null,projects:feed.projects.map(p=>({name:p.name,url:p.url,description:p.description,language:p.language,stars:p.stars,starsDisplay:p.starsDisplay||'',forks:null,growth:p.growth}))};
}
export async function readGithubFeed(){
 return JSON.parse((await readFile(new URL('../data/inbox/github-trending-feed.json',import.meta.url),'utf8')).replace(/^\uFEFF/,''));
}
