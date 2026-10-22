export interface Feature {
  id: string;
  /** Starlight's native Markdown heading slug, verified against the static build. */
  docsAnchor?: string;
  name: string;
  description: string;
  detail?: string;
  icon: 'welcome' | 'roles' | 'key' | 'chat' | 'music' | 'ticket' | 'chart';
  tags: string[];
  categoryLabel?: string;
  availabilityNote?: string;
  tools?: {
    name: string;
    description: string;
    icon: Feature['icon'];
    /** Omit when no real document exists; the row then renders without a link. */
    docsHref?: string;
  }[];
}

export const commonFeatures: Feature[] = [
  {
    id: 'welcome', docsAnchor: '歡迎訊息', name: '歡迎訊息', icon: 'welcome',
    description: '讓每一次加入，都有一句歡迎。',
    detail: '在指定頻道送上自訂歡迎文字，讓新成員感受到社群的溫度。',
    tags: ['新成員通知', '自訂文字'],
  },
  {
    id: 'reaction-roles', docsAnchor: '反應身分組', name: '反應身分組', icon: 'roles',
    description: '用一個反應，找到自己的位置。',
    detail: '透過面板上的 Emoji 領取身分組，移除反應即可撤銷對應角色。',
    tags: ['Emoji 互動', '角色領取'],
  },
];

/** Homepage presentation groups; these do not change Bot command scopes. */
export const optionalFeatures: Feature[] = [
  {
    id: 'ai-chat', docsAnchor: 'ai-聊天', name: 'AI 聊天', icon: 'chat',
    description: '在社群裡，留一個對話的空間。',
    detail: '在已啟用的頻道使用指令或提及機器人對話，並管理自己的個人化設定與長期記憶。',
    tags: ['指定頻道', '個人化', '記憶管理'],
  },
  {
    id: 'music', docsAnchor: '音樂播放', name: '音樂播放', icon: 'music',
    description: '一起待在線上，也一起聽點音樂。',
    detail: '搜尋 YouTube 歌曲或加入播放清單，用佇列、循環與隨機模式安排接下來的音樂。',
    tags: ['YouTube', '播放佇列', '語音頻道'],
  },
  {
    id: 'tickets', docsAnchor: '客服單-v2', name: '客服單 v2', icon: 'ticket',
    description: '把需要協助的事，好好接住。',
    detail: '從面板直接開單或填寫表單，在獨立客服頻道中，由設定的客服角色接手處理。',
    tags: ['表單開單', '客服角色'],
  },
  {
    id: 'manufacture', name: '三角洲行動工具', icon: 'chart',
    description: '每日遊戲資訊與特勤處製造推薦。',
    categoryLabel: '遊戲工具',
    availabilityNote: '每日密碼目前為通用功能；特勤處製造需另行啟用。',
    tags: [],
    tools: [
      {
        name: '每日密碼', description: '快速查看每日密碼', icon: 'key',
        docsHref: '/docs/features#三角洲每日密碼',
      },
      {
        name: '特勤處製造', description: '推薦物品與預估收益', icon: 'chart',
        docsHref: '/docs/features#三角洲生產推薦',
      },
    ],
  },
];
