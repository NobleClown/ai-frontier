import assert from 'node:assert/strict';
import {initialEdition} from '../lib/initial-edition.ts';
const origin=process.env.NEWS_TEST_ORIGIN||'http://127.0.0.1:5173';
if(!['localhost','127.0.0.1','[::1]'].includes(new URL(origin).hostname))throw new Error('This seed/check script only supports a local preview.');
async function call(name,args){const r=await fetch(origin+'/mcp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})});assert.equal(r.status,200);return (await r.json()).result;}
let r=await fetch(origin+'/api/news');assert.equal(r.status,200);let data=await r.json();assert.ok(Array.isArray(data.edition.stories));
assert.equal((await fetch(origin+'/api/news?date=bad')).status,400);
assert.equal((await fetch(origin+'/api/news?date=2000-01-01')).status,404);
const duplicate=structuredClone(initialEdition);duplicate.stories.push(duplicate.stories[0]);assert.equal((await call('publish_daily_news',{edition:duplicate})).isError,true);
const unsafe=structuredClone(initialEdition);unsafe.stories[0].url='javascript:alert(1)';assert.equal((await call('publish_daily_news',{edition:unsafe})).isError,true);
const invalid=structuredClone(initialEdition);invalid.stories[0].publishedDate='2026-02-30';assert.equal((await call('publish_daily_news',{edition:invalid})).isError,true);
const written=await call('publish_daily_news',{edition:initialEdition});assert.notEqual(written.isError,true);
const read=await call('read_daily_news',{date:initialEdition.date});data=JSON.parse(read.content[0].text);assert.equal(data.edition.stories.length,initialEdition.stories.length);assert.deepEqual(data.edition.stories,initialEdition.stories);assert.ok(data.dates.includes(initialEdition.date));
console.log('PASS: read, date validation, missing edition, duplicate rejection, unsafe URL rejection, invalid source date, database write and readback');
