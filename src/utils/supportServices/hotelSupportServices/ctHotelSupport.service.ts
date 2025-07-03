import { Knex } from 'knex';
import AbstractServices from '../../../abstract/abstract.service';
import CTHotelRequests from '../../lib/hotel/ctHotelRequest';
import CTHotelAPIEndpoints from '../../miscellaneous/endpoints/ctHotelApiEndpoints';
import {
  ICTGetBalanceResponse,
  ICTHotelBookingPayload,
  ICTHotelGetBalanceData,
  ICTHotelRoomRecheckData,
  ICTHotelRoomRecheckResponse,
  ICTHotelRoomsResponse,
  ICTHotelSearchData,
  ICTHotelSearchLocationData,
  ICTHotelSearchPayload,
  ICTHotelSearchResponse,
  ICTHotelSearchResponseHotel,
  ICancellationPolicy,
} from '../../supportTypes/hotelTypes/ctHotelSupport.types';
import HotelMarkupsModel from '../../../models/dynamicFareRuleModel/hotelMarkupsModel';
import {
  MARKUP_MODE_INCREASE,
  MARKUP_TYPE_PER,
} from '../../miscellaneous/constants';
import DateTimeLib from '../../lib/dateTimeLib';

export class CTHotelSupportService extends AbstractServices {
  private trx: Knex.Transaction;
  private request = new CTHotelRequests();
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
  }

  // Get Balance
  public async GetBalance(): Promise<ICTHotelGetBalanceData> {
    const response = (await this.request.getRequest(
      CTHotelAPIEndpoints.GET_BALANCE
    )) as { success: boolean; message: string; data: ICTGetBalanceResponse };

    if (response.success) {
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  }

  // Search Location
  public async SearchLocation(
    filter: string
  ): Promise<ICTHotelSearchLocationData> {
    const response = await this.request.getRequest(
      `${CTHotelAPIEndpoints.SEARCH_LOCATION}?filter=${filter}`
    );

    if (response?.success) {
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  }

  // Hotel Search
  public async HotelSearch(
    payload: ICTHotelSearchPayload,
    markup_set: number
  ): Promise<false | ICTHotelSearchData> {
    const { code, destination, ...restBody } = payload;

    const response = (await this.request.postRequest(
      CTHotelAPIEndpoints.HOTEL_SEARCH,
      {
        ...restBody,
        code: `${destination === 'City' ? 'location' : 'hotel'}-${code}`,
      }
    )) as {
      success: boolean;
      message: string;
      data: ICTHotelSearchResponse;
    };

    if (!response.success) {
      return false;
    }

    const hotelMarkupModel = new HotelMarkupsModel(this.trx);

    const markupSet = await hotelMarkupModel.getHotelMarkup({
      markup_for: 'Book',
      set_id: markup_set,
      status: true,
    });

    if (!markupSet.length || markupSet[0].set_status === false) {
      return response.data;
    }

    const { hotels, ...restData } = response.data;

    if (!hotels) {
      return false;
    }

    const modifiedHotels: ICTHotelSearchResponseHotel[] = [];

    const { markup, mode, type } = markupSet[0];
    for (const hotel of hotels) {
      modifiedHotels.push({
        ...hotel,
        price_details: this.getMarkupPrice({
          prices: hotel.price_details,
          markup: { markup: Number(markup), mode, type },
        }),
      });
    }

    if (!modifiedHotels.length) {
      return false;
    }

    return {
      ...restData,
      hotels: modifiedHotels,
    };
  }

  public async HotelRooms(
    payload: { hcode: number; search_id: string },
    markup_set: number
  ): Promise<ICTHotelRoomsResponse[] | false> {
    const response = await this.request.postRequest(
      CTHotelAPIEndpoints.HOTEL_ROOMS,
      payload
    );

    if (!response.success) {
      return false;
    } else {
      if (response.data.success === false) {
        return false;
      } else {
        const hotels = response.data as ICTHotelRoomsResponse[];
        const hotelMarkupModel = new HotelMarkupsModel(this.trx);
        const markupSet = await hotelMarkupModel.getHotelMarkup({
          markup_for: 'Both',
          set_id: markup_set,
          status: true,
        });

        let bookMarkup: {
          markup: number;
          type: 'PER' | 'FLAT';
          mode: 'INCREASE' | 'DECREASE';
        } = {
          markup: 0,
          mode: MARKUP_MODE_INCREASE,
          type: MARKUP_TYPE_PER,
        };

        let cancelMarkup: {
          markup: number;
          type: 'PER' | 'FLAT';
          mode: 'INCREASE' | 'DECREASE';
        } = {
          markup: 0,
          mode: MARKUP_MODE_INCREASE,
          type: MARKUP_TYPE_PER,
        };

        for (const markup of markupSet) {
          if (markup.markup_for === 'Book') {
            bookMarkup = {
              markup: Number(markup.markup),
              mode: markup.mode,
              type: markup.type,
            };
          } else if (markup.markup_for === 'Cancel') {
            cancelMarkup = {
              markup: Number(markup.markup),
              mode: markup.mode,
              type: markup.type,
            };
          }
        }

        return hotels.map((hotel) => {
          const { cancellation_policy, price_details } = hotel;

          const modifiedPrice = this.getMarkupPrice({
            prices: price_details,
            markup: bookMarkup,
          });

          hotel.price_details = modifiedPrice;

          if (cancellation_policy) {
            const modifiedCancellationPolicy = this.getCancellationMarkupPrice({
              markup: cancelMarkup,
              cancellation_policy,
            });

            hotel.cancellation_policy = modifiedCancellationPolicy;
          }

          return hotel;
        });
      }
    }
  }

  public async HotelRecheck(
    payload: {
      search_id: string;
      nights: number;
      rooms: { rate_key: string; group_code: string }[];
    },
    markup_set: number
  ): Promise<ICTHotelRoomRecheckData | false> {
    const response = await this.request.postRequest(
      CTHotelAPIEndpoints.ROOM_RECHECK,
      payload
    );

    if (!response) {
      return false;
    }

    const RecheckHotel = response.data as ICTHotelRoomRecheckResponse;

    delete RecheckHotel.agency_fee;

    const hotelMarkupModel = new HotelMarkupsModel(this.trx);
    const markupSet = await hotelMarkupModel.getHotelMarkup({
      markup_for: 'Both',
      set_id: markup_set,
      status: true,
    });

    let bookMarkup: {
      markup: number;
      type: 'PER' | 'FLAT';
      mode: 'INCREASE' | 'DECREASE';
    } = {
      markup: 0,
      mode: MARKUP_MODE_INCREASE,
      type: MARKUP_TYPE_PER,
    };

    let cancelMarkup: {
      markup: number;
      type: 'PER' | 'FLAT';
      mode: 'INCREASE' | 'DECREASE';
    } = {
      markup: 0,
      mode: MARKUP_MODE_INCREASE,
      type: MARKUP_TYPE_PER,
    };

    for (const markup of markupSet) {
      if (markup.markup_for === 'Book') {
        bookMarkup = {
          markup: Number(markup.markup),
          mode: markup.mode,
          type: markup.type,
        };
      } else if (markup.markup_for === 'Cancel') {
        cancelMarkup = {
          markup: Number(markup.markup),
          mode: markup.mode,
          type: markup.type,
        };
      }
    }

    const { rates, fee, ...restData } = RecheckHotel;

    const price_details = this.getMarkupPrice({
      markup: bookMarkup,
      prices: {
        price: fee.fee,
        tax: fee.total_tax,
        total_price: fee.total_fee,
      },
    });

    const newRates = rates.map((rate) => {
      const newRate = this.getMarkupPrice({
        markup: bookMarkup,
        prices: rate.price_details,
      });
      delete rate.agency_price_details;

      if (rate.cancellation_policy) {
        rate.cancellation_policy = this.getCancellationMarkupPrice({
          markup: cancelMarkup,
          cancellation_policy: rate.cancellation_policy,
        });
      }

      rate.price_details = newRate;

      return rate;
    });

    return {
      ...restData,
      fee: price_details,
      rates: newRates,
      supplier_fee: {
        price: fee.fee,
        tax: fee.total_tax,
        total_price: fee.total_fee,
      },
      supplier_rates: rates,
    };
  }

  public async HotelBooking(
    payload: ICTHotelBookingPayload,
    markup_set: number
  ) {
    const formData = new FormData();

    Object.keys(payload).forEach((key) => {
      if (key === 'booking_items') {
        formData.append(key, JSON.stringify(payload[key]));
      } else if (key === 'holder') {
        formData.append(key, JSON.stringify(payload[key]));
      } else {
        formData.append(
          key,
          payload[key as keyof ICTHotelBookingPayload] as any
        );
      }
    });

    const response = await this.request.postRequestFormData(
      CTHotelAPIEndpoints.HOTEL_BOOK,
      formData
    );

    if (!response.success) {
      return false;
    }

    const bookingData = response.data;

    return bookingData;
  }

  // get markup price func
  private getMarkupPrice({
    prices,
    markup,
  }: {
    markup: {
      markup: number;
      type: 'PER' | 'FLAT';
      mode: 'INCREASE' | 'DECREASE';
    };
    prices: {
      price: number;
      tax: number;
      total_price: number;
    };
  }): {
    price: number;
    tax: number;
    total_price: number;
  } {
    let tax = Number(prices.tax);
    let main_price = Number(prices.price);

    let amount = main_price;

    if (markup.markup > 0) {
      if (markup.type === MARKUP_TYPE_PER) {
        if (markup.mode === MARKUP_MODE_INCREASE) {
          amount = Math.ceil((main_price * markup.markup) / 100);
          amount = main_price + amount;
        } else {
          amount = Math.ceil((main_price * markup.markup) / 100);
          amount = main_price - amount;
        }
      } else {
        if (markup.mode === MARKUP_MODE_INCREASE) {
          amount = main_price + markup.markup;
        } else {
          amount = main_price - markup.markup;
        }
      }
    }

    return {
      price: amount,
      tax: tax,
      total_price: amount + tax,
    };
  }

  private getCancellationMarkupPrice({
    markup,
    cancellation_policy,
  }: {
    markup: {
      markup: number;
      type: 'PER' | 'FLAT';
      mode: 'INCREASE' | 'DECREASE';
    };
    cancellation_policy: ICancellationPolicy;
  }) {
    const { no_show_fee, details, ...policy } = cancellation_policy;

    let modified_no_show_fee = no_show_fee;
    if (markup.markup > 0) {
      if (markup.type === MARKUP_TYPE_PER) {
        if (markup.mode === MARKUP_MODE_INCREASE) {
          modified_no_show_fee = Math.ceil((no_show_fee * markup.markup) / 100);
          modified_no_show_fee = no_show_fee + modified_no_show_fee;
        } else {
          modified_no_show_fee = Math.ceil((no_show_fee * markup.markup) / 100);
          modified_no_show_fee = no_show_fee - modified_no_show_fee;
        }
      } else {
        if (markup.mode === MARKUP_MODE_INCREASE) {
          modified_no_show_fee = no_show_fee + markup.markup;
        } else {
          modified_no_show_fee = no_show_fee - markup.markup;
        }
      }
    }

    const modifiedDetails = details.map((detail) => {
      let modified_fee = detail.fee;
      if (markup.markup > 0) {
        if (markup.type === MARKUP_TYPE_PER) {
          if (markup.mode === MARKUP_MODE_INCREASE) {
            modified_fee = Math.ceil((detail.fee * markup.markup) / 100);
            modified_fee = detail.fee + modified_fee;
          } else {
            modified_fee = Math.ceil((detail.fee * markup.markup) / 100);
            modified_fee = detail.fee - modified_fee;
          }
        } else {
          if (markup.mode === MARKUP_MODE_INCREASE) {
            modified_fee = detail.fee + markup.markup;
          } else {
            modified_fee = detail.fee - markup.markup;
          }
        }
      }

      return { ...detail, fee: modified_fee };
    });

    return {
      no_show_fee: modified_no_show_fee,
      details: modifiedDetails,
      ...policy,
    };
  }
}
