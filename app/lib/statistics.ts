import type { Session } from "./types";
import React from "react";

/* =========================================================
   Configuration
========================================================= */

const SHORT_SESSION_SECONDS = 25 * 60;
const LONG_SESSION_SECONDS = 45 * 60;

const FRAGMENTATION_GAP_SECONDS = 15 * 60;
const LONG_GAP_SECONDS = 60 * 60;

const FOUR_HOURS = 4 * 60 * 60;
const FIVE_HOURS = 5 * 60 * 60;
const THREE_HOURS = 3 * 60 * 60;

/* =========================================================
   Types
========================================================= */

export type TrendDirection =
  | "بالا"
  | "پایین"
  | "پایدار";

export interface DailyRow {
  date: string;

  totalSeconds: number;
  sessionCount: number;
  averageSessionSeconds: number;
  subjectCount: number;

  changeFromPreviousDayPercent: number | null;

  distanceFromMeanSeconds: number;
  distanceFromMeanPercent: number;

  movingAverage3: number | null;
  movingAverage5: number | null;
  movingAverage7: number | null;
  movingAverage14: number | null;
}

export interface SubjectAnalysis {
  subject: string;

  totalSeconds: number;
  sessionCount: number;
  activeDays: number;

  percentageOfTotal: number;

  averagePerActiveDaySeconds: number;

  meanSessionSeconds: number;
  medianSessionSeconds: number;

  shortestSessionSeconds: number;
  longestSessionSeconds: number;

  consistencyScore: number;

  averageGapDays: number;
  maxGapDays: number;
  longestStreak: number;

  trendSlope: number;
  trend: TrendDirection;

  shortSessionPercentage: number;
  longSessionPercentage: number;
}

export interface TimeBucketAnalysis {
  totalSeconds: number;
  sessionCount: number;
  averageSessionSeconds: number;
  percentageOfTotal: number;
}

export interface SessionBuckets {
  under15: number;
  from15to25: number;
  from25to30: number;
  from30to45: number;
  over45: number;
}

export interface SessionStructureAnalysis {
  meanGapSeconds: number;
  medianGapSeconds: number;
  longestGapSeconds: number;
  longGapCount: number;

  consecutiveSessionCount: number;
  longestConsecutiveSessionStreak: number;

  shortSessions: number;
  mediumSessions: number;
  longSessions: number;

  shortPercentage: number;
  mediumPercentage: number;
  longPercentage: number;

  buckets: SessionBuckets;

  under25Percentage: number;

  fragmentationScore: number;
  fragmentationLevel:
    | "low"
    | "moderate"
    | "high";

  studyStyle:
    | "short-block"
    | "long-block"
    | "mixed";
}

export interface ConsistencyAnalysis {
  daysAboveMean: number;
  daysBelowMean: number;

  daysAbove4Hours: number;
  daysAbove5Hours: number;
  daysBelow3Hours: number;

  veryWeakDays: number;

  activeDayRatio: number;

  consistencyScore: number;
}

export interface DayAnalysis extends DailyRow {
  subjects: string[];
  firstSessionStart: string | null;
  lastSessionEnd: string | null;

  longestSessionSeconds: number;
  shortestSessionSeconds: number;
}

export interface HalfStats {
  startDate: string | null;
  endDate: string | null;

  totalSeconds: number;
  dailyAverageSeconds: number;

  sessionCount: number;
  averageSessionSeconds: number;

  standardDeviationSeconds: number;

  subjectDistribution: Record<string, number>;
}

export interface HalfComparison {
  first: HalfStats;
  second: HalfStats;

  dailyAverageChangePercent: number;
  totalChangePercent: number;
  sessionAverageChangePercent: number;
}

export interface CapacityAnalysis {
  minimumReliableSeconds: number;
  typicalSeconds: number;
  currentCapacitySeconds: number;
  peakSeconds: number;

  target4HoursFeasibility: number;
  target5HoursFeasibility: number;
  target6HoursFeasibility: number;
}

export interface ProgressAnalysis {
  regressionSlope: number;
  trend: TrendDirection;

  firstHalfAverageSeconds: number;
  secondHalfAverageSeconds: number;

  changePercent: number;

  outlierAdjustedFirstHalfAverage: number;
  outlierAdjustedSecondHalfAverage: number;

  outlierAdjustedChangePercent: number;

  sessionCountChangePercent: number;
  averageSessionDurationChangePercent: number;
}

export interface SessionCorrelation {
  sessionCountVsTotal: number;
  sessionDurationVsTotal: number;

  strongerFactor:
    | "session-count"
    | "session-duration"
    | "similar"
    | "insufficient-data";
}

export interface DayBoundaryAnalysis {
  averageFirstStartMinutes: number | null;
  medianFirstStartMinutes: number | null;

  averageLastEndMinutes: number | null;
  medianLastEndMinutes: number | null;

  startTimeVsStudyCorrelation: number;
  endTimeVsStudyCorrelation: number;
}

export interface Finding {
  title: string;
  description: string;
  evidence: string[];
}

export interface ProblemPriority {
  id: React.Key | null | undefined;
  problem: string;
  severity: number;
  evidence: string[];
  impact: string;
  recommendation: string;
}

export interface SevenDayTargets {
  minimumDailySeconds: number;
  normalDailySeconds: number;
  idealDailySeconds: number;
  reasonableMaximumDailySeconds: number;

  minimumSessions: number;

  maximumAcceptableVariationPercent: number;
}

export interface OverviewStats {
  sessions: number;
  totalSeconds: number;
  studyDays: number;

  calendarDays: number;

  dailyAverageSeconds: number;
  activeDayAverageSeconds: number;

  dailyMedianSeconds: number;
  dailyStandardDeviationSeconds: number;
  dailyVarianceSeconds: number;
  dailyCoefficientOfVariation: number;

  dailyMinimumSeconds: number;
  dailyMaximumSeconds: number;

  outlierAdjustedMeanSeconds: number;

  sessionAverageSeconds: number;
  sessionMedianSeconds: number;

  shortSessions: number;
  mediumSessions: number;
  longSessions: number;

  shortPercentage: number;
  mediumPercentage: number;
  longPercentage: number;

  topSubject: string | null;
  topSubjectSeconds: number;
}

export interface AnalysisStats {
  /* Original stats */
  sessions: number;
  totalSeconds: number;
  studyDays: number;
  dailyAverageSeconds: number;
  sessionAverageSeconds: number;
  topTag: string | null;
  topTagSeconds: number;

  /* Overview */
  overview: OverviewStats;

  /* Daily */
  daily: DayAnalysis[];

  /* Trend */
  trend: {
    direction: TrendDirection;
    slope: number;

    movingAverage3: number | null;
    movingAverage5: number | null;
    movingAverage7: number | null;
    movingAverage14: number | null;
  };

  /* Subjects */
  subjects: SubjectAnalysis[];

  /* Distribution */
  distribution: Record<string, number>;

