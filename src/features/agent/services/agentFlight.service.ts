import { Request, Response } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { IAirlineCodePayload, IFormattedFlightItinerary, IMultiAPIFlightSearchReqBody, IMultipleApiFlightBookingRequestBody, IOriginDestinationInformationPayload, IPassengerTypeQuantityPayload } from "../../../utils/supportTypes/flightTypes/commonFlightTypes";
import { FLIGHT_BOOKING_CONFIRMED, FLIGHT_BOOKING_IN_PROCESS, FLIGHT_FARE_RESPONSE, FLIGHT_REVALIDATE_REDIS_KEY, SABRE_API } from "../../../utils/miscellaneous/flightConstent";
import { v4 as uuidv4 } from "uuid";
import { getRedis, setRedis } from "../../../app/redis";
import SabreFlightService from "../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service";
import { CommonFlightSupportService } from "../../../utils/supportServices/flightSupportServices/commonFlightSupport.service";
import FlightUtils from "../../../utils/lib/flight/flightUtils";
import { CommonFlightBookingSupportService } from "../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/commonFlightBookingSupport.service";
import { ERROR_LEVEL_INFO, SOURCE_AGENT } from "../../../utils/miscellaneous/constants";

export class AgentFlightService extends AbstractServices {
  constructor() {
    super();
  }


