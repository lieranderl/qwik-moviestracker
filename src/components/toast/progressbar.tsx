import { component$ } from "@builder.io/qwik";

interface ToastProgressBarProps {
  progress: number;
}

export const ToastProgressBar = component$(
  ({ progress }: ToastProgressBarProps) => {
    return (
      <div class="w-full bg-primary-300 rounded-b-lg h-1.5 dark:bg-primary-600">
        <div
          class="bg-primary-100 h-1.5 dark:bg-primary-800 rounded-b-lg animate-progress-slide"
          style={`--bar-duration:${progress}ms`}
        ></div>
      </div>
    );
  },
);
