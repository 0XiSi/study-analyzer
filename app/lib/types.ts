export type Session = {
  name: string;
  start: Date;
  end: Date;
  durationSeconds: number;
  notes: string;
  billable: string;
};

export type Stats = {
  sessions: number;
  totalSeconds: number;
  studyDays: number;
  dailyAverageSeconds: number;
  sessionAverageSeconds: number;
  topTag: string | null;
  topTagSeconds: number;
};