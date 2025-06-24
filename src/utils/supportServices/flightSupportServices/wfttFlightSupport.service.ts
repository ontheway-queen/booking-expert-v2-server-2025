import { Knex } from 'knex';
import AbstractServices from '../../../abstract/abstract.service';
import WfttRequests from '../../lib/flight/wfttRequest';
import {
  IFormattedFlightItinerary,
  IFlightSearchReqBody,
} from '../../supportTypes/flightTypes/commonFlightTypes';
import WfttAPIEndpoints from '../../miscellaneous/wfttApiEndpoints';
import {
  IWFTTFlightRevalidateRequestBody,
  IWFTTFlightRevalidateResponse,
  IWFTTFlightSearchResBody,
  IWFTTFlightSearchResults,
} from '../../supportTypes/flightTypes/wfttFlightTypes';
import { BD_AIRPORT } from '../../miscellaneous/staticData';
import { CUSTOM_API, WFTT_API } from '../../miscellaneous/flightConstent';
import Lib from '../../lib/lib';
import {
  MARKUP_MODE_INCREASE,
  MARKUP_TYPE_PER,
} from '../../miscellaneous/constants';
import CustomError from '../../lib/customError';
import { ERROR_LEVEL_WARNING } from '../../miscellaneous/constants';

export default class WfttFlightService extends AbstractServices {
  private trx: Knex.Transaction;
  private request = new WfttRequests();
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
  }

  // Request body formatter
  private async FlightSearchReqFormatter(
    reqBody: IFlightSearchReqBody,
    set_flight_api_id: number
  ): Promise<IFlightSearchReqBody> {
    const {
      JourneyType,
      airline_code,
      OriginDestinationInformation,
      PassengerTypeQuantity,
    } = reqBody;

    const flightMarkupsModel = this.Model.FlightMarkupsModel(this.trx);

    const defaultAllowedAirlines =
      await flightMarkupsModel.getAPIActiveAirlines(set_flight_api_id);

    let newAirlineCodes: { Code: string }[] = [];

    if (airline_code?.length) {
      defaultAllowedAirlines.forEach((airline) => {
        if (airline_code.some((code) => code.Code === airline.Code)) {
          newAirlineCodes.push({ Code: airline.Code });
        }
      });
    } else {
      newAirlineCodes = defaultAllowedAirlines;
    }

    // Format the request body as per WFTT API requirements
    return {
      JourneyType,
      airline_code: newAirlineCodes,
      OriginDestinationInformation,
      PassengerTypeQuantity,
    };
  }

  // Flight search service
  public async FlightSearch({
    set_flight_api_id,
    reqBody,
    markup_amount,
  }: {
    reqBody: IFlightSearchReqBody;
    set_flight_api_id: number;
    markup_set_id: number;
    booking_block: boolean;
    markup_amount?: {
      markup: number;
      markup_type: 'PER' | 'FLAT';
      markup_mode: 'INCREASE' | 'DECREASE';
    };
  }) {
    const formattedReqBody = await this.FlightSearchReqFormatter(
      reqBody,
      set_flight_api_id
    );

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
      set_flight_api_id,
      search_id: response.data.search_id,
      markup_amount,
    });
    return result;
  }

  // Flight search response formatter
  private async FlightSearchResFormatter({
    data,
    reqBody,
    set_flight_api_id,
    search_id,
    markup_amount,
  }: {
    data: IWFTTFlightSearchResults[];
    reqBody: IFlightSearchReqBody;
    set_flight_api_id: number;
    search_id: string;
    markup_amount?: {
      markup: number;
      markup_type: 'PER' | 'FLAT';
      markup_mode: 'INCREASE' | 'DECREASE';
    };
  }) {
    // const result: IFormattedFlightItinerary[] = [];
    const airports: string[] = [];

    const OriginDest = reqBody.OriginDestinationInformation;

    OriginDest.forEach((item) => {
      airports.push(item.OriginLocation.LocationCode);
      airports.push(item.DestinationLocation.LocationCode);
    });

    const flightMarkupsModel = this.Model.FlightMarkupsModel(this.trx);
    const commonModel = this.Model.CommonModel(this.trx);

    return (await Promise.all(
      data.map(async (item) => {
        const domestic_flight = item.isDomesticFlight;

        let fare = {
          base_fare: item.fare.base_fare,
          total_tax: item.fare.total_tax,
          discount: item.fare.discount,
          convenience_fee: item.fare.convenience_fee,
          total_price: item.fare.total_price,
          payable: item.fare.payable,
          ait: item.fare.ait,
        };

        // Markup data
        let finalMarkup = 0;
        let finalMarkupType = '';
        let finalMarkupMode = '';

        // Set Markup if route Markup is not available and airlines Markup is available
        if (!finalMarkup && !finalMarkupType && !finalMarkupMode) {
          //airline markup
          const markupCheck = await flightMarkupsModel.getAllFlightMarkups(
            {
              airline: item.carrier_code,
              status: true,
              markup_set_flight_api_id: set_flight_api_id,
              limit: 1,
            },
            false
          );

          // Set Amount
          if (markupCheck.data.length) {
            const {
              markup_domestic,
              markup_from_dac,
              markup_to_dac,
              markup_soto,
              markup_type,
              markup_mode,
            } = markupCheck.data[0];

            let allBdAirport = true;
            let existBdAirport = false;

            for (const airport of airports) {
              if (BD_AIRPORT.includes(airport)) {
                if (!existBdAirport) {
                  existBdAirport = true;
                }
              } else {
                allBdAirport = false;
              }
            }

            if (allBdAirport) {
              // Domestic
              finalMarkup = markup_domestic;
              finalMarkupMode = markup_mode;
              finalMarkupType = markup_type;
            } else if (BD_AIRPORT.includes(airports[0])) {
              // From Dhaka
              finalMarkup = markup_from_dac;
              finalMarkupMode = markup_mode;
              finalMarkupType = markup_type;
            } else if (existBdAirport) {
              // To Dhaka
              finalMarkup = markup_to_dac;
              finalMarkupMode = markup_mode;
              finalMarkupType = markup_type;
            } else {
              // Soto
              finalMarkup = markup_soto;
              finalMarkupMode = markup_mode;
              finalMarkupType = markup_type;
            }
          }
        }

        // Set Markup to fare
        if (finalMarkup && finalMarkupMode && finalMarkupType) {
          if (finalMarkupType === MARKUP_TYPE_PER) {
            const markupAmount =
              (Number(fare.base_fare) * Number(finalMarkup)) / 100;

            if (finalMarkupMode === MARKUP_MODE_INCREASE) {
              fare.convenience_fee += Number(markupAmount);
            } else {
              fare.discount += Number(markupAmount);
            }
          } else {
            if (finalMarkupMode === MARKUP_MODE_INCREASE) {
              fare.convenience_fee += Number(finalMarkup);
            } else {
              fare.discount += Number(finalMarkup);
            }
          }
        }

        //add addition markup(applicable for sub agent/agent b2c)
        if (markup_amount) {
          if (markup_amount.markup_mode === 'INCREASE') {
            fare.convenience_fee +=
              markup_amount.markup_type === 'FLAT'
                ? Number(markup_amount.markup)
                : (Number(fare.total_price) * Number(markup_amount.markup)) /
                  100;
          } else {
            fare.discount +=
              markup_amount.markup_type === 'FLAT'
                ? Number(markup_amount.markup)
                : (Number(fare.total_price) * Number(markup_amount.markup)) /
                  100;
          }
        }

        fare.payable =
          Number(fare.total_price) +
          Number(fare.convenience_fee) -
          Number(fare.discount);

        const {
          isDomesticFlight,
          fare: wftt_fare,
          api,
          carrier_code,
          carrier_logo,
          api_search_id,
          flights,
          ...rest
        } = item;

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

        // const career =
        return {
          domestic_flight,
          fare,
          price_changed: false,
          api_search_id: search_id,
          api: CUSTOM_API,
          carrier_code,
          carrier_logo: career.logo,
          flights: newFlights,
          ...rest,
          leg_description: [],
        };
      })
    )) as IFormattedFlightItinerary[];
  }

  //Revalidate service
  public async FlightRevalidate({
    reqBody,
    revalidate_body,
    set_flight_api_id,
    markup_amount,
  }: {
    revalidate_body: IWFTTFlightRevalidateRequestBody;
    reqBody: IFlightSearchReqBody;
    set_flight_api_id: number;
    markup_amount?: {
      markup: number;
      markup_type: 'PER' | 'FLAT';
      markup_mode: 'INCREASE' | 'DECREASE';
    };
  }) {
    const response: IWFTTFlightRevalidateResponse =
      await this.request.getRequest(
        WfttAPIEndpoints.FLIGHT_REVALIDATE_ENDPOINT,
        revalidate_body
      );

    if (!response) {
      Lib.writeJsonFile('wftt_revalidate_request', revalidate_body);
      Lib.writeJsonFile('wftt_revalidate_response', response);
      throw new CustomError('External API Error', 500, ERROR_LEVEL_WARNING, {
        api: WFTT_API,
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
      set_flight_api_id,
      search_id: '',
      markup_amount,
    });
    return result[0];
  }
}
