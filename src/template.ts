import { Binding } from "./binding";

/** Compiled from a template string, used to create views. */
export class Template {
  /** All the bindings in this template. */
  public bindings: Array<Binding>;

  /** The DOM tree instantiated by this template. */
  public fragment: DocumentFragment;

  /**
   * The class used to identify elements with data bindings.
   *
   * This class is removed from the elements right after the template is
   * instantiated, so it can be considered an implementation detail. As long as
   * application code does not use the class name, it will not observe the
   * class being added and removed.
   */
  private bindingClass: string;

  /**
   * Constructor exposed to facilitate custom builders.
   *
   * Most applications should use the Builder class instead of creating Binding
   * instances directly.
   */
  public constructor(
      fragment: DocumentFragment, bindings: Array<Binding>,
      bindingClass: string) {
    this.fragment = fragment;
    this.bindings = bindings;
  }

  /**
   * Collects the DOM elements that have bindings associated to them.
   *
   * This should be called on each DOM tree created by instantiating this
   * template's DocumentFragment, before the DOM tree is inserted into its host
   * document.
   */
  public extractBoundElements(fragment: Element): Array<Element> {
    // tslint:disable:max-line-length
    // http://developer.mozilla.org/docs/Web/API/Document/getElementsByClassName
    // tslint:enable:max-line-length
    const boundElementList: NodeListOf<Element> =
        fragment.getElementsByClassName(this.bindingClass);

    // We need to copy the elements into an array because
    // Document#getElementsByClassName returns a live HTMLCollection. As we
    // remove the bindings class name from the elements, they will leave the
    // collection. Bonus: we don't have to deal with the janky surrogates that
    // DOM provides for JS arrays.
    const boundElements: Array<Element> = Array.prototype.slice.call(
        boundElementList);

    for (let i: number = 0; i < boundElements.length; ++i) {
      // Element#classList and DOMTokenList#remove() are standardized in DOM 4,
      // and supported by IE 10 and above.
      // http://developer.mozilla.org/docs/Web/API/Element/classList
      // http://developer.mozilla.org/docs/Web/API/DOMTokenList
      // http://caniuse.com/#feat=classlist
      boundElements[i].classList.remove(this.bindingClass);
    }

    return boundElements;
  }

  /**
   * Creates an instance of this template's DocumentFragment.
   *
   * The result is a DOM tree that can be hosted by a given element. The caller
   * should use extractBoundElements() before attaching the DOM tree to its
   * host element.
   */
  public instantiateFor(host: Element): Element {
    // Document#importNode(node, deep) is standardized in DOM2, and supported
    // by IE 9 and above.
    // http://developer.mozilla.org/docs/Web/API/Document/importNode
    return host.ownerDocument.importNode(this.fragment, true) as Element;
  }
}
