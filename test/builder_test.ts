import { expect } from "chai";

import { Binding } from "../src/binding";
import { Binder } from "../src/binders";
import { BindingAttribute, Builder, builder } from "../src/builder";
import { Filter } from "../src/filters";
import { Template } from "../src/template";

describe("buillder", () => {
  it("is a Builder", () => {
    expect(builder).to.be.an.instanceOf(Builder);
  });
});

describe("Builder", () => {
  describe(".parse", () => {
    let result: DocumentFragment;

    beforeEach(() => {
      result = Builder.parse(
          '<div class="klass"><span>Hello there</span></div><p>Hi</p>');
    });

    it("creates a DocumentFragment", () => {
      expect(result).to.be.an.instanceof(DocumentFragment);
    });

    it("parses the tempalte text correctly", () => {
      expect(result.firstChild).to.be.an.instanceOf(HTMLElement);
      const div: HTMLElement = result.firstChild as HTMLElement;
      expect(div.outerHTML).to.equal(
          '<div class="klass"><span>Hello there</span></div>');

      expect(result.lastChild).to.be.an.instanceOf(HTMLElement);
      const p: HTMLElement = result.lastChild as HTMLElement;
      expect(p.outerHTML).to.equal("<p>Hi</p>");
    });
  });

  const nullBinder: Binder = (target, value) => { return; };
  const fooBinder: Binder = (target, value) => { return; };
  const nullFilter: Filter = (value) => { return value; };
  const negateFilter: Filter = (value) => { return value; };
  const fooFilter: Filter = (value) => { return value; };
  let builder: Builder;
  beforeEach(() => {
    builder = new Builder();
    builder.bindingPrefix = "rv-";
    builder.bindingClass = "bionicBinding";
    builder.binders.add("null", nullBinder);
    builder.binders.add("foo", fooBinder);
    builder.filters.add("null", nullFilter);
    builder.filters.add("negate", negateFilter);
    builder.filters.add("foo", fooFilter);
  });

  describe("#bindingAttributes", () => {
    let emptyElement: Element;
    let classElement: Element;
    let multiElement: Element;
    beforeEach(() => {
      const fragment: DocumentFragment = Builder.parse(
        '<div class="empty"></div>' +
        '<div rv-class-empty="model:isEmpty"></div>' +
        '<div rv-foo="m:foo" rv-bar="m:bar" rv-baz="m:baz"></div>'
      );
      emptyElement = fragment.childNodes[0] as Element;
      classElement = fragment.childNodes[1] as Element;
      multiElement = fragment.childNodes[2] as Element;
    });

    it("returns an empty array for a static element", () => {
      const attributes: Array<BindingAttribute> = builder.bindingAttributes(
          emptyElement);
      expect(attributes.length).to.equal(0);
    });

    it("parses an attribute correctly", () => {
      const attributes: Array<BindingAttribute> = builder.bindingAttributes(
          classElement);
      expect(attributes.length).to.equal(1);

      expect(attributes[0]).to.have.property("name", "class-empty");
      expect(attributes[0]).to.have.property("value", "model:isEmpty");
      expect(attributes[0]).to.have.property(
          "domAttribute", classElement.attributes[0]);
    });

    it("orders three attributes correctly", () => {
      const attributes: Array<BindingAttribute> = builder.bindingAttributes(
          multiElement);
      expect(attributes.length).to.equal(3);

      // Array#map() is standardized in ES5.1 and supported in IE9 and above.
      // It is reported to be slower than Underscore's map, but we don't care
      // about that in tests.
      // tslint:disable:max-line-length
      // http://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map
      // tslint:enable:max-line-length
      expect(attributes.map((attribute) => attribute.name)).to.deep.equal(
          ["bar", "baz", "foo"]);
      expect(attributes.map((attribute) => attribute.value)).to.deep.equal(
          ["m:bar", "m:baz", "m:foo"]);
    });
  });

  describe("#bindingFor", () => {
    let filterlessAttr: BindingAttribute;
    let filterAttr: BindingAttribute;
    let multiFilterAttr: BindingAttribute;
    beforeEach(() => {
      const fragment: DocumentFragment = Builder.parse(
        '<div rv-null="model:isNull"></div>' +
        '<div rv-null="model.path | negate"></div>' +
        '<div rv-null="model.path|negate | null | foo"></div>'
      );
      filterlessAttr =
          builder.bindingAttributes(fragment.childNodes[0] as Element)[0];
      filterAttr =
          builder.bindingAttributes(fragment.childNodes[1] as Element)[0];
      multiFilterAttr =
          builder.bindingAttributes(fragment.childNodes[2] as Element)[0];
    });

    it("builds a filter-less element correctly", () => {
      const binding: Binding = builder.bindingFor(filterlessAttr, 42);
      expect(binding.elementIndex).to.equal(42);
      expect(binding.binder).to.equal(nullBinder);
      expect(binding.dataPath).to.equal("model:isNull");
      expect(binding.filterChain).to.deep.equal([]);
    });

    it("builds a one-filter element correctly", () => {
      const binding: Binding = builder.bindingFor(filterAttr, 42);
      expect(binding.elementIndex).to.equal(42);
      expect(binding.binder).to.equal(nullBinder);
      expect(binding.dataPath).to.equal("model.path");
      expect(binding.filterChain).to.deep.equal([negateFilter]);
    });

    it("builds a multi-filter element correctly", () => {
      const binding: Binding = builder.bindingFor(multiFilterAttr, 42);
      expect(binding.elementIndex).to.equal(42);
      expect(binding.binder).to.equal(nullBinder);
      expect(binding.dataPath).to.equal("model.path");
      expect(binding.filterChain).to.deep.equal(
          [negateFilter, nullFilter, fooFilter]);
    });
  });

  describe("#extractBindings", () => {
    let fragment: DocumentFragment;
    let div: HTMLElement;
    let bindings: Array<Binding>;
    beforeEach(() => {
      fragment = Builder.parse(
        '<div class="divClass" rv-null="model:isNull" data-foo="bar">' +
          '<p rv-foo="model.path" rv-null="model:pIsNull">' +
            "Hello world" +
          "</p>" +
          "<!-- Comment -->" +
        "</div>"
      );
      div = fragment.childNodes[0] as HTMLElement;
      bindings = builder.extractBindings(fragment);
    });

    it("removes binding attributes, adds binding class", () => {
      expect((div.childNodes[0] as HTMLElement).outerHTML).to.equal(
          '<p class="bionicBinding">Hello world</p>');
    });

    it("sets elementIndex correctly for bindings", () => {
      expect(bindings.map((binding) => binding.elementIndex)).to.deep.equal(
          [0, 1, 1]);
    });

    it("does not modify non-binding attributes", () => {
      expect(div.getAttribute("data-foo")).to.equal("bar");
      expect(div.getAttribute("rv-null")).to.equal(null);
    });

    it("does not remove non-binding classes", () => {
      expect(div.classList.contains("divClass")).to.be.true;
      expect(div.classList.contains("bionicBinding")).to.be.true;
    });
  });

  describe ("#build", () => {
    let template: Template;
    beforeEach(() => {
      template = builder.build(
        '<div class="divClass" rv-null="model:isNull" data-foo="bar">' +
          '<p rv-foo="model.path" rv-null="model:pIsNull">' +
            "Hello world" +
          "</p>" +
          "<!-- Comment -->" +
        "</div>"
      );
    });
    it("creates a template", () => {
      expect(template).to.be.an.instanceOf(Template);
    });
    it("parses the argument and extracts bindings", () => {
      const div: HTMLElement = template.fragment.childNodes[0] as HTMLElement;
      expect(div.innerHTML).to.equal(
          '<p class="bionicBinding">Hello world</p><!-- Comment -->');

      expect(template.bindings.length).to.equal(3);
    });
  });
});
