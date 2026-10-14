import {freeOffers,offerStatus} from './free-offers';
export const useCases=[{id:'coding',name:'写代码 / 做网站',description:'先用现成 Agent，减少配置步骤。'},{id:'api',name:'给应用接入 API',description:'找到可用型号，核对配额与接入方式。'},{id:'text',name:'翻译 / 处理文本',description:'从轻量文本模型开始试用。'},{id:'all',name:'查看全部',description:'比较全部免费与试用记录。'}];
export const guideNotes:Record<string,{tasks:string[];fit:string;watch:string;alternative:string}>={
 'qoder-daily':{tasks:['coding'],fit:'适合愿意每天领取积分、直接用 Agent 写代码的人。',watch:'每天手动领；模型会扣积分，不等于不限量免费。',alternative:'workbuddy-free'},
 'qoder-efficient':{tasks:['coding'],fit:'适合已经订阅 Qoder、希望减少积分消耗的人。',watch:'需要付费订阅，使用前确认 Efficient 显示 0.0×。',alternative:'qoder-daily'},
 'workbuddy-free':{tasks:['coding'],fit:'适合先体验 Agent，再判断是否需要付费的人。',watch:'月度积分共享；长任务可能很快耗尽额度。',alternative:'qoder-daily'},
 'workbuddy-mini-hy3':{tasks:['coding','text'],fit:'适合愿意通过小程序尝试混元的用户。',watch:'小程序文档标注限免；桌面端和结束日期须另看。',alternative:'workbuddy-free'},
 'openrouter-free':{tasks:['api'],fit:'适合已有兼容客户端、希望切换免费模型的人。',watch:'每日次数由免费模型共享；Free Router 不固定底层型号。',alternative:'zhipu-flash'},
 'zhipu-flash':{tasks:['api','text'],fit:'适合希望先用一个明确型号接入文本任务的人。',watch:'免费仍有限流；法律专用模型不包含在这项权益里。',alternative:'siliconflow-free'},
 'siliconflow-free':{tasks:['api','text'],fit:'适合愿意实名认证、比较多个小模型的人。',watch:'需要复制完整模型 ID，并确认控制台仍标 0 元。',alternative:'zhipu-flash'},
 'aliyun-quota':{tasks:['api'],fit:'适合首次开通百炼、希望试用不同模型的人。',watch:'90 天一次性试用；建议开启免费额度用完即停。',alternative:'zhipu-flash'},
 'volcengine-quota':{tasks:['api'],fit:'适合符合方舟新用户条件、短期测试接口的人。',watch:'总量试用不按日补充；先确认安心体验模式。',alternative:'zhipu-flash'},
 'gemini-free':{tasks:['api','text'],fit:'适合已有可用 Google 账号和项目的人。',watch:'地区、项目资格和配额以 AI Studio 显示为准。',alternative:'groq-free'},
 'groq-free':{tasks:['api','text'],fit:'适合想试用托管开放模型的开发者。',watch:'同时受请求数和 Token 限额约束，不是 ChatGPT 额度。',alternative:'openrouter-free'},
};
export function selectOffers({task='all',domestic=false,noSubscription=false,hideTrials=false,query='',today}:{task?:string;domestic?:boolean;noSubscription?:boolean;hideTrials?:boolean;query?:string;today:string}){
 return freeOffers.filter(o=>offerStatus(o,today)!=='已结束'&&(task==='all'||guideNotes[o.id]?.tasks.includes(task))&&(!domestic||o.region==='国内')&&(!noSubscription||o.kind!=='订阅附赠')&&(!hideTrials||o.kind!=='新人试用')&&[o.name,o.vendor,...o.models].join(' ').toLowerCase().includes(query.toLowerCase()));
}
export const knownChanges=[{date:'2026-09-30',title:'Qoder Qwen3.8-Flash 零积分活动已结束',detail:'每日领取 100 Credits 是另一项权益，可继续按对应规则查看。',url:'https://docs.qoder.com/events/flashoffer'},{date:'2026-07-30',title:'GitHub Models 免费推理服务已退役',detail:'旧教程中的免费推理入口不再适用；仓库托管是另一项服务。',url:'https://docs.github.com/en/github-models'}];
