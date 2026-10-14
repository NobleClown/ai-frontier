import { categories, type Edition, type Story } from './news-types';

// A backstop for old database editions and obvious out-of-scope submissions.
// Human source review remains required; keyword matching is not a topic classifier.
const excluded = /融资|募资|投资轮|[ABCDEF]轮投资|上市募股|首次公开募股|并购|收购交易|政治|外交|军事|战争|武器|军用|选举|制裁|监管政策|出口管制|宏观经济|股票行情|社会突发事件|恐怖袭击|灾难事故|fundraising|funding round|military|geopolitic|election|initial public offering/i;
export function isInEditorialScope(story: Story): boolean {
 return story.id !== 'anthropic-replication-research-20261012'
  && (categories as readonly string[]).includes(story.category)
  && !excluded.test([story.title, story.summary, story.takeaway].join(' '));
}
export function applyEditorialScope(edition: Edition): Edition {
 const stories = edition.stories.filter(isInEditorialScope);
 if (stories.length === edition.stories.length) return edition;
 return {...edition, stories, headline:'AI 模型与开发工具：本期技术动态。', note:`本期保留 ${stories.length} 条模型、API、使用规则与开发工具消息。历史内容已按当前编辑范围筛选；不收录融资及公共事务报道。原文日期保留。`};
}
