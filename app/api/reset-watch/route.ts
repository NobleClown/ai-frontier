import data from '@/data/reset-watch.json';
export async function GET(){return Response.json(data,{headers:{'Cache-Control':'no-store'}});}
