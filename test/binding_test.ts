import { expect } from "chai";

import { Adapter } from "../src/adapters";
import { Binding } from "../src/binding";
import { Binder } from "../src/binders";
import { Formatter } from "../src/formatters";

describe("Binding", () => {
  const dotAdapter: Adapter = (propertyName) => {
    return {
      get: (modelNode: any): any => modelNode[propertyName],
      observe: (modelNode: any): void => { return; },
    };
  };
  const textBinder: Binder = (target, value) => {
    target.textContent = value;
  };
  const negateFormatter: Formatter = (value) => { return !value; };
  const nullFormatter: Formatter = (value) => { return null; };
  const upperFormatter: Formatter = (value) => {
    return value.toString().toUpperCase();
  };

  describe("#update", () => {
    let div: HTMLElement;
    beforeEach(() => {
      div = document.createElement("div");
    });
    const model: any = {
      bar: { foo: "barr" },
      baz: { bar: { foo: "bazz" } },
      foo: "fooo",
    };

    it("handles one adapter", () => {
      const binding: Binding = new Binding(
          42, [dotAdapter("foo")], [], textBinder);
      binding.update(div, model);
      expect(div.textContent).to.equal("fooo");
    });
    it("handles two adapters", () => {
      const binding: Binding = new Binding(
          42, [dotAdapter("bar"), dotAdapter("foo")], [], textBinder);
      binding.update(div, model);
      expect(div.textContent).to.equal("barr");
    });
    it("handles three adapters", () => {
      const binding: Binding = new Binding(
          42, [dotAdapter("baz"), dotAdapter("bar"), dotAdapter("foo")], [],
          textBinder);
      binding.update(div, model);
      expect(div.textContent).to.equal("bazz");
    });

    it("handles one formatter", () => {
      const binding: Binding = new Binding(
          42, [dotAdapter("baz"), dotAdapter("bar"), dotAdapter("foo")],
          [upperFormatter], textBinder);
      binding.update(div, model);
      expect(div.textContent).to.equal("BAZZ");
    });
    it("handles two formatters", () => {
      const binding: Binding = new Binding(
          42, [dotAdapter("baz"), dotAdapter("bar"), dotAdapter("foo")],
          [negateFormatter, upperFormatter], textBinder);
      binding.update(div, model);
      expect(div.textContent).to.equal("FALSE");
    });
    it("handles one formatter", () => {
      const binding: Binding = new Binding(
          42, [dotAdapter("baz"), dotAdapter("bar"), dotAdapter("foo")],
          [nullFormatter, negateFormatter, upperFormatter], textBinder);
      binding.update(div, model);
      expect(div.textContent).to.equal("TRUE");
    });

  });

});
