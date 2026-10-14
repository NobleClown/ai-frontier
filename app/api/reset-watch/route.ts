import data from '@/data/reset-watch.json';
export async function GET(){return Response.json({...data,contentDisclosure:{generationMethod:'ai_generated',publisher:'AI 前沿',appliesTo:'titles and summaries',items:data.posts.map(post=>({contentId:`reset:${post.id}`,sourceUrl:post.url}))}},{headers:{'Cache-Control':'no-store'}});}
