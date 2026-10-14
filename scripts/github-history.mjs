import {mkdir,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../data/github-history/',import.meta.url);
export async function archiveRankings(snapshot){
 if(!snapshot?.checkedAt||!Array.isArray(snapshot.boards)||!snapshot.boards.some(board=>board.updatedAt))return;
 const stamp=snapshot.checkedAt.replace(/[:.]/g,'-');
 if(!/^\d{4}-\d{2}-\d{2}T[\dTZ-]+$/.test(stamp))throw new Error('Invalid snapshot timestamp');
 await mkdir(root,{recursive:true});
 const path=new URL(stamp+'.json',root);
 try{await readFile(path);return;}catch(error){if(error.code!=='ENOENT')throw error;}
 await writeFile(path,JSON.stringify(snapshot,null,2)+'\n');
}
export function boardChanges(previous,current){
 if(!previous||!current||!previous.updatedAt||!current.updatedAt)return {status:'no_baseline',entries:[]};
 if(previous.updatedAt===current.updatedAt)return {status:'same_snapshot',entries:[]};
 const old=new Map(previous.projects.map((p,index)=>[p.name,{rank:index+1,stars:p.stars}]));
 return {status:'comparable',entries:current.projects.map((p,index)=>({name:p.name,rank:index+1,previousRank:old.get(p.name)?.rank??null,rankGain:old.has(p.name)?old.get(p.name).rank-index-1:null,starGain:old.has(p.name)?p.stars-old.get(p.name).stars:null}))};
}
export function mergeTopProjects(boards){
 const selected=new Map();
 for(const id of ['daily','monthly']){
  const board=boards.find(b=>b.id===id);
  for(const [index,project] of (board?.projects.slice(0,3)||[]).entries()){
   const record=selected.get(project.name)||{...project,boards:[]};
   record.boards.push({id,rank:index+1,growth:project.growth,updatedAt:board.updatedAt});
   selected.set(project.name,record);
  }
 }
 return [...selected.values()];
}
