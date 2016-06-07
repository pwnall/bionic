import { Binder, BinderRegistry } from "./binders";
import { Binding } from "./binding";
import { Formatter, FormatterRegistry } from "./formatters";
import { Template } from "./template";

/** Builds templates from strings. */
export class Builder {
  /** The prefix used in templates to tag attributes that describe bindings. */
  public bindingPrefix: string = "rv-";
  /**
   * The binding class name used by templates created by this builder.
   *
   * See Template#bindingClass.
   */
  public bindingClass: string = "bionic-3pskthefgrswc";
  /** The regiistry used to resolve the binders specified in the template. */
  public binders: BinderRegistry = new BinderRegistry();
  /** The registry used to resolve the formatters specified in the template. */
  public formatters: FormatterRegistry = new FormatterRegistry();

  /** Sort comparator for BindingAttribute instances that orders by name. */
  public static attributeComparator(
      a: BindingAttribute, b: BindingAttribute): number {
    // Names are compared using a standard lexicograpical comparison instead of
    // the usual String#localeCompare() by design. This comparator determines
    // the order in which bindings are executed, and it would be undesirable to
    // have this order depend on the user's locale settings.
    return (a.name === b.name) ? 0 : ((a.name > b.name) ? 1 : -1);
  };

  /** Parses template text into a DOM tree. */
  public static parse(templateText: string): DocumentFragment {
    // This can probably be polyfilled by Document#createDocumentFragment() and
    // by assigning to documentFragment.innerHTML instead of parsing. This
    // approach would be supported back to IE 6.
    // tslint:disable:max-line-length
    // http://developer.mozilla.org/docs/Web/API/Document/createDocumentFragment
    // tslint:enable:max-line-length

    // Document#createRange() is standardized in DOM Level 2 and supported by
    // IE 9 and above.
    // http://caniuse.com/#feat=dom-range
    // http://developer.mozilla.org/docs/Web/API/Range
    const range: Range = document.createRange();

    // Range#createContextualFragment is not yet standardized and is supported
    // by IE 11 and above.
    // http://developer.mozilla.org/docs/Web/API/Range/createContextualFragment
    return range.createContextualFragment(templateText);
  };

  /** Finds the attributes that specify bindings for an element. */
  public bindingAttributes(element: Element): Array<BindingAttribute> {
    const attributes: Array<BindingAttribute> = [];

    // Element#attributes is standardized in DOM 1, and is supported by IE 5.5
    // and up. The attributes may not be returned in source order. This is OK
    // because attributes are sorted by name below.
    // http://developer.mozilla.org/docs/Web/API/Element/attributes
    // http://quirksmode.org/dom/core/#attributes
    const attributeList: NamedNodeMap = element.attributes;

    for (let i: number = 0; i < attributeList.length; ++i) {
      const domAttribute: Attr = attributeList[i];
      const name: string = domAttribute.name;
      if (name.substring(0, this.bindingPrefix.length) ===
          this.bindingPrefix) {
        attributes.push({
          domAttribute: domAttribute,
          name: name.substring(this.bindingPrefix.length),
          value: domAttribute.value,
        });
      }
    }

    // Array#sort() with a comparator is standardized in ES 1 and supported by
    // IE 5.5 and above.
    // tslint:disable:max-line-length
    // http://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    // tslint:enable:max-line-length
    attributes.sort(Builder.attributeComparator);
    return attributes;
  };

  /** Creates the binding specified by a template attribute. */
  public bindingFor(
      attribute: BindingAttribute, elementIndex: number): Binding {
    const binder: Binder = this.binders.resolve(attribute.name);

    const valueSegments: Array<string> = attribute.value.split("|");
    const dataPath: string = valueSegments[0].trim();
    const formatterChain: Array<Formatter> = [];
    for (let i: number = 1; i < valueSegments.length; ++i) {
      const formatterName: string = valueSegments[i].trim();
      formatterChain.push(this.formatters.resolve(formatterName));
    }

    return new Binding(elementIndex, dataPath, formatterChain, binder);
  };

  /**
   * Creates a Template from a string representation.
   *
   * This is the class' central method.
   */
  public build(templateText: string): Template {
    const fragment: DocumentFragment = Builder.parse(templateText);
    const bindings: Array<Binding> = this.extractBindings(fragment);
    return new Template(fragment, bindings, this.bindingClass);
  }

  /** Removes binding attributes and tags the elements that contain them. */
  public extractBindings(fragment: DocumentFragment): Array<Binding> {
    const bindings: Array<Binding> = [];
    let nextElementIndex: number = 0;  // See Binding#elementIndex.

    // Document#createTreeWalker() is standardized in DOM2 Traversal and Range,
    // and supported by IE 9 and above.
    // http://developer.mozilla.org/docs/Web/API/Document/createTreeWalker
    const walker: TreeWalker = document.createTreeWalker(
        fragment, NodeFilter.SHOW_ELEMENT, null, false);

    while (true) {
      // TreeWalker#nextNode() is standardized in DOM2 Traversal and Range, and
      // supported by IE 9 and above.
      // http://developer.mozilla.org/docs/Web/API/TreeWalker/nextNode
      const element: Element = walker.nextNode() as Element;
      if (element === null) {
        break;
      }

      const attributes: Array<BindingAttribute> = this.bindingAttributes(
          element);
      if (attributes.length === 0) {
        continue;
      }

      const elementIndex: number = nextElementIndex;
      nextElementIndex += 1;

      for (let i: number = 0; i < attributes.length; ++i) {
        const attribute: BindingAttribute = attributes[i];
        bindings.push(this.bindingFor(attribute, elementIndex));
        element.removeAttributeNode(attribute.domAttribute);
      }

      // Element#classList and DOMTokenList#add() are standardized in DOM 4,
      // and supported by IE 10 and above.
      // http://developer.mozilla.org/docs/Web/API/Element/classList
      // http://developer.mozilla.org/docs/Web/API/DOMTokenList
      // http://caniuse.com/#feat=classlist
      element.classList.add(this.bindingClass);
    }
    return bindings;
  }
};

export interface BindingAttribute {
  domAttribute: Attr;
  name: string;
  value: string;
};

/**
 * A global template builder instance.
 *
 * Most application needs should be met by this instance.
 */
export const builder: Builder = new Builder();
