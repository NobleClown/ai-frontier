'use client';
import {useState} from 'react';
import {ArrowUpRight,Search,Star,GitFork} from 'lucide-react';
import snapshot from '@/data/github-rankings.json';
import guides from '@/data/github-guides.json';
import quickStarts from '@/data/github-quickstarts.json';
import AiLabel from '../ai-label';
type Project={name:string;url:string;description:string;language:string;stars:number|null;starsDisplay?:string;forks:number|null;growth:string};
type Board={id:string;title:string;description:string;sourceUrl:string;updatedAt:string|null;acquisitionMethod?:string;error:string|null;projects:Project[]};
function purpose(name:string){return guides[name as keyof typeof guides]||'中文用途尚待核对，请查看官方仓库说明。';}
function heat(project:Project,board:Board,rank:number){
 if(board.id==='total')return `累计 ${project.stars?.toLocaleString()??'未提供'} 星，在本次总榜快照中排名第 ${rank}。这是长期关注度，不代表近期突然走红。`;
 const amount=project.growth.match(/[\d,]+/)?.[0];
 const period=board.id==='daily'?'当天':board.id==='weekly'?'当周':'当月';
 return `在本次${board.title}快照中排名第 ${rank}${amount?`，榜单显示${period}新增 ${amount} 星`:''}。这是热度依据，未核实走红的具体原因。`;
}
function RepositoryImage({project,rank}:{project:Project;rank:number}){
 const [failed,setFailed]=useState(false);
 return <a className="github-card-image" href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`打开 ${project.name} 仓库`}>
  {failed?<span className="github-image-fallback">{project.name}</span>:<img src={`https://opengraph.githubassets.com/1/${project.name}`} alt={`${project.name} 的 GitHub 仓库预览图`} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>}
  <span className="row-number">{String(rank).padStart(2,'0')}</span>
 </a>;
}
export default function Rankings(){
 const [active,setActive]=useState('total'),[query,setQuery]=useState('');
 const boards=snapshot.boards as Board[];
 const board=boards.find(b=>b.id===active)!;
 const projects=board.projects.filter(p=>(p.name+' '+purpose(p.name)+' '+p.language).toLowerCase().includes(query.toLowerCase()));
 return <div className="site-shell">
  <header className="header"><a className="brand" href="/"><span className="brand-symbol">前</span><span>AI 前沿<small>THE AI FRONTIER</small></span></a><nav aria-label="主导航"><a href="/">首页</a><a href="/news">全部要闻</a><a href="/eggs">赛博土鸡蛋</a><a href="/github" className="nav-active">热门 GitHub</a></nav></header>
  <main><div className="dateline"><span>开源项目观察站</span><span>全球公开项目</span></div>
   <section className="eggs-intro"><div><div className="eyebrow">WHAT THE WORLD IS BUILDING</div><h1>热门 GitHub<span>。</span></h1><p>一句话看懂用途，用榜单数据理解热度，找到上手入口。<br/>总榜看累计 Star；日榜、周榜与趋势榜保留 GitHub 官方排序。</p></div></section>
   <div className="eggs-controls"><div className="region-tabs">{[['total','总榜'],['daily','日榜'],['weekly','周榜'],['monthly','趋势榜']].map(([id,title])=><button key={id} aria-pressed={active===id} className={active===id?'selected':''} onClick={()=>setActive(id)}>{title}</button>)}</div><label className="search"><Search size={16}/><input aria-label="搜索 GitHub 项目" placeholder="项目、中文用途或语言…" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
   <div className="section-rule"><h2>{board.title} <span>{board.description}</span></h2><a href={board.sourceUrl} target="_blank" rel="noopener noreferrer">官方榜单 <ArrowUpRight size={14}/></a></div>
   <p className="result-count">快照更新：{board.updatedAt?new Date(board.updatedAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false})+'（北京时间）':'尚未成功获取'} · {projects.length} 个项目{board.acquisitionMethod==='manual_browser_copy'?' · 人工提供官方页面快照':''}</p>
   {board.error&&<p className="notice">{board.error}。已有数据保留为历史快照。</p>}
   <div className="github-cards">{projects.map(project=>{
    const rank=board.projects.indexOf(project)+1;
    const quick=quickStarts.projects.find(p=>p.name===project.name);
    return <article className="github-card" key={project.name}>
     <RepositoryImage project={project} rank={rank}/>
     <div className="github-card-body"><a className="news-title" href={project.url} target="_blank" rel="noopener noreferrer"><h3>{project.name} <ArrowUpRight size={17}/></h3></a>
      <AiLabel text="AI 生成说明"/><dl><dt>一句话干嘛</dt><dd>{purpose(project.name)}</dd><dt>为什么火</dt><dd>{heat(project,board,rank)}</dd><dt>怎么试</dt><dd>
       {quick?<><pre><code>{quick.command}</code></pre><a href={quick.tryUrl} target="_blank" rel="noopener noreferrer">{quick.tryLabel} ↗</a><p>{quick.requirements}</p><p>安装说明核对：{quickStarts.verifiedAt} · 本站尚未实测</p></>:<><a href={`${project.url}#readme`} target="_blank" rel="noopener noreferrer">打开官方 README / 上手文档 ↗</a><p>从仓库的安装、快速开始或示例入口试用；未核对安装命令，不保证提供在线 demo。</p></>}
      </dd></dl>
      <div className="github-meta"><span>{project.language||'未标注语言'}</span><span><Star size={14}/> {project.stars?.toLocaleString()??(project.starsDisplay||'未提供')}</span>{project.forks!==null&&<span><GitFork size={14}/> {project.forks.toLocaleString()}</span>}</div>
     </div>
    </article>;
   })}</div>
   {!projects.length&&<div className="empty"><h3>{query?'没有匹配的项目':'本榜单暂时没有可用数据'}</h3><p>可打开官方榜单查看，或等待下一次快照更新。</p></div>}
   <p className="github-image-note">配图使用 GitHub 仓库预览图；加载失败时显示仓库名。用途按仓库公开描述整理，未验证能力或性能承诺。</p>
   <p className="eggs-disclaimer">趋势榜展示月度 Trending；GitHub 的热度排序不等于按新增 Star 简单排序。当前通过本地更新脚本生成快照，不会把旧数据显示成实时数据。</p>
  </main><footer><a href="/">返回首页</a><span>数据来源：GitHub · 排名不代表质量评测</span></footer>
 </div>;
}
