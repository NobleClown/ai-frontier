import {readEdition,listEditions} from '@/lib/news-store';
export async function GET(request:Request) {
 try{const date=new URL(request.url).searchParams.get('date')||undefined;
 if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))return Response.json({error:'日期格式不正确'},{status:400});
 const [edition,dates]=await Promise.all([readEdition(date),listEditions()]);
 return Response.json({edition,dates},{status:edition?200:404,headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'日报暂时无法读取，请稍后重试。'},{status:503});}
}
