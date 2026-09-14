import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { IconShell } from '@/components/ui/icon-shell';
import { InquiryDetail } from '@/components/workbench/InquiryDetail';
import { inquiryIcon } from '@/lib/meta';
import { relativeTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { Inquiry } from '@/types/domain';

interface AuditViewProps {
  inquiries: Inquiry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const noop = () => {};
const noopChallenge = (_id: string, _note: string) => {};
const noopRevise = (_proposition: string) => {};

export function AuditView({ inquiries, selectedId, onSelect }: AuditViewProps) {
  const accepted = [...inquiries]
    .filter(i => i.status === 'accepted')
    .sort(
      (a, b) =>
        new Date(b.resolvedAt ?? b.createdAt).getTime() -
        new Date(a.resolvedAt ?? a.createdAt).getTime(),
    );

  const selected = accepted.find(i => i.id === selectedId) ?? accepted[0] ?? null;

  return (
    <div className="flex h-full min-h-0">
      <div className="border-stroke-divider flex w-[380px] shrink-0 flex-col border-r">
        <div className="border-stroke-divider shrink-0 border-b px-5 py-4">
          <h1 className="headings-h3-semibold text-fg-primary">History</h1>
          <p className="paragraph-small-primary text-fg-secondary mt-0.5">
            How your ideas have developed — accepted syntheses over time.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {accepted.length === 0 ? (
            <p className="paragraph-regular-primary text-fg-secondary p-5">
              Nothing settled yet.
            </p>
          ) : (
            <ul>
              {accepted.map(inquiry => (
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
                      <Badge variant="success" size="sm">
                        Accepted
                      </Badge>
                      <span className="paragraph-small-primary text-fg-tertiary">
                        {relativeTime(inquiry.resolvedAt ?? inquiry.createdAt)}
                      </span>
                    </div>
                    {inquiry.rounds.length > 0 && (
                      <p className="paragraph-small-primary text-fg-secondary">
                        {inquiry.rounds.length} round{inquiry.rounds.length === 1 ? '' : 's'} of exchange before settling
                      </p>
                    )}
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
            readOnly
            onAccept={noop}
            onChallenge={noopChallenge}
            onGoDeeper={noop}
            onAskForEvidence={noop}
            onReviseProposition={noopRevise}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="paragraph-regular-primary text-fg-secondary">
              Nothing here yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
