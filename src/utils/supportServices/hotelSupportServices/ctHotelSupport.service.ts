import { Knex } from 'knex';
import AbstractServices from '../../../abstract/abstract.service';
import CTHotelRequests from '../../lib/hotel/ctHotelRequest';
import CTHotelAPIEndpoints from '../../miscellaneous/endpoints/ctHotelApiEndpoints';
import {
  ICTGetBalanceResponse,
  ICTHotelRoomsResponse,
  ICTHotelSearchPayload,
  ICTHotelSearchResponse,
  ICTHotelSearchResponseHotel,
} from '../../supportTypes/hotelTypes/ctHotelSupport.types';
import HotelMarkupsModel from '../../../models/markupSetModel/hotelMarkupsModel';
import {
  MARKUP_MODE_INCREASE,
  MARKUP_TYPE_FLAT,
  MARKUP_TYPE_PER,
} from '../../miscellaneous/constants';

export class CTHotelSupportService extends AbstractServices {
  private trx: Knex.Transaction;
  private request = new CTHotelRequests();
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
  }

  // Get Balance
  public async GetBalance() {
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
  public async SearchLocation(filter: string) {
    const response = await this.request.getRequest(
      `${CTHotelAPIEndpoints.SEARCH_LOCATION}?filter=${filter}`
    );

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

  // Hotel Search
  public async HotelSearch(payload: ICTHotelSearchPayload, markup_set: number) {
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

    return {
      ...restData,
      hotels: modifiedHotels,
    };
  }

  public async HotelRooms(
    payload: { hcode: number; search_id: string },
    markup_set: number
  ) {
    const response = (await this.request.postRequest(
      CTHotelAPIEndpoints.HOTEL_ROOMS,
      payload
    )) as {
      success: boolean;
      message: string;
      data: ICTHotelRoomsResponse[];
    };

    console.log({ response });

    if (!response.success) {
      return false;
    }

    return response.data;
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
}
