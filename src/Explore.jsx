// Feature: shops (with map) + enthusiast community links
window.App = window.App || {};

(function () {
  const { ExploreData } = window.App;
  const { SPECIMEN_PALETTE, SpecimenCard } = window.App.SpecimenTheme;
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
      <SpecimenCard className="mb-4">
        <h3 className="text-lg font-extrabold leading-tight" style={{ color: SPECIMEN_PALETTE.ink }}>
          {shop.name}
        </h3>
        <p className="font-bold text-sm mt-0.5" style={{ color: `${SPECIMEN_PALETTE.ink}99` }}>
          {lang === "zh" ? shop.regionZh : shop.region}
        </p>
        <p className="text-sm mt-2" style={{ color: `${SPECIMEN_PALETTE.ink}CC` }}>
          {lang === "zh" ? shop.noteZh : shop.note}
        </p>

        <iframe
          title={`Map: ${shop.name}`}
          src={mapsEmbedUrl(shop.address)}
          className="w-full h-48 rounded-2xl mt-3"
          style={{ border: `2px solid ${SPECIMEN_PALETTE.metallic}4D` }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <a
          href={mapsLinkUrl(shop.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-center rounded-2xl font-extrabold py-2.5 active:translate-y-[2px] transition-all"
          style={{ backgroundColor: SPECIMEN_PALETTE.sky, color: SPECIMEN_PALETTE.paper, boxShadow: "0 2px 0 #254a63" }}
        >
          {t("explore.openInMaps")}
        </a>
      </SpecimenCard>
    );
  }

  function CommunityCard({ site }) {
    const { t, lang } = useI18n();
    return (
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-[1.25rem] p-4 mb-4 border transition-all active:translate-y-[2px]"
        style={{
          backgroundColor: SPECIMEN_PALETTE.paper,
          borderColor: `${SPECIMEN_PALETTE.metallic}4D`,
          boxShadow: "0 1px 2px rgba(59,46,34,0.10), 0 4px 8px rgba(59,46,34,0.10)",
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-extrabold leading-tight" style={{ color: SPECIMEN_PALETTE.ink }}>
              {site.name}
            </h3>
            <p className="font-bold text-sm mt-0.5" style={{ color: `${SPECIMEN_PALETTE.ink}99` }}>
              {lang === "zh" ? site.regionZh : site.region}
            </p>
          </div>
          <span
            className="shrink-0 text-sm font-extrabold px-3 py-1 rounded-full"
            style={{ backgroundColor: SPECIMEN_PALETTE.moss, color: SPECIMEN_PALETTE.paper }}
          >
            {t("explore.visit")}
          </span>
        </div>
        <p className="text-sm mt-2" style={{ color: `${SPECIMEN_PALETTE.ink}CC` }}>
          {lang === "zh" ? site.noteZh : site.note}
        </p>
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
        <p className="text-xs font-bold -mt-2 mb-6" style={{ color: `${SPECIMEN_PALETTE.ink}66` }}>
          {t("explore.shopsDisclaimer")}
        </p>

        <h2 className="text-xl font-extrabold mb-3">{t("explore.communitiesHeading")}</h2>
        {ExploreData.COMMUNITIES.map((site) => (
          <CommunityCard key={site.name} site={site} />
        ))}
      </div>
    );
  }

  window.App.Explore = Explore;
})();
