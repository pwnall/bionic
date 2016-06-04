import { expect } from "chai";

import { Binder, BinderFactory, BinderRegistry } from "../src/binders";

describe("BinderRegistry", () => {
  let binders: BinderRegistry;
  let testTarget: Element;
  const nullBinder: Binder = (target, value) => { return; };
  const logBinder: Binder = (target, value) => {
    target.setAttribute("log", value);
  };
  const classBinderFactory: BinderFactory = (suffix) => {
    return (target, value): void => {
      if (value) {
        target.classList.add(suffix);
      } else {
        target.classList.remove(suffix);
      }
    };
  };

  beforeEach(() => {
    testTarget = document.createElement("div");
    binders = new BinderRegistry();
    binders.add("log", logBinder);
    binders.addPrefix("class-", classBinderFactory);
  });

  describe("#resolve", () => {
    it("returns a registered static binder", () => {
      expect(binders.resolve("log")).to.equal(logBinder);
    });

    it("instantiates a registered binder factory", () => {
      const binder: Binder = binders.resolve("class-bionic-view");
      expect(testTarget.classList.contains("bionic-view")).to.be.false;
      binder(testTarget, true);
      expect(testTarget.classList.contains("bionic-view")).to.be.true;
    });

    it("prioritizes statically named binders over factories", () => {
      binders.add("class-bionic-view", nullBinder);
      expect(binders.resolve("class-bionic-view")).to.equal(nullBinder);
    });

    it("prioritizes longer fatctory prefixes over shorter ones", () => {
      const classValueBinderFactory: BinderFactory = (suffix) => {
        return (target: Element, value: string): void => {
          if (value) {
            target.setAttribute("class", suffix);
          } else {
            target.setAttribute("class", "");
          }
        };
      };
      binders.addPrefix("class-value-", classValueBinderFactory);

      const binder: Binder = binders.resolve("class-value-bionic-view");
      expect(testTarget.classList.contains("bionic-view")).to.be.false;
      testTarget.classList.add("bionic-view-extra");
      binder(testTarget, true);
      expect(testTarget.classList.contains("bionic-view")).to.be.true;
      expect(testTarget.classList.contains("bionic-view-extra")).to.be.false;
    });

    it("throws RangeError when a binder is not found", () => {
      expect(() => binders.resolve("noSuchBinder")).to.throw(
          RangeError, 'Binder "noSuchBinder" not found');
    });
  });

  describe("#add", () => {
    it("registers a new static binder", () => {
      binders.add("null", nullBinder);
      expect(binders.resolve("null")).to.equal(nullBinder);
    });
    it("throws RangeError on name reuse", () => {
      expect(() => binders.add("log", nullBinder)).to.throw(
          RangeError, 'Binder "log" already registered');
    });
  });

  describe("#addPrefix", () => {
    const attributeBinderFactory: BinderFactory = (suffix) => {
      return (target: Element, value: string): void => {
        target.setAttribute(suffix, value);
      };
    };

    it("registers a new binder factory", () => {
      binders.addPrefix("", attributeBinderFactory);

      const binder: Binder = binders.resolve("view-type");
      expect(testTarget.getAttribute("view-type")).to.be.null;
      binder(testTarget, "bionic");
      expect(testTarget.getAttribute("view-type")).to.equal("bionic");
    });

    it("throws RangeError on prefix reuse", () => {
      expect(() => binders.addPrefix("class-", attributeBinderFactory)).to.
          throw(
          RangeError,
          'Binder factory for prefix "class-" already registered');
    });
  });
});
