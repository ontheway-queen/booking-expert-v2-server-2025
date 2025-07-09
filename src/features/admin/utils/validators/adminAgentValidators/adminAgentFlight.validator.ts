import Joi from 'joi';
import {
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_EXPIRED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_BOOKING_ON_HOLD,
  FLIGHT_BOOKING_REFUNDED,
  FLIGHT_BOOKING_REISSUED,
  FLIGHT_BOOKING_PENDING,
  FLIGHT_BOOKING_VOID,
  FLIGHT_TICKET_IN_PROCESS,
  FLIGHT_TICKET_ISSUE,
} from '../../../../../utils/miscellaneous/flightConstent';

export class AdminAgentFlightValidator {
  public getFlightListSchema = Joi.object({
    status: Joi.string().valid(
      FLIGHT_BOOKING_PENDING,
      FLIGHT_BOOKING_CONFIRMED,
      FLIGHT_BOOKING_VOID,
      FLIGHT_BOOKING_IN_PROCESS,
      FLIGHT_TICKET_IN_PROCESS,
      FLIGHT_BOOKING_ON_HOLD,
      FLIGHT_TICKET_ISSUE,
      FLIGHT_BOOKING_EXPIRED,
      FLIGHT_BOOKING_CANCELLED,
      FLIGHT_BOOKING_REFUNDED,
      FLIGHT_BOOKING_REISSUED
    ),
    from_date: Joi.date(),
    to_date: Joi.date(),
    filter: Joi.string(),
    limit: Joi.number(),
    skip: Joi.number(),
  });

  public getBookingTrackingDataSchema = Joi.object({
    limit: Joi.number().allow(''),
    skip: Joi.number().allow(''),
  });

  public updateFlightBookingSchema = Joi.object({
    status: Joi.string().valid(FLIGHT_BOOKING_EXPIRED).required(),
  });

  public updatePendingBookingManuallySchema = Joi.object({
    status: Joi.string()
      .valid(FLIGHT_BOOKING_CONFIRMED, FLIGHT_TICKET_ISSUE)
      .required(),
    gds_pnr: Joi.string().trim(),
    ticket_issue_last_time: Joi.date(),
    airline_pnr: Joi.string().trim(),
    ticket_numbers: Joi.when('status', {
      is: FLIGHT_TICKET_ISSUE,
      then: Joi.array()
        .items(
          Joi.object({
            passenger_id: Joi.number().required(),
            ticket_number: Joi.string().required(),
          })
        )
        .required(),
      otherwise: Joi.forbidden(),
    }),
    charge_credit: Joi.when('status', {
      is: FLIGHT_TICKET_ISSUE,
      then: Joi.boolean().required(),
      otherwise: Joi.forbidden(),
    }),
  });

  public updateProcessingTicketSchema = Joi.object({
    ticket_numbers: Joi.array()
      .items(
        Joi.object({
          passenger_id: Joi.number().required(),
          ticket_number: Joi.string().required(),
        })
      )
      .required(),
    charge_credit: Joi.boolean().required(),
  });
}
