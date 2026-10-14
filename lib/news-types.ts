export const categories = ['模型动态', '产品应用', '开发工具', '研究进展'] as const;
export type Story = {id: string; title: string; summary: string; region: '国内' | '海外'; category: typeof categories[number] | '产业动态' | '政策安全'; source: string; url: string; publishedDate: string; sourceType: '官方发布' | '媒体报道'; takeaway: string;contentDisclosure?:{generationMethod:'ai_generated';publisher:string;contentId:string;sourceUrl:string};};
export type Edition = {date: string; updatedAt: string; headline: string; note: string; stories: Story[]};
