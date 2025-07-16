import { Knex } from 'knex';
import AbstractServices from '../../../abstract/abstract.service';
import WfttRequests from '../../lib/flight/wfttRequest';
import {
  IFormattedFlightItinerary,
  IFlightSearchReqBody,
  IFormattedFare,
} from '../../supportTypes/flightTypes/commonFlightTypes';
import WfttAPIEndpoints from '../../miscellaneous/wfttApiEndpoints';
import {
  IWFTTFlightRevalidateRequestBody,
  IWFTTFlightRevalidateResponse,
  IWFTTFlightSearchResBody,
  IWFTTFlightSearchResults,
} from '../../supportTypes/flightTypes/wfttFlightTypes';
import {
  CUSTOM_API,
  CUSTOM_API_NAME,
  ROUTE_TYPE,
} from '../../miscellaneous/flightConstent';
import Lib from '../../lib/lib';
import CustomError from '../../lib/customError';
import { ERROR_LEVEL_WARNING } from '../../miscellaneous/constants';
import { IGetAirlinesPreferenceQuery } from '../../modelTypes/dynamicFareRulesModelTypes/airlinesPreferenceModelTypes';
import FlightUtils from '../../lib/flight/flightUtils';
import { CommonFlightSupportService } from './commonFlightSupport.service';

