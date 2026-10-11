'use client';

import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Coffee,
  History,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Sparkles,
  Square,
  Timer,
  Volume2,
  VolumeX,
  Zap,
  Trash2,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';

type TimerMode = 'focus' | 'break' | 'stopwatch';

type SessionRecord = {
  id: string;
  mode: TimerMode;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  targetSec: number | null;
  goalReached: boolean;
};

type PersistedData = {
  sessions: SessionRecord[];
  focusMinutes: number;
  breakMinutes: number;
  clickEveryMinutes: number;
  clickSoundMs: number;
  soundEnabled: boolean;
  fromDate: string;
  toDate: string;
};

const STORAGE_KEY = 'focus-timer-dashboard-v1';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return hours > 0
    ? `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
    : `${pad2(minutes)}:${pad2(seconds)}`;
}

function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0) return `${hours} ساعت ${minutes} دقیقه`;
  if (minutes > 0) return `${minutes} دقیقه`;
  return `${safeSeconds} ثانیه`;
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function shiftDate(date: Date, days: number) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return localDateKey(shifted);
}

function modeLabel(mode: TimerMode) {
  if (mode === 'focus') return 'تمرکز';
  if (mode === 'break') return 'استراحت';
  return 'کرنومتر';
}

function modeColor(mode: TimerMode) {
  if (mode === 'focus') return 'text-violet-300';
  if (mode === 'break') return 'text-emerald-300';
  return 'text-sky-300';
}

function readNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-slate-300">
          {icon}
        </span>
      </div>
      <div className="mt-3 break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

export default function FocusTimerPage() {
  const [hydrated, setHydrated] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  type TimerMode = 'focus' | 'break' | 'stopwatch';

  const [activeMode, setActiveMode] = useState<TimerMode>('focus');
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [clickEveryMinutes, setClickEveryMinutes] = useState(1);
  const [clickSoundMs, setClickSoundMs] = useState(55);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const timerStartRef = useRef<number>(0);
  const sessionStartRef = useRef<number | null>(null);
  const goalReachedRef = useRef(false);
  const lastClickIndexRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const targetSec =
    activeMode === 'focus'
      ? Math.max(1, focusMinutes) * 60
      : activeMode === 'break'
        ? Math.max(1, breakMinutes) * 60
        : null;

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    (
      frequency: number,
      durationMs = 70,
      waveform: OscillatorType = 'sine',
      volume = 0.045,
    ) => {
      if (!soundEnabled) return;
      const context = getAudioContext();
      if (!context) return;
      if (context.state === 'suspended') void context.resume();

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = context.currentTime;
      const endAt = startAt + Math.max(0.02, durationMs / 1000);

      oscillator.type = waveform;
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(endAt + 0.015);
    },
    [getAudioContext, soundEnabled],
  );

  const playAlarm = useCallback(() => {
    // A distinct three-note notification, separate from the stopwatch click.
    playTone(880, 95, 'triangle', 0.055);
    window.setTimeout(() => playTone(1175, 110, 'triangle', 0.055), 115);
    window.setTimeout(() => playTone(1568, 190, 'triangle', 0.055), 250);
  }, [playTone]);

  // Load saved settings and sessions only on the client.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const today = localDateKey(new Date());
      const defaultFrom = shiftDate(new Date(), -6);

      if (raw) {
        const saved = JSON.parse(raw) as Partial<PersistedData>;
        if (Array.isArray(saved.sessions)) {
          setSessions(
            saved.sessions.filter(
              (item): item is SessionRecord =>
                Boolean(item) &&
                typeof item.id === 'string' &&
                typeof item.startedAt === 'string' &&
                typeof item.endedAt === 'string' &&
                typeof item.durationSec === 'number' &&
                ['focus', 'break', 'stopwatch'].includes(item.mode),
            ),
          );
        }
        setFocusMinutes(readNumber(saved.focusMinutes, 25, 1, 240));
        setBreakMinutes(readNumber(saved.breakMinutes, 5, 1, 120));
        setClickEveryMinutes(readNumber(saved.clickEveryMinutes ?? (Number(saved.clickEveryMinutes) / 60), 1, 1, 60));
        setClickSoundMs(readNumber(saved.clickSoundMs, 55, 20, 250));
        setSoundEnabled(typeof saved.soundEnabled === 'boolean' ? saved.soundEnabled : true);
        setFromDate(typeof saved.fromDate === 'string' && saved.fromDate ? saved.fromDate : defaultFrom);
        setToDate(typeof saved.toDate === 'string' && saved.toDate ? saved.toDate : today);
      } else {
        setFromDate(defaultFrom);
        setToDate(today);
      }
    } catch {
      setFromDate(shiftDate(new Date(), -6));
      setToDate(localDateKey(new Date()));
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist the tracker and settings in localStorage.
  useEffect(() => {
    if (!hydrated) return;
    const payload: PersistedData = {
      sessions,
      focusMinutes,
      breakMinutes,
      clickEveryMinutes,
      clickSoundMs,
      soundEnabled,
      fromDate,
      toDate,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Private browsing or a full storage quota should not break the timer.
    }
  }, [
    hydrated,
    sessions,
    focusMinutes,
    breakMinutes,
    clickEveryMinutes,
    clickSoundMs,
    soundEnabled,
    fromDate,
    toDate,
  ]);

  // The clock is based on timestamps, so it won't drift if an interval fires late.
  // Reaching the Pomodoro target plays a chime but deliberately does not stop the clock.
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      const nextElapsed = Math.max(0, Math.floor((Date.now() - timerStartRef.current) / 1000));
      setElapsedSec((current) => (current === nextElapsed ? current : nextElapsed));

      if (
        activeMode !== 'stopwatch' &&
        targetSec !== null &&
        nextElapsed >= targetSec &&
        !goalReachedRef.current
      ) {
        goalReachedRef.current = true;
        playAlarm();
      }

      if (activeMode === 'stopwatch' && nextElapsed > 0) {
        const clickIndex = Math.floor(nextElapsed / Math.max(1, clickEveryMinutes * 60));
        if (clickIndex > lastClickIndexRef.current) {
          lastClickIndexRef.current = clickIndex;
          playTone(1046, clickSoundMs, 'square', 0.028);
        }
      }
    }, 150);

    return () => window.clearInterval(intervalId);
  }, [
    isRunning,
    activeMode,
    targetSec,
    clickEveryMinutes,
    clickSoundMs,
    playAlarm,
    playTone,
  ]);

  const startOrResume = () => {
    const now = Date.now();
    if (sessionStartRef.current === null) sessionStartRef.current = now;
    timerStartRef.current = now - elapsedSec * 1000;
    lastClickIndexRef.current = Math.floor(elapsedSec / Math.max(1, clickEveryMinutes * 60));
    if (activeMode !== 'stopwatch' && targetSec !== null && elapsedSec >= targetSec) {
      goalReachedRef.current = true;
    }
    const context = getAudioContext();
    if (context?.state === 'suspended') void context.resume();
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);

  const stopAndSave = () => {
    const actualElapsed = isRunning
      ? Math.max(0, Math.floor((Date.now() - timerStartRef.current) / 1000))
      : elapsedSec;

    setIsRunning(false);
    setElapsedSec(actualElapsed);

    if (actualElapsed > 0) {
      const endedAt = new Date();
      const startedAt = sessionStartRef.current ?? endedAt.getTime() - actualElapsed * 1000;
      const target = activeMode === 'stopwatch' ? null : targetSec;
      const record: SessionRecord = {
        id: `${endedAt.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        mode: activeMode,
        startedAt: new Date(startedAt).toISOString(),
        endedAt: endedAt.toISOString(),
        durationSec: actualElapsed,
        targetSec: target,
        goalReached: target !== null && actualElapsed >= target,
      };
      setSessions((current) => [record, ...current]);
    }

    setElapsedSec(0);
    sessionStartRef.current = null;
    goalReachedRef.current = false;
    lastClickIndexRef.current = 0;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedSec(0);
    sessionStartRef.current = null;
    goalReachedRef.current = false;
    lastClickIndexRef.current = 0;
  };

  const changeMode = (mode: TimerMode) => {
    if (isRunning) return;
    setActiveMode(mode);
    setElapsedSec(0);
    sessionStartRef.current = null;
    goalReachedRef.current = false;
    lastClickIndexRef.current = 0;
  };

  const filteredSessions = useMemo(() => {
    if (!fromDate || !toDate || fromDate > toDate) return [];
    return sessions.filter((session) => {
      const dateKey = localDateKey(new Date(session.endedAt));
      return dateKey >= fromDate && dateKey <= toDate;
    });
  }, [sessions, fromDate, toDate]);

  const stats = useMemo(() => {
    const totalSec = filteredSessions.reduce((sum, session) => sum + session.durationSec, 0);
    const focusSec = filteredSessions
      .filter((session) => session.mode === 'focus')
      .reduce((sum, session) => sum + session.durationSec, 0);
    const breakSec = filteredSessions
      .filter((session) => session.mode === 'break')
      .reduce((sum, session) => sum + session.durationSec, 0);
    const stopwatchSec = filteredSessions
      .filter((session) => session.mode === 'stopwatch')
      .reduce((sum, session) => sum + session.durationSec, 0);
    const completedGoals = filteredSessions.filter((session) => session.goalReached).length;
    const averageSec = filteredSessions.length > 0 ? totalSec / filteredSessions.length : 0;

    return {
      totalSec,
      focusSec,
      breakSec,
      stopwatchSec,
      completedGoals,
      averageSec,
      count: filteredSessions.length,
    };
  }, [filteredSessions]);

  const dailyRows = useMemo(() => {
    if (!fromDate || !toDate || fromDate > toDate) return [];
    const cursor = new Date(`${fromDate}T00:00:00`);
    const end = new Date(`${toDate}T00:00:00`);
    const rows: { date: string; focusSec: number; totalSec: number; count: number }[] = [];

    while (cursor <= end && rows.length < 366) {
      const date = localDateKey(cursor);
      const daySessions = filteredSessions.filter(
        (session) => localDateKey(new Date(session.endedAt)) === date,
      );
      rows.push({
        date,
        focusSec: daySessions
          .filter((session) => session.mode === 'focus')
          .reduce((sum, session) => sum + session.durationSec, 0),
        totalSec: daySessions.reduce((sum, session) => sum + session.durationSec, 0),
        count: daySessions.length,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return rows;
  }, [filteredSessions, fromDate, toDate]);

  const maxDailyFocus = Math.max(1, ...dailyRows.map((row) => row.focusSec));
  const goalReached = activeMode !== 'stopwatch' && targetSec !== null && elapsedSec >= targetSec;
  const progress = targetSec ? Math.min(100, (elapsedSec / targetSec) * 100) : 0;
  const rangeIsValid = Boolean(fromDate && toDate && fromDate <= toDate);

  return (
    <div dir="rtl" lang="fa" className="font-vazirmatn min-h-screen overflow-x-hidden bg-[#080b12] text-slate-100 selection:bg-violet-400/30">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -left-32 top-[35rem] h-96 w-96 rounded-full bg-sky-500/[0.07] blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-3 py-3 sm:px-6 sm:py-8 lg:px-8">
        <main className="space-y-5 sm:space-y-6">
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] lg:gap-5">
            {/* Main timer */}
            <section className="min-w-0 rounded-3xl border border-white/[0.09] bg-[#111622]/95 p-4 shadow-2xl shadow-black/20 sm:p-6 md:p-8">
              <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-white/[0.06] bg-black/20 p-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => changeMode('focus')}
                  disabled={isRunning}
                  className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-80 sm:px-3 ${activeMode === 'focus' ? 'bg-violet-400/15 text-violet-200 ring-1 ring-violet-300/20' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'}`}
                >
                  <Timer size={17} /> <span>تمرکز</span>
                </button>
                <button
                  type="button"
                  onClick={() => changeMode('break')}
                  disabled={isRunning}
                  className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-80 sm:px-3 ${activeMode === 'break' ? 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/20' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'}`}
                >
                  <Coffee size={17} /> <span>استراحت</span>
                </button>
                <button
                  type="button"
                  onClick={() => changeMode('stopwatch')}
                  disabled={isRunning}
                  className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-80 sm:px-3 ${activeMode === 'stopwatch' ? 'bg-sky-400/15 text-sky-200 ring-1 ring-sky-300/20' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'}`}
                >
                  <Activity size={17} /> <span>کرنومتر</span>
                </button>
              </div>

              <div className="flex min-h-[330px] flex-col items-center justify-center py-2 text-center sm:min-h-[370px] sm:py-10">
                <div className={`mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-xs ${modeColor(activeMode)}`}>
                  {activeMode === 'focus' ? <Timer size={14} /> : activeMode === 'break' ? <Coffee size={14} /> : <Activity size={14} />}
                  {activeMode === 'stopwatch' ? 'زمان سپری‌شده' : goalReached ? 'زمان هدف تمام شده' : 'زمان باقی‌مانده'}
                </div>

                <div className="max-w-full text-center">
                  <div dir="ltr" className="whitespace-nowrap font-mono text-[clamp(3.25rem,12vw,6.75rem)] font-semibold leading-none tracking-[-0.075em] text-white tabular-nums">
                    {activeMode === 'stopwatch'
                      ? formatTime(elapsedSec)
                      : formatTime(Math.max(0, (targetSec ?? 0) - elapsedSec))}
                  </div>
                  {goalReached && activeMode !== 'stopwatch' && (
                    <div dir="ltr" className="mt-3 font-mono text-lg font-medium tabular-nums text-amber-300 sm:text-xl">
                      +{formatTime(Math.max(0, elapsedSec - (targetSec ?? 0)))}
                      <span dir="rtl" className="mr-2 font-sans text-xs text-slate-500">اضافه‌زمان</span>
                    </div>
                  )}
                </div>

                <p className="mt-5 min-h-6 text-sm text-slate-400">
                  {isRunning
                    ? 'در حال اجراست؛ لازم نیست با رسیدن به هدف متوقفش کنی.'
                    : goalReached && activeMode !== 'stopwatch'
                      ? 'آفرین! صدای پایان پخش شد و تایمر تا زمان توقف تو ادامه دارد.'
                      : activeMode === 'stopwatch'
                        ? `صدای تیک هر ${clickEveryMinutes} دقیقه یک‌بار پخش می‌شود.`
                        : `هدف این نوبت: ${formatDuration(targetSec ?? 0)}`}
                </p>

                {activeMode !== 'stopwatch' && (
                  <div className="mt-7 w-full max-w-md">
                    <div dir="ltr" className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className={`h-full rounded-full transition-[width] duration-300 ${activeMode === 'focus' ? 'bg-gradient-to-r from-violet-500 to-fuchsia-400' : 'bg-gradient-to-r from-emerald-500 to-teal-300'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                      <span>{goalReached ? '۱۰۰٪' : `${Math.floor(progress)}٪ طی شده`}</span>
                      <span>{formatDuration(elapsedSec)} سپری‌شده</span>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={isRunning ? pauseTimer : startOrResume}
                    className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition active:scale-[0.99] ${isRunning ? 'border border-white/10 bg-white/[0.07] text-white hover:bg-white/[0.11]' : 'bg-violet-400 text-[#130f20] shadow-lg shadow-violet-500/15 hover:bg-violet-300'}`}
                  >
                    {isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                    {isRunning ? 'مکث' : elapsedSec > 0 ? 'ادامه' : 'شروع'}
                  </button>
                  <button
                    type="button"
                    onClick={stopAndSave}
                    disabled={elapsedSec <= 0 && !isRunning}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Square size={15} fill="currentColor" />
                    پایان و ذخیره
                  </button>
                  <button
                    type="button"
                    onClick={resetTimer}
                    title="بازنشانی بدون ذخیره"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/[0.09] bg-white/[0.025] px-4 py-3 text-sm text-slate-400 transition hover:bg-white/[0.07] hover:text-white sm:flex-none"
                  >
                    <RotateCcw size={16} />
                    <span className="sm:hidden">بازنشانی</span>
                  </button>
                </div>
                <div className="mb-3 rounded-xl pt-2 flex items-center justify-between gap-3">
                  <img src="/cats/peach-cat-study-peach.gif" alt="گربه‌ی پیکسلی متحرک" draggable={false} className=" w-70 h-60 shrink-0 object-contain sm:h-10 sm:w-10" style={{ imageRendering: 'pixelated' }} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-white/[0.07] pt-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/[0.025] p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200"><Timer size={17} /></span>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">زمان تمرکز</div>
                    <div className="mt-0.5 text-sm font-semibold text-slate-200">{focusMinutes} دقیقه</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/[0.025] p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-200"><Coffee size={17} /></span>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">زمان استراحت</div>
                    <div className="mt-0.5 text-sm font-semibold text-slate-200">{breakMinutes} دقیقه</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/[0.025] p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/10 text-sky-200"><History size={17} /></span>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">کل جلسات</div>
                    <div className="mt-0.5 text-sm font-semibold text-slate-200">{sessions.length} جلسه</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Timer settings */}
            <aside className="flex min-w-0 flex-col gap-4">
              <section className="rounded-3xl border border-white/[0.09] bg-[#111622]/90 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-base font-semibold text-white"><Settings2 size={18} className="text-violet-300" /> تنظیمات تایمر</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">مدت‌ها را مطابق ریتم خودت تغییر بده.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled((enabled) => !enabled)}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${soundEnabled ? 'border-violet-300/20 bg-violet-300/10 text-violet-200' : 'border-white/10 bg-white/[0.035] text-slate-500'}`}
                    title={soundEnabled ? 'خاموش کردن صدای تایمر' : 'روشن کردن صدای تایمر'}
                    aria-label={soundEnabled ? 'خاموش کردن صدای تایمر' : 'روشن کردن صدای تایمر'}
                  >
                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="min-w-0 rounded-2xl border border-white/[0.07] bg-black/15 p-3">
                    <span className="mb-2 block text-xs text-slate-400">تمرکز (دقیقه)</span>
                    <input
                      type="number"
                      min={1}
                      max={240}
                      value={focusMinutes}
                      disabled={isRunning}
                      onChange={(event) => setFocusMinutes(readNumber(Number(event.target.value), 25, 1, 240))}
                      className="w-full min-w-0 rounded-xl border border-white/[0.08] bg-[#0a0e17] px-3 py-2.5 text-lg font-semibold text-white outline-none transition focus:border-violet-300/40 disabled:opacity-50"
                    />
                  </label>
                  <label className="min-w-0 rounded-2xl border border-white/[0.07] bg-black/15 p-3">
                    <span className="mb-2 block text-xs text-slate-400">استراحت (دقیقه)</span>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={breakMinutes}
                      disabled={isRunning}
                      onChange={(event) => setBreakMinutes(readNumber(Number(event.target.value), 5, 1, 120))}
                      className="w-full min-w-0 rounded-xl border border-white/[0.08] bg-[#0a0e17] px-3 py-2.5 text-lg font-semibold text-white outline-none transition focus:border-emerald-300/40 disabled:opacity-50"
                    />
                  </label>
                </div>

                <div className="mt-4 border-t border-white/[0.07] pt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-slate-200">تیک کرنومتر</div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">فقط در حالت کرنومتر، هر چند دقیقه یک صدای تیک پخش شود؟</div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-sky-300/10 px-2 py-1 text-xs font-semibold text-sky-200">{clickEveryMinutes} دقیقه</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    step={1}
                    value={clickEveryMinutes}
                    onChange={(event) => setClickEveryMinutes(Number(event.target.value))}
                    className="w-full cursor-pointer accent-sky-300"
                    aria-label="فاصله صدای تیک بر حسب دقیقه"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-600"><span>۱ دقیقه</span><span>۶۰ دقیقه</span></div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-200">طول صدای تیک</div>
                      <div className="mt-1 text-xs text-slate-500">مدت هر صدای کوتاه</div>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="number"
                        min={20}
                        max={250}
                        step={5}
                        value={clickSoundMs}
                        onChange={(event) => setClickSoundMs(readNumber(Number(event.target.value), 55, 20, 250))}
                        className="w-20 rounded-xl border border-white/[0.08] bg-[#0a0e17] px-2 py-2 text-center text-sm text-white outline-none focus:border-sky-300/40"
                        aria-label="طول صدای تیک به میلی‌ثانیه"
                      />
                      <span className="text-xs text-slate-500">ms</span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => playTone(1046, clickSoundMs, 'square', 0.028)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.07]"
                  >
                    <Volume2 size={15} /> آزمایش صدای تیک
                  </button>
                </div>
              </section>


            </aside>
          </div>

          {/* Recent session history */}
          <section className="rounded-3xl border border-white/[0.09] bg-[#111622]/90 p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><History size={19} className="text-violet-300" /> تاریخچه‌ی جلسات</h2>
                <p className="mt-1 text-sm text-slate-500">آخرین جلسه‌ها؛ با پایان و ذخیره، زمان هر جلسه در تاریخچه می‌ماند.</p>
              </div>
              <button
                type="button"
                disabled={sessions.length === 0}
                onClick={() => {
                  if (window.confirm('تمام تاریخچه‌ی جلسه‌ها پاک شود؟ این کار قابل بازگشت نیست.')) setSessions([]);
                }}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-rose-300/10 bg-rose-300/[0.04] px-3 py-2 text-xs text-rose-200/80 transition hover:bg-rose-300/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 size={14} /> پاک‌کردن تاریخچه
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.09] px-4 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-400"><CalendarDays size={21} /></div>
                <p className="mt-3 text-sm font-medium text-slate-300">هنوز جلسه‌ای ذخیره نشده</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">یک تایمر را اجرا کن و بعد «پایان و ذخیره» را بزن.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 6).map((session) => (
                  <div key={session.id} className="flex min-w-0 flex-col gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${session.mode === 'focus' ? 'bg-violet-300/10 text-violet-200' : session.mode === 'break' ? 'bg-emerald-300/10 text-emerald-200' : 'bg-sky-300/10 text-sky-200'}`}>
                        {session.mode === 'focus' ? <Timer size={18} /> : session.mode === 'break' ? <Coffee size={18} /> : <Activity size={18} />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-200">
                          {modeLabel(session.mode)}
                          {session.goalReached && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300/10 px-2 py-0.5 text-[10px] text-emerald-200"><CheckCircle2 size={11} /> هدف رسید</span>}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {new Date(session.endedAt).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-xs text-slate-500">مدت جلسه</span>
                      <span dir="ltr" className="font-mono text-lg font-semibold tabular-nums text-white">{formatTime(session.durationSec)}</span>
                    </div>
                  </div>
                ))}
                {sessions.length > 6 && <p className="pt-1 text-center text-xs text-slate-500">{sessions.length - 6} جلسه‌ی قدیمی‌تر هم ذخیره شده و در تحلیل پایین لحاظ می‌شود.</p>}
              </div>
            )}
          </section>

          {/* Custom date range analyzer - intentionally at the end of the page */}
          <section className="rounded-3xl border border-white/[0.09] bg-[#111622]/95 p-4 shadow-xl shadow-black/10 sm:p-6 md:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-300/15 bg-sky-300/[0.06] px-3 py-1 text-xs text-sky-200"><BarChart3 size={14} /> تحلیل شخصی</div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">تحلیل در بازه‌ی دلخواه</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">بازه‌ی زمانی را انتخاب کن تا زمان تمرکز، تعداد جلسه‌ها و روند روزانه را بررسی کنی.</p>
              </div>
              <div className="grid w-full grid-cols-2 gap-3 sm:max-w-md">
                <label className="min-w-0">
                  <span className="mb-1.5 block text-xs text-slate-400">از تاریخ</span>
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(event) => setFromDate(event.target.value)}
                    className="w-full min-w-0 rounded-xl border border-white/[0.09] bg-[#0a0e17] px-2 py-3 text-xs text-white outline-none [color-scheme:dark] focus:border-sky-300/40 sm:px-3 sm:text-sm"
                  />
                </label>
                <label className="min-w-0">
                  <span className="mb-1.5 block text-xs text-slate-400">تا تاریخ</span>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(event) => setToDate(event.target.value)}
                    className="w-full min-w-0 rounded-xl border border-white/[0.09] bg-[#0a0e17] px-2 py-3 text-xs text-white outline-none [color-scheme:dark] focus:border-sky-300/40 sm:px-3 sm:text-sm"
                  />
                </label>
              </div>
            </div>

            {!rangeIsValid ? (
              <div className="mt-6 rounded-2xl border border-amber-300/10 bg-amber-300/[0.04] p-4 text-sm text-amber-100/80">
                تاریخ شروع باید قبل از تاریخ پایان یا برابر با آن باشد.
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                  <StatCard label="زمان تمرکز" value={formatDuration(stats.focusSec)} detail="فقط جلسه‌های تمرکز" icon={<Timer size={18} />} />
                  <StatCard label="مجموع زمان ثبت‌شده" value={formatDuration(stats.totalSec)} detail="تمرکز + استراحت + کرنومتر" icon={<Activity size={18} />} />
                  <StatCard label="جلسه‌ها" value={String(stats.count)} detail={`میانگین هر جلسه: ${formatDuration(stats.averageSec)}`} icon={<History size={18} />} />
                  <StatCard label="رسیدن به هدف" value={String(stats.completedGoals)} detail="جلسه‌هایی که هدف پومودورو کامل شد" icon={<CheckCircle2 size={18} />} />
                </div>

                <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.65fr)]">
                  <div className="min-w-0 rounded-2xl border border-white/[0.07] bg-black/15 p-4 sm:p-5">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white">روند روزانه‌ی تمرکز</h3>
                        <p className="mt-1 text-xs text-slate-500">هر ستون نشان‌دهنده‌ی مجموع زمان تمرکز در یک روز است.</p>
                      </div>
                      <span className="w-fit rounded-lg bg-violet-300/10 px-2.5 py-1.5 text-xs text-violet-200">{dailyRows.length} روز</span>
                    </div>

                    {stats.count === 0 ? (
                      <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] px-3 text-center">
                        <BarChart3 size={22} className="text-slate-600" />
                        <p className="mt-2 text-sm text-slate-400">در این بازه داده‌ای نداریم.</p>
                        <p className="mt-1 text-xs text-slate-600">با ثبت اولین جلسه، نمودار اینجا نمایش داده می‌شود.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dailyRows.map((row) => {
                          const barWidth = row.focusSec > 0 ? Math.max(2, (row.focusSec / maxDailyFocus) * 100) : 0;
                          return (
                            <div key={row.date} className="grid min-w-0 grid-cols-[78px_minmax(0,1fr)_64px] items-center gap-2 sm:grid-cols-[105px_minmax(0,1fr)_82px] sm:gap-3">
                              <div className="truncate text-[11px] text-slate-400 sm:text-xs">
                                {new Date(`${row.date}T00:00:00`).toLocaleDateString('fa-IR', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </div>
                              <div dir="ltr" className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-300 transition-[width]" style={{ width: `${barWidth}%` }} />
                              </div>
                              <div dir="ltr" className="text-left font-mono text-[11px] tabular-nums text-slate-300 sm:text-xs">{formatTime(row.focusSec)}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {dailyRows.length >= 366 && (
                      <p className="mt-4 text-[11px] leading-5 text-slate-600">برای خوانایی، نمودار روزانه حداکثر ۳۶۶ روز را نمایش می‌دهد؛ آمار بالای نمودار کل بازه‌ی انتخابی را پوشش می‌دهد.</p>
                    )}
                  </div>

                  <div className="min-w-0 rounded-2xl border border-white/[0.07] bg-black/15 p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-white">ترکیب زمان</h3>
                    <p className="mt-1 text-xs text-slate-500">تفکیک زمان ثبت‌شده بر اساس حالت تایمر</p>
                    <div className="mt-5 space-y-4">
                      {[
                        { label: 'تمرکز', seconds: stats.focusSec, color: 'bg-violet-300', text: 'text-violet-200' },
                        { label: 'استراحت', seconds: stats.breakSec, color: 'bg-emerald-300', text: 'text-emerald-200' },
                        { label: 'کرنومتر', seconds: stats.stopwatchSec, color: 'bg-sky-300', text: 'text-sky-200' },
                      ].map((item) => {
                        const percent = stats.totalSec > 0 ? (item.seconds / stats.totalSec) * 100 : 0;
                        return (
                          <div key={item.label}>
                            <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                              <span className="text-slate-400">{item.label}</span>
                              <span className={`${item.text} tabular-nums`}>{Math.round(percent)}٪</span>
                            </div>
                            <div dir="ltr" className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
                            </div>
                            <div className="mt-1.5 text-left text-[11px] tabular-nums text-slate-500">{formatDuration(item.seconds)}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5">
                      <div className="flex items-center gap-2 text-xs text-slate-400"><Zap size={14} className="text-amber-200" /> نکته‌ی گزارش</div>
                      <p className="mt-2 text-xs leading-6 text-slate-400">
                        زمان‌ها بر اساس جلسه‌هایی محاسبه می‌شوند که با دکمه‌ی «پایان و ذخیره» ثبت کرده‌ای. مکث‌کردن به‌تنهایی جلسه‌ای ذخیره نمی‌کند.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
          <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-300/[0.07] px-3 py-1.5 text-xs text-violet-200">
              <Sparkles size={14} />
              فضای شخصی تمرکز
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              تایمر مطالعه
              <span className="text-violet-300">؛</span> با ریتم خودت
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              پومودورو، کرنومتر، صدای تیک و گزارش روند مطالعه؛ همه‌چیز روی همین دستگاه ذخیره می‌شود.
            </p>
          </div>

        </header>

          <footer className="pb-3 pt-1 text-center text-[11px] leading-5 text-slate-600">
            داده‌ها روی همین مرورگر ذخیره می‌شوند؛ پاک‌کردن داده‌های سایت یا استفاده از مرورگر دیگر می‌تواند تاریخچه را حذف کند.
          </footer>
        </main>
      </div>
    </div>
  );
}
