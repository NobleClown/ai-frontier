import {readFile} from 'node:fs/promises';
export const githubTrendingSources={daily:'https://github.com/trending?since=daily',weekly:'https://github.com/trending?since=weekly',monthly:'https://github.com/trending?since=monthly'};
const titles={daily:'日榜',weekly:'周榜',monthly:'趋势榜'};
const periods=new Set(Object.keys(githubTrendingSources));
function fail(message){throw new Error('GitHub Trending 交接：'+message);}
export function validateGithubFeed(feed,now=Date.now()){
 if(feed?.schemaVersion!==2||feed.retrievalMethod!=='user_visible_browser'||feed.account!=='github.com'||!Array.isArray(feed.boards)||!feed.boards.length||feed.boards.length>3)fail('版本、采集方式或来源不匹配');
 const seenPeriods=new Set();
 for(const board of feed.boards){
  if(!periods.has(board.period)||seenPeriods.has(board.period)||board.sourceUrl!==githubTrendingSources[board.period])fail('榜单周期或对应官方页面 URL 不匹配');
  seenPeriods.add(board.period);
  if(typeof board.capturedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(board.capturedAt)||!Number.isFinite(Date.parse(board.capturedAt))||Date.parse(board.capturedAt)>now)fail(`${board.period} 必须提供实际采集时间，含时区且不能在未来`);
  if(!Array.isArray(board.projects)||board.projects.length<3||board.projects.length>25)fail(`${board.period} 按官方顺序提供 3–25 个项目`);
  const names=new Set();
  for(const [index,p] of board.projects.entries()){
   if(p.rank!==index+1||!/^[-\w.]+\/[-\w.]+$/.test(p.name||'')||names.has(p.name.toLowerCase())||p.url!==`https://github.com/${p.name}`)fail(`${board.period} 排名、仓库名、重复项目或链接不合法`);
   names.add(p.name.toLowerCase());
   for(const key of ['description','language','growth'])if(typeof p[key]!=='string'||p[key].length>2000)fail(`${p.name} 的 ${key} 必须是简短文本`);
   if(p.stars!==null&&(!Number.isSafeInteger(p.stars)||p.stars<0))fail('stars 必须是真实精确整数或 null');
   if(p.starsDisplay!==undefined&&(typeof p.starsDisplay!=='string'||p.starsDisplay.length>30))fail('starsDisplay 格式错误');
  }
 }
 return feed;
}
export function githubBoardFromFeed(input,old,now=Date.now()){
 if(!periods.has(input.period))fail('未知榜单周期');
 const feed=validateGithubFeed({schemaVersion:2,retrievalMethod:'user_visible_browser',account:'github.com',boards:[input]},now);
 const item=feed.boards[0];
 if(old?.updatedAt&&Date.parse(item.capturedAt)<=Date.parse(old.updatedAt))return {...old,error:null};
 return {id:item.period,title:titles[item.period],description:item.period==='monthly'?'GitHub Trending · 本月；不是本站计算的涨幅榜':`GitHub Trending · ${item.period==='daily'?'今日':'本周'}`,sourceUrl:item.sourceUrl,updatedAt:item.capturedAt,acquisitionMethod:'user_visible_browser',error:null,projects:item.projects.map(p=>({name:p.name,url:p.url,description:p.description,language:p.language,stars:p.stars,starsDisplay:p.starsDisplay||'',forks:null,growth:p.growth}))};
}
export async function readGithubFeed(){
 return JSON.parse((await readFile(new URL('../data/inbox/github-trending-feed.json',import.meta.url),'utf8')).replace(/^\uFEFF/,''));
}
