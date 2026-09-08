// Photo capture/upload, with client-side resize so localStorage stays small
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { SPECIMEN_PALETTE } = window.App.SpecimenTheme;
  const { useI18n } = window.App.I18n;

  // Same rust/terracotta alert accent used elsewhere for "overdue"/"wrong" —
  // reused here for the destructive "remove photo" action and error text.
  const ALERT_COLOR = "#A6472E";

  function resizeImageFile(file, maxDim = 800, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Could not read that photo"));
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // `label`, if passed, is already-translated text from the caller.
  function PhotoPicker({ value, onChange, label }) {
    const { t } = useI18n();
    const [error, setError] = useState("");

    async function handleFile(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      try {
        setError("");
        const dataUrl = await resizeImageFile(file);
        onChange(dataUrl);
      } catch (err) {
        setError(t("photo.error"));
      }
    }

    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold" style={{ color: `${SPECIMEN_PALETTE.ink}99` }}>
          {label || t("photo.label")}
        </span>
        <div className="flex items-center gap-3">
          <div
            className="w-20 h-20 rounded-2xl overflow-hidden border flex items-center justify-center shrink-0"
            style={{ borderColor: `${SPECIMEN_PALETTE.metallic}4D`, backgroundColor: `${SPECIMEN_PALETTE.metallic}0D` }}
          >
            {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl">🪲</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label
              className="cursor-pointer inline-block text-center rounded-xl font-extrabold text-sm px-3 py-2 active:translate-y-[2px] transition-all"
              style={{ backgroundColor: SPECIMEN_PALETTE.metallic, color: SPECIMEN_PALETTE.paper, boxShadow: "0 2px 0 #2c4a3c" }}
            >
              {value ? t("photo.changePhoto") : t("photo.addPhoto")}
              <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
            </label>
            {value && (
              <button type="button" onClick={() => onChange("")} className="text-xs font-bold underline" style={{ color: ALERT_COLOR }}>
                {t("photo.removePhoto")}
              </button>
            )}
          </div>
        </div>
        {error && (
          <p className="text-xs font-bold" style={{ color: ALERT_COLOR }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  window.App.PhotoPicker = PhotoPicker;
})();
