// Feature 0: Setup / Add Beetle form — also reused as the profile edit form
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Storage } = window.App;
  const { Button } = window.App.UI;
  const { PhotoPicker } = window.App;
  const { useI18n } = window.App.I18n;

  function todayInputValue() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function isoToDateInput(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function DateField({ label, value, onChange }) {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-sm font-bold text-stone-500">{label}</span>
        <input
          type="date"
          value={value}
          max={todayInputValue()}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl border-4 border-stone-300 bg-white text-stone-800 font-bold px-3 py-2 outline-none focus:border-amber-400"
        />
      </label>
    );
  }

  // Pass `initialBeetle` to reuse this form for editing an existing beetle's profile.
  function BeetleSetupForm({ onSave, onCancel, showCancel = true, initialBeetle = null, submitLabel }) {
    const { t } = useI18n();
    const isEditing = !!initialBeetle;
    const [name, setName] = useState(initialBeetle ? initialBeetle.name : "");
    const [species, setSpecies] = useState(initialBeetle ? initialBeetle.species : "");
    const [lifeStage, setLifeStage] = useState(initialBeetle ? initialBeetle.lifeStage : "larva");
    const [eclosionDate, setEclosionDate] = useState(isoToDateInput(initialBeetle && initialBeetle.eclosionDate));
    const [photoDataUrl, setPhotoDataUrl] = useState(initialBeetle ? initialBeetle.photoDataUrl || "" : "");
    const [jellyDate, setJellyDate] = useState(isoToDateInput(initialBeetle && initialBeetle.reminders.jelly.lastDoneAt));
    const [substrateDate, setSubstrateDate] = useState(
      isoToDateInput(initialBeetle && initialBeetle.reminders.substrate.lastDoneAt)
    );
    const [waterDate, setWaterDate] = useState(isoToDateInput(initialBeetle && initialBeetle.reminders.water.lastDoneAt));
    const [woodDate, setWoodDate] = useState(isoToDateInput(initialBeetle && initialBeetle.reminders.wood.lastDoneAt));
    const [supplyNotes, setSupplyNotes] = useState(initialBeetle ? initialBeetle.supplyNotes || "" : "");

    function handleSubmit(e) {
      e.preventDefault();
      const trimmed = name.trim();
      if (!trimmed) return;
      onSave({
        name: trimmed,
        species,
        lifeStage,
        eclosionDate,
        photoDataUrl,
        jellyDate,
        substrateDate,
        waterDate,
        woodDate,
        supplyNotes,
      });
    }

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PhotoPicker value={photoDataUrl} onChange={setPhotoDataUrl} />

        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold text-stone-500">{t("form.nickname")}</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("form.nicknamePlaceholder")}
            className="rounded-xl border-4 border-stone-300 bg-white text-stone-800 text-lg font-bold px-4 py-3 outline-none focus:border-amber-400"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold text-stone-500">{t("form.species")}</span>
          <input
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder={t("form.speciesPlaceholder")}
            className="rounded-xl border-4 border-stone-300 bg-white text-stone-800 font-bold px-4 py-3 outline-none focus:border-amber-400"
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-stone-500">{t("form.lifeStage")}</span>
          <div className="flex gap-2">
            {Storage.LIFE_STAGES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setLifeStage(s.key)}
                className={`flex-1 rounded-xl border-4 font-extrabold py-2 text-sm transition-all
                  ${lifeStage === s.key ? "bg-amber-400 border-amber-600 text-amber-950" : "bg-stone-100 border-stone-300 text-stone-500"}`}
              >
                {s.emoji} {t("lifeStage." + s.key)}
              </button>
            ))}
          </div>
        </div>

        <DateField label={t("form.eclosionDate")} value={eclosionDate} onChange={setEclosionDate} />

        <div className="border-t-4 border-dashed border-stone-200 pt-3 mt-1">
          <p className="text-sm font-bold text-stone-500 mb-2">
            {isEditing ? t("form.lastCareDatesEdit") : t("form.lastCareDatesNew")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <DateField label={`${Storage.REMINDER_TYPES[0].emoji} ${t("reminder.jelly")}`} value={jellyDate} onChange={setJellyDate} />
            <DateField
              label={`${Storage.REMINDER_TYPES[1].emoji} ${t("reminder.substrate")}`}
              value={substrateDate}
              onChange={setSubstrateDate}
            />
            <DateField label={`${Storage.REMINDER_TYPES[2].emoji} ${t("reminder.water")}`} value={waterDate} onChange={setWaterDate} />
            <DateField label={`${Storage.REMINDER_TYPES[3].emoji} ${t("reminder.wood")}`} value={woodDate} onChange={setWoodDate} />
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold text-stone-500">{t("form.supplyNotes")}</span>
          <textarea
            value={supplyNotes}
            onChange={(e) => setSupplyNotes(e.target.value)}
            placeholder={t("form.supplyNotesPlaceholder")}
            rows={2}
            className="rounded-xl border-4 border-stone-300 bg-white text-stone-800 font-bold px-4 py-3 outline-none focus:border-amber-400 resize-none"
          />
        </label>

        <div className="flex gap-3 mt-2">
          <Button type="submit" color="gold" className="flex-1">
            {submitLabel || t("form.saveBeetle")}
          </Button>
          {showCancel && (
            <Button type="button" color="red" className="flex-1" onClick={onCancel}>
              {t("form.cancel")}
            </Button>
          )}
        </div>
      </form>
    );
  }

  window.App.BeetleSetupForm = BeetleSetupForm;
})();
