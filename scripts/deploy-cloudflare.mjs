import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const databaseId=process.env.CLOUDFLARE_D1_DATABASE_ID;
if(!databaseId||!/^([a-f\d]{8}-)([a-f\d]{4}-){3}[a-f\d]{12}$/i.test(databaseId)||databaseId==='00000000-0000-4000-8000-000000000000')throw Error('Set CLOUDFLARE_D1_DATABASE_ID to the real ai-frontier-news D1 database ID before deployment.');
const configPath='dist/server/wrangler.json';
const config=JSON.parse(await readFile(configPath,'utf8'));
if(config.name!=='ai-frontier')throw Error('Run npm run build:cloudflare before deployment.');
const db=config.d1_databases?.find(d=>d.binding==='DB');if(!db)throw Error('DB binding missing');
db.database_id=databaseId;
// Generated config lives in dist/server; migrations are in the repository root.
db.migrations_dir='../../drizzle';
await writeFile(configPath,JSON.stringify(config,null,2)+'\n');
for(const args of [ ['d1','migrations','apply','ai-frontier-news','--remote','--config',configPath],['deploy','--config',configPath] ]){
 const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js',...args],{stdio:'inherit',env:process.env});
 if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);
}
