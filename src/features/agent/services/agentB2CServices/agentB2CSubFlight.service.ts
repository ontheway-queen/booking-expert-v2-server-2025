import AbstractServices from '../../../../abstract/abstract.service';
import { Request } from 'express';
import {
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
} from '../../../../utils/miscellaneous/constants';
import { IAgentUpdateAgentB2CFlightBookingReqBody } from '../../utils/types/agentB2CSubTypes/agentB2CSubFlight.types';
import { IUpdateFlightBookingPayload } from '../../../../utils/modelTypes/flightModelTypes/flightBookingModelTypes';
import {
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_BOOKING_PENDING,
  FLIGHT_TICKET_IN_PROCESS,
  FLIGHT_TICKET_ISSUE,
  PAYMENT_TYPE_FULL,
} from '../../../../utils/miscellaneous/flightConstant';
import { AgentFlightBookingSupportService } from '../../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/agentFlightBookingSupport.service';
import { IAgentUpdateDataAfterTicketIssue } from '../../../../utils/supportTypes/bookingSupportTypes/flightBookingSupportTypes/agentFlightBookingTypes';
export class AgentB2CSubFlightService extends AbstractServices {
  public async getAllBooking(req: Request) {
    const { agency_id } = req.agencyUser;
    const flightBookingModel = this.Model.FlightBookingModel();
    const query = req.query;
    const data = await flightBookingModel.getFlightBookingList(
      { ...query, source_id: agency_id, booked_by: SOURCE_AGENT_B2C },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
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
        booked_by: SOURCE_AGENT_B2C,
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

  public async updateBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { name, user_email, user_id } = req.agencyUser;
      const {
        status,
        airline_pnr,
        charge_credit,
        gds_pnr,
        ticket_issue_last_time,
        ticket_numbers,
      } = req.body as IAgentUpdateAgentB2CFlightBookingReqBody;

      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const flightBookingTrackingModel =
        this.Model.FlightBookingTrackingModel(trx);

      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: Number(id),
        booked_by: SOURCE_AGENT_B2C,
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

        payload.issued_by_type = SOURCE_AGENT;
        payload.issued_by_user_id = user_id;

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
            updatePayload.issued_by_type = SOURCE_AGENT;
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
        source_type: SOURCE_AGENT_B2C,
      });

      await flightBookingTrackingModel.insertFlightBookingTracking({
        description: booking_tracking,
        flight_booking_id: Number(id),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
