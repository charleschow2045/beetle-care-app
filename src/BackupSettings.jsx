// Data backup/restore — the app has no server, so this is the only defense
// against a reset/cleared iPad wiping a beetle's whole history.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Storage } = window.App;
  const { Button, Modal } = window.App.UI;
  const { useI18n } = window.App.I18n;

  function BackupSettings({ onRestore }) {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(null); // sanitized state waiting on confirmation
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    function handleOpen() {
      setPending(null);
      setError("");
      setSuccess(false);
      setOpen(true);
    }

    function handleExport() {
      const raw = localStorage.getItem(Storage.STORAGE_KEY) || JSON.stringify({ activeBeetleId: null, beetles: [] });
      const blob = new Blob([raw], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().slice(0, 10);
      const a = document.createElement("a");
      a.href = url;
      a.download = `beetle-care-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function handleFileSelect(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      setError("");
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          const sanitized = Storage.sanitizeImportedState(parsed);
          if (!sanitized) throw new Error("invalid");
          setPending(sanitized);
        } catch (err) {
          setError(t("backup.invalidFile"));
        }
      };
      reader.onerror = () => setError(t("backup.invalidFile"));
      reader.readAsText(file);
    }

    function confirmRestore() {
      onRestore(pending);
      setPending(null);
      setSuccess(true);
    }

    return (
      <>
        <button
          onClick={handleOpen}
          className="flex items-center justify-center w-10 h-10 rounded-xl border-4 border-stone-200 bg-white text-lg shrink-0"
        >
          ⚙️
        </button>

        <Modal open={open} onClose={() => setOpen(false)} title={t("backup.title")}>
          {pending ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-extrabold text-rose-600">{t("backup.confirmTitle")}</p>
              <p className="text-sm text-stone-600 font-bold">
                {t("backup.confirmMessage", { n: pending.beetles.length })}
              </p>
              <div className="flex gap-3">
                <Button color="red" className="flex-1" onClick={confirmRestore}>
                  {t("backup.confirmRestore")}
                </Button>
                <Button color="gold" className="flex-1" onClick={() => setPending(null)}>
                  {t("form.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-stone-600 font-bold">{t("backup.description")}</p>

              <Button color="blue" onClick={handleExport}>
                {t("backup.exportButton")}
              </Button>

              <label className="cursor-pointer text-center rounded-2xl border-4 border-amber-600 bg-amber-400 text-amber-950 font-extrabold px-5 py-3 text-lg active:translate-y-[2px] transition-all">
                {t("backup.importButton")}
                <input type="file" accept="application/json" onChange={handleFileSelect} className="hidden" />
              </label>

              {error && <p className="text-xs font-bold text-rose-500">{error}</p>}
              {success && <p className="text-xs font-bold text-emerald-600">{t("backup.success")}</p>}
            </div>
          )}
        </Modal>
      </>
    );
  }

  window.App.BackupSettings = BackupSettings;
})();
