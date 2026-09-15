import type { Agent } from '@/types/domain';

export const agents: Agent[] = [
  {
    id: 'planner',
    name: 'Planner',
    role: 'Interprets and structures ideas',
    status: 'working',
    currentTask: 'Structuring today’s open lines of thinking',
    tasksCompletedToday: 6,
    tasksBlocked: 0,
    initials: 'PL',
  },
  {
    id: 'research',
    name: 'Research',
    role: 'Grounds ideas in relevant knowledge',
    status: 'working',
    currentTask: 'Surfacing perspectives for an active idea',
    tasksCompletedToday: 5,
    tasksBlocked: 0,
    initials: 'RS',
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    role: 'Critiques and stress-tests thinking',
    status: 'uncertain',
    currentTask: 'Weighing pushback on the AI-organisation idea',
    tasksCompletedToday: 7,
    tasksBlocked: 0,
    initials: 'RV',
  },
];

export const agentById = new Map(agents.map(agent => [agent.id, agent]));
