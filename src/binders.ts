/** Performs an action in response to a change in observed data. */
export type Binder = (target: Element, value: any) => void;

/** Creates a dynamically matched binder. */
export type BinderFactory = (suffix: string) => Binder;

/** Used internally to represent a dynamically matched binder. */
type DynamicBinder = [string, BinderFactory];

/** Resolves names to binders. */
export class BinderRegistry {
  /** Maps static names to binders. */
  private binders: Map<string, Binder>;
  /** List of binder factories, in resolution order. */
  private factories: Array<DynamicBinder>;

  /** Creates an empty registry. */
  public constructor() {
    // See FilterRegistry for Map compatibility.
    this.binders = new Map<string, Binder>();
    this.factories = [];
  }

  /**
   * Sort comparator for DynamicBinder instances that orders by specificity.
   *
   * This sorts the instances in descending order of their prefixes' lengths.
   * More specific prefixes like "class-name-" will get matched before less
   * specific prefixes like "class-" and "" (catch-all).
   */
  private static dynamicBinderComparator(
      a: DynamicBinder, b: DynamicBinder): number {
    return b[0].length - a[0].length;
  }

  /** Registers a statically named binder. */
  public add(name: string, binder: Binder): void {
    // See FilterRegistry for Map compatibility.
    if (this.binders.has(name)) {
      throw new RangeError(`Binder "${name}" already registered`);
    }
    this.binders.set(name, binder);
  }

  /** Registers a binder factory for all names starting with a prefix. */
  public addPrefix(prefix: string, binderFactory: BinderFactory): void {
    for (let i: number = 0; i < this.factories.length; ++i) {
      if (this.factories[i][0] === prefix) {
        throw new RangeError(
            `Binder factory for prefix "${prefix}" already registered`);
      }
    }
    this.factories.push([prefix, binderFactory]);
    this.factories.sort(BinderRegistry.dynamicBinderComparator);
  }

  /** Looks up a filter in this registry. */
  public resolve(name: string): Binder {
    // See FilterRegistry for Map compatibility.
    const staticBinder: Binder = this.binders.get(name);
    if (staticBinder !== undefined) {
      return staticBinder;
    }

    for (let i: number = 0; i < this.factories.length; ++i) {
      const dynamicBinder: DynamicBinder = this.factories[i];
      const prefix: string = dynamicBinder[0];

      if (name.substring(0, prefix.length) === prefix) {
        const suffix: string = name.substring(prefix.length);
        return dynamicBinder[1](suffix);
      }
    }

    throw new RangeError(`Binder "${name}" not found`);
  }
}
