# GitHub 热门项目

本地页面：`http://127.0.0.1:5173/github`。

- 总榜：GitHub Search API，公开且未归档仓库，累计 Star 降序，前 20 条。
- 日榜、周榜：GitHub Trending 的 daily / weekly 原始顺序。
- 趋势榜：GitHub Trending 的 monthly；并非自建新增 Star 排名。

在项目目录运行 `node scripts/update-github.mjs` 更新四榜快照。使用公开来源，无需 API Key 或安装新依赖。页面显示各榜实际成功获取时间；某榜失败时保留该榜旧快照并显示失败提示，不刷新旧数据的日期。

当前没有启用 GitHub 定时任务。若未来加入自动更新，应共享快照，避免每个浏览器访问都请求 GitHub。公共 API 有速率限制，HTML 结构改变时解析会报错；不要以空数组覆盖已有成功数据。
