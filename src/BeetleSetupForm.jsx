// Feature 0: Setup / Add Beetle form — also reused as the profile edit form
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Storage } = window.App;
  const { SPECIMEN_PALETTE, SpecimenButton } = window.App.SpecimenTheme;
  const { PhotoPicker } = window.App;
  const { useI18n } = window.App.I18n;

  const inputStyle = {
    borderColor: `${SPECIMEN_PALETTE.ink}33`,
    backgroundColor: SPECIMEN_PALETTE.paper,
    color: SPECIMEN_PALETTE.ink,
  };
  const labelStyle = { color: `${SPECIMEN_PALETTE.ink}99` };

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
        <span className="text-sm font-bold" style={labelStyle}>
          {label}
        </span>
        <input
          type="date"
          value={value}
          max={todayInputValue()}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl border font-bold px-3 py-2 outline-none"
          style={inputStyle}
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
          <span className="text-sm font-bold" style={labelStyle}>
            {t("form.nickname")}
          </span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("form.nicknamePlaceholder")}
            className="rounded-xl border text-lg font-bold px-4 py-3 outline-none"
            style={inputStyle}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold" style={labelStyle}>
            {t("form.species")}
          </span>
          <input
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder={t("form.speciesPlaceholder")}
            className="rounded-xl border font-bold px-4 py-3 outline-none"
            style={inputStyle}
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold" style={labelStyle}>
            {t("form.lifeStage")}
          </span>
          <div className="flex gap-2">
            {Storage.LIFE_STAGES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setLifeStage(s.key)}
                className="flex-1 rounded-xl border font-extrabold py-2 text-sm transition-all"
                style={
                  lifeStage === s.key
                    ? { backgroundColor: SPECIMEN_PALETTE.metallic, borderColor: SPECIMEN_PALETTE.metallic, color: SPECIMEN_PALETTE.paper }
                    : { backgroundColor: `${SPECIMEN_PALETTE.ink}08`, borderColor: `${SPECIMEN_PALETTE.ink}26`, color: `${SPECIMEN_PALETTE.ink}99` }
                }
              >
                {s.emoji} {t("lifeStage." + s.key)}
              </button>
            ))}
          </div>
        </div>

        <DateField label={t("form.eclosionDate")} value={eclosionDate} onChange={setEclosionDate} />

        <div className="border-t-4 border-dashed pt-3 mt-1" style={{ borderColor: `${SPECIMEN_PALETTE.ink}1F` }}>
          <p className="text-sm font-bold mb-2" style={labelStyle}>
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
          <span className="text-sm font-bold" style={labelStyle}>
            {t("form.supplyNotes")}
          </span>
          <textarea
            value={supplyNotes}
            onChange={(e) => setSupplyNotes(e.target.value)}
            placeholder={t("form.supplyNotesPlaceholder")}
            rows={2}
            className="rounded-xl border font-bold px-4 py-3 outline-none resize-none"
            style={inputStyle}
          />
        </label>

        <div className="flex gap-3 mt-2">
          <SpecimenButton type="submit" color="amber" className="flex-1">
            {submitLabel || t("form.saveBeetle")}
          </SpecimenButton>
          {showCancel && (
            <SpecimenButton type="button" color="ink" className="flex-1" onClick={onCancel}>
              {t("form.cancel")}
            </SpecimenButton>
          )}
        </div>
      </form>
    );
  }

  window.App.BeetleSetupForm = BeetleSetupForm;
})();
