// Feature 4: molting / eclosion event log — tags entries as larva/pupa/adult
// milestones and updates the beetle's life stage. Each stage carries a short
// care tip (Woofz/Dogo-style "problem solver" pairing of logging + advice).
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Storage } = window.App;
  const { SPECIMEN_PALETTE, SpecimenCard, SpecimenButton } = window.App.SpecimenTheme;
  const { useI18n } = window.App.I18n;

  const inputStyle = {
    borderColor: `${SPECIMEN_PALETTE.ink}33`,
    backgroundColor: SPECIMEN_PALETTE.paper,
    color: SPECIMEN_PALETTE.ink,
  };
  const labelStyle = { color: `${SPECIMEN_PALETTE.ink}99` };

  const STAGE_TIPS = {
    larva: {
      en: "Larvae do best left undisturbed in their substrate — avoid digging them up, and keep humidity moderate.",
      zh: "幼蟲階段應盡量避免打擾，讓牠在木屑中慢慢成長，保持濕度適中即可。",
    },
    pupa: {
      en: "Pupating beetles are extremely fragile — don't dig into or move the substrate, just wait for eclosion.",
      zh: "化蛹階段的甲蟲十分脆弱，切勿挖動或搬動木屑，靜待牠羽化即可。",
    },
    adult: {
      en: "A freshly-eclosed adult needs time for its shell to harden — hold off on jelly for now and just keep the enclosure lightly misted.",
      zh: "剛羽化的成蟲需要時間讓外殼變硬，未必需要立即餵食果凍，噴少量水保持濕度即可。",
    },
  };

  const NEXT_STAGE = { larva: "pupa", pupa: "adult", adult: "adult" };

  function todayInputValue() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function formatDate(iso, lang) {
    return new Date(iso).toLocaleDateString(lang === "zh" ? "zh-HK" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function TipCard({ stage }) {
    const { t, lang } = useI18n();
    const stageInfo = Storage.LIFE_STAGES.find((s) => s.key === stage);
    const tip = STAGE_TIPS[stage][lang] || STAGE_TIPS[stage].en;
    return (
      <SpecimenCard className="mb-4" style={{ backgroundColor: `${SPECIMEN_PALETTE.amber}14`, borderColor: `${SPECIMEN_PALETTE.amber}66` }}>
        <p className="text-xs font-extrabold mb-1" style={{ color: SPECIMEN_PALETTE.amber }}>
          {stageInfo.emoji} {t("lifeStage." + stage)} · {t("growth.tipLabel")}
        </p>
        <p className="font-bold text-sm" style={{ color: SPECIMEN_PALETTE.ink }}>
          {tip}
        </p>
      </SpecimenCard>
    );
  }

  function GrowthEventForm({ currentStage, onSave, onCancel }) {
    const { t } = useI18n();
    const [stage, setStage] = useState(NEXT_STAGE[currentStage] || "larva");
    const [date, setDate] = useState(todayInputValue());
    const [note, setNote] = useState("");

    function handleSubmit(e) {
      e.preventDefault();
      onSave({ stage, date, note });
    }

    return (
      <SpecimenCard className="mb-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold" style={labelStyle}>
              {t("growth.newStage")}
            </span>
            <div className="flex gap-2">
              {Storage.LIFE_STAGES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStage(s.key)}
                  className="flex-1 rounded-xl border font-extrabold py-2 text-sm transition-all"
                  style={
                    stage === s.key
                      ? { backgroundColor: SPECIMEN_PALETTE.amber, borderColor: SPECIMEN_PALETTE.amber, color: SPECIMEN_PALETTE.ink }
                      : { backgroundColor: `${SPECIMEN_PALETTE.ink}08`, borderColor: `${SPECIMEN_PALETTE.ink}26`, color: `${SPECIMEN_PALETTE.ink}99` }
                  }
                >
                  {s.emoji} {t("lifeStage." + s.key)}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold" style={labelStyle}>
              {t("diary.date")}
            </span>
            <input
              type="date"
              value={date}
              max={todayInputValue()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border font-bold px-3 py-2 outline-none"
              style={inputStyle}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold" style={labelStyle}>
              {t("growth.noteLabel")}
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("growth.notePlaceholder")}
              rows={2}
              className="rounded-xl border font-bold px-4 py-3 outline-none resize-none"
              style={inputStyle}
            />
          </label>

          <div className="flex gap-3 mt-1">
            <SpecimenButton type="submit" color="amber" className="flex-1">
              {t("growth.saveEvent")}
            </SpecimenButton>
            <SpecimenButton type="button" color="ink" className="flex-1" onClick={onCancel}>
              {t("form.cancel")}
            </SpecimenButton>
          </div>
        </form>
      </SpecimenCard>
    );
  }

  function GrowthEventRow({ event, onDelete }) {
    const { t, lang } = useI18n();
    const stageInfo = Storage.LIFE_STAGES.find((s) => s.key === event.stage) || Storage.LIFE_STAGES[0];

    function handleDelete() {
      if (window.confirm(t("growth.deleteConfirm"))) onDelete(event.id);
    }

    return (
      <div
        className="flex items-start gap-3 rounded-2xl p-3 border"
        style={{
          backgroundColor: SPECIMEN_PALETTE.paper,
          borderColor: `${SPECIMEN_PALETTE.metallic}33`,
          boxShadow: "0 1px 2px rgba(59,46,34,0.08), 0 3px 6px rgba(59,46,34,0.08)",
        }}
      >
        <span className="text-3xl">{stageInfo.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold" style={{ color: SPECIMEN_PALETTE.ink }}>
            {t("lifeStage." + event.stage)}
          </p>
          <p className="text-xs font-extrabold" style={{ color: SPECIMEN_PALETTE.amber }}>
            {formatDate(event.date, lang)}
          </p>
          {event.note && (
            <p className="font-bold text-sm mt-1 whitespace-pre-wrap" style={{ color: `${SPECIMEN_PALETTE.ink}CC` }}>
              {event.note}
            </p>
          )}
        </div>
        <button onClick={handleDelete} className="shrink-0 text-lg px-1" style={{ color: `${SPECIMEN_PALETTE.ink}4D` }}>
          🗑️
        </button>
      </div>
    );
  }

  function GrowthLog({ beetle, onAddEvent, onDeleteEvent }) {
    const { t } = useI18n();
    const [adding, setAdding] = useState(false);

    const events = (beetle.moltEvents || [])
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt));

    function handleSave(fields) {
      onAddEvent(fields);
      setAdding(false);
    }

    return (
      <div>
        <TipCard stage={beetle.lifeStage} />

        {adding ? (
          <GrowthEventForm currentStage={beetle.lifeStage} onSave={handleSave} onCancel={() => setAdding(false)} />
        ) : (
          <SpecimenButton color="amber" className="w-full mb-4" onClick={() => setAdding(true)}>
            {t("growth.logEvent")}
          </SpecimenButton>
        )}

        {events.length === 0 ? (
          <SpecimenCard className="text-center">
            <p className="text-4xl mb-2">🔄</p>
            <p className="font-bold" style={{ color: `${SPECIMEN_PALETTE.ink}99` }}>
              {t("growth.empty", { name: beetle.name })}
            </p>
          </SpecimenCard>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <GrowthEventRow key={event.id} event={event} onDelete={onDeleteEvent} />
            ))}
          </div>
        )}
      </div>
    );
  }

  window.App.GrowthLog = GrowthLog;
})();
