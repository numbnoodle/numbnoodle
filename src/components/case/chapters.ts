import { flags, type CaseSection, type Project } from '@/content/site';

/** The story always reads in this order, whatever order the data is in. */
const ORDER = ['problem', 'role', 'designed', 'built', 'shipped', 'grew', 'learned'];

export interface Chapter extends CaseSection {
  /** "01" … "07" */
  num: string;
  /** In-page anchor. Prefixed so it can't collide with homepage ids like #shipped. */
  anchor: string;
}

const hasContent = (c: CaseSection) =>
  c.body.length > 0 || (c.points?.length ?? 0) > 0 || (c.images ?? []).some((img) => img.src);

/**
 * Chapters for a case study. While TODO notes are on, every chapter renders
 * (empty ones show their TODO). Once the flag is off, chapters with nothing
 * in them are skipped instead of shipping a heading with no words under it.
 */
export function chaptersOf(project: Project): Chapter[] {
  const rank = (id: string) => {
    const i = ORDER.indexOf(id);
    return i === -1 ? ORDER.length : i;
  };
  return [...project.caseStudy]
    .sort((a, b) => rank(a.id) - rank(b.id))
    .filter((c) => flags.showTodoNotes || hasContent(c))
    .map((c, i) => ({ ...c, num: String(i + 1).padStart(2, '0'), anchor: `case-${c.id}` }));
}

export const fileNum = (index: number) => String(index + 1).padStart(2, '0');
