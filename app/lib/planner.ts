export type SubjectRangeConfig = {
  range: string;
  step: number;
};
export type SubjectConfig = {
  name: string;
  /** Independent range steps. Takes precedence over legacy range/step fields. */
  ranges?: SubjectRangeConfig[];
  range?: string | string[];
  start?: number;
  end?: number;
  step?: number;
  tests?: number[];
};
export type ScheduleItem = { subject: string } | { one_of: string[] };
export type PlannerConfig = { days: number; subjects: Record<string, SubjectConfig>; schedule: ScheduleItem[] };
type Chunk = number[];

function parseRange(value: string): [number, number] {
  const match = value.match(/^\s*(\d+)\s*[-–—]\s*(\d+)\s*$/);
  if (!match) throw new Error(`Invalid range '${value}'. Use something like '1724-1800'.`);
  return [Number(match[1]), Number(match[2])];
}

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

type SubjectTestData = {
  tests: number[];
  stepByTest: Map<number, number>;
  defaultStep: number;
};

function validateStep(stepValue: unknown): number {
  const step = Number(stepValue ?? 1);
  if (!Number.isInteger(step) || step <= 0) {
    throw new Error(`Invalid step: ${step}. Step must be a positive integer.`);
  }
  return step;
}

function buildSubjectTestData(subject: SubjectConfig): SubjectTestData {
  const defaultStep = validateStep(subject.step ?? 1);

  if ('tests' in subject) {
    const tests = uniqueSorted((subject.tests ?? []).map(Number));
    if (!tests.length) throw new Error("Subject has an empty 'tests' list.");
    return {
      tests,
      stepByTest: new Map(tests.map((test) => [test, defaultStep])),
      defaultStep,
    };
  }

  let configuredRanges: { range: string; step: number }[];
  if (Array.isArray(subject.ranges)) {
    if (!subject.ranges.length) {
      throw new Error("Subject 'ranges' must be a non-empty list of ranges.");
    }
    configuredRanges = subject.ranges.map((item) => {
      if (!item || typeof item.range !== 'string') {
        throw new Error("Every subject range must contain a string 'range'.");
      }
      return { range: item.range, step: validateStep(item.step) };
    });
  } else if ('range' in subject) {
    const ranges = typeof subject.range === 'string' ? [subject.range] : subject.range;
    if (!Array.isArray(ranges) || !ranges.length) {
      throw new Error("Subject 'range' must be a string or a non-empty list of ranges.");
    }
    // Backwards compatibility: old configuration applies one step to every range.
    configuredRanges = ranges.map((range) => ({ range: String(range), step: defaultStep }));
  } else {
    if (subject.start === undefined || subject.end === undefined) {
      throw new Error("Subject must contain 'ranges', 'range', or both 'start' and 'end'.");
    }
    configuredRanges = [{ range: `${subject.start}-${subject.end}`, step: defaultStep }];
  }

  const stepByTest = new Map<number, number>();
  for (const configured of configuredRanges) {
    let [start, end] = parseRange(configured.range);
    if (start > end) [start, end] = [end, start];
    for (let value = start; value <= end; value += configured.step) {
      // If ranges overlap, count each test once and use the first range's step
      // when formatting its sequence in output.txt.
      if (!stepByTest.has(value)) stepByTest.set(value, configured.step);
    }
  }

  if (!stepByTest.size) throw new Error('A subject must include at least one test.');
  return {
    tests: uniqueSorted([...stepByTest.keys()]),
    stepByTest,
    defaultStep,
  };
}

export function buildTests(subject: SubjectConfig): number[] {
  return buildSubjectTestData(subject).tests;
}

function splitEvenly(items: number[], parts: number): Chunk[] {
  if (parts <= 0) throw new Error('parts must be greater than zero.');
  if (parts > items.length) throw new Error(`Cannot split ${items.length} tests into ${parts} non-empty parts.`);
  const base = Math.floor(items.length / parts), remainder = items.length % parts;
  const chunks: Chunk[] = [];
  let index = 0;
  for (let i = 0; i < parts; i++) {
    const size = base + (i < remainder ? 1 : 0);
    chunks.push(items.slice(index, index + size));
    index += size;
  }
  return chunks;
}

