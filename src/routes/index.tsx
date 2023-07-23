import { component$, $, useVisibleTask$ } from "@builder.io/qwik";

import type { DocumentHead } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { MediaGrid } from "~/components/media-grid";

export default component$(() => {
  const m = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <>

      <MediaCarousel title="Popular Movies">
        {m.map(() => (
          <>
            <div class="carousel-item">
              <MediaCard
                title="Guardians of the Galaxy Vol. 3"
                width={500}
                rating={8.3}
                year={2023}
                picfile="u3a7hKGhQehkgVq9dt1DohzNk8F.jpg"
                isPerson={false}
                isHorizontal={true}
              />
            </div>
            <div class="carousel-item">
              <MediaCard
                title="Avatar: The Way of Water"
                width={500}
                picfile="rdtZokC7lYFUuGjn1zGaY4WrVXU.jpg"
                rating={8.5}
                year={2021}
                isPerson={false}
                isHorizontal={true}
              />
            </div>
          </>
        ))}
      </MediaCarousel>

      <MediaCarousel title="Popular Movies">
        {m.map(() => (
          <>
            <div class="carousel-item">
              <MediaCard
                title="Avatar"
                width={500}
                rating={8.3}
                year={2023}
                picfile="t6HIqrRAclMCA60NsSmeqe9RmNV.jpg"
                isPerson={false}
                isHorizontal={false}
              />
            </div>
            <div class="carousel-item">
              <MediaCard
                title="Barbie"
                width={500}
                rating={8.3}
                year={2023}
                picfile="r2J02Z2OpNTctfOSN1Ydgii51I3.jpg"
                isPerson={false}
                isHorizontal={false}
                charName="Pizda"
              />
            </div>
            <div class="carousel-item">
              <MediaCard
                title="Barbie"
                width={500}
                rating={8.3}
                year={2023}
                picfile="iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg"
                isPerson={false}
                isHorizontal={false}
                charName="Pizda"
              />
            </div>
          </>
        ))}
      </MediaCarousel>
      <MediaCarousel title="Actors">
        {m.map(() => (
          <>
            <div class="carousel-item">
              <MediaCard
                title="Margot Robbie"
                width={300}
                picfile="euDPyqLnuwaWMHajcU3oZ9uZezR.jpg"
                isPerson={true}
                isHorizontal={false}
                charName="Barbie"
              />
            </div>
          </>
        ))}
      </MediaCarousel>

      <section>
        <div class="text-2xl text-gray-800 dark:text-white">Movies Grid</div>
        <MediaGrid>
          {m.map(() => (
            <>
              <div class="carousel-item">
                <MediaCard
                  title="Avatar"
                  width={500}
                  rating={8.3}
                  year={2023}
                  picfile="t6HIqrRAclMCA60NsSmeqe9RmNV.jpg"
                  isPerson={false}
                  isHorizontal={false}
                />
              </div>
              <div class="carousel-item">
                <MediaCard
                  title="Barbie"
                  width={500}
                  rating={8.3}
                  year={2023}
                  picfile="r2J02Z2OpNTctfOSN1Ydgii51I3.jpg"
                  isPerson={false}
                  isHorizontal={false}
                />
              </div>
              <div class="carousel-item">
                <MediaCard
                  title="Barbie"
                  width={500}
                  rating={8.3}
                  year={2023}
                  picfile="iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg"
                  isPerson={false}
                  isHorizontal={false}
                />
              </div>
            </>
          ))}
        </MediaGrid>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
