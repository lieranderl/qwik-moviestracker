import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

type QuickFilterItem = {
  active?: boolean;
  href: string;
  label: string;
};

type QuickFilterStripProps = {
  items: QuickFilterItem[];
  label: string;
};

const getHrefHash = (href: string) => {
  const hashIndex = href.indexOf("#");
  return hashIndex === -1 ? "" : href.slice(hashIndex);
};

export const QuickFilterStrip = component$<QuickFilterStripProps>(
  ({ items, label }) => {
    const activeHashSig = useSignal("");
    const fallbackActiveHref = items.find((item) => item.active)?.href;
    const selectedHash =
      activeHashSig.value &&
      items.some((item) => getHrefHash(item.href) === activeHashSig.value)
        ? activeHashSig.value
        : "";

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup }) => {
      const syncActiveHash = () => {
        activeHashSig.value = window.location.hash;
      };

      syncActiveHash();
      window.addEventListener("hashchange", syncActiveHash);
      cleanup(() => window.removeEventListener("hashchange", syncActiveHash));
    });

    return (
      <section
        aria-label={label}
        class="section-reveal sticky top-[4.1rem] z-30"
      >
        <div class="tabs tabs-box w-full overflow-x-auto whitespace-nowrap">
          {items.map((item, index) => {
            const isActive = selectedHash
              ? getHrefHash(item.href) === selectedHash
              : item.href === fallbackActiveHref ||
                (!fallbackActiveHref && index === 0);

            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? "location" : "false"}
                class={["tab min-h-11", isActive && "tab-active"]}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </section>
    );
  },
);
