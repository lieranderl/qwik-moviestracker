export const ParamsLauncher = () => (
  <script
    dangerouslySetInnerHTML={`
    const params2 = new URLSearchParams(location.search);
    const lang = params2.get("lang");
    const storage =
      typeof window !== "undefined" &&
      window.localStorage &&
      typeof window.localStorage.getItem === "function" &&
      typeof window.localStorage.setItem === "function"
        ? window.localStorage
        : null;
    const storedLang = storage ? storage.getItem("lang") : null;

    if (!storage) {
      return;
    }

    if (storedLang) {
      if (lang) {
        if (storedLang !== lang) {
          params2.set("lang", lang);
          storage.setItem("lang", lang);
          window.location.replace(window.location.pathname+"?"+ params2.toString());
        }
      } else {
        params2.set("lang", storedLang);
        window.location.replace(window.location.pathname+"?"+ params2.toString());
      }
    } else {
      storage.setItem("lang", "en-US");
      params2.set("lang", storage.getItem("lang"));
      window.location.replace(window.location.pathname+"?"+ params2.toString());
    }

    `}
  />
);
