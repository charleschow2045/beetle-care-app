// Feature 7: multi-beetle support — switcher + add-beetle modal
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Modal, Avatar } = window.App.UI;
  const { BeetleSetupForm } = window.App;
  const { useI18n } = window.App.I18n;

  function BeetleSwitcher({ beetles, activeBeetleId, onSelect, onAdd }) {
    const { t } = useI18n();
    const [modalOpen, setModalOpen] = useState(false);

    function handleSave(fields) {
      onAdd(fields);
      setModalOpen(false);
    }

    return (
      <div className="flex items-start gap-3 overflow-x-auto pb-1 px-1">
        {beetles.map((b) => (
          <div key={b.id} className="flex flex-col items-center gap-1">
            <Avatar active={b.id === activeBeetleId} onClick={() => onSelect(b.id)} photoUrl={b.photoDataUrl} />
            <span className="text-xs font-bold text-stone-600 max-w-[4rem] truncate">{b.name}</span>
          </div>
        ))}

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setModalOpen(true)}
            className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl border-4 border-dashed border-stone-300 text-stone-400 text-3xl font-extrabold"
          >
            +
          </button>
          <span className="text-xs font-bold text-stone-400">{t("switcher.add")}</span>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t("switcher.newBeetleTitle")}>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <BeetleSetupForm onSave={handleSave} onCancel={() => setModalOpen(false)} />
          </div>
        </Modal>
      </div>
    );
  }

  window.App.BeetleSwitcher = BeetleSwitcher;
})();
