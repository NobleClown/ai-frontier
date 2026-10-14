# 本地调试

在本目录运行 `npm run dev`，打开 http://127.0.0.1:5173 。也可在 PowerShell 运行 `./start-local.ps1`。

这是无需 ChatGPT 登录的本地预览，支持页面修改后自动刷新。仅监听本机地址，不开放到局域网。本轮不发布到 Sites；现有线上首版不受本地改动影响。

- 日报页面：`app/newsroom.tsx`
- 新闻内容：`lib/initial-edition.ts`（初始一期），已保存日报位于本地 D1 数据库
- 免费额度数据：`lib/free-offers.ts`
- 免费额度页面：`app/eggs/free-eggs.tsx`
- 样式：`app/globals.css`

免费额度数据每条记录保留官方来源、核验日期、领取资格、额度周期和使用方式。超过 14 天未核验自动标“待复核”；已结束的记录默认隐藏，可手动显示。

新闻数据修改后，如已有同日数据库记录，可运行 `node --experimental-strip-types scripts/check-news.mjs` 将当前初始一期写入本地数据库并检查读写。此脚本仅允许本地地址，不用于生产数据。

当前没有自动抓取或每日更新任务。后续接 GitHub 或其他托管平台前，需要确定部署平台，以及日报数据持久化和更新方式；GitHub Pages 不能直接运行当前 D1 后端。

Tibo 重置雷达的每小时检查已通过 Codex 自动化创建；需应用运行和可用网络。数据文件为 data/reset-watch.json，维护规则见 RESET-WATCH.md。日报自动更新仍未启用。
