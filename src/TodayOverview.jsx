// At-a-glance summary of overdue/due-today reminders across ALL beetles, so
// you don't have to switch beetles one by one to check. Only worth showing
// once there's more than one beetle.
window.App = window.App || {};

(function () {
  const { Storage } = window.App;
  const { Card } = window.App.UI;
  const { useI18n } = window.App.I18n;

  function BeetleAttentionRow({ beetle, dueTypes, onSelect }) {
    const { t } = useI18n();
    return (
      <button
        onClick={onSelect}
        className="w-full flex items-center gap-3 bg-white border-4 border-lime-200 rounded-2xl px-3 py-2.5 text-left active:translate-y-[2px] transition-all"
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-stone-200 bg-stone-100 flex items-center justify-center shrink-0">
          {beetle.photoDataUrl ? (
            <img src={beetle.photoDataUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">🪲</span>
          )}
        </div>
        <span className="font-extrabold text-stone-800 text-sm shrink-0">{beetle.name}</span>
        <div className="flex gap-1.5 ml-auto flex-wrap justify-end">
          {dueTypes.map(({ type, overdue }) => (
            <span
              key={type.key}
              className={`text-xs px-2 py-1 rounded-full font-extrabold ${
                overdue ? "bg-rose-500 text-white" : "bg-amber-400 text-amber-950"
              }`}
            >
              {type.emoji} {overdue ? "!" : t("dashboard.dueToday")}
            </span>
          ))}
        </div>
      </button>
    );
  }

  function TodayOverview({ beetles, onSelectBeetle }) {
    const { t } = useI18n();
    if (beetles.length < 2) return null;

    const rows = beetles
      .map((beetle) => {
        const dueTypes = Storage.REMINDER_TYPES.map((type) => {
          const days = Storage.daysUntilDue(beetle.reminders[type.key]);
          return { type, days, overdue: days < 0, dueToday: days === 0 };
        }).filter((d) => d.overdue || d.dueToday);
        return { beetle, dueTypes };
      })
      .filter((r) => r.dueTypes.length > 0);

    return (
      <Card className="mb-5">
        <h2 className="text-sm font-extrabold text-stone-800 mb-3">{t("today.heading")}</h2>
        {rows.length === 0 ? (
          <p className="text-sm font-bold text-emerald-600">{t("today.allGood")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map(({ beetle, dueTypes }) => (
              <BeetleAttentionRow key={beetle.id} beetle={beetle} dueTypes={dueTypes} onSelect={() => onSelectBeetle(beetle.id)} />
            ))}
          </div>
        )}
      </Card>
    );
  }

  window.App.TodayOverview = TodayOverview;
})();
