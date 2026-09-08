// Data backup/restore — the app has no server, so this is the only defense
// against a reset/cleared iPad wiping a beetle's whole history.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Storage } = window.App;
  const { SPECIMEN_PALETTE, SpecimenButton, SpecimenModal } = window.App.SpecimenTheme;
  const { useI18n } = window.App.I18n;

  const ALERT_COLOR = "#A6472E";

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
          className="flex items-center justify-center w-10 h-10 rounded-xl border text-lg shrink-0"
          style={{ borderColor: `${SPECIMEN_PALETTE.ink}33`, backgroundColor: SPECIMEN_PALETTE.paper }}
        >
          ⚙️
        </button>

        <SpecimenModal open={open} onClose={() => setOpen(false)} title={t("backup.title")}>
          {pending ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-extrabold" style={{ color: ALERT_COLOR }}>
                {t("backup.confirmTitle")}
              </p>
              <p className="text-sm font-bold" style={{ color: `${SPECIMEN_PALETTE.ink}99` }}>
                {t("backup.confirmMessage", { n: pending.beetles.length })}
              </p>
              <div className="flex gap-3">
                <SpecimenButton color="ink" className="flex-1" onClick={confirmRestore}>
                  {t("backup.confirmRestore")}
                </SpecimenButton>
                <SpecimenButton color="amber" className="flex-1" onClick={() => setPending(null)}>
                  {t("form.cancel")}
                </SpecimenButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-bold" style={{ color: `${SPECIMEN_PALETTE.ink}99` }}>
                {t("backup.description")}
              </p>

              <SpecimenButton color="sky" onClick={handleExport}>
                {t("backup.exportButton")}
              </SpecimenButton>

              <label
                className="cursor-pointer text-center rounded-2xl border font-extrabold px-5 py-3 text-lg active:translate-y-[2px] transition-all"
                style={{
                  backgroundColor: SPECIMEN_PALETTE.amber,
                  borderColor: SPECIMEN_PALETTE.amber,
                  color: SPECIMEN_PALETTE.ink,
                  boxShadow: "0 2px 0 #7c561d, 0 5px 8px rgba(59,46,34,0.25), 0 10px 18px rgba(59,46,34,0.15)",
                }}
              >
                {t("backup.importButton")}
                <input type="file" accept="application/json" onChange={handleFileSelect} className="hidden" />
              </label>

              {error && (
                <p className="text-xs font-bold" style={{ color: ALERT_COLOR }}>
                  {error}
                </p>
              )}
              {success && (
                <p className="text-xs font-bold" style={{ color: SPECIMEN_PALETTE.metallic }}>
                  {t("backup.success")}
                </p>
              )}
            </div>
          )}
        </SpecimenModal>
      </>
    );
  }

  window.App.BackupSettings = BackupSettings;
})();