export default class WfttFlightService extends AbstractServices {
  private trx: Knex.Transaction;
  private request = new WfttRequests();
  private flightUtils = new FlightUtils();
  private flightSupport: CommonFlightSupportService;
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
    this.flightSupport = new CommonFlightSupportService(trx);
  }

  // Request body formatter
  private async FlightSearchReqFormatter({
    dynamic_fare_supplier_id,
    reqBody,
    route_type,
  }: {
    reqBody: IFlightSearchReqBody;
    dynamic_fare_supplier_id: number;
    route_type: 'FROM_DAC' | 'TO_DAC' | 'DOMESTIC' | 'SOTO';
  }): Promise<IFlightSearchReqBody> {
    const AirlinesPrefModel = this.Model.AirlinesPreferenceModel(this.trx);

    const prefAirlinesQuery: IGetAirlinesPreferenceQuery = {
      dynamic_fare_supplier_id,
      pref_type: 'PREFERRED',
      status: true,
    };

    if (route_type === ROUTE_TYPE.DOMESTIC) {
      prefAirlinesQuery.domestic = true;
    } else if (route_type === ROUTE_TYPE.FROM_DAC) {
      prefAirlinesQuery.from_dac = true;
    } else if (route_type === ROUTE_TYPE.TO_DAC) {
      prefAirlinesQuery.to_dac = true;
    } else if (route_type === ROUTE_TYPE.SOTO) {
      prefAirlinesQuery.soto = true;
    }

    // Get preferred airlines
    const cappingAirlinesRaw: { Code: string }[] =
      await AirlinesPrefModel.getAirlinePrefCodes(prefAirlinesQuery);

    const {
      JourneyType,
      airline_code,
      OriginDestinationInformation,
      PassengerTypeQuantity,
    } = reqBody;

    let finalAirlineCodes: { Code: string }[] = [];

    if (airline_code?.length) {
      for (const code of airline_code) {
        const found = cappingAirlinesRaw.find(
          (item) => item.Code === code.Code
        );

        if (found) {
          finalAirlineCodes.push({ Code: found.Code });
        }
      }
    } else {
      if (cappingAirlinesRaw.length) {
        finalAirlineCodes = cappingAirlinesRaw;
      }
    }

    return {
      JourneyType,
      airline_code: finalAirlineCodes,
      OriginDestinationInformation,
      PassengerTypeQuantity,
    };
  }

  // Flight search service
  public async FlightSearch({
    dynamic_fare_supplier_id,
    reqBody,
    markup_amount,
  }: {
    reqBody: IFlightSearchReqBody;
    dynamic_fare_supplier_id: number;
    booking_block: boolean;
    markup_amount?: {
      markup: number;
      markup_type: 'PER' | 'FLAT';
      markup_mode: 'INCREASE' | 'DECREASE';
    };
  }) {
    const route_type = this.flightUtils.routeTypeFinder({
      originDest: reqBody.OriginDestinationInformation,
    });
    const formattedReqBody = await this.FlightSearchReqFormatter({
      dynamic_fare_supplier_id,
      reqBody,
      route_type,
    });

    const response: IWFTTFlightSearchResBody | undefined =
      await this.request.postRequest(
        WfttAPIEndpoints.FLIGHT_SEARCH_ENDPOINT,
        formattedReqBody
      );

    if (!response) {
      return [];
    }
    if (response.data.total === 0) {
      return [];
    }

    const result = await this.FlightSearchResFormatter({
      data: response.data.results,
      reqBody: reqBody,
      dynamic_fare_supplier_id,
      search_id: response.data.search_id,
      markup_amount,
      route_type,
    });
    return result;
  }

  // Flight search response formatter
  private async FlightSearchResFormatter({
    data,
    reqBody,
    dynamic_fare_supplier_id,
    search_id,
    markup_amount,
    route_type,
    with_modified_fare,
    with_vendor_fare,
  }: {
    data: IWFTTFlightSearchResults[];
    reqBody: IFlightSearchReqBody;
    dynamic_fare_supplier_id: number;
    search_id: string;
    with_vendor_fare?: boolean;
    with_modified_fare?: boolean;
    markup_amount?: {
      markup: number;
      markup_type: 'PER' | 'FLAT';
      markup_mode: 'INCREASE' | 'DECREASE';
    };
    route_type: 'FROM_DAC' | 'TO_DAC' | 'DOMESTIC' | 'SOTO';
  }) {
    // const result: IFormattedFlightItinerary[] = [];
    const airports: string[] = [];

    const OriginDest = reqBody.OriginDestinationInformation;

    OriginDest.forEach((item) => {
      airports.push(item.OriginLocation.LocationCode);
      airports.push(item.DestinationLocation.LocationCode);
    });

    const commonModel = this.Model.CommonModel(this.trx);

    let pax_count = 0;

    reqBody.PassengerTypeQuantity.map((reqPax) => {
      pax_count += reqPax.Quantity;
    });

    const formattedData: IFormattedFlightItinerary[] = await Promise.all(
      data.map(async (item) => {
        const domestic_flight = route_type === ROUTE_TYPE.DOMESTIC;

        const {
          isDomesticFlight,
          fare: vendor_fare,
          api,
          carrier_code,
          carrier_logo,
          api_search_id,
          flights,
          passengers,
          refundable,
          ...rest
        } = item;

        let partial_payment: {
          partial_payment: boolean;
          payment_percentage: any;
          travel_date_from_now: any;
        } = {
          partial_payment: false,
          payment_percentage: 0,
          travel_date_from_now: '',
        };

        if (route_type === ROUTE_TYPE.DOMESTIC) {
          //domestic
          partial_payment = await this.Model.PartialPaymentRuleModel(
            this.trx
          ).getPartialPaymentCondition({
            flight_api_name: CUSTOM_API,
            airline: carrier_code,
            refundable,
            travel_date:
              reqBody.OriginDestinationInformation[0].DepartureDateTime,
            domestic: true,
          });
        } else if (route_type === ROUTE_TYPE.FROM_DAC) {
          //from dac
          partial_payment = await this.Model.PartialPaymentRuleModel(
            this.trx
          ).getPartialPaymentCondition({
            flight_api_name: CUSTOM_API,
            airline: carrier_code,
            from_dac: true,
            refundable,
            travel_date:
              reqBody.OriginDestinationInformation[0].DepartureDateTime,
          });
        } else if (route_type === ROUTE_TYPE.TO_DAC) {
          //to dac
          partial_payment = await this.Model.PartialPaymentRuleModel(
            this.trx
          ).getPartialPaymentCondition({
            flight_api_name: CUSTOM_API,
            airline: carrier_code,
            to_dac: true,
            refundable,
            travel_date:
              reqBody.OriginDestinationInformation[0].DepartureDateTime,
          });
        } else {
          //soto
          partial_payment = await this.Model.PartialPaymentRuleModel(
            this.trx
          ).getPartialPaymentCondition({
            flight_api_name: CUSTOM_API,
            airline: carrier_code,
            refundable,
            travel_date:
              reqBody.OriginDestinationInformation[0].DepartureDateTime,
            soto: true,
          });
        }

        let total_segments = 0;
        flights.map((elm) => {
          elm.options.forEach((elm2) => {
            total_segments++;
          });
        });

        const { markup, commission, pax_markup, agent_discount, agent_markup } =
          await this.flightSupport.calculateFlightMarkup({
            dynamic_fare_supplier_id,
            airline: carrier_code,
            flight_class: this.flightUtils.getClassFromId(
              reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref
                .Cabin
            ),
            base_fare: vendor_fare.base_fare,
            total_segments,
            route_type,
            markup_amount,
          });

        const total_pax_markup = pax_markup * pax_count;

        let fare: IFormattedFare = {
          base_fare:
            vendor_fare.base_fare + markup + agent_markup + total_pax_markup,
          total_tax: vendor_fare.total_tax,
          discount: commission + agent_discount,
          ait: vendor_fare.ait,
          payable: (
            vendor_fare.base_fare +
            markup +
            agent_markup +
            total_pax_markup +
            vendor_fare.total_tax +
            vendor_fare.ait -
            commission -
            agent_discount
          ).toFixed(2),
          vendor_price: with_vendor_fare
            ? {
                base_fare: vendor_fare.base_fare,
                charge: 0,
                discount: vendor_fare.discount,
                ait: vendor_fare.ait,
                gross_fare: vendor_fare.total_price,
                net_fare: vendor_fare.payable,
                tax: vendor_fare.total_tax,
              }
            : undefined,
        };

        const newPassenger = passengers.map((oldPax) => {
          const per_pax_discount = (commission + agent_discount) / pax_count;
          const per_pax_markup = (markup + agent_markup) / pax_count;

          const total_pax_markup = pax_markup + per_pax_markup;

          const per_pax_ait = Number(fare.ait) / pax_count;

          const per_pax_tax = oldPax.fare.tax / oldPax.number;
          const per_pax_base_fare = oldPax.fare.base_fare / oldPax.number;

          return {
            type: oldPax.type,
            number: oldPax.number,
            per_pax_fare: {
              base_fare: (per_pax_base_fare + total_pax_markup).toFixed(2),
              tax: per_pax_tax.toFixed(2),
              ait: per_pax_ait.toFixed(2),
              discount: per_pax_discount.toFixed(2),
              total_fare: (
                per_pax_base_fare +
                total_pax_markup +
                per_pax_ait +
                per_pax_tax -
                per_pax_discount
              ).toFixed(2),
            },
          };
        });

        const newFlights = await Promise.all(
          flights.map(async (flight) => {
            const { options } = flight;

            const newOptions = await Promise.all(
              options.map(async (option) => {
                const { carrier: optionsCareer } = option;

                const newCareer = { ...optionsCareer };

                const careerMarketing = await commonModel.getAirlineByCode(
                  optionsCareer.carrier_marketing_code
                );

                if (
                  optionsCareer.carrier_marketing_code ===
                  optionsCareer.carrier_operating_code
                ) {
                  newCareer.carrier_marketing_logo = careerMarketing.logo;
                  newCareer.carrier_operating_logo = careerMarketing.logo;
                } else {
                  const careerOperating = await commonModel.getAirlineByCode(
                    optionsCareer.carrier_operating_code
                  );

                  newCareer.carrier_marketing_logo = careerMarketing.logo;
                  newCareer.carrier_operating_logo = careerOperating.logo;
                }

                return {
                  ...option,
                  carrier: newCareer,
                  fare,
                };
              })
            );

            return {
              ...flight,
              options: newOptions,
            };
          })
        );

        const career = await commonModel.getAirlineByCode(carrier_code);
        // console.log({
        //   agent_discount,
        //   agent_markup,
        //   commission,
        //   markup,
        //   pax_markup,
        // });
        // console.log({ fare });
        return {
          domestic_flight,
          fare,
          price_changed: false,
          api_search_id: search_id,
          api: CUSTOM_API,
          api_name: CUSTOM_API_NAME,
          carrier_code,
          carrier_logo: career.logo,
          flights: newFlights,
          passengers: newPassenger,
          refundable,
          partial_payment,
          modifiedFare: with_modified_fare
            ? {
                agent_discount,
                agent_markup,
                commission,
                markup,
                pax_markup,
              }
            : undefined,
          ...rest,
          leg_description: [],
        };
      })
    );
    return formattedData;
  }

  //Revalidate service
  public async FlightRevalidate({
    reqBody,
    revalidate_body,
    dynamic_fare_supplier_id,
    markup_amount,
  }: {
    revalidate_body: IWFTTFlightRevalidateRequestBody;
    reqBody: IFlightSearchReqBody;
    dynamic_fare_supplier_id: number;
    markup_amount?: {
      markup: number;
      markup_type: 'PER' | 'FLAT';
      markup_mode: 'INCREASE' | 'DECREASE';
    };
  }) {
    const route_type = this.flightUtils.routeTypeFinder({
      originDest: reqBody.OriginDestinationInformation,
    });

    const endpoint =
      WfttAPIEndpoints.FLIGHT_REVALIDATE_ENDPOINT +
      `?search_id=${revalidate_body.search_id}&flight_id=${revalidate_body.flight_id}`;

    const response: IWFTTFlightRevalidateResponse =
      await this.request.getRequest(endpoint);

    if (!response) {
      Lib.writeJsonFile('wftt_revalidate_request', revalidate_body);
      Lib.writeJsonFile('wftt_revalidate_response', response);
      throw new CustomError('External API Error', 500, ERROR_LEVEL_WARNING, {
        api: CUSTOM_API,
        endpoint: WfttAPIEndpoints.FLIGHT_REVALIDATE_ENDPOINT,
        payload: revalidate_body,
        response,
      });
    }

    if (!response.data) {
      throw new CustomError(
        `Cannot revalidate flight with this flight id`,
        400
      );
    }

    const result = await this.FlightSearchResFormatter({
      data: [response.data],
      reqBody: reqBody,
      dynamic_fare_supplier_id,
      search_id: '',
      markup_amount,
      route_type,
      with_modified_fare: true,
      with_vendor_fare: true,
    });
    return result[0];
  }
}
