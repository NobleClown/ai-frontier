'use client';
import {useEffect,useMemo,useState} from 'react';
import {ArrowUpRight,ChevronLeft,ChevronRight,Pause,Play} from 'lucide-react';
import type {Story} from '@/lib/news-types';
export default function FocusCarousel({stories}:{stories:Story[]}){
 const items=useMemo(()=>[...stories].sort((a,b)=>b.publishedDate.localeCompare(a.publishedDate)).slice(0,3),[stories]);
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[hover,setHover]=useState(false),[focus,setFocus]=useState(false),[hidden,setHidden]=useState(false),[reduced,setReduced]=useState(false);
 useEffect(()=>{const mq=window.matchMedia('(prefers-reduced-motion: reduce)');const motion=()=>setReduced(mq.matches);const visibility=()=>setHidden(document.hidden);motion();visibility();mq.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);return()=>{mq.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);};},[]);
 useEffect(()=>{setIndex(0);},[items]);
 useEffect(()=>{if(items.length<2||paused||hover||focus||hidden||reduced)return;const timer=setInterval(()=>setIndex(i=>(i+1)%items.length),7000);return()=>clearInterval(timer);},[items,paused,hover,focus,hidden,reduced,index]);
 const item=items[index%Math.max(1,items.length)];
 if(!item)return <article className="lead-story"><h2>本期暂无已确认的重要消息</h2><p>核实后会在这里发布。</p></article>;
 return <section className="lead-story focus-carousel" aria-label="最新三条新闻轮播" aria-roledescription="轮播" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={()=>setFocus(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setFocus(false);}}>
 <div className="story-tags"><span className="accent-tag">最新 {index+1}/{items.length}</span><span>{item.category}</span><span>{item.region}</span><span>原文 {item.publishedDate}</span></div><div key={item.id} className="focus-slide" aria-live={paused?'polite':'off'}><a href={item.url} target="_blank" rel="noopener noreferrer"><h2>{item.title}</h2></a><p>{item.summary}</p></div><div className="lead-bottom"><span>{item.source} · {item.sourceType}</span><a href={item.url} target="_blank" rel="noopener noreferrer">阅读原文 <ArrowUpRight size={17}/></a></div>
 <div className="carousel-controls"><button aria-label="上一条焦点新闻" disabled={items.length<2} onClick={()=>setIndex(i=>(i-1+items.length)%items.length)}><ChevronLeft size={17}/></button><div>{items.map((s,i)=><button key={s.id} aria-label={'查看第 '+(i+1)+' 条焦点新闻'} aria-pressed={index===i} className={index===i?'active':''} onClick={()=>setIndex(i)} />)}</div><button aria-label="下一条焦点新闻" disabled={items.length<2} onClick={()=>setIndex(i=>(i+1)%items.length)}><ChevronRight size={17}/></button><button className="carousel-pause" aria-label={paused?'播放新闻轮播':'暂停新闻轮播'} onClick={()=>setPaused(!paused)}>{paused?<Play size={13}/>:<Pause size={13}/>}<span>{reduced?'手动切换':paused?'已暂停':'7 秒切换'}</span></button></div><div className="lead-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><span>F</span><i/></div></section>;
}
