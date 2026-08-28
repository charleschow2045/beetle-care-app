// Lightweight bilingual (EN / HK Traditional Chinese) support.
// No i18n library — just a flat string dictionary + a React Context,
// consistent with the rest of this no-build-step app.
window.App = window.App || {};

(function () {
  const { createContext, useContext, useState, useEffect } = React;

  const LANG_KEY = "beetleCare:lang";

  const STRINGS = {
    en: {
      "nav.missions": "Missions",
      "nav.diary": "Diary",
      "nav.explore": "Explore",
      "nav.quiz": "Quiz",

      "app.title": "Beetle Care",
      "app.emptyStateSubtitle": "Let's set up your first beetle!",
      "app.missionsHeading": "{name}'s Missions",
      "app.diaryHeading": "{name}'s Diary",
      "app.quizHeading": "🧠 Beetle Knowledge Quiz",

      "photo.label": "Beetle photo",
      "photo.changePhoto": "Change Photo",
      "photo.addPhoto": "Add Photo",
      "photo.removePhoto": "Remove photo",
      "photo.error": "Couldn't load that photo — try a different one.",
      "diary.photoLabel": "Entry photo (optional)",

      "form.nickname": "Nickname",
      "form.nicknamePlaceholder": "e.g. Kabuto",
      "form.species": "Species",
      "form.speciesPlaceholder": "e.g. Rainbow Stag Beetle",
      "form.lifeStage": "Life stage",
      "form.eclosionDate": "Eclosion date (became adult) — optional",
      "form.lastCareDatesNew": "Last care dates (leave blank for today)",
      "form.lastCareDatesEdit": "Last care dates",
      "form.saveBeetle": "Save Beetle 🪲",
      "form.saveChanges": "Save Changes",
      "form.cancel": "Cancel",

      "lifeStage.larva": "Larva",
      "lifeStage.pupa": "Pupa",
      "lifeStage.adult": "Adult",

      "reminder.jelly": "Jelly Change",
      "reminder.substrate": "Substrate Change",
      "reminder.water": "Water Misting",
      "reminder.wood": "Wood Change",

      "profile.speciesNotSet": "Species not set",
      "profile.eclosionDate": "Eclosion date",
      "profile.lastJelly": "Last jelly change",
      "profile.lastSubstrate": "Last substrate change",
      "profile.lastMisting": "Last misting",
      "profile.lastWood": "Last wood change",
      "profile.editProfile": "✏️ Edit Profile",

      "switcher.add": "Add",
      "switcher.newBeetleTitle": "New Beetle 🪲",

      "dashboard.overdue": "Overdue {n}d",
      "dashboard.dueToday": "Due today",
      "dashboard.dueTomorrow": "Due tomorrow",
      "dashboard.daysLeft": "{n}d left",
      "dashboard.every": "every {n}d",
      "dashboard.daysUnit": "days",
      "dashboard.save": "Save",
      "dashboard.markDone": "✅ Mark Done",

      "diary.addEntry": "+ Add Diary Entry",
      "diary.whatHappened": "What happened today?",
      "diary.notePlaceholder": "e.g. Kabuto climbed to the top of the log!",
      "diary.date": "Date",
      "diary.saveEntry": "Save Entry 📔",
      "diary.cancel": "Cancel",
      "diary.close": "Close",
      "diary.empty": "No diary entries yet for {name}. Add a photo and note to start the timeline!",

      "explore.shopsHeading": "🏪 Beetle Shops (Hong Kong)",
      "explore.shopsDisclaimer":
        "Shop info gathered from public sources — hours/address can change, so it's worth calling ahead before visiting.",
      "explore.openInMaps": "📍 Open in Google Maps",
      "explore.communitiesHeading": "🌐 Beetle Communities & Websites",
      "explore.visit": "Visit ↗",

      "quiz.questionOf": "Question {i} of {n}",
      "quiz.next": "Next ➡️",
      "quiz.seeResults": "See Results 🏁",
      "quiz.tryAgain": "Try Again 🔁",
      "quiz.scored": "You scored {score} / {total}",
      "quiz.badgeMaster": "Beetle Master!",
      "quiz.badgeGold": "Gold Keeper",
      "quiz.badgeSilver": "Silver Keeper",
      "quiz.badgeBronze": "Bronze Keeper — keep learning!",

      "stats.streak": "Day Streak",
      "stats.points": "Points",
      "careBadge.bronze": "Bronze Keeper",
      "careBadge.silver": "Silver Keeper",
      "careBadge.gold": "Gold Keeper",
      "careBadge.diamond": "Diamond Keeper",

      "nav.growth": "Growth",
      "app.growthHeading": "{name}'s Growth Log",
      "growth.tipLabel": "Care tip",
      "growth.logEvent": "+ Log Growth Event",
      "growth.newStage": "New life stage",
      "growth.notePlaceholder": "e.g. Shed its old skin overnight!",
      "growth.noteLabel": "Notes (optional)",
      "growth.saveEvent": "Save 🎉",
      "growth.empty": "No growth events logged yet for {name}.",

      "form.supplyNotes": "Substrate/Wood Notes (optional)",
      "form.supplyNotesPlaceholder": "e.g. Brand X fermented sawdust, size L",
      "profile.supplyNotes": "Supply notes",
      "profile.daysAsAdultLabel": "Days as adult",
      "profile.daysCount": "{n} days",

      "nav.climate": "Climate",
      "app.climateHeading": "{name}'s Temp & Humidity Log",
      "climate.temperature": "Temperature (°C)",
      "climate.humidity": "Humidity (%)",
      "climate.logReading": "+ Log Reading",
      "climate.saveReading": "Save Reading 🌡️",
      "climate.empty": "No readings logged yet for {name}.",
      "climate.tempChartTitle": "🌡️ Temperature",
      "climate.humidityChartTitle": "💧 Humidity",
      "climate.latest": "Latest",
      "climate.needOneValue": "Enter a temperature or humidity value.",

      "profile.share": "📤 Share",
      "share.modalTitle": "Share {name}",
      "share.generating": "Creating...",
      "share.shareButton": "📤 Share",
      "share.downloadButton": "⬇️ Download",
      "share.errorMessage": "Couldn't create the share image — try again.",
      "share.recentMoments": "Recent moments",

      "backup.title": "Backup & Restore",
      "backup.description": "Save a backup file so you never lose your beetles' data, or restore from one.",
      "backup.exportButton": "⬇️ Export Backup",
      "backup.importButton": "⬆️ Restore from File",
      "backup.invalidFile": "That doesn't look like a valid backup file.",
      "backup.confirmTitle": "Replace current data?",
      "backup.confirmMessage": "This backup has {n} beetle(s). Restoring will replace ALL current data on this device. This can't be undone.",
      "backup.confirmRestore": "Yes, Restore",
      "backup.success": "Restored! Your beetles are back.",

      "action.delete": "🗑️ Delete",
      "diary.deleteConfirm": "Delete this diary entry? This can't be undone.",
      "growth.deleteConfirm": "Delete this growth event? This can't be undone.",
      "climate.deleteConfirm": "Delete this reading? This can't be undone.",

      "today.heading": "🔔 Today Across Your Beetles",
      "today.allGood": "Everything's on track for all your beetles! ✅",
    },
    zh: {
      "nav.missions": "任務",
      "nav.diary": "日記",
      "nav.explore": "探索",
      "nav.quiz": "小測驗",

      "app.title": "我的甲蟲",
      "app.emptyStateSubtitle": "幫你隻甲蟲開個檔案啦！",
      "app.missionsHeading": "{name}嘅任務",
      "app.diaryHeading": "{name}嘅日記",
      "app.quizHeading": "🧠 甲蟲知識小測驗",

      "photo.label": "甲蟲相片",
      "photo.changePhoto": "更換相片",
      "photo.addPhoto": "上傳相片",
      "photo.removePhoto": "移除相片",
      "photo.error": "呢張相載入唔到，試下換張啦。",
      "diary.photoLabel": "日記相片（可留空）",

      "form.nickname": "暱稱",
      "form.nicknamePlaceholder": "例如：小獨角",
      "form.species": "品種",
      "form.speciesPlaceholder": "例如：彩虹鍬形蟲",
      "form.lifeStage": "成長階段",
      "form.eclosionDate": "羽化日期（變成成蟲嗰日，可留空）",
      "form.lastCareDatesNew": "上次護理日期（留空即係今日）",
      "form.lastCareDatesEdit": "上次護理日期",
      "form.saveBeetle": "儲存甲蟲 🪲",
      "form.saveChanges": "儲存變更",
      "form.cancel": "取消",

      "lifeStage.larva": "幼蟲",
      "lifeStage.pupa": "蛹",
      "lifeStage.adult": "成蟲",

      "reminder.jelly": "換果凍",
      "reminder.substrate": "換木屑",
      "reminder.water": "噴水加濕",
      "reminder.wood": "換木頭",

      "profile.speciesNotSet": "未設定品種",
      "profile.eclosionDate": "羽化日期",
      "profile.lastJelly": "上次換果凍",
      "profile.lastSubstrate": "上次換木屑",
      "profile.lastMisting": "上次噴水",
      "profile.lastWood": "上次換木頭",
      "profile.editProfile": "✏️ 編輯檔案",

      "switcher.add": "新增",
      "switcher.newBeetleTitle": "新增甲蟲 🪲",

      "dashboard.overdue": "遲咗{n}日",
      "dashboard.dueToday": "今日到期",
      "dashboard.dueTomorrow": "聽日到期",
      "dashboard.daysLeft": "仲有{n}日",
      "dashboard.every": "每{n}日一次",
      "dashboard.daysUnit": "日",
      "dashboard.save": "儲存",
      "dashboard.markDone": "✅ 完成咗",

      "diary.addEntry": "+ 新增日記",
      "diary.whatHappened": "今日發生咩事？",
      "diary.notePlaceholder": "例如：小獨角爬咗上木頭頂喇！",
      "diary.date": "日期",
      "diary.saveEntry": "儲存日記 📔",
      "diary.cancel": "取消",
      "diary.close": "關閉",
      "diary.empty": "{name}仲未有日記記錄，影張相寫幾句，開始你嘅時間線啦！",

      "explore.shopsHeading": "🏪 甲蟲專門店（香港）",
      "explore.shopsDisclaimer": "店舖資料來自網上公開資訊，營業時間同地址可能會變，出發前建議先致電查詢。",
      "explore.openInMaps": "📍 用Google地圖開啟",
      "explore.communitiesHeading": "🌐 甲蟲社群同網站",
      "explore.visit": "前往 ↗",

      "quiz.questionOf": "第{i}題，共{n}題",
      "quiz.next": "下一題 ➡️",
      "quiz.seeResults": "睇結果 🏁",
      "quiz.tryAgain": "再嚟一次 🔁",
      "quiz.scored": "你得咗 {score} / {total} 分",
      "quiz.badgeMaster": "甲蟲大師！",
      "quiz.badgeGold": "金牌飼主",
      "quiz.badgeSilver": "銀牌飼主",
      "quiz.badgeBronze": "銅牌飼主——繼續努力！",

      "stats.streak": "連續日數",
      "stats.points": "積分",
      "careBadge.bronze": "銅牌飼主",
      "careBadge.silver": "銀牌飼主",
      "careBadge.gold": "金牌飼主",
      "careBadge.diamond": "鑽石飼主",

      "nav.growth": "成長",
      "app.growthHeading": "{name}嘅成長記錄",
      "growth.tipLabel": "護理貼士",
      "growth.logEvent": "+ 記錄成長",
      "growth.newStage": "新嘅成長階段",
      "growth.notePlaceholder": "例如：一晚之間蛻咗皮！",
      "growth.noteLabel": "備註（可留空）",
      "growth.saveEvent": "儲存 🎉",
      "growth.empty": "{name}仲未有成長記錄。",

      "form.supplyNotes": "木屑／木頭備註（可留空）",
      "form.supplyNotesPlaceholder": "例如：XX牌發酵木屑，L號",
      "profile.supplyNotes": "用品備註",
      "profile.daysAsAdultLabel": "羽化日數",
      "profile.daysCount": "{n}日",

      "nav.climate": "氣候",
      "app.climateHeading": "{name}嘅溫濕度記錄",
      "climate.temperature": "溫度（°C）",
      "climate.humidity": "濕度（%）",
      "climate.logReading": "+ 記錄讀數",
      "climate.saveReading": "儲存讀數 🌡️",
      "climate.empty": "{name}仲未有溫濕度記錄。",
      "climate.tempChartTitle": "🌡️ 溫度",
      "climate.humidityChartTitle": "💧 濕度",
      "climate.latest": "最新",
      "climate.needOneValue": "請輸入溫度或者濕度數值。",

      "profile.share": "📤 分享",
      "share.modalTitle": "分享{name}",
      "share.generating": "整緊...",
      "share.shareButton": "📤 分享",
      "share.downloadButton": "⬇️ 下載",
      "share.errorMessage": "整唔到分享圖，試多次啦。",
      "share.recentMoments": "最近時刻",

      "backup.title": "備份與還原",
      "backup.description": "備份你嘅甲蟲資料，唔驚遺失；或者從備份檔案還原返嚟。",
      "backup.exportButton": "⬇️ 匯出備份",
      "backup.importButton": "⬆️ 從檔案還原",
      "backup.invalidFile": "呢個檔案好似唔係有效嘅備份檔。",
      "backup.confirmTitle": "取代目前資料？",
      "backup.confirmMessage": "呢個備份有{n}隻甲蟲。還原會取代呢部裝置上面所有目前資料，呢個動作冇得返轉頭。",
      "backup.confirmRestore": "確定還原",
      "backup.success": "還原成功！你嘅甲蟲返嚟喇。",

      "action.delete": "🗑️ 刪除",
      "diary.deleteConfirm": "刪除呢篇日記？呢個動作冇得返轉頭。",
      "growth.deleteConfirm": "刪除呢個成長記錄？呢個動作冇得返轉頭。",
      "climate.deleteConfirm": "刪除呢個讀數？呢個動作冇得返轉頭。",

      "today.heading": "🔔 今日甲蟲總覽",
      "today.allGood": "你嘅甲蟲今日都冇問題！✅",
    },
  };

  const LanguageContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

  function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || "en");

    useEffect(() => {
      localStorage.setItem(LANG_KEY, lang);
    }, [lang]);

    function t(key, vars) {
      let str = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
      if (vars) {
        Object.keys(vars).forEach((k) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]);
        });
      }
      return str;
    }

    return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
  }

  function useI18n() {
    return useContext(LanguageContext);
  }

  window.App.I18n = { LanguageProvider, useI18n, LanguageContext, STRINGS };
})();
