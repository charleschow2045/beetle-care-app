// Data model + localStorage persistence, shared under window.App
window.App = window.App || {};

(function () {
  const STORAGE_KEY = "beetleCare:v1";
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  // Labels come from i18n (t("reminder." + key)) so they can be bilingual —
  // this data only holds language-independent facts.
  const REMINDER_TYPES = [
    { key: "jelly", emoji: "🍯", color: "gold", defaultDays: 3 },
    { key: "substrate", emoji: "🌿", color: "green", defaultDays: 30 },
    { key: "water", emoji: "💧", color: "blue", defaultDays: 2 },
    { key: "wood", emoji: "🪵", color: "orange", defaultDays: 60 },
  ];

  // Labels come from i18n (t("lifeStage." + key)).
  const LIFE_STAGES = [
    { key: "larva", emoji: "🐛" },
    { key: "pupa", emoji: "🌰" },
    { key: "adult", emoji: "🪲" },
  ];

  // Feature 6: streak & points system. Badge label comes from i18n
  // (t("careBadge." + key)) — this only holds the point thresholds.
  const BADGE_TIERS = [
    { key: "bronze", emoji: "🥉", minPoints: 0 },
    { key: "silver", emoji: "🥈", minPoints: 50 },
    { key: "gold", emoji: "🥇", minPoints: 150 },
    { key: "diamond", emoji: "💎", minPoints: 300 },
  ];

  const POINTS = { markDone: 10, diaryEntry: 5, moltEvent: 20, tempLog: 5 };

  function badgeForPoints(points) {
    let tier = BADGE_TIERS[0];
    for (const b of BADGE_TIERS) {
      if (points >= b.minPoints) tier = b;
    }
    return tier;
  }

  function defaultGamification() {
    return { points: 0, streak: 0, bestStreak: 0, lastGoodDate: null };
  }

  function dateKey(d = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function daysBetweenKeys(a, b) {
    const da = new Date(`${a}T00:00:00`);
    const db = new Date(`${b}T00:00:00`);
    return Math.round((db - da) / MS_PER_DAY);
  }

  // Recomputes a beetle's care streak from its CURRENT reminder state: any
  // reminder overdue right now breaks the streak; otherwise today counts as
  // a "good day", extending the streak only if yesterday was also good.
  // Safe to call repeatedly (e.g. on every app load) — a no-op once today
  // has already been recorded.
  function recomputeStreak(beetle) {
    const g = beetle.gamification || defaultGamification();
    const anyOverdue = REMINDER_TYPES.some((type) => daysUntilDue(beetle.reminders[type.key]) < 0);
    const today = dateKey();

    if (anyOverdue) {
      if (g.streak === 0) return beetle;
      return { ...beetle, gamification: { ...g, streak: 0 } };
    }

    if (g.lastGoodDate === today && g.streak > 0) return beetle;

    const gap = g.lastGoodDate ? daysBetweenKeys(g.lastGoodDate, today) : null;
    const streak = gap === 1 ? g.streak + 1 : 1;
    const bestStreak = Math.max(g.bestStreak || 0, streak);
    return { ...beetle, gamification: { ...g, streak, bestStreak, lastGoodDate: today } };
  }

  function addPoints(beetle, amount) {
    const g = beetle.gamification || defaultGamification();
    return { ...beetle, gamification: { ...g, points: g.points + amount } };
  }

  function reconcileStreaks(state) {
    return { ...state, beetles: state.beetles.map(recomputeStreak) };
  }

  function uid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  // Turns an <input type="date"> value ("YYYY-MM-DD") into a full ISO
  // datetime at local midnight; blank/undefined defaults to right now.
  function dateInputToISO(dateStr) {
    if (!dateStr) return new Date().toISOString();
    return new Date(`${dateStr}T00:00:00`).toISOString();
  }

  // fields: { name, species, lifeStage, eclosionDate, photoDataUrl, jellyDate, substrateDate, waterDate, woodDate }
  // all date fields are raw <input type="date"> strings (or blank/undefined)
  function createBeetle(fields) {
    return {
      id: uid(),
      name: fields.name.trim(),
      species: (fields.species || "").trim(),
      lifeStage: fields.lifeStage || "larva",
      eclosionDate: fields.eclosionDate ? dateInputToISO(fields.eclosionDate) : null,
      photoDataUrl: fields.photoDataUrl || null,
      supplyNotes: (fields.supplyNotes || "").trim(),
      createdAt: new Date().toISOString(),
      diaryEntries: [],
      moltEvents: [],
      tempLogs: [],
      gamification: defaultGamification(),
      reminders: {
        jelly: { frequencyDays: REMINDER_TYPES[0].defaultDays, lastDoneAt: dateInputToISO(fields.jellyDate) },
        substrate: { frequencyDays: REMINDER_TYPES[1].defaultDays, lastDoneAt: dateInputToISO(fields.substrateDate) },
        water: { frequencyDays: REMINDER_TYPES[2].defaultDays, lastDoneAt: dateInputToISO(fields.waterDate) },
        wood: { frequencyDays: REMINDER_TYPES[3].defaultDays, lastDoneAt: dateInputToISO(fields.woodDate) },
      },
    };
  }

  // Applies an edited BeetleSetupForm submission to an existing beetle,
  // preserving id/createdAt/frequencyDays. Used by the profile edit flow.
  function updateBeetleFields(beetle, fields) {
    return {
      ...beetle,
      name: fields.name.trim(),
      species: (fields.species || "").trim(),
      lifeStage: fields.lifeStage || "larva",
      eclosionDate: fields.eclosionDate ? dateInputToISO(fields.eclosionDate) : null,
      photoDataUrl: fields.photoDataUrl || null,
      supplyNotes: (fields.supplyNotes || "").trim(),
      reminders: {
        jelly: { ...beetle.reminders.jelly, lastDoneAt: dateInputToISO(fields.jellyDate) },
        substrate: { ...beetle.reminders.substrate, lastDoneAt: dateInputToISO(fields.substrateDate) },
        water: { ...beetle.reminders.water, lastDoneAt: dateInputToISO(fields.waterDate) },
        wood: { ...beetle.reminders.wood, lastDoneAt: dateInputToISO(fields.woodDate) },
      },
    };
  }

  // fields: { photoDataUrl, note, date } — date is a raw <input type="date"> string (blank defaults to today)
  function createDiaryEntry(fields) {
    return {
      id: uid(),
      photoDataUrl: fields.photoDataUrl || null,
      note: (fields.note || "").trim(),
      date: dateInputToISO(fields.date),
      createdAt: new Date().toISOString(),
    };
  }

  // fields: { stage, date, note } — date is a raw <input type="date"> string (blank defaults to today)
  function createMoltEvent(fields) {
    return {
      id: uid(),
      stage: fields.stage,
      note: (fields.note || "").trim(),
      date: dateInputToISO(fields.date),
      createdAt: new Date().toISOString(),
    };
  }

  // fields: { date, temperature, humidity } — date is a raw <input type="date">
  // string (blank defaults to today); temperature/humidity are raw number-input
  // strings, either may be blank (stored as null).
  function createTempLog(fields) {
    return {
      id: uid(),
      date: dateInputToISO(fields.date),
      temperature: fields.temperature === "" || fields.temperature == null ? null : Number(fields.temperature),
      humidity: fields.humidity === "" || fields.humidity == null ? null : Number(fields.humidity),
      createdAt: new Date().toISOString(),
    };
  }

  // Validates a parsed backup-file JSON before it replaces live app state —
  // guards against a corrupt/foreign file and a stale activeBeetleId.
  function sanitizeImportedState(data) {
    if (!data || !Array.isArray(data.beetles)) return null;
    let activeBeetleId = data.activeBeetleId;
    if (!data.beetles.some((b) => b.id === activeBeetleId)) {
      activeBeetleId = data.beetles.length > 0 ? data.beetles[0].id : null;
    }
    return { activeBeetleId, beetles: data.beetles };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { activeBeetleId: null, beetles: [] };
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.beetles)) return { activeBeetleId: null, beetles: [] };
      return parsed;
    } catch (e) {
      console.error("Failed to load beetle care data:", e);
      return { activeBeetleId: null, beetles: [] };
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save beetle care data:", e);
    }
  }

  // Feature 5: whole days since eclosion (null if eclosion date isn't set).
  function daysAsAdult(beetle) {
    if (!beetle.eclosionDate) return null;
    const eclosion = new Date(beetle.eclosionDate);
    const now = new Date();
    const eclosionDay = Date.UTC(eclosion.getFullYear(), eclosion.getMonth(), eclosion.getDate());
    const nowDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.round((nowDay - eclosionDay) / MS_PER_DAY));
  }

  // Whole-day difference between "now" and the due date, ignoring time-of-day.
  function daysUntilDue(reminder) {
    const last = new Date(reminder.lastDoneAt);
    const due = new Date(last.getTime() + reminder.frequencyDays * MS_PER_DAY);
    const now = new Date();
    const dueDay = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate());
    const nowDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((dueDay - nowDay) / MS_PER_DAY);
  }

  window.App.Storage = {
    STORAGE_KEY,
    REMINDER_TYPES,
    LIFE_STAGES,
    BADGE_TIERS,
    POINTS,
    uid,
    createBeetle,
    updateBeetleFields,
    createDiaryEntry,
    createMoltEvent,
    createTempLog,
    loadState,
    saveState,
    sanitizeImportedState,
    daysUntilDue,
    daysAsAdult,
    badgeForPoints,
    recomputeStreak,
    addPoints,
    reconcileStreaks,
  };
})();
