import { expect } from "chai";

import { Binder } from "../src/binders";
import { builder } from "../src/builder";
import { BuiltinBinders } from "../src/builtin_binders";

describe("BuiltinBinders", () => {
  let div: Element;
  let input: HTMLInputElement;
  beforeEach(() => {
    div = document.createElement("div");
    input = document.createElement("input");
    input.setAttribute("type", "text");
  });

  describe(".html", () => {
    it("sets the target's innerHTML", () => {
      BuiltinBinders.html(div, "Hello world!");
      expect(div.innerHTML).to.equal("Hello world!");
    });

    it("is registered with the default builder", () => {
      expect(builder.binders.resolve("html")).to.equal(BuiltinBinders.html);
    });
  });

  describe(".text", () => {
    it("sets the target's text content", () => {
      BuiltinBinders.html(div, "Hello world!");
      expect(div.textContent).to.equal("Hello world!");
    });

    it("is registered with the default builder", () => {
      expect(builder.binders.resolve("text")).to.equal(BuiltinBinders.text);
    });
  });

  describe(".show", () => {
    it("clears the target's 'display' property if the value is true", () => {
      BuiltinBinders.show(div, true);
      expect(div.getAttribute("style")).to.equal(null);
    });

    it("sets the target to 'display: none' if the value is false", () => {
      BuiltinBinders.show(div, false);
      expect(div.getAttribute("style")).to.equal("display: none;");
    });

    it("is registered with the default builder", () => {
      expect(builder.binders.resolve("show")).to.equal(BuiltinBinders.show);
    });
  });

  describe(".hide", () => {
    it("hides the target if the value is truthy", () => {
      BuiltinBinders.hide(div, true);
      expect(div.getAttribute("style")).to.equal("display: none;");
    });

    it("shows the target if the value is falsey", () => {
      BuiltinBinders.hide(div, false);
      expect(div.hasAttribute("style")).to.equal(false);
    });

    it("is registered with the default builder", () => {
      expect(builder.binders.resolve("hide")).to.equal(BuiltinBinders.hide);
    });
  });

  describe(".enabled", () => {
    it("enables the target if the value is truthy", () => {
      input.setAttribute("disabled", "disabled");
      expect(input.hasAttribute("disabled")).to.equal(true);

      BuiltinBinders.enabled(input, true);
      expect(input.disabled).to.equal(false);
      expect(input.hasAttribute("disabled")).to.equal(false);
    });

    it("disables the target if the value is falsey", () => {
      BuiltinBinders.enabled(input, false);
      expect(input.disabled).to.equal(true);
      expect(input.hasAttribute("disabled")).to.equal(true);
    });

    it("is registered with the default builder", () => {
      expect(builder.binders.resolve("enabled")).to.equal(
          BuiltinBinders.enabled);
    });
  });

  describe(".disabled", () => {
    it("disables the target if the value is truthy", () => {
      BuiltinBinders.disabled(input, true);
      expect(input.disabled).to.equal(true);
      expect(input.hasAttribute("disabled")).to.equal(true);
    });

    it("enables the target if the value is falsey", () => {
      input.setAttribute("disabled", "disabled");
      expect(input.hasAttribute("disabled")).to.equal(true);

      BuiltinBinders.disabled(input, false);
      expect(input.disabled).to.equal(false);
      expect(input.hasAttribute("disabled")).to.equal(false);
    });

    it("is registered with the default builder", () => {
      expect(builder.binders.resolve("disabled")).to.equal(
          BuiltinBinders.disabled);
    });
  });

  describe(".attributeFactory", () => {
    let fooBinder: Binder;
    beforeEach(() => {
      fooBinder = BuiltinBinders.attributeFactory("foo");
    });

    it("sets the desired attribute to a string value", () => {
      fooBinder(div, "bar");
      expect(div.getAttribute("foo")).to.equal("bar");
    });

    it("sets the attribute correctly when true", () => {
      fooBinder(div, true);
      expect(div.getAttribute("foo")).to.equal("foo");
    });

    it("removes the attribute when false", () => {
      div.setAttribute("foo", "bar");
      fooBinder(div, false);
      expect(div.hasAttribute("foo")).to.equal(false);
    });
  });
});
