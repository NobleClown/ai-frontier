# AI 前沿：每日编辑与更新

北京时间每天 09:00，汇总前一日的国内外人工智能重要新闻。必要时纳入过去三天内的重要消息，保留真实原文发布日期。

先读取 `/api/news` 或 MCP `read_daily_news`，避免重复。主动搜索国内外消息，优先公司官方公告、研究原始文档、发布仓库；补充可信媒体。每条必须打开原文核对内容及日期，搜索结果片段或其他日报不能代替原文。没有可核对来源时不收录。区分厂商声明、论文结果和独立验证，不把传闻、演讲整理当作当天发布。

每期目标 6–12 条，但宁缺毋滥，不硬凑数量或地区配额。中文标题与独立短摘要，不复制全文；每条含 takeaway、region（国内/海外）、category、source、sourceType、HTTPS url、publishedDate。同一事件合并，首条为头条。日报 date 为当前北京时间日期，headline 为简短观察，note 说明覆盖时间与来源局限。没有新闻时允许 stories 为 [] 并说明；部分来源失效时保存经核实的消息并注明。全部来源不可用时保留上一期，报告更新失败。

写入：使用 Site 已发布的 MCP `publish_daily_news` 工具，传 `{edition:{date,headline,note,stories}}`。如果该工具没有连接，可通过 Sites `get_site` 获取当前 owner-private Site 的服务访问凭据，仅对当前 Site 的 `/mcp` 使用 `OAI-Sites-Authorization: Bearer <token>`，提交 JSON-RPC tools/call。凭据只能保留在会话内存，不写入文件、日志或任务提示。Site 必须保持 owner-private；若访问状态变化先停止写入，不能放宽权限。

写完通过 `read_daily_news` 或 `/api/news?date=YYYY-MM-DD` 回读，核对日期、条数和来源链接。同日重试为替换写入。正常更新不重新部署。每日成功运行保持安静；只有更新失败或需要用户处理才通知。

公开前须为写入增加单独的编辑授权规则；当前依赖 Sites 的 owner-private 平台访问边界。

新闻来源目录统一维护在 lib/news-sources.ts：覆盖 OpenAI、xAI/Grok、Anthropic、Google、Meta、智谱、Qwen/阿里、DeepSeek、月之暗面/Kimi、腾讯混元、MiniMax，以及 Qoder、WorkBuddy、OpenRouter 和可信媒体。先核对官方发布，再补媒体背景。不能为了覆盖厂商而捏造当日新闻。
