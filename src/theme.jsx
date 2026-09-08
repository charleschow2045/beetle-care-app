// LEGACY theme — the original light Planta-inspired look. Superseded by the
// "Specimen Record Card" system in specimenTheme.jsx as of the 2026-09-08
// full rollout. Kept here for reference/rollback only — no screen in this
// app imports Card/Button/Modal/Avatar/COLORS from here anymore. Safe to
// delete once the new system has been stable for a while.
window.App = window.App || {};

(function () {
  const COLORS = {
    gold: { bg: "bg-amber-400", border: "border-amber-600", shadow: "shadow-[0_6px_0_#92400e]", text: "text-amber-950" },
    green: { bg: "bg-emerald-400", border: "border-emerald-600", shadow: "shadow-[0_6px_0_#065f46]", text: "text-emerald-950" },
    blue: { bg: "bg-sky-400", border: "border-sky-600", shadow: "shadow-[0_6px_0_#075985]", text: "text-sky-950" },
    orange: { bg: "bg-orange-400", border: "border-orange-600", shadow: "shadow-[0_6px_0_#7c2d12]", text: "text-orange-950" },
    purple: { bg: "bg-violet-400", border: "border-violet-600", shadow: "shadow-[0_6px_0_#4c1d95]", text: "text-violet-950" },
    red: { bg: "bg-rose-400", border: "border-rose-600", shadow: "shadow-[0_6px_0_#881337]", text: "text-rose-950" },
  };

  function Button({ children, onClick, color = "gold", className = "", disabled = false, type = "button" }) {
    const c = COLORS[color] || COLORS.gold;
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${c.bg} ${c.text} border-4 ${c.border} ${c.shadow} rounded-2xl font-extrabold px-5 py-3 text-lg
          active:translate-y-[6px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      >
        {children}
      </button>
    );
  }

  function Card({ children, className = "" }) {
    return (
      <div className={`bg-white border-4 border-lime-200 rounded-3xl shadow-[0_6px_0_rgba(101,163,13,0.15)] p-4 ${className}`}>
        {children}
      </div>
    );
  }

  function Modal({ open, onClose, children, title }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div
          className="bg-white border-4 border-lime-200 rounded-3xl shadow-[0_8px_0_rgba(101,163,13,0.2)] p-6 w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {title && <h2 className="text-2xl font-extrabold text-stone-800 mb-4">{title}</h2>}
          {children}
        </div>
      </div>
    );
  }

  function Avatar({ active, onClick, photoUrl }) {
    return (
      <button
        onClick={onClick}
        className={`shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl border-4 font-extrabold text-3xl overflow-hidden
          transition-all duration-100
          ${active ? "border-amber-500 shadow-[0_4px_0_#b45309] -translate-y-0.5 bg-amber-100" : "border-stone-300 bg-stone-100 text-stone-400"}`}
      >
        {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : "🪲"}
      </button>
    );
  }

  window.App.UI = { COLORS, Button, Card, Modal, Avatar };
})();
