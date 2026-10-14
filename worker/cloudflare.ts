import handler from 'vinext/server/fetch-handler';
type PublicEnv={NEWS_EDITOR_TOKEN?:string};
export default {
 async fetch(request:Request,env:Cloudflare.Env&PublicEnv,ctx:ExecutionContext){
  const path=new URL(request.url).pathname.replace(/\/+$/,'');
  // This API can write to D1. The public Worker has no Sites owner gate.
  if(path==='/mcp'||!['GET','HEAD','OPTIONS'].includes(request.method)){
   const expected=env.NEWS_EDITOR_TOKEN;
   if(!expected||request.headers.get('Authorization')!==`Bearer ${expected}`){
    return Response.json({error:'Editor authentication required'},{status:401,headers:{'Cache-Control':'no-store'}});
   }
  }
  return handler.fetch(request,env,ctx);
 },
};
