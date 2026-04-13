export type ReportActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export const INITIAL_REPORT_ACTION_STATE: ReportActionState = {
  status: 'idle',
};
