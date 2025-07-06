import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import AbstractServices from '../../../abstract/abstract.service';
import { getRedis, setRedis } from '../../../app/redis';
import FlightUtils from '../../../utils/lib/flight/flightUtils';
import {
  AGENT_PROJECT_LINK,
  ERROR_LEVEL_INFO,
  FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT,
  INVOICE_REF_TYPES,
  SOURCE_AGENT,
} from '../../../utils/miscellaneous/constants';
import {
  CUSTOM_API,
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_BOOKING_REQUEST,
  FLIGHT_FARE_RESPONSE,
  FLIGHT_REVALIDATE_REDIS_KEY,
  FLIGHT_TICKET_IN_PROCESS,
  FLIGHT_TICKET_ISSUE,
  SABRE_API,
  WFTT_API,
} from '../../../utils/miscellaneous/flightConstent';
import { AgentFlightBookingSupportService } from '../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/agentFlightBookingSupport.service';
import { CommonFlightBookingSupportService } from '../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/commonFlightBookingSupport.service';
import { CommonFlightSupportService } from '../../../utils/supportServices/flightSupportServices/commonFlightSupport.service';
import SabreFlightService from '../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service';
import WfttFlightService from '../../../utils/supportServices/flightSupportServices/wfttFlightSupport.service';
import { IFlightBookingRequestBody } from '../../../utils/supportTypes/bookingSupportTypes/flightBookingSupportTypes/commonFlightBookingTypes';
import {
  IAirlineCodePayload,
  IFlightSearchReqBody,
  IFormattedFlightItinerary,
  IOriginDestinationInformationPayload,
  IPassengerTypeQuantityPayload,
} from '../../../utils/supportTypes/flightTypes/commonFlightTypes';
import {
  IAgentFlightTicketIssueReqBody,
  IAgentGetFlightBookingReqQuery,
} from '../utils/types/agentFlight.types';
import Lib from '../../../utils/lib/lib';

export class AgentFlightService extends AbstractServices {
  constructor() {
    super();
  }

  public async flightSearch(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, ref_id } = req.agencyUser;
      const body = req.body as IFlightSearchReqBody;
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

      const markupSetFlightApiModel = this.Model.DynamicFareModel(trx);
      const apiData = await markupSetFlightApiModel.getDynamicFareSuppliers({
        status: true,
        set_id: agency_details.flight_markup_set,
      });

      //extract API IDs
      let sabre_supplier_id = 0;
      let custom_supplier_id = 0;

      apiData.forEach((api) => {
        if (api.sup_api === SABRE_API) {
          sabre_supplier_id = api.id;
        }
        if (api.sup_api === WFTT_API) {
          custom_supplier_id = api.id;
        }
      });

      let sabreData: any[] = [];
      let wfttData: any[] = [];

