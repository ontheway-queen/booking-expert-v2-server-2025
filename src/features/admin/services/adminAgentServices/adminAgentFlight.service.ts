import AbstractServices from '../../../../abstract/abstract.service';
import { Request } from 'express';
import {
  AGENT_PROJECT_LINK,
  FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT,
  GENERATE_AUTO_UNIQUE_ID,
  SOURCE_ADMIN,
  SOURCE_AGENT,
  TYPE_FLIGHT,
} from '../../../../utils/miscellaneous/constants';
import {
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_EXPIRED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_BOOKING_ON_HOLD,
  FLIGHT_BOOKING_PENDING,
  FLIGHT_BOOKING_REFUNDED,
  FLIGHT_TICKET_IN_PROCESS,
  FLIGHT_TICKET_ISSUE,
  PAYMENT_TYPE_FULL,
  SABRE_API,
  VERTEIL_API,
} from '../../../../utils/miscellaneous/flightConstant';
import SabreFlightService from '../../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service';
import { CommonFlightBookingSupportService } from '../../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/commonFlightBookingSupport.service';
import { AgentFlightBookingSupportService } from '../../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/agentFlightBookingSupport.service';
import { IAdminUpdateFlightBookingReqBody } from '../../utils/types/adminAgentTypes/adminAgentFlight.types';
import Lib from '../../../../utils/lib/lib';
import { IUpdateFlightBookingPayload } from '../../../../utils/modelTypes/flightModelTypes/flightBookingModelTypes';
import { IAgentUpdateDataAfterTicketIssue } from '../../../../utils/supportTypes/bookingSupportTypes/flightBookingSupportTypes/agentFlightBookingTypes';
import VerteilFlightService from '../../../../utils/supportServices/flightSupportServices/verteilFlightSupport.service';

