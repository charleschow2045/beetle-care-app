// At-a-glance summary of overdue/due-today reminders across ALL beetles, so
// you don't have to switch beetles one by one to check. Only worth showing
// once there's more than one beetle.
window.App = window.App || {};

(function () {
  const { Storage } = window.App;
  const { SPECIMEN_PALETTE, SpecimenCard } = window.App.SpecimenTheme;
  const { useI18n } = window.App.I18n;

  // Same rust/terracotta alert accent used for "overdue" in ReminderDashboard.jsx.
  const OVERDUE_COLOR = "#A6472E";

  function BeetleAttentionRow({ beetle, dueTypes, onSelect }) {
    const { t } = useI18n();
    return (
      <button
        onClick={onSelect}
        className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left border transition-all active:translate-y-[2px]"
        style={{
          backgroundColor: SPECIMEN_PALETTE.paper,
          borderColor: `${SPECIMEN_PALETTE.metallic}33`,
          boxShadow: "0 1px 2px rgba(59,46,34,0.08), 0 3px 6px rgba(59,46,34,0.08)",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl overflow-hidden border flex items-center justify-center shrink-0"
          style={{ borderColor: `${SPECIMEN_PALETTE.ink}26`, backgroundColor: `${SPECIMEN_PALETTE.ink}0A` }}
        >
          {beetle.photoDataUrl ? (
            <img src={beetle.photoDataUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">🪲</span>
          )}
        </div>
        <span className="font-extrabold text-sm shrink-0" style={{ color: SPECIMEN_PALETTE.ink }}>
          {beetle.name}
        </span>
        <div className="flex gap-1.5 ml-auto flex-wrap justify-end">
          {dueTypes.map(({ type, overdue }) => (
            <span
              key={type.key}
              className="text-xs px-2 py-1 rounded-full font-extrabold"
              style={{
                backgroundColor: overdue ? OVERDUE_COLOR : SPECIMEN_PALETTE.amber,
                color: overdue ? SPECIMEN_PALETTE.paper : SPECIMEN_PALETTE.ink,
              }}
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
      <SpecimenCard className="mb-5">
        <h2 className="text-sm font-extrabold mb-3" style={{ color: SPECIMEN_PALETTE.ink }}>
          {t("today.heading")}
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm font-bold" style={{ color: SPECIMEN_PALETTE.metallic }}>
            {t("today.allGood")}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map(({ beetle, dueTypes }) => (
              <BeetleAttentionRow key={beetle.id} beetle={beetle} dueTypes={dueTypes} onSelect={() => onSelectBeetle(beetle.id)} />
            ))}
          </div>
        )}
      </SpecimenCard>
    );
  }

  window.App.TodayOverview = TodayOverview;
})();
