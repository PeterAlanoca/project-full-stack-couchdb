export abstract class UniqueId {
  protected constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  equals(other: UniqueId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static generateCouchId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}::${timestamp}-${random}`;
  }
}
