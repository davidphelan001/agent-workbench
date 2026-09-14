import { Button } from '@/components/ui/button';
import { IconShell } from '@/components/ui/icon-shell';
import { Icon } from '@/components/ui/icon';
import { IdeaConstellation } from '@/components/workbench/IdeaConstellation';
import { InquiryDetail } from '@/components/workbench/InquiryDetail';
import type { Inquiry } from '@/types/domain';

interface IdeasViewProps {
  inquiries: Inquiry[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onStartInquiry: () => void;
  onAccept: (id: string, note?: string) => void;
  onChallenge: (id: string, note: string) => void;
  onGoDeeper: (id: string, note?: string) => void;
  onAskForEvidence: (id: string, note?: string) => void;
  onReviseProposition: (proposition: string) => void;
}

export function IdeasView({
  inquiries,
  selectedId,
  onSelect,
  onStartInquiry,
  onAccept,
  onChallenge,
  onGoDeeper,
  onAskForEvidence,
  onReviseProposition,
}: IdeasViewProps) {
  const selected = inquiries.find(i => i.id === selectedId) ?? null;

  if (selected) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-stroke-divider shrink-0 border-b px-8 py-4">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="label-regular-primary text-fg-secondary hover:text-fg-primary flex items-center gap-1.5">
            <IconShell type="neutral" size="sm">
              <Icon icon="arrow_back" />
            </IconShell>
            All ideas
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <InquiryDetail
            key={selected.id}
            inquiry={selected}
            onAccept={onAccept}
            onChallenge={onChallenge}
            onGoDeeper={onGoDeeper}
            onAskForEvidence={onAskForEvidence}
            onReviseProposition={onReviseProposition}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mx-auto flex w-full max-w-[1120px] items-start justify-between px-8 pt-14">
        <div>
          <h1 className="headings-h2-regular text-fg-primary">Ideas</h1>
          <p className="paragraph-regular-primary text-fg-secondary mt-1">
            What you’re thinking about.
          </p>
        </div>
        <Button onClick={onStartInquiry} className="shrink-0">
          New idea
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        {inquiries.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="paragraph-large-primary text-fg-tertiary">
              Nothing here yet.
            </p>
          </div>
        ) : (
          <IdeaConstellation inquiries={inquiries} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}
