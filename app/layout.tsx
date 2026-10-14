import type { Metadata } from 'next';
import './globals.css';
import './guide.css';
import './github/cards.css';
export const metadata: Metadata = {title: 'AI 前沿 · 每日简报', description: '用中文读懂国内外人工智能进展。每日要闻、模型与产品更新、原文来源和历史日报。', icons: {icon: '/favicon.svg'}};
export default function Layout({children}: {children: React.ReactNode}) {return <html lang="zh-CN"><body>{children}</body></html>;}
