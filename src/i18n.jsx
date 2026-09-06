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
      "dashboard.pausedForPupa": "Substrate reminder is paused during the pupa stage — don't disturb it!",

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
      "climate.referenceRangeNote": "🌡️💧 Reference for the Rainbow Stag Beetle: 22–26°C and 70–85% humidity. (Different species may need different ranges — this app doesn't have a species database, so treat this as a Rainbow Stag Beetle-specific guide.)",
      "climate.idealRange": "Ideal range: {lo}–{hi}{unit}",

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
      "app.emptyStateSubtitle": "為你的甲蟲建立檔案吧！",
      "app.missionsHeading": "{name}的任務",
      "app.diaryHeading": "{name}的日記",
      "app.quizHeading": "🧠 甲蟲知識小測驗",

      "photo.label": "甲蟲相片",
      "photo.changePhoto": "更換相片",
      "photo.addPhoto": "上傳相片",
      "photo.removePhoto": "移除相片",
      "photo.error": "無法載入這張相片，請嘗試其他相片。",
      "diary.photoLabel": "日記相片（可留空）",

      "form.nickname": "暱稱",
      "form.nicknamePlaceholder": "例如：小獨角",
      "form.species": "品種",
      "form.speciesPlaceholder": "例如：彩虹鍬形蟲",
      "form.lifeStage": "成長階段",
      "form.eclosionDate": "羽化日期（成為成蟲的日期，可留空）",
      "form.lastCareDatesNew": "上次護理日期（留空則預設為今日）",
      "form.lastCareDatesEdit": "上次護理日期",
      "form.saveBeetle": "儲存甲蟲 🪲",
      "form.saveChanges": "儲存變更",
      "form.cancel": "取消",

      "lifeStage.larva": "幼蟲",
      "lifeStage.pupa": "蛹",
      "lifeStage.adult": "成蟲",

      "reminder.jelly": "更換果凍",
      "reminder.substrate": "更換木屑",
      "reminder.water": "噴水加濕",
      "reminder.wood": "更換木頭",

      "profile.speciesNotSet": "未設定品種",
      "profile.eclosionDate": "羽化日期",
      "profile.lastJelly": "上次更換果凍",
      "profile.lastSubstrate": "上次更換木屑",
      "profile.lastMisting": "上次噴水",
      "profile.lastWood": "上次更換木頭",
      "profile.editProfile": "✏️ 編輯檔案",

      "switcher.add": "新增",
      "switcher.newBeetleTitle": "新增甲蟲 🪲",

      "dashboard.overdue": "已逾期{n}日",
      "dashboard.dueToday": "今日到期",
      "dashboard.dueTomorrow": "明日到期",
      "dashboard.daysLeft": "尚餘{n}日",
      "dashboard.every": "每{n}日一次",
      "dashboard.daysUnit": "日",
      "dashboard.save": "儲存",
      "dashboard.markDone": "✅ 已完成",
      "dashboard.pausedForPupa": "蛹期暫停木屑提醒——請勿擾動，以免影響羽化！",

      "diary.addEntry": "+ 新增日記",
      "diary.whatHappened": "今天發生了什麼事？",
      "diary.notePlaceholder": "例如：小獨角爬到木頭頂端了！",
      "diary.date": "日期",
      "diary.saveEntry": "儲存日記 📔",
      "diary.cancel": "取消",
      "diary.close": "關閉",
      "diary.empty": "{name}尚未有日記記錄，拍張照片並寫下簡短紀錄，開始你的時間線吧！",

      "explore.shopsHeading": "🏪 甲蟲專門店（香港）",
      "explore.shopsDisclaimer": "店舖資料來自網上公開資訊，營業時間及地址可能有變動，建議出發前先致電查詢。",
      "explore.openInMaps": "📍 在Google地圖開啟",
      "explore.communitiesHeading": "🌐 甲蟲社群及網站",
      "explore.visit": "前往 ↗",

      "quiz.questionOf": "第{i}題，共{n}題",
      "quiz.next": "下一題 ➡️",
      "quiz.seeResults": "查看結果 🏁",
      "quiz.tryAgain": "再試一次 🔁",
      "quiz.scored": "你獲得 {score} / {total} 分",
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
      "app.growthHeading": "{name}的成長記錄",
      "growth.tipLabel": "護理貼士",
      "growth.logEvent": "+ 記錄成長",
      "growth.newStage": "新的成長階段",
      "growth.notePlaceholder": "例如：一夜之間蛻皮了！",
      "growth.noteLabel": "備註（可留空）",
      "growth.saveEvent": "儲存 🎉",
      "growth.empty": "{name}尚未有成長記錄。",

      "form.supplyNotes": "木屑／木頭備註（可留空）",
      "form.supplyNotesPlaceholder": "例如：XX牌發酵木屑，L號",
      "profile.supplyNotes": "用品備註",
      "profile.daysAsAdultLabel": "羽化日數",
      "profile.daysCount": "{n}日",

      "nav.climate": "氣候",
      "app.climateHeading": "{name}的溫濕度記錄",
      "climate.temperature": "溫度（°C）",
      "climate.humidity": "濕度（%）",
      "climate.logReading": "+ 記錄讀數",
      "climate.saveReading": "儲存讀數 🌡️",
      "climate.empty": "{name}尚未有溫濕度記錄。",
      "climate.tempChartTitle": "🌡️ 溫度",
      "climate.humidityChartTitle": "💧 濕度",
      "climate.latest": "最新",
      "climate.needOneValue": "請輸入溫度或濕度數值。",
      "climate.referenceRangeNote": "🌡️💧 彩虹鍬形蟲參考範圍：溫度 22–26°C，濕度 70–85%。（不同物種可能需要不同範圍——本應用程式未有物種資料庫，此數值僅適用於彩虹鍬形蟲。）",
      "climate.idealRange": "理想範圍：{lo}–{hi}{unit}",

      "profile.share": "📤 分享",
      "share.modalTitle": "分享{name}",
      "share.generating": "生成中...",
      "share.shareButton": "📤 分享",
      "share.downloadButton": "⬇️ 下載",
      "share.errorMessage": "無法製作分享圖片，請再試一次。",
      "share.recentMoments": "最近時刻",

      "backup.title": "備份與還原",
      "backup.description": "備份你的甲蟲資料，避免遺失；亦可從備份檔案還原資料。",
      "backup.exportButton": "⬇️ 匯出備份",
      "backup.importButton": "⬆️ 從檔案還原",
      "backup.invalidFile": "此檔案似乎不是有效的備份檔案。",
      "backup.confirmTitle": "取代目前資料？",
      "backup.confirmMessage": "此備份檔案包含{n}隻甲蟲。還原將會取代此裝置上的所有目前資料，此操作無法復原。",
      "backup.confirmRestore": "確定還原",
      "backup.success": "還原成功！你的甲蟲資料已經回來了。",

      "action.delete": "🗑️ 刪除",
      "diary.deleteConfirm": "確定要刪除這篇日記嗎？此操作無法復原。",
      "growth.deleteConfirm": "確定要刪除這項成長記錄嗎？此操作無法復原。",
      "climate.deleteConfirm": "確定要刪除這項讀數嗎？此操作無法復原。",

      "today.heading": "🔔 今日甲蟲總覽",
      "today.allGood": "你的甲蟲今天狀況良好！✅",
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
