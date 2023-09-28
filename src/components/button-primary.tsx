import type { PropFunction } from "@builder.io/qwik";
import { Slot, component$, useSignal, useTask$ } from "@builder.io/qwik";
import { SpinLoadIcon } from "~/utils/icons/spinload";

export enum ButtonSize {
  sm = "sm",
  md = "md",
  lg = "lg",
  icon = "icon",
}

export enum ButtonType {
  button = "button",
  submit = "submit",
  reset = "reset",
}

interface ButtonPrimaryProps {
  text?: string;
  isLoading?: boolean;
  size: ButtonSize;
  onClick?: PropFunction;
  type?: ButtonType;
  disabled?: boolean;
  dataModalTarget?: string;
  dataModalToggle?: string;
  dataDropdownToggle?: string;
  dataDropdownPlacement?: string;
}

export const ButtonPrimary = component$(
  ({ text, onClick, isLoading, size, type, disabled, dataModalTarget, dataModalToggle, dataDropdownToggle, dataDropdownPlacement }: ButtonPrimaryProps) => {
    const typeSig = useSignal(type);
    const disabledSig = useSignal(disabled);
    const colorCls = "text-center text-primary bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-opacity-75 focus:ring-4 focus:outline-none focus:ring-primary-700 "
    const smClass =
      "px-3 py-2 text-xs font-medium " + colorCls
    const lgClass =
      "px-3.5 py-2.5 text-base font-medium " + colorCls;
    const mdClass =
      "px-3 py-2 text-base font-medium " + colorCls;
    const iconClass =
      "px-2 py-2 text-base font-small text-center text-primary-dark rounded-lg hover:bg-primary-100 hover:bg-opacity-50 focus:ring-opacity-50 focus:ring-2 focus:outline-none focus:ring-primary-100 dark:text-primary dark:hover:bg-primary-800 dark:focus:ring-primary-800";


    let selectedClass = smClass;
    if (size == "md") {
      selectedClass = mdClass;
    } else if (size == "lg") {
      selectedClass = lgClass;
    } else if (size == "icon") {
      selectedClass = iconClass;
    }

    useTask$(() => {
      if (type == undefined) {
        typeSig.value = ButtonType.button;
      }
      if (disabled == undefined) {
        disabledSig.value = false;
      }
    });

    return (
      <button
        data-modal-target={dataModalTarget}
        data-modal-toggle={dataModalToggle}
        data-dropdown-toggle={dataDropdownToggle}
        data-dropdown-placement={dataDropdownPlacement}
        onClick$={onClick}
        type={typeSig.value}
        disabled={isLoading || disabledSig.value}
        class={selectedClass}
      >
        {isLoading && (
          <>
            <SpinLoadIcon />
            Loading...
          </>
        )}
        {!isLoading && (
          <div class="flex items-center">
            <Slot />
            {text && <span>{text}</span>}
          </div>
        )}
      </button>
    );
  }
);
