import { HOLIDAY_FOR_AGENT, HOLIDAY_FOR_AGENT_B2C, HOLIDAY_FOR_B2C, HOLIDAY_PRICE_MARKUP_FLAT, HOLIDAY_PRICE_MARKUP_PER } from "../../miscellaneous/holidayConstants";

export type PriceForType = typeof HOLIDAY_FOR_AGENT | typeof HOLIDAY_FOR_B2C | typeof HOLIDAY_FOR_AGENT_B2C;
export type HolidayPriceMarkupType = typeof HOLIDAY_PRICE_MARKUP_FLAT | typeof HOLIDAY_PRICE_MARKUP_PER;

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