function allocateGroupSlots(totals: number[], days: number): number[] {
  const count = totals.length;
  if (!count) throw new Error('one_of group cannot be empty.');
  if (count > days) throw new Error(`A one_of group contains ${count} subjects, but there are only ${days} days. Every subject needs at least one selected day.`);
  if (totals.some(total => total <= 0)) throw new Error('Every subject inside a one_of group must have at least one test.');
  const slots = Array(count).fill(1) as number[];
  const remaining = days - count;
  if (!remaining) return slots;
  const totalTests = totals.reduce((a, b) => a + b, 0);
  const raw = totals.map(total => remaining * total / totalTests);
  const floors = raw.map(Math.floor);
  floors.forEach((floor, i) => slots[i] += floor);
  const left = remaining - floors.reduce((a, b) => a + b, 0);
  const order = totals.map((_, i) => i).sort((a, b) => {
    const remainderDiff = (raw[b] - floors[b]) - (raw[a] - floors[a]);
    if (remainderDiff !== 0) return remainderDiff;
    if (totals[b] !== totals[a]) return totals[b] - totals[a];
    return a - b;
  });
  order.slice(0, left).forEach(i => slots[i]++);
  return slots;
}

function optimizeChoiceGroup(baseDailyTotals: number[], chunksBySubject: Record<string, Chunk[]>): string[] {
  const days = baseDailyTotals.length;
  const subjectIds = Object.keys(chunksBySubject);
  const slotCounts = subjectIds.map(id => chunksBySubject[id].length);
  const totalGroupTests = Object.values(chunksBySubject).flat().reduce((sum, chunk) => sum + chunk.length, 0);
  const targetDailyTotal = (baseDailyTotals.reduce((a, b) => a + b, 0) + totalGroupTests) / days;
  type Result = { error: number; repeats: number; path: string[] };
  const memo = new Map<string, Result>();
  const isClose = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b));
  const dp = (usedCounts: number[], lastSubject: number): Result => {
    const day = usedCounts.reduce((a, b) => a + b, 0);
    if (day === days) return { error: 0, repeats: 0, path: [] };
    const key = `${usedCounts.join(',')}|${lastSubject}`;
    const cached = memo.get(key);
    if (cached) return cached;
    let best: Result = { error: Infinity, repeats: Infinity, path: [] };
    for (let i = 0; i < subjectIds.length; i++) {
      const used = usedCounts[i];
      if (used >= slotCounts[i]) continue;
      const subjectId = subjectIds[i];
      const contribution = chunksBySubject[subjectId][used].length;
      const dailyTotal = baseDailyTotals[day] + contribution;
      const tail = dp(usedCounts.map((count, j) => j === i ? count + 1 : count), i);
      const repeat = lastSubject === i ? 1 : 0;
      const candidate = { error: (dailyTotal - targetDailyTotal) ** 2 + tail.error, repeats: repeat + tail.repeats, path: [subjectId, ...tail.path] };
      let better = candidate.error < best.error;
      if (!better && isClose(candidate.error, best.error)) better = candidate.repeats < best.repeats;
      if (better) best = candidate;
    }
    memo.set(key, best);
    return best;
  };
  return dp(Array(subjectIds.length).fill(0), -1).path;
}

function formatChunk(
  chunk: number[],
  stepByTest: Map<number, number>,
  defaultStep: number,
): string {
  if (!chunk.length) throw new Error('Chunk cannot be empty.');

  const formatSegment = (start: number, end: number, step: number) => {
    if (start === end) return String(start);
    return step === 1
      ? `${start}–${end}`
      : `${start}–${end} with jump ${step}`;
  };

  const segments: string[] = [];
  let start = chunk[0];
  let previous = chunk[0];
  let currentStep = stepByTest.get(chunk[0]) ?? defaultStep;

  for (const value of chunk.slice(1)) {
    const valueStep = stepByTest.get(value) ?? defaultStep;
    if (valueStep === currentStep && value === previous + currentStep) {
      previous = value;
      continue;
    }

    segments.push(formatSegment(start, previous, currentStep));
    start = value;
    previous = value;
    currentStep = valueStep;
  }

  segments.push(formatSegment(start, previous, currentStep));
  return `${segments.join(', ')} [${chunk.length}]`;
}

