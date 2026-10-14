import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const loaded=new Map();
function load(name){
 if(loaded.has(name))return loaded.get(name);
 const source=fs.readFileSync(new URL(`../lib/${name}.ts`,import.meta.url),'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};
 vm.runInNewContext(compiled,{exports,require:path=>load(path.replace('./',''))});
 loaded.set(name,exports);return exports;
}
const {isInEditorialScope,applyEditorialScope}=load('editorial-policy');
const story={id:'price-update',title:'模型 API 单价下调',summary:'更新输入 token 调用费用。',takeaway:'使用前核对账号费率。',category:'模型动态'};
assert.ok(isInEditorialScope(story),'Model usage cost should remain in scope');
for(const title of ['模型公司完成 C 轮融资','大模型用于军事行动','AI 公司的外交与制裁动态','AI 股票行情变化']){
 assert.equal(isInEditorialScope({...story,title}),false,`Should exclude: ${title}`);
}
assert.equal(isInEditorialScope({...story,category:'产业动态'}),false);
const old={date:'2026-10-13',updatedAt:'unchanged',headline:'旧版观察',note:'旧版说明',stories:[story,{...story,id:'funding',title:'公司融资'}]};
const scoped=applyEditorialScope(old);
assert.equal(scoped.stories.length,1);
assert.equal(scoped.updatedAt,'unchanged','Filtering must not fake a new collection time');
assert.equal(old.stories.length,2,'Historical source payload must not be mutated');
assert.equal(applyEditorialScope(scoped),scoped,'Repeated reads should be stable');
console.log('PASS: financing/public affairs excluded, model pricing retained, old editions filtered without mutating history or freshness.');
