import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { InquiryInput } from '@/lib/inquiryGenerator';

interface StartInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: InquiryInput) => void;
  /** Pre-fills the proposition, e.g. when revising a reframed idea. */
  initialProposition?: string;
}

const emptyForm: InquiryInput = { proposition: '', context: '' };

export function StartInquiryDialog({
  open,
  onOpenChange,
  onSubmit,
  initialProposition,
}: StartInquiryDialogProps) {
  const [form, setForm] = useState<InquiryInput>(emptyForm);

  useEffect(() => {
    if (open) setForm({ proposition: initialProposition ?? '', context: '' });
  }, [open, initialProposition]);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setForm(emptyForm);
  }

  function handleSubmit() {
    if (!form.proposition.trim()) return;
    onSubmit({ proposition: form.proposition.trim(), context: form.context.trim() });
    setForm(emptyForm);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>New inquiry</DialogTitle>
          <DialogDescription>
            Give the organisation something you're thinking about. It will be
            interpreted, grounded in relevant domain knowledge, challenged,
            and returned as a stronger version of the thinking — not a single
            answer.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="inquiry-proposition">What are you thinking about?</Label>
            <Textarea
              id="inquiry-proposition"
              autoFocus
              placeholder="e.g. Explore whether an organisation made up of AI agents could handle most research, planning and execution while humans retain strategic judgement."
              value={form.proposition}
              onChange={e => setForm(f => ({ ...f, proposition: e.target.value }))}
              className="min-h-[104px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="inquiry-context">Context (optional)</Label>
            <Textarea
              id="inquiry-context"
              placeholder="Anything relevant — what prompted this, constraints, your current thinking."
              value={form.context}
              onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
              className="min-h-[84px]"
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!form.proposition.trim()}>
            Begin investigation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
