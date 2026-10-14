# GitHub → Cloudflare Workers

固定代码仓库：https://github.com/NobleClown/ai-frontier 。保留原有本地预览与 Sites 配置；Workers 使用独立构建入口。

## 第一次连接

1. 在 Cloudflare 账号创建 D1 数据库 `ai-frontier-news`，复制数据库 ID。
2. Workers & Pages 中创建 Worker，连接上述 GitHub 仓库，生产分支选 `main`。仅授权本仓库即可。
3. 构建命令：`npm run build:cloudflare`。
4. 部署命令：`npm run deploy:cloudflare`。
5. 构建环境变量：`CLOUDFLARE_D1_DATABASE_ID`，值为第 1 步的数据库 ID。这是数据库标识，不是登录凭据。
6. 配置 Node.js 版本 24。依赖由平台执行 `npm ci` 安装。

部署脚本先应用 `drizzle` 数据库迁移，再发布生成的 Worker。未填写真实数据库 ID 时直接报错，不使用占位 ID 发布。后续推送 `main` 由 Workers Builds 自动构建与发布。

## 访问与编辑

新闻、额度卡片、GitHub 榜单和重置雷达公开读取，无需 GPT 登录。`/mcp` 写入入口在公网必须携带 `Authorization: Bearer <NEWS_EDITOR_TOKEN>`；未配置该运行时 Secret 时整个入口关闭。Secret 在 Cloudflare 的 Worker 设置中配置，不写入 GitHub、不发送到访客页面。当前默认不设置，网站仍正常读取初始日报。

本地 JSON 快照随构建发布；电脑上的 Tibo 检查更新不会自动改变云端文件。更新快照后需要提交推送才能上线。D1 中已有日报优先于代码初始日报；生产发布新日报应通过受保护的编辑接口，不能依靠重新构建覆盖数据库。

## 本地

`npm run dev` 保持原本的 localhost:5173。`npm run build:cloudflare` 只构建，不会登录、创建账号或发布。首次生产发布后，应测试首页、三模块、历史日报以及匿名 `/mcp` 返回 401；用目标读者的网络实测访问速度。上线地址以 Cloudflare 返回的实际 workers.dev / 自定义域名为准。
