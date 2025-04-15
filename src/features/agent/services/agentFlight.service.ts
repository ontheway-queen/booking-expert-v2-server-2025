import { Request, Response } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { IAirlineCodePayload, IMultiAPIFlightSearchReqBody, IOriginDestinationInformationPayload, IPassengerTypeQuantityPayload } from "../../../utils/supportTypes/flightTypes/commonFlightTypes";
import { SABRE_API } from "../../../utils/miscellaneous/flightConstent";
import { v4 as uuidv4 } from "uuid";
import { setRedis } from "../../../app/redis";

export class AgentFlightService extends AbstractServices {
  constructor() {
    super();
  }

  //flight search
  public async flightSearch(req: Request, res: Response) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agent;
      const JourneyType = req.query.JourneyType as string;
      const OriginDestinationInformation = req.query.OriginDestinationInformation as unknown as IOriginDestinationInformationPayload[];
      const PassengerTypeQuantity = req.query.PassengerTypeQuantity as unknown as IPassengerTypeQuantityPayload[];
      const airline_code = req.query.airline_code as unknown as IAirlineCodePayload[];

      const body = {
        JourneyType,
        OriginDestinationInformation,
        PassengerTypeQuantity,
        airline_code
      } as unknown as IMultiAPIFlightSearchReqBody

      //get flight markup set id
      const agencyModel = this.Model.AgencyModel(trx);
      const agency_details = await agencyModel.checkAgency({ agency_id });
      if (!agency_details?.flight_markup_set) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No commission set has been found for the agency',
        };
      }

      const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
      const apiData = await markupSetFlightApiModel.getMarkupSetFlightApi({
        status: true,
        markup_set_id: agency_details.flight_markup_set
      });

      //extract API IDs
      let sabre_set_flight_api_id = 0;

      apiData.forEach((api) => {
        if (api.api_name === SABRE_API) {
          sabre_set_flight_api_id = api.id;
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
        `data: ${JSON.stringify({ search_id, leg_description: leg_descriptions })}\n\n`
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
          res.write(
            `data: ${JSON.stringify(result)}\n\n`
          );
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
          })
        );
      }

    });

  }


}


