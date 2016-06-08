/** Knows how to navigate across an edge in the model's object graph. */
export interface ModelEdge {
  /** Retrieves the data across the edge. */
  get: (modelNode: any) => any;

  /** Subscribes to changes to the data across the edge. */
  observe: (modelNode: any) => void;
};

/** Creates an adapter instance. */
export type Adapter = (propertyName: string) => ModelEdge;

/** Points to an interesting piece of data in a model's graph. */
export type ModelPath = Array<ModelEdge>;

/** Resolves path operators (1-character strings) to adapters. */
export class AdapterRegistry {
  /** Maps path operators (1-character strings) to adapters. */
  private adapters: Map<string, Adapter>;

  /** List of RegExp-escaped adapter strings. */
  private escapedOperators: Array<string>;

  /** Breaks up a model path string into names and adapter strings. */
  private pathSplitter: RegExp;

  /** Creates an empty registry. */
  public constructor() {
    // See FormatterRegistry for Map compatibility.
    this.adapters = new Map<string, Adapter>();
    this.escapedOperators = [];
    this.pathSplitter = new RegExp("");
  }

  /** Escapes an operator for inclusion in a regular expression. */
  public static escapeOperator(operator: string): string {
    if (operator === "]" || operator === "\\") {
      operator = `\\${operator}`;
    }
    return operator;
  }

  /** RegExp that breaks up a path string into names and adapter strings. */
  public static pathSplitter(escapedOperators: Array<string>): RegExp {
    return new RegExp(`([${escapedOperators.join("")}])`);
  }

  /** Adds a model path adapter to this registry. */
  public add(operator: string, adapter: Adapter): void {
    if (typeof(operator) !== "string") {
      throw new TypeError("Operators must be strings");
    }
    if (operator.length !== 1) {
      throw new RangeError(`Operator "${operator}" is not 1-character long`);
    }
    if (this.adapters.has(operator)) {
      throw new RangeError(`Operator "${operator}" was already registered`);
    }

    this.adapters.set(operator, adapter);
    this.escapedOperators.push(
        AdapterRegistry.escapeOperator(operator));
    this.pathSplitter = AdapterRegistry.pathSplitter(this.escapedOperators);
  }

  /** Builds a ModelPath by parsing and compiling a string path. */
  public parsePath(modelPath: string): ModelPath {
    const strings: Array<string> = modelPath.split(this.pathSplitter);

    // The root operator is always "/".
    const rootAdapter: Adapter = this.resolve("/");
    // Split is guaranteed to return an array with at least one element.
    const firstPropertyName: string = strings[0];
    const path: ModelPath = [rootAdapter(firstPropertyName)];

    for (let i: number = 1; i < strings.length; i += 2) {
      const adapter: Adapter = this.resolve(strings[i]);
      const propertyName: string = strings[i + 1];
      path.push(adapter(propertyName));
    }

    return path;
  }

  /** Looks up a model path adapter in this registry. */
  public resolve(adapterString: string): Adapter {
    const factory: Adapter = this.adapters.get(adapterString);

    if (factory === undefined) {
      throw new RangeError(`Operator "${adapterString}" not found`);
    }
    return factory;
  }
};
