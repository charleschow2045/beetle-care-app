// Feature 4: molting / eclosion event log — tags entries as larva/pupa/adult
// milestones and updates the beetle's life stage. Each stage carries a short
// care tip (Woofz/Dogo-style "problem solver" pairing of logging + advice).
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Storage } = window.App;
  const { Button, Card } = window.App.UI;
  const { useI18n } = window.App.I18n;

  const STAGE_TIPS = {
    larva: {
      en: "Larvae do best left undisturbed in their substrate — avoid digging them up, and keep humidity moderate.",
      zh: "幼蟲期間盡量唔好搞佢，等佢喺木屑入面慢慢長大，濕度保持適中就得。",
    },
    pupa: {
      en: "Pupating beetles are extremely fragile — don't dig into or move the substrate, just wait for eclosion.",
      zh: "化蛹階段嘅甲蟲好脆弱，唔好挖動或者搬動木屑，靜靜哋等佢羽化就得。",
    },
    adult: {
      en: "A freshly-eclosed adult needs time for its shell to harden — hold off on jelly for now and just keep the enclosure lightly misted.",
      zh: "啱啱羽化嘅成蟲需要時間畀外殼變硬，未必要即刻餵果凍，噴少少水保持濕度就得。",
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
      <Card className="mb-4 bg-amber-50 border-amber-200">
        <p className="text-xs font-extrabold text-amber-600 mb-1">
          {stageInfo.emoji} {t("lifeStage." + stage)} · {t("growth.tipLabel")}
        </p>
        <p className="text-stone-700 font-bold text-sm">{tip}</p>
      </Card>
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
      <Card className="mb-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-stone-500">{t("growth.newStage")}</span>
            <div className="flex gap-2">
              {Storage.LIFE_STAGES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStage(s.key)}
                  className={`flex-1 rounded-xl border-4 font-extrabold py-2 text-sm transition-all
                    ${stage === s.key ? "bg-amber-400 border-amber-600 text-amber-950" : "bg-stone-100 border-stone-300 text-stone-500"}`}
                >
                  {s.emoji} {t("lifeStage." + s.key)}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-stone-500">{t("diary.date")}</span>
            <input
              type="date"
              value={date}
              max={todayInputValue()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border-4 border-stone-300 bg-white text-stone-800 font-bold px-3 py-2 outline-none focus:border-amber-400"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-stone-500">{t("growth.noteLabel")}</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("growth.notePlaceholder")}
              rows={2}
              className="rounded-xl border-4 border-stone-300 bg-white text-stone-800 font-bold px-4 py-3 outline-none focus:border-amber-400 resize-none"
            />
          </label>

          <div className="flex gap-3 mt-1">
            <Button type="submit" color="gold" className="flex-1">
              {t("growth.saveEvent")}
            </Button>
            <Button type="button" color="red" className="flex-1" onClick={onCancel}>
              {t("form.cancel")}
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  function GrowthEventRow({ event, onDelete }) {
    const { t, lang } = useI18n();
    const stageInfo = Storage.LIFE_STAGES.find((s) => s.key === event.stage) || Storage.LIFE_STAGES[0];

    function handleDelete() {
      if (window.confirm(t("growth.deleteConfirm"))) onDelete(event.id);
    }

    return (
      <div className="flex items-start gap-3 bg-white border-4 border-lime-200 rounded-2xl shadow-[0_4px_0_rgba(101,163,13,0.15)] p-3">
        <span className="text-3xl">{stageInfo.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-stone-800">{t("lifeStage." + event.stage)}</p>
          <p className="text-xs font-extrabold text-violet-500">{formatDate(event.date, lang)}</p>
          {event.note && <p className="text-stone-600 font-bold text-sm mt-1 whitespace-pre-wrap">{event.note}</p>}
        </div>
        <button onClick={handleDelete} className="shrink-0 text-lg px-1 text-stone-300">
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
          <Button color="gold" className="w-full mb-4" onClick={() => setAdding(true)}>
            {t("growth.logEvent")}
          </Button>
        )}

        {events.length === 0 ? (
          <Card className="text-center">
            <p className="text-4xl mb-2">🔄</p>
            <p className="text-stone-500 font-bold">{t("growth.empty", { name: beetle.name })}</p>
          </Card>
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
