export type PriceForType = "AGENT" | "B2C";
export type HolidayPriceDiscountType = "FLAT" | "PER";

export interface IInsertHolidayPackagePricingPayload {
  holiday_package_id: number;
  price_for: PriceForType;
  adult_price: number;
  child_price?: number;
  discount_price?: number;
  discount_type?: HolidayPriceDiscountType;
}

export interface IGetHolidayPackagePricingListFilterQuery {
  holiday_package_id: number;
  price_for?: PriceForType;
}

export interface IGetHolidayPackagePricingList {
  id: number;
  holiday_package_id: number;
  price_for: PriceForType;
  adult_price: number;
  child_price: number | null;
  discount_price: number;
  discount_type: HolidayPriceDiscountType | null;
  created_at: Date;
}

export interface IUpdateHolidayPackagePricingPayload {
  adult_price?: number;
  child_price?: number;
  discount_price?: number;
  discount_type?: HolidayPriceDiscountType | null;
}
