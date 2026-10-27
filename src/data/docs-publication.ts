export const publicationStates = ['published', 'review', 'development'] as const;
export type PublicationStatus = (typeof publicationStates)[number];

/** Collection IDs / URLs, without a leading slash. Only explicit approval publishes a page. */
export const docsPublication: Record<string, PublicationStatus> = {
  'docs': 'published',
  'docs/features': 'published',
  'docs/commands': 'published',
  'docs/guides/welcome': 'published',
  'docs/commands/welcome': 'published',
  'docs/guides/reaction-roles': 'published',
  'docs/commands/reaction-roles': 'published',
  'docs/guides/music': 'published',
  'docs/commands/music': 'published',
  'docs/guides/delta-password': 'published',
  'docs/commands/delta-password': 'published',
  'docs/guides/manufacture': 'published',
  'docs/commands/manufacture': 'published',
  'docs/guides/tickets': 'published',
  'docs/commands/tickets': 'published',
  'docs/guides/ai': 'published',
  'docs/commands/ai': 'published',
  'docs/terms': 'development',
  'docs/privacy': 'development',
};

export function normalizeDocId(id: string): string {
  return decodeURIComponent(id).replace(/^\/+|\/+$/g, '').replace(/(?:^|\/)index$/, '');
}

export function getPublicationStatus(id: string): PublicationStatus {
  const status = docsPublication[normalizeDocId(id)] ?? 'review';
  if (!publicationStates.includes(status)) throw new Error(`Invalid Docs publication status: ${id}`);
  return status;
}

/** Only a generated placeholder carries this marker; source frontmatter is discarded. */
export function isUnpublishedHtml(html: string): boolean {
  return /<meta\b(?=[^>]*\bname="mochi-docs-status")(?=[^>]*\bcontent="(?:review|development)")/i.test(html);
}
