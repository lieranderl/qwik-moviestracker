import { component$ } from "@builder.io/qwik";
import { LangButton } from "~/components/lang-button";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { MediaGrid } from "~/components/media-grid";

export default component$(() => {
  const m = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <>
    <LangButton/>
      {/* <MediaCarousel title="Popular Movies"> */}
        {/* {m.map(() => (
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
        <div class="text-xl text-teal-950 font-bold dark:text-teal-50">
          Movies Grid
        </div>
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
      </section> */}
    </>
  );
});