export class AdminAgentFlightService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAllFlightBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const query = req.query;
      const data = await flightBookingModel.getFlightBookingList(
        { ...query, booked_by: SOURCE_AGENT },
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
      const invoiceModel = this.Model.InvoiceModel(trx);

      const booking_id = Number(id);
      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: booking_id,
        booked_by: SOURCE_AGENT,
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
          booking_id
        );
      const segment_data = await flightSegmentModel.getFlightBookingSegment(
        booking_id
      );
      const traveler_data = await flightTravelerModel.getFlightBookingTraveler(
        booking_id
      );

      const modified_fare_amount =
        await flightPriceBreakdownModel.getFlightBookingModifiedAmount(
          booking_id
        );

      const invoice = await invoiceModel.getSingleInvoice({
        source_type: SOURCE_AGENT,
        ref_id: Number(id),
        ref_type: TYPE_FLIGHT,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: {
          ...booking_data,
          price_breakdown_data,
          segment_data,
          traveler_data,
          invoice: {
            id: invoice?.id,
            invoice_no: invoice?.invoice_no,
            total_amount: invoice?.total_amount,
            due: invoice?.due,
            status: invoice?.status,
          },
          modified_fare_amount: modified_fare_amount[0],
        },
      };
    });
  }

  public async getBookingTrackingData(req: Request) {
    return await this.db.transaction(async (trx) => {
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const bookingTrackingModel = this.Model.FlightBookingTrackingModel();
      const { id } = req.params;
      const { limit, skip } = req.query as unknown as {
        limit: number;
        skip: number;
      };

      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: Number(id),
        booked_by: SOURCE_AGENT,
      });

      if (!booking_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const tracking_data = await bookingTrackingModel.getFlightBookingTracking(
        { flight_booking_id: Number(id), limit, skip },
        true
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        total: tracking_data.total,
        data: tracking_data.data,
      };
    });
  }

  //(AUTO CANCELLATION USING API)
  public async cancelBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id } = req.admin;
      const { id } = req.params; //booking id
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: Number(id),
        booked_by: SOURCE_AGENT,
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
          FLIGHT_BOOKING_PENDING,
          FLIGHT_BOOKING_IN_PROCESS,
        ].includes(booking_data.status)
      ) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message:
            'Cancellation is not allowed for this booking. Check the booking status.',
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
      } else if (booking_data.api === VERTEIL_API) {
        const bookingSegmentModel = this.Model.FlightBookingSegmentModel(trx);
        const segmentDetails = await bookingSegmentModel.getFlightBookingSegment(Number(id));
        const verteilSubService = new VerteilFlightService(trx);
        const res = await verteilSubService.OrderCancelService({
          airlineCode: segmentDetails[0].airline_code,
          pnr: String(booking_data.airline_pnr),
        });
        if (res.success) {
          status = true;
        }
      }

      if (status) {
        const flightBookingSupportService =
          new CommonFlightBookingSupportService(trx);
        //update booking data
        await flightBookingSupportService.updateDataAfterBookingCancel({
          booking_id: Number(id),
          booking_ref: booking_data.booking_ref,
          cancelled_by_type: SOURCE_ADMIN,
          cancelled_by_user_id: user_id,
          api: booking_data.api,
        });

        //send email
        await flightBookingSupportService.sendBookingCancelMail({
          email: booking_data.source_email,
          booking_data,
          agency: {
            photo: String(booking_data.source_logo),
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
        message: 'Cannot cancel this booking. See error log for more details.',
      };
    });
  }

  //(AUTO TICKET ISSUE USING API)
  public async issueTicket(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params; //booking id
      const { user_id } = req.admin;

      //get flight details
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const bookingTravelerModel = this.Model.FlightBookingTravelerModel(trx);
      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: Number(id),
        booked_by: SOURCE_AGENT,
      });
      if (!booking_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (booking_data.status !== FLIGHT_BOOKING_CONFIRMED) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message:
            'Issue is not allowed for this booking. Only confirmed booking can be issued.',
        };
      }

      let ticket_number: string[] = [];

      //get other information
      const get_travelers = await bookingTravelerModel.getFlightBookingTraveler(
        Number(id)
      );

      //get payment details
      const bookingSubService = new CommonFlightBookingSupportService(trx);
      const agentBookingSubService = new AgentFlightBookingSupportService(trx);
      const payment_data = await agentBookingSubService.getPaymentInformation({
        booking_id: Number(id),
        payment_type: PAYMENT_TYPE_FULL,
        refundable: booking_data.refundable,
        departure_date: booking_data.travel_date,
        agency_id: Number(booking_data.source_id),
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
      const ticketIssuePermission =
        await agentBookingSubService.checkAgentDirectTicketIssuePermission({
          agency_id: Number(booking_data.source_id),
          api_name: booking_data.api,
          airline: flightSegment[0].airline_code,
        });

      if (ticketIssuePermission.success === false) {
        return ticketIssuePermission;
      }

      let status:
        | typeof FLIGHT_TICKET_ISSUE
        | typeof FLIGHT_TICKET_IN_PROCESS
        | typeof FLIGHT_BOOKING_ON_HOLD
        | null = null;
      if (ticketIssuePermission.issue_block === true) {
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
            status = res.data?.length ? FLIGHT_TICKET_ISSUE : FLIGHT_BOOKING_ON_HOLD;
            ticket_number = res.data;
          }
        } else if (booking_data.api === VERTEIL_API) {
          const bookingSegmentModel = this.Model.FlightBookingSegmentModel(trx);
          const segmentDetails = await bookingSegmentModel.getFlightBookingSegment(Number(id));
          const verteilSubService = new VerteilFlightService(trx);
          const res = await verteilSubService.TicketIssueService({
            airlineCode: segmentDetails[0].airline_code,
            oldFare: {
              vendor_total: booking_data.vendor_fare.net_fare,
            },
            passengers: get_travelers,
            pnr: String(booking_data.airline_pnr),
          });

          if (res?.success) {
            status = res.data?.length ? FLIGHT_TICKET_ISSUE : FLIGHT_BOOKING_ON_HOLD;
            if (res?.data?.length) ticket_number = res.data;
          }
        }
      }
      if (status !== null) {
        const agencyModel = this.Model.AgencyModel(trx);
        const agency_data = await agencyModel.getSingleAgency({
          id: Number(booking_data.source_id),
          type: SOURCE_AGENT,
        });
        if (!agency_data) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: this.ResMsg.HTTP_NOT_FOUND,
          };
        }

        await agentBookingSubService.updateDataAfterTicketIssue({
          booking_id: Number(id),
          status,
          due: Number(payment_data.due),
          agency_id: Number(booking_data.source_id),
          booking_ref: booking_data.booking_ref,
          deduct_amount_from: payment_data.deduct_amount_from as
            | 'Both'
            | 'Loan'
            | 'Balance',
          paid_amount: Number(payment_data.paid_amount),
          loan_amount: Number(payment_data.loan_amount),
          invoice_id: Number(payment_data.invoice_id),
          user_id: booking_data.created_by,
          issued_by_type: SOURCE_ADMIN,
          issued_by_user_id: user_id,
          issue_block: ticketIssuePermission.issue_block,
          api: booking_data.api,
          ticket_number,
          travelers_info: get_travelers
        });

        //send email
        await bookingSubService.sendTicketIssueMail({
          booking_id: Number(id),
          email: agency_data.email,
          booked_by: SOURCE_AGENT,
          agency: {
            email: agency_data.email,
            name: agency_data.agency_name,
            phone: agency_data.phone,
            address: agency_data.address,
            photo: agency_data.agency_logo,
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
        message:
          'Cannot issue ticket for this booking. See error log for more details.',
      };
    });
  }

  public async updateBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { name, user_email } = req.admin;
      const {
        status,
        airline_pnr,
        charge_credit,
        gds_pnr,
        ticket_issue_last_time,
        ticket_numbers,
      } = req.body as IAdminUpdateFlightBookingReqBody;

      const flightBookingModel = this.Model.FlightBookingModel(trx);

      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: Number(id),
        booked_by: SOURCE_AGENT,
      });

      if (!booking_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const payload: IUpdateFlightBookingPayload = { status };
      let booking_tracking = `Booking status has been updated from ${booking_data.status} to ${status} by ${name}(${user_email}).`;

      if (status === FLIGHT_BOOKING_CONFIRMED) {
        if (
          booking_data.status !== FLIGHT_BOOKING_PENDING &&
          booking_data.status !== FLIGHT_BOOKING_IN_PROCESS &&
          booking_data.status !== FLIGHT_BOOKING_CONFIRMED
        ) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message:
              'Flight book is not allowed for this booking. Only pending/booking in process booking can be booked.',
          };
        }
        payload.gds_pnr = gds_pnr;
        payload.airline_pnr = airline_pnr;
        payload.ticket_issue_last_time = ticket_issue_last_time;

        booking_tracking += ` GDS PNR: ${gds_pnr}, Airline PNR: ${airline_pnr}, Ticket Issue Last Time: ${ticket_issue_last_time}.`;
      } else if (status === FLIGHT_TICKET_ISSUE) {
        if (
          booking_data.status !== FLIGHT_BOOKING_CONFIRMED &&
          booking_data.status !== FLIGHT_TICKET_IN_PROCESS &&
          booking_data.status !== FLIGHT_TICKET_ISSUE
        ) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message:
              'Ticket issue is not allowed for this booking. Only confirmed booking can be issued.',
          };
        }

        booking_tracking += ` Ticket numbers: ${JSON.stringify(
          ticket_numbers
        )}.`;

        const flightBookingTravelerModel =
          this.Model.FlightBookingTravelerModel(trx);
        const agentBookingSubService = new AgentFlightBookingSupportService(
          trx
        );

        if (charge_credit) {
          const payment_data =
            await agentBookingSubService.getPaymentInformation({
              booking_id: Number(id),
              payment_type: PAYMENT_TYPE_FULL,
              refundable: booking_data.refundable,
              departure_date: booking_data.travel_date,
              agency_id: Number(booking_data.source_id),
              ticket_price: booking_data.payable_amount,
            });

          if (payment_data.success === false) {
            return payment_data;
          }

          const updatePayload: IAgentUpdateDataAfterTicketIssue = {
            booking_id: Number(id),
            status,
            due: Number(payment_data.due),
            agency_id: Number(booking_data.source_id),
            booking_ref: booking_data.booking_ref,
            deduct_amount_from: payment_data.deduct_amount_from as
              | 'Both'
              | 'Loan'
              | 'Balance',
            paid_amount: Number(payment_data.paid_amount),
            loan_amount: Number(payment_data.loan_amount),
            invoice_id: Number(payment_data.invoice_id),
            user_id: booking_data.created_by,
            api: booking_data.api,
          };

          if (booking_data.status !== FLIGHT_TICKET_IN_PROCESS) {
            updatePayload.issued_by_type = SOURCE_ADMIN;
            updatePayload.issued_by_user_id = req.admin.user_id;
          }

          await agentBookingSubService.updateDataAfterTicketIssue(
            updatePayload
          );

          booking_tracking += ` With credit charged.`;
        } else {
          booking_tracking += ` Without credit charged.`;
        }

        ticket_numbers?.map(async (ticket_number) => {
          await flightBookingTravelerModel.updateFlightBookingTraveler(
            { ticket_number: ticket_number.ticket_number },
            ticket_number.passenger_id
          );
        });
      }

      await flightBookingModel.updateFlightBooking(payload, {
        id: Number(id),
        source_type: SOURCE_AGENT,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
