import { component$ } from "@builder.io/qwik";
import type { UpstreamFailureDetails } from "~/services/upstream";
import { langText } from "~/utils/languages";
import { ErrorState } from "./page-feedback";

export const FeedSectionFailure = component$<{
  failure?: UpstreamFailureDetails;
  lang: string;
  title: string;
}>(({ failure, lang, title }) => {
  if (!failure) return null;
  return (
    <ErrorState
      compact={true}
      title={langText(
        lang,
        `${title} is temporarily unavailable`,
        `${title}: раздел временно недоступен`,
      )}
      description={langText(
        lang,
        "Other collections are still available. Try this section again later.",
        "Другие коллекции доступны. Попробуйте открыть этот раздел позже.",
      )}
    />
  );
});
