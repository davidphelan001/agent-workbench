import { Badge } from '@/components/ui/badge';
import { InquiryDetail } from '@/components/workbench/InquiryDetail';
import { inquiryStatusLabel } from '@/lib/meta';
import { relativeTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { Inquiry } from '@/types/domain';

interface IdeaListViewProps {
  /** "crit" is what needs you now; "history" is what's already settled. */
  scope: 'crit' | 'history';
  inquiries: Inquiry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAccept: (id: string, note?: string) => void;
  onChallenge: (id: string, note: string) => void;
  onGoDeeper: (id: string, note?: string) => void;
  onAskForEvidence: (id: string, note?: string) => void;
  onReviseProposition: (proposition: string) => void;
}

const noop = () => {};
const noopChallenge = (_id: string, _note: string) => {};
const noopRevise = (_proposition: string) => {};

const copy = {
  crit: {
    title: 'Crit queue',
    description: 'Where your perspective, expertise, or judgement could materially improve the thinking.',
    empty: 'Nothing waiting on your critique right now.',
  },
  history: {
    title: 'History',
    description: 'How your ideas have developed — accepted syntheses over time.',
    empty: 'Nothing settled yet.',
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
  const readOnly = scope === 'history';
  const filtered = inquiries.filter(i => (scope === 'crit' ? i.status === 'ready' : i.status === 'accepted'));
  const list = [...filtered].sort((a, b) => {
    const aTime = new Date(a.resolvedAt ?? a.createdAt).getTime();
    const bTime = new Date(b.resolvedAt ?? b.createdAt).getTime();
    return bTime - aTime;
  });
  const selected = list.find(i => i.id === selectedId) ?? list[0] ?? null;
  const text = copy[scope];

  return (
    <div className="flex h-full min-h-0">
      <div className="border-stroke-divider flex w-[340px] shrink-0 flex-col border-r">
        <div className="px-6 pt-10 pb-6">
          <h1 className="headings-h3-regular text-fg-primary">{text.title}</h1>
          <p className="paragraph-small-primary text-fg-secondary mt-1">{text.description}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <p className="paragraph-regular-primary text-fg-tertiary px-6">{text.empty}</p>
          ) : (
            <ul>
              {list.map(inquiry => (
                <li key={inquiry.id} className="border-stroke-divider border-t first:border-t-0">
                  <button
                    type="button"
                    onClick={() => onSelect(inquiry.id)}
                    className={cn(
                      'flex w-full flex-col items-start gap-1.5 px-6 py-5 text-left transition-colors',
                      'hover:bg-stateslayer-overlay-hover',
                      selected?.id === inquiry.id && 'bg-fill-onsurface-ui-1',
                    )}>
                    <span className="paragraph-large-primary text-fg-primary">
                      {inquiry.proposition}
                    </span>
                    <div className="flex items-center gap-2">
                      {scope === 'crit' && (
                        <Badge variant="high-emphasis" size="sm">
                          {inquiryStatusLabel[inquiry.status]}
                        </Badge>
                      )}
                      <span className="paragraph-small-primary text-fg-tertiary">
                        {relativeTime(inquiry.resolvedAt ?? inquiry.createdAt)}
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
            readOnly={readOnly}
            onAccept={readOnly ? noop : onAccept}
            onChallenge={readOnly ? noopChallenge : onChallenge}
            onGoDeeper={readOnly ? noop : onGoDeeper}
            onAskForEvidence={readOnly ? noop : onAskForEvidence}
            onReviseProposition={readOnly ? noopRevise : onReviseProposition}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="paragraph-regular-primary text-fg-tertiary">Nothing here yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
