export class Oscar {
  private constructor(
    private readonly _category: string,
    private readonly _year: number,
    private readonly _won: boolean,
  ) {}

  static create(category: string, year: number, won: boolean): Oscar {
    if (!category || category.trim().length === 0) {
      throw new Error('Oscar category cannot be empty.');
    }
    if (year < 1929) {
      throw new Error(`Invalid Oscar year: ${year}. Awards started in 1929.`);
    }
    return new Oscar(category.trim(), year, won);
  }

  get category(): string {
    return this._category;
  }

  get year(): number {
    return this._year;
  }

  get won(): boolean {
    return this._won;
  }

  toPlain(): { category: string; year: number; won: boolean } {
    return { category: this._category, year: this._year, won: this._won };
  }
}