      if (sabre_supplier_id) {
        const sabreSubService = new SabreFlightService(trx);
        sabreData = await sabreSubService.FlightSearch({
          booking_block: false,
          reqBody: body,
          dynamic_fare_supplier_id: sabre_supplier_id,
          markup_amount,
        });
      }
      if (custom_supplier_id) {
        const wfttSubService = new WfttFlightService(trx);
        wfttData = await wfttSubService.FlightSearch({
          booking_block: false,
          reqBody: body,
          dynamic_fare_supplier_id: custom_supplier_id,
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

      const markupSetFlightApiModel = this.Model.DynamicFareModel(trx);
      const apiData = await markupSetFlightApiModel.getDynamicFareSuppliers({
        status: true,
        set_id: agency_details.flight_markup_set,
      });

      //extract API IDs
      let sabre_supplier_id = 0;
      let custom_supplier_id = 0;

      apiData.forEach((api) => {
        if (api.sup_api === SABRE_API) {
          sabre_supplier_id = api.id;
        }
        if (api.sup_api === WFTT_API) {
          custom_supplier_id = api.id;
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
      if (sabre_supplier_id) {
        const sabreSubService = new SabreFlightService(trx);
        await sendResults('Sabre', async () =>
          sabreSubService.FlightSearch({
            booking_block: false,
            reqBody: body,
            dynamic_fare_supplier_id: sabre_supplier_id,
            markup_amount,
          })
        );
      }

      //WFTT results
      if (custom_supplier_id) {
        const wfttSubService = new WfttFlightService(trx);
        await sendResults('WFTT', async () =>
          wfttSubService.FlightSearch({
            booking_block: false,
            reqBody: body,
            dynamic_fare_supplier_id: custom_supplier_id,
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
      const { agency_id, ref_id } = req.agencyUser;
      const { flight_id, search_id } = req.query as {
        flight_id: string;
        search_id: string;
      };
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
      const {
        agency_id,
        ref_id,
        user_id,
        user_email,
        name,
        phone_number,
        agency_email,
        agency_name,
        agency_logo,
        address,
      } = req.agencyUser;

      const body = req.body as IFlightBookingRequestBody;
      const booking_confirm = req.query.booking_confirm;
      //get flight markup set id
      const agencyModel = this.Model.AgencyModel(trx);
      const agency_details = await agencyModel.checkAgency({
        agency_id: ref_id || agency_id,
      });
      if (!agency_details?.flight_markup_set) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No markup set has been found for the agency',
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
            booking_price: data.fare.payable,
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

      //check if the booking is block
      const directBookingPermission =
        await bookingSupportService.checkDirectFlightBookingPermission({
          markup_set_id: agency_details.flight_markup_set,
          api_name: data.api,
          airline: data.carrier_code,
        });

      if (directBookingPermission.success === false) {
        return directBookingPermission;
      }

      //if booking is not blocked then book the flight using API
      let airline_pnr: string | null = null;
      let refundable = data.refundable;
      let gds_pnr: string | null = null;
      let api_booking_ref: string | null = null;
      let status:
        | typeof FLIGHT_BOOKING_IN_PROCESS
        | typeof FLIGHT_BOOKING_CONFIRMED =
        directBookingPermission.booking_block
          ? FLIGHT_BOOKING_IN_PROCESS
          : FLIGHT_BOOKING_CONFIRMED;
      if (directBookingPermission.booking_block === false) {
        if (data.api === SABRE_API) {
          const sabreSubService = new SabreFlightService(trx);
          gds_pnr = await sabreSubService.FlightBookingService({
            body,
            user_info: {
              id: user_id,
              name,
              email: user_email,
              phone: phone_number || '',
            },
            revalidate_data: data,
          });
          //get airline pnr, refundable status
          const grnData = await sabreSubService.GRNUpdate({
            pnr: String(gds_pnr),
          });
          airline_pnr = grnData.airline_pnr;
          refundable = grnData.refundable;
        } else if (data.api === CUSTOM_API) {
          status = FLIGHT_BOOKING_IN_PROCESS;
        }
      }

      //insert the revalidate data as info log
      const log_id = await this.Model.ErrorLogsModel().insertErrorLogs({
        http_method: 'POST',
        level: ERROR_LEVEL_INFO,
        message: 'Flight booking revalidate data',
        url: '/flight/booking',
        user_id: user_id,
        source: 'AGENT',
        metadata: {
          api: data.api,
          request_body: {
            flight_id: body.flight_id,
            search_id: body.search_id,
            api_search_id: data.api_search_id,
          },
          response: data,
        },
      });

      //insert booking data with invoice
      const { booking_id, booking_ref } =
        await bookingSupportService.insertFlightBookingData({
          gds_pnr,
          airline_pnr,
          status,
          api_booking_ref,
          user_id,
          user_name: name,
          user_email,
          files: (req.files as Express.Multer.File[]) || [],
          refundable,
          last_time: data.ticket_last_time,
          flight_data: data,
          traveler_data: body.passengers,
          type: 'Agent_Flight',
          source_type: SOURCE_AGENT,
          source_id: agency_id,
          invoice_ref_type: INVOICE_REF_TYPES.agent_flight_booking,
          booking_block: directBookingPermission.booking_block,
          api: data.api,
        });

      //if booking insertion is successful then delete the revalidate log
      await this.Model.ErrorLogsModel(trx).deleteErrorLogs(log_id[0].id);

      //send email
      const bookingSubService = new CommonFlightBookingSupportService(trx);

      await bookingSubService.sendFlightBookingMail({
        booking_id: Number(booking_id),
        email: agency_email,
        booked_by: SOURCE_AGENT,
        agency: {
          email: agency_email,
          name: agency_name,
          phone: String(phone_number),
          address: address,
          photo: agency_logo,
        },
        panel_link: `${AGENT_PROJECT_LINK}${FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT}${booking_id}`,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'The flight has been booked successfully!',
        data: {
          booking_id,
          booking_ref,
          gds_pnr,
          status: directBookingPermission.booking_block
            ? FLIGHT_BOOKING_IN_PROCESS
            : FLIGHT_BOOKING_CONFIRMED,
        },
      };
    });
  }

  public async getAllBookingList(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const query = req.query as IAgentGetFlightBookingReqQuery;

      const data = await flightBookingModel.getFlightBookingList(
        { ...query, source_id: agency_id, booked_by: SOURCE_AGENT },
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
      const { agency_id } = req.agencyUser;
      const { id } = req.params;
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const flightSegmentModel = this.Model.FlightBookingSegmentModel(trx);
      const flightTravelerModel = this.Model.FlightBookingTravelerModel(trx);
      const flightPriceBreakdownModel =
        this.Model.FlightBookingPriceBreakdownModel(trx);

      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: Number(id),
        booked_by: SOURCE_AGENT,
        agency_id,
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

  public async issueTicket(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params; //booking id
      const {
        agency_id,
        user_id,
        agency_email,
        agency_name,
        phone_number,
        agency_logo,
        address,
      } = req.agencyUser;

      //get flight details
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const bookingTravelerModel = this.Model.FlightBookingTravelerModel(trx);
      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: Number(id),
        booked_by: SOURCE_AGENT,
        agency_id,
      });
      if (!booking_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // if (booking_data.status !== FLIGHT_BOOKING_CONFIRMED) {
      //   return {
      //     success: false,
      //     code: this.StatusCode.HTTP_BAD_REQUEST,
      //     message: "Issue is not allowed for this booking. Contact support team."
      //   }
      // }

      //get other information
      const get_travelers = await bookingTravelerModel.getFlightBookingTraveler(
        Number(id)
      );

      const { payment_type } = req.body as IAgentFlightTicketIssueReqBody;

      //get payment details
      const bookingSubService = new CommonFlightBookingSupportService(trx);
      const agentBookingSubService = new AgentFlightBookingSupportService(trx);
      const payment_data = await agentBookingSubService.getPaymentInformation({
        booking_id: Number(id),
        payment_type: payment_type,
        refundable: booking_data.refundable,
        departure_date: booking_data.travel_date,
        agency_id: agency_id,
        ticket_price: booking_data.payable_amount,
      });

      if (payment_data.success === false) {
        return payment_data;
      }

      //check direct ticket issue permission
      const flightSegmentsModel = this.Model.FlightBookingSegmentModel(trx);
      const flightSegment = await flightSegmentsModel.getFlightBookingSegment(
        Number(id)
      );
      const agentFlightBookingSupportService =
        new AgentFlightBookingSupportService(trx);
      const ticketIssuePermission =
        await agentFlightBookingSupportService.checkAgentDirectTicketIssuePermission(
          {
            agency_id: agency_id,
            api_name: booking_data.api,
            airline: flightSegment[0].airline_code,
          }
        );

      if (ticketIssuePermission.success === false) {
        return ticketIssuePermission;
      }

      let status:
        | typeof FLIGHT_TICKET_ISSUE
        | typeof FLIGHT_TICKET_IN_PROCESS
        | null = null;
      if (ticketIssuePermission.issue_block === true) {
        status = FLIGHT_TICKET_IN_PROCESS;
      } else if (booking_data.api === CUSTOM_API) {
        status = FLIGHT_TICKET_IN_PROCESS;
      } else {
        //issue ticket using API
        if (booking_data.api === SABRE_API) {
          const travelerSet = new Set(get_travelers.map((elem) => elem.type));
          const unique_traveler = travelerSet.size;

          const sabreSubService = new SabreFlightService(trx);
          const res = await sabreSubService.TicketIssueService({
            pnr: String(booking_data.gds_pnr),
            unique_traveler,
          });
          if (res?.success) {
            status = FLIGHT_TICKET_ISSUE;
          }
        }
      }
      if (status !== null) {
        await agentFlightBookingSupportService.updateDataAfterTicketIssue({
          booking_id: Number(id),
          status,
          due: Number(payment_data.due),
          agency_id: agency_id,
          booking_ref: booking_data.booking_ref,
          deduct_amount_from: payment_data.deduct_amount_from as
            | 'Both'
            | 'Loan'
            | 'Balance',
          paid_amount: Number(payment_data.paid_amount),
          loan_amount: Number(payment_data.loan_amount),
          invoice_id: Number(payment_data.invoice_id),
          user_id,
          issued_by_type: SOURCE_AGENT,
          issued_by_user_id: user_id,
          issue_block: ticketIssuePermission.issue_block,
          api: booking_data.api,
        });

        //send email
        await bookingSubService.sendTicketIssueMail({
          booking_id: Number(id),
          email: agency_email,
          booked_by: SOURCE_AGENT,
          agency: {
            email: agency_email,
            name: agency_name,
            phone: String(phone_number),
            address: address,
            photo: agency_logo,
          },
          panel_link: `${AGENT_PROJECT_LINK}${FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT}${id}`,
          due: Number(payment_data.due),
        });
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: 'Ticket has been issued successfully!',
          data: {
            status,
            due: payment_data.due,
            paid_amount: payment_data.paid_amount,
            loan_amount: payment_data.loan_amount,
          },
        };
      }

      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'Cannot issue ticket for this booking. Contact support team.',
      };
    });
  }

  public async cancelBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id, agency_id, agency_email, agency_logo } = req.agencyUser;
      const { id } = req.params; //booking id
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: Number(id),
        booked_by: SOURCE_AGENT,
        agency_id,
      });
      if (!booking_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (
        ![
          FLIGHT_BOOKING_CONFIRMED,
          FLIGHT_BOOKING_REQUEST,
          FLIGHT_BOOKING_IN_PROCESS,
        ].includes(booking_data.status)
      ) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message:
            'Cancellation is not allowed for this booking. Contact support team.',
        };
      }

      let status = false;
      if (booking_data.api === SABRE_API) {
        const sabreSubService = new SabreFlightService(trx);
        const res = await sabreSubService.SabreBookingCancelService({
          pnr: String(booking_data.gds_pnr),
        });
        if (res?.success) {
          status = true;
        }
      } else if (booking_data.api === CUSTOM_API) {
        status = true;
      }

      if (status) {
        const flightBookingSupportService =
          new CommonFlightBookingSupportService(trx);
        //update booking data
        await flightBookingSupportService.updateDataAfterBookingCancel({
          booking_id: Number(id),
          booking_ref: booking_data.booking_ref,
          cancelled_by_type: SOURCE_AGENT,
          cancelled_by_user_id: user_id,
          api: booking_data.api,
        });

        //send email
        await flightBookingSupportService.sendBookingCancelMail({
          email: agency_email,
          booking_data,
          agency: {
            photo: agency_logo,
          },
          panel_link: `${AGENT_PROJECT_LINK}${FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT}${id}`,
        });

        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: 'Booking has been cancelled successfully!',
        };
      }

      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'Cannot cancel this booking. Contact support team.',
      };
    });
  }
}
