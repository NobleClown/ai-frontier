# GitHub → Cloudflare Workers

固定代码仓库：https://github.com/NobleClown/ai-frontier 。保留原有本地预览与 Sites 配置；Workers 使用独立构建入口。

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
