/** Transforms observed data before it is provided to an binder. */
export type Filter = (value: any) => any;

/** Resolves names to filters. */
export class FilterRegistry {
  /** Maps names to filters. */
  private filters: Map<string, Filter>;

  /** Creates an empty registry. */
  public constructor() {
    // The Map constructor is standardized in ES 6, and supported by IE 11 and
    // up.
    // tslint:disable:max-line-length
    // http://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map
    // tslint:enable:max-line-length
    this.filters = new Map<string, Filter>();
  }

  /** Adds a filter to this registry. */
  public add(name: string, filter: Filter): void {
    if (this.filters.has(name)) {
      throw new RangeError(`A filter named "${name}" was already registered`);
    }

    // Map#set() is standardized in ES 6, and supported by IE 11 and up.
    // tslint:disable:max-line-length
    // http://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/set
    // tslint:enable:max-line-length
    this.filters.set(name, filter);
  }

  /** Looks up a filter in this registry. */
  public resolve(name: string): Filter {
    // Map#get() is standardized in ES 6, and supported by IE 11 and up.
    // tslint:disable:max-line-length
    // http://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/get
    // tslint:enable:max-line-length
    const filter: Filter = this.filters.get(name);

    if (filter === undefined) {
      throw new RangeError(`Filter "${name}" not found`);
    }
    return filter;
  }
}
