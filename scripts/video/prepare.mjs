import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {boardChanges,mergeTopProjects} from '../github-history.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const date=process.argv[2]||new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date());
if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Use YYYY-MM-DD');
const read=async file=>JSON.parse((await readFile(path.join(root,file),'utf8')).replace(/^\uFEFF/,''));
let edition;try{edition=await read(`data/editions/${date}.json`);}catch(error){if(error.code!=='ENOENT')throw error;edition={date,stories:[]};}
const rankings=await read('data/github-rankings.json');
const notes=await read('data/video-project-notes.json');
const guides=await read('data/github-guides.json');
let previous=null;
try{for(const file of (await readdir(path.join(root,'data/github-history'))).sort().reverse()){const candidate=await read('data/github-history/'+file);if(candidate.checkedAt<rankings.checkedAt){previous=candidate;break;}}}catch(error){if(error.code!=='ENOENT')throw error;}
const changes=rankings.boards.map(board=>({id:board.id,...boardChanges(previous?.boards.find(b=>b.id===board.id),board)}));
const scenes=[];
const add=(id,section,heading,lines,narration,extra={})=>scenes.push({id,section,heading,lines,narration,...extra});
add('intro','AI FRONTIER / DAILY VIDEO',`${date} · AI 与开源快报`,['当天新闻','榜单变化','日榜与月榜前三 · 重复合并'],'今天的人工智能与开源快报。先看当天新闻，再看榜单变化和两个榜单的前三名。',{icon:'agents'});
const news=edition.stories.filter(story=>story.publishedDate===date);
const videoTitles={
 'openai-gpt4-deprecation-20261014':'OpenAI 部分 GPT-4 API 模型计划退役',
 'yuanbao-search-mcp-20261014':'元宝搜索 MCP 更新，支持智能体联网检索',
};
if(!news.length)add('news-none','01 / 当天新闻','今天暂无已确认的新消息',['不拿前几天的消息充当今日首发'],'今天暂时没有核实到新的模型消息，我们直接看开源项目。');
else for(const [index,story] of news.slice(0,3).entries()){
 const sentences=story.summary.match(/[^。！？]+[。！？]?/gu)||[story.summary];
 let short=sentences[0];
 if(short.length>170)short=story.title+'。详情和适用条件见原文。';
 else if(sentences[1]&&short.length+sentences[1].length<=170)short+=sentences[1];
 add('news-'+index,'01 / 当天新闻',videoTitles[story.id]||story.title,[short,story.takeaway],short,{source:story.source,sourceUrl:story.url,sourceDate:story.publishedDate,icon:'docs'});
}
const limited=rankings.boards.filter(board=>['daily','monthly'].includes(board.id)&&board.error);
const totalChange=changes.find(c=>c.id==='total');
const newTotal=totalChange?.entries.filter(entry=>entry.previousRank===null).length||0;
let overview,overviewLines;
if(limited.length){overview='总榜已经刷新。日榜和月榜受到来源访问规则限制，保留上次快照，不把旧排名说成今天涨跌。';overviewLines=['总榜：'+(totalChange?.status==='comparable'?`前 20 名新增 ${newTotal} 个项目`:'没有可比历史'),...limited.map(b=>`${b.title}：沿用 ${b.updatedAt?.slice(0,10)||'未知日期'} 快照`),'新采集失败，不推算排名变化'];}
else if(!previous){overview='首次保存榜单基线，今天只介绍当前排名，不推算昨天到今天的变化。';overviewLines=['首次保存历史快照','日榜与月榜前三分别选取','未来可对比上榜、离榜与排名升降'];}
else{const movements=changes.filter(c=>['daily','monthly'].includes(c.id));overviewLines=movements.map(c=>`${c.id==='daily'?'日榜':'月榜'}：${c.status==='same_snapshot'?'来源快照未更新':c.status==='no_baseline'?'缺少可比基线':`新上榜 ${c.entries.filter(e=>e.previousRank===null).length} 个，排名变化 ${c.entries.filter(e=>e.rankGain!==null&&e.rankGain!==0).length} 个`}`);overview='先看名单变化。'+overviewLines.join('。')+'。排名依据各次快照，不等于按新增星标简单排序。';}
add('changes','02 / 榜单变化','先看变化，再看热门项目',overviewLines,overview,{icon:'chart'});
const projects=mergeTopProjects(rankings.boards);
for(const [index,project] of projects.entries()){
 const note=notes[project.name];
 const label=project.boards.map(b=>`${b.id==='daily'?'日榜':'月度趋势榜'} #${b.rank}`).join(' · ');
 const growth=project.boards.map(b=>`${b.id==='daily'?'当日':'当月'}新增 ${b.growth.match(/[\d,]+/)?.[0]||'未提供'} 星`).join(' / ');
 const purpose=note?.purpose||guides[project.name]||'中文用途待核对，请查看官方仓库。';
 add('project-'+index,'03 / '+label,note?.heading||project.name,[purpose,`热度依据：${growth}`,`怎么试：${note?.trial||'打开官方 README，先看安装与示例。'}`],note?.narration||`这个项目的用途是，${purpose}。它出现在${label}。可以先打开官方说明，核对环境要求与示例。本期尚未实际运行。`,{repository:project.name,source:'GitHub · 仓库 README 与榜单快照',sourceUrl:note?.source||project.url+'#readme',sourceDate:project.boards.map(b=>b.updatedAt?.slice(0,10)).join(' / '),icon:note?.icon||'code',boards:project.boards});
}
add('outro','AI FRONTIER / END','把来源和上手方式留下',['原始来源见投稿简介','模型费用与安装条件分别核对','AI 生成配音与摘要 · 项目尚未实测'],'本期原始来源会放在简介里。模型费用和安装条件请分别核对，我们下期继续。',{icon:'docs'});
const output=path.join(root,'outputs/videos',date);await mkdir(output,{recursive:true});
const plan={version:1,date,createdAt:new Date().toISOString(),maxDuration:179,generationMethod:'ai_generated',rankingsCheckedAt:rankings.checkedAt,changes,newsCount:news.length,selectedProjects:projects.map(p=>({name:p.name,boards:p.boards})),scenes};
await writeFile(path.join(output,'plan.json'),JSON.stringify(plan,null,2)+'\n');
await writeFile(path.join(output,'script.md'),`# ${date} AI 与开源快报\n\n${scenes.map(s=>`## ${s.section} — ${s.heading}\n\n${s.narration}\n\n${s.sourceUrl||''}`).join('\n\n')}\n`);
const sources=[...new Set(scenes.map(s=>s.sourceUrl).filter(Boolean))];
await writeFile(path.join(output,'description.md'),`# 投稿资料（待人工审阅）\n\n标题：${date} AI 与开源快报｜当天新闻＋GitHub 日榜与月榜前三\n\n本视频使用 AI 生成配音、摘要和图文模板。用途示意并非软件截图，项目未经本站实测。榜单保留真实采集日期；来源受限时沿用历史快照，不推算涨跌。\n\n原始来源：\n${sources.map(url=>'- '+url).join('\n')}\n\n发布前：核对创作声明、版权和文件标识；确认画面与语音；站外引流方式另行核对。本流程不自动登录或投稿 B 站。\n`);
console.log(JSON.stringify({output,scenes:scenes.length,todayNews:news.length,uniqueProjects:projects.length,limitations:limited.map(b=>b.id)}));
