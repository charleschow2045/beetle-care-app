// Feature 2: photo log / diary — entries scoped to the active beetle
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { PhotoPicker } = window.App;
  const { Button, Card, Modal } = window.App.UI;
  const { useI18n } = window.App.I18n;

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
      <Card className="mb-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PhotoPicker value={photoDataUrl} onChange={setPhotoDataUrl} label={t("diary.photoLabel")} />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-stone-500">{t("diary.whatHappened")}</span>
            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("diary.notePlaceholder")}
              rows={3}
              className="rounded-xl border-4 border-stone-300 bg-white text-stone-800 font-bold px-4 py-3 outline-none focus:border-violet-400 resize-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-stone-500">{t("diary.date")}</span>
            <input
              type="date"
              value={date}
              max={todayInputValue()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border-4 border-stone-300 bg-white text-stone-800 font-bold px-3 py-2 outline-none focus:border-violet-400"
            />
          </label>

          <div className="flex gap-3 mt-1">
            <Button type="submit" color="purple" className="flex-1">
              {t("diary.saveEntry")}
            </Button>
            <Button type="button" color="red" className="flex-1" onClick={onCancel}>
              {t("diary.cancel")}
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  function DiaryEntryRow({ entry, onOpen }) {
    const { lang } = useI18n();
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 bg-white border-4 border-lime-200 rounded-2xl shadow-[0_4px_0_rgba(101,163,13,0.15)] p-3 text-left active:translate-y-[2px] active:shadow-none transition-all"
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden border-4 border-stone-200 bg-stone-100 flex items-center justify-center shrink-0">
          {entry.photoDataUrl ? (
            <img src={entry.photoDataUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">📔</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold text-violet-500">{formatDate(entry.date, lang)}</p>
          <p className="text-stone-800 font-bold text-sm leading-snug line-clamp-2">{entry.note}</p>
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
      <Modal open={!!entry} onClose={onClose}>
        {entry && (
          <div className="flex flex-col gap-3">
            {entry.photoDataUrl ? (
              <img
                src={entry.photoDataUrl}
                alt=""
                className="w-full max-h-72 object-cover rounded-2xl border-4 border-lime-100"
              />
            ) : (
              <div className="w-full h-28 rounded-2xl border-4 border-dashed border-lime-200 bg-lime-50 flex items-center justify-center text-5xl">
                📔
              </div>
            )}
            <p className="text-xs font-extrabold text-violet-500">{formatDate(entry.date, lang)}</p>
            <p className="text-stone-800 font-bold whitespace-pre-wrap">{entry.note}</p>
            <div className="flex gap-3 mt-1">
              <Button color="purple" className="flex-1" onClick={onClose}>
                {t("diary.close")}
              </Button>
              <Button color="red" className="flex-1" onClick={handleDelete}>
                {t("action.delete")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
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
          <Button color="purple" className="w-full mb-4" onClick={() => setAdding(true)}>
            {t("diary.addEntry")}
          </Button>
        )}

        {entries.length === 0 ? (
          <Card className="text-center">
            <p className="text-4xl mb-2">📔</p>
            <p className="text-stone-500 font-bold">{t("diary.empty", { name: beetle.name })}</p>
          </Card>
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
