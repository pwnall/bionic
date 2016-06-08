import { Binding } from "./binding";
import { Template } from "./template";

/** A template instance. */
export class View<ContextType> {
  /** True when the model was bound. */
  private bound: boolean;
  /** True when the view's DOM tree was added to the document. */
  private rendered: boolean;
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

    this.bound = false;
    this.rendered = false;
  }

  public render(): void {
    // Modifying live DOM trees is more expensive than modifying dead trees, so
    // we make sure that the view's DOM tree is bound before we add it to the
    // document.
    this.bind();

    if (this.rendered) {
      return;
    }
    this.rendered = true;
    this.container.appendChild(this.domRoot);
  }

  public bind(): void {
    if (this.bound) {
      return;
    }
    this.bound = true;

    const bindings: Array<Binding> = this.template.bindings;

    // This is a hot path. It iterates mode than O(1) per view.
    for (let i: number = 0; i < bindings.length; ++i) {
      const binding: Binding = bindings[i];
      const target: Element = this.boundElements[binding.elementIndex];
      binding.update(target, this.context);
    }
  }

  public unbind(): void {
    if (!this.bound) {
      return;
    }
    this.bound = false;
  }

  public updateAll(): void {
    const bindings: Array<Binding> = this.template.bindings;

    // This is a hot path. It iterates mode than O(1) per view.
    for (let i: number = 0; i < bindings.length; ++i) {
      const binding: Binding = bindings[i];
      const target: Element = this.boundElements[binding.elementIndex];
      binding.update(target, this.context);
    }
  }
}