  /* Sessions */
  sessionStructure: SessionStructureAnalysis;

  /* Time of day */
  timeOfDay: Record<
    string,
    TimeBucketAnalysis
  >;

  /* Day boundaries */
  dayBoundaries: DayBoundaryAnalysis;

  /* Consistency */
  consistency: ConsistencyAnalysis;

  /* Best / worst */
  bestDays: DayAnalysis[];
  worstDays: DayAnalysis[];

  /* First / second half */
  halves: HalfComparison;

  /* Capacity */
  capacity: CapacityAnalysis;

  /* Progress */
  progress: ProgressAnalysis;

  /* Correlation */
  sessionCorrelation: SessionCorrelation;

  /* Behavioral profile */
  profile: Finding[];

  /* Strengths / weaknesses */
  strengths: Finding[];
  weaknesses: Finding[];

  /* Priorities */
  priorities: ProblemPriority[];

  /* Next 7 days */
  targets7Days: SevenDayTargets;
}

/* =========================================================
   Basic helpers
========================================================= */

function normalizeTag(value: string): string {
  return value.trim().toLowerCase();
}

function isExcluded(session: Session): boolean {
  // return EXCLUDED_TAGS.has(normalizeTag(session.name));
    return false;
}

function getDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseDateKey(key: string): Date {
  const [year, month, day] = key
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function formatDate(date: Date): string {
  return getDateKey(date);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      (sorted[middle - 1] + sorted[middle]) / 2
    );
  }

  return sorted[middle];
}

function variance(values: number[]): number {
  if (values.length === 0) return 0;

  const avg = mean(values);

  return mean(
    values.map((value) => (value - avg) ** 2)
  );
}

function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

function coefficientOfVariation(
  values: number[]
): number {
  const avg = mean(values);

  if (avg === 0) return 0;

  return standardDeviation(values) / avg;
}

function percentile(
  values: number[],
  percentileValue: number
): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const index =
    (percentileValue / 100) *
    (sorted.length - 1);

  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;

  return (
    sorted[lower] * (1 - weight) +
    sorted[upper] * weight
  );
}

function percentage(
  value: number,
  total: number
): number {
  return total === 0
    ? 0
    : (value / total) * 100;
}

function percentageChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) return null;

  return ((current - previous) / previous) * 100;
}

/* =========================================================
   Moving average
========================================================= */

function movingAverage(
  values: number[],
  window: number
): (number | null)[] {
  return values.map((_, index) => {
    if (index < window - 1) {
      return null;
    }

    return mean(
      values.slice(
        index - window + 1,
        index + 1
      )
    );
  });
}

/* =========================================================
   Linear regression
========================================================= */

function regressionSlope(
  values: number[]
): number {
  if (values.length < 2) return 0;

  const xMean = (values.length - 1) / 2;
  const yMean = mean(values);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < values.length; i++) {
    const x = i - xMean;
    const y = values[i] - yMean;

    numerator += x * y;
    denominator += x * x;
  }

  return denominator === 0
    ? 0
    : numerator / denominator;
}

function detectTrend(
  values: number[]
): TrendDirection {
  if (values.length < 2) {
    return "پایدار";
  }

  const slope = regressionSlope(values);
  const avg = mean(values);

  const threshold = avg * 0.01;

  if (slope > threshold) return "بالا";
  if (slope < -threshold) return "پایین";

  return "پایدار";
}

/* =========================================================
   Correlation
========================================================= */

function correlation(
  a: number[],
  b: number[]
): number {
  if (
    a.length !== b.length ||
    a.length < 2
  ) {
    return 0;
  }

  const meanA = mean(a);
  const meanB = mean(b);

  let numerator = 0;
  let denominatorA = 0;
  let denominatorB = 0;

  for (let i = 0; i < a.length; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;

    numerator += da * db;
    denominatorA += da ** 2;
    denominatorB += db ** 2;
  }

  const denominator = Math.sqrt(
    denominatorA * denominatorB
  );

  if (denominator === 0) return 0;

  return numerator / denominator;
}

/* =========================================================
   Outlier handling
========================================================= */

function getNormalValues(
  values: number[]
): number[] {
  if (values.length < 4) {
    return [...values];
  }

  const q1 = percentile(values, 25);
  const q3 = percentile(values, 75);
  const iqr = q3 - q1;

  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;

  return values.filter(
    (value) =>
      value >= lower &&
      value <= upper
  );
}

/* =========================================================
   Time helpers
========================================================= */

function minutesFromMidnight(
  date: Date
): number {
  return (
    date.getHours() * 60 +
    date.getMinutes() +
    date.getSeconds() / 60
  );
}

function getTimeBucket(
  date: Date
): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 8) {
    return "earlyMorning";
  }

  if (hour >= 8 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 14) {
    return "noon";
  }

  if (hour >= 14 && hour < 17) {
    return "afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "evening";
  }

  if (hour >= 21) {
    return "night";
  }

  return "lateNight";
}

/* =========================================================
   Empty result
========================================================= */

