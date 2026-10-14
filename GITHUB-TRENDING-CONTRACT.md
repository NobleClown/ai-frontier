# GitHub 官方月榜人工交接 v1

总榜使用 GitHub 官方 Search API；日榜读取无 since 参数的 https://github.com/trending 。截至 2026-10-14，robots 禁止带 since 参数的网页自动抓取，周榜保留历史；月榜由用户在浏览器查看官方页面后人工提供快照。不可用自动抓取工具绕过限制，不将自算热度混称官方 Trending。

## 文件与采集

正式文件：`D:\workstation\website\ai-frontier\data\inbox\github-trending-feed.json`。
参考 `data/inbox/github-trending-feed.example.json`，模板不是可发布数据。

打开 https://github.com/trending?since=monthly ，保持默认所有语言、不加筛选，按页面顺序抄录至少前三、最多 25 个仓库。建议晚间 18:00 更新前提供一次；也可直接发给 Codex 页面截图或人工复制的内容，由 Codex 整理成文件。采集时间是实际查看页面的时间，不是提交文件时间。

完整格式：schemaVersion=1，retrievalMethod=manual_browser_copy，period=monthly，sourceUrl 为上述完整 URL，capturedAt 为含时区的 ISO 时间。projects 每项如下（此项仅示意，不是实际榜单）：

```json
{
  "rank": 1,
  "name": "owner/repository",
  "url": "https://github.com/owner/repository",
  "description": "页面原始描述；缺失可留空",
  "language": "页面语言；缺失可留空",
  "stars": null,
  "starsDisplay": "1.2k",
  "growth": "页面实际显示的 stars this month 文本；缺失留空"
}
```

rank 连续从 1 开始，顺序保持官方榜单，不按新增 Star 重排。stars 仅填页面提供的精确整数，否则 null；starsDisplay 可保留页面缩写，不推算精确值。描述、语言与增长缺失填空字符串，不编造。不要把示例说明文字当作实际数据写入。

只交接公开项目信息，不含 Cookie、凭据、账号信息。先写临时文件再原子替换正式文件；inbox 正式文件不提交 GitHub。

## 导入与校验

在项目目录运行：

```powershell
node scripts/check-github-feed.mjs
node --use-env-proxy scripts/update-github.mjs
node scripts/check-github-guides.mjs
```

检查器验证来源、时间、顺序、重复项与计数。导入使用 capturedAt 作为月榜快照时间；相同或更早的文件不覆盖较新榜单、不刷新来源时间。文件缺失或无效时保留历史并标明原因。若只提供前三，页面标明三个项目，不假装完整月榜。

新仓库需核对官方说明，补充 `data/github-guides.json` 中文用途；视频项目说明按 `VIDEO-WORKFLOW.md` 维护。导入后的公开榜单和历史可以走既有 GitHub 发布流程；原始交接文件保持本地。
