import {
  Clock3,
  CalendarDays,
  BarChart3,
  Timer,
  Activity,
  Trophy,
  Flame,
  Gauge,
  OctagonAlert, GapHorizontal,
} from "lucide-react";

import {AnalysisStats, getTimeOfDay} from "@/app/lib/statistics";
import { formatDuration } from "@/app/lib/formatting";

type Props = {
  stats: AnalysisStats;
};

export function StatsGrid({ stats }: Props) {
  const cards = [
    {
      title: "مجموع مطالعه",
      value: formatDuration(
        stats.overview.totalSeconds
      ),
      icon: Clock3,
    },
    {
      title: "میانگین روزانه بعد از حذف اثر روزهای پرت",
      value: formatDuration(
        stats.overview.outlierAdjustedMeanSeconds
      ),
      icon: Timer,
    },
    {
      title: "میانه روزانه",
      value: formatDuration(
        stats.overview.dailyMedianSeconds
      ),
      icon: Activity,
    },
    {
      title: "میانگین هر پارت",
      value: formatDuration(
        stats.overview.sessionAverageSeconds
      ),
      icon: Clock3,
    },

    {
      title: "روزهای مطالعه",
      value: stats.overview.studyDays,
      icon: CalendarDays,
    },
    {
      title: "تعداد پارت‌ها",
      value: stats.overview.sessions,
      icon: BarChart3,
    },
    {
      title: "میانگین فاصله بین پارت ها",
      value: formatDuration(
        stats.sessionStructure.medianGapSeconds
      ),
      icon: GapHorizontal,
    },
    {
      title: "هدف 7 روز آینده",
      value: formatDuration(
        stats.targets7Days.reasonableMaximumDailySeconds
      ),
      icon: GapHorizontal,
    },
    {
      title: "طولانی‌ترین پارت",
      value: formatDuration(
        stats.subjects.length > 0
          ? Math.max(
              ...stats.daily.map(
                (day) =>
                  day.longestSessionSeconds
              )
            )
          : 0
      ),
      icon: Trophy,
    },
    {
      title: "روزهای +۵ ساعت",
      value:
        stats.consistency.daysAbove5Hours,
      icon: Flame,
    },
    {
      title: "روند پیشرفت روزانه",
      value:
        stats.trend.direction,
      icon: Flame,
    },
    {
      title: "روزهای خیلی ضعیف",
      value:
        stats.consistency.veryWeakDays,
      icon: OctagonAlert,
    },
    {
      title: "ثبات مطالعه",
      value: `${stats.consistency.consistencyScore}/100`,
      icon: Gauge,
    },
  ];

  return (
    <section className="mb-6">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-5"
          >
            <div className="flex mb-4 flex-row items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Icon size={19} />
            </div>

            <p className="text-sm text-slate-500">
              {card.title}
            </p>
            </div>
            <p className="mt-1 text-xl font-bold text-slate-100">
              {card.value}
            </p>
          </div>
        );
      })}
      </div>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-slate-100">
          موارد نیازمند توجه
        </h2>

        <div className="mt-4 space-y-3">
          {stats.priorities.map((priority) => (
            <div
              key={priority.id}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium text-slate-200">
                  {priority.problem}
                </h3>

                <span className="text-xs text-slate-500">
                  {priority.severity}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                {priority.impact}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {priority.evidence}
              </p>

              <p className="mt-2 text-sm text-indigo-400">
                {priority.recommendation}
              </p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

