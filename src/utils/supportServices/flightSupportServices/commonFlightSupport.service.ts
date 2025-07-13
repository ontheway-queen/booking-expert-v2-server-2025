import { Knex } from 'knex';
import AbstractServices from '../../../abstract/abstract.service';
import { getRedis } from '../../../app/redis';
import {
  CUSTOM_API,
  FLIGHT_REVALIDATE_REDIS_KEY,
  MIN_DAYS_BEFORE_DEPARTURE_FOR_DIRECT_TICKET,
  SABRE_API,
} from '../../miscellaneous/flightConstent';
import {
  IFormattedFlightItinerary,
  IPassengerTypeQuantityPayload,
} from '../../supportTypes/flightTypes/commonFlightTypes';
import SabreFlightService from './sabreFlightSupport.service';
import WfttFlightService from './wfttFlightSupport.service';
import CustomError from '../../lib/customError';
import { IGetSupplierAirlinesDynamicFareQuery } from '../../modelTypes/dynamicFareRulesModelTypes/dynamicFareModelTypes';
import { IFlightBookingPassengerReqBody } from '../../supportTypes/bookingSupportTypes/flightBookingSupportTypes/commonFlightBookingTypes';
import DateTimeLib from '../../lib/dateTimeLib';

export class CommonFlightSupportService extends AbstractServices {
  private trx: Knex.Transaction;
  constructor(trx?: Knex.Transaction) {
    super();
    this.trx = trx || ({} as Knex.Transaction);
  }

  public async FlightRevalidate({
    dynamic_fare_set_id,
    flight_id,
    search_id,
    markup_amount,
  }: {
    search_id: string;
    flight_id: string;
    dynamic_fare_set_id: number;
    markup_amount?: number;
  }) {
    //get data from redis using the search id
    const retrievedData = await getRedis(search_id);

    if (!retrievedData) {
      return null;
    }

    const retrieveResponse = retrievedData.response as {
      results: IFormattedFlightItinerary[];
    };

    const foundItem = retrieveResponse.results.find(
      (item) => item.flight_id === flight_id
    );

    if (!foundItem) {
      return null;
    }

    const dynamicFareModel = this.Model.DynamicFareModel(this.trx);

    const apiData = await dynamicFareModel.getDynamicFareSuppliers({
      status: true,
      set_id: dynamic_fare_set_id,
      api_name: foundItem.api,
    });

    let booking_block = foundItem.booking_block;

    if (foundItem.api === SABRE_API) {
      //SABRE REVALIDATE
      const sabreSubService = new SabreFlightService(this.trx);
      const formattedResBody = await sabreSubService.SabreFlightRevalidate({
        booking_block,
        dynamic_fare_supplier_id: apiData[0].id,
        flight_id,
        reqBody: retrievedData.reqBody,
        retrieved_response: foundItem,
      });

      formattedResBody.price_changed = this.checkRevalidatePriceChange({
        flight_revalidate_price: formattedResBody.fare.payable,
        flight_search_price: foundItem.fare.payable,
      });

      formattedResBody.leg_description =
        retrievedData.response.leg_descriptions;

      return formattedResBody;
    } else if (foundItem.api === CUSTOM_API) {
      const customFlightService = new WfttFlightService(this.trx);
      const formattedResBody = await customFlightService.FlightRevalidate({
        reqBody: retrievedData.reqBody,
        dynamic_fare_supplier_id: apiData[0].id,
        revalidate_body: {
          flight_id: foundItem.flight_id,
          search_id: foundItem.api_search_id,
        },
      });

      formattedResBody.price_changed = this.checkRevalidatePriceChange({
        flight_revalidate_price: formattedResBody.fare.payable,
        flight_search_price: foundItem.fare.payable,
      });

      formattedResBody.leg_description =
        retrievedData.response.leg_descriptions;

      return formattedResBody;
    } else {
      return null;
    }
  }

  private checkRevalidatePriceChange(payload: {
    flight_search_price: string | number;
    flight_revalidate_price: string | number;
  }) {
    if (
      Number(payload.flight_search_price) ===
      Number(payload.flight_revalidate_price)
    ) {
      return false;
    } else {
      return true;
    }
  }

  public async checkBookingPriceChange(payload: {
    flight_id: string;
    booking_price: number;
  }) {
    const retrievedData = await getRedis(
      `${FLIGHT_REVALIDATE_REDIS_KEY}${payload.flight_id}`
    );

    if (!retrievedData) {
      return null;
    }

    if (Number(retrievedData.fare.payable) !== payload.booking_price) {
      return false;
    } else {
      return true;
    }
  }

  public checkDirectTicketIssue(payload: { journey_date: string }): boolean {
    const now = new Date();
    const diffInMs = new Date(payload.journey_date).getTime() - now.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    return diffInDays < MIN_DAYS_BEFORE_DEPARTURE_FOR_DIRECT_TICKET;
  }

