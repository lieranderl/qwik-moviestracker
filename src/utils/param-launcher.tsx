export const ParamsLauncher = () => (
  <script
    dangerouslySetInnerHTML={`
    const params = new URLSearchParams(location.search);
    const lang = params.get("lang");

    if (localStorage.lang) {
      if (lang) {
        if (localStorage.lang !== lang) {
          params.set("lang", lang);
          localStorage.setItem("lang", lang);
          window.location.replace(window.location.pathname+"?"+ params.toString());
        } 
      } else {
        params.set("lang", localStorage.lang);
        window.location.replace(window.location.pathname+"?"+ params.toString());
      }
    } else {
      localStorage.setItem("lang", "en-US");
      params.set("lang", localStorage.lang);
      window.location.replace(window.location.pathname+"?"+ params.toString());
    }

    const theme = params.get("theme");
    if (localStorage.themePref) {
      if (theme) {
        if (localStorage.themePref !== theme) {
          params.set("theme", theme);
          localStorage.setItem("themePref", theme);
          window.location.replace(window.location.pathname+"?"+ params.toString());
        } 
      } 
    } else {
      localStorage.setItem("themePref", "auto");
      params.set("theme", localStorage.themePref);
      window.location.replace(window.location.pathname+"?"+ params.toString());
    }
    `}
  />
);
