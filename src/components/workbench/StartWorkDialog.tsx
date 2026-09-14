import { useState } from 'react';

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
import type { WorkBriefInput } from '@/lib/workGenerator';

interface StartWorkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: WorkBriefInput) => void;
}

const emptyForm: WorkBriefInput = { brief: '', context: '', desiredOutcome: '' };

export function StartWorkDialog({ open, onOpenChange, onSubmit }: StartWorkDialogProps) {
  const [form, setForm] = useState<WorkBriefInput>(emptyForm);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setForm(emptyForm);
  }

  function handleSubmit() {
    if (!form.brief.trim()) return;
    onSubmit({
      brief: form.brief.trim(),
      context: form.context.trim(),
      desiredOutcome: form.desiredOutcome.trim(),
    });
    setForm(emptyForm);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Start new work</DialogTitle>
          <DialogDescription>
            Commission a piece of work. Planner, Research and Reviewer Agents
            will work through it before it comes back to you for judgement.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="work-brief">Work brief</Label>
            <Textarea
              id="work-brief"
              autoFocus
              placeholder="What do you need done?"
              value={form.brief}
              onChange={e => setForm(f => ({ ...f, brief: e.target.value }))}
              className="min-h-[84px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="work-context">Context</Label>
            <Textarea
              id="work-context"
              placeholder="Background, constraints, anything relevant."
              value={form.context}
              onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
              className="min-h-[84px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="work-outcome">Desired outcome</Label>
            <Textarea
              id="work-outcome"
              placeholder="What does done look like?"
              value={form.desiredOutcome}
              onChange={e => setForm(f => ({ ...f, desiredOutcome: e.target.value }))}
              className="min-h-[84px]"
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!form.brief.trim()}>
            Commission this work
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
