import { Binder, BinderFactory } from "./binders";
import { builder } from "./builder";

export namespace BuiltinBinders {
  "use strict";

  /** Assigns the observed value to the element's innerHTML. */
  export const html: Binder = (target, value) => {
    target.innerHTML = value;
  };
  builder.binders.add("html", html);

  export const text: Binder = (target, value) => {
    target.textContent = value;
  };
  builder.binders.add("text", text);

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
