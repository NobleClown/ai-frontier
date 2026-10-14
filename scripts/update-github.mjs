import {writeFile,mkdir} from 'node:fs/promises';
import {fetchPublicPage} from './public-fetch.mjs';
import {archiveRankings} from './github-history.mjs';
import {readGithubFeed,monthlyBoardFromFeed} from './github-manual-feed.mjs';
const headers={'User-Agent':'AI-Frontier-local','Accept':'application/vnd.github+json'};
const clean=s=>s.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const linkCount=s=>Number(clean(s.slice(s.indexOf('>')+1)).replace(/[^0-9]/g,''))||0;
const definitions=[['total','总榜','公开、未归档仓库按累计 Star 排序'],['daily','日榜','GitHub Trending · 今日'],['weekly','周榜','GitHub Trending · 本周'],['monthly','趋势榜','GitHub Trending · 本月；不是本站计算的涨幅榜']];
let previous={boards:[]};try{previous=JSON.parse(await (await import('node:fs/promises')).readFile(new URL('../data/github-rankings.json',import.meta.url),'utf8'));}catch{}
const boards=[];
await archiveRankings(previous);
for(const [id,title,description] of definitions){
 try{
 if(id==='monthly'){
  try{boards.push(monthlyBoardFromFeed(await readGithubFeed(),previous.boards.find(b=>b.id===id)));}
  catch(error){if(error.code==='ENOENT')throw Error('等待人工提供官方月榜快照（见 GITHUB-TRENDING-CONTRACT.md）');throw error;}
  continue;
 }
 const url=id==='total'?'https://api.github.com/search/repositories?q=stars:%3E10000+archived:false&sort=stars&order=desc&per_page=20':id==='daily'?'https://github.com/trending':`https://github.com/trending?since=${id==='weekly'?'weekly':'monthly'}`;
 const response=id==='total'?await fetch(url,{headers,signal:AbortSignal.timeout(25000)}):await fetchPublicPage(url,headers);if(!response.ok)throw Error(`HTTP ${response.status}（不绕过限制）`);
 let projects;
 if(id==='total'){const data=await response.json();projects=data.items.map(r=>({name:r.full_name,url:r.html_url,description:r.description||'',language:r.language||'',stars:r.stargazers_count,forks:r.forks_count,growth:''}));}
 else {const html=await response.text();projects=[...html.matchAll(/<article\b[^>]*class="[^"]*Box-row[^"]*"[^>]*>([\s\S]*?)<\/article>/g)].map(([,row])=>{const name=row.match(/<h2\b[\s\S]*?href="\/([^"?#]+)"/)?.[1];if(!name)return null;const star=row.match(new RegExp('href="/'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/stargazers"[\\s\\S]*?</a>'))?.[0]||'';return {name,url:'https://github.com/'+name,description:clean(row.match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1]||''),language:clean(row.match(/itemprop="programmingLanguage"[^>]*>([^<]*)/)?.[1]||''),stars:linkCount(star),forks:null,growth:clean(row.match(/([\d,]+)\s+stars\s+(today|this week|this month)/)?.[0]||'')};}).filter(Boolean);}
 if(!projects.length)throw Error('来源未返回可解析项目');
 boards.push({id,title,description,sourceUrl:url,updatedAt:new Date().toISOString(),error:null,projects});
 }catch(e){const old=previous.boards.find(b=>b.id===id);boards.push({...old,id,title,description,sourceUrl:id==='total'?'https://github.com/search?q=stars%3A%3E10000&type=repositories&s=stars&o=desc':id==='daily'?'https://github.com/trending':`https://github.com/trending?since=${id==='weekly'?'weekly':'monthly'}`,updatedAt:old?.updatedAt||null,projects:old?.projects||[],error:'本次获取失败：'+e.message});}
 if(id!=='monthly')await new Promise(resolve=>setTimeout(resolve,1000));
}
await mkdir(new URL('../data/',import.meta.url),{recursive:true});
const snapshot={checkedAt:new Date().toISOString(),boards};
await writeFile(new URL('../data/github-rankings.json',import.meta.url),JSON.stringify(snapshot,null,2)+'\n');
await archiveRankings(snapshot);
console.log(boards.map(b=>({board:b.id,count:b.projects.length,error:b.error})));

