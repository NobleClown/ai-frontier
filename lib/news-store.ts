import { getDb } from '@/db';
import { editions } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { initialEdition } from './initial-edition';
import { categories, type Edition } from './news-types';
export async function listEditions() {
 const rows = await getDb().select({date:editions.date}).from(editions).orderBy(desc(editions.date)).limit(180);
 return Array.from(new Set([...rows.map(r=>r.date),initialEdition.date])).sort().reverse();
}
export async function readEdition(date?: string): Promise<Edition | null> {
 const db=getDb();
 const rows=date ? await db.select().from(editions).where(eq(editions.date,date)).limit(1) : await db.select().from(editions).orderBy(desc(editions.date)).limit(1);
 if(rows[0])return JSON.parse(rows[0].payload);
 return !date || date===initialEdition.date ? initialEdition : null;
}
function realDate(s: unknown): s is string {return typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
export function validateEdition(value: unknown): Edition {
 const e=value as Edition;
 if(!e || !realDate(e.date) || !Array.isArray(e.stories) || e.stories.length>20)throw new Error('日报日期或新闻数量不正确');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date());
 if(e.date>today)throw new Error('不能发布未来日期的日报');
 for(const key of ['headline','note'] as const)if(typeof e[key]!=='string' || e[key].length>800)throw new Error('日报说明格式不正确');
 const ids=new Set(),urls=new Set();
 for(const s of e.stories) {
  for(const key of ['id','title','summary','source','url','takeaway'] as const)if(typeof s[key]!=='string' || !s[key].trim() || s[key].length>1200)throw new Error('新闻字段缺失或过长');
  if(!['国内','海外'].includes(s.region) || !categories.includes(s.category) || !['官方发布','媒体报道'].includes(s.sourceType))throw new Error('新闻分类不正确');
  if(!realDate(s.publishedDate) || s.publishedDate>e.date)throw new Error('原文日期不正确');
  if((Date.parse(e.date)-Date.parse(s.publishedDate))/86400000>3)throw new Error('日报只接受最近三天发布的新闻');
  const url=new URL(s.url);if(url.protocol!=='https:' || url.username || url.password)throw new Error('原文必须使用 HTTPS 链接');
  const normalized=url.origin+url.pathname;if(ids.has(s.id)||urls.has(normalized))throw new Error('日报中有重复新闻');ids.add(s.id);urls.add(normalized);
 }
 return {...e,updatedAt:new Date().toISOString()};
}
export async function saveEdition(input: unknown) {
 const e=validateEdition(input);
 await getDb().insert(editions).values({date:e.date,payload:JSON.stringify(e),updatedAt:e.updatedAt}).onConflictDoUpdate({target:editions.date,set:{payload:JSON.stringify(e),updatedAt:e.updatedAt}});
 return e;
}
