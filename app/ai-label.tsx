export default function AiLabel({text='AI 生成摘要'}:{text?:string}) {
 return <a href="/content-policy#ai-labels" className="ai-label" data-ai-generated="true">{text}</a>;
}
