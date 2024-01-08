export const LangLauncher = () => (
  <script
    dangerouslySetInnerHTML={`if(localStorage.lang){const params = new URLSearchParams(location.search);params.set('lang', localStorage.lang);window.history.replaceState({}, '', location.pathname+'?'+params);}`}
  />
);