export function validateConfig(config: PlannerConfig): void {
  if (!('days' in config)) throw new Error("YAML must contain 'days'.");
  const days = Number(config.days);
  if (!Number.isInteger(days) || days <= 0) throw new Error("'days' must be greater than zero.");
  if (!('subjects' in config) || !config.subjects || typeof config.subjects !== 'object' || Array.isArray(config.subjects)) throw new Error("'subjects' must be a mapping/object.");
  if (!('schedule' in config) || !Array.isArray(config.schedule)) throw new Error("YAML must contain 'schedule'.");
  const used = new Set<string>();
  for (const item of config.schedule) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Every schedule item must be an object.');
    const hasSubject = 'subject' in item, hasOneOf = 'one_of' in item;
    if (hasSubject && hasOneOf) throw new Error("A schedule item cannot contain both 'subject' and 'one_of'.");
    if (!hasSubject && !hasOneOf) throw new Error("Every schedule item must contain 'subject' or 'one_of'.");
    if (hasSubject) {
      const id = String((item as {subject: string}).subject);
      if (!(id in config.subjects)) throw new Error(`Unknown subject '${id}'.`);
      if (used.has(id)) throw new Error(`Subject '${id}' appears more than once.`);
      used.add(id);
    } else {
      const group = (item as {one_of: string[]}).one_of;
      if (!Array.isArray(group)) throw new Error("'one_of' must be a list of subject IDs.");
      if (!group.length) throw new Error("'one_of' cannot be empty.");
      const local = new Set<string>();
      for (const rawId of group) {
        const id = String(rawId);
        if (!(id in config.subjects)) throw new Error(`Unknown subject '${id}' in one_of group.`);
        if (local.has(id)) throw new Error(`Subject '${id}' appears twice in the same one_of group.`);
        if (used.has(id)) throw new Error(`Subject '${id}' is already used somewhere else in schedule.`);
        local.add(id); used.add(id);
      }
    }
  }
  const unused = Object.keys(config.subjects).filter(id => !used.has(id)).sort();
  if (unused.length) throw new Error('These subjects are defined but never used in schedule: ' + unused.join(', '));
}

export function generatePlan(config: PlannerConfig): string {
  validateConfig(config);
  const days = Number(config.days), subjects = config.subjects, schedule = config.schedule;
  const testsBySubject: Record<string, number[]> = {};
  const stepBySubject: Record<string, number> = {};
  const testStepsBySubject: Record<string, Map<number, number>> = {};
  for (const [id, subject] of Object.entries(subjects)) {
    const data = buildSubjectTestData(subject);
    testsBySubject[id] = data.tests;
    stepBySubject[id] = data.defaultStep;
    testStepsBySubject[id] = data.stepByTest;
  }
  const normalChunks: Record<string, Chunk[]> = {};
  for (const item of schedule) if ('subject' in item) normalChunks[item.subject] = splitEvenly(testsBySubject[item.subject], days);
  const dailyTotals = Array(days).fill(0) as number[];
  for (const chunks of Object.values(normalChunks)) chunks.forEach((chunk, day) => dailyTotals[day] += chunk.length);
  const result: Record<string, number[]>[] = Array.from({ length: days }, () => ({}));
  for (const [id, chunks] of Object.entries(normalChunks)) chunks.forEach((chunk, day) => result[day][id] = chunk);
  for (const item of schedule) {
    if (!('one_of' in item)) continue;
    const group = item.one_of.map(String);
    const slots = allocateGroupSlots(group.map(id => testsBySubject[id].length), days);
    const chunksBySubject: Record<string, Chunk[]> = {};
    group.forEach((id, i) => chunksBySubject[id] = splitEvenly(testsBySubject[id], slots[i]));
    const selected = optimizeChoiceGroup(dailyTotals, chunksBySubject);
    const occurrences: Record<string, number> = Object.fromEntries(group.map(id => [id, 0]));
    selected.forEach((id, day) => {
      const chunk = chunksBySubject[id][occurrences[id]++];
      result[day][id] = chunk;
      dailyTotals[day] += chunk.length;
    });
  }
  const rows: string[][] = [];
  for (let day = 0; day < days; day++) {
    const parts: string[] = [];
    for (const item of schedule) {
      if ('subject' in item) {
        const id = item.subject;
        if (!(id in result[day])) continue;
        parts.push(`${subjects[id].name}: ${formatChunk(result[day][id], testStepsBySubject[id], stepBySubject[id])}`);
      } else {
        for (const rawId of item.one_of) {
          const id = String(rawId);
          if (!(id in result[day])) continue;
          parts.push(`${subjects[id].name}: ${formatChunk(result[day][id], testStepsBySubject[id], stepBySubject[id])}`);
          break;
        }
      }
    }
    rows.push(parts);
  }
  const columnCount = Math.max(0, ...rows.map(row => row.length));
  const columnWidths = Array.from({ length: columnCount }, (_, i) => Math.max(0, ...rows.map(row => row[i]?.length ?? 0)));
  return rows.map((parts, day) => `${day + 1}  ${parts.map((part, i) => part.padEnd(columnWidths[i], ' ')).join('    ')}`).join('\n');
}
