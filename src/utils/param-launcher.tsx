export const ParamsLauncher = () => (
	<script
		// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
		dangerouslySetInnerHTML={`
    const params2 = new URLSearchParams(location.search);
    const lang = params2.get("lang");
    if (localStorage.lang) {
      if (lang) {
        if (localStorage.lang !== lang) {
          params2.set("lang", lang);
          localStorage.setItem("lang", lang);
          window.location.replace(window.location.pathname+"?"+ params2.toString());
        } 
      } else {
        params2.set("lang", localStorage.lang);
        window.location.replace(window.location.pathname+"?"+ params2.toString());
      }
    } else {
      localStorage.setItem("lang", "en-US");
      params2.set("lang", localStorage.lang);
      window.location.replace(window.location.pathname+"?"+ params2.toString());
    }

    `}
	/>
);
