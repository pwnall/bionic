import { expect } from "chai";

import { Adapter, AdapterRegistry, ModelPath } from "../src/adapters";

describe("AdapterRegistry", () => {
  let adapters: AdapterRegistry;
  const rootAdapter: Adapter = (propertyName) => {
    return {
      _propertyName: propertyName,
      get: (modelNode: any): any => modelNode[propertyName],
      observe: (modelNode: any): void => null,
    };
  };
  const nullAdapter: Adapter = (propertyName) => {
    return {
      _propertyName: propertyName,
      get: (modelNode: any): any => null,
      observe: (modelNode: any): void => null,
    };
  };

  beforeEach(() => {
    adapters = new AdapterRegistry();
    adapters.add("/", rootAdapter);
  });

  describe(".escapeOperator", () => {
    it("escapes \\ and ]", () => {
      expect(AdapterRegistry.escapeOperator("\\")).to.equal("\\\\");
      expect(AdapterRegistry.escapeOperator("]")).to.equal("\\]");
    });
    it("does not escape [ . a and +", () => {
      expect(AdapterRegistry.escapeOperator("[")).to.equal("[");
      expect(AdapterRegistry.escapeOperator(".")).to.equal(".");
      expect(AdapterRegistry.escapeOperator("a")).to.equal("a");
      expect(AdapterRegistry.escapeOperator("+")).to.equal("+");
    });
  });

  describe(".pathSplitter", () => {
    it("works for one operator", () => {
      expect(AdapterRegistry.pathSplitter(["a"])).to.deep.equal(/([a])/);
    });
    it("works for three operators", () => {
      expect(AdapterRegistry.pathSplitter(["a", ".", "+"])).to.deep.equal(
          /([a.+])/);
    });
    it("does not escape [ . a and +", () => {
      expect(AdapterRegistry.escapeOperator("[")).to.equal("[");
      expect(AdapterRegistry.escapeOperator(".")).to.equal(".");
      expect(AdapterRegistry.escapeOperator("a")).to.equal("a");
      expect(AdapterRegistry.escapeOperator("+")).to.equal("+");
    });
  });

  describe("#resolve", () => {
    it("returns a registered adapter", () => {
      expect(adapters.resolve("/")).to.equal(rootAdapter);
    });
    it("throws RangeError when a adapter is not found", () => {
      expect(() => adapters.resolve("@")).to.throw(
          RangeError, 'Operator "@" not found');
    });
  });

  describe("#add", () => {
    it("registers a new adapter", () => {
      adapters.add("#", nullAdapter);
      expect(adapters.resolve("#")).to.equal(nullAdapter);
    });
    it("throws RangeError on incorrect lengths", () => {
      expect(() => adapters.add("", nullAdapter)).to.throw(
          RangeError, 'Operator "" is not 1-character long');
      expect(() => adapters.add("##", nullAdapter)).to.throw(
          RangeError, 'Operator "##" is not 1-character long');
    });
    it("throws TypeError on incorrect types", () => {
      expect(() => (adapters as any).add(1, nullAdapter)).to.throw(
          TypeError, "Operators must be strings");
      expect(() => (adapters as any).add(true, nullAdapter)).to.throw(
          TypeError, "Operators must be strings");
      expect(() => (adapters as any).add({}, nullAdapter)).to.throw(
          TypeError, "Operators must be strings");
    });
    it("throws RangeError on name reuse", () => {
      expect(() => adapters.add("/", nullAdapter)).to.throw(
          RangeError, 'Operator "/" was already registered');
    });
  });

  describe("#parsePath", () => {
    const model: any = { bar: "barr", baz: "bazz", foo: "fooo" };

    beforeEach(() => {
      adapters.add("#", nullAdapter);
    });

    it("parses a 1-element path correctly", () => {
      const path: ModelPath = adapters.parsePath("foo");
      expect(path.length).to.equal(1);
      expect(path[0]).to.have.property("_propertyName", "foo");
      expect(path[0].get(model)).to.equal("fooo");
    });

    it("parses a 3-element path correctly", () => {
      const path: ModelPath = adapters.parsePath("foo/bar#baz");
      expect(path.length).to.equal(3);
      expect(path[0]).to.have.property("_propertyName", "foo");
      expect(path[0].get(model)).to.equal("fooo");
      expect(path[1]).to.have.property("_propertyName", "bar");
      expect(path[1].get(model)).to.equal("barr");
      expect(path[2]).to.have.property("_propertyName", "baz");
      expect(path[2].get(model)).to.equal(null);
    });
  });
});
