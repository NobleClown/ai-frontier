export const categories = ['模型动态', '产品应用', '开发工具', '产业动态', '研究进展', '政策安全'] as const;
export type Story = {id: string; title: string; summary: string; region: '国内' | '海外'; category: typeof categories[number]; source: string; url: string; publishedDate: string; sourceType: '官方发布' | '媒体报道'; takeaway: string;};
export type Edition = {date: string; updatedAt: string; headline: string; note: string; stories: Story[]};
