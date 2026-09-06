// Feature 1: recurring care reminders dashboard.
// Restyled as "specimen record cards" (preview — see specimenTheme.jsx) —
// this is the app's home Dashboard screen.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Storage } = window.App;
  const { SPECIMEN_PALETTE, SpecimenCard, SpecimenButton } = window.App.SpecimenTheme;
  const { useI18n } = window.App.I18n;

  // Not part of the given palette — a rust/terracotta accent for the
  // "overdue" alert state, chosen to read as urgent while still fitting the
  // earthy specimen-card look rather than a jarring stock red.
  const OVERDUE_COLOR = "#A6472E";

  // One accent per reminder type, each from the given palette, used once.
  const TYPE_ACCENT = {
    jelly: SPECIMEN_PALETTE.amber,
    substrate: SPECIMEN_PALETTE.moss,
    water: SPECIMEN_PALETTE.sky,
    wood: SPECIMEN_PALETTE.metallic,
  };
  const TYPE_BUTTON_COLOR = { jelly: "amber", substrate: "moss", water: "sky", wood: "metallic" };

  function ReminderCard({ type, reminder, onMarkDone, onFrequencyChange }) {
    const { t } = useI18n();
    const [editing, setEditing] = useState(false);
    const [draftDays, setDraftDays] = useState(reminder.frequencyDays);
    const days = Storage.daysUntilDue(reminder);
    const overdue = days < 0;
    const dueSoon = days >= 0 && days <= 1;
    const accent = TYPE_ACCENT[type.key] || SPECIMEN_PALETTE.metallic;

    function dueLabel() {
      if (overdue) return t("dashboard.overdue", { n: Math.abs(days) });
      if (days === 0) return t("dashboard.dueToday");
      if (days === 1) return t("dashboard.dueTomorrow");
      return t("dashboard.daysLeft", { n: days });
    }

    const statusColor = overdue ? OVERDUE_COLOR : dueSoon ? SPECIMEN_PALETTE.amber : SPECIMEN_PALETTE.metallic;
    const pctElapsed = Math.max(
      0,
      Math.min(100, Math.round(((reminder.frequencyDays - days) / reminder.frequencyDays) * 100))
    );

    function saveFrequency(e) {
      e.preventDefault();
      const val = Math.max(1, parseInt(draftDays, 10) || reminder.frequencyDays);
      onFrequencyChange(val);
      setEditing(false);
    }

    return (
      <SpecimenCard>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{type.emoji}</span>
            <div>
              <h3 className="text-lg font-extrabold leading-tight" style={{ color: SPECIMEN_PALETTE.ink }}>
                {t("reminder." + type.key)}
              </h3>
              <button
                className="text-xs underline decoration-dotted"
                style={{ color: `${SPECIMEN_PALETTE.ink}99` }}
                onClick={() => {
                  setDraftDays(reminder.frequencyDays);
                  setEditing((v) => !v);
                }}
              >
                {t("dashboard.every", { n: reminder.frequencyDays })}
              </button>
            </div>
          </div>
          <span
            className="text-sm font-extrabold px-3 py-1 rounded-full whitespace-nowrap"
            style={{ backgroundColor: statusColor, color: SPECIMEN_PALETTE.paper }}
          >
            {dueLabel()}
          </span>
        </div>

        <div className="mt-3 h-3 w-full rounded-full overflow-hidden" style={{ backgroundColor: `${SPECIMEN_PALETTE.ink}1A` }}>
          <div className="h-full" style={{ width: `${pctElapsed}%`, backgroundColor: statusColor }} />
        </div>

        {editing && (
          <form onSubmit={saveFrequency} className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={draftDays}
              onChange={(e) => setDraftDays(e.target.value)}
              className="w-20 rounded-xl border font-bold px-2 py-1 outline-none"
              style={{ borderColor: `${SPECIMEN_PALETTE.ink}33`, backgroundColor: SPECIMEN_PALETTE.paper, color: SPECIMEN_PALETTE.ink }}
            />
            <span className="text-sm font-bold" style={{ color: `${SPECIMEN_PALETTE.ink}99` }}>
              {t("dashboard.daysUnit")}
            </span>
            <SpecimenButton type="submit" color="sky" className="ml-auto px-3 py-1.5 text-sm">
              {t("dashboard.save")}
            </SpecimenButton>
          </form>
        )}

        <SpecimenButton color={TYPE_BUTTON_COLOR[type.key] || "metallic"} className="mt-4 w-full" onClick={onMarkDone}>
          {t("dashboard.markDone")}
        </SpecimenButton>
      </SpecimenCard>
    );
  }

  function ReminderDashboard({ beetle, onMarkDone, onFrequencyChange }) {
    const { t } = useI18n();
    // A reminder with no frequency (currently only substrate during pupa)
    // isn't shown as a mission at all — there's nothing to be "due".
    const visibleTypes = Storage.REMINDER_TYPES.filter((type) => beetle.reminders[type.key].frequencyDays != null);
    const pausedTypes = Storage.REMINDER_TYPES.filter((type) => beetle.reminders[type.key].frequencyDays == null);

    return (
      <div>
        {pausedTypes.length > 0 && (
          <SpecimenCard className="mb-4">
            <p className="text-sm font-bold" style={{ color: SPECIMEN_PALETTE.moss }}>
              {pausedTypes.map((type) => type.emoji).join(" ")} {t("dashboard.pausedForPupa")}
            </p>
          </SpecimenCard>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleTypes.map((type) => (
            <ReminderCard
              key={type.key}
              type={type}
              reminder={beetle.reminders[type.key]}
              onMarkDone={() => onMarkDone(type.key)}
              onFrequencyChange={(days) => onFrequencyChange(type.key, days)}
            />
          ))}
        </div>
      </div>
    );
  }

  window.App.ReminderDashboard = ReminderDashboard;
})();
