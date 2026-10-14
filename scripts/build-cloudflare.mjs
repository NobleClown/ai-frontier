import {spawnSync} from 'node:child_process';
const checks=[['scripts/check-content-compliance.mjs'],['scripts/check-editorial-policy.mjs'],['scripts/check-github-guides.mjs'],['scripts/check-public-fetch.mjs'],['node_modules/vite/bin/vite.js','build','--config','vite.cloudflare.config.ts']];
for(const args of checks){const result=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1);}
