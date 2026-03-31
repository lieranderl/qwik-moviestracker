export const PARAM_LAUNCHER_SCRIPT = `
(() => {
  const params = new URLSearchParams(location.search);
  const lang = params.get("lang");
  const storage =
    typeof window !== "undefined" &&
    window.localStorage &&
    typeof window.localStorage.getItem === "function" &&
    typeof window.localStorage.setItem === "function"
      ? window.localStorage
      : null;

  if (!storage) {
    return;
  }

  const storedLang = storage.getItem("lang");

  if (lang) {
    if (storedLang !== lang) {
      storage.setItem("lang", lang);
    }
    return;
  }

  const nextLang = storedLang || "en-US";
  if (!storedLang) {
    storage.setItem("lang", nextLang);
  }

  params.set("lang", nextLang);
  const nextUrl = \`\${window.location.pathname}?\${params.toString()}\${window.location.hash}\`;
  window.location.replace(nextUrl);
})();
`;

export const ParamsLauncher = () => (
  <script dangerouslySetInnerHTML={PARAM_LAUNCHER_SCRIPT} />
);
