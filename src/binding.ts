import { Binder } from "./binders";
import { Filter } from "./filters";

/** Connects a DOM property to a piece of data (model attribute). */
export class Binding {
  /**
   * All the elements that have bindings are tagged with a special class, so
   * they can be easily retrieved.
   */
  public elementIndex: number;

  /**
   * Identifies the piece of data observed by this binding.
   */
  public dataPath: string;

  /**
   * The chain of functions that transform the data observed by this binding.
   *
   * The first function in the chain receives the updated value of the model
   * attribute observed by this binding. The other functions receive the return
   * values of the functions that precede them in the chain. The return value
   * of the last value is passed into the DOM modification function.
   */
  public filterChain: Array<Filter>;

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
      elementIndex: number, dataPath: string, filterChain: Array<Filter>,
      binder: Binder) {
    this.elementIndex = elementIndex;
    this.dataPath = dataPath;
    this.filterChain = filterChain;
    this.binder = binder;
  }
};

/**
 * A chain of functions that transform the model value watched by a binding
 * before it is passed to the code that modifies the DOM.
 *
 */
export type FilterChain = Array<Filter>;
