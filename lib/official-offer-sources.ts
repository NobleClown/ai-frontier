import type {FreeOffer} from './free-offers';
// Service operators' own domains, including official hosting platforms.
// Listing a hosted model does not imply that platform is the model developer.
export const offerOperatorDomains:Record<string,string[]>={
 'openrouter-free':['openrouter.ai'],
 'qoder-daily':['qoder.com'], 'qoder-efficient':['qoder.com'], 'qoder-flash-ended':['qoder.com'],
 'workbuddy-free':['workbuddy.cn','codebuddy.cn'], 'workbuddy-mini-hy3':['workbuddy.cn'],
 'zhipu-flash':['bigmodel.cn','z.ai','zhipuai.cn'],
 'aliyun-quota':['aliyun.com'],
 'volcengine-quota':['volcengine.com'],
 'siliconflow-free':['siliconflow.cn'],
 'gemini-free':['google.com','google.dev'],
 'groq-free':['groq.com'],
 'github-retired':['github.com'],
};
export function hasOfficialOfferSources(offer:FreeOffer){
 const domains=offerOperatorDomains[offer.id];
 if(!domains||!offer.sources.length)return false;
 return [offer.entryUrl,...offer.sources.map(source=>source.url)].every(value=>{
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&domains.some(domain=>url.hostname===domain||url.hostname.endsWith('.'+domain));}catch{return false;}
 });
}
