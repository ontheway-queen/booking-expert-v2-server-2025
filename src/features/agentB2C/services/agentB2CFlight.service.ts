import AbstractServices from '../../../abstract/abstract.service';
import { Request, Response } from 'express';
import {
  IAirlineCodePayload,
  IFlightSearchReqBody,
  IFormattedFlightItinerary,
  IOriginDestinationInformationPayload,
  IPassengerTypeQuantityPayload,
} from '../../../utils/supportTypes/flightTypes/commonFlightTypes';
import {
  CUSTOM_API,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_FARE_RESPONSE,
  FLIGHT_REVALIDATE_REDIS_KEY,
  SABRE_API,
  VERTEIL_API,
} from '../../../utils/miscellaneous/flightConstant';
import SabreFlightService from '../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service';
import WfttFlightService from '../../../utils/supportServices/flightSupportServices/wfttFlightSupport.service';
import Lib from '../../../utils/lib/lib';
import { v4 as uuidv4 } from 'uuid';
import { getRedis, setRedis } from '../../../app/redis';
import { CommonFlightSupportService } from '../../../utils/supportServices/flightSupportServices/commonFlightSupport.service';
import { IFlightBookingRequestBody } from '../../../utils/supportTypes/bookingSupportTypes/flightBookingSupportTypes/commonFlightBookingTypes';
import { CommonFlightBookingSupportService } from '../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/commonFlightBookingSupport.service';
import FlightUtils from '../../../utils/lib/flight/flightUtils';
import {
  ERROR_LEVEL_INFO,
  SOURCE_AGENT_B2C,
  TYPE_FLIGHT,
} from '../../../utils/miscellaneous/constants';
import VerteilFlightService from '../../../utils/supportServices/flightSupportServices/verteilFlightSupport.service';

