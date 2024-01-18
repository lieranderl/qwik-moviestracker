import { component$ } from "@builder.io/qwik";
import { BsGeoAlt, BsPerson } from "@qwikest/icons/bootstrap";
import { showYearOld, showDeathYear } from "~/utils/fomat";

type PersonInfoProps = {
  icon: any;
  text: string;
};
function PersonInfo({ icon, text }: PersonInfoProps) {
  return (
    <div class="text-md flex items-center">
      {icon}
      <span class="ms-1">{text}</span>
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
      <section class="my-2">
        {place_of_birth && (
          <PersonInfo icon={<BsGeoAlt />} text={place_of_birth} />
        )}

        {!deathday && (
          <PersonInfo
            icon={<BsPerson />}
            text={`${birthday} (${showYearOld(birthday!)})`}
          />
        )}

        {deathday && (
          <PersonInfo
            icon={<BsPerson />}
            text={`${birthday} – ${deathday}(${showDeathYear(
              birthday!,
              deathday,
            )})`}
          />
        )}
      </section>
    );
  },
);
