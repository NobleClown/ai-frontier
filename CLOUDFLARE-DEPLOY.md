# GitHub → Cloudflare Workers

固定代码仓库：https://github.com/NobleClown/ai-frontier 。保留原有本地预览与 Sites 配置；Workers 使用独立构建入口。

## 中文网页操作步骤（2026-10-14 核对）

这些步骤针对当前项目。Cloudflare 控制台可能因界面版本调整按钮位置，英文名称用于帮助定位；登录的是 dash.cloudflare.com，不是 developers.cloudflare.com 教程站。

### 1. 确认远程代码

打开 https://github.com/NobleClown/ai-frontier ，切换 main，检查能看到 package.json、app、vite.cloudflare.config.ts、scripts/deploy-cloudflare.mjs。只有 LICENSE 时先同步代码，不能直接构建。本地主分支已合并，但这份说明本身不执行 git push。

### 2. 创建 D1 数据库

登录 https://dash.cloudflare.com/ 并选择目标账号。进入 D1 SQL database 页面；侧边栏可查找 Storage & databases / D1，布局不同可在控制台搜索 D1。点击 Create Database，名称填 ai-frontier-news，Location hint 无特殊需求保持默认，点击 Create。已有同名数据库则直接打开它。

打开数据库，在详情或 Settings 中找到 Database ID 并复制。它通常是带连字符的 UUID。不要复制 Account ID、数据库名称或 API Token。首次建库表为空正常，部署脚本会应用 drizzle 迁移创建表。

### 3. 连接 GitHub 创建 Worker

进入 Workers & Pages，点击 Create application / Create an application，选择 GitHub 仓库部署入口（Connect to Git / Import a repository 等文字）。这是 Worker 部署流程；若页面要求 Build output directory / Framework preset 的 Pages 表单，返回选择 Worker。

连接 GitHub 时，选择 NobleClown 账号，只授权 ai-frontier 仓库。GitHub 授权页可能显示 Only select repositories、Install & Authorize。回来后选择 NobleClown/ai-frontier，再继续。

### 4. 填写构建字段

| 英文字段 | 中文意思 | 本项目值 |
| --- | --- | --- |
| Worker name / Project name | 名称 | ai-frontier |
| Git branch / Production branch | 生产分支 | main |
| Build command | 构建命令 | npm run build:cloudflare |
| Deploy command | 部署命令 | npm run deploy:cloudflare |
| Root directory | 项目根目录 | package.json 在仓库顶层时保持默认；在子目录时填写该相对目录 |

本项目不需要手填 dist 为输出目录，部署脚本使用构建生成的 dist/server/wrangler.json。不要保留默认 npx wrangler deploy 命令。

展开 Build variables and secrets，添加两个 Text 变量并保存：NODE_VERSION 值 24；CLOUDFLARE_D1_DATABASE_ID 值为上一步 Database ID。已创建 Worker 后入口是 Settings → Build → Build Variables and Secrets。这两个变量用于构建，不是 Settings → Variables & Secrets 的运行时变量。

### 5. 检查部署 Token 的 D1 权限

官方文档列出的 Workers Builds 默认自动 Token 权限没有 D1。本项目部署脚本会执行远程 D1 migration，必须补齐目标账号的 Account → D1 → Edit 权限。

可先让构建配置的 API token 字段创建 Token，随后到右上角个人头像 → My Profile → API Tokens，找到该 Token 并 Edit，保留原部署权限，再添加 Account / D1 / Edit，资源范围选择本次 Cloudflare 账号并保存。若没有编辑入口，可在 API Tokens 页面创建用于此 Worker 的用户 Token，配置 Worker 部署权限和 D1 Edit，再回 Worker 的 Settings → Build 中选择该 Token。

Token 只保存在 Cloudflare 的部署配置中，不提交 GitHub，也不作为网站前端变量。Database ID 是标识，Token 是凭据，二者不能互换。

### 6. 首次部署与重试

保存后开始部署，检查构建日志。成功顺序是依赖安装、Vite 构建、D1 migrations、Worker deploy。若创建项目时不能预先添加变量或调整 Token，可以等第一次尝试结束，再到 Settings → Build 补齐设置，然后在 Builds / Deployments 中打开失败记录 Retry。

成功后打开实际生成的 workers.dev URL。若该地址未启用，在 Worker Settings → Domains & Routes 中检查 workers.dev。分别访问 /、/news、/eggs、/github，确认 10 月 14 日日报及 10 月 13 日归档。当前无需开启 NEWS_EDITOR_TOKEN；它只在后续需要远程编辑新闻时配置为运行时 Secret，公开阅读不需要。

### 7. 常见卡点

