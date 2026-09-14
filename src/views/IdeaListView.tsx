import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { IconShell } from '@/components/ui/icon-shell';
import { InquiryDetail } from '@/components/workbench/InquiryDetail';
import { inquiryIcon, inquiryStatusLabel } from '@/lib/meta';
import { relativeTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { Inquiry } from '@/types/domain';

interface IdeaListViewProps {
  /** "all" is the full idea library (Ideas); "crit" is just what needs you (Crit queue). */
  scope: 'all' | 'crit';
  inquiries: Inquiry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAccept: (id: string, note?: string) => void;
  onChallenge: (id: string, note: string) => void;
  onGoDeeper: (id: string, note?: string) => void;
  onAskForEvidence: (id: string, note?: string) => void;
  onReviseProposition: (proposition: string) => void;
}

const copy = {
  all: {
    title: 'Ideas',
    description: 'Propositions, questions, and lines of thinking you’re developing.',
    empty: 'Nothing here yet — start an idea from At a glance.',
  },
  crit: {
    title: 'Crit queue',
    description: 'Where your perspective, expertise, or judgement could materially improve the thinking.',
    empty: 'Nothing waiting on your critique right now.',
  },
};

export function IdeaListView({
  scope,
  inquiries,
  selectedId,
  onSelect,
  onAccept,
  onChallenge,
  onGoDeeper,
  onAskForEvidence,
  onReviseProposition,
}: IdeaListViewProps) {
  const filtered = scope === 'crit' ? inquiries.filter(i => i.status === 'ready') : inquiries;
  const list = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const selected = list.find(i => i.id === selectedId) ?? list[0] ?? null;
  const text = copy[scope];

  return (
    <div className="flex h-full min-h-0">
      <div className="border-stroke-divider flex w-[360px] shrink-0 flex-col border-r">
        <div className="border-stroke-divider shrink-0 border-b px-5 py-4">
          <h1 className="headings-h3-semibold text-fg-primary">{text.title}</h1>
          <p className="paragraph-small-primary text-fg-secondary mt-0.5">{text.description}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <p className="paragraph-regular-primary text-fg-secondary p-5">{text.empty}</p>
          ) : (
            <ul>
              {list.map(inquiry => (
                <li key={inquiry.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(inquiry.id)}
                    className={cn(
                      'border-stroke-divider hover:bg-stateslayer-overlay-hover flex w-full flex-col items-start gap-1.5 border-b px-5 py-4 text-left transition-colors',
                      selected?.id === inquiry.id && 'bg-fill-onsurface-ui-1',
                    )}>
                    <div className="flex w-full items-center gap-2">
                      <IconShell type="neutral" size="sm">
                        <Icon icon={inquiryIcon} />
                      </IconShell>
                      <span className="label-regular-primary text-fg-primary min-w-0 flex-1 truncate">
                        {inquiry.proposition}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={inquiry.status === 'ready' ? 'high-emphasis' : 'alternative'}
                        size="sm">
                        {inquiryStatusLabel[inquiry.status]}
                      </Badge>
                      <span className="paragraph-small-primary text-fg-tertiary">
                        {relativeTime(inquiry.createdAt)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1">
        {selected ? (
          <InquiryDetail
            key={selected.id}
            inquiry={selected}
            onAccept={onAccept}
            onChallenge={onChallenge}
            onGoDeeper={onGoDeeper}
            onAskForEvidence={onAskForEvidence}
            onReviseProposition={onReviseProposition}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="paragraph-regular-primary text-fg-secondary">Select one to inspect it.</p>
          </div>
        )}
      </div>
    </div>
  );
}
