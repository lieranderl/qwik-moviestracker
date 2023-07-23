import { Slot, component$ } from "@builder.io/qwik";

export const MediaGrid = component$(() => {
  return  <div
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
    <Slot />
</div>
});