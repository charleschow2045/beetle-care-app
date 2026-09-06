// "Specimen Record Card" visual theme — a preview alternative to theme.jsx's
// current look, scoped to exactly 3 screens for review before wider rollout:
// Root.jsx's shell + ReminderDashboard (the Dashboard), BeetleProfileCard
// (the badge/achievement display), and TempHumidityLog. Deliberately kept in
// its own file rather than editing theme.jsx directly — every other screen
// keeps using the existing Card/Button/COLORS untouched until this is
// approved, and this file can be deleted with zero effect on anything else
// if it isn't.
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
  function SpecimenCard({ children, className = "", corner = false }) {
    return (
      <div
        className={`relative rounded-[1.25rem] p-4 border ${className}`}
        style={{
          backgroundColor: SPECIMEN_PALETTE.paper,
          borderColor: `${SPECIMEN_PALETTE.metallic}4D`,
          boxShadow: "0 1px 2px rgba(59,46,34,0.10), 0 4px 8px rgba(59,46,34,0.10), 0 12px 24px rgba(59,46,34,0.08)",
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

  window.App.SpecimenTheme = { SPECIMEN_PALETTE, SPECIMEN_BUTTON_COLORS, SpecimenCard, SpecimenButton };
})();
