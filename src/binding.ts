import { Binder } from "./binders";
import { Formatter } from "./formatters";
import { ModelPath } from "./adapters";

/** Connects a DOM property to a piece of data (model attribute). */
export class Binding {
  /**
   * All the elements that have bindings are tagged with a special class, so
   * they can be easily retrieved.
   */
  public elementIndex: number;

  /**
   * Points to the piece of data in a model observed by this binding.
   */
  public modelPath: ModelPath;

  /**
   * The chain of functions that transform the data observed by this binding.
   *
   * The first function in the chain receives the updated value of the model
   * attribute observed by this binding. The other functions receive the return
   * values of the functions that precede them in the chain. The return value
   * of the last value is passed into the DOM modification function.
   */
  public formatterChain: Array<Formatter>;

  /**
   * The binder performed when the data observed by this binding changes.
   */
  public binder: Binder;

  /**
   * Constructor exposed to facilitate custom builders.
   *
   * Most applications should use the Builder class instead of creating Binding
   * instances directly.
   */
  public constructor(
      elementIndex: number, modelPath: ModelPath,
      formatterChain: Array<Formatter>, binder: Binder) {
    this.elementIndex = elementIndex;
    this.modelPath = modelPath;
    this.formatterChain = formatterChain;
    this.binder = binder;
  }

  /** Obtains the binding value. */
  public update(target: Element, modelNode: any): void {
    // Navigate the model graph.
    for (let i: number = 0; i < this.modelPath.length; ++i) {
      modelNode = this.modelPath[i].get(modelNode);
    }
    let value: any = modelNode;

    // Navigate the formatter chain.
    for (let i: number = 0; i < this.formatterChain.length; ++i) {
      value = this.formatterChain[i](value);
    }

    this.binder(target, value);
  }
};

/**
 * A chain of functions that transform the model value watched by a binding
 * before it is passed to the code that modifies the DOM.
 *
 */
export type FormatterChain = Array<Formatter>;
