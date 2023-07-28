import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./dot-pulse.css?inline";

export const DotPulseLoader = component$(() => {
  useStylesScoped$(styles);
  return <div class="dot-pulse mx-4"></div>;
});
