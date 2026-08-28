// Feature: beetle knowledge / petting-skill quiz
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { Button, Card } = window.App.UI;
  const { useI18n } = window.App.I18n;

  const QUESTIONS = [
    {
      q: { en: "What is the correct life cycle order for a beetle?", zh: "甲蟲嘅成長過程，正確順序係邊個？" },
      options: {
        en: ["Egg → Pupa → Larva → Adult", "Egg → Larva → Pupa → Adult", "Larva → Egg → Adult → Pupa", "Egg → Adult → Larva → Pupa"],
        zh: ["蛋 → 蛹 → 幼蟲 → 成蟲", "蛋 → 幼蟲 → 蛹 → 成蟲", "幼蟲 → 蛋 → 成蟲 → 蛹", "蛋 → 成蟲 → 幼蟲 → 蛹"],
      },
      correct: 1,
      explain: {
        en: "Beetles go through complete metamorphosis: egg, then larva (grub), then pupa, then adult.",
        zh: "甲蟲會經歷完全變態：先係蛋，跟住變幼蟲，再化蛹，最後先羽化做成蟲。",
      },
    },
    {
      q: { en: "What do adult stag and rhinoceros beetles mainly eat?", zh: "成蟲鍬形蟲同獨角仙主要食咩？" },
      options: {
        en: ["Rotting wood", "Fruit jelly or soft fruit", "Live insects", "Leaves"],
        zh: ["腐爛木頭", "果凍或者軟身生果", "活昆蟲", "葉"],
      },
      correct: 1,
      explain: {
        en: "Adults feed on nectar/sap in the wild — as pets they're fed insect jelly or soft fruit like banana.",
        zh: "野外嘅成蟲主要食樹液，養喺屋企就會餵果凍或者香蕉呢啲軟身生果。",
      },
    },
    {
      q: { en: "What do beetle larvae (grubs) mainly eat?", zh: "甲蟲幼蟲主要食咩？" },
      options: {
        en: ["Fruit jelly", "Fermented humus / rotting wood (the substrate itself)", "Fresh leaves", "Nothing — they don't eat"],
        zh: ["果凍", "發酵腐植土／腐木（即係木屑本身）", "新鮮葉", "乜都唔食"],
      },
      correct: 1,
      explain: {
        en: "Larvae live inside and eat the substrate itself — fermented sawdust or rotting wood, not jelly.",
        zh: "幼蟲成日匿喺木屑入面，直接食嗰啲發酵木屑或者腐木，唔係食果凍。",
      },
    },
    {
      q: { en: "How should the substrate feel for a happy beetle?", zh: "點樣先算適合甲蟲嘅木屑濕度？" },
      options: {
        en: ["Bone dry", "Soaking wet, like mud", "Moist but no water squeezes out", "It doesn't matter"],
        zh: ["乾到爆", "濕到好似泥漿咁", "濕潤但係唔會擠出水", "點都得"],
      },
      correct: 2,
      explain: {
        en: "Classic test: squeeze a handful — it should hold together and feel moist, but no water should drip out.",
        zh: "簡單測試：用手擰一擰木屑，應該可以捏成團、感覺濕潤，但係唔會有水滴出嚟。",
      },
    },
    {
      q: { en: "What's the best way to pick up a pet beetle?", zh: "點樣拎起隻寵物甲蟲先啱？" },
      options: {
        en: ["By one leg", "By the horn only", "Gently by the sides of its body (thorax)", "By the mandibles"],
        zh: ["拎住一隻腳", "淨係拎住角", "輕輕拎住身體兩側（胸部位置）", "拎住牠嘅大顎"],
      },
      correct: 2,
      explain: {
        en: "Support it from underneath or hold the sides of the body gently — legs and horns can be injured if gripped.",
        zh: "應該由下面托住，或者輕輕拎住身體兩側，拎腳或者角好容易整傷牠。",
      },
    },
    {
      q: { en: "A comfortable temperature range for most pet beetles is roughly:", zh: "大部分寵物甲蟲舒適嘅溫度範圍大概係？" },
      options: {
        en: ["0–10°C", "20–28°C", "35–40°C", "It doesn't matter"],
        zh: ["0–10°C", "20–28°C", "35–40°C", "點都得"],
      },
      correct: 1,
      explain: {
        en: "Most popular pet beetle species do best around 20–28°C — avoid direct sun or extreme heat/cold.",
        zh: "大部分常見寵物甲蟲喺20–28°C最舒服，要避免直曬陽光或者太熱太凍。",
      },
    },
    {
      q: {
        en: "Male stag and rhinoceros beetles are usually easy to tell apart from females because males have:",
        zh: "雄性鍬形蟲同獨角仙點解通常一眼睇得出同雌性唔同？因為佢哋有：",
      },
      options: {
        en: ["Brighter colours", "Larger mandibles or a horn", "No wings", "Smaller bodies"],
        zh: ["更鮮艷嘅顏色", "更大嘅大顎或者角", "冇翼", "身型較細"],
      },
      correct: 1,
      explain: {
        en: "Males typically grow larger mandibles (stag beetles) or a horn (rhino beetles), used to compete with rivals.",
        zh: "雄性通常會長出較大嘅大顎（鍬形蟲）或者角（獨角仙），用嚟同對手打鬥。",
      },
    },
    {
      q: { en: "If you no longer want to keep a pet beetle bought from a shop, you should:", zh: "如果唔想再養喺舖頭買返嚟嘅甲蟲，應該點做？" },
      options: {
        en: ["Release it outside", "Never release it — rehome it with another keeper or the shop instead", "Let it go in a park", "Put it in a garden"],
        zh: ["放去戶外", "千祈唔好放生——轉送畀其他飼主或者交返舖頭", "喺公園放生", "放入花園"],
      },
      correct: 1,
      explain: {
        en: "Releasing a non-native beetle can harm local ecosystems. Rehome it with another keeper or the shop instead.",
        zh: "放生外來甲蟲可能會破壞本地生態，應該轉送畀其他飼主或者交返舖頭處理。",
      },
    },
    {
      q: { en: "Roughly how often should jelly be changed for an adult beetle?", zh: "成蟲甲蟲嘅果凍大概幾耐要換一次？" },
      options: {
        en: ["Once a year", "Every 2–3 days", "Every few hours", "Never"],
        zh: ["一年一次", "每2至3日一次", "每幾個鐘一次", "唔使換"],
      },
      correct: 1,
      explain: {
        en: "Jelly dries out and can grow mould, so it's typically changed every 2–3 days — that's why it's one of this app's reminders!",
        zh: "果凍放耐咗會乾同發霉，通常每2至3日就要換一次——所以呢個都係App入面其中一個提醒！",
      },
    },
    {
      q: {
        en: "What should you do if you're not sure whether your beetle is molting (changing life stage)?",
        zh: "如果唔肯定隻甲蟲係咪蛻變緊（轉緊成長階段），應該點做？",
      },
      options: {
        en: ["Dig it up to check", "Leave it undisturbed and avoid digging into the substrate", "Move it to a new container", "Feed it extra jelly"],
        zh: ["挖出嚟睇下", "唔好搞佢，避免挖動木屑", "搬去新容器", "餵多啲果凍"],
      },
      correct: 1,
      explain: {
        en: "Molting beetles are very fragile — disturbing them can seriously hurt them. Leave the substrate undisturbed.",
        zh: "蛻變緊嘅甲蟲好脆弱，搞亂佢隨時會整傷佢，記得唔好郁動木屑。",
      },
    },
  ];

  function badgeForScore(score, total, t) {
    const pct = score / total;
    if (pct === 1) return { emoji: "🏆", label: t("quiz.badgeMaster") };
    if (pct >= 0.7) return { emoji: "🥇", label: t("quiz.badgeGold") };
    if (pct >= 0.4) return { emoji: "🥈", label: t("quiz.badgeSilver") };
    return { emoji: "🥉", label: t("quiz.badgeBronze") };
  }

  function BeetleQuiz() {
    const { t, lang } = useI18n();
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);
    const [finished, setFinished] = useState(false);

    const question = QUESTIONS[index];

    function choose(i) {
      if (selected !== null) return;
      setSelected(i);
      if (i === question.correct) setScore((s) => s + 1);
    }

    function next() {
      if (index + 1 >= QUESTIONS.length) {
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
        setSelected(null);
      }
    }

    function restart() {
      setIndex(0);
      setScore(0);
      setSelected(null);
      setFinished(false);
    }

    if (finished) {
      const badge = badgeForScore(score, QUESTIONS.length, t);
      return (
        <Card className="text-center">
          <div className="text-6xl mb-2">{badge.emoji}</div>
          <h2 className="text-2xl font-extrabold text-stone-800">{badge.label}</h2>
          <p className="text-stone-500 font-bold mt-1">{t("quiz.scored", { score, total: QUESTIONS.length })}</p>
          <Button color="gold" className="mt-4 w-full" onClick={restart}>
            {t("quiz.tryAgain")}
          </Button>
        </Card>
      );
    }

    return (
      <Card>
        <p className="text-xs font-bold text-stone-400 mb-1">{t("quiz.questionOf", { i: index + 1, n: QUESTIONS.length })}</p>
        <h2 className="text-lg font-extrabold text-stone-800 mb-4">{question.q[lang] || question.q.en}</h2>

        <div className="flex flex-col gap-2">
          {(question.options[lang] || question.options.en).map((opt, i) => {
            let style = "bg-stone-50 border-stone-200 text-stone-700";
            if (selected !== null) {
              if (i === question.correct) style = "bg-emerald-400 border-emerald-600 text-emerald-950";
              else if (i === selected) style = "bg-rose-400 border-rose-600 text-rose-950";
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={selected !== null}
                className={`text-left rounded-xl border-4 font-bold px-4 py-3 transition-all ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="mt-4">
            <p className="text-sm text-stone-600 font-bold">{question.explain[lang] || question.explain.en}</p>
            <Button color="blue" className="mt-3 w-full" onClick={next}>
              {index + 1 >= QUESTIONS.length ? t("quiz.seeResults") : t("quiz.next")}
            </Button>
          </div>
        )}
      </Card>
    );
  }

  window.App.BeetleQuiz = BeetleQuiz;
})();
