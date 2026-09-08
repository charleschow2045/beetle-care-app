// Feature 2: photo log / diary — entries scoped to the active beetle
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { PhotoPicker } = window.App;
  const { SPECIMEN_PALETTE, SpecimenCard, SpecimenButton, SpecimenModal } = window.App.SpecimenTheme;
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

  function formatDate(iso, lang) {
    return new Date(iso).toLocaleDateString(lang === "zh" ? "zh-HK" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function DiaryEntryForm({ onSave, onCancel }) {
    const { t } = useI18n();
    const [photoDataUrl, setPhotoDataUrl] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState(todayInputValue());

    function handleSubmit(e) {
      e.preventDefault();
      if (!note.trim()) return;
      onSave({ photoDataUrl, note, date });
    }

    return (
      <SpecimenCard className="mb-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PhotoPicker value={photoDataUrl} onChange={setPhotoDataUrl} label={t("diary.photoLabel")} />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold" style={labelStyle}>
              {t("diary.whatHappened")}
            </span>
            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("diary.notePlaceholder")}
              rows={3}
              className="rounded-xl border font-bold px-4 py-3 outline-none resize-none"
              style={inputStyle}
            />
          </label>

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

          <div className="flex gap-3 mt-1">
            <SpecimenButton type="submit" color="moss" className="flex-1">
              {t("diary.saveEntry")}
            </SpecimenButton>
            <SpecimenButton type="button" color="ink" className="flex-1" onClick={onCancel}>
              {t("diary.cancel")}
            </SpecimenButton>
          </div>
        </form>
      </SpecimenCard>
    );
  }

  function DiaryEntryRow({ entry, onOpen }) {
    const { lang } = useI18n();
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 rounded-2xl p-3 text-left border transition-all active:translate-y-[2px]"
        style={{
          backgroundColor: SPECIMEN_PALETTE.paper,
          borderColor: `${SPECIMEN_PALETTE.metallic}33`,
          boxShadow: "0 1px 2px rgba(59,46,34,0.08), 0 3px 6px rgba(59,46,34,0.08)",
        }}
      >
        <div
          className="w-16 h-16 rounded-xl overflow-hidden border flex items-center justify-center shrink-0"
          style={{ borderColor: `${SPECIMEN_PALETTE.ink}26`, backgroundColor: `${SPECIMEN_PALETTE.ink}0A` }}
        >
          {entry.photoDataUrl ? (
            <img src={entry.photoDataUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">📔</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold" style={{ color: SPECIMEN_PALETTE.moss }}>
            {formatDate(entry.date, lang)}
          </p>
          <p className="font-bold text-sm leading-snug line-clamp-2" style={{ color: SPECIMEN_PALETTE.ink }}>
            {entry.note}
          </p>
        </div>
      </button>
    );
  }

  function DiaryEntryModal({ entry, onClose, onDelete }) {
    const { t, lang } = useI18n();

    function handleDelete() {
      if (window.confirm(t("diary.deleteConfirm"))) {
        onDelete(entry.id);
        onClose();
      }
    }

    return (
      <SpecimenModal open={!!entry} onClose={onClose}>
        {entry && (
          <div className="flex flex-col gap-3">
            {entry.photoDataUrl ? (
              <img
                src={entry.photoDataUrl}
                alt=""
                className="w-full max-h-72 object-cover rounded-2xl"
                style={{ border: `2px solid ${SPECIMEN_PALETTE.metallic}4D` }}
              />
            ) : (
              <div
                className="w-full h-28 rounded-2xl border-2 border-dashed flex items-center justify-center text-5xl"
                style={{ borderColor: `${SPECIMEN_PALETTE.metallic}4D`, backgroundColor: `${SPECIMEN_PALETTE.metallic}0D` }}
              >
                📔
              </div>
            )}
            <p className="text-xs font-extrabold" style={{ color: SPECIMEN_PALETTE.moss }}>
              {formatDate(entry.date, lang)}
            </p>
            <p className="font-bold whitespace-pre-wrap" style={{ color: SPECIMEN_PALETTE.ink }}>
              {entry.note}
            </p>
            <div className="flex gap-3 mt-1">
              <SpecimenButton color="moss" className="flex-1" onClick={onClose}>
                {t("diary.close")}
              </SpecimenButton>
              <SpecimenButton color="ink" className="flex-1" onClick={handleDelete}>
                {t("action.delete")}
              </SpecimenButton>
            </div>
          </div>
        )}
      </SpecimenModal>
    );
  }

  function DiaryLog({ beetle, onAddEntry, onDeleteEntry }) {
    const { t } = useI18n();
    const [adding, setAdding] = useState(false);
    const [openEntry, setOpenEntry] = useState(null);

    const entries = (beetle.diaryEntries || [])
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt));

    function handleSave(fields) {
      onAddEntry(fields);
      setAdding(false);
    }

    return (
      <div>
        {adding ? (
          <DiaryEntryForm onSave={handleSave} onCancel={() => setAdding(false)} />
        ) : (
          <SpecimenButton color="moss" className="w-full mb-4" onClick={() => setAdding(true)}>
            {t("diary.addEntry")}
          </SpecimenButton>
        )}

        {entries.length === 0 ? (
          <SpecimenCard className="text-center">
            <p className="text-4xl mb-2">📔</p>
            <p className="font-bold" style={{ color: `${SPECIMEN_PALETTE.ink}99` }}>
              {t("diary.empty", { name: beetle.name })}
            </p>
          </SpecimenCard>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <DiaryEntryRow key={entry.id} entry={entry} onOpen={() => setOpenEntry(entry)} />
            ))}
          </div>
        )}

        <DiaryEntryModal entry={openEntry} onClose={() => setOpenEntry(null)} onDelete={onDeleteEntry} />
      </div>
    );
  }

  window.App.DiaryLog = DiaryLog;
})();