  public async flightSearch(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const body = req.body as IMultiAPIFlightSearchReqBody;
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

      let sabreData: any[] = [];
      if (sabre_set_flight_api_id) {
        const sabreSubService = new SabreFlightService(trx);
        sabreData = await sabreSubService.FlightSearch({
          booking_block: false,
          markup_set_id: agency_details.flight_markup_set,
          reqBody: body,
          set_flight_api_id: sabre_set_flight_api_id,
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

      const results: any[] = [...sabreData];

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
      const { agency_id } = req.agencyUser;
      const JourneyType = req.query.JourneyType as string;
      const OriginDestinationInformation = req.query.OriginDestinationInformation as unknown as IOriginDestinationInformationPayload[];
      const PassengerTypeQuantity = req.query.PassengerTypeQuantity as unknown as IPassengerTypeQuantityPayload[];
      const airline_code = req.query.airline_code as unknown as IAirlineCodePayload[];

      const body = {
        JourneyType,
        OriginDestinationInformation,
        PassengerTypeQuantity,
        airline_code
      } as unknown as IMultiAPIFlightSearchReqBody;

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

      console.log({ apiData });

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

  public async getFlightFareRule(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { flight_id, search_id } = req.query as {
        flight_id: string;
        search_id: string;
      };
      //get data from redis using the search id
      const retrievedData = await getRedis(search_id);
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
        data: res ? res : FLIGHT_FARE_RESPONSE
      };
    });
  }

  public async flightRevalidate(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const { flight_id, search_id } = req.query as {
        flight_id: string;
        search_id: string;
      };
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
      //revalidate using the flight support service
      const flightSupportService = new CommonFlightSupportService(trx);
      const data: IFormattedFlightItinerary | null = await flightSupportService.FlightRevalidate(
        {
          search_id,
          flight_id,
          markup_set_id: agency_details.flight_markup_set
        }
      );

      if (data) {
        await setRedis(`${FLIGHT_REVALIDATE_REDIS_KEY}${flight_id}`, data);
        return {
          success: true,
          message: "Ticket has been revalidated successfully!",
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

  public async flightBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id, user_email, name, phone_number } = req.agencyUser;
      const body = req.body as IMultipleApiFlightBookingRequestBody;
      const booking_confirm = req.query.booking_confirm;
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

      //revalidate
      const flightSupportService = new CommonFlightSupportService(trx);
      const data: IFormattedFlightItinerary | null = await flightSupportService.FlightRevalidate(
        {
          search_id: body.search_id,
          flight_id: body.flight_id,
          markup_set_id: agency_details.flight_markup_set
        }
      );
      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      //if price has been changed and no confirmation of booking then return
      if (!booking_confirm) {
        const price_changed = await flightSupportService.checkBookingPriceChange({ flight_id: body.flight_id, booking_price: data.fare.total_price });
        if (price_changed === true) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: this.ResMsg.BOOKING_PRICE_CHANGED
          }
        } else if (price_changed === null) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: this.ResMsg.REVALIDATE_BEFORE_BOOKING,
          };
        }
      }

      //check eligibility of the booking
      const bookingSupportService = new CommonFlightBookingSupportService(trx);
      const checkEligibilityOfBooking = await bookingSupportService.checkEligibilityOfBooking({
        route: new FlightUtils().getRouteOfFlight(data.leg_description),
        departure_date: data.flights[0].options[0].departure.date,
        flight_number: `${data.flights[0].options[0].carrier.carrier_marketing_flight_number}`,
        domestic_flight: data.domestic_flight,
        passenger: body.passengers
      });
      if (!checkEligibilityOfBooking.success) {
        return checkEligibilityOfBooking;
      }

      //check if the booking is block
      const directBookingPermission = await bookingSupportService.checkDirectFlightBookingPermission({
        markup_set_id: agency_details.flight_markup_set,
        api_name: data.api,
        airline: data.carrier_code
      });

      if (directBookingPermission.success === false) {
        return directBookingPermission;
      }

      //if booking is not blocked then book the flight using API
      let airline_pnr: string | null = null;
      let refundable = data.refundable;
      let gds_pnr: string | null = null;
      let api_booking_ref: string | null = null;
      if (directBookingPermission.booking_block === false) {
        if (data.api === SABRE_API) {
          const sabreSubService = new SabreFlightService(trx);
          gds_pnr = await sabreSubService.FlightBookingService({
            body,
            user_info: { id: user_id, name, email: user_email, phone: phone_number || "" },
            revalidate_data: data
          });
          //get airline pnr, refundable status
          const grnData = await sabreSubService.GRNUpdate({
            pnr: String(gds_pnr),
          });
          airline_pnr = grnData.airline_pnr;
          refundable = grnData.refundable;
        }
      }

      //insert the revalidate data as info log
      const log_id = await this.Model.ErrorLogsModel().insertErrorLogs({
        http_method: "POST",
        level: ERROR_LEVEL_INFO,
        message: "Flight booking revalidate data",
        url: "/flight/booking",
        user_id: user_id,
        source: "AGENT",
        metadata: {
          api: data.api,
          request_body: {
            flight_id: body.flight_id,
            search_id: body.search_id,
            api_search_id: data.api_search_id
          },
          response: data
        }
      });

      //insert booking data
      const { booking_id, booking_ref } = await bookingSupportService.insertFlightBookingData({
        gds_pnr,
        airline_pnr,
        status: directBookingPermission.booking_block ? FLIGHT_BOOKING_IN_PROCESS : FLIGHT_BOOKING_CONFIRMED,
        api_booking_ref,
        user_id,
        user_name: name,
        user_email,
        files: (req.files as Express.Multer.File[]) || [],
        refundable,
        last_time: data.ticket_last_time,
        flight_data: data,
        traveler_data: body.passengers,
        type: "Agent_Flight",
        source_type: SOURCE_AGENT,
        source_id: agency_id,
      });

      //if booking insertion is successful then delete the revalidate log
      await this.Model.ErrorLogsModel(trx).deleteErrorLogs(log_id[0].id);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "The flight has been booked successfully!",
        data: {
          booking_id,
          booking_ref,
          gds_pnr,
          status: directBookingPermission.booking_block ? FLIGHT_BOOKING_IN_PROCESS : FLIGHT_BOOKING_CONFIRMED
        }
      }
    });
  }

  public async getAllBookingList(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const query = req.query;
      const data = await flightBookingModel.getFlightBookingList({ ...query, source_id: agency_id, booked_by: SOURCE_AGENT }, true);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        total: data.total,
        data: data.data
      };
    });
  }

  public async getSingleBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const { id } = req.params;
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const flightSegmentModel = this.Model.FlightBookingSegmentModel(trx);
      const flightTravelerModel = this.Model.FlightBookingTravelerModel(trx);
      const flightPriceBreakdownModel = this.Model.FlightBookingPriceBreakdownModel(trx);

      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: Number(id),
        booked_by: SOURCE_AGENT,
        agency_id
      });

      if (!booking_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND
        };
      };

      const price_breakdown_data = await flightPriceBreakdownModel.getFlightBookingPriceBreakdown(Number(id));
      const segment_data = await flightSegmentModel.getFlightBookingSegment(Number(id));
      const traveler_data = await flightTravelerModel.getFlightBookingTraveler(Number(id));

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: {
          ...booking_data,
          price_breakdown_data,
          segment_data,
          traveler_data
        }
      };
    });
  }

}