function emptyStats(): AnalysisStats {
  return {
    sessions: 0,
    totalSeconds: 0,
    studyDays: 0,
    dailyAverageSeconds: 0,
    sessionAverageSeconds: 0,
    topTag: null,
    topTagSeconds: 0,

    overview: {
      sessions: 0,
      totalSeconds: 0,
      studyDays: 0,
      calendarDays: 0,

      dailyAverageSeconds: 0,
      activeDayAverageSeconds: 0,

      dailyMedianSeconds: 0,
      dailyStandardDeviationSeconds: 0,
      dailyVarianceSeconds: 0,
      dailyCoefficientOfVariation: 0,

      dailyMinimumSeconds: 0,
      dailyMaximumSeconds: 0,

      outlierAdjustedMeanSeconds: 0,

      sessionAverageSeconds: 0,
      sessionMedianSeconds: 0,

      shortSessions: 0,
      mediumSessions: 0,
      longSessions: 0,

      shortPercentage: 0,
      mediumPercentage: 0,
      longPercentage: 0,

      topSubject: null,
      topSubjectSeconds: 0,
    },

    daily: [],

    trend: {
      direction: "پایدار",
      slope: 0,
      movingAverage3: null,
      movingAverage5: null,
      movingAverage7: null,
      movingAverage14: null,
    },

    subjects: [],
    distribution: {},

    sessionStructure: {
      meanGapSeconds: 0,
      medianGapSeconds: 0,
      longestGapSeconds: 0,
      longGapCount: 0,

      consecutiveSessionCount: 0,
      longestConsecutiveSessionStreak: 0,

      shortSessions: 0,
      mediumSessions: 0,
      longSessions: 0,

      shortPercentage: 0,
      mediumPercentage: 0,
      longPercentage: 0,

      buckets: {
        under15: 0,
        from15to25: 0,
        from25to30: 0,
        from30to45: 0,
        over45: 0,
      },

      under25Percentage: 0,

      fragmentationScore: 0,
      fragmentationLevel: "low",
      studyStyle: "mixed",
    },

    timeOfDay: {},

    dayBoundaries: {
      averageFirstStartMinutes: null,
      medianFirstStartMinutes: null,
      averageLastEndMinutes: null,
      medianLastEndMinutes: null,
      startTimeVsStudyCorrelation: 0,
      endTimeVsStudyCorrelation: 0,
    },

    consistency: {
      daysAboveMean: 0,
      daysBelowMean: 0,
      daysAbove4Hours: 0,
      daysAbove5Hours: 0,
      daysBelow3Hours: 0,
      veryWeakDays: 0,
      activeDayRatio: 0,
      consistencyScore: 0,
    },

    bestDays: [],
    worstDays: [],

    halves: {
      first: emptyHalf(),
      second: emptyHalf(),
      dailyAverageChangePercent: 0,
      totalChangePercent: 0,
      sessionAverageChangePercent: 0,
    },

    capacity: {
      minimumReliableSeconds: 0,
      typicalSeconds: 0,
      currentCapacitySeconds: 0,
      peakSeconds: 0,
      target4HoursFeasibility: 0,
      target5HoursFeasibility: 0,
      target6HoursFeasibility: 0,
    },

    progress: {
      regressionSlope: 0,
      trend: "پایدار",
      firstHalfAverageSeconds: 0,
      secondHalfAverageSeconds: 0,
      changePercent: 0,
      outlierAdjustedFirstHalfAverage: 0,
      outlierAdjustedSecondHalfAverage: 0,
      outlierAdjustedChangePercent: 0,
      sessionCountChangePercent: 0,
      averageSessionDurationChangePercent: 0,
    },

    sessionCorrelation: {
      sessionCountVsTotal: 0,
      sessionDurationVsTotal: 0,
      strongerFactor: "insufficient-data",
    },

    profile: [],
    strengths: [],
    weaknesses: [],
    priorities: [],

    targets7Days: {
      minimumDailySeconds: 0,
      normalDailySeconds: 0,
      idealDailySeconds: 0,
      reasonableMaximumDailySeconds: 0,
      minimumSessions: 0,
      maximumAcceptableVariationPercent: 0,
    },
  };
}

function emptyHalf(): HalfStats {
  return {
    startDate: null,
    endDate: null,
    totalSeconds: 0,
    dailyAverageSeconds: 0,
    sessionCount: 0,
    averageSessionSeconds: 0,
    standardDeviationSeconds: 0,
    subjectDistribution: {},
  };
}

/* =========================================================
   Main function
========================================================= */

