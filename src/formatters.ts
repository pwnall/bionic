/** Transforms observed data before it is provided to an binder. */
export type Formatter = (value: any) => any;

/** Resolves names to formatters. */
export class FormatterRegistry {
  /** Maps names to formatters. */
  private formatters: Map<string, Formatter>;

  /** Creates an empty registry. */
  public constructor() {
    // The Map constructor is standardized in ES 6, and supported by IE 11 and
    // up.
    // tslint:disable:max-line-length
    // http://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map
    // tslint:enable:max-line-length
    this.formatters = new Map<string, Formatter>();
  }

  /** Adds a formatter to this registry. */
  public add(name: string, formatter: Formatter): void {
    if (this.formatters.has(name)) {
      throw new RangeError(`Formatter named "${name}" was already registered`);
    }

    // Map#set() is standardized in ES 6, and supported by IE 11 and up.
    // tslint:disable:max-line-length
    // http://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/set
    // tslint:enable:max-line-length
    this.formatters.set(name, formatter);
  }

  /** Looks up a formatter in this registry. */
  public resolve(name: string): Formatter {
    // Map#get() is standardized in ES 6, and supported by IE 11 and up.
    // tslint:disable:max-line-length
    // http://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map/get
    // tslint:enable:max-line-length
    const formatter: Formatter = this.formatters.get(name);

    if (formatter === undefined) {
      throw new RangeError(`Formatter "${name}" not found`);
    }
    return formatter;
  }
}
