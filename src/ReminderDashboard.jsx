// Feature 1: recurring care reminders dashboard
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Storage } = window.App;
  const { Button, Card } = window.App.UI;
  const { useI18n } = window.App.I18n;

  function ReminderCard({ type, reminder, onMarkDone, onFrequencyChange }) {
    const { t } = useI18n();
    const [editing, setEditing] = useState(false);
    const [draftDays, setDraftDays] = useState(reminder.frequencyDays);
    const days = Storage.daysUntilDue(reminder);
    const overdue = days < 0;
    const dueSoon = days >= 0 && days <= 1;

    function dueLabel() {
      if (overdue) return t("dashboard.overdue", { n: Math.abs(days) });
      if (days === 0) return t("dashboard.dueToday");
      if (days === 1) return t("dashboard.dueTomorrow");
      return t("dashboard.daysLeft", { n: days });
    }

    const barColor = overdue ? "bg-rose-500" : dueSoon ? "bg-amber-400" : "bg-emerald-400";
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
      <Card>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{type.emoji}</span>
            <div>
              <h3 className="text-lg font-extrabold text-stone-800 leading-tight">{t("reminder." + type.key)}</h3>
              <button
                className="text-xs text-stone-400 underline decoration-dotted"
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
            className={`text-sm font-extrabold px-3 py-1 rounded-full whitespace-nowrap ${
              overdue ? "bg-rose-500 text-white" : dueSoon ? "bg-amber-400 text-amber-950" : "bg-emerald-400 text-emerald-950"
            }`}
          >
            {dueLabel()}
          </span>
        </div>

        <div className="mt-3 h-3 w-full rounded-full bg-stone-200 overflow-hidden">
          <div className={`h-full ${barColor}`} style={{ width: `${pctElapsed}%` }} />
        </div>

        {editing && (
          <form onSubmit={saveFrequency} className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={draftDays}
              onChange={(e) => setDraftDays(e.target.value)}
              className="w-20 rounded-xl border-4 border-stone-300 bg-white text-stone-800 font-bold px-2 py-1 outline-none focus:border-amber-400"
            />
            <span className="text-stone-500 text-sm font-bold">{t("dashboard.daysUnit")}</span>
            <Button type="submit" color="blue" className="ml-auto px-3 py-1.5 text-sm">
              {t("dashboard.save")}
            </Button>
          </form>
        )}

        <Button color="gold" className="mt-4 w-full" onClick={onMarkDone}>
          {t("dashboard.markDone")}
        </Button>
      </Card>
    );
  }

  function ReminderDashboard({ beetle, onMarkDone, onFrequencyChange }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Storage.REMINDER_TYPES.map((type) => (
          <ReminderCard
            key={type.key}
            type={type}
            reminder={beetle.reminders[type.key]}
            onMarkDone={() => onMarkDone(type.key)}
            onFrequencyChange={(days) => onFrequencyChange(type.key, days)}
          />
        ))}
      </div>
    );
  }

  window.App.ReminderDashboard = ReminderDashboard;
})();