export function calculateStats(
  rawSessions: Session[]
): AnalysisStats {
  /*
   * Important:
   * Excluded users/tags are removed before ANY calculation.
   */
  const sessions = rawSessions
    .filter((session) => !isExcluded(session))
    .filter(
      (session) =>
        session.durationSeconds > 0
    )
    .sort(
      (a, b) =>
        a.start.getTime() -
        b.start.getTime()
    );

  if (sessions.length === 0) {
    return emptyStats();
  }

  /* =======================================================
     Basic values
  ======================================================= */

  const totalSeconds = sessions.reduce(
    (sum, session) =>
      sum + session.durationSeconds,
    0
  );

  const sessionDurations = sessions.map(
    (session) => session.durationSeconds
  );

  /* =======================================================
     Calendar range
  ======================================================= */

  const firstDate = new Date(sessions[0].start);
  firstDate.setHours(0, 0, 0, 0);

  const lastDate = new Date(
    sessions[sessions.length - 1].start
  );
  lastDate.setHours(0, 0, 0, 0);

  const calendarDates: string[] = [];

  for (
    let date = new Date(firstDate);
    date <= lastDate;
    date = addDays(date, 1)
  ) {
    calendarDates.push(formatDate(date));
  }

  /* =======================================================
     Group sessions by day
  ======================================================= */

  const sessionsByDay =
    new Map<string, Session[]>();

  for (const session of sessions) {
    const key = getDateKey(session.start);

    const existing =
      sessionsByDay.get(key) ?? [];

    existing.push(session);

    sessionsByDay.set(key, existing);
  }

  const dailyValues = calendarDates.map(
    (date) =>
      sessionsByDay
        .get(date)
        ?.reduce(
          (sum, session) =>
            sum + session.durationSeconds,
          0
        ) ?? 0
  );

  const studyDays = dailyValues.filter(
    (value) => value > 0
  ).length;

  const calendarDays = calendarDates.length;

  const dailyAverageSeconds =
    mean(dailyValues);

  const activeDayValues =
    dailyValues.filter(
      (value) => value > 0
    );

  const activeDayAverageSeconds =
    mean(activeDayValues);

  /* =======================================================
     Moving averages
  ======================================================= */

  const ma3 = movingAverage(
    dailyValues,
    3
  );

  const ma5 = movingAverage(
    dailyValues,
    5
  );

  const ma7 = movingAverage(
    dailyValues,
    7
  );

  const ma14 = movingAverage(
    dailyValues,
    14
  );

  /* =======================================================
     Daily rows
  ======================================================= */

  const daily: DayAnalysis[] =
    calendarDates.map(
      (date, index) => {
        const daySessions =
          sessionsByDay.get(date) ?? [];

        const totalDaySeconds =
          dailyValues[index];

        const previous =
          index > 0
            ? dailyValues[index - 1]
            : null;

        const subjects = [
          ...new Set(
            daySessions.map(
              (session) => session.name
            )
          ),
        ];

        const firstSession =
          daySessions[0];

        const lastSession =
          daySessions[
            daySessions.length - 1
          ];

        const firstStart =
          firstSession?.start ?? null;

        const lastEnd =
          lastSession
            ? new Date(
                lastSession.start.getTime() +
                  lastSession.durationSeconds *
                    1000
              )
            : null;

        const durations =
          daySessions.map(
            (session) =>
              session.durationSeconds
          );

        return {
          date,

          totalSeconds: totalDaySeconds,

          sessionCount:
            daySessions.length,

          averageSessionSeconds:
            daySessions.length > 0
              ? mean(durations)
              : 0,

          subjectCount:
            subjects.length,

          changeFromPreviousDayPercent:
            previous === null
              ? null
              : percentageChange(
                  totalDaySeconds,
                  previous
                ),

          distanceFromMeanSeconds:
            totalDaySeconds -
            dailyAverageSeconds,

          distanceFromMeanPercent:
            percentage(
              totalDaySeconds -
                dailyAverageSeconds,
              dailyAverageSeconds
            ),

          movingAverage3: ma3[index],
          movingAverage5: ma5[index],
          movingAverage7: ma7[index],
          movingAverage14: ma14[index],

          subjects,

          firstSessionStart:
            firstStart
              ? firstStart.toISOString()
              : null,

          lastSessionEnd:
            lastEnd
              ? lastEnd.toISOString()
              : null,

          longestSessionSeconds:
            durations.length > 0
              ? Math.max(...durations)
              : 0,

          shortestSessionSeconds:
            durations.length > 0
              ? Math.min(...durations)
              : 0,
        };
      }
    );

  /* =======================================================
     Daily statistics
  ======================================================= */

  const dailyNormalValues =
    getNormalValues(dailyValues);

  const dailyMean =
    mean(dailyValues);

  const dailyMedian =
    median(dailyValues);

  const dailyStd =
    standardDeviation(dailyValues);

  const dailyVariance =
    variance(dailyValues);

  const dailyCV =
    coefficientOfVariation(
      dailyValues
    );

  const dailyMin =
    Math.min(...dailyValues);

  const dailyMax =
    Math.max(...dailyValues);

  /* =======================================================
     Session classification
  ======================================================= */

  const shortSessions =
    sessionDurations.filter(
      (seconds) =>
        seconds < SHORT_SESSION_SECONDS
    ).length;

  const mediumSessions =
    sessionDurations.filter(
      (seconds) =>
        seconds >=
          SHORT_SESSION_SECONDS &&
        seconds <= LONG_SESSION_SECONDS
    ).length;

  const longSessions =
    sessionDurations.filter(
      (seconds) =>
        seconds > LONG_SESSION_SECONDS
    ).length;

  /* =======================================================
     Session buckets
  ======================================================= */

  const buckets: SessionBuckets = {
    under15: 0,
    from15to25: 0,
    from25to30: 0,
    from30to45: 0,
    over45: 0,
  };

  for (const seconds of sessionDurations) {
    if (seconds < 15 * 60) {
      buckets.under15++;
    } else if (seconds < 25 * 60) {
      buckets.from15to25++;
    } else if (seconds < 30 * 60) {
      buckets.from25to30++;
    } else if (seconds <= 45 * 60) {
      buckets.from30to45++;
    } else {
      buckets.over45++;
    }
  }

  /* =======================================================
     Gaps between sessions
  ======================================================= */

  const gaps: number[] = [];

  let consecutiveSessionCount = 0;
  let currentConsecutive = 0;
  let longestConsecutive = 0;

  for (
    let i = 1;
    i < sessions.length;
    i++
  ) {
    const previous = sessions[i - 1];
    const current = sessions[i];

    const previousEnd =
      previous.start.getTime() +
      previous.durationSeconds * 1000;

    const gap =
      current.start.getTime() -
      previousEnd;

    if (gap >= 0) {
      gaps.push(gap / 1000);
    }

    if (
      gap >= 0 &&
      gap <= FRAGMENTATION_GAP_SECONDS * 1000
    ) {
      consecutiveSessionCount++;
      currentConsecutive++;

      longestConsecutive =
        Math.max(
          longestConsecutive,
          currentConsecutive
        );
    } else {
      currentConsecutive = 0;
    }
  }

  const meanGap = mean(gaps);
  const medianGap = median(gaps);
  const longestGap =
    gaps.length > 0
      ? Math.max(...gaps)
      : 0;

  const longGapCount = gaps.filter(
    (gap) =>
      gap >= LONG_GAP_SECONDS
  ).length;

  /* =======================================================
     Fragmentation
  ======================================================= */

  const under25Percentage =
    percentage(
      sessionDurations.filter(
        (seconds) =>
          seconds < 25 * 60
      ).length,
      sessions.length
    );

  /*
   * Fragmentation score:
   * - percentage of short sessions
   * - session density
   * - median session duration
   *
   * 0 = very little fragmentation
   * 100 = very fragmented
   */

  const sessionDensity =
    studyDays === 0
      ? 0
      : sessions.length / studyDays;

  const densityScore = Math.min(
    100,
    sessionDensity * 10
  );

  const shortScore =
    under25Percentage;

  const durationScore =
    median(sessionDurations) === 0
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            100 -
              (median(sessionDurations) /
                (45 * 60)) *
                100
          )
        );

  const fragmentationScore =
    shortScore * 0.5 +
    densityScore * 0.2 +
    durationScore * 0.3;

  let fragmentationLevel:
    | "low"
    | "moderate"
    | "high";

  if (fragmentationScore >= 65) {
    fragmentationLevel = "high";
  } else if (
    fragmentationScore >= 40
  ) {
    fragmentationLevel = "moderate";
  } else {
    fragmentationLevel = "low";
  }

  let studyStyle:
    | "short-block"
    | "long-block"
    | "mixed";

  const longPercentage =
    percentage(
      longSessions,
      sessions.length
    );

  if (
    under25Percentage >= 60
  ) {
    studyStyle = "short-block";
  } else if (
    longPercentage >= 40
  ) {
    studyStyle = "long-block";
  } else {
    studyStyle = "mixed";
  }

  /* =======================================================
     Subject analysis
  ======================================================= */

  const subjectSessions =
    new Map<string, Session[]>();

  for (const session of sessions) {
    const existing =
      subjectSessions.get(session.name) ??
      [];

    existing.push(session);

    subjectSessions.set(
      session.name,
      existing
    );
  }

  const subjects: SubjectAnalysis[] =
    [...subjectSessions.entries()]
      .map(
        ([subject, subjectData]) => {
          const durations =
            subjectData.map(
              (session) =>
                session.durationSeconds
            );

          const totalSubjectSeconds =
            durations.reduce(
              (sum, value) =>
                sum + value,
              0
            );

          const activeDates = [
            ...new Set(
              subjectData.map(
                (session) =>
                  getDateKey(session.start)
              )
            ),
          ].sort();

          const gaps: number[] = [];

          for (
            let i = 1;
            i < activeDates.length;
            i++
          ) {
            const previous =
              parseDateKey(
                activeDates[i - 1]
              );

            const current =
              parseDateKey(
                activeDates[i]
              );

            const diff =
              Math.round(
                (current.getTime() -
                  previous.getTime()) /
                  86400000
              );

            gaps.push(
              Math.max(0, diff - 1)
            );
          }

          let longestStreak = 0;
          let currentStreak = 0;

          for (
            let i = 0;
            i < activeDates.length;
            i++
          ) {
            if (i === 0) {
              currentStreak = 1;
            } else {
              const previous =
                parseDateKey(
                  activeDates[i - 1]
                );

              const current =
                parseDateKey(
                  activeDates[i]
                );

              const diff =
                Math.round(
                  (current.getTime() -
                    previous.getTime()) /
                    86400000
                );

              if (diff === 1) {
                currentStreak++;
              } else {
                currentStreak = 1;
              }
            }

            longestStreak =
              Math.max(
                longestStreak,
                currentStreak
              );
          }

          const subjectDailyValues =
            calendarDates.map((date) =>
              subjectData
                .filter(
                  (session) =>
                    getDateKey(
                      session.start
                    ) === date
                )
                .reduce(
                  (sum, session) =>
                    sum +
                    session.durationSeconds,
                  0
                )
            );

          const slope =
            regressionSlope(
              subjectDailyValues
            );

          const trend =
            detectTrend(
              subjectDailyValues
            );

          const shortCount =
            durations.filter(
              (value) =>
                value <
                SHORT_SESSION_SECONDS
            ).length;

          const longCount =
            durations.filter(
              (value) =>
                value >
                LONG_SESSION_SECONDS
            ).length;

          const activeDayRatio =
            activeDates.length /
            calendarDays;

          const gapScore =
            1 /
            (1 +
              (mean(gaps) || 0));

          const consistencyScore =
            Math.round(
              Math.min(
                100,
                activeDayRatio * 70 +
                  gapScore * 30
              )
            );

          return {
            subject,

            totalSeconds:
              totalSubjectSeconds,

            sessionCount:
              subjectData.length,

            activeDays:
              activeDates.length,

            percentageOfTotal:
              percentage(
                totalSubjectSeconds,
                totalSeconds
              ),

            averagePerActiveDaySeconds:
              totalSubjectSeconds /
              activeDates.length,

            meanSessionSeconds:
              mean(durations),

            medianSessionSeconds:
              median(durations),

            shortestSessionSeconds:
              Math.min(...durations),

            longestSessionSeconds:
              Math.max(...durations),

            consistencyScore,

            averageGapDays:
              mean(gaps),

            maxGapDays:
              gaps.length > 0
                ? Math.max(...gaps)
                : 0,

            longestStreak,

            trendSlope: slope,
            trend,

            shortSessionPercentage:
              percentage(
                shortCount,
                durations.length
              ),

            longSessionPercentage:
              percentage(
                longCount,
                durations.length
              ),
          };
        }
      )
      .sort(
        (a, b) =>
          b.totalSeconds -
          a.totalSeconds
      );

  /* =======================================================
     Distribution
  ======================================================= */

  const distribution: Record<
    string,
    number
  > = {};

  for (const subject of subjects) {
    distribution[subject.subject] =
      subject.percentageOfTotal;
  }

  /* =======================================================
     Time of day
  ======================================================= */

  const bucketNames = [
    "earlyMorning",
    "morning",
    "noon",
    "afternoon",
    "evening",
    "night",
    "lateNight",
  ];

  const timeOfDay: Record<
    string,
    TimeBucketAnalysis
  > = {};

  for (const bucket of bucketNames) {
    timeOfDay[bucket] = {
      totalSeconds: 0,
      sessionCount: 0,
      averageSessionSeconds: 0,
      percentageOfTotal: 0,
    };
  }

  for (const session of sessions) {
    const bucket =
      getTimeBucket(session.start);

    timeOfDay[bucket].totalSeconds +=
      session.durationSeconds;

    timeOfDay[bucket].sessionCount++;
  }

  for (const bucket of bucketNames) {
    const data =
      timeOfDay[bucket];

    data.averageSessionSeconds =
      data.sessionCount > 0
        ? data.totalSeconds /
          data.sessionCount
        : 0;

    data.percentageOfTotal =
      percentage(
        data.totalSeconds,
        totalSeconds
      );
  }

  /* =======================================================
     Start / end of day
  ======================================================= */

  const firstStarts: number[] = [];
  const lastEnds: number[] = [];

  for (const day of daily) {
    if (
      day.firstSessionStart &&
      day.lastSessionEnd
    ) {
      const first =
        new Date(
          day.firstSessionStart
        );

      const last =
        new Date(
          day.lastSessionEnd
        );

      firstStarts.push(
        minutesFromMidnight(first)
      );

      lastEnds.push(
        minutesFromMidnight(last)
      );
    }
  }

  const activeDailyRows =
    daily.filter(
      (day) =>
        day.totalSeconds > 0
    );

  const startStudyCorrelation =
    correlation(
      firstStarts,
      activeDailyRows.map(
        (day) => day.totalSeconds
      )
    );

  const endStudyCorrelation =
    correlation(
      lastEnds,
      activeDailyRows.map(
        (day) => day.totalSeconds
      )
    );

  /* =======================================================
     Consistency
  ======================================================= */

  const daysAboveMean =
    dailyValues.filter(
      (value) =>
        value > dailyAverageSeconds
    ).length;

  const daysBelowMean =
    dailyValues.filter(
      (value) =>
        value < dailyAverageSeconds
    ).length;

  const daysAbove4Hours =
    dailyValues.filter(
      (value) =>
        value >= FOUR_HOURS
    ).length;

  const daysAbove5Hours =
    dailyValues.filter(
      (value) =>
        value >= FIVE_HOURS
    ).length;

  const daysBelow3Hours =
    dailyValues.filter(
      (value) =>
        value < THREE_HOURS
    ).length;

  const veryWeakThreshold =
    Math.max(
      2 * 60 * 60,
      dailyAverageSeconds * 0.5
    );

  const veryWeakDays =
    dailyValues.filter(
      (value) =>
        value < veryWeakThreshold
    ).length;

  /*
   * Consistency is primarily based on:
   * - active days
   * - distance from mean
   * - low extreme days
   */

  const activeDayRatio =
    studyDays / calendarDays;

  const below3Ratio =
    daysBelow3Hours /
    calendarDays;

  const consistencyScore =
    Math.round(
      Math.max(
        0,
        Math.min(
          100,
          activeDayRatio * 60 +
            (1 -
              Math.min(
                1,
                dailyCV
              )) *
              25 +
            (1 - below3Ratio) * 15
        )
      )
    );

  /* =======================================================
     Best / worst days
  ======================================================= */

  const bestDays = [...daily]
    .filter(
      (day) =>
        day.totalSeconds > 0
    )
    .sort(
      (a, b) =>
        b.totalSeconds -
        a.totalSeconds
    )
    .slice(0, 3);

  const worstDays = [...daily]
    .sort(
      (a, b) =>
        a.totalSeconds -
        b.totalSeconds
    )
    .slice(0, 3);

  /* =======================================================
     First / second half
  ======================================================= */

  const midpoint =
    Math.ceil(calendarDays / 2);

  const firstHalfDays =
    daily.slice(0, midpoint);

  const secondHalfDays =
    daily.slice(midpoint);

  function calculateHalf(
    rows: DayAnalysis[]
  ): HalfStats {
    const values =
      rows.map(
        (row) => row.totalSeconds
      );

    const sessionsInHalf =
      rows.reduce(
        (sum, row) =>
          sum + row.sessionCount,
        0
      );

    const total =
      values.reduce(
        (sum, value) =>
          sum + value,
        0
      );

    const subjectSeconds: Record<
      string,
      number
    > = {};

    for (const row of rows) {
      const daySessions =
        sessionsByDay.get(
          row.date
        ) ?? [];

      for (const session of daySessions) {
        subjectSeconds[
          session.name
        ] =
          (subjectSeconds[
            session.name
          ] ?? 0) +
          session.durationSeconds;
      }
    }

    const distribution: Record<
      string,
      number
    > = {};

    for (const [
      subject,
      seconds,
    ] of Object.entries(
      subjectSeconds
    )) {
      distribution[subject] =
        percentage(seconds, total);
    }

    return {
      startDate:
        rows[0]?.date ?? null,

      endDate:
        rows[rows.length - 1]?.date ??
        null,

      totalSeconds: total,

      dailyAverageSeconds:
        mean(values),

      sessionCount:
        sessionsInHalf,

      averageSessionSeconds:
        sessionsInHalf > 0
          ? total / sessionsInHalf
          : 0,

      standardDeviationSeconds:
        standardDeviation(values),

      subjectDistribution:
        distribution,
    };
  }

  const firstHalf =
    calculateHalf(firstHalfDays);

  const secondHalf =
    calculateHalf(secondHalfDays);

  /* =======================================================
     Progress
  ======================================================= */

  const firstNormal =
    getNormalValues(
      firstHalfDays.map(
        (day) =>
          day.totalSeconds
      )
    );

  const secondNormal =
    getNormalValues(
      secondHalfDays.map(
        (day) =>
          day.totalSeconds
      )
    );

  const firstHalfAvg =
    firstHalf.dailyAverageSeconds;

  const secondHalfAvg =
    secondHalf.dailyAverageSeconds;

  const outlierAdjustedFirst =
    mean(firstNormal);

  const outlierAdjustedSecond =
    mean(secondNormal);

  const progressChange =
    percentageChange(
      secondHalfAvg,
      firstHalfAvg
    ) ?? 0;

  const adjustedProgressChange =
    percentageChange(
      outlierAdjustedSecond,
      outlierAdjustedFirst
    ) ?? 0;

  const sessionCountChange =
    percentageChange(
      secondHalf.sessionCount,
      firstHalf.sessionCount
    ) ?? 0;

  const averageSessionChange =
    percentageChange(
      secondHalf.averageSessionSeconds,
      firstHalf.averageSessionSeconds
    ) ?? 0;

  /* =======================================================
     Session correlation
  ======================================================= */

  const sessionCounts =
    daily.map(
      (day) => day.sessionCount
    );

  const averageDurations =
    daily.map(
      (day) =>
        day.averageSessionSeconds
    );

  const totals =
    daily.map(
      (day) => day.totalSeconds
    );

  const countCorrelation =
    correlation(
      sessionCounts,
      totals
    );

  const durationCorrelation =
    correlation(
      averageDurations,
      totals
    );

  let strongerFactor:
    | "session-count"
    | "session-duration"
    | "similar"
    | "insufficient-data";

  if (sessions.length < 3) {
    strongerFactor =
      "insufficient-data";
  } else if (
    Math.abs(countCorrelation) >
    Math.abs(durationCorrelation) +
      0.1
  ) {
    strongerFactor =
      "session-count";
  } else if (
    Math.abs(durationCorrelation) >
    Math.abs(countCorrelation) +
      0.1
  ) {
    strongerFactor =
      "session-duration";
  } else {
    strongerFactor = "similar";
  }

  /* =======================================================
     Capacity
  ======================================================= */

  const minimumReliable =
    percentile(dailyValues, 25);

  const typical =
    median(dailyValues);

  const currentCapacity =
    percentile(dailyValues, 75);

  const peak =
    Math.max(...dailyValues);

  const feasibility = (
    target: number
  ) =>
    percentage(
      dailyValues.filter(
        (value) =>
          value >= target
      ).length,
      calendarDays
    );

  const capacity: CapacityAnalysis = {
    minimumReliableSeconds:
      minimumReliable,

    typicalSeconds: typical,

    currentCapacitySeconds:
      currentCapacity,

    peakSeconds: peak,

    target4HoursFeasibility:
      feasibility(FOUR_HOURS),

    target5HoursFeasibility:
      feasibility(FIVE_HOURS),

    target6HoursFeasibility:
      feasibility(6 * 60 * 60),
  };

  /* =======================================================
     Behavioral profile
  ======================================================= */

  const profile: Finding[] = [];

  if (
    dailyAverageSeconds >
    0 &&
    mean(
      daily
        .filter(
          (day) =>
            day.totalSeconds > 0
        )
        .map(
          (day) =>
            day.averageSessionSeconds
        )
    ) <
      dailyAverageSeconds /
        Math.max(
          1,
          mean(
            daily
              .filter(
                (day) =>
                  day.totalSeconds >
                  0
              )
              .map(
                (day) =>
                  day.sessionCount
              )
          )
        )
  ) {
    profile.push({
      title:
        "مطالعه بیشتر به جلسات متعدد تقسیم شده است",
      description:
        "بخش قابل توجهی از حجم مطالعه از چند جلسه تشکیل شده است.",
      evidence: [
        `میانگین جلسات روزانه: ${mean(
          sessionCounts
        ).toFixed(1)}`,
        `میانه مدت جلسه: ${(
          median(sessionDurations) /
          60
        ).toFixed(1)} دقیقه`,
      ],
    });
  }

  if (
    under25Percentage >= 60
  ) {
    profile.push({
      title:
        "تمایل به بلاک‌های کوتاه",
      description:
        "بیش از نیمی از جلسات کمتر از ۲۵ دقیقه بوده‌اند.",
      evidence: [
        `${under25Percentage.toFixed(
          1
        )}% جلسات کمتر از ۲۵ دقیقه بوده‌اند.`,
      ],
    });
  }

  if (
    bestDays.length > 0 &&
    bestDays[0].sessionCount >
      mean(sessionCounts)
  ) {
    profile.push({
      title:
        "روزهای قوی با جلسات بیشتر همراه بوده‌اند",
      description:
        "در بهترین روزها تعداد جلسات از میانگین کلی بیشتر بوده است.",
      evidence: [
        `میانگین تعداد جلسات: ${mean(
          sessionCounts
        ).toFixed(1)}`,
        `تعداد جلسات بهترین روز: ${bestDays[0].sessionCount}`,
      ],
    });
  }

  if (
    secondHalfAvg >
    firstHalfAvg
  ) {
    profile.push({
      title:
        "حجم مطالعه در نیمه دوم بیشتر بوده است",
      description:
        "میانگین روزانه نیمه دوم از نیمه اول بیشتر بوده است.",
      evidence: [
        `نیمه اول: ${(
          firstHalfAvg / 3600
        ).toFixed(2)} ساعت`,
        `نیمه دوم: ${(
          secondHalfAvg / 3600
        ).toFixed(2)} ساعت`,
      ],
    });
  }

  if (
    firstStarts.length > 2 &&
    startStudyCorrelation < -0.3
  ) {
    profile.push({
      title:
        "شروع زودتر با حجم مطالعه بیشتر همراه بوده است",
      description:
        "بین ساعت شروع و حجم مطالعه رابطه معکوس مشاهده شده است.",
      evidence: [
        `ضریب همبستگی: ${startStudyCorrelation.toFixed(
          2
        )}`,
      ],
    });
  }

  /* =======================================================
     Strengths
  ======================================================= */

  const strengths: Finding[] = [];

  if (
    activeDayRatio >= 0.8
  ) {
    strengths.push({
      title:
        "پیوستگی روزانه",
      description:
        "در بخش بزرگی از روزهای بازه مطالعه ثبت شده است.",
      evidence: [
        `${(
          activeDayRatio * 100
        ).toFixed(
          1
        )}% از روزهای بازه دارای مطالعه بوده‌اند.`,
      ],
    });
  }

  if (
    consistencyScore >= 70
  ) {
    strengths.push({
      title:
        "ثبات نسبتاً بالا",
      description:
        "نوسان روزانه نسبت به حجم معمول مطالعه کنترل‌شده‌تر بوده است.",
      evidence: [
        `امتیاز ثبات: ${consistencyScore}/100`,
        `CV روزانه: ${(
          dailyCV * 100
        ).toFixed(1)}%`,
      ],
    });
  }

  if (
    longPercentage >= 25
  ) {
    strengths.push({
      title:
        "توانایی جلسات طولانی",
      description:
        "بخش قابل توجهی از جلسات طولانی‌تر از ۴۵ دقیقه بوده‌اند.",
      evidence: [
        `${longPercentage.toFixed(
          1
        )}% جلسات بیشتر از ۴۵ دقیقه بوده‌اند.`,
      ],
    });
  }

  if (
    subjects.length >= 3
  ) {
    strengths.push({
      title:
        "تنوع دروس",
      description:
        "مطالعه در چند درس مختلف توزیع شده است.",
      evidence: [
        `${subjects.length} درس مختلف ثبت شده است.`,
      ],
    });
  }

  if (
    longestConsecutive >= 3
  ) {
    strengths.push({
      title:
        "توانایی حفظ زنجیره جلسات",
      description:
        "در بخشی از مطالعه چند جلسه پشت‌سرهم ثبت شده است.",
      evidence: [
        `طولانی‌ترین زنجیره: ${longestConsecutive} جلسه`,
      ],
    });
  }

  /* =======================================================
     Weaknesses
  ======================================================= */

  const weaknesses: Finding[] = [];

  if (
    daysBelow3Hours /
      calendarDays >
    0.3
  ) {
    weaknesses.push({
      title:
        "تعداد قابل توجه روزهای کم‌مطالعه",
      description:
        "بخش قابل توجهی از روزها کمتر از ۳ ساعت مطالعه داشته‌اند.",
      evidence: [
        `${daysBelow3Hours} روز کمتر از ۳ ساعت بوده‌اند.`,
        `${(
          (daysBelow3Hours /
            calendarDays) *
          100
        ).toFixed(1)}% از روزها`,
      ],
    });
  }

  if (
    fragmentationLevel ===
    "high"
  ) {
    weaknesses.push({
      title:
        "Fragmentation بالا",
      description:
        "جلسات کوتاه و پراکنده بخش زیادی از مطالعه را تشکیل می‌دهند.",
      evidence: [
        `امتیاز fragmentation: ${fragmentationScore.toFixed(
          1
        )}/100`,
        `${under25Percentage.toFixed(
          1
        )}% جلسات کمتر از ۲۵ دقیقه.`,
      ],
    });
  }

  if (
    dailyCV > 0.5
  ) {
    weaknesses.push({
      title:
        "نوسان روزانه بالا",
      description:
        "حجم مطالعه روزانه نسبت به میانگین نوسان زیادی دارد.",
      evidence: [
        `CV: ${(
          dailyCV * 100
        ).toFixed(1)}%`,
      ],
    });
  }

  if (
    longGapCount >
    calendarDays * 0.5
  ) {
    weaknesses.push({
      title:
        "وقفه‌های طولانی",
      description:
        "بین بخشی از جلسات فاصله‌های طولانی وجود داشته است.",
      evidence: [
        `${longGapCount} فاصله بیشتر از یک ساعت.`,
      ],
    });
  }

  if (
    subjects.length > 0 &&
    subjects[subjects.length - 1]
      .percentageOfTotal <
      10
  ) {
    weaknesses.push({
      title:
        "سهم پایین یکی از دروس",
      description:
        "کمترین درس از نظر زمان سهم کمی از مطالعه داشته است.",
      evidence: [
        `${
          subjects[subjects.length - 1]
            .subject
        }: ${subjects[
          subjects.length - 1
        ].percentageOfTotal.toFixed(1)}%`,
      ],
    });
  }

  /* =======================================================
     Problem priorities
  ======================================================= */

  const priorities: ProblemPriority[] =
    [];

  if (
    dailyCV > 0.5
  ) {
    priorities.push({
      id:0,
      problem:
        "نوسان زیاد حجم مطالعه",
      severity: Math.min(
        100,
        dailyCV * 100
      ),
      evidence: [
        `CV = ${(
          dailyCV * 100
        ).toFixed(1)}%`,
        `${veryWeakDays} روز بسیار ضعیف`,
      ],
      impact:
        "ممکن است برنامه‌ریزی روزانه را ناپایدار کند.",
      recommendation:
        "ابتدا حداقل مطالعه قابل اتکا را تثبیت کن و سپس سقف مطالعه را افزایش بده.",
    });
  }

  if (
    fragmentationScore >= 65
  ) {
    priorities.push({
      id:0,
      problem:
        "تکه‌تکه بودن مطالعه",
      severity:
        fragmentationScore,
      evidence: [
        `${under25Percentage.toFixed(
          1
        )}% جلسات زیر ۲۵ دقیقه`,
        `میانه جلسه: ${(
          median(sessionDurations) /
          60
        ).toFixed(1)} دقیقه`,
      ],
      impact:
        "ممکن است بخشی از زمان روز صرف شروع و توقف‌های متعدد شود.",
      recommendation:
        "در صورت امکان بخشی از جلسات کوتاه را به بلاک‌های پیوسته‌تر تبدیل کن.",
    });
  }

  if (
    daysBelow3Hours /
      calendarDays >
    0.3
  ) {
    priorities.push({
      id:0,
      problem:
        "روزهای کم‌مطالعه متعدد",
      severity:
        (daysBelow3Hours /
          calendarDays) *
        100,
      evidence: [
        `${daysBelow3Hours} روز زیر ۳ ساعت`,
      ],
      impact:
        "میانگین کل را پایین می‌آورد و ظرفیت هفتگی را محدود می‌کند.",
      recommendation:
        "برای روزهای ضعیف یک کف مطالعه مشخص و قابل دستیابی تعریف کن.",
    });
  }

  if (
    longGapCount >
    calendarDays * 0.5
  ) {
    priorities.push({
      id:0,
      problem:
        "وقفه‌های طولانی بین جلسات",
      severity: Math.min(
        100,
        (longGapCount /
          Math.max(
            1,
            gaps.length
          )) *
          100
      ),
      evidence: [
        `${longGapCount} فاصله بالای یک ساعت`,
      ],
      impact:
        "ممکن است زمان‌های بدون مطالعه بین بلاک‌ها زیاد شود.",
      recommendation:
        "فاصله‌های طولانی را با برنامه مشخص برای استراحت و شروع جلسه بعدی مدیریت کن.",
    });
  }

  priorities.sort(
    (a, b) =>
      b.severity - a.severity
  );

  /* =======================================================
     Seven day targets
  ======================================================= */

  const minimumTarget =
    percentile(
      dailyValues,
      25
    );

  const normalTarget =
    median(dailyValues);

  const idealTarget =
    percentile(
      dailyValues,
      75
    );

  /*
   * Avoid recommending an extreme jump.
   * Maximum is capped relative to the observed
   * 90th percentile and peak.
   */

  const p90 =
    percentile(
      dailyValues,
      90
    );

  const reasonableMaximum =
    Math.min(
      peak,
      p90 * 1.15
    );

  const activeSessionCounts =
    daily
      .filter(
        (day) =>
          day.sessionCount > 0
      )
      .map(
        (day) =>
          day.sessionCount
      );

  const minimumSessions = Math.max(
    1,
    Math.floor(
      percentile(
        activeSessionCounts,
        25
      )
    )
  );

  const targets7Days: SevenDayTargets =
    {
      minimumDailySeconds:
        minimumTarget,

      normalDailySeconds:
        normalTarget,

      idealDailySeconds:
        idealTarget,

      reasonableMaximumDailySeconds:
        reasonableMaximum,

      minimumSessions,

      maximumAcceptableVariationPercent:
        Math.max(
          20,
          Math.min(
            50,
            dailyCV * 100
          )
        ),
    };

  /* =======================================================
     Overview
  ======================================================= */

  const topSubject =
    subjects[0];

  const overview: OverviewStats =
    {
      sessions: sessions.length,

      totalSeconds,

      studyDays,

      calendarDays,

      dailyAverageSeconds,

      activeDayAverageSeconds,

      dailyMedianSeconds:
        dailyMedian,

      dailyStandardDeviationSeconds:
        dailyStd,

      dailyVarianceSeconds:
        dailyVariance,

      dailyCoefficientOfVariation:
        dailyCV,

      dailyMinimumSeconds:
        dailyMin,

      dailyMaximumSeconds:
        dailyMax,

      outlierAdjustedMeanSeconds:
        mean(dailyNormalValues),

      sessionAverageSeconds:
        mean(sessionDurations),

      sessionMedianSeconds:
        median(sessionDurations),

      shortSessions,

      mediumSessions,

      longSessions,

      shortPercentage:
        percentage(
          shortSessions,
          sessions.length
        ),

      mediumPercentage:
        percentage(
          mediumSessions,
          sessions.length
        ),

      longPercentage:
        percentage(
          longSessions,
          sessions.length
        ),

      topSubject:
        topSubject?.subject ?? null,

      topSubjectSeconds:
        topSubject?.totalSeconds ?? 0,
    };

  /* =======================================================
     Final result
  ======================================================= */

  return {
    /* Original API */
    sessions: sessions.length,
    totalSeconds,
    studyDays,

    dailyAverageSeconds,

    sessionAverageSeconds:
      mean(sessionDurations),

    topTag:
      topSubject?.subject ?? null,

    topTagSeconds:
      topSubject?.totalSeconds ?? 0,

    /* New analysis */
    overview,

    daily,

    trend: {
      direction:
        detectTrend(dailyValues),

      slope:
        regressionSlope(
          dailyValues
        ),

      movingAverage3:
        ma3[ma3.length - 1] ?? null,

      movingAverage5:
        ma5[ma5.length - 1] ?? null,

      movingAverage7:
        ma7[ma7.length - 1] ?? null,

      movingAverage14:
        ma14[ma14.length - 1] ?? null,
    },

    subjects,

    distribution,

    sessionStructure: {
      meanGapSeconds:
        meanGap,

      medianGapSeconds:
        medianGap,

      longestGapSeconds:
        longestGap,

      longGapCount,

      consecutiveSessionCount,

      longestConsecutiveSessionStreak:
        longestConsecutive,

      shortSessions,

      mediumSessions,

      longSessions,

      shortPercentage:
        percentage(
          shortSessions,
          sessions.length
        ),

      mediumPercentage:
        percentage(
          mediumSessions,
          sessions.length
        ),

      longPercentage,

      buckets,

      under25Percentage,

      fragmentationScore,

      fragmentationLevel,

      studyStyle,
    },

    timeOfDay,

    dayBoundaries: {
      averageFirstStartMinutes:
        firstStarts.length > 0
          ? mean(firstStarts)
          : null,

      medianFirstStartMinutes:
        firstStarts.length > 0
          ? median(firstStarts)
          : null,

      averageLastEndMinutes:
        lastEnds.length > 0
          ? mean(lastEnds)
          : null,

      medianLastEndMinutes:
        lastEnds.length > 0
          ? median(lastEnds)
          : null,

      startTimeVsStudyCorrelation:
        startStudyCorrelation,

      endTimeVsStudyCorrelation:
        endStudyCorrelation,
    },

    consistency: {
      daysAboveMean,
      daysBelowMean,

      daysAbove4Hours,
      daysAbove5Hours,

      daysBelow3Hours,

      veryWeakDays,

      activeDayRatio,

      consistencyScore,
    },

    bestDays,

    worstDays,

    halves: {
      first: firstHalf,
      second: secondHalf,

      dailyAverageChangePercent:
        progressChange,

      totalChangePercent:
        percentageChange(
          secondHalf.totalSeconds,
          firstHalf.totalSeconds
        ) ?? 0,

      sessionAverageChangePercent:
        averageSessionChange,
    },

    capacity,

    progress: {
      regressionSlope:
        regressionSlope(
          dailyValues
        ),

      trend:
        detectTrend(dailyValues),

      firstHalfAverageSeconds:
        firstHalfAvg,

      secondHalfAverageSeconds:
        secondHalfAvg,

      changePercent:
        progressChange,

      outlierAdjustedFirstHalfAverage:
        outlierAdjustedFirst,

      outlierAdjustedSecondHalfAverage:
        outlierAdjustedSecond,

      outlierAdjustedChangePercent:
        adjustedProgressChange,

      sessionCountChangePercent:
        sessionCountChange,

      averageSessionDurationChangePercent:
        averageSessionChange,
    },

    sessionCorrelation: {
      sessionCountVsTotal:
        countCorrelation,

      sessionDurationVsTotal:
        durationCorrelation,

      strongerFactor,
    },

    profile,

    strengths,

    weaknesses,

    priorities,

    targets7Days,
  };
}
export function getTimeOfDay(date: Date): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 8) return "صبح زود";
  if (hour >= 8 && hour < 12) return "صبح";
  if (hour >= 12 && hour < 15) return "ظهر";
  if (hour >= 15 && hour < 18) return "بعدازظهر";
  if (hour >= 18 && hour < 21) return "عصر";
  if (hour >= 21 && hour < 24) return "شب";

  return "آخر شب";
}