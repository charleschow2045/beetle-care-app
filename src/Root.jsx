// Top-level app: wires beetle switcher + reminder dashboard to persisted state
window.App = window.App || {};

(function () {
  const { useState, useEffect } = React;
  const {
    Storage,
    BeetleSwitcher,
    ReminderDashboard,
    BeetleSetupForm,
    BeetleProfileCard,
    DiaryLog,
    GrowthLog,
    TempHumidityLog,
    Explore,
    BeetleQuiz,
    BackupSettings,
    TodayOverview,
  } = window.App;
  const { Card } = window.App.UI;
  const { useI18n } = window.App.I18n;

  const TAB_KEYS = ["missions", "diary", "growth", "climate", "explore", "quiz"];
  const TAB_EMOJI = { missions: "🎯", diary: "📔", growth: "🔄", climate: "🌡️", explore: "🧭", quiz: "🧠" };

  function LanguageToggle() {
    const { lang, setLang } = useI18n();
    return (
      <div className="flex rounded-xl border-4 border-stone-200 overflow-hidden shrink-0">
        <button
          onClick={() => setLang("en")}
          className={`px-3 py-1.5 text-xs font-extrabold ${lang === "en" ? "bg-amber-400 text-amber-950" : "bg-white text-stone-400"}`}
        >
          EN
        </button>
        <button
          onClick={() => setLang("zh")}
          className={`px-3 py-1.5 text-xs font-extrabold ${lang === "zh" ? "bg-amber-400 text-amber-950" : "bg-white text-stone-400"}`}
        >
          中文
        </button>
      </div>
    );
  }

  function Root() {
    const { t } = useI18n();
    const [state, setState] = useState(() => Storage.reconcileStreaks(Storage.loadState()));
    const [editingProfile, setEditingProfile] = useState(false);
    const [activeTab, setActiveTab] = useState("missions");

    useEffect(() => {
      Storage.saveState(state);
    }, [state]);

    const activeBeetle = state.beetles.find((b) => b.id === state.activeBeetleId) || null;

    function addBeetle(fields) {
      const beetle = Storage.recomputeStreak(Storage.createBeetle(fields));
      setState((s) => ({ ...s, beetles: [...s.beetles, beetle], activeBeetleId: beetle.id }));
    }

    function selectBeetle(id) {
      setEditingProfile(false);
      setState((s) => ({ ...s, activeBeetleId: id }));
    }

    function addDiaryEntry(fields) {
      const entry = Storage.createDiaryEntry(fields);
      setState((s) => ({
        ...s,
        beetles: s.beetles.map((b) => {
          if (b.id !== s.activeBeetleId) return b;
          const updated = { ...b, diaryEntries: [...(b.diaryEntries || []), entry] };
          return Storage.recomputeStreak(Storage.addPoints(updated, Storage.POINTS.diaryEntry));
        }),
      }));
    }

    function addMoltEvent(fields) {
      const event = Storage.createMoltEvent(fields);
      setState((s) => ({
        ...s,
        beetles: s.beetles.map((b) => {
          if (b.id !== s.activeBeetleId) return b;
          const updated = { ...b, lifeStage: fields.stage, moltEvents: [...(b.moltEvents || []), event] };
          return Storage.recomputeStreak(Storage.addPoints(updated, Storage.POINTS.moltEvent));
        }),
      }));
    }

    function addTempReading(fields) {
      const reading = Storage.createTempLog(fields);
      setState((s) => ({
        ...s,
        beetles: s.beetles.map((b) => {
          if (b.id !== s.activeBeetleId) return b;
          const updated = { ...b, tempLogs: [...(b.tempLogs || []), reading] };
          return Storage.recomputeStreak(Storage.addPoints(updated, Storage.POINTS.tempLog));
        }),
      }));
    }

    function deleteDiaryEntry(entryId) {
      setState((s) => ({
        ...s,
        beetles: s.beetles.map((b) =>
          b.id !== s.activeBeetleId ? b : { ...b, diaryEntries: (b.diaryEntries || []).filter((e) => e.id !== entryId) }
        ),
      }));
    }

    function deleteMoltEvent(eventId) {
      setState((s) => ({
        ...s,
        beetles: s.beetles.map((b) =>
          b.id !== s.activeBeetleId ? b : { ...b, moltEvents: (b.moltEvents || []).filter((e) => e.id !== eventId) }
        ),
      }));
    }

    function deleteTempReading(readingId) {
      setState((s) => ({
        ...s,
        beetles: s.beetles.map((b) =>
          b.id !== s.activeBeetleId ? b : { ...b, tempLogs: (b.tempLogs || []).filter((r) => r.id !== readingId) }
        ),
      }));
    }

    function restoreFromBackup(sanitizedState) {
      setEditingProfile(false);
      setState(Storage.reconcileStreaks(sanitizedState));
    }

    function updateActiveBeetleReminder(reminderKey, patch) {
      setState((s) => ({
        ...s,
        beetles: s.beetles.map((b) =>
          b.id !== s.activeBeetleId
            ? b
            : { ...b, reminders: { ...b.reminders, [reminderKey]: { ...b.reminders[reminderKey], ...patch } } }
        ),
      }));
    }

    function markDone(reminderKey) {
      setState((s) => ({
        ...s,
        beetles: s.beetles.map((b) => {
          if (b.id !== s.activeBeetleId) return b;
          const updated = {
            ...b,
            reminders: { ...b.reminders, [reminderKey]: { ...b.reminders[reminderKey], lastDoneAt: new Date().toISOString() } },
          };
          return Storage.recomputeStreak(Storage.addPoints(updated, Storage.POINTS.markDone));
        }),
      }));
    }

    function changeFrequency(reminderKey, days) {
      updateActiveBeetleReminder(reminderKey, { frequencyDays: days });
    }

    function saveProfileEdits(fields) {
      setState((s) => ({
        ...s,
        beetles: s.beetles.map((b) => (b.id !== s.activeBeetleId ? b : Storage.updateBeetleFields(b, fields))),
      }));
      setEditingProfile(false);
    }

    if (state.beetles.length === 0) {
      return (
        <div className="min-h-screen bg-lime-50 text-stone-800 px-4 py-8">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-amber-600">🪲 {t("app.title")}</h1>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <BackupSettings onRestore={restoreFromBackup} />
            </div>
          </div>
          <p className="text-stone-500 font-bold mb-6">{t("app.emptyStateSubtitle")}</p>
          <Card>
            <BeetleSetupForm onSave={addBeetle} showCancel={false} />
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-lime-50 text-stone-800 pb-10">
        <header className="px-4 pt-6 pb-3 flex items-start justify-between gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-amber-600">🪲 {t("app.title")}</h1>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <BackupSettings onRestore={restoreFromBackup} />
          </div>
        </header>

        <div className="px-4">
          <BeetleSwitcher
            beetles={state.beetles}
            activeBeetleId={state.activeBeetleId}
            onSelect={selectBeetle}
            onAdd={addBeetle}
          />
        </div>

        <main className="px-4 mt-5">
          {editingProfile ? (
            <Card>
              <BeetleSetupForm
                initialBeetle={activeBeetle}
                submitLabel={t("form.saveChanges")}
                onSave={saveProfileEdits}
                onCancel={() => setEditingProfile(false)}
              />
            </Card>
          ) : (
            <>
              <BeetleProfileCard beetle={activeBeetle} onEdit={() => setEditingProfile(true)} />

              <div className="grid grid-cols-3 gap-2 mb-4">
                {TAB_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`rounded-2xl border-4 font-extrabold py-2.5 text-xs sm:text-sm transition-all
                      ${
                        activeTab === key
                          ? "bg-violet-400 border-violet-600 text-violet-950 shadow-[0_4px_0_#4c1d95] -translate-y-0.5"
                          : "bg-white border-stone-200 text-stone-400"
                      }`}
                  >
                    {TAB_EMOJI[key]} {t("nav." + key)}
                  </button>
                ))}
              </div>

              {/* All tab bodies stay mounted and are just hidden when
                  inactive, so switching tabs never discards in-progress
                  state (e.g. quiz progress, an open diary entry draft). */}
              <div className={activeTab === "missions" ? "" : "hidden"}>
                <TodayOverview beetles={state.beetles} onSelectBeetle={selectBeetle} />
                <h2 className="text-xl font-extrabold mb-3">{t("app.missionsHeading", { name: activeBeetle.name })}</h2>
                <ReminderDashboard beetle={activeBeetle} onMarkDone={markDone} onFrequencyChange={changeFrequency} />
              </div>
              <div className={activeTab === "diary" ? "" : "hidden"}>
                <h2 className="text-xl font-extrabold mb-3">{t("app.diaryHeading", { name: activeBeetle.name })}</h2>
                <DiaryLog beetle={activeBeetle} onAddEntry={addDiaryEntry} onDeleteEntry={deleteDiaryEntry} />
              </div>
              <div className={activeTab === "growth" ? "" : "hidden"}>
                <h2 className="text-xl font-extrabold mb-3">{t("app.growthHeading", { name: activeBeetle.name })}</h2>
                <GrowthLog beetle={activeBeetle} onAddEvent={addMoltEvent} onDeleteEvent={deleteMoltEvent} />
              </div>
              <div className={activeTab === "climate" ? "" : "hidden"}>
                <h2 className="text-xl font-extrabold mb-3">{t("app.climateHeading", { name: activeBeetle.name })}</h2>
                <TempHumidityLog beetle={activeBeetle} onAddReading={addTempReading} onDeleteReading={deleteTempReading} />
              </div>
              <div className={activeTab === "explore" ? "" : "hidden"}>
                <Explore />
              </div>
              <div className={activeTab === "quiz" ? "" : "hidden"}>
                <h2 className="text-xl font-extrabold mb-3">{t("app.quizHeading")}</h2>
                <BeetleQuiz />
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  window.App.Root = Root;
})();
