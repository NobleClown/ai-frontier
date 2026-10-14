import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = path => JSON.parse(fs.readFileSync(new URL('../'+path, import.meta.url), 'utf8').replace(/^\uFEFF/,''));
const rankings=read('data/github-rankings.json'), guides=read('data/github-guides.json'), quick=read('data/github-quickstarts.json');
const names=new Set(rankings.boards.flatMap(board=>board.projects.map(project=>project.name)));
for(const name of names) assert.match(guides[name]||'', /[\u4e00-\u9fff]/, `Missing Chinese guide: ${name}`);
for(const project of quick.projects){
 assert.match(project.name,/^[-\w.]+\/[-\w.]+$/, 'Invalid quickstart repository');
 assert.ok(project.command.trim()&&project.requirements.trim());
 const url=new URL(project.tryUrl);
 assert.equal(url.protocol,'https:');
 assert.equal(url.hostname,'github.com');
 assert.ok(url.pathname.startsWith('/'+project.name), `Wrong quickstart repository: ${project.name}`);
}
console.log(`PASS: ${names.size} repositories have Chinese purposes; ${quick.projects.length} verified quickstarts have official HTTPS links.`);
