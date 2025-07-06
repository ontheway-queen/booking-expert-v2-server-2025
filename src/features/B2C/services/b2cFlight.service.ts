import { Request, Response } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import {
  IAirlineCodePayload,
  IFlightSearchReqBody,
  IFormattedFlightItinerary,
  IOriginDestinationInformationPayload,
  IPassengerTypeQuantityPayload,
} from '../../../utils/supportTypes/flightTypes/commonFlightTypes';
import {
  FLIGHT_FARE_RESPONSE,
  FLIGHT_REVALIDATE_REDIS_KEY,
  SABRE_API,
  WFTT_API,
} from '../../../utils/miscellaneous/flightConstent';
import SabreFlightService from '../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service';
import WfttFlightService from '../../../utils/supportServices/flightSupportServices/wfttFlightSupport.service';
import { v4 as uuidv4 } from 'uuid';
import { getRedis, setRedis } from '../../../app/redis';
import Lib from '../../../utils/lib/lib';
import { CommonFlightSupportService } from '../../../utils/supportServices/flightSupportServices/commonFlightSupport.service';
import { SOURCE_B2C } from '../../../utils/miscellaneous/constants';
import { IB2CGetFlightBookingReqQuery } from '../utils/types/b2cFlight.types';

export class B2CFlightService extends AbstractServices {
  constructor() {
    super();
  }

