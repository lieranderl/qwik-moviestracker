import { component$ } from "@builder.io/qwik";

interface ToastProgressBarProps {
  progress: number;
}

export const ToastProgressBar = component$(
  ({ progress }: ToastProgressBarProps) => {
    return (
      <div class="w-full bg-teal-300 rounded-b-lg h-1.5 dark:bg-teal-600">
        <div
          class="bg-teal-100 h-1.5 dark:bg-teal-800 rounded-b-lg animate-progress-slide"
          style={`--bar-duration:${progress}ms`}
        ></div>
      </div>
    );
  }
);
