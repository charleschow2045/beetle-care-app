// Feature 0: summary card shown for the active beetle
window.App = window.App || {};

(function () {
  const { Storage, ShareExport } = window.App;
  const { Card } = window.App.UI;
  const { useI18n } = window.App.I18n;

  function formatDate(iso, lang) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(lang === "zh" ? "zh-HK" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function BeetleProfileCard({ beetle, onEdit }) {
    const { t, lang } = useI18n();
    const stage = Storage.LIFE_STAGES.find((s) => s.key === beetle.lifeStage) || Storage.LIFE_STAGES[0];
    const gamification = beetle.gamification || { points: 0, streak: 0 };
    const badge = Storage.badgeForPoints(gamification.points);
    const adultDays = Storage.daysAsAdult(beetle);
    return (
      <Card className="mb-5">
        {beetle.photoDataUrl ? (
          <img
            src={beetle.photoDataUrl}
            alt={beetle.name}
            className="w-full h-40 object-cover rounded-2xl border-4 border-lime-100 mb-3"
          />
        ) : (
          <div className="w-full h-28 rounded-2xl border-4 border-dashed border-lime-200 bg-lime-50 flex items-center justify-center text-5xl mb-3">
            🪲
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold text-stone-800 leading-tight truncate">{beetle.name}</h2>
            <p className="text-stone-500 font-bold text-sm truncate">{beetle.species || t("profile.speciesNotSet")}</p>
          </div>
          <span className="ml-auto shrink-0 text-sm font-extrabold px-3 py-1 rounded-full bg-violet-400 text-violet-950 whitespace-nowrap">
            {stage.emoji} {t("lifeStage." + stage.key)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-orange-50 border-2 border-orange-200 py-2 text-center">
            <div className="text-lg font-extrabold text-orange-600">🔥 {gamification.streak}</div>
            <div className="text-[10px] font-bold text-orange-500">{t("stats.streak")}</div>
          </div>
          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 py-2 text-center">
            <div className="text-lg font-extrabold text-amber-600">⭐ {gamification.points}</div>
            <div className="text-[10px] font-bold text-amber-500">{t("stats.points")}</div>
          </div>
          <div className="rounded-xl bg-violet-50 border-2 border-violet-200 py-2 text-center">
            <div className="text-lg font-extrabold text-violet-600">{badge.emoji}</div>
            <div className="text-[10px] font-bold text-violet-500">{t("careBadge." + badge.key)}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="text-stone-500 font-bold">{t("profile.eclosionDate")}</div>
          <div className="text-stone-800 font-bold text-right">{formatDate(beetle.eclosionDate, lang)}</div>
          {adultDays !== null && (
            <>
              <div className="text-stone-500 font-bold">{t("profile.daysAsAdultLabel")}</div>
              <div className="text-stone-800 font-bold text-right">{t("profile.daysCount", { n: adultDays })}</div>
            </>
          )}
          <div className="text-stone-500 font-bold">{t("profile.lastJelly")}</div>
          <div className="text-stone-800 font-bold text-right">{formatDate(beetle.reminders.jelly.lastDoneAt, lang)}</div>
          <div className="text-stone-500 font-bold">{t("profile.lastSubstrate")}</div>
          <div className="text-stone-800 font-bold text-right">{formatDate(beetle.reminders.substrate.lastDoneAt, lang)}</div>
          <div className="text-stone-500 font-bold">{t("profile.lastMisting")}</div>
          <div className="text-stone-800 font-bold text-right">{formatDate(beetle.reminders.water.lastDoneAt, lang)}</div>
          <div className="text-stone-500 font-bold">{t("profile.lastWood")}</div>
          <div className="text-stone-800 font-bold text-right">{formatDate(beetle.reminders.wood.lastDoneAt, lang)}</div>
        </div>

        {beetle.supplyNotes && (
          <div className="mt-4 rounded-xl bg-stone-50 border-2 border-stone-200 p-3">
            <p className="text-xs font-extrabold text-stone-500 mb-1">{t("profile.supplyNotes")}</p>
            <p className="text-stone-700 font-bold text-sm whitespace-pre-wrap">{beetle.supplyNotes}</p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onEdit}
            className="rounded-xl border-4 border-stone-200 bg-stone-50 text-stone-600 font-extrabold py-2 text-sm active:translate-y-[2px] transition-all"
          >
            {t("profile.editProfile")}
          </button>
          <ShareExport beetle={beetle} />
        </div>
      </Card>
    );
  }

  window.App.BeetleProfileCard = BeetleProfileCard;
})();
