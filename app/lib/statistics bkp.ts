import type { Session, Stats } from "./types";

function getDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function calculateStats(sessions: Session[]): Stats {
  if (sessions.length === 0) {
    return {
      sessions: 0,
      totalSeconds: 0,
      studyDays: 0,
      dailyAverageSeconds: 0,
      sessionAverageSeconds: 0,
      topTag: null,
      topTagSeconds: 0,
    };
  }

  const totalSeconds = sessions.reduce(
    (sum, session) => sum + session.durationSeconds,
    0
  );

  const days = new Set(
    sessions.map((session) => getDateKey(session.start))
  );

  const tagTotals = new Map<string, number>();

  for (const session of sessions) {
    tagTotals.set(
      session.name,
      (tagTotals.get(session.name) ?? 0) +
        session.durationSeconds
    );
  }

  const [topTagEntry] =
    [...tagTotals.entries()].sort((a, b) => b[1] - a[1]);

  return {
    sessions: sessions.length,
    totalSeconds,
    studyDays: days.size,
    dailyAverageSeconds: totalSeconds / days.size,
    sessionAverageSeconds: totalSeconds / sessions.length,
    topTag: topTagEntry?.[0] ?? null,
    topTagSeconds: topTagEntry?.[1] ?? 0,
  };
}