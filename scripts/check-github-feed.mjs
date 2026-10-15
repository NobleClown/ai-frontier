import {readGithubFeed,validateGithubFeed} from './github-manual-feed.mjs';
const feed=validateGithubFeed(await readGithubFeed());
console.log(`PASS: ${feed.boards.length} official GitHub Trending browser snapshots are valid.`);