  public async flightSearch(req: Request) {
    return this.db.transaction(async (trx) => {
      const body = req.body as IFlightSearchReqBody;
      //get flight markup set id
      const b2cMarkupConfig = this.Model.B2CMarkupConfigModel(trx);
      const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
      const markupSet = await b2cMarkupConfig.getB2CMarkupConfigData('Flight');

      if (!markupSet.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }

      const markup_set_id = markupSet[0].markup_set_id;

      const apiData = await markupSetFlightApiModel.getMarkupSetFlightApi({
        status: true,
        markup_set_id,
      });

      //extract API IDs
      let sabre_set_flight_api_id = 0;
      let wftt_set_flight_api_id = 0;

      apiData.forEach((api) => {
        if (api.api_name === SABRE_API) {
          sabre_set_flight_api_id = api.id;
        }
        if (api.api_name === WFTT_API) {
          wftt_set_flight_api_id = api.id;
        }
      });

      let sabreData: any[] = [];
      let wfttData: any[] = [];

      if (sabre_set_flight_api_id) {
        const sabreSubService = new SabreFlightService(trx);
        sabreData = await sabreSubService.FlightSearch({
          booking_block: false,
          reqBody: body,
          dynamic_fare_supplier_id: sabre_set_flight_api_id,
        });
      }
      if (wftt_set_flight_api_id) {
        const wfttSubService = new WfttFlightService(trx);
        wfttData = await wfttSubService.FlightSearch({
          booking_block: false,
          reqBody: body,
          dynamic_fare_supplier_id: wftt_set_flight_api_id,
        });
      }

      //generate search ID
      const search_id = uuidv4();
      const leg_descriptions = body.OriginDestinationInformation.map(
        (OrDeInfo) => {
          return {
            departureDate: OrDeInfo.DepartureDateTime,
            departureLocation: OrDeInfo.OriginLocation.LocationCode,
            arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
          };
        }
      );

      const results: any[] = [...sabreData, ...wfttData];

      results.sort((a, b) => a.fare.payable - b.fare.payable);

      const responseData = {
        search_id,
        journey_type: body.JourneyType,
        leg_descriptions,
        total: results.length,
        results,
      };

      //save data to redis
      const dataForStore = {
        reqBody: body,
        response: responseData,
      };

      await setRedis(search_id, dataForStore);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: responseData,
      };
    });
  }

  public async flightSearchSSE(req: Request, res: Response) {
    return this.db.transaction(async (trx) => {
      const JourneyType = req.query.JourneyType as string;
      const OriginDestinationInformation = req.query
        .OriginDestinationInformation as unknown as IOriginDestinationInformationPayload[];
      const PassengerTypeQuantity = req.query
        .PassengerTypeQuantity as unknown as IPassengerTypeQuantityPayload[];
      const airline_code = req.query
        .airline_code as unknown as IAirlineCodePayload[];
      const b2cMarkupConfig = this.Model.B2CMarkupConfigModel(trx);

      const markupSet = await b2cMarkupConfig.getB2CMarkupConfigData('Flight');

      if (!markupSet.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }

      const markup_set_id = markupSet[0].markup_set_id;

      const body = {
        JourneyType,
        OriginDestinationInformation,
        PassengerTypeQuantity,
        airline_code,
      } as unknown as IFlightSearchReqBody;

      const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
      const apiData = await markupSetFlightApiModel.getMarkupSetFlightApi({
        status: true,
        markup_set_id,
      });

      //extract API IDs
      let sabre_set_flight_api_id = 0;
      let wftt_set_flight_api_id = 0;

      apiData.forEach((api) => {
        if (api.api_name === SABRE_API) {
          sabre_set_flight_api_id = api.id;
        }
        if (api.api_name === WFTT_API) {
          wftt_set_flight_api_id = api.id;
        }
      });

      //generate search ID
      const search_id = uuidv4();
      const leg_descriptions = body.OriginDestinationInformation.map(
        (OrDeInfo) => {
          return {
            departureDate: OrDeInfo.DepartureDateTime,
            departureLocation: OrDeInfo.OriginLocation.LocationCode,
            arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
          };
        }
      );

      res.write('event: search_info\n');
      res.write(
        `data: ${JSON.stringify({
          search_id,
          leg_description: leg_descriptions,
        })}\n\n`
      );

      // Initialize Redis storage
      const responseData: {
        search_id: string;
        journey_type: string;
        leg_descriptions: any[];
        total: number;
        results: any[];
      } = {
        search_id,
        journey_type: JourneyType,
        leg_descriptions,
        total: 0,
        results: [],
      };
      await setRedis(search_id, { reqBody: body, response: responseData });

      const data: any[] = [];
      const sendResults = async (
        apiName: string,
        fetchResults: () => Promise<any[]>
      ) => {
        const results = await fetchResults();
        // Update results list and Redis
        responseData.results.push(...results);
        responseData.total = responseData.results.length;
        // Stream results to client
        results.forEach((result) => {
          data.push(result);
          res.write(`data: ${JSON.stringify(result)}\n\n`);
        });
        // Update Redis after receiving results
        await setRedis(search_id, { reqBody: body, response: responseData });
      };

      // Sabre results
      if (sabre_set_flight_api_id) {
        const sabreSubService = new SabreFlightService(trx);
        await sendResults('Sabre', async () =>
          sabreSubService.FlightSearch({
            booking_block: false,
            reqBody: body,
            dynamic_fare_supplier_id: sabre_set_flight_api_id,
          })
        );
      }
      //WFTT results
      if (wftt_set_flight_api_id) {
        const wfttSubService = new WfttFlightService(trx);
        await sendResults('WFTT', async () =>
          wfttSubService.FlightSearch({
            booking_block: false,
            reqBody: body,
            dynamic_fare_supplier_id: wftt_set_flight_api_id,
          })
        );
      }
    });
  }

  public async getFlightFareRule(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { flight_id, search_id } = req.query as {
        flight_id: string;
        search_id: string;
      };
      //get data from redis using the search id
      const retrievedData = await getRedis(search_id);

      console.log({ retrievedData });
      if (!retrievedData) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const retrieveResponse = retrievedData.response as {
        results: IFormattedFlightItinerary[];
      };

      console.log(retrieveResponse.results[0]);
      const foundItem = retrieveResponse.results.find(
        (item) => item.flight_id === flight_id
      );

      if (!foundItem) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      let res: string | false = false;

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: res ? res : FLIGHT_FARE_RESPONSE,
      };
    });
  }

  public async flightRevalidate(req: Request) {
    return this.db.transaction(async (trx) => {
      const { flight_id, search_id } = req.query as {
        flight_id: string;
        search_id: string;
      };

      const b2cMarkupConfigModel = this.Model.B2CMarkupConfigModel(trx);
      const markup_set = await b2cMarkupConfigModel.getB2CMarkupConfigData(
        'Flight'
      );

      if (!markup_set.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No commission set has been found for the agency',
        };
      }

      const flight_markup_set = markup_set[0].markup_set_id;

      //revalidate using the flight support service
      const flightSupportService = new CommonFlightSupportService(trx);
      const data: IFormattedFlightItinerary | null =
        await flightSupportService.FlightRevalidate({
          search_id,
          flight_id,
          dynamic_fare_set_id: flight_markup_set,
        });

      if (data) {
        await setRedis(`${FLIGHT_REVALIDATE_REDIS_KEY}${flight_id}`, data);
        return {
          success: true,
          message: 'Ticket has been revalidated successfully!',
          data,
          code: this.StatusCode.HTTP_OK,
        };
      }

      return {
        success: false,
        message: this.ResMsg.HTTP_NOT_FOUND,
        code: this.StatusCode.HTTP_NOT_FOUND,
      };
    });
  }

  public async getAllBookingList(req: Request) {
    return await this.db.transaction(async (trx) => {
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const query = req.query as IB2CGetFlightBookingReqQuery;
      const data = await flightBookingModel.getFlightBookingList(
        { ...query, booked_by: SOURCE_B2C },
        true
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        total: data.total,
        data: data.data,
      };
    });
  }

  public async getSingleBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const flightSegmentModel = this.Model.FlightBookingSegmentModel(trx);
      const flightTravelerModel = this.Model.FlightBookingTravelerModel(trx);
      const flightPriceBreakdownModel =
        this.Model.FlightBookingPriceBreakdownModel(trx);

      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: Number(id),
        booked_by: SOURCE_B2C,
      });

      if (!booking_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const price_breakdown_data =
        await flightPriceBreakdownModel.getFlightBookingPriceBreakdown(
          Number(id)
        );
      const segment_data = await flightSegmentModel.getFlightBookingSegment(
        Number(id)
      );
      const traveler_data = await flightTravelerModel.getFlightBookingTraveler(
        Number(id)
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: {
          ...booking_data,
          price_breakdown_data,
          segment_data,
          traveler_data,
        },
      };
    });
  }
}
