// Feature 3: temperature & humidity log — manual entry + a simple line chart.
// No charting library is loaded (no build step), so the chart is a small
// hand-rolled SVG polyline.
// Restyled as "specimen record cards" (preview — see specimenTheme.jsx).
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { SPECIMEN_PALETTE, SpecimenCard, SpecimenButton } = window.App.SpecimenTheme;
  const { useI18n } = window.App.I18n;

  // Reference range for the Rainbow Stag Beetle (Phalacrognathus muelleri)
  // specifically — not a general beetle range, since `species` is free text
  // and could be something else. Verified against species care guides
  // (invertebratesupplies.co.uk, beetlesbug.com both independently cite
  // 22-26°C, humidity above 70% with 70-85% commonly given as ideal).
  const REFERENCE_RANGE = { temperature: [22, 26], humidity: [70, 85] };

  function todayInputValue() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function formatDate(iso, lang) {
    return new Date(iso).toLocaleDateString(lang === "zh" ? "zh-HK" : "en-US", { month: "short", day: "numeric" });
  }

  function MiniLineChart({ points, color, referenceRange }) {
    const w = 300;
    const h = 100;
    const pad = 10;
    if (points.length === 0) return null;

    const values = points.map((p) => p.value);
    // Domain includes the reference band too, so it's always visible even
    // if every actual reading falls outside it.
    const lo = Math.min(...values, ...(referenceRange || []));
    const hi = Math.max(...values, ...(referenceRange || []));
    const range = hi - lo || 1;

    const yFor = (v) => h - pad - ((v - lo) / range) * (h - pad * 2);

    const coords = points.map((p, i) => {
      const x = points.length === 1 ? w / 2 : pad + (i / (points.length - 1)) * (w - pad * 2);
      return { x, y: yFor(p.value) };
    });

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24">
        {referenceRange && (
          <rect
            x={0}
            y={yFor(referenceRange[1])}
            width={w}
            height={yFor(referenceRange[0]) - yFor(referenceRange[1])}
            fill={SPECIMEN_PALETTE.metallic}
            opacity="0.16"
          />
        )}
        <polyline
          points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="3.5" fill={color} />
        ))}
      </svg>
    );
  }

  function ChartCard({ title, points, color, unit, referenceRange }) {
    const { t } = useI18n();
    if (points.length === 0) return null;
    const latest = points[points.length - 1].value;
    return (
      <SpecimenCard className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-sm font-extrabold" style={{ color: SPECIMEN_PALETTE.ink }}>
            {title}
          </h3>
          <span className="text-xs font-bold" style={{ color: `${SPECIMEN_PALETTE.ink}80` }}>
            {t("climate.latest")}:{" "}
            <span className="font-extrabold" style={{ color: SPECIMEN_PALETTE.ink }}>
              {latest}
              {unit}
            </span>
          </span>
        </div>
        <MiniLineChart points={points} color={color} referenceRange={referenceRange} />
        <p className="text-[11px] font-bold mt-1" style={{ color: SPECIMEN_PALETTE.metallic }}>
          {t("climate.idealRange", { lo: referenceRange[0], hi: referenceRange[1], unit })}
        </p>
      </SpecimenCard>
    );
  }

  function TempReadingForm({ onSave, onCancel }) {
    const { t } = useI18n();
    const [date, setDate] = useState(todayInputValue());
    const [temperature, setTemperature] = useState("");
    const [humidity, setHumidity] = useState("");
    const [error, setError] = useState("");

    function handleSubmit(e) {
      e.preventDefault();
      if (temperature === "" && humidity === "") {
        setError(t("climate.needOneValue"));
        return;
      }
      onSave({ date, temperature, humidity });
    }

    const inputStyle = { borderColor: `${SPECIMEN_PALETTE.ink}33`, backgroundColor: SPECIMEN_PALETTE.paper, color: SPECIMEN_PALETTE.ink };
    const labelStyle = { color: `${SPECIMEN_PALETTE.ink}99` };

    return (
      <SpecimenCard className="mb-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold" style={labelStyle}>
              {t("diary.date")}
            </span>
            <input
              type="date"
              value={date}
              max={todayInputValue()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border font-bold px-3 py-2 outline-none"
              style={inputStyle}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold" style={labelStyle}>
                {t("climate.temperature")}
              </span>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="25"
                className="rounded-xl border font-bold px-3 py-2 outline-none"
                style={inputStyle}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold" style={labelStyle}>
                {t("climate.humidity")}
              </span>
              <input
                type="number"
                step="1"
                inputMode="decimal"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                placeholder="70"
                className="rounded-xl border font-bold px-3 py-2 outline-none"
                style={inputStyle}
              />
            </label>
          </div>

          {error && <p className="text-xs font-bold" style={{ color: "#A6472E" }}>{error}</p>}

          <div className="flex gap-3 mt-1">
            <SpecimenButton type="submit" color="sky" className="flex-1">
              {t("climate.saveReading")}
            </SpecimenButton>
            <SpecimenButton type="button" color="ink" className="flex-1" onClick={onCancel}>
              {t("form.cancel")}
            </SpecimenButton>
          </div>
        </form>
      </SpecimenCard>
    );
  }

  function ReadingRow({ reading, lang, onDelete }) {
    const { t } = useI18n();

    function handleDelete() {
      if (window.confirm(t("climate.deleteConfirm"))) onDelete(reading.id);
    }

    return (
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-2.5 border"
        style={{
          backgroundColor: SPECIMEN_PALETTE.paper,
          borderColor: `${SPECIMEN_PALETTE.metallic}33`,
          boxShadow: "0 1px 2px rgba(59,46,34,0.08), 0 3px 6px rgba(59,46,34,0.08)",
        }}
      >
        <span className="text-xs font-extrabold w-14 shrink-0" style={{ color: SPECIMEN_PALETTE.sky }}>
          {formatDate(reading.date, lang)}
        </span>
        <div className="flex gap-4 text-sm font-bold" style={{ color: SPECIMEN_PALETTE.ink }}>
          {reading.temperature != null && <span>🌡️ {reading.temperature}°C</span>}
          {reading.humidity != null && <span>💧 {reading.humidity}%</span>}
        </div>
        <button onClick={handleDelete} className="ml-auto shrink-0 text-lg px-1" style={{ color: `${SPECIMEN_PALETTE.ink}4D` }}>
          🗑️
        </button>
      </div>
    );
  }

  function TempHumidityLog({ beetle, onAddReading, onDeleteReading }) {
    const { t, lang } = useI18n();
    const [adding, setAdding] = useState(false);

    const readings = (beetle.tempLogs || [])
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date) || new Date(a.createdAt) - new Date(b.createdAt));

    function handleSave(fields) {
      onAddReading(fields);
      setAdding(false);
    }

    const tempPoints = readings.filter((r) => r.temperature != null).map((r) => ({ value: r.temperature, date: r.date }));
    const humidityPoints = readings.filter((r) => r.humidity != null).map((r) => ({ value: r.humidity, date: r.date }));
    const recent = readings.slice().reverse();

    return (
      <div>
        <SpecimenCard className="mb-4">
          <p className="text-sm font-bold" style={{ color: SPECIMEN_PALETTE.ink }}>
            {t("climate.referenceRangeNote")}
          </p>
        </SpecimenCard>

        {adding ? (
          <TempReadingForm onSave={handleSave} onCancel={() => setAdding(false)} />
        ) : (
          <SpecimenButton color="sky" className="w-full mb-4" onClick={() => setAdding(true)}>
            {t("climate.logReading")}
          </SpecimenButton>
        )}

        <ChartCard
          title={t("climate.tempChartTitle")}
          points={tempPoints}
          color={SPECIMEN_PALETTE.amber}
          unit="°C"
          referenceRange={REFERENCE_RANGE.temperature}
        />
        <ChartCard
          title={t("climate.humidityChartTitle")}
          points={humidityPoints}
          color={SPECIMEN_PALETTE.sky}
          unit="%"
          referenceRange={REFERENCE_RANGE.humidity}
        />

        {readings.length === 0 ? (
          <SpecimenCard className="text-center">
            <p className="text-4xl mb-2">🌡️</p>
            <p className="font-bold" style={{ color: `${SPECIMEN_PALETTE.ink}99` }}>
              {t("climate.empty", { name: beetle.name })}
            </p>
          </SpecimenCard>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((reading) => (
              <ReadingRow key={reading.id} reading={reading} lang={lang} onDelete={onDeleteReading} />
            ))}
          </div>
        )}
      </div>
    );
  }

  window.App.TempHumidityLog = TempHumidityLog;
})();