  //calculate convenience fee and discount
  public async calculateFlightMarkup({
    airline,
    base_fare,
    flight_class,
    dynamic_fare_supplier_id,
    route_type,
    total_segments,
  }: {
    dynamic_fare_supplier_id: number;
    airline: string;
    flight_class: string;
    base_fare: number;
    total_segments: number;
    route_type: 'SOTO' | 'FROM_DAC' | 'TO_DAC' | 'DOMESTIC';
  }) {
    const dynamicFareModel = this.Model.DynamicFareModel(this.trx);

    let markup = 0;
    let commission = 0;
    let pax_markup = 0;

    const getFareMarkupQuery: IGetSupplierAirlinesDynamicFareQuery = {
      dynamic_fare_supplier_id,
      airline,
      flight_class,
    };

    if (route_type === 'DOMESTIC') {
      getFareMarkupQuery.domestic = true;
    } else if (route_type === 'FROM_DAC') {
      getFareMarkupQuery.from_dac = true;
    } else if (route_type === 'TO_DAC') {
      getFareMarkupQuery.to_dac = true;
    } else {
      getFareMarkupQuery.soto = true;
    }

    //get airline wise fare
    const supplier_airline_fare =
      await dynamicFareModel.getSupplierAirlinesFares(getFareMarkupQuery);

    if (supplier_airline_fare.length) {
      if (supplier_airline_fare[0].markup_type === 'FLAT') {
        markup += Number(supplier_airline_fare[0].markup);
      } else if (supplier_airline_fare[0].markup_type === 'PER') {
        markup +=
          Number(base_fare) * (Number(supplier_airline_fare[0].markup) / 100);
      }

      if (supplier_airline_fare[0].commission_type === 'FLAT') {
        commission += Number(supplier_airline_fare[0].commission);
      } else if (supplier_airline_fare[0].commission_type === 'PER') {
        commission +=
          Number(base_fare) *
          (Number(supplier_airline_fare[0].commission) / 100);
      }

      if (supplier_airline_fare[0].segment_markup_type === 'FLAT') {
        markup +=
          Number(supplier_airline_fare[0].segment_markup) * total_segments;
      } else if (supplier_airline_fare[0].segment_markup_type === 'PER') {
        markup +=
          Number(base_fare) *
          (Number(supplier_airline_fare[0].segment_markup) / 100) *
          total_segments;
      }

      if (supplier_airline_fare[0].segment_commission_type === 'FLAT') {
        commission +=
          Number(supplier_airline_fare[0].segment_commission) * total_segments;
      } else if (supplier_airline_fare[0].segment_commission_type === 'PER') {
        commission +=
          Number(base_fare) *
          (Number(supplier_airline_fare[0].segment_commission) / 100) *
          total_segments;
      }

      if (supplier_airline_fare[0].pax_markup) {
        pax_markup += Number(supplier_airline_fare[0].pax_markup);
      }
    } else {
      //get default fare for the current API if separate commission not exist
      const dynamic_fare_supplier =
        await dynamicFareModel.getDynamicFareSuppliers({
          id: dynamic_fare_supplier_id,
          status: true,
        });

      if (dynamic_fare_supplier.length) {
        if (dynamic_fare_supplier[0].commission_type === 'FLAT') {
          commission += Number(dynamic_fare_supplier[0].commission);
        } else if (dynamic_fare_supplier[0].commission_type === 'PER') {
          commission +=
            Number(base_fare) *
            (Number(dynamic_fare_supplier[0].commission) / 100);
        }

        if (dynamic_fare_supplier[0].markup_type === 'FLAT') {
          markup += Number(dynamic_fare_supplier[0].markup);
        } else if (dynamic_fare_supplier[0].markup_type === 'PER') {
          markup +=
            Number(base_fare) * (Number(dynamic_fare_supplier[0].markup) / 100);
        }

        if (dynamic_fare_supplier[0].pax_markup) {
          pax_markup += Number(dynamic_fare_supplier[0].pax_markup);
        }

        if (dynamic_fare_supplier[0].segment_markup_type === 'FLAT') {
          markup +=
            Number(dynamic_fare_supplier[0].segment_markup) * total_segments;
        } else if (dynamic_fare_supplier[0].segment_markup_type === 'PER') {
          markup +=
            Number(base_fare) *
            (Number(dynamic_fare_supplier[0].segment_markup) / 100) *
            total_segments;
        }

        if (dynamic_fare_supplier[0].segment_commission_type === 'FLAT') {
          commission +=
            Number(dynamic_fare_supplier[0].segment_commission) *
            total_segments;
        } else if (dynamic_fare_supplier[0].segment_commission_type === 'PER') {
          commission +=
            Number(base_fare) *
            (Number(dynamic_fare_supplier[0].segment_commission) / 100) *
            total_segments;
        }
      }
    }

    return {
      markup: Number(Number(markup).toFixed(2)),
      commission: Number(Number(commission).toFixed(2)),
      pax_markup: Number(Number(pax_markup).toFixed(2)),
    };
  }

  public crossCheckPax({
    bookingPax,
    searchPax,
  }: {
    bookingPax: IFlightBookingPassengerReqBody[];
    searchPax: IPassengerTypeQuantityPayload[];
  }) {
    for (const reqPax of searchPax) {
      const { Code, Quantity } = reqPax;

      const found = bookingPax.filter((pax) => pax.type === Code);

      if (!found.length) {
        throw new CustomError(
          'Passenger data is invalid.',
          this.StatusCode.HTTP_BAD_REQUEST
        );
      }

      if (found.length !== Quantity) {
        throw new CustomError(
          'Passenger data is invalid.',
          this.StatusCode.HTTP_BAD_REQUEST
        );
      }

      if (Code.startsWith('C')) {
        const childAge = Number(Code.split('C')[1]);

        if (!childAge || childAge > 11) {
          throw new CustomError(
            `Passenger data ${Code} is invalid.`,
            this.StatusCode.HTTP_BAD_REQUEST
          );
        }

        const DobAge = DateTimeLib.calculateAge(found[0].date_of_birth);

        if (DobAge !== childAge) {
          throw new CustomError(
            `Passenger(${Code}) age and dob is invalid.`,
            this.StatusCode.HTTP_BAD_REQUEST
          );
        }
      }
    }
  }
}
