import { expect } from "chai";

import { Filter, FilterRegistry } from "../src/filters";

describe("FilterRegistry", () => {
  let filters: FilterRegistry;
  const negateFilter: Filter = (value) => { return !value; };

  beforeEach(() => {
    filters = new FilterRegistry();
    filters.add("negate", negateFilter);
  });

  describe("#resolve", () => {
    it("returns a registered filter", () => {
      expect(filters.resolve("negate")).to.equal(negateFilter);
    });
    it("throws RangeError when a filter is not found", () => {
      expect(() => filters.resolve("noSuchFilter")).to.throw(
          RangeError, 'Filter "noSuchFilter" not found');
    });
  });

  describe("#add", () => {
    it("registers a new filter", () => {
      const nullFilter: Filter = (value) => { return value; };
      filters.add("null", nullFilter);
      expect(filters.resolve("null")).to.equal(nullFilter);
    });
    it("throws RangeError on name reuse", () => {
      const nullFilter: Filter = (value) => { return value; };
      expect(() => filters.add("negate", nullFilter)).to.throw(
          RangeError, ' filter named "negate" was already registered');
    });
  });
});
