import {contentDisclosure,serializeDisclosure} from '@/lib/content-disclosure';
export default function SiteNotice(){
 return <aside className="site-notice" aria-label="内容与网站说明">
  <p>本站摘要、解读和中文使用说明由 AI 生成或辅助整理。事实、额度与资格请以原始来源及账号页面为准。</p>
  <p>AI 前沿是独立网站，与 OpenAI、ChatGPT、Codex 及其他所提厂商无官方关联或授权背书。厂商和项目名称用于识别来源。</p>
  <nav aria-label="网站说明"><a href="/content-policy">内容与来源原则</a><a href="/privacy">隐私说明</a><a href="/corrections">纠错与版权反馈</a></nav>
  <script id="ai-content-provenance" type="application/json" dangerouslySetInnerHTML={{__html:serializeDisclosure(contentDisclosure)}}/>
 </aside>;
}
