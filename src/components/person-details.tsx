import { component$ } from "@builder.io/qwik";
import type { PersonMediaDetails } from "~/services/types";

interface MovieDetailsProps {
  person: PersonMediaDetails;
}

export const PersonDetails = component$(({ person }: MovieDetailsProps) => {
  return (
    <div>
      <div>{person.name}</div>
      {person.birthday && <div>{person.birthday}</div>}
      <div>{person.biography}</div>
      
    </div>
  );
});
