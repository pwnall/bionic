import { Binder, BinderFactory } from "./binders";
import { builder } from "./builder";

export namespace BuiltinBinders {
  "use strict";

  /** Assigns the observed value to the element's innerHTML. */
  export const html: Binder = (target, value) => {
    target.innerHTML = value;
  };
  builder.binders.add("html", html);

  /** Replaces the element's children with the given text content. */
  export const text: Binder = (target, value) => {
    target.textContent = value;
  };
  builder.binders.add("text", text);

  /**
   * Shows the element if the value is truthy, hides it otherwise.
   *
   * This method sets an inline style attribute for targets of type HTMLElement
   * only, not SVGElement. The recommended way of showing/hiding elements,
   * however, is to use class attributes.
   */
  export const show: Binder = (target, value) => {
    (target as HTMLElement).style.display = value ? "" : "none";
  };
  builder.binders.add("show", show);

  /**
   * Hides the element if the value is truthy, shows it otherwise.
   *
   * This method sets an inline style attribute for targets of type HTMLElement
   * only, not SVGElement. The recommended way of showing/hiding elements,
   * however, is to use class attributes.
   */
  export const hide: Binder = (target, value) => {
    (target as HTMLElement).style.display = value ? "none" : "";
  };
  builder.binders.add("hide", hide);

  /** Enables the element if the value is truthy, disables it otherwise. */
  export const enabled: Binder = (target, value) => {
    (target as HTMLInputElement).disabled = !value;
  };
  builder.binders.add("enabled", enabled);

  /** Disables the element if the value is truthy, enables it otherwise. */
  export const disabled: Binder = (target, value) => {
    (target as HTMLInputElement).disabled = !!value;
  };
  builder.binders.add("disabled", disabled);

  export const attributeFactory: BinderFactory = (suffix) => {
    return (target, value) => {
      if (value === true) {
        target.setAttribute(suffix, suffix);
      } else if (value === false) {
        target.removeAttribute(suffix);
      } else {
        target.setAttribute(suffix, value);
      }
    };
  };
  builder.binders.addPrefix("", attributeFactory);
};
