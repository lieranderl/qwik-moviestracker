import { component$ } from "@builder.io/qwik";
import type { UpstreamFailureDetails } from "~/services/upstream";
import { message } from "~/utils/i18n";
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
      title={message(lang, "feed.sectionUnavailable", { section: title })}
      description={message(lang, "feed.tryAgain")}
    />
  );
});
