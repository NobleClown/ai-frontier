# AI 前沿：每日编辑与更新

北京时间每天 09:00，汇总前一日的国内外人工智能重要新闻。必要时纳入过去三天内的重要消息，保留真实原文发布日期。

## 编辑范围

只收录 AI 模型发布、能力与评测、推理与部署、API、模型使用规则，以及直接帮助使用模型的开发工具。排除所有融资、投资交易、上市、并购报道；避开政治、经济公共事务、军事、外交、社会突发事件等报道，即使文章提到 AI 也不收录。模型价格与调用费用属于使用信息，可以保留；不延伸为宏观经济或资本市场解读。法律、金融等专用模型只介绍模型能力与接入，不报道案件、行情和公共事件。分类仅使用模型动态、产品应用、开发工具、研究进展。

发布前人工检查标题、摘要、takeaway 及原始报道主题。`lib/editorial-policy.ts` 是旧数据和明显违规条目的兜底过滤，不替代人工选题判断；旧数据库日报读取时也适用当前范围。

## 独立 GitHub 趋势榜

GitHub 项目不并入简报，单独维护 `/github` 的四个榜单。刷新 `data/github-rankings.json` 时，为新增仓库补充 `data/github-guides.json` 中的中文一句话用途；不直接显示英文描述。热度理由使用同一快照中的排名、累计 Star 或期间新增 Star，不能编造走红原因。配图采用 GitHub 仓库预览图，失败回退仓库名。

上手命令先核对官方 README；已核对命令和先决条件保存到 `data/github-quickstarts.json`，标记核对日期，不声称本站实测。不能确认命令或 demo 时仅提供官方文档入口并注明，不猜测命令。运行 `node scripts/check-github-guides.mjs` 检查当前所有仓库的中文用途覆盖率和链接。

先读取 `/api/news` 或 MCP `read_daily_news`，避免重复。主动搜索国内外消息，优先公司官方公告、研究原始文档、发布仓库；补充可信媒体。每条必须打开原文核对内容及日期，搜索结果片段或其他日报不能代替原文。没有可核对来源时不收录。区分厂商声明、论文结果和独立验证，不把传闻、演讲整理当作当天发布。

## Tibo 的 Codex / ChatGPT 帖文

每次整理日报，都将 Tibo（@thsottiaux）关于 Codex、ChatGPT（含 Work）的本人帖文作为新闻候选，包括产品功能、开发体验、模型、使用限额和重置，不只收录 Reset。优先按 `TIBO-FEED-CONTRACT.md` 校验 Zcode 的正式交接文件；用户已授权采信直接读取原文，无需额外联网逐帖验证。来源注明“Tibo · X 原帖（Zcode 直接读取）”，不冒充本站独立浏览器核验。

保留原帖 URL、真实绝对发布时间和上下文；引用帖与本人正文分开理解。按 UTC+8 转成 `publishedDate`，未知时间不推算。同一原帖或事件合并去重；回复只有带来实质新信息时收录。范围不明、预告、发放中和完成分别写明，普通 ChatGPT 消息不自动推断为 Codex 权益。超过本期三天窗口的消息留在历史资料，不改成当天新闻。个人闲聊及与产品无关的帖子不纳入。

重置消息同时可进入新闻与重置雷达；其他产品消息只进入新闻。雷达按 `RESET-WATCH.md` 单独维护。定时雷达任务仍只更新雷达文件，不因这条编辑规则扩大为自动发布日报。此规则在用户要求汇总新闻时执行；尚未开启的自动日报任务不视为已启用。

每期目标 6–12 条，但宁缺毋滥，不硬凑数量或地区配额。中文标题与独立短摘要，不复制全文；每条含 takeaway、region（国内/海外）、category、source、sourceType、HTTPS url、publishedDate。同一事件合并，首条为头条。日报 date 为当前北京时间日期，headline 为简短观察，note 说明覆盖时间与来源局限。没有新闻时允许 stories 为 [] 并说明；部分来源失效时保存经核实的消息并注明。全部来源不可用时保留上一期，报告更新失败。

写入当前本地预览的 MCP `publish_daily_news`，传 `{edition:{date,headline,note,stories}}`，再保存可随构建发布的快照到 `data/editions/YYYY-MM-DD.json` 并登记到 `lib/bundled-editions.ts`。Cloudflare 公网的 `/mcp` 需要运行时 Secret `NEWS_EDITOR_TOKEN` 对应的 Bearer 编辑授权；未设置时保持关闭。仅在用户授权更新远程网站后才调用远程接口。凭据只保留在会话内存，不写入代码、日志或任务提示。Sites 的平台凭据不用于 Cloudflare 域名。

写完通过 `read_daily_news` 或 `/api/news?date=YYYY-MM-DD` 回读，核对日期、条数和来源链接。同日重试为替换写入。正常更新不重新部署。每日成功运行保持安静；只有更新失败或需要用户处理才通知。

Cloudflare 公网编辑边界由 `worker/cloudflare.ts` 检查；匿名访客只读取公开页面，不能发布日报。

新闻来源目录统一维护在 lib/news-sources.ts：覆盖 OpenAI、xAI/Grok、Anthropic、Google、Meta、智谱、Qwen/阿里、DeepSeek、月之暗面/Kimi、腾讯混元、MiniMax，以及 Qoder、WorkBuddy、OpenRouter 和可信媒体。先核对官方发布，再补媒体背景。不能为了覆盖厂商而捏造当日新闻。
