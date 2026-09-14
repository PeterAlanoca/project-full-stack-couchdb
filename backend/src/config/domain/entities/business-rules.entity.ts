export interface RentalPrice {
  days: number;
  priceBs: number;
}

export interface VolumeDiscount {
  minItems: number;
  maxItems: number | null;
  discountPercent: number;
}

export interface BusinessRulesProps {
  rentalPricing: RentalPrice[];
  volumeDiscounts: VolumeDiscount[];
  maxRentalDays: number;
  updatedAt: Date;
}

export class BusinessRules {
  static readonly DOCUMENT_ID = 'config::business_rules';

  private constructor(
    private readonly props: BusinessRulesProps,
    public readonly _rev?: string,
  ) {}

  static create(props: BusinessRulesProps): BusinessRules {
    return new BusinessRules(props);
  }

  static reconstitute(props: BusinessRulesProps, rev: string): BusinessRules {
    return new BusinessRules(props, rev);
  }

  static default(): BusinessRules {
    return new BusinessRules({
      rentalPricing: [
        { days: 1, priceBs: 2.0 },
        { days: 2, priceBs: 3.0 },
        { days: 3, priceBs: 4.0 },
        { days: 4, priceBs: 5.0 },
        { days: 5, priceBs: 6.0 },
      ],
      volumeDiscounts: [
        { minItems: 3, maxItems: 5, discountPercent: 5 },
        { minItems: 6, maxItems: null, discountPercent: 10 },
      ],
      maxRentalDays: 5,
      updatedAt: new Date(),
    });
  }

  get rentalPricing(): RentalPrice[] {
    return this.props.rentalPricing;
  }
  get volumeDiscounts(): VolumeDiscount[] {
    return this.props.volumeDiscounts;
  }
  get maxRentalDays(): number {
    return this.props.maxRentalDays;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** Returns the price in Bs. for the given number of days, or null if days exceed max. */
  getPriceForDays(days: number): number | null {
    const entry = this.props.rentalPricing.find((p) => p.days === days);
    return entry ? entry.priceBs : null;
  }

  /** Returns the discount percent for a given number of items (0 if no discount applies). */
  getDiscountPercent(itemCount: number): number {
    const match = this.props.volumeDiscounts
      .filter((d) => itemCount >= d.minItems)
      .sort((a, b) => b.minItems - a.minItems)[0];
    return match ? match.discountPercent : 0;
  }

  update(props: Omit<BusinessRulesProps, 'updatedAt'>): BusinessRules {
    return new BusinessRules({ ...props, updatedAt: new Date() }, this._rev);
  }
}
