'use client';

import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Download,
  FileUp,
  Plus,
  Save,
  Trash2,
  WandSparkles,
  Copy,
  BookOpen,
  CalendarDays,
  FileText,
  RotateCcw,
  Send,
} from 'lucide-react';
import {
  generatePlan,
  type PlannerConfig,
  type SubjectConfig,
} from '@/app/lib/planner';

const starter: PlannerConfig = {
  days: 5,
  subjects: {
    calculus: {
      name: 'حسابان',
      ranges: [
        { range: '1724-1800', step: 2 },
        { range: '1459-1511', step: 2 },
      ],
    },
    physics: { name: 'فیزیک', ranges: [{ range: '850-1010', step: 2 }] },
    chemistry: { name: 'شیمی', ranges: [{ range: '155-256', step: 1 }] },
    geometry: { name: 'هندسه', ranges: [{ range: '783-888', step: 1 }] },
  },
  schedule: [
    { subject: 'calculus' },
    { subject: 'physics' },
    { one_of: ['chemistry', 'geometry'] },
  ],
};

type RangeDraft = { range: string; step: string };

type SubjectDraft = {
  id: string;
  name: string;
  ranges: RangeDraft[];
};

const toDraft = (id: string, subject: SubjectConfig): SubjectDraft => {
  const ranges: RangeDraft[] = Array.isArray(subject.ranges)
    ? subject.ranges.map((item) => ({
        range: item.range,
        step: String(item.step ?? 1),
      }))
    : (Array.isArray(subject.range)
        ? subject.range
        : subject.range
          ? [subject.range]
          : subject.start !== undefined && subject.end !== undefined
            ? [`${subject.start}-${subject.end}`]
            : [''])
      .map((range) => ({
        range,
        step: String(subject.step ?? 1),
      }));

  return {
    id,
    name: subject.name,
    ranges: ranges.length ? ranges : [{ range: '', step: String(subject.step ?? 1) }],
  };
};

const RETURNED_OUTPUT_KEY = 'study-planner-returned-output';

