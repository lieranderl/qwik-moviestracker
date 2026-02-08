import { component$ } from "@builder.io/qwik";
import { BsGeoAlt, BsPerson } from "@qwikest/icons/bootstrap";
import { showDeathYear, showYearOld } from "~/utils/fomat";

type PersonInfoProps = {
  icon: string;
  text: string;
};
function PersonInfo({ icon, text }: PersonInfoProps) {
  return (
    <div class="text-md flex items-start gap-2">
      <span class="text-base-content/60">
        {icon === "geo" ? <BsGeoAlt /> : <BsPerson />}
      </span>
      <span class="text-base-content/85">{text}</span>
    </div>
  );
}

export type PersonDateProps = {
  place_of_birth?: string;
  birthday?: string;
  deathday?: string;
};
export const PersonDate = component$<PersonDateProps>(
  ({ place_of_birth, birthday, deathday }) => {
    return (
      <section class="space-y-2">
        {place_of_birth && <PersonInfo icon="geo" text={place_of_birth} />}

        {birthday && !deathday && (
          <PersonInfo
            icon="person"
            text={`${birthday} (${showYearOld(birthday ?? "")})`}
          />
        )}

        {birthday && deathday && (
          <PersonInfo
            icon="person"
            text={`${birthday} – ${deathday}(${showDeathYear(
              birthday ?? "",
              deathday,
            )})`}
          />
        )}
      </section>
    );
  },
);
