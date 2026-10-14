'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight,Radio,Clock3} from 'lucide-react';
import initialData from '@/data/reset-watch.json';
export type ResetPost={id:string;title:string;summary:string;scope:string;publishedAt:string;effectiveAt:string|null;url:string;verification:'confirmed'|'unverified';evidence?:{name:string;url:string}[]};
export type ResetData={account:string;profileUrl:string;lastCheckedAt:string;checkStatus:string;checkNote:string;automationEnabled:boolean;cadenceMinutes:number;posts:ResetPost[]};
export default function ResetWatch(){
 const [data,setData]=useState<ResetData>(initialData as ResetData),[error,setError]=useState(false),[now,setNow]=useState(()=>Date.now());
 useEffect(()=>{let alive=true;const update=async()=>{if(alive)setNow(Date.now());try{const r=await fetch('/api/reset-watch');if(!r.ok)throw new Error();const next=await r.json() as ResetData;if(alive){setData(next);setError(false);}}catch{if(alive)setError(true);}};void update();const timer=setInterval(()=>{if(!document.hidden)void update();},60000);return()=>{alive=false;clearInterval(timer);};},[]);
 const posts=[...data.posts].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));const checked=new Date(data.lastCheckedAt);const stale=now-checked.getTime()>3*3600000;
 const time=(s:string)=>new Date(s).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false});
 return <section className="reset-watch" id="reset-watch" aria-label="Tibo 重置雷达"><div className="reset-heading"><div><Radio size={19}/><h2>Tibo 重置雷达 <span>@{data.account}</span></h2></div><a href={data.profileUrl} target="_blank" rel="noopener noreferrer">查看原账号 <ArrowUpRight size={14}/></a></div><p className="reset-description">关注 Codex / ChatGPT Work 的额外额度重置、可保存重置与限额公告。适用产品和账号范围以原帖为准。</p>
 <div className="reset-state"><span><Clock3 size={13}/>{data.automationEnabled?'每小时检查 · 需 Codex 应用运行':'定时检查尚未启用'}</span><span>最近检查 {time(data.lastCheckedAt)}（北京时间）</span><span>{error?'页面读取失败，保留上一份记录':stale?'检查记录已超过 3 小时':data.checkStatus==='source_unavailable'?'原帖读取受限':data.checkStatus==='ok'?'来源已检查':'待核验'}</span></div>
 {!posts.length?<div className="reset-empty"><strong>暂未核实到近期重置公告</strong><p>{data.checkNote}</p></div>:<div className="reset-posts">{posts.map(p=><article key={p.id}><div><span className={p.verification==='confirmed'?'confirmed':'pending'}>{p.verification==='confirmed'?'已核实原帖':'待核验'}</span><span>{now-Date.parse(p.publishedAt)>48*3600000?'历史公告 · ':''}{time(p.publishedAt)}</span></div><h3>{p.title}</h3><p>{p.summary}</p><p>适用范围：{p.scope}</p><p>生效时间：{p.effectiveAt?time(p.effectiveAt):'原帖未明确；不推算'}</p><a href={p.url} target="_blank" rel="noopener noreferrer">核对原帖 <ArrowUpRight size={13}/></a>{p.evidence?.map(e=><a className="reset-evidence" key={e.url} href={e.url} target="_blank" rel="noopener noreferrer">{e.name} <ArrowUpRight size={12}/></a>)}</article>)}</div>}
 <p className="reset-footnote">这不是你的账号重置倒计时。个人剩余额度和下一次正常重置时间，请在账号用量页面查看。</p></section>;
}
