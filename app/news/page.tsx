import {readEdition,listEditions} from '@/lib/news-store';
import Newsroom from '../newsroom';
export const dynamic='force-dynamic';
export const metadata={title:'全部要闻 · AI 前沿',description:'汇总国内外 AI 新闻，支持地区、主题筛选和历史日报。'};
export default async function NewsPage({searchParams}:{searchParams:Promise<{date?:string}>}){
 const {date}=await searchParams;
 const [edition,dates]=await Promise.all([readEdition(date),listEditions()]);
 return <Newsroom initial={edition} dates={dates} newsPage/>;
}
