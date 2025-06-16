import { Request, Response } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import {
  IAirlineCodePayload,
  IFlightSearchReqBody,
  IOriginDestinationInformationPayload,
  IPassengerTypeQuantityPayload,
} from '../../../utils/supportTypes/flightTypes/commonFlightTypes';
import {
  SABRE_API,
  WFTT_API,
} from '../../../utils/miscellaneous/flightConstent';
import SabreFlightService from '../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service';
import WfttFlightService from '../../../utils/supportServices/flightSupportServices/wfttFlightSupport.service';
import { v4 as uuidv4 } from 'uuid';
import { setRedis } from '../../../app/redis';
import Lib from '../../../utils/lib/lib';

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
          markup_set_id,
          reqBody: body,
          set_flight_api_id: sabre_set_flight_api_id,
        });
      }
      if (wftt_set_flight_api_id) {
        const wfttSubService = new WfttFlightService(trx);
        wfttData = await wfttSubService.FlightSearch({
          booking_block: false,
          markup_set_id,
          reqBody: body,
          set_flight_api_id: wftt_set_flight_api_id,
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
      const { agency_id, ref_id } = req.agencyUser;
      const JourneyType = req.query.JourneyType as string;
      const OriginDestinationInformation = req.query
        .OriginDestinationInformation as unknown as IOriginDestinationInformationPayload[];
      const PassengerTypeQuantity = req.query
        .PassengerTypeQuantity as unknown as IPassengerTypeQuantityPayload[];
      const airline_code = req.query
        .airline_code as unknown as IAirlineCodePayload[];

      const body = {
        JourneyType,
        OriginDestinationInformation,
        PassengerTypeQuantity,
        airline_code,
      } as unknown as IFlightSearchReqBody;

      //get flight markup set id
      const agencyModel = this.Model.AgencyModel(trx);
      const agency_details = await agencyModel.checkAgency({
        agency_id: ref_id || agency_id,
      });
      if (!agency_details?.flight_markup_set) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No commission set has been found for the agency',
        };
      }

      //get sub agent markup
      let markup_amount = undefined;
      if (ref_id) {
        markup_amount = await Lib.getSubAgentTotalMarkup({
          trx,
          type: 'Flight',
          agency_id,
        });
        if (!markup_amount) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'Markup information is empty. Contact with the authority',
          };
        }
      }

      const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
      const apiData = await markupSetFlightApiModel.getMarkupSetFlightApi({
        status: true,
        markup_set_id: agency_details.flight_markup_set,
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
            markup_set_id: agency_details.flight_markup_set,
            reqBody: body,
            set_flight_api_id: sabre_set_flight_api_id,
            markup_amount,
          })
        );
      }
      //WFTT results
      if (wftt_set_flight_api_id) {
        const wfttSubService = new WfttFlightService(trx);
        await sendResults('WFTT', async () =>
          wfttSubService.FlightSearch({
            booking_block: false,
            markup_set_id: agency_details.flight_markup_set,
            reqBody: body,
            set_flight_api_id: wftt_set_flight_api_id,
            markup_amount,
          })
        );
      }
    });
  }
}