| 现象 / 日志 | 原因与处理 |
| --- | --- |
| 只看到英文文档，看不到 Create Database | 在教程站；转到 dash.cloudflare.com 并选择账号 |
| 仓库列表找不到 ai-frontier | 检查 GitHub 账号及 Cloudflare GitHub App 的仓库授权 |
| Missing script: build:cloudflare 或找不到 package.json | 远程 main 代码未同步，或 Root directory 不对 |
| Set CLOUDFLARE_D1_DATABASE_ID... | 构建变量缺失、值不是 UUID 或仍为占位值；改好后重试 |
| Authentication error / D1 permission denied | 部署 Token 缺 D1 Edit 或资源范围不是数据库所属账号 |
| 数据库不存在 | 复制了错误 ID、账号不匹配或数据库还没创建 |
| Worker name mismatch | Cloudflare 名称与代码配置不一致；本项目使用 ai-frontier |
| no such table: editions | 数据库迁移未完成，或 Worker 绑定到了另一数据库 |
| /mcp 返回 401 | 当前默认关闭远程编辑，属于预期；不影响页面公开读取 |

不要手工把本机 node_modules、.env、Zcode inbox 上传。后续 main 推送触发新部署；仅修改电脑上的 reset-watch.json 不会自动更新已部署的雷达。

对应官方文档：[D1 创建](https://developers.cloudflare.com/d1/get-started/)、[Workers Builds 字段及 Token 权限](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)、[NODE_VERSION 配置](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/)。

## 第一次连接

1. 在 Cloudflare 账号创建 D1 数据库 `ai-frontier-news`，复制数据库 ID。
2. Workers & Pages 中创建 Worker，名称为 `ai-frontier`，连接上述 GitHub 仓库，生产分支选 `main`。根目录填仓库根目录（代码实际上传在根目录时），不是本机的 `D:\workstation\website\ai-frontier`。仅授权本仓库即可。
3. 构建命令：`npm run build:cloudflare`。
4. 部署命令：`npm run deploy:cloudflare`。
5. 构建环境变量：`CLOUDFLARE_D1_DATABASE_ID`，值为第 1 步的数据库 ID。这是数据库标识，不是登录凭据。
6. 构建变量设置 `NODE_VERSION=24`。依赖由平台安装，本项目已有 package-lock.json。部署脚本还会执行远程 D1 migration，所用部署 API Token 必须具有目标账号的 D1 编辑权限及 Worker 部署所需权限；权限报错时不能通过跳过迁移继续发布。

部署脚本先应用 `drizzle` 数据库迁移，再发布生成的 Worker。未填写真实数据库 ID 时直接报错，不使用占位 ID 发布。后续推送 `main` 由 Workers Builds 自动构建与发布。

## 访问与编辑

新闻、额度卡片、GitHub 榜单和重置雷达公开读取，无需 GPT 登录。`/mcp` 写入入口在公网必须携带 `Authorization: Bearer <NEWS_EDITOR_TOKEN>`；未配置该运行时 Secret 时整个入口关闭。Secret 在 Cloudflare 的 Worker 设置中配置，不写入 GitHub、不发送到访客页面。当前默认不设置，网站仍正常读取初始日报。

本地 JSON 快照随构建发布；电脑上的 Tibo 检查更新不会自动改变云端文件。更新快照后需要提交推送才能上线。日报读取在 D1 和登记的代码快照之间选择较新日期，同一天优先 D1；历史快照也能读取。生产发布新日报可用受保护的编辑接口或登记新的代码快照，重新构建不会覆盖数据库中的同日编辑。

## 本机命令部署（可选）

在项目根目录执行。已有依赖时无需重装；首次克隆时先 `npm ci`。

```powershell
node node_modules/wrangler/bin/wrangler.js login
node node_modules/wrangler/bin/wrangler.js d1 create ai-frontier-news
$env:CLOUDFLARE_D1_DATABASE_ID = '替换为刚创建数据库的真实 ID'
npm run build:cloudflare
npm run deploy:cloudflare
```

`login` 打开官方授权页面；账号已有同名数据库时直接用现有 ID，不重复创建。本项目配置在 `vite.cloudflare.config.ts` 中，构建后生成 `dist/server/wrangler.json`，部署脚本使用生成配置。不要用 `wrangler deploy` 自动配置覆盖现有项目。暂时不需要购买域名：成功发布后可使用 Cloudflare 分配的 `workers.dev` 地址，再按需要绑定自定义域名。

## 官方文档与当前准备情况

- [Workers Builds：Git 仓库自动构建部署](https://developers.cloudflare.com/workers/ci-cd/builds/)
- [D1：创建数据库与绑定](https://developers.cloudflare.com/d1/get-started/)
- [workers.dev 地址](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/)

2026-10-14 已验证 Cloudflare 配置的生产构建。实际上线还需：让 GitHub main 包含当前网站代码，登录 Cloudflare，创建或确认 D1，配置真实数据库 ID，完成首次部署并回读公开页面。本地 main 合并不等于远程 GitHub 已更新。

## 本地

`npm run dev` 保持原本的 localhost:5173。`npm run build:cloudflare` 只构建，不会登录、创建账号或发布。首次生产发布后，应测试首页、三模块、历史日报以及匿名 `/mcp` 返回 401；用目标读者的网络实测访问速度。上线地址以 Cloudflare 返回的实际 workers.dev / 自定义域名为准。
