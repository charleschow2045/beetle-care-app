// Feature 8: share/export — composites a shareable "beetle card" image
// (photo, stats, badge, recent diary photos) on a canvas, then hands it to
// the native share sheet (iPad) or offers a plain download. No backend.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Storage } = window.App;
  const { SPECIMEN_PALETTE, SpecimenButton, SpecimenModal } = window.App.SpecimenTheme;
  const { useI18n } = window.App.I18n;

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCoverImage(ctx, img, x, y, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale;
    const sh = h / scale;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  // Canvas colors mirror the SpecimenCard/SPECIMEN_PALETTE look used across
  // the app, so a shared/downloaded card matches what's on screen.
  async function generateShareImage(beetle, t, lang) {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;

    const W = 900;
    const H = 1250;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const font = (size, weight) => `${weight || "bold"} ${size}px 'Baloo 2', 'Noto Sans HK', sans-serif`;

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#F7F1E5");
    grad.addColorStop(1, "#EFE7D6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    roundRect(ctx, 30, 30, W - 60, H - 60, 40);
    ctx.fillStyle = SPECIMEN_PALETTE.paper;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = `${SPECIMEN_PALETTE.metallic}4D`;
    ctx.stroke();

    ctx.fillStyle = SPECIMEN_PALETTE.metallic;
    ctx.font = font(36);
    ctx.textAlign = "center";
    ctx.fillText(`🪲 ${t("app.title")}`, W / 2, 100);

    const photoSize = 420;
    const photoX = (W - photoSize) / 2;
    const photoY = 140;
    ctx.save();
    roundRect(ctx, photoX, photoY, photoSize, photoSize, 32);
    ctx.clip();
    if (beetle.photoDataUrl) {
      try {
        const img = await loadImage(beetle.photoDataUrl);
        drawCoverImage(ctx, img, photoX, photoY, photoSize, photoSize);
      } catch (e) {
        ctx.fillStyle = `${SPECIMEN_PALETTE.metallic}1A`;
        ctx.fillRect(photoX, photoY, photoSize, photoSize);
      }
    } else {
      ctx.fillStyle = `${SPECIMEN_PALETTE.metallic}1A`;
      ctx.fillRect(photoX, photoY, photoSize, photoSize);
      ctx.font = "180px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🪲", W / 2, photoY + photoSize / 2);
      ctx.textBaseline = "alphabetic";
    }
    ctx.restore();

    ctx.fillStyle = SPECIMEN_PALETTE.ink;
    ctx.font = font(52);
    ctx.textAlign = "center";
    ctx.fillText(beetle.name, W / 2, photoY + photoSize + 70);

    const stage = Storage.LIFE_STAGES.find((s) => s.key === beetle.lifeStage) || Storage.LIFE_STAGES[0];
    ctx.fillStyle = `${SPECIMEN_PALETTE.ink}99`;
    ctx.font = font(28);
    const speciesLine = `${beetle.species || t("profile.speciesNotSet")}  ·  ${stage.emoji} ${t("lifeStage." + stage.key)}`;
    ctx.fillText(speciesLine, W / 2, photoY + photoSize + 115);

    const g = beetle.gamification || { points: 0, streak: 0 };
    const badge = Storage.badgeForPoints(g.points);
    const chips = [
      { emoji: "🔥", value: g.streak, label: t("stats.streak") },
      { emoji: "⭐", value: g.points, label: t("stats.points") },
      { emoji: badge.emoji, value: t("careBadge." + badge.key), label: "" },
    ];
    const chipY = photoY + photoSize + 150;
    const chipW = 240;
    const chipH = 90;
    const gap = 20;
    let chipX = (W - (chipW * 3 + gap * 2)) / 2;
    chips.forEach((chip) => {
      roundRect(ctx, chipX, chipY, chipW, chipH, 20);
      ctx.fillStyle = `${SPECIMEN_PALETTE.metallic}14`;
      ctx.fill();
      ctx.strokeStyle = `${SPECIMEN_PALETTE.metallic}66`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = SPECIMEN_PALETTE.ink;
      ctx.font = font(32);
      ctx.textAlign = "center";
      ctx.fillText(`${chip.emoji} ${chip.value}`, chipX + chipW / 2, chipY + 45);
      if (chip.label) {
        ctx.font = font(20, "normal");
        ctx.fillStyle = `${SPECIMEN_PALETTE.ink}80`;
        ctx.fillText(chip.label, chipX + chipW / 2, chipY + 72);
      }
      chipX += chipW + gap;
    });

    const photos = (beetle.diaryEntries || [])
      .filter((e) => e.photoDataUrl)
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);

    let stripY = chipY + chipH + 50;
    if (photos.length > 0) {
      ctx.fillStyle = `${SPECIMEN_PALETTE.ink}99`;
      ctx.font = font(24);
      ctx.textAlign = "left";
      ctx.fillText(t("share.recentMoments"), 80, stripY);
      stripY += 30;

      const thumbSize = 170;
      const thumbGap = 20;
      const stripW = thumbSize * photos.length + thumbGap * (photos.length - 1);
      let thumbX = (W - stripW) / 2;
      for (const entry of photos) {
        try {
          const img = await loadImage(entry.photoDataUrl);
          ctx.save();
          roundRect(ctx, thumbX, stripY, thumbSize, thumbSize, 20);
          ctx.clip();
          drawCoverImage(ctx, img, thumbX, stripY, thumbSize, thumbSize);
          ctx.restore();
        } catch (e) {
          // skip a broken photo rather than failing the whole export
        }
        thumbX += thumbSize + thumbGap;
      }
    }

    ctx.fillStyle = `${SPECIMEN_PALETTE.ink}80`;
    ctx.font = font(20, "normal");
    ctx.textAlign = "center";
    const dateStr = new Date().toLocaleDateString(lang === "zh" ? "zh-HK" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    ctx.fillText(`${t("app.title")} · ${dateStr}`, W / 2, H - 60);

    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  function ShareExport({ beetle }) {
    const { t, lang } = useI18n();
    const [busy, setBusy] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [blob, setBlob] = useState(null);
    const [error, setError] = useState("");

    async function handleOpen() {
      setBusy(true);
      setError("");
      try {
        const b = await generateShareImage(beetle, t, lang);
        setBlob(b);
        setPreviewUrl(URL.createObjectURL(b));
      } catch (e) {
        setError(t("share.errorMessage"));
      } finally {
        setBusy(false);
      }
    }

    function handleClose() {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setBlob(null);
      setError("");
    }

    async function handleShare() {
      if (!blob) return;
      const file = new File([blob], `${beetle.name}-beetle-card.png`, { type: "image/png" });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: beetle.name });
        }
      } catch (e) {
        // user cancelled the share sheet — not an error
      }
    }

    function handleDownload() {
      if (!previewUrl) return;
      const a = document.createElement("a");
      a.href = previewUrl;
      a.download = `${beetle.name}-beetle-card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    const canShareFiles = typeof navigator !== "undefined" && !!navigator.canShare;

    return (
      <>
        <button
          onClick={handleOpen}
          disabled={busy}
          className="rounded-xl border font-extrabold py-2 text-sm active:translate-y-[2px] transition-all disabled:opacity-50"
          style={{ borderColor: `${SPECIMEN_PALETTE.ink}33`, backgroundColor: `${SPECIMEN_PALETTE.ink}08`, color: SPECIMEN_PALETTE.ink }}
        >
          {busy ? t("share.generating") : t("profile.share")}
        </button>

        <SpecimenModal open={!!previewUrl || !!error} onClose={handleClose} title={t("share.modalTitle", { name: beetle.name })}>
          {error ? (
            <p className="font-bold text-sm" style={{ color: "#A6472E" }}>
              {error}
            </p>
          ) : (
            <>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt=""
                  className="w-full rounded-2xl mb-4"
                  style={{ border: `2px solid ${SPECIMEN_PALETTE.metallic}4D` }}
                />
              )}
              <div className="flex gap-3">
                {canShareFiles && (
                  <SpecimenButton color="sky" className="flex-1" onClick={handleShare}>
                    {t("share.shareButton")}
                  </SpecimenButton>
                )}
                <SpecimenButton color="amber" className="flex-1" onClick={handleDownload}>
                  {t("share.downloadButton")}
                </SpecimenButton>
              </div>
            </>
          )}
        </SpecimenModal>
      </>
    );
  }

  window.App.ShareExport = ShareExport;
})();
