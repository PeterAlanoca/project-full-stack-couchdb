import { BusinessRules } from '../../../config/domain/entities/business-rules.entity.js';
import { RentalItem } from '../entities/rental.entity.js';

/**
 * PricingDomainService
 * Core domain service responsible for computing rental pricing and volume discounts.
 * Reads rules dynamically from BusinessRules document — never hardcoded.
 *
 * This is one of the 5 Complex Problems: dynamic pricing without hardcoding.
 */
export class PricingDomainService {
  /**
   * Calculates complete pricing breakdown for a rental.
   * @throws Error if any item exceeds maxRentalDays or has invalid days configuration.
   */
  static calculateRentalPricing(
    items: Array<{ movieId: string; movieTitle: string; copyId: string; days: number }>,
    rules: BusinessRules,
  ): {
    items: RentalItem[];
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    total: number;
  } {
    // Validate days for each item
    for (const item of items) {
      if (item.days > rules.maxRentalDays) {
        throw new Error(
          `Rental days (${item.days}) for "${item.movieTitle}" exceed the maximum allowed (${rules.maxRentalDays}).`,
        );
      }
      if (item.days < 1) {
        throw new Error(`Rental days must be at least 1.`);
      }
      const price = rules.getPriceForDays(item.days);
      if (price === null) {
        throw new Error(
          `No pricing configured for ${item.days} day(s). Please update business rules.`,
        );
      }
    }

    // Build priced items
    const pricedItems: RentalItem[] = items.map((item) => ({
      copyId: item.copyId,
      movieId: item.movieId,
      movieTitle: item.movieTitle,
      days: item.days,
      pricePerRental: rules.getPriceForDays(item.days)!,
    }));

    const subtotal = pricedItems.reduce((sum, i) => sum + i.pricePerRental, 0);
    const discountPercent = rules.getDiscountPercent(items.length);
    const discountAmount = parseFloat(
      ((subtotal * discountPercent) / 100).toFixed(2),
    );
    const total = parseFloat((subtotal - discountAmount).toFixed(2));

    return { items: pricedItems, subtotal, discountPercent, discountAmount, total };
  }
}