export class AgentB2CFlightService extends AbstractServices {
  constructor() {
    super();
  }
  public async flightSearch(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;
      const body = req.body as IFlightSearchReqBody;

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

      //get b2c markup
      const markup_amount = await Lib.getAgentB2CTotalMarkup({
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

      const markupSetFlightApiModel = this.Model.DynamicFareModel(trx);
      const apiData = await markupSetFlightApiModel.getDynamicFareSuppliers({
        status: true,
        set_id: agency_details.flight_markup_set,
      });

      //extract API IDs
      let sabre_set_flight_api_id = 0;
      let verteil_supplier_id = 0;
      let wftt_set_flight_api_id = 0;

      apiData.forEach((api) => {
        if (api.sup_api === SABRE_API) {
          sabre_set_flight_api_id = api.id;
        }
        if (api.sup_api === VERTEIL_API) {
          verteil_supplier_id = api.id;
        }
        if (api.sup_api === CUSTOM_API) {
          wftt_set_flight_api_id = api.id;
        }
      });

      //generate search ID
      const search_id = uuidv4();

      let sabreData: any[] = [];
      let verteilData: any[] = [];
      let wfttData: any[] = [];

      if (sabre_set_flight_api_id) {
        const sabreSubService = new SabreFlightService(trx);
        sabreData = await sabreSubService.FlightSearch({
          booking_block: false,
          reqBody: body,
          dynamic_fare_supplier_id: sabre_set_flight_api_id,
          markup_amount,
        });
      }
      if (verteil_supplier_id) {
        const verteilSubService = new VerteilFlightService(trx);
        verteilData = await verteilSubService.FlightSearchService({
          booking_block: false,
          reqBody: body,
          dynamic_fare_supplier_id: verteil_supplier_id,
          markup_amount,
          search_id
        });
      }

      if (wftt_set_flight_api_id) {
        const wfttSubService = new WfttFlightService(trx);
        wfttData = await wfttSubService.FlightSearch({
          booking_block: false,
          reqBody: body,
          dynamic_fare_supplier_id: wftt_set_flight_api_id,
          markup_amount,
        });
      }

      const leg_descriptions = body.OriginDestinationInformation.map(
        (OrDeInfo) => {
          return {
            departureDate: OrDeInfo.DepartureDateTime,
            departureLocation: OrDeInfo.OriginLocation.LocationCode,
            arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
          };
        }
      );

      const results: any[] = [...sabreData, ...wfttData, ...verteilData];

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
      const { agency_id } = req.agencyB2CWhiteLabel;
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
      const agency_details = await agencyModel.checkAgency({ agency_id });
      if (!agency_details?.flight_markup_set) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No commission set has been found for the agency',
        };
      }

      const markupSetFlightApiModel = this.Model.DynamicFareModel(trx);
      const apiData = await markupSetFlightApiModel.getDynamicFareSuppliers({
        status: true,
        set_id: agency_details?.flight_markup_set,
      });

      //get b2c markup
      const markup_amount = await Lib.getAgentB2CTotalMarkup({
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

      //extract API IDs
      let sabre_set_flight_api_id = 0;
      let verteil_supplier_id = 0;
      let wftt_set_flight_api_id = 0;

      apiData.forEach((api) => {
        if (api.sup_api === SABRE_API) {
          sabre_set_flight_api_id = api.id;
        }
        if (api.sup_api === VERTEIL_API) {
          verteil_supplier_id = api.id;
        }
        if (api.sup_api === CUSTOM_API) {
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

      const tasks: Promise<void>[] = [];

      // Sabre results
      if (sabre_set_flight_api_id) {
        const sabreSubService = new SabreFlightService(trx);
        tasks.push(
          sendResults('Sabre', async () =>
            sabreSubService.FlightSearch({
              booking_block: false,
              reqBody: body,
              dynamic_fare_supplier_id: sabre_set_flight_api_id,
              markup_amount,
            })
          )
        );
      }
      //Verteil results
      if (verteil_supplier_id) {
        const verteilSubService = new VerteilFlightService(trx);
        tasks.push(
          sendResults('Verteil', async () =>
            verteilSubService.FlightSearchService({
              booking_block: false,
              reqBody: body,
              dynamic_fare_supplier_id: verteil_supplier_id,
              markup_amount,
              search_id
            })
          )
        );
      }
      //WFTT results
      if (wftt_set_flight_api_id) {
        const wfttSubService = new WfttFlightService(trx);
        tasks.push(sendResults('WFTT', async () =>
          wfttSubService.FlightSearch({
            booking_block: false,
            reqBody: body,
            dynamic_fare_supplier_id: wftt_set_flight_api_id,
            markup_amount,
          })
        )
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
        data: res ? res : FLIGHT_FARE_RESPONSE,
      };
    });
  }

  public async flightRevalidate(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;
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
      //get b2c markup
      const markup_amount = await Lib.getAgentB2CTotalMarkup({
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

      //revalidate using the flight support service
      const flightSupportService = new CommonFlightSupportService(trx);
      const data: IFormattedFlightItinerary | null =
        await flightSupportService.FlightRevalidate({
          search_id,
          flight_id,
          dynamic_fare_set_id: agency_details.flight_markup_set,
          markup_amount,
        });

      if (data) {
        const { fare, modifiedFare, ...restData } = data;
        const { vendor_price, ...restFare } = fare;

        await setRedis(`${FLIGHT_REVALIDATE_REDIS_KEY}${flight_id}`, data);
        return {
          success: true,
          message: 'Flight has been revalidated successfully!',
          data: { ...restData, fare: restFare },
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
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id, user_email, name } = req.agencyB2CUser;
      const body = req.body as IFlightBookingRequestBody;
      const booking_confirm = body.booking_confirm;

      //get flight markup set id
      const agencyModel = this.Model.AgencyModel(trx);

      const agency_details = await agencyModel.checkAgency({
        agency_id: agency_id,
      });

      if (!agency_details?.flight_markup_set) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No markup set has been found for the agency',
        };
      }

      //get b2c markup
      const markup_amount = await Lib.getAgentB2CTotalMarkup({
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

      //get data from redis using the search id
      const retrievedData = await getRedis(body.search_id);

      if (!retrievedData) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      //revalidate the flight
      const flightSupportService = new CommonFlightSupportService(trx);

      // Match search request pax and booking request pax details=====
      const searchReqBody = retrievedData.reqBody as IFlightSearchReqBody;

      flightSupportService.crossCheckPax({
        bookingPax: body.passengers,
        searchPax: searchReqBody.PassengerTypeQuantity,
      });

      // ============================================================

      let rev_data: IFormattedFlightItinerary | null =
        await flightSupportService.FlightRevalidate({
          search_id: body.search_id,
          flight_id: body.flight_id,
          dynamic_fare_set_id: agency_details.flight_markup_set,
          markup_amount,
        });

      if (!rev_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // if price has been changed and no confirmation of booking then return
      if (!booking_confirm) {
        const price_changed =
          await flightSupportService.checkBookingPriceChange({
            flight_id: body.flight_id,
            booking_price: Number(rev_data.fare.payable),
          });

        if (price_changed === true) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            data: {
              new_fare: rev_data.fare.payable,
            },
            message: this.ResMsg.BOOKING_PRICE_CHANGED,
          };
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

      const checkEligibilityOfBooking =
        await bookingSupportService.checkEligibilityOfBooking({
          route: new FlightUtils().getRouteOfFlight(rev_data.leg_description),
          departure_date: rev_data.flights[0].options[0].departure.date,
          flight_number: `${rev_data.flights[0].options[0].carrier.carrier_marketing_flight_number}`,
          domestic_flight: rev_data.domestic_flight,
          passenger: body.passengers,
        });

      if (!checkEligibilityOfBooking.success) {
        return checkEligibilityOfBooking;
      }

      //check if the booking is block
      const directBookingPermission =
        await bookingSupportService.checkDirectFlightBookingPermission({
          markup_set_id: agency_details.flight_markup_set,
          api_name: rev_data.api,
          airline: rev_data.carrier_code,
        });

      if (directBookingPermission.success === false) {
        return directBookingPermission;
      }

      //insert the revalidate data as info log
      await this.Model.ErrorLogsModel(trx).insertErrorLogs({
        http_method: 'POST',
        level: ERROR_LEVEL_INFO,
        message: 'Flight booking revalidate data',
        url: '/flight/booking',
        user_id: user_id,
        source: 'AGENT B2C',
        metadata: {
          api: rev_data.api,
          request_body: {
            flight_id: body.flight_id,
            search_id: body.search_id,
            api_search_id: rev_data.api_search_id,
          },
          response: rev_data,
        },
      });

      //insert booking data with invoice
      const { booking_id, booking_ref } =
        await bookingSupportService.insertFlightBookingData({
          status: FLIGHT_BOOKING_IN_PROCESS,
          user_id,
          user_name: name,
          user_email,
          files: (req.files as Express.Multer.File[]) || [],
          refundable: rev_data.refundable,
          flight_data: rev_data,
          traveler_data: body.passengers,
          type: 'Agent_Flight',
          source_type: SOURCE_AGENT_B2C,
          source_id: agency_id,
          invoice_ref_type: TYPE_FLIGHT,
          booking_block: directBookingPermission.booking_block,
        });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: {
          booking_id,
          booking_ref,
        },
      };
    });
  }

  public async getAllBookingList(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;
      const { user_id } = req.agencyB2CUser;
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const query = req.query;
      const data = await flightBookingModel.getFlightBookingList(
        {
          ...query,
          source_id: agency_id,
          created_by: user_id,
          booked_by: SOURCE_AGENT_B2C,
        },
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
      const { agency_id } = req.agencyB2CWhiteLabel;
      const { user_id } = req.agencyB2CUser;
      const { id } = req.params;
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const flightSegmentModel = this.Model.FlightBookingSegmentModel(trx);
      const flightTravelerModel = this.Model.FlightBookingTravelerModel(trx);
      const flightPriceBreakdownModel =
        this.Model.FlightBookingPriceBreakdownModel(trx);

      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: Number(id),
        booked_by: SOURCE_AGENT_B2C,
        agency_id,
        user_id,
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

      const {
        vendor_fare,
        source_type,
        source_id,
        source_email,
        api,
        api_booking_ref,
        ...restData
      } = booking_data;

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: {
          ...restData,
          price_breakdown_data,
          segment_data,
          traveler_data,
        },
      };
    });
  }
}
