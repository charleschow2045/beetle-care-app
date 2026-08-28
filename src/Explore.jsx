// Feature: shops (with map) + enthusiast community links
window.App = window.App || {};

(function () {
  const { ExploreData } = window.App;
  const { Card } = window.App.UI;
  const { useI18n } = window.App.I18n;

  function mapsEmbedUrl(address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  }

  function mapsLinkUrl(address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  function ShopCard({ shop }) {
    const { t, lang } = useI18n();
    return (
      <Card className="mb-4">
        <h3 className="text-lg font-extrabold text-stone-800 leading-tight">{shop.name}</h3>
        <p className="text-stone-500 font-bold text-sm mt-0.5">{lang === "zh" ? shop.regionZh : shop.region}</p>
        <p className="text-stone-600 text-sm mt-2">{lang === "zh" ? shop.noteZh : shop.note}</p>

        <iframe
          title={`Map: ${shop.name}`}
          src={mapsEmbedUrl(shop.address)}
          className="w-full h-48 rounded-2xl border-4 border-lime-100 mt-3"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <a
          href={mapsLinkUrl(shop.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-center rounded-2xl border-4 border-sky-600 bg-sky-400 text-sky-950 font-extrabold py-2.5 active:translate-y-[2px] transition-all"
        >
          {t("explore.openInMaps")}
        </a>
      </Card>
    );
  }

  function CommunityCard({ site }) {
    const { t, lang } = useI18n();
    return (
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white border-4 border-lime-200 rounded-3xl shadow-[0_6px_0_rgba(101,163,13,0.15)] p-4 mb-4 active:translate-y-[2px] transition-all"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-extrabold text-stone-800 leading-tight">{site.name}</h3>
            <p className="text-stone-500 font-bold text-sm mt-0.5">{lang === "zh" ? site.regionZh : site.region}</p>
          </div>
          <span className="shrink-0 text-sm font-extrabold px-3 py-1 rounded-full bg-violet-400 text-violet-950">
            {t("explore.visit")}
          </span>
        </div>
        <p className="text-stone-600 text-sm mt-2">{lang === "zh" ? site.noteZh : site.note}</p>
      </a>
    );
  }

  function Explore() {
    const { t } = useI18n();
    return (
      <div>
        <h2 className="text-xl font-extrabold mb-3">{t("explore.shopsHeading")}</h2>
        {ExploreData.SHOPS.map((shop) => (
          <ShopCard key={shop.name} shop={shop} />
        ))}
        <p className="text-xs text-stone-400 font-bold -mt-2 mb-6">{t("explore.shopsDisclaimer")}</p>

        <h2 className="text-xl font-extrabold mb-3">{t("explore.communitiesHeading")}</h2>
        {ExploreData.COMMUNITIES.map((site) => (
          <CommunityCard key={site.name} site={site} />
        ))}
      </div>
    );
  }

  window.App.Explore = Explore;
})();
