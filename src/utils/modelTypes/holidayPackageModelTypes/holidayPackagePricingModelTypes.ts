export type PriceForType = "AGENT" | "B2C";
export type HolidayPriceMarkupType = "FLAT" | "PER";

export interface IInsertHolidayPackagePricingPayload {
  holiday_package_id: number;
  price_for: PriceForType;
  adult_price: number;
  child_price?: number;
  markup_price?: number;
  markup_type?: HolidayPriceMarkupType;
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
  markup_price: number;
  markup_type: HolidayPriceMarkupType | null;
  created_at: Date;
}

export interface IUpdateHolidayPackagePricingPayload {
  adult_price?: number;
  child_price?: number;
  markup_price?: number;
  markup_type?: HolidayPriceMarkupType | null;
}
