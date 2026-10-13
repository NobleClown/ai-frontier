import { readEdition, listEditions, saveEdition } from '@/lib/news-store';
const toolDefinitions=[
 {name:'read_daily_news',description:'读取 AI 前沿已保存的中文日报与历史日期。',inputSchema:{type:'object',properties:{date:{type:'string',description:'可选 YYYY-MM-DD'}},additionalProperties:false}},
 {name:'publish_daily_news',description:'保存经核实的中文 AI 日报。只接受最近三天的新闻，每条必须有原文 HTTPS 链接和真实发布日期。同一日期重试替换，不产生重复日报。仅用于站点所有者授权的编辑任务。',inputSchema:{type:'object',properties:{edition:{type:'object',properties:{date:{type:'string'},headline:{type:'string'},note:{type:'string'},stories:{type:'array',maxItems:20,items:{type:'object',properties:{id:{type:'string'},title:{type:'string'},summary:{type:'string'},takeaway:{type:'string'},region:{enum:['国内','海外']},category:{enum:['模型动态','产品应用','开发工具','产业动态','研究进展','政策安全']},source:{type:'string'},sourceType:{enum:['官方发布','媒体报道']},url:{type:'string'},publishedDate:{type:'string'}},required:['id','title','summary','takeaway','region','category','source','sourceType','url','publishedDate'],additionalProperties:false}}},required:['date','headline','note','stories'],additionalProperties:false}},required:['edition'],additionalProperties:false}}
];
export async function POST(request:Request) {
 let rpc:{id?:string|number;method?:string;params?:{name?:string;arguments?:{date?:string;edition?:unknown}}};
 try{rpc=await request.json();}catch{return Response.json({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}},{status:400});}
 const result=(value:unknown)=>Response.json({jsonrpc:'2.0',id:rpc.id??null,result:value});
 if(rpc.method==='server/discover')return result({supportedVersions:['2026-07-28'],capabilities:{tools:{}}});
 if(rpc.method==='initialize')return result({protocolVersion:'2026-07-28',capabilities:{tools:{}},serverInfo:{name:'ai-frontier-news',version:'1.0.0'}});
 if(rpc.method==='tools/list')return result({tools:toolDefinitions});
 if(rpc.method?.startsWith('notifications/'))return new Response(null,{status:202});
 if(rpc.method==='tools/call'){
  try{
   const args=rpc.params?.arguments??{};
   // Sites authenticates this endpoint before dispatch. Keep the site owner-private
   // until explicit editor authorization is configured for public access.
   const value=rpc.params?.name==='read_daily_news'?{edition:await readEdition(args.date),dates:await listEditions()}:rpc.params?.name==='publish_daily_news'?await saveEdition(args.edition):null;
   if(!value)throw new Error('Unknown tool');
   return result({content:[{type:'text',text:JSON.stringify(value)}]});
  }catch(error){return result({isError:true,content:[{type:'text',text:error instanceof Error?error.message:'保存失败'}]});}
 }
 return Response.json({jsonrpc:'2.0',id:rpc.id??null,error:{code:-32601,message:'Method not found'}});
}
