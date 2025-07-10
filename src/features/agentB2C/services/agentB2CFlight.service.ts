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
} from '../../../utils/miscellaneous/flightConstent';
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
  SOURCE_AGENT_B2C,
  TYPE_FLIGHT,
} from '../../../utils/miscellaneous/constants';

export class AgentB2CFlightService extends AbstractServices {
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
        set_id: agency_details?.flight_markup_set,
      });

      //extract API IDs
      let sabre_set_flight_api_id = 0;
      let wftt_set_flight_api_id = 0;

      apiData.forEach((api) => {
        if (api.sup_api === SABRE_API) {
          sabre_set_flight_api_id = api.id;
        }
        if (api.sup_api === CUSTOM_API) {
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
          markup_amount,
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
      let wftt_set_flight_api_id = 0;

      apiData.forEach((api) => {
        if (api.sup_api === SABRE_API) {
          sabre_set_flight_api_id = api.id;
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

      // Sabre results
      if (sabre_set_flight_api_id) {
        const sabreSubService = new SabreFlightService(trx);
        await sendResults('Sabre', async () =>
          sabreSubService.FlightSearch({
            booking_block: false,
            reqBody: body,
            dynamic_fare_supplier_id: sabre_set_flight_api_id,
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
            reqBody: body,
            dynamic_fare_supplier_id: wftt_set_flight_api_id,
            markup_amount,
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
        });

      if (data) {
        await setRedis(`${FLIGHT_REVALIDATE_REDIS_KEY}${flight_id}`, data);
        return {
          success: true,
          message: 'Ticket has been revalidated successfully!',
          data: data,
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
      const { agency_id } = req.agencyB2CWhiteLabel;
      const {
        user_id,
        name,
        user_email,
        agency_email,
        agency_address,
        agency_logo,
        agency_name,
        agency_number,
      } = req.agencyB2CUser;

      const body = req.body as IFlightBookingRequestBody;
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

      //revalidate
      const flightSupportService = new CommonFlightSupportService(trx);
      let rev_data: IFormattedFlightItinerary | null =
        await flightSupportService.FlightRevalidate({
          search_id: body.search_id,
          flight_id: body.flight_id,
          dynamic_fare_set_id: agency_details.flight_markup_set,
        });
      if (!rev_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const data = rev_data;

      //if price has been changed and no confirmation of booking then return
      if (!booking_confirm) {
        const price_changed =
          await flightSupportService.checkBookingPriceChange({
            flight_id: body.flight_id,
            booking_price: Number(data.fare.payable),
          });
        if (price_changed === true) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
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
          route: new FlightUtils().getRouteOfFlight(data.leg_description),
          departure_date: data.flights[0].options[0].departure.date,
          flight_number: `${data.flights[0].options[0].carrier.carrier_marketing_flight_number}`,
          domestic_flight: data.domestic_flight,
          passenger: body.passengers,
        });
      if (!checkEligibilityOfBooking.success) {
        return checkEligibilityOfBooking;
      }

      //if booking is not blocked then book the flight using API
      let refundable = data.refundable;

      //insert booking data
      const { booking_id, booking_ref } =
        await bookingSupportService.insertFlightBookingData({
          status: FLIGHT_BOOKING_IN_PROCESS,
          api_booking_ref: null,
          user_id,
          user_name: name,
          user_email,
          files: (req.files as Express.Multer.File[]) || [],
          refundable,
          ticket_issue_last_time: data.ticket_last_time,
          flight_data: data,
          traveler_data: body.passengers,
          type: 'Agent_Flight',
          source_type: SOURCE_AGENT_B2C,
          source_id: agency_id,
          invoice_ref_type: TYPE_FLIGHT,
          api: data.api,
          vendor_fare: JSON.stringify(data.fare.vendor_price),
        });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'The flight has been booked successfully!',
        data: {
          booking_id,
          booking_ref,
          status: FLIGHT_BOOKING_IN_PROCESS,
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
