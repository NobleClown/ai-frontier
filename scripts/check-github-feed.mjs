import {readGithubFeed,validateGithubFeed} from './github-manual-feed.mjs';
validateGithubFeed(await readGithubFeed());
console.log('PASS: official monthly manual snapshot is valid.');
