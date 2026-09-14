import type { Agent } from '@/types/domain';

export const agents: Agent[] = [
  {
    id: 'planner',
    name: 'Planner',
    role: 'Sequencing and prioritisation',
    status: 'working',
    currentTask: 'Re-sequencing next week’s operations backlog',
    tasksCompletedToday: 14,
    tasksBlocked: 0,
    initials: 'PL',
  },
  {
    id: 'research',
    name: 'Research',
    role: 'Evidence gathering and synthesis',
    status: 'working',
    currentTask: 'Compiling delivery-carrier performance brief',
    tasksCompletedToday: 9,
    tasksBlocked: 0,
    initials: 'RS',
  },
  {
    id: 'customer',
    name: 'Customer',
    role: 'Customer requests and communication',
    status: 'uncertain',
    currentTask: 'Assessing compensation request, order #48213',
    tasksCompletedToday: 22,
    tasksBlocked: 1,
    initials: 'CX',
  },
  {
    id: 'operations',
    name: 'Operations',
    role: 'Fulfilment, vendors, logistics',
    status: 'blocked',
    currentTask: 'Vendor waiver awaiting policy confirmation',
    tasksCompletedToday: 11,
    tasksBlocked: 1,
    initials: 'OP',
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    role: 'Policy and quality assurance',
    status: 'working',
    currentTask: 'Auditing yesterday’s approved refunds',
    tasksCompletedToday: 17,
    tasksBlocked: 0,
    initials: 'RV',
  },
];

export const agentById = new Map(agents.map(agent => [agent.id, agent]));
