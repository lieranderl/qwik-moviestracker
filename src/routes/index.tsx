import { component$ } from "@builder.io/qwik";

import type { DocumentHead } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";

export default component$(() => {
  return (
    <>
      <div class="bg-white dark:bg-gray-800">
        <h1 class="text-gray-900 dark:text-white">Dark mode</h1>
        <p class="text-gray-600 dark:text-gray-300">Lorem ipsum...</p>
      </div>
      <section>
        <div class="relative">
          <div class="overflow-y-auto px-8 py-4">
            <div class="carousel flex w-max flex-row gap-4">
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
              <div class="carousel-item">
                <MediaCard
                  title="Avatar: The Way of Water"
                  width={500}
                  picfile="rdtZokC7lYFUuGjn1zGaY4WrVXU.jpg"
                  rating={5}
                  year={2021}
                  isPerson={false}
                  isHorizontal={true}
                />
              </div>
              <div class="carousel-item">
                <MediaCard
                  title="Guardians of the Galaxy Vol. 3"
                  width={500}
                  picfile="u3a7hKGhQehkgVq9dt1DohzNk8F.jpg"
                  rating={8.3}
                  year={2023}
                  isPerson={false}
                  isHorizontal={true}
                />
              </div>
              <div class="carousel-item">
                <MediaCard
                  title="Avatar: The Way of Water"
                  width={500}
                  rating={8.3}
                  year={2023}
                  picfile="rdtZokC7lYFUuGjn1zGaY4WrVXU.jpg"
                  isPerson={false}
                  isHorizontal={true}
                />
              </div>
              <div class="carousel-item">
                <MediaCard
                  title="Avatar: The Way of Water"
                  width={500}
                  rating={8.3}
                  year={2023}
                  picfile="rdtZokC7lYFUuGjn1zGaY4WrVXU.jpg"
                  isPerson={false}
                  isHorizontal={true}
                />
              </div>
              <div class="carousel-item">
                <MediaCard
                  title="Avatar: The Way of Water"
                  width={500}
                  rating={8.3}
                  year={2023}
                  picfile="rdtZokC7lYFUuGjn1zGaY4WrVXU.jpg"
                  isPerson={false}
                  isHorizontal={true}
                />
              </div>
              <a class="transition-text flex w-44items-center justify-center duration-100 ease-in-out hover:text-qwik-light-blue">
                Explore All
              </a>
            </div>
          </div>
          {/* TODO: Add buttons */}
        </div>
      </section>

      <section>
        <div class="relative">
          <div class="overflow-y-auto px-8 py-4">
            <div class="carousel flex w-max flex-row gap-4">
              <div class="carousel-item">
                <MediaCard
                  title="Barbie"
                  width={500}
                  picfile="iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg"
                  rating={8.5}
                  year={2021}
                  isPerson={false}
                  isHorizontal={false}
                />
              </div>
              <div class="carousel-item">
                <MediaCard
                  title="Barbie"
                  width={500}
                  picfile="iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg"
                  rating={5}
                  year={2021}
                  isPerson={false}
                  isHorizontal={false}
                />
              </div>
              <div class="carousel-item">
                <MediaCard
                  title="Guardians of the Galaxy Vol. 3"
                  width={500}
                  picfile="r2J02Z2OpNTctfOSN1Ydgii51I3.jpg"
                  rating={8.3}
                  year={2023}
                  isPerson={false}
                  isHorizontal={false}
                />
              </div>
              <div class="carousel-item">
                <MediaCard
                  title="Barbie"
                  width={500}
                  picfile="iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg"
                  isPerson={false}
                  isHorizontal={false}
                />
              </div>
              <div class="carousel-item">
                <MediaCard
                  title="Barbie"
                  width={500}
                  picfile="iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg"
                  isPerson={true}
                  isHorizontal={false}
                />
              </div>
              <div class="carousel-item">
                <MediaCard
                  title="Barbie"
                  width={500}
                  picfile="iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg"
                  isPerson={true}
                  isHorizontal={false}
                />
              </div>
              <a class="transition-text flex w-44items-center justify-center duration-100 ease-in-out hover:text-qwik-light-blue">
                Explore All
              </a>
            </div>
          </div>
          {/* TODO: Add buttons */}
        </div>
      </section>

      <section>
        <div
          // document:onScroll$={() => {
          //   if (throttleTimer.value || !scrollEnabled.value) {
          //     return;
          //   }
          //   throttleTimer.value = true;
          //   setTimeout(() => {
          //     handleScroll$();
          //     throttleTimer.value = false;
          //   }, 1000);
          // }}
          class="flex flex-wrap gap-4 px-8 justify-center"
        >
          <MediaCard
            title="Barbie"
            width={500}
            picfile="iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg"
            rating={8.5}
            year={2021}
            isPerson={false}
            isHorizontal={false}
          />
          <MediaCard
            title="Barbie"
            width={500}
            picfile="iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg"
            rating={8.5}
            year={2021}
            isPerson={false}
            isHorizontal={false}
          />
          <MediaCard
            title="Barbie"
            width={500}
            picfile="iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg"
            rating={8.5}
            year={2021}
            isPerson={false}
            isHorizontal={false}
          />
          <MediaCard
            title="Guardians of the Galaxy Vol. 3"
            width={500}
            picfile="r2J02Z2OpNTctfOSN1Ydgii51I3.jpg"
            rating={8.3}
            year={2023}
            isPerson={false}
            isHorizontal={false}
          />
          <MediaCard
            title="Guardians of the Galaxy Vol. 3"
            width={500}
            picfile="r2J02Z2OpNTctfOSN1Ydgii51I3.jpg"
            rating={8.3}
            year={2023}
            isPerson={false}
            isHorizontal={false}
          />
          <MediaCard
            title="Guardians of the Galaxy Vol. 3"
            width={500}
            picfile="r2J02Z2OpNTctfOSN1Ydgii51I3.jpg"
            rating={8.3}
            year={2023}
            isPerson={false}
            isHorizontal={false}
          />
          <MediaCard
            title="Guardians of the Galaxy Vol. 3"
            width={500}
            picfile="r2J02Z2OpNTctfOSN1Ydgii51I3.jpg"
            rating={8.3}
            year={2023}
            isPerson={false}
            isHorizontal={false}
          />
          <MediaCard
            title="Guardians of the Galaxy Vol. 3"
            width={500}
            picfile="r2J02Z2OpNTctfOSN1Ydgii51I3.jpg"
            rating={8.3}
            year={2023}
            isPerson={false}
          />
          <MediaCard
            title="Guardians of the Galaxy Vol. 3"
            width={500}
            picfile="r2J02Z2OpNTctfOSN1Ydgii51I3.jpg"
            rating={8.3}
            year={2023}
            isPerson={false}
            isHorizontal={false}
          />
        
        </div>
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
