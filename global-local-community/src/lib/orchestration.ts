type WorkflowEventType = 'post.created' | 'report.created' | 'user.created';

interface WorkflowEvent<T = Record<string, unknown>> {
  type: WorkflowEventType;
  payload: T;
  createdAt: string;
}

const queue: WorkflowEvent[] = [];

export function enqueueWorkflow<T extends Record<string, unknown>>(type: WorkflowEventType, payload: T) {
  const event = { type, payload, createdAt: new Date().toISOString() } satisfies WorkflowEvent<T>;
  queue.push(event as WorkflowEvent);
  return event;
}

export function drainWorkflowQueue() {
  return queue.splice(0, queue.length);
}

export function describeWorkflow(event: WorkflowEvent) {
  switch (event.type) {
    case 'post.created':
      return ['classify content', 'check spam risk', 'store metadata'];
    case 'report.created':
      return ['append moderation queue', 'notify admin panel'];
    case 'user.created':
      return ['create onboarding checklist', 'send welcome guidance'];
    default:
      return [];
  }
}
