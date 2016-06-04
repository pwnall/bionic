import { expect } from "chai";

import { Binder } from "../src/binders";
import { builder } from "../src/builder";
import { BuiltinBinders } from "../src/builtin_binders";

describe("BuiltinBinders", () => {
  let target: Element;
  beforeEach(() => {
    target = document.createElement("div");
  });

  describe(".html", () => {
    it("sets the target's innerHTML", () => {
      console.log(BuiltinBinders);
      BuiltinBinders.html(target, "Hello world!");
      expect(target.innerHTML).to.equal("Hello world!");
    });

    it("is registered with the default builder", () => {
      expect(builder.binders.resolve("html")).to.equal(BuiltinBinders.html);
    });
  });

  describe(".attributeFactory", () => {
    let fooBinder: Binder;
    beforeEach(() => {
      fooBinder = BuiltinBinders.attributeFactory("foo");
    });

    it("sets the desired attribute to a string value", () => {
      fooBinder(target, "bar");
      expect(target.getAttribute("foo")).to.equal("bar");
    });

    it("sets the attribute correctly when true", () => {
      fooBinder(target, true);
      expect(target.getAttribute("foo")).to.equal("foo");
    });

    it("removes the attribute when false", () => {
      target.setAttribute("foo", "bar");
      fooBinder(target, false);
      expect(target.hasAttribute("foo")).to.equal(false);
    });
  });
});
