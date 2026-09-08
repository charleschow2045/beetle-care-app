// Feature: beetle knowledge / petting-skill quiz.
// A pool of 20 questions — each attempt draws a random 10 in a shuffled
// order, so it's not always the same few questions in the same sequence.
window.App = window.App || {};

(function () {
  const { useState } = React;
  const { SPECIMEN_PALETTE, SpecimenCard, SpecimenButton } = window.App.SpecimenTheme;
  const { useI18n } = window.App.I18n;

  // Not part of the given palette — same rust/terracotta alert accent used
  // for "overdue" in ReminderDashboard.jsx, reused here for a wrong answer.
  const WRONG_COLOR = "#A6472E";

  const QUIZ_LENGTH = 10;

  const QUESTIONS = [
    {
      q: { en: "What is the correct life cycle order for a beetle?", zh: "甲蟲的成長過程，正確順序為何？" },
      options: {
        en: ["Egg → Pupa → Larva → Adult", "Egg → Larva → Pupa → Adult", "Larva → Egg → Adult → Pupa", "Egg → Adult → Larva → Pupa"],
        zh: ["卵 → 蛹 → 幼蟲 → 成蟲", "卵 → 幼蟲 → 蛹 → 成蟲", "幼蟲 → 卵 → 成蟲 → 蛹", "卵 → 成蟲 → 幼蟲 → 蛹"],
      },
      correct: 1,
      explain: {
        en: "Beetles go through complete metamorphosis: egg, then larva (grub), then pupa, then adult.",
        zh: "甲蟲會經歷完全變態：先是卵，然後孵化成幼蟲，再化蛹，最後羽化為成蟲。",
      },
    },
    {
      q: { en: "What do adult stag and rhinoceros beetles mainly eat?", zh: "成蟲鍬形蟲及獨角仙主要進食什麼？" },
      options: {
        en: ["Rotting wood", "Fruit jelly or soft fruit", "Live insects", "Leaves"],
        zh: ["腐爛木頭", "果凍或軟身水果", "活昆蟲", "樹葉"],
      },
      correct: 1,
      explain: {
        en: "Adults feed on nectar/sap in the wild — as pets they're fed insect jelly or soft fruit like banana.",
        zh: "野外的成蟲主要以樹液為食，飼養時則會餵食果凍或香蕉等軟身水果。",
      },
    },
    {
      q: { en: "What do beetle larvae (grubs) mainly eat?", zh: "甲蟲幼蟲主要進食什麼？" },
      options: {
        en: ["Fruit jelly", "Fermented humus / rotting wood (the substrate itself)", "Fresh leaves", "Nothing — they don't eat"],
        zh: ["果凍", "發酵腐植土／腐木（即木屑本身）", "新鮮樹葉", "什麼都不吃"],
      },
      correct: 1,
      explain: {
        en: "Larvae live inside and eat the substrate itself — fermented sawdust or rotting wood, not jelly.",
        zh: "幼蟲長時間棲息於木屑之中，直接進食發酵木屑或腐木，而非果凍。",
      },
    },
    {
      q: { en: "How should the substrate feel for a happy beetle?", zh: "怎樣的濕度才適合甲蟲的木屑？" },
      options: {
        en: ["Bone dry", "Soaking wet, like mud", "Moist but no water squeezes out", "It doesn't matter"],
        zh: ["非常乾燥", "濕透如泥漿", "濕潤但不會擠出水分", "怎樣都可以"],
      },
      correct: 2,
      explain: {
        en: "Classic test: squeeze a handful — it should hold together and feel moist, but no water should drip out.",
        zh: "簡單測試方法：用手捏一捏木屑，應該可以捏成團、感覺濕潤，但不會有水滴出來。",
      },
    },
    {
      q: { en: "What's the best way to pick up a pet beetle?", zh: "應該怎樣拿起寵物甲蟲才正確？" },
      options: {
        en: ["By one leg", "By the horn only", "Gently by the sides of its body (thorax)", "By the mandibles"],
        zh: ["捉住一隻腳", "只捉住角", "輕輕捉住身體兩側（胸部位置）", "捉住牠的大顎"],
      },
      correct: 2,
      explain: {
        en: "Support it from underneath or hold the sides of the body gently — legs and horns can be injured if gripped.",
        zh: "應該從下方托住，或輕輕捉住身體兩側，捉腳或角容易令牠受傷。",
      },
    },
    {
      q: { en: "A comfortable temperature range for most pet beetles is roughly:", zh: "大部分寵物甲蟲舒適的溫度範圍大約是？" },
      options: {
        en: ["0–10°C", "20–28°C", "35–40°C", "It doesn't matter"],
        zh: ["0–10°C", "20–28°C", "35–40°C", "怎樣都可以"],
      },
      correct: 1,
      explain: {
        en: "Most popular pet beetle species do best around 20–28°C — avoid direct sun or extreme heat/cold.",
        zh: "大部分常見寵物甲蟲在20–28°C最為舒適，應避免陽光直曬或過熱過冷。",
      },
    },
    {
      q: {
        en: "Male stag and rhinoceros beetles are usually easy to tell apart from females because males have:",
        zh: "雄性鍬形蟲及獨角仙為何通常一眼就能與雌性分辨出來？因為牠們擁有：",
      },
      options: {
        en: ["Brighter colours", "Larger mandibles or a horn", "No wings", "Smaller bodies"],
        zh: ["更鮮艷的顏色", "更大的大顎或角", "沒有翅膀", "體型較小"],
      },
      correct: 1,
      explain: {
        en: "Males typically grow larger mandibles (stag beetles) or a horn (rhino beetles), used to compete with rivals.",
        zh: "雄性通常會長出較大的大顎（鍬形蟲）或角（獨角仙），用作與對手爭鬥。",
      },
    },
    {
      q: { en: "If you no longer want to keep a pet beetle bought from a shop, you should:", zh: "如果不想再飼養從店舖購買的甲蟲，應該怎樣做？" },
      options: {
        en: ["Release it outside", "Never release it — rehome it with another keeper or the shop instead", "Let it go in a park", "Put it in a garden"],
        zh: ["放到戶外", "切勿放生——轉送給其他飼主或交還店舖", "在公園放生", "放入花園"],
      },
      correct: 1,
      explain: {
        en: "Releasing a non-native beetle can harm local ecosystems. Rehome it with another keeper or the shop instead.",
        zh: "放生外來甲蟲可能破壞本地生態，應轉送給其他飼主或交還店舖處理。",
      },
    },
    {
      q: { en: "Roughly how often should jelly be changed for an adult beetle?", zh: "成蟲甲蟲的果凍大約多久需要更換一次？" },
      options: {
        en: ["Once a year", "Every 2–3 days", "Every few hours", "Never"],
        zh: ["一年一次", "每2至3天一次", "每數小時一次", "不需要更換"],
      },
      correct: 1,
      explain: {
        en: "Jelly dries out and can grow mould, so it's typically changed every 2–3 days — that's why it's one of this app's reminders!",
        zh: "果凍放置過久會乾涸及發霉，通常每2至3天就需要更換一次——這也是本應用程式其中一項提醒功能！",
      },
    },
    {
      q: {
        en: "What should you do if you're not sure whether your beetle is molting (changing life stage)?",
        zh: "如果不確定甲蟲是否正在蛻變（轉換成長階段），應該怎樣做？",
      },
      options: {
        en: ["Dig it up to check", "Leave it undisturbed and avoid digging into the substrate", "Move it to a new container", "Feed it extra jelly"],
        zh: ["挖出來查看", "不要打擾牠，避免挖動木屑", "搬到新容器", "餵食更多果凍"],
      },
      correct: 1,
      explain: {
        en: "Molting beetles are very fragile — disturbing them can seriously hurt them. Leave the substrate undisturbed.",
        zh: "正在蛻變的甲蟲十分脆弱，打擾牠隨時會令牠受傷，記得不要移動木屑。",
      },
    },
    {
      q: {
        en: "If a pet beetle suddenly stops moving and \"plays dead\" when you pick it up, what should you do?",
        zh: "如果寵物甲蟲被拿起時突然一動不動、裝死，應該怎樣做？",
      },
      options: {
        en: ["Shake it to wake it up", "Put it down gently and leave it alone", "Poke it with a finger", "Hold it tighter"],
        zh: ["搖晃牠令牠甦醒", "輕輕放下並讓牠自行恢復", "用手指戳牠", "捉得更緊"],
      },
      correct: 1,
      explain: {
        en: "Playing dead (thanatosis) is a natural defence — many beetles do this when startled. Leave it be and it will move again on its own.",
        zh: "裝死（假死）是一種天然防禦行為，不少甲蟲受驚時都會如此。只要放下並讓牠自行恢復即可，牠稍後會自行活動。",
      },
    },
    {
      q: {
        en: "Rhinoceros beetles (獨角仙) and stag beetles (鍬形蟲) belong to a similar group of beetles kept as pets. What do their basic care needs have in common?",
        zh: "獨角仙及鍬形蟲同屬相似的甲蟲寵物類別，牠們的基本飼養需求有什麼共通之處？",
      },
      options: {
        en: ["Both need a completely dry enclosure", "Both need damp substrate, hiding spots, and jelly for adults", "Both should be fed meat", "Neither needs any substrate"],
        zh: ["兩者都需要完全乾燥的飼養箱", "兩者都需要潮濕的木屑、藏身之處，以及成蟲期的果凍", "兩者都應餵食肉類", "兩者都不需要任何木屑"],
      },
      correct: 1,
      explain: {
        en: "Rhinoceros beetles and stag beetles have very similar care needs — damp substrate, somewhere to hide, and fruit jelly once they're adults — so many of the same principles apply to both.",
        zh: "獨角仙及鍬形蟲的飼養需求十分相似——潮濕的木屑、可供藏身的空間，以及成蟲期的果凍——因此許多飼養原則都適用於兩者。",
      },
    },
    {
      q: {
        en: "What's a gentler way to encourage a beetle to walk onto your hand, instead of grabbing it directly?",
        zh: "與其直接抓住甲蟲，有什麼較溫和的方法可以引導牠自行爬上手？",
      },
      options: {
        en: ["Place your hand in its path and let it climb on by itself", "Flip it onto its back first", "Pick it up by a leg and place it on your hand", "Chase it with your hand"],
        zh: ["把手放在牠前方，讓牠自行爬上來", "先把牠翻轉至背部朝下", "捉住一隻腳並放到手上", "用手追逐牠"],
      },
      correct: 0,
      explain: {
        en: "Letting a beetle climb onto your hand on its own is gentler and less stressful than grabbing it — most beetles will happily walk onto an open palm placed in front of them.",
        zh: "讓甲蟲自行爬上手，比直接抓住牠更溫和、更少壓力——只要把張開的手掌放在牠前方，大部分甲蟲都會自然地爬上來。",
      },
    },
    {
      q: { en: "Why should you avoid handling a pet beetle for a long time in one go?", zh: "為什麼應避免一次過長時間把玩寵物甲蟲？" },
      options: {
        en: ["It gets bored", "It can become stressed, dehydrated, or at risk of being dropped", "Beetles dislike sunlight", "There's no real reason"],
        zh: ["牠會感到悶", "牠可能會感到壓力、脫水，或有跌落的風險", "甲蟲不喜歡陽光", "沒有實際原因"],
      },
      correct: 1,
      explain: {
        en: "Extended handling can stress a beetle, dry it out, and increases the risk of an accidental fall — short, gentle handling sessions are best.",
        zh: "長時間把玩甲蟲可能令牠感到壓力、身體脫水，並增加意外跌落的風險——建議每次只作短暫、溫和的接觸。",
      },
    },
    {
      q: {
        en: "Compared to stag beetle larvae, rhinoceros beetle (獨角仙) larvae typically tolerate substrate that is:",
        zh: "相較於鍬形蟲幼蟲，獨角仙幼蟲一般能適應哪種木屑？",
      },
      options: {
        en: ["Only fresh, unfermented wood", "More compost-like, such as leaf litter or humus mixes", "Completely dry sand", "Pure water"],
        zh: ["只能適應未發酵的新鮮木頭", "較接近堆肥的木屑，例如落葉或腐植土混合物", "完全乾燥的沙", "純水"],
      },
      correct: 1,
      explain: {
        en: "Rhinoceros beetle larvae generally tolerate more compost-like substrates (like fermented leaf litter) compared to stag beetle larvae, which usually need well-fermented rotting wood or sawdust.",
        zh: "獨角仙幼蟲一般較能適應接近堆肥的木屑（例如發酵落葉），而鍬形蟲幼蟲則通常需要充分發酵的腐木或木屑。",
      },
    },
    {
      q: {
        en: "Large male stag beetles have powerful mandibles that can pinch. What's the safest way to avoid this while handling one?",
        zh: "大顎有力的雄性鍬形蟲可能會夾人，把玩時最安全的方法是什麼？",
      },
      options: {
        en: ["Hold it near the head", "Hold the sides of the thorax, away from the head and mandibles", "Poke the mandibles first to test them", "Hold it by the mandibles"],
        zh: ["捉住頭部附近", "捉住胸部兩側，遠離頭部及大顎", "先戳一戳大顎測試", "直接捉住大顎"],
      },
      correct: 1,
      explain: {
        en: "Keep your fingers away from the head and mandibles — holding the sides of the thorax keeps you clear of a pinch while still supporting the beetle securely.",
        zh: "手指應遠離頭部及大顎——捉住胸部兩側既可避免被夾，又能穩妥地支撐甲蟲。",
      },
    },
    {
      q: { en: "Which of these should you avoid when setting up an enclosure for a new pet beetle?", zh: "為新的寵物甲蟲佈置飼養箱時，應避免以下哪一項？" },
      options: {
        en: ["Providing a hiding spot", "Mixing beetles of very different sizes or species in one enclosure", "Using a hygrometer to monitor humidity", "Providing enough substrate depth"],
        zh: ["提供藏身之處", "把體型或品種相差很大的甲蟲放於同一飼養箱", "使用濕度計監察濕度", "提供足夠深度的木屑"],
      },
      correct: 1,
      explain: {
        en: "Mixing very different sizes or species together risks fighting or injury — most beetles do best housed separately or with only closely-matched companions.",
        zh: "把體型或品種相差很大的甲蟲混養，容易引致打鬥或受傷——大部分甲蟲最好個別飼養，或只與體型相近的同伴同住。",
      },
    },
    {
      q: {
        en: "Why are larvae of many beetle species (stag, rhinoceros, and similar) usually reared in separate containers rather than together?",
        zh: "為什麼許多甲蟲（鍬形蟲、獨角仙及相似品種）的幼蟲通常要個別飼養，而非放在一起？",
      },
      options: {
        en: ["They get lonely otherwise", "To prevent cannibalism among larvae", "It's cheaper to use one container per larva", "Larvae dislike company"],
        zh: ["否則牠們會感到孤單", "以防幼蟲之間互相殘食", "使用單一容器飼養每隻幼蟲成本較低", "幼蟲不喜歡有同伴"],
      },
      correct: 1,
      explain: {
        en: "Many beetle larvae, including stag and rhinoceros beetles, may cannibalise each other if reared together in the same container — separating them avoids this risk.",
        zh: "許多甲蟲幼蟲（包括鍬形蟲及獨角仙）若放在同一容器飼養，可能會出現互相殘食的情況——個別飼養可避免此風險。",
      },
    },
    {
      q: {
        en: "Adult beetles can often fly. What should you keep in mind when handling one outside its enclosure?",
        zh: "成蟲甲蟲通常能夠飛行，於飼養箱外把玩時應注意什麼？",
      },
      options: {
        en: ["It can't fly, so there's no risk", "Handle it low over a soft surface in case it takes off", "Always handle it outdoors", "Hold it above your head"],
        zh: ["牠不會飛，所以沒有風險", "應在低處、於柔軟表面上方把玩，以防牠突然飛走", "應該只在戶外把玩", "應舉高至頭頂位置"],
      },
      correct: 1,
      explain: {
        en: "Many adult beetles can fly off unexpectedly. Handling them low over a table or soft surface reduces the risk of injury or losing them if they take flight.",
        zh: "不少成蟲甲蟲會突然飛走。於桌面或柔軟表面上方、低處把玩，可減低牠飛走時受傷或走失的風險。",
      },
    },
    {
      q: { en: "What tool is commonly used to keep track of humidity levels in a beetle enclosure?", zh: "甲蟲飼養箱一般會使用什麼工具監察濕度？" },
      options: {
        en: ["A thermometer only", "A hygrometer", "A barometer", "A stopwatch"],
        zh: ["只用溫度計", "濕度計", "氣壓計", "秒錶"],
      },
      correct: 1,
      explain: {
        en: "A hygrometer measures humidity directly, making it the standard tool for monitoring an enclosure's moisture level alongside a thermometer for temperature.",
        zh: "濕度計可直接量度濕度，是監察飼養箱濕度水平的標準工具，通常會與溫度計一同使用。",
      },
    },
  ];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickQuestions() {
    return shuffle(QUESTIONS).slice(0, QUIZ_LENGTH);
  }

  function badgeForScore(score, total, t) {
    const pct = score / total;
    if (pct === 1) return { emoji: "🏆", label: t("quiz.badgeMaster") };
    if (pct >= 0.7) return { emoji: "🥇", label: t("quiz.badgeGold") };
    if (pct >= 0.4) return { emoji: "🥈", label: t("quiz.badgeSilver") };
    return { emoji: "🥉", label: t("quiz.badgeBronze") };
  }

  function BeetleQuiz() {
    const { t, lang } = useI18n();
    const [sessionQuestions, setSessionQuestions] = useState(() => pickQuestions());
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);
    const [finished, setFinished] = useState(false);

    const question = sessionQuestions[index];

    function choose(i) {
      if (selected !== null) return;
      setSelected(i);
      if (i === question.correct) setScore((s) => s + 1);
    }

    function next() {
      if (index + 1 >= sessionQuestions.length) {
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
        setSelected(null);
      }
    }

    function restart() {
      setSessionQuestions(pickQuestions());
      setIndex(0);
      setScore(0);
      setSelected(null);
      setFinished(false);
    }

    if (finished) {
      const badge = badgeForScore(score, sessionQuestions.length, t);
      return (
        <SpecimenCard className="text-center">
          <div className="text-6xl mb-2">{badge.emoji}</div>
          <h2 className="text-2xl font-extrabold" style={{ color: SPECIMEN_PALETTE.ink }}>
            {badge.label}
          </h2>
          <p className="font-bold mt-1" style={{ color: `${SPECIMEN_PALETTE.ink}99` }}>
            {t("quiz.scored", { score, total: sessionQuestions.length })}
          </p>
          <SpecimenButton color="amber" className="mt-4 w-full" onClick={restart}>
            {t("quiz.tryAgain")}
          </SpecimenButton>
        </SpecimenCard>
      );
    }

    return (
      <SpecimenCard>
        <p className="text-xs font-bold mb-1" style={{ color: `${SPECIMEN_PALETTE.ink}80` }}>
          {t("quiz.questionOf", { i: index + 1, n: sessionQuestions.length })}
        </p>
        <h2 className="text-lg font-extrabold mb-4" style={{ color: SPECIMEN_PALETTE.ink }}>
          {question.q[lang] || question.q.en}
        </h2>

        <div className="flex flex-col gap-2">
          {(question.options[lang] || question.options.en).map((opt, i) => {
            let style = {
              backgroundColor: `${SPECIMEN_PALETTE.ink}08`,
              borderColor: `${SPECIMEN_PALETTE.ink}26`,
              color: SPECIMEN_PALETTE.ink,
            };
            if (selected !== null) {
              if (i === question.correct) {
                style = { backgroundColor: `${SPECIMEN_PALETTE.moss}26`, borderColor: SPECIMEN_PALETTE.moss, color: SPECIMEN_PALETTE.moss };
              } else if (i === selected) {
                style = { backgroundColor: `${WRONG_COLOR}26`, borderColor: WRONG_COLOR, color: WRONG_COLOR };
              }
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={selected !== null}
                className="text-left rounded-xl border-4 font-bold px-4 py-3 transition-all"
                style={style}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="mt-4">
            <p className="text-sm font-bold" style={{ color: `${SPECIMEN_PALETTE.ink}CC` }}>
              {question.explain[lang] || question.explain.en}
            </p>
            <SpecimenButton color="sky" className="mt-3 w-full" onClick={next}>
              {index + 1 >= sessionQuestions.length ? t("quiz.seeResults") : t("quiz.next")}
            </SpecimenButton>
          </div>
        )}
      </SpecimenCard>
    );
  }

  window.App.BeetleQuiz = BeetleQuiz;
})();
