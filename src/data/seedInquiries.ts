import { buildInquiry } from '@/lib/inquiryGenerator';
import { minutesAgo } from '@/lib/time';
import type { Inquiry } from '@/types/domain';

// A few example ideas so Ideas / Crit queue / History aren't empty on first
// load. Built through the same generator a real submission goes through,
// then given varied statuses and timestamps for a realistic spread.

const readyIdea: Inquiry = {
  ...buildInquiry(
    'seed-1',
    {
      proposition:
        'Explore whether an organisation made up of AI agents could handle most research, planning and execution while humans retain strategic judgement.',
      context:
        'Prompted by watching how much of my own week is spent on groundwork versus the handful of calls that actually matter.',
    },
  ),
  status: 'ready',
  createdAt: minutesAgo(18),
};

const investigatingIdea: Inquiry = {
  ...buildInquiry(
    'seed-2',
    {
      proposition: 'Is it worth building a habit of writing down assumptions before starting any piece of work?',
      context: '',
    },
  ),
  status: 'investigating',
  createdAt: minutesAgo(4),
};

const acceptedIdea: Inquiry = {
  ...buildInquiry(
    'seed-3',
    {
      proposition: 'Should personal work tools default to showing less, not more?',
      context: 'Reacting to how much dashboard software seems designed to be looked at rather than used.',
    },
  ),
  status: 'accepted',
  createdAt: minutesAgo(60 * 26),
  resolvedAt: minutesAgo(60 * 25),
  humanRecord: {
    action: 'accepted',
    note: 'Agreed — restraint is the harder design problem, and the more valuable one.',
    timestamp: minutesAgo(60 * 25),
  },
};

export const initialInquiries: Inquiry[] = [readyIdea, investigatingIdea, acceptedIdea];
