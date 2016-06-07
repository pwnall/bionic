import { expect } from "chai";

import { Formatter, FormatterRegistry } from "../src/formatters";

describe("FormatterRegistry", () => {
  let formatters: FormatterRegistry;
  const negateFormatter: Formatter = (value) => { return !value; };

  beforeEach(() => {
    formatters = new FormatterRegistry();
    formatters.add("negate", negateFormatter);
  });

  describe("#resolve", () => {
    it("returns a registered formatter", () => {
      expect(formatters.resolve("negate")).to.equal(negateFormatter);
    });
    it("throws RangeError when a formatter is not found", () => {
      expect(() => formatters.resolve("noSuchFormatter")).to.throw(
          RangeError, 'Formatter "noSuchFormatter" not found');
    });
  });

  describe("#add", () => {
    it("registers a new formatter", () => {
      const nullFormatter: Formatter = (value) => { return value; };
      formatters.add("null", nullFormatter);
      expect(formatters.resolve("null")).to.equal(nullFormatter);
    });
    it("throws RangeError on name reuse", () => {
      const nullFormatter: Formatter = (value) => { return value; };
      expect(() => formatters.add("negate", nullFormatter)).to.throw(
          RangeError, 'Formatter named "negate" was already registered');
    });
  });
});
