// Feature 3: temperature & humidity log — manual entry + a simple line chart.
// No charting library is loaded (no build step), so the chart is a small
// hand-rolled SVG polyline.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Button, Card } = window.App.UI;
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
            fill="#22c55e"
            opacity="0.12"
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
      <Card className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-sm font-extrabold text-stone-800">{title}</h3>
          <span className="text-xs font-bold text-stone-400">
            {t("climate.latest")}: <span className="font-extrabold text-stone-700">{latest}{unit}</span>
          </span>
        </div>
        <MiniLineChart points={points} color={color} referenceRange={referenceRange} />
        <p className="text-[11px] font-bold text-emerald-600 mt-1">
          {t("climate.idealRange", { lo: referenceRange[0], hi: referenceRange[1], unit })}
        </p>
      </Card>
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

    return (
      <Card className="mb-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-stone-500">{t("diary.date")}</span>
            <input
              type="date"
              value={date}
              max={todayInputValue()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border-4 border-stone-300 bg-white text-stone-800 font-bold px-3 py-2 outline-none focus:border-amber-400"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold text-stone-500">{t("climate.temperature")}</span>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="25"
                className="rounded-xl border-4 border-stone-300 bg-white text-stone-800 font-bold px-3 py-2 outline-none focus:border-amber-400"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-bold text-stone-500">{t("climate.humidity")}</span>
              <input
                type="number"
                step="1"
                inputMode="decimal"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                placeholder="70"
                className="rounded-xl border-4 border-stone-300 bg-white text-stone-800 font-bold px-3 py-2 outline-none focus:border-amber-400"
              />
            </label>
          </div>

          {error && <p className="text-xs font-bold text-rose-500">{error}</p>}

          <div className="flex gap-3 mt-1">
            <Button type="submit" color="blue" className="flex-1">
              {t("climate.saveReading")}
            </Button>
            <Button type="button" color="red" className="flex-1" onClick={onCancel}>
              {t("form.cancel")}
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  function ReadingRow({ reading, lang, onDelete }) {
    const { t } = useI18n();

    function handleDelete() {
      if (window.confirm(t("climate.deleteConfirm"))) onDelete(reading.id);
    }

    return (
      <div className="flex items-center gap-3 bg-white border-4 border-lime-200 rounded-2xl shadow-[0_4px_0_rgba(101,163,13,0.15)] px-4 py-2.5">
        <span className="text-xs font-extrabold text-violet-500 w-14 shrink-0">{formatDate(reading.date, lang)}</span>
        <div className="flex gap-4 text-sm font-bold text-stone-700">
          {reading.temperature != null && <span>🌡️ {reading.temperature}°C</span>}
          {reading.humidity != null && <span>💧 {reading.humidity}%</span>}
        </div>
        <button onClick={handleDelete} className="ml-auto shrink-0 text-lg px-1 text-stone-300">
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
        <Card className="mb-4 bg-amber-50 border-amber-200">
          <p className="text-sm font-bold text-stone-700">{t("climate.referenceRangeNote")}</p>
        </Card>

        {adding ? (
          <TempReadingForm onSave={handleSave} onCancel={() => setAdding(false)} />
        ) : (
          <Button color="blue" className="w-full mb-4" onClick={() => setAdding(true)}>
            {t("climate.logReading")}
          </Button>
        )}

        <ChartCard
          title={t("climate.tempChartTitle")}
          points={tempPoints}
          color="#f59e0b"
          unit="°C"
          referenceRange={REFERENCE_RANGE.temperature}
        />
        <ChartCard
          title={t("climate.humidityChartTitle")}
          points={humidityPoints}
          color="#0ea5e9"
          unit="%"
          referenceRange={REFERENCE_RANGE.humidity}
        />

        {readings.length === 0 ? (
          <Card className="text-center">
            <p className="text-4xl mb-2">🌡️</p>
            <p className="text-stone-500 font-bold">{t("climate.empty", { name: beetle.name })}</p>
          </Card>
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
