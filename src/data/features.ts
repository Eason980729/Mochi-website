export interface Feature {
  id: string;
  /** Starlight's native Markdown heading slug, verified against the static build. */
  docsAnchor: string;
  name: string;
  description: string;
  detail: string;
  icon: 'welcome' | 'roles' | 'key' | 'chat' | 'music' | 'ticket' | 'chart';
  tags: string[];
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
  {
    id: 'daily-password', docsAnchor: '三角洲每日密碼', name: '三角洲每日密碼', icon: 'key',
    description: '每日遊戲資訊，送到熟悉的頻道。',
    detail: '設定發送頻道後，於每日臺北時間 08:00 取得並發送地圖密碼。資料依外部來源提供。',
    tags: ['每日排程', '頻道通知'],
  },
];

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
    id: 'manufacture', docsAnchor: '三角洲生產推薦', name: '三角洲生產推薦', icon: 'chart',
    description: '需要的生產資訊，集中查看。',
    detail: '定時更新特勤局生產推薦，透過詳情卡片查看製造資訊與價格圖。資料依外部來源提供。',
    tags: ['定時更新', '製造詳情', '價格圖'],
  },
];
