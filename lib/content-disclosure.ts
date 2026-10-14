import type {Edition} from './news-types';
export const contentDisclosure = {
 version:'site-provenance-v1',
 publisher:'AI 前沿',
 generationMethod:'ai_generated',
 appliesTo:['新闻摘要与解读','免费额度规则整理与使用建议','重置公告摘要','GitHub 中文说明'],
 excludes:['原始来源网页','厂商账号实际额度','GitHub 仓库预览图片'],
 notice:'这是本站内容来源声明，不是 GB 45438-2025 标准隐式标识的认证或替代。',
};
export function discloseEdition(edition:Edition):Edition {
 return {...edition,stories:edition.stories.map(story=>({...story,contentDisclosure:{generationMethod:'ai_generated' as const,publisher:'AI 前沿',contentId:`news:${edition.date}:${story.id}`,sourceUrl:story.url}}))};
}
export function serializeDisclosure(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