function decodeBase64Utf8(encoded: string): string {
  const binary = window.atob(decodeURIComponent(encoded));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function PlannerPage() {
  const [config, setConfig] = useState<PlannerConfig>(starter);
  const [returnedOutput, setReturnedOutput] = useState('');
  const [selected, setSelected] = useState(
    Object.keys(starter.subjects)[0],
  );
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState<SubjectDraft>(
    toDraft('calculus', starter.subjects.calculus),
  );
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [groupSelection, setGroupSelection] = useState<string[]>([]);
  const importRef = useRef<HTMLInputElement>(null);

  const generated = useMemo(() => {
    try {
      return { output: generatePlan(config), error: '' };
    } catch (e) {
      return {
        output: '',
        error:
          e instanceof Error
            ? e.message
            : 'پیکربندی برنامه معتبر نیست.',
      };
    }
  }, [config]);

  // A plan returned from the viewer takes precedence until config is edited.
  const output = returnedOutput || generated.output;
  const visibleError = generated.error || error;

  useEffect(() => {
    try {
      const prefix = '#plan=';
      let incoming = '';

      if (window.location.hash.startsWith(prefix)) {
        incoming = decodeBase64Utf8(window.location.hash.slice(prefix.length));

        if (!incoming.trim() || !/^\s*\d+\s{2,}/m.test(incoming)) {
          throw new Error('Invalid output.txt content');
        }

        sessionStorage.setItem(RETURNED_OUTPUT_KEY, incoming);
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search,
        );
      } else {
        // Keep a returned plan available after refresh in this tab.
        incoming = sessionStorage.getItem(RETURNED_OUTPUT_KEY) ?? '';
      }

      if (incoming) {
        setReturnedOutput(incoming);
        setError('');
        setNotice('خروجی فعلی از نمایشگر مطالعه به استودیو برگشت داده شد.');
      }
    } catch {
      sessionStorage.removeItem(RETURNED_OUTPUT_KEY);
      setError('خواندن خروجی برگشتی ناموفق بود.');
    }
  }, []);

  function setConfigAndResetOutput(nextConfig: PlannerConfig) {
    setReturnedOutput('');
    sessionStorage.removeItem(RETURNED_OUTPUT_KEY);
    setConfig(nextConfig);
  }

  function updateSubjectDraft(id: string) {
    setSelected(id);
    setDraft(toDraft(id, config.subjects[id]));
  }

  function saveSubject() {
    const id = draft.id.trim();

    if (!id || !draft.name.trim()) {
      setError('شناسه و نام نمایشی درس الزامی است.');
      return;
    }

    const ranges = draft.ranges.map((item) => ({
      range: item.range.trim(),
      step: Number(item.step),
    }));

    if (!ranges.length || ranges.some((item) => !item.range)) {
      setError('برای هر ردیف یک بازه وارد کنید؛ مثلاً 1724-1800.');
      return;
    }

    const invalidRange = ranges.find(
      (item) => !/^\d+\s*[-–—]\s*\d+$/.test(item.range),
    );
    if (invalidRange) {
      setError(`بازهٔ «${invalidRange.range}» معتبر نیست. از قالب 1724-1800 استفاده کنید.`);
      return;
    }

    const invalidStep = ranges.find(
      (item) => !Number.isInteger(item.step) || item.step <= 0,
    );
    if (invalidStep) {
      setError('گام هر بازه باید یک عدد صحیح بزرگ‌تر از صفر باشد.');
      return;
    }

    const next = { ...config.subjects };

    if (id !== selected && id in next) {
      setError('این شناسه قبلاً برای درس دیگری استفاده شده است.');
      return;
    }

    if (id !== selected) delete next[selected];

    next[id] = {
      name: draft.name.trim(),
      ranges,
    };

    setConfigAndResetOutput({
      ...config,
      subjects: next,
      schedule: config.schedule.map((item) =>
        'subject' in item
          ? { subject: item.subject === selected ? id : item.subject }
          : {
              one_of: item.one_of.map((subjectId) =>
                subjectId === selected ? id : subjectId,
              ),
            },
      ),
    });

    setSelected(id);
    setDraft({ ...draft, id });
    setError('');
    setNotice('تغییرات درس ذخیره شد.');
  }

  function addSubject() {
    const id = newId.trim();

    if (!id || !newName.trim() || id in config.subjects) {
      setError('یک شناسهٔ یکتا و نام برای درس جدید وارد کنید.');
      return;
    }

    const subject = { name: newName.trim(), ranges: [{ range: '1-20', step: 1 }] };

    setConfigAndResetOutput({
      ...config,
      subjects: { ...config.subjects, [id]: subject },
    });
    setSelected(id);
    setDraft(toDraft(id, subject));
    setNewId('');
    setNewName('');
    setError('');
    setNotice('درس اضافه شد. پیش از ساخت برنامه، بازه‌های تست آن را ویرایش کنید.');
  }

  function removeSubject(id: string) {
    const subjects = { ...config.subjects };
    delete subjects[id];

    const schedule = config.schedule
      .map((item) =>
        'subject' in item
          ? item
          : { one_of: item.one_of.filter((subjectId) => subjectId !== id) },
      )
      .filter((item) =>
        'subject' in item
          ? item.subject !== id
          : item.one_of.length > 0 && item.one_of.length > 1,
      );

    setConfigAndResetOutput({ ...config, subjects, schedule });

    const nextId = Object.keys(subjects)[0];
    if (nextId) {
      updateSubjectDraft(nextId);
    } else {
      setSelected('');
      setDraft({ id: '', name: '', ranges: [{ range: '', step: '1' }] });
    }

    setError('');
    setNotice('درس حذف شد.');
  }

  function addRegular(id: string) {
    if (
      !id ||
      config.schedule.some((item) =>
        'subject' in item ? item.subject === id : item.one_of.includes(id),
      )
    ) {
      setError('این درس از قبل در ترتیب برنامه وجود دارد.');
      return;
    }

    setConfigAndResetOutput({
      ...config,
      schedule: [...config.schedule, { subject: id }],
    });
    setError('');
    setNotice('درس به ترتیب برنامه اضافه شد.');
  }

  function addGroup() {
    if (groupSelection.length < 2) {
      setError('برای گروه «یکی از این درس‌ها»، دست‌کم دو درس انتخاب کنید.');
      return;
    }

    const already = config.schedule.flatMap((item) =>
      'subject' in item ? [item.subject] : item.one_of,
    );

    if (groupSelection.some((id) => already.includes(id))) {
      setError('هر درس فقط یک‌بار می‌تواند در ترتیب برنامه قرار بگیرد.');
      return;
    }

    setConfigAndResetOutput({
      ...config,
      schedule: [...config.schedule, { one_of: groupSelection }],
    });
    setGroupSelection([]);
    setError('');
    setNotice('گروه به ترتیب برنامه اضافه شد.');
  }

  function removeSchedule(index: number) {
    setConfigAndResetOutput({
      ...config,
      schedule: config.schedule.filter((_, i) => i !== index),
    });
    setError('');
    setNotice('مورد از ترتیب برنامه حذف شد.');
  }

  function download(
    filename: string,
    content: string,
    type = 'text/plain;charset=utf-8',
  ) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function saveLocal() {
    try {
      localStorage.setItem(
        'study-planner-config',
        JSON.stringify(config, null, 2),
      );
      setError('');
      setNotice('پیکربندی در این مرورگر ذخیره شد.');
    } catch {
      setError('ذخیرهٔ پیکربندی در این مرورگر انجام نشد.');
    }
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem('study-planner-config');
      if (!raw) {
        setError('هیچ پیکربندی ذخیره‌شده‌ای در این مرورگر پیدا نشد.');
        return;
      }

      const parsed = JSON.parse(raw) as PlannerConfig;
      setConfigAndResetOutput(parsed);
      const id = Object.keys(parsed.subjects)[0];
      if (id) {
        setSelected(id);
        setDraft(toDraft(id, parsed.subjects[id]));
      }
      setNotice('پیکربندی ذخیره‌شده بارگذاری شد.');
      setError('');
    } catch {
      setError('خواندن پیکربندی ذخیره‌شده امکان‌پذیر نبود.');
    }
  }

  function importConfig(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as PlannerConfig;
        setConfigAndResetOutput(parsed);
        const id = Object.keys(parsed.subjects)[0];
        if (id) {
          setSelected(id);
          setDraft(toDraft(id, parsed.subjects[id]));
        }
        setError('');
        setNotice('فایل پیکربندی وارد شد.');
      } catch {
        setError('فایل JSON پیکربندی معتبر نیست.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  //const VIEWER_URL = 'http://localhost:3000';
  // برای انتشار، خط بالا را با نشانی سایت جایگزین کنید:
   const VIEWER_URL = 'https://study-analyzer-one.vercel.app';

  function openInViewer() {
    if (!output || visibleError) return;

    // کدگذاری UTF-8 برای پشتیبانی از متن فارسی
    const bytes = new TextEncoder().encode(output);
    let binary = '';

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    const encoded = btoa(binary);

    window.open(
      `${VIEWER_URL}#plan=${encodeURIComponent(encoded)}`,
      '_blank',
      'noopener,noreferrer',
    );

    setNotice('برنامه برای نمایشگر مطالعه ارسال شد.');
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
      setError('');
      setNotice('خروجی در کلیپ‌بورد کپی شد.');
    } catch {
      setError('دسترسی به کلیپ‌بورد ممکن نیست؛ از گزینهٔ دانلود فایل استفاده کنید.');
    }
  }

  const scheduledIds = config.schedule.flatMap((item) =>
    'subject' in item ? [item.subject] : item.one_of,
  );

  return (
    <main
  dir="rtl"
  lang="fa"
  className="min-h-[100dvh] w-full overflow-x-hidden bg-[#080d18] font-vazirmatn text-slate-100"
>
  <div className="mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-7 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3 sm:gap-4">
  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/25 sm:h-12 sm:w-12">
    <WandSparkles size={22} />
  </div>

  <div className="min-w-0">
    <p className="text-xs font-semibold tracking-wide text-blue-300">
      سامانهٔ مطالعه
    </p>

    <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-3xl">
      برنامه‌ریز کنکور
    </h1>

    <p className="mt-1 text-xs leading-6 text-slate-400 sm:text-sm">
      برنامه‌ای متعادل بسازید و فایل{' '}
      <code className="text-slate-300" dir="ltr">output.txt</code>{' '}
      را خروجی بگیرید.
    </p>
  </div>
</div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
  <button onClick={saveLocal} className="btn-secondary w-full sm:w-auto">
    <Save size={16} /> ذخیرهٔ پیکربندی
  </button>

  <button onClick={loadLocal} className="btn-secondary w-full sm:w-auto">
    <RotateCcw size={16} /> بارگذاری ذخیره‌شده
  </button>

  <button
    onClick={() => importRef.current?.click()}
    className="btn-secondary w-full sm:w-auto"
  >
    <FileUp size={16} /> ورود فایل JSON
  </button>

  <input
    ref={importRef}
    type="file"
    accept=".json,application/json"
    className="hidden"
    onChange={importConfig}
  />

  <button
    onClick={() =>
      download(
        'planner-config.json',
        JSON.stringify(config, null, 2),
        'application/json',
      )
    }
    className="btn-secondary w-full sm:w-auto"
  >
    <Download size={16} /> خروجی پیکربندی
  </button>
</div>
        </header>

        {(visibleError || notice) && (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
              visibleError
                ? 'border-rose-400/25 bg-rose-400/10 text-rose-200'
                : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
            }`}
            role="status"
          >
            {visibleError || notice}
            <button
              className="float-left mr-3 opacity-70"
              aria-label="بستن پیام"
              onClick={() => {
                setError('');
                setNotice('');
              }}
            >
              ×
            </button>
          </div>
        )}

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            icon={<CalendarDays size={18} />}
            label="روزهای برنامه"
            value={String(config.days)}
          />
          <Stat
            icon={<BookOpen size={18} />}
            label="تعداد درس‌ها"
            value={String(Object.keys(config.subjects).length)}
          />
          <Stat
            icon={<FileText size={18} />}
            label="موارد برنامه"
            value={String(config.schedule.length)}
          />
          <Stat
            icon={<WandSparkles size={18} />}
            label="تعداد سطرهای خروجی"
            value={output ? String(output.split('\n').length) : '—'}
          />
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
          <div className="space-y-6">
            <Panel
              title="تنظیمات برنامه"
              subtitle="تعداد روزهای برنامه را مشخص کنید."
            >
              <label className="field-label" htmlFor="days">
                تعداد روزها
              </label>
              <input
                id="days"
                type="number"
                min={1}
                max={60}
                value={config.days}
                onChange={(event) =>
                  setConfigAndResetOutput({ ...config, days: Number(event.target.value) })
                }
                className="field-input max-w-40"
                dir="ltr"
              />
              <p className="mt-2 text-xs text-slate-500">
                تست‌های هر درس عادی به‌صورت متوازن بین تمام روزها تقسیم می‌شوند.
              </p>
            </Panel>

            <Panel
              title="درس‌ها"
              subtitle="برای ویرایش بازه‌ها و گام تست، یک درس را انتخاب کنید."
            >
              <div className="mb-4 flex flex-wrap gap-2">
                {Object.entries(config.subjects).map(([id, subject]) => (
                  <button
                    key={id}
                    onClick={() => updateSubjectDraft(id)}
                    className={`rounded-xl border px-3 py-2 text-sm transition ${
                      selected === id
                        ? 'border-blue-400/50 bg-blue-500/15 text-blue-200'
                        : 'border-white/10 bg-white/[.025] text-slate-300 hover:bg-white/[.06]'
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>

              {selected && config.subjects[selected] ? (
                <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">شناسهٔ درس</p>
                      <input
                        value={draft.id}
                        onChange={(event) =>
                          setDraft({ ...draft, id: event.target.value })
                        }
                        className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-200 outline-none"
                        dir="ltr"
                      />
                    </div>
                    <button
                      aria-label="حذف درس"
                      title="حذف درس"
                      onClick={() => removeSubject(selected)}
                      className="icon-button text-rose-300"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div>
                    <label className="field-label">نام نمایشی درس</label>
                    <input
                      value={draft.name}
                      onChange={(event) =>
                        setDraft({ ...draft, name: event.target.value })
                      }
                      className="field-input"
                      placeholder="مثلاً حسابان"
                    />
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <label className="field-label mb-0">بازه‌های تست و گام هر بازه</label>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            ranges: [...draft.ranges, { range: '', step: '1' }],
                          })
                        }
                        className="btn-secondary"
                      >
                        <Plus size={15} /> افزودن بازه
                      </button>
                    </div>

                    <div className="space-y-2">
                      {draft.ranges.map((range, index) => (
                        <div
                          key={index}
                          className="grid items-end gap-3 rounded-xl border border-white/10 bg-white/[.02] p-3 sm:grid-cols-[minmax(0,1fr)_112px_auto]"
                        >
                          <div className="min-w-0">
                            <label className="field-label">بازهٔ {index + 1}</label>
                            <input
                              value={range.range}
                              onChange={(event) =>
                                setDraft({
                                  ...draft,
                                  ranges: draft.ranges.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, range: event.target.value }
                                      : item,
                                  ),
                                })
                              }
                              className="field-input"
                              placeholder="1724-1800"
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="field-label">گام این بازه</label>
                            <input
                              type="number"
                              min={1}
                              step={1}
                              value={range.step}
                              onChange={(event) =>
                                setDraft({
                                  ...draft,
                                  ranges: draft.ranges.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, step: event.target.value }
                                      : item,
                                  ),
                                })
                              }
                              className="field-input"
                              dir="ltr"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                ranges: draft.ranges.filter((_, itemIndex) => itemIndex !== index),
                              })
                            }
                            disabled={draft.ranges.length === 1}
                            className="icon-button mb-0.5 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`حذف بازهٔ ${index + 1}`}
                            title="حذف این بازه"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      برای هر بازه، گام مستقل تعیین کنید. مثلاً بازهٔ 100-120 با گام 2، تست‌های 100، 102، 104 و ... را شامل می‌شود. بازه‌های برعکس خودکار اصلاح و شماره‌های تکراری حذف می‌شوند.
                    </p>
                  </div>

                  <button onClick={saveSubject} className="btn-primary mt-4">
                    <Save size={16} /> اعمال تغییرات درس
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  از بخش زیر اولین درس خود را اضافه کنید.
                </p>
              )}

              <div className="mt-4 grid gap-2 rounded-2xl border border-dashed border-white/15 p-4 sm:grid-cols-[.8fr_1fr_auto]">
                <input
                  value={newId}
                  onChange={(event) => setNewId(event.target.value)}
                  className="field-input"
                  placeholder="شناسهٔ جدید (مثلاً algebra)"
                  dir="ltr"
                />
                <input
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  className="field-input"
                  placeholder="نام نمایشی درس"
                />
                <button onClick={addSubject} className="btn-secondary">
                  <Plus size={16} /> افزودن درس
                </button>
              </div>
            </Panel>

            <Panel
              title="ترتیب برنامه"
              subtitle="ترتیبی که در این بخش می‌بینید، در فایل خروجی نیز حفظ می‌شود."
            >
              <div className="space-y-2">
                {config.schedule.map((item, index) => (
                  <div
                    key={`${index}-${'subject' in item ? item.subject : item.one_of.join('-')}`}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.025] p-3"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[.06] text-xs text-slate-400">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {'subject' in item
                          ? config.subjects[item.subject]?.name ?? item.subject
                          : item.one_of
                              .map((id) => config.subjects[id]?.name ?? id)
                              .join(' یا ')}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {'subject' in item
                          ? `هر روز · ${item.subject}`
                          : 'یکی از این درس‌ها · دقیقاً یک درس در هر روز'}
                      </p>
                    </div>
                    <button
                      onClick={() => removeSchedule(index)}
                      className="icon-button"
                      aria-label="حذف این مورد از برنامه"
                      title="حذف از برنامه"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {!config.schedule.length && (
                  <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
                    ترتیب برنامه خالی است. یک درس یا گروه «یکی از این درس‌ها» اضافه کنید.
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-2xl bg-[#0b1220] p-4">
                <label className="field-label" htmlFor="regular-subject">
                  افزودن یک درس عادی
                </label>
                <div className="flex gap-2">
                  <select
                    id="regular-subject"
                    className="field-input"
                    defaultValue=""
                  >
                    <option value="">انتخاب درس…</option>
                    {Object.entries(config.subjects)
                      .filter(([id]) => !scheduledIds.includes(id))
                      .map(([id, subject]) => (
                        <option key={id} value={id}>
                          {subject.name} ({id})
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => {
                      const element = document.getElementById(
                        'regular-subject',
                      ) as HTMLSelectElement;
                      addRegular(element.value);
                      element.value = '';
                    }}
                    className="btn-secondary"
                  >
                    افزودن
                  </button>
                </div>

                <div className="mt-4">
                  <label className="field-label">
                    ساخت گروه «یکی از این درس‌ها»
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(config.subjects)
                      .filter(([id]) => !scheduledIds.includes(id))
                      .map(([id, subject]) => (
                        <label
                          key={id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300"
                        >
                          <input
                            type="checkbox"
                            checked={groupSelection.includes(id)}
                            onChange={(event) =>
                              setGroupSelection(
                                event.target.checked
                                  ? [...groupSelection, id]
                                  : groupSelection.filter((value) => value !== id),
                              )
                            }
                            className="accent-blue-500"
                          />
                          {subject.name}
                        </label>
                      ))}
                  </div>
                  <button onClick={addGroup} className="btn-secondary mt-3">
                    <Plus size={16} /> افزودن درس‌های انتخاب‌شده به‌صورت یک گروه
                  </button>
                </div>
              </div>
            </Panel>
          </div>

          <div className="xl:sticky xl:top-5">
            <section className="overflow-hidden rounded-2xl border border-blue-400/20 bg-[#0b1220] shadow-2xl shadow-black/20">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <h2 className="font-semibold">پیش‌نمایش خروجی</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    متن ساده با قالب‌بندی دقیق · UTF-8
                  </p>
                  {returnedOutput && (
                    <button
                      type="button"
                      onClick={() => {
                        setReturnedOutput('');
                        sessionStorage.removeItem(RETURNED_OUTPUT_KEY);
                        setNotice('پیش‌نمایش به خروجی تولیدشده از تنظیمات فعلی برگشت.');
                      }}
                      className="mt-2 text-xs font-semibold text-blue-300 transition hover:text-blue-200"
                    >
                      نمایش خروجی تولیدشده از تنظیمات
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={copyOutput}
                    disabled={!output || !!visibleError}
                    className="btn-secondary"
                  >
                    <Copy size={15} /> کپی
                  </button>
                  <button
                    onClick={() => download('output.txt', output)}
                    disabled={!output || !!visibleError}
                    className="btn-primary"
                  >
                    <Download size={15} /> دانلود فایل txt
                  </button>
                  <button
                    onClick={openInViewer}
                    disabled={!output || !!visibleError}
                    className="btn-primary"
                  >
                    <Send size={15} /> ارسال به نمایشگر مطالعه
                  </button>
                </div>
              </div>

              <div className="border-b border-white/[.06] bg-[#080d18] px-5 py-3">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span dir="ltr">output.txt</span>
                  <span>
                    {output
                      ? `${new Blob([output]).size} بایت`
                      : 'خروجی‌ای وجود ندارد'}
                  </span>
                </div>
              </div>

              <pre
                className="min-h-[380px] overflow-auto p-5 font-mono text-[12px] leading-7 text-slate-200 sm:text-[13px]"
                dir="ltr"
              >
                {output ||
                  (visibleError
                    ? 'برای ساخت خروجی، خطاهای پیکربندی را برطرف کنید.'
                    : 'برنامهٔ شما در این قسمت نمایش داده می‌شود.')}
              </pre>

              <div className="border-t border-white/10 px-5 py-3 text-xs leading-5 text-slate-500">
                خروجی در مرورگر شما ساخته می‌شود؛ نیازی به سرور یا حساب کاربری نیست.
              </div>
            </section>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[.025] p-4">
              <p className="text-sm font-medium text-slate-300">
                نسخهٔ پشتیبان پیکربندی
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                پیکربندی را در مرورگر ذخیره کنید یا برای انتقال به دستگاه دیگر، فایل
                JSON بگیرید. وارد کردن یک پیکربندی، تنظیمات فعلی ویرایشگر را جایگزین
                می‌کند.
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-600">
          برنامه‌ریز کنکور · نسخهٔ TypeScript از برنامه‌ریز اصلی پایتون
        </footer>
      </div>

      <style jsx global>{`
        .field-label {
          display: block;
          margin-bottom: 7px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .field-input {
          width: 100%;
          min-width: 0;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 10px;
          background: #080d18;
          padding: 10px 12px;
          color: #e2e8f0;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .field-input:focus {
          border-color: rgba(96, 165, 250, 0.7);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }

        .field-input option {
          background: #0b1220;
        }

        .field-label,
        .btn-primary,
        .btn-secondary,
        .icon-button {
          font-family: inherit;
        }

        .btn-primary,
        .btn-secondary,
        .icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.15s;
        }

        .btn-primary {
          border: 1px solid rgba(96, 165, 250, 0.35);
          background: #2563eb;
          padding: 10px 13px;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .btn-primary:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }

        .btn-secondary {
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: rgba(255, 255, 255, 0.035);
          padding: 9px 11px;
          color: #cbd5e1;
        }

        .btn-secondary:hover {
          border-color: rgba(148, 163, 184, 0.35);
          background: rgba(255, 255, 255, 0.07);
        }

        .icon-button {
          padding: 8px;
          color: #94a3b8;
        }

        .icon-button:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #fda4af;
        }
      `}</style>
    </main>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0e1626] p-4 shadow-xl shadow-black/10 sm:p-5">
      <div className="mb-5">
        <h2 className="font-semibold tracking-tight text-slate-100">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e1626] p-4">
      <div className="mb-3 flex items-center gap-2 text-blue-300">
        {icon}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
