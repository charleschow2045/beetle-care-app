// Bootstrap: mount the app
(function () {
  const { LanguageProvider } = App.I18n;
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <LanguageProvider>
      <App.Root />
    </LanguageProvider>
  );
})();
