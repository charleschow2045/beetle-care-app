// Static reference data for the Explore tab — beetle shops (HK) and
// enthusiast communities/websites (HK & Taiwan). Sourced from public web
// search results; shop hours/addresses can change, so each entry links out
// to Google Maps / the source site rather than being treated as guaranteed
// up to date. Bilingual: `region`/`note` are English, `regionZh`/`noteZh`
// are Hong Kong-style Traditional Chinese.
window.App = window.App || {};

(function () {
  const SHOPS = [
    {
      name: "Discovery Beetles 蟲森萬象甲蟲專門店",
      region: "Mong Kok, Kowloon, Hong Kong",
      regionZh: "香港九龍旺角",
      address: "2/F Room B, Po On Building, 30 Mong Kok Road, Mong Kok, Kowloon, Hong Kong",
      note: "Hong Kong beetle specialty shop — stag & rhino beetles plus care supplies (jelly, substrate, enclosures).",
      noteZh: "香港甲蟲專門店，有鍬形蟲、獨角仙同埋各種護理用品（果凍、木屑、飼養箱）。",
    },
  ];

  const COMMUNITIES = [
    {
      name: "香港甲蟲研究協會 Hong Kong Beetles Research Association",
      region: "Hong Kong",
      regionZh: "香港",
      url: "https://www.facebook.com/hkbtsra/",
      note: "HK community for beetle keepers — education, species ID help, meetups.",
      noteZh: "香港甲蟲飼主社群，提供教育資訊、物種辨識協助同聚會活動。",
    },
    {
      name: "喜蟲天降甲蟲專賣店 (beetles.com.tw)",
      region: "Taiwan",
      regionZh: "台灣",
      url: "https://www.beetles.com.tw/",
      note: "Long-running Taiwan beetle specialty shop site with species & care info.",
      noteZh: "台灣老字號甲蟲專賣店網站，有齊物種同飼養資訊。",
    },
    {
      name: "台灣蟲店列表 by 黑貓老師",
      region: "Taiwan",
      regionZh: "台灣",
      url: "https://blackcatteacher.com/blog/post/43368166",
      note: "Regularly-updated directory of beetle shops across Taiwan, by region.",
      noteZh: "由黑貓老師定期更新嘅台灣各地甲蟲店舖名單。",
    },
  ];

  window.App.ExploreData = { SHOPS, COMMUNITIES };
})();
