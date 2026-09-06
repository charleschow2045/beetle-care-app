// Feature 0: summary card shown for the active beetle.
// Restyled as a "specimen record card" (preview — see specimenTheme.jsx);
// this is the badge/achievement display, so it also carries the corner pin.
window.App = window.App || {};

(function () {
  const { Storage, ShareExport } = window.App;
  const { SPECIMEN_PALETTE, SpecimenCard } = window.App.SpecimenTheme;
  const { useI18n } = window.App.I18n;

  function formatDate(iso, lang) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(lang === "zh" ? "zh-HK" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function StatChip({ emoji, value, label, color }) {
    return (
      <div className="rounded-xl py-2 text-center border" style={{ backgroundColor: `${color}14`, borderColor: `${color}40` }}>
        <div className="text-lg font-extrabold" style={{ color }}>
          {emoji} {value}
        </div>
        <div className="text-[10px] font-bold" style={{ color: `${color}CC` }}>
          {label}
        </div>
      </div>
    );
  }

  function BeetleProfileCard({ beetle, onEdit }) {
    const { t, lang } = useI18n();
    const stage = Storage.LIFE_STAGES.find((s) => s.key === beetle.lifeStage) || Storage.LIFE_STAGES[0];
    const gamification = beetle.gamification || { points: 0, streak: 0 };
    const badge = Storage.badgeForPoints(gamification.points);
    const adultDays = Storage.daysAsAdult(beetle);
    const inkFaint = `${SPECIMEN_PALETTE.ink}99`;

    return (
      <SpecimenCard className="mb-5" corner>
        {beetle.photoDataUrl ? (
          <img
            src={beetle.photoDataUrl}
            alt={beetle.name}
            className="w-full h-40 object-cover rounded-2xl mb-3"
            style={{ border: `2px solid ${SPECIMEN_PALETTE.metallic}4D` }}
          />
        ) : (
          <div
            className="w-full h-28 rounded-2xl border-2 border-dashed flex items-center justify-center text-5xl mb-3"
            style={{ borderColor: `${SPECIMEN_PALETTE.metallic}4D`, backgroundColor: `${SPECIMEN_PALETTE.metallic}0D` }}
          >
            🪲
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold leading-tight truncate" style={{ color: SPECIMEN_PALETTE.ink }}>
              {beetle.name}
            </h2>
            <p className="font-bold text-sm truncate" style={{ color: inkFaint }}>
              {beetle.species || t("profile.speciesNotSet")}
            </p>
          </div>
          <span
            className="ml-auto shrink-0 text-sm font-extrabold px-3 py-1 rounded-full whitespace-nowrap"
            style={{ backgroundColor: SPECIMEN_PALETTE.metallic, color: SPECIMEN_PALETTE.paper }}
          >
            {stage.emoji} {t("lifeStage." + stage.key)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatChip emoji="🔥" value={gamification.streak} label={t("stats.streak")} color={SPECIMEN_PALETTE.amber} />
          <StatChip emoji="⭐" value={gamification.points} label={t("stats.points")} color={SPECIMEN_PALETTE.metallic} />
          <StatChip emoji={badge.emoji} value={t("careBadge." + badge.key)} label="" color={SPECIMEN_PALETTE.moss} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="font-bold" style={{ color: inkFaint }}>
            {t("profile.eclosionDate")}
          </div>
          <div className="font-bold text-right" style={{ color: SPECIMEN_PALETTE.ink }}>
            {formatDate(beetle.eclosionDate, lang)}
          </div>
          {adultDays !== null && (
            <>
              <div className="font-bold" style={{ color: inkFaint }}>
                {t("profile.daysAsAdultLabel")}
              </div>
              <div className="font-bold text-right" style={{ color: SPECIMEN_PALETTE.ink }}>
                {t("profile.daysCount", { n: adultDays })}
              </div>
            </>
          )}
          <div className="font-bold" style={{ color: inkFaint }}>
            {t("profile.lastJelly")}
          </div>
          <div className="font-bold text-right" style={{ color: SPECIMEN_PALETTE.ink }}>
            {formatDate(beetle.reminders.jelly.lastDoneAt, lang)}
          </div>
          <div className="font-bold" style={{ color: inkFaint }}>
            {t("profile.lastSubstrate")}
          </div>
          <div className="font-bold text-right" style={{ color: SPECIMEN_PALETTE.ink }}>
            {formatDate(beetle.reminders.substrate.lastDoneAt, lang)}
          </div>
          <div className="font-bold" style={{ color: inkFaint }}>
            {t("profile.lastMisting")}
          </div>
          <div className="font-bold text-right" style={{ color: SPECIMEN_PALETTE.ink }}>
            {formatDate(beetle.reminders.water.lastDoneAt, lang)}
          </div>
          <div className="font-bold" style={{ color: inkFaint }}>
            {t("profile.lastWood")}
          </div>
          <div className="font-bold text-right" style={{ color: SPECIMEN_PALETTE.ink }}>
            {formatDate(beetle.reminders.wood.lastDoneAt, lang)}
          </div>
        </div>

        {beetle.supplyNotes && (
          <div
            className="mt-4 rounded-xl p-3 border"
            style={{ backgroundColor: `${SPECIMEN_PALETTE.ink}08`, borderColor: `${SPECIMEN_PALETTE.ink}1F` }}
          >
            <p className="text-xs font-extrabold mb-1" style={{ color: inkFaint }}>
              {t("profile.supplyNotes")}
            </p>
            <p className="font-bold text-sm whitespace-pre-wrap" style={{ color: SPECIMEN_PALETTE.ink }}>
              {beetle.supplyNotes}
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onEdit}
            className="rounded-xl border font-extrabold py-2 text-sm active:translate-y-[2px] transition-all"
            style={{ borderColor: `${SPECIMEN_PALETTE.ink}33`, backgroundColor: `${SPECIMEN_PALETTE.ink}08`, color: SPECIMEN_PALETTE.ink }}
          >
            {t("profile.editProfile")}
          </button>
          <ShareExport beetle={beetle} />
        </div>
      </SpecimenCard>
    );
  }

  window.App.BeetleProfileCard = BeetleProfileCard;
})();
