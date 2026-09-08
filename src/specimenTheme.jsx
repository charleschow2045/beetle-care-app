// "Specimen Record Card" visual theme — OFFICIAL design system as of the
// 2026-09-08 full rollout (approved after a 3-screen preview: Root.jsx's
// shell + ReminderDashboard, BeetleProfileCard, TempHumidityLog). Every
// screen in the app now uses SpecimenCard/SpecimenButton/SpecimenModal/
// SpecimenAvatar from here. Kept in its own file rather than folded into
// theme.jsx, per the rollout instructions — theme.jsx's original
// Card/Button/COLORS/Modal/Avatar are kept there for reference/rollback
// only and are no longer imported by any screen.
window.App = window.App || {};

(function () {
  // Colors chosen to echo the Rainbow Stag Beetle's own metallic
  // green-copper sheen plus a natural-history specimen label's kraft paper
  // and ink look — not arbitrary Tailwind swatches.
  const SPECIMEN_PALETTE = {
    paper: "#F2ECE0", // light bark-beige — background
    ink: "#3B2E22", // bark-brown — primary text
    metallic: "#4C7A63", // stag beetle metallic green-copper — primary accent
    moss: "#3F5C3A", // moss green — secondary accent / substrate
    amber: "#C08A2E", // jelly / feeding reminders
    sky: "#3E7CA6", // temperature & humidity
  };

  const SPECIMEN_BUTTON_COLORS = {
    metallic: { bg: SPECIMEN_PALETTE.metallic, text: SPECIMEN_PALETTE.paper, shadow: "#2c4a3c" },
    moss: { bg: SPECIMEN_PALETTE.moss, text: SPECIMEN_PALETTE.paper, shadow: "#22321f" },
    amber: { bg: SPECIMEN_PALETTE.amber, text: SPECIMEN_PALETTE.ink, shadow: "#7c561d" },
    sky: { bg: SPECIMEN_PALETTE.sky, text: SPECIMEN_PALETTE.paper, shadow: "#254a63" },
    ink: { bg: SPECIMEN_PALETTE.ink, text: SPECIMEN_PALETTE.paper, shadow: "#1c1510" },
  };

  // `corner` adds a small pin/sticker-like circle in the top-right corner —
  // meant for a flagship card (the beetle's own profile), not every small
  // repeated card, per the "not mandatory, use where it fits" brief.
  // `style` lets a caller override/extend the default look (e.g. a tinted
  // background for a callout card) without duplicating the card chrome.
  function SpecimenCard({ children, className = "", corner = false, style = {} }) {
    return (
      <div
        className={`relative rounded-[1.25rem] p-4 border ${className}`}
        style={{
          backgroundColor: SPECIMEN_PALETTE.paper,
          borderColor: `${SPECIMEN_PALETTE.metallic}4D`,
          boxShadow: "0 1px 2px rgba(59,46,34,0.10), 0 4px 8px rgba(59,46,34,0.10), 0 12px 24px rgba(59,46,34,0.08)",
          ...style,
        }}
      >
        {corner && (
          <span
            className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full border-2"
            style={{ backgroundColor: SPECIMEN_PALETTE.amber, borderColor: SPECIMEN_PALETTE.paper }}
          />
        )}
        {children}
      </div>
    );
  }

  // Keeps the existing tactile "press down" interaction (translate + shadow
  // drop on active) but the shadow itself is now a soft layered stack
  // instead of one flat cartoon offset block.
  function SpecimenButton({ children, onClick, color = "metallic", className = "", disabled = false, type = "button" }) {
    const c = SPECIMEN_BUTTON_COLORS[color] || SPECIMEN_BUTTON_COLORS.metallic;
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        style={{
          backgroundColor: c.bg,
          color: c.text,
          boxShadow: `0 2px 0 ${c.shadow}, 0 5px 8px rgba(59,46,34,0.25), 0 10px 18px rgba(59,46,34,0.15)`,
        }}
        className={`rounded-2xl font-extrabold px-5 py-3 text-lg active:translate-y-[3px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      >
        {children}
      </button>
    );
  }

  function SpecimenModal({ open, onClose, children, title }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div
          className="rounded-[1.25rem] p-6 w-full max-w-sm border"
          style={{
            backgroundColor: SPECIMEN_PALETTE.paper,
            borderColor: `${SPECIMEN_PALETTE.metallic}4D`,
            boxShadow: "0 2px 4px rgba(59,46,34,0.12), 0 8px 16px rgba(59,46,34,0.12), 0 20px 32px rgba(59,46,34,0.10)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <h2 className="text-2xl font-extrabold mb-4" style={{ color: SPECIMEN_PALETTE.ink }}>
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    );
  }

  function SpecimenAvatar({ active, onClick, photoUrl }) {
    return (
      <button
        onClick={onClick}
        className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl border font-extrabold text-3xl overflow-hidden transition-all duration-100"
        style={
          active
            ? {
                borderColor: SPECIMEN_PALETTE.metallic,
                backgroundColor: `${SPECIMEN_PALETTE.metallic}1F`,
                boxShadow: "0 3px 0 #2c4a3c",
                transform: "translateY(-2px)",
              }
            : { borderColor: `${SPECIMEN_PALETTE.ink}33`, backgroundColor: `${SPECIMEN_PALETTE.ink}0A`, color: `${SPECIMEN_PALETTE.ink}80` }
        }
      >
        {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : "🪲"}
      </button>
    );
  }

  window.App.SpecimenTheme = {
    SPECIMEN_PALETTE,
    SPECIMEN_BUTTON_COLORS,
    SpecimenCard,
    SpecimenButton,
    SpecimenModal,
    SpecimenAvatar,
  };
})();
