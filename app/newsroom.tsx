'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Search,ArrowRight,RefreshCw,Bookmark,Check,X,Menu,Globe2,CalendarDays,Sun,Layers,Link as LinkIcon} from 'lucide-react';
import {categories,type Edition,type Story} from '@/lib/news-types';
import {newsSources as sources} from '@/lib/news-sources';
import FocusCarousel from './focus-carousel';
import ResetWatch from './reset-watch';
import GuideHome from './guide-home';
type Props={initial:Edition|null;dates:string[];newsPage?:boolean};
function dateLabel(date:string){return new Date(date+'T12:00:00+08:00').toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Shanghai'});}
export default function Newsroom({initial,dates:initialDates,newsPage=false}:Props){
 const [edition,setEdition]=useState(initial),[dates,setDates]=useState(initialDates),[region,setRegion]=useState('全部'),[topic,setTopic]=useState('全部'),[search,setSearch]=useState(''),[saved,setSaved]=useState<string[]>([]),[savedOnly,setSavedOnly]=useState(false),[panel,setPanel]=useState<'archive'|'sources'|'about'|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[toast,setToast]=useState('');
 const dialogRef=useRef<HTMLDialogElement>(null),requestId=useRef(0);
 useEffect(()=>{try{const ids=JSON.parse(localStorage.getItem('frontier-saved')||'[]');if(Array.isArray(ids))setSaved(ids.filter(x=>typeof x==='string'));}catch{}},[]);
 useEffect(()=>{if(panel)dialogRef.current?.showModal();else dialogRef.current?.close();},[panel]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2600);return()=>clearTimeout(t);},[toast]);
 async function load(date?:string){if(date&&!newsPage){window.location.assign('/news?date='+encodeURIComponent(date));return;}const id=++requestId.current;setLoading(true);setError('');try{const r=await fetch('/api/news'+(date?'?date='+encodeURIComponent(date):''));const data=await r.json() as {edition:Edition;dates:string[];error?:string};if(!r.ok)throw new Error(data.error||'这一期尚未发布');if(id!==requestId.current)return;setEdition(data.edition);setDates(data.dates);setPanel(null);setSearch('');}catch(e){if(id===requestId.current)setError(e instanceof Error?e.message:'读取失败');}finally{if(id===requestId.current)setLoading(false);}}
 function bookmark(s:Story){const next=saved.includes(s.id)?saved.filter(id=>id!==s.id):[...saved,s.id];setSaved(next);try{localStorage.setItem('frontier-saved',JSON.stringify(next));}catch{setToast('浏览器未允许保存收藏');}}
 async function copy(){try{await navigator.clipboard.writeText(window.location.origin);setToast('网站链接已复制');}catch{setToast('请复制浏览器地址栏中的链接');}}
 const stories=(edition?.stories||[]).filter(s=>(region==='全部'||s.region===region)&&(topic==='全部'||s.category===topic)&&(!savedOnly||saved.includes(s.id))&&[s.title,s.summary,s.source].join(' ').toLowerCase().includes(search.toLowerCase()));
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date());const stale=edition&&edition.date<today;
 return <div className="site-shell">
  <header className="header"><a className="brand" href="/" aria-label="AI 前沿首页"><span className="brand-symbol">前</span><span>AI 前沿<small>THE AI FRONTIER</small></span></a>
   <nav aria-label="主导航"><a className={!newsPage?'nav-active':''} href="/">首页</a><a className={newsPage?'nav-active':''} href="/news">全部要闻</a><a href="/eggs">赛博土鸡蛋</a><a href="/github">热门 GitHub</a><a href="/#reset-watch">重置雷达</a><button onClick={()=>setPanel('archive')}>历史日报</button><button onClick={()=>setPanel('sources')}>信息来源</button></nav>
   <button className="share" onClick={copy}>分享本站 <ArrowUpRight size={16}/></button><button className="mobile-menu" onClick={()=>setPanel('archive')} aria-label="打开历史日报"><Menu size={22}/></button>
  </header>
  <main>
   <div className="dateline"><span><span className="live-dot"/> 中文 AI 资讯 · 每日精选</span><span>{edition?dateLabel(edition.date):'日报暂未发布'} <span className="dateline-zone">/ 北京时间</span></span></div>
   {!newsPage&&<GuideHome/>}
   {stale&&<div className="notice">目前最新一期为 {dateLabel(edition.date)}，今日简报尚未发布。<button onClick={()=>load()} disabled={loading}>检查更新</button></div>}
   {error&&<div className="notice error" role="alert">{error}<button onClick={()=>load()} disabled={loading}>重试</button></div>}
   {!newsPage&&<>
   <div className="section-rule"><h2>本期焦点 <span>IN FOCUS</span></h2><span>最新 {Math.min(3,edition?.stories.length||0)} 条 · 支持暂停与手动切换</span></div>
   <section className="focus-grid">
    <FocusCarousel stories={edition?.stories||[]}/>
    <aside className="brief-note"><div className="eyebrow">EDITOR'S NOTE / 本期观察</div><h3>{edition?.headline||'等待下一份简报。'}</h3><p>{edition?.note||'重要的进展，值得核对来源。'}</p><div className="note-counts"><div><strong>{edition?.stories.filter(s=>s.region==='国内').length||0}</strong><span>国内消息</span></div><div><strong>{edition?.stories.filter(s=>s.region==='海外').length||0}</strong><span>海外消息</span></div><Globe2 size={33} strokeWidth={1}/></div></aside>
   </section>

   <a className="egg-teaser" href="/eggs"><span className="teaser-icon" aria-hidden="true">◒</span><div><strong>赛博土鸡蛋</strong><span>免费模型、试用额度、时间区间与使用方式，一起查。</span></div><span className="teaser-link">去捡土鸡蛋 <ArrowUpRight size={17}/></span></a>
   <a className="egg-teaser github-teaser" href="/github"><span className="teaser-icon" aria-hidden="true">⌘</span><div><strong>热门 GitHub 项目</strong><span>总榜、日榜、周榜与月度趋势，按官方数据发现开源项目。</span></div><span className="teaser-link">查看四榜 <ArrowUpRight size={17}/></span></a>
   <ResetWatch/>
   <a className="news-page-link" href="/news"><strong>全部要闻</strong><span>国内外 AI 新闻、主题筛选与历史日报</span><span>去看新闻 <ArrowUpRight size={16}/></span></a>
   </>}
   {newsPage&&<>
   <section className="news-page-intro"><div className="eyebrow">THE DAILY DIGEST</div><h1>全部要闻</h1><p>按地区与主题浏览，保留来源、日期和本期收藏。</p></section>
   <div className="reading-grid"><section className="news-section" aria-label="新闻列表"><div className="section-rule"><h2>{savedOnly?'本期收藏':'全部要闻'} <span>THE DIGEST</span></h2><button className="refresh" disabled={loading} onClick={()=>load()}><RefreshCw size={14} className={loading?'spin':''}/>{loading?'读取中':'检查更新'}</button></div>
    <div className="filter-line"><div className="region-tabs">{['全部','国内','海外'].map(r=><button key={r} aria-pressed={region===r} className={region===r?'selected':''} onClick={()=>setRegion(r)}>{r}</button>)}</div><label className="search"><Search size={16}/><input aria-label="搜索新闻" placeholder="搜索新闻、公司…" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
    <div className="topic-line"><button className={topic==='全部'?'chosen':''} onClick={()=>setTopic('全部')}>所有主题</button>{categories.map(c=><button className={topic===c?'chosen':''} onClick={()=>setTopic(c)} key={c}>{c}</button>)}</div>
    <div aria-live="polite" className="result-count">{stories.length} 条消息{savedOnly?' · 收藏仅保存在当前浏览器':''}</div>
    <div>{stories.map((s,i)=><article className="news-row" key={s.id}><span className="row-number">{String(i+1).padStart(2,'0')}</span><div className="row-content"><div className="story-tags"><span className={s.region==='国内'?'domestic':'international'}>{s.region}</span><span>{s.category}</span></div><a className="news-title" href={s.url} target="_blank" rel="noopener noreferrer"><h3>{s.title}</h3></a><p>{s.summary}</p><details><summary>为什么值得关注 <ArrowRight size={12}/></summary><p>{s.takeaway}</p></details><div className="row-footer"><span>{s.source}<i>·</i>{s.sourceType}<i>·</i>原文 {s.publishedDate.slice(5).replace('-','月')}日</span><a href={s.url} target="_blank" rel="noopener noreferrer">原文 <ArrowUpRight size={14}/></a></div></div><button className={'bookmark '+(saved.includes(s.id)?'bookmarked':'')} onClick={()=>bookmark(s)} aria-label={(saved.includes(s.id)?'取消收藏：':'收藏：')+s.title} aria-pressed={saved.includes(s.id)}><Bookmark size={18} fill={saved.includes(s.id)?'currentColor':'none'}/></button></article>)}</div>
    {!stories.length&&<div className="empty"><Layers size={28}/><h3>没有符合条件的消息</h3><p>试试其他关键词，或清除筛选。</p><button onClick={()=>{setSearch('');setTopic('全部');setRegion('全部');setSavedOnly(false);}}>清除筛选 <ArrowRight size={14}/></button></div>}
   </section><aside className="sidebar"><div className="side-block"><Sun size={24} strokeWidth={1.3}/><h3>信息很多，<br/>把注意力留给重要的。</h3><p>每条消息保留来源和日期。官方声明与媒体报道分开标注，摘要帮助你决定是否深入阅读。</p><button onClick={()=>setPanel('about')}>了解编辑原则 <ArrowUpRight size={15}/></button></div><div className="side-archive"><div className="small-heading"><CalendarDays size={16}/> 往期简报</div>{dates.slice(0,5).map((date,i)=><button key={date} onClick={()=>load(date)} disabled={loading}><span>{date.replaceAll('-',' / ')}</span><span>{i===0?'最新':'回顾'} <ArrowUpRight size={13}/></span></button>)}<button className="all-archive" onClick={()=>setPanel('archive')}>查看全部日报 <ArrowRight size={14}/></button></div><button className={'saved-toggle '+(savedOnly?'active':'')} onClick={()=>setSavedOnly(!savedOnly)}><Bookmark size={16}/>{savedOnly?'返回全部新闻':'查看本期收藏'}<ArrowRight size={14}/></button><div className="source-note"><LinkIcon size={14}/><p>中文摘要由 AI 辅助整理。阅读原文可了解完整背景；发现差异，以原始来源为准。</p></div></aside></div>
   </>}
   <section className="bottom-band"><span className="brand-symbol small">前</span><div><h3>追踪变化，保持自己的判断。</h3><p>国内与海外，技术与应用。下一份简报见。</p></div><button onClick={()=>setPanel('sources')}>探索信息来源 <ArrowUpRight size={16}/></button></section>
  </main><footer><span>AI 前沿 <i>·</i> THE AI FRONTIER</span><span>独立资讯汇总 · 不隶属于报道中的任何公司</span><button onClick={()=>setPanel('about')}>关于本站</button></footer>
  <dialog ref={dialogRef} onCancel={()=>setPanel(null)} onClick={e=>{if(e.target===e.currentTarget)setPanel(null);}}><div className="dialog-head"><h2>{panel==='archive'?'历史日报':panel==='sources'?'信息来源':'关于 AI 前沿'}</h2><button onClick={()=>setPanel(null)} aria-label="关闭"><X size={22}/></button></div>{panel==='archive'?<><p>按日报日期回看。尚未发布的日期不会生成空归档。</p><div className="archive-list">{dates.map(d=><button key={d} disabled={loading} onClick={()=>load(d)}><CalendarDays size={17}/>{dateLabel(d)}<ArrowUpRight size={17}/></button>)}</div></>:panel==='sources'?<><p>优先核对公司公告、研究发布与原始文档，媒体报道补充产业背景。下列为关注来源，不代表每个来源每天均有新闻。开发者社区中的用户投稿仅作线索，产品发布和额度规则需核对官方公告；未确认独立社区的厂商保留官方公告或文档入口。月之暗面与 Kimi 属于同一厂商，合并跟踪。</p><div className="archive-list">{sources.map(([name,url,region,scope])=><a className="source-directory-link" key={name} href={url} target="_blank" rel="noopener noreferrer"><div><strong>{name}</strong><small>{region} · {scope}</small></div><ArrowUpRight size={17}/></a>)}</div></>:<div className="about"><p>AI 前沿是一份面向中文读者的独立人工智能简报，帮助你快速了解国内外进展。</p><h3>如何整理新闻</h3><p>优先原始来源；每条注明原文发布日期。合并同一事件的重复报道，不把演讲整理当作当天产品发布，也不把厂商自述的性能当作独立评测。</p><h3>如何更新</h3><p>当前通过核实原文后更新摘要，历史日报按日期保存。每日自动更新任务尚未启用；没有可靠来源的消息不会收录。</p><h3>隐私与收藏</h3><p>收藏仅存储在你的浏览器。本版不收集邮箱，不提供邮件订阅，也未接入广告或访客统计。</p></div>}</dialog>
  {toast&&<div className="toast" role="status"><Check size={17}/>{toast}</div>}
 </div>;
}
