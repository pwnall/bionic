import { Template } from "./template";

/** A template instance. */
export class View<ContextType> {
  /** True when the model was bound. */
  private bound: boolean;
  /** The DOM elements */
  private boundElements: Array<Element>;
  /** The DOM element whose contents will be set to this view's DOM tree. */
  private container: Element;
  /** The bindings . */
  private context: ContextType;
  /** The DOM tree created by copying the template's DocumentFragment. */
  private domRoot: DocumentFragment;
  /** The template instantiated by this view. */
  private template: Template;

  /** Instantiates a template. */
  public constructor(
      template: Template, container: Element, bindingContext: ContextType) {
    this.container = container;
    this.template = template;
    this.context = bindingContext;
    this.domRoot = template.instantiateFor(container);
    this.boundElements = template.extractBoundElements(this.domRoot);
  }

  public render(): void {
    return;
  }

  public bind(): void {
    if (this.bound) {
      return;
    }
    this.bound = true;

    // This is the most performance-sensitive part of the whole module. It is
    // the only loop that iterates more than O(1) times per view.
    for (let i: number = 0; i < this.boundElements.length; ++i) {
      return;
    }
  }

  public updateAll(): void {
    return;
  }
}
