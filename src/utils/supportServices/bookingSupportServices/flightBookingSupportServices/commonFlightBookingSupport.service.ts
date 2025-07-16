import { Knex } from 'knex';
import AbstractServices from '../../../../abstract/abstract.service';
import { FILE_STORAGE_HOST } from '../../../../middleware/uploader/uploaderConstants';
import EmailSendLib from '../../../lib/emailSendLib';
import FlightUtils from '../../../lib/flight/flightUtils';
import Lib from '../../../lib/lib';
import {
  GENERATE_AUTO_UNIQUE_ID,
  INVOICE_STATUS_TYPES,
  INVOICE_TYPES,
  SOURCE_ADMIN,
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
  SOURCE_B2C,
  SOURCE_SUB_AGENT,
  TYPE_FLIGHT,
} from '../../../miscellaneous/constants';
import {
  CUSTOM_API,
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_BOOKING_ON_HOLD,
  FLIGHT_BOOKING_PENDING,
  FLIGHT_TICKET_IN_PROCESS,
  FLIGHT_TICKET_ISSUE,
  TRAVELER_FILE_TYPE_PASSPORT,
  TRAVELER_FILE_TYPE_VISA,
} from '../../../miscellaneous/flightConstent';
import { MarkupType } from '../../../modelTypes/flightModelTypes/flightBookingModelTypes';
import {
  MARKUP_MODE_DECREASE,
  MARKUP_MODE_INCREASE,
} from '../../../miscellaneous/constants';
import { IInsertFlightBookingTrackingPayload } from '../../../modelTypes/flightModelTypes/flightBookingTrackingModelTypes';
import {
  ICheckBookingEligibilityPayload,
  ICheckDirectBookingPermissionPayload,
  IInsertFlightBookingDataPayload,
  ISendFlightBookingCancelEmailPayload,
  ISendFlightBookingEmailPayload,
  ISendFlightTicketIssueEmailPayload,
  IUpdateDataAfterFlightBookingCancelPayload,
} from '../../../supportTypes/bookingSupportTypes/flightBookingSupportTypes/commonFlightBookingTypes';
import { flightBookingCancelBodyTemplate } from '../../../templates/flightBookingCancelTemplate';
import {
  flightBookingBodyTemplate,
  flightBookingPdfTemplate,
} from '../../../templates/flightBookingTemplate';
import {
  flightTicketIssueBodyTemplate,
  flightTicketIssuePdfTemplate,
} from '../../../templates/flightTicketIssueTemplate';
import { IInsertTravelerPayload } from '../../../modelTypes/travelerModelTypes/travelerModelTypes';
import TravelerModel from '../../../../models/travelerModel/travelerModel';

export class CommonFlightBookingSupportService extends AbstractServices {
  private trx: Knex.Transaction;
  constructor(trx?: Knex.Transaction) {
    super();
    this.trx = trx || ({} as Knex.Transaction);
  }

  public async checkEligibilityOfBooking(
    payload: ICheckBookingEligibilityPayload
  ) {
    //check if passport has provided for international flight
    if (payload.domestic_flight === false) {
      const passport_number = !payload.passenger.some(
        (p) => p.passport_number == null
      );

      if (!passport_number) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          message: 'Passport number is required for international flight',
        };
      }
    }

    // Get all passengers' first names, last names, passports, email, phone
    const passengers = payload.passenger.map((p) => ({
      first_name: p.first_name,
      last_name: p.last_name,
      passport: p.passport_number,
      email: p.contact_email,
      phone: p.contact_number,
    }));

    // Batch check if any passenger already booked this flight(DUPLICATE BOOKING)
    const flightModel = this.Model.FlightBookingModel(this.trx);

    const existingBooking = await flightModel.checkFlightBooking({
      route: payload.route,
      departure_date: payload.departure_date,
      flight_number: payload.flight_number,
      passengers,
      status: [
        FLIGHT_BOOKING_CONFIRMED,
        FLIGHT_BOOKING_IN_PROCESS,
        FLIGHT_TICKET_IN_PROCESS,
        FLIGHT_BOOKING_ON_HOLD,
        FLIGHT_TICKET_ISSUE,
      ],
    });

    if (existingBooking > 0) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.DUPLICATE_BOOKING,
      };
    }

    //check if there is already two cancelled bookings with the same passenger info
    const cancelledBooking = await flightModel.checkFlightBooking({
      route: payload.route,
      departure_date: payload.departure_date,
      flight_number: payload.flight_number,
      passengers,
      status: [FLIGHT_BOOKING_CANCELLED],
    });

    if (cancelledBooking >= 2) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.BOOKING_CANCELLED_MORE_THAN_TWO_TIMES,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
    };
  }

  public async checkDirectFlightBookingPermission(
    payload: ICheckDirectBookingPermissionPayload
  ) {
    const markupSetFlightApiModel = this.Model.DynamicFareModel(this.trx);
    const set_flight_api =
      await markupSetFlightApiModel.getDynamicFareSuppliers({
        set_id: payload.markup_set_id,
        api_name: payload.api_name,
      });

    if (!set_flight_api.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.SET_FLIGHT_API_ID_NOT_FOUND,
      };
    }

    return {
      booking_block: false,
    };
  }

  public async insertFlightBookingData(
    payload: IInsertFlightBookingDataPayload
  ) {
    const flightBookingModel = this.Model.FlightBookingModel(this.trx);
    const flightBookingPriceBreakdownModel =
      this.Model.FlightBookingPriceBreakdownModel(this.trx);

    const flightBookingSegmentModel = this.Model.FlightBookingSegmentModel(
      this.trx
    );

    const flightBookingTravelerModel = this.Model.FlightBookingTravelerModel(
      this.trx
    );

    const flightBookingTrackingModel = this.Model.FlightBookingTrackingModel(
      this.trx
    );

    const flightUtils = new FlightUtils();

    //insert flight booking data
    const booking_ref = await Lib.generateNo({
      trx: this.trx,
      type: payload.type,
    });

    const booking_res = await flightBookingModel.insertFlightBooking({
      booking_ref,
      api:
        payload.status === FLIGHT_BOOKING_IN_PROCESS
          ? CUSTOM_API
          : payload.flight_data.api,
      api_booking_ref: payload.api_booking_ref,
      refundable: payload.refundable,
      route: flightUtils.getRouteOfFlight(payload.flight_data.leg_description),
      journey_type: flightUtils.getJourneyType(
        payload.flight_data.journey_type
      ),
      source_type: payload.source_type,
      source_id: payload.source_id,
      gds_pnr: payload.gds_pnr,
      total_passenger: payload.traveler_data.length,
      status: payload.status,
      base_fare: payload.flight_data.fare.base_fare,
      tax: payload.flight_data.fare.total_tax,
      ait: payload.flight_data.fare.ait,
      payable_amount: payload.flight_data.fare.payable,
      travel_date: payload.flight_data.flights[0].options[0].departure.date,
      ticket_issue_last_time:
        payload.flight_data.ticket_last_date +
        payload.flight_data.ticket_last_time,
      airline_pnr: payload.airline_pnr,
      created_by: payload.user_id,
      vendor_fare: JSON.stringify(payload.flight_data.fare.vendor_price),
    });

    //insert flight booking price breakdown data
    const passenger_fare = payload.flight_data.passengers.map((passenger) => {
      return {
        flight_booking_id: booking_res[0].id,
        type: passenger.type,
        total_passenger: passenger.number,
        base_fare: passenger.per_pax_fare.base_fare,
        tax: passenger.per_pax_fare.tax,
        ait: passenger.per_pax_fare.ait,
        discount: passenger.per_pax_fare.discount,
        total_fare: passenger.per_pax_fare.total_fare,
      };
    });

    await flightBookingPriceBreakdownModel.insertFlightBookingPriceBreakdown(
      passenger_fare
    );

    if (payload.flight_data.modifiedFare) {
      await flightBookingPriceBreakdownModel.insertFlightBookingModifiedAmount({
        flight_booking_id: booking_res[0].id,
        ...payload.flight_data.modifiedFare,
      });
    }

    //insert flight booking segment data
    const { baggage_info, cabin_info } = flightUtils.mapFlightAvailability(
      payload.flight_data.availability
    );

    payload.flight_data.flights.forEach(async (flight) => {
      flight.options.forEach(async (option, ind) => {
        await flightBookingSegmentModel.insertFlightBookingSegment({
          flight_booking_id: booking_res[0].id,
          flight_number: option.carrier.carrier_marketing_flight_number,
          airline: option.carrier.carrier_marketing_airline,
          airline_code: option.carrier.carrier_marketing_code,
          airline_logo: option.carrier.carrier_marketing_logo,
          origin: flightUtils.segmentPlaceInfo(
            option.departure.airport,
            option.departure.city,
            option.departure.city_code
          ),
          destination: flightUtils.segmentPlaceInfo(
            option.arrival.airport,
            option.arrival.city,
            option.arrival.city_code
          ),
          class: cabin_info[ind],
          baggage: baggage_info[ind],
          departure_date: option.departure.date,
          departure_time: option.departure.time.split('+')[0],
          arrival_date: option.arrival.date,
          arrival_time: option.arrival.time.split('+')[0],
          aircraft: option.carrier.carrier_aircraft_name,
          duration: flightUtils.getDuration(Number(option.elapsedTime)),
          departure_terminal: option.departure.terminal,
          arrival_terminal: option.arrival.terminal,
        });
      });
    });

    //insert flight booking traveler data
    const save_travelers: IInsertTravelerPayload[] = [];
    const flightBookingTravelerData = payload.traveler_data.map((traveler) => {
      //get visa and passport file
      let visa_file = traveler.visa_file;
      let passport_file = traveler.passport_file;
      if (payload.files?.length) {
        for (const file of payload.files) {
          if (
            file.fieldname?.split('-')[0] === TRAVELER_FILE_TYPE_VISA &&
            file.fieldname?.split('-')[1] == traveler.key
          ) {
            visa_file = file.filename;
          } else if (
            file.fieldname?.split('-')[0] === TRAVELER_FILE_TYPE_PASSPORT &&
            file.fieldname?.split('-')[1] == traveler.key
          ) {
            passport_file = file.filename;
          }
        }
      }
      if (traveler.save_information) {
        save_travelers.push({
          ...traveler,
          visa_file,
          passport_file,
          created_by: payload.user_id,
          source_id: payload.source_id,
          source_type: payload.source_type,
        });
      }
      return {
        flight_booking_id: booking_res[0].id,
        type: traveler.type,
        reference: traveler.reference,
        first_name: traveler.first_name,
        last_name: traveler.last_name,
        phone: traveler.contact_number,
        email: traveler.contact_email,
        date_of_birth: traveler.date_of_birth,
        gender: traveler.gender,
        passport_number: traveler.passport_number,
        passport_expiry_date: traveler.passport_expiry_date,
        issuing_country: traveler.issuing_country,
        nationality: traveler.nationality,
        frequent_flyer_number: traveler.frequent_flyer_number,
        frequent_flyer_airline: traveler.frequent_flyer_airline,
        visa_file,
        passport_file,
      };
    });

    await flightBookingTravelerModel.insertFlightBookingTraveler(
      flightBookingTravelerData
    );
    if (save_travelers.length) {
      await new TravelerModel(this.trx).insertTraveler(save_travelers);
    }

    //insert flight booking tracking data
    const tracking_data: IInsertFlightBookingTrackingPayload[] = [];
    tracking_data.push({
      flight_booking_id: booking_res[0].id,
      description: `Booking - ${booking_ref} has been made by Agent(${payload.user_name}). Booking status - ${payload.status}`,
    });

    if (payload.booking_block) {
      tracking_data.push({
        flight_booking_id: booking_res[0].id,
        description: `Booking block was enabled for this booking`,
      });
    }
    if (payload.payable_amount) {
      tracking_data.push({
        flight_booking_id: booking_res[0].id,
        description: `${payload.payable_amount} BDT has been paid for the booking`,
      });
    }
    if (payload.flight_data.api === CUSTOM_API) {
      tracking_data.push({
        flight_booking_id: booking_res[0].id,
        description: `This was a custom API`,
      });
    }

    await flightBookingTrackingModel.insertFlightBookingTracking(tracking_data);

    //create invoice
    const invoiceModel = this.Model.InvoiceModel(this.trx);

    const invoice_res = await invoiceModel.createInvoice({
      invoice_no: await Lib.generateNo({
        trx: this.trx,
        type: GENERATE_AUTO_UNIQUE_ID.invoice,
      }),
      source_type: payload.source_type,
      source_id: payload.source_id,
      user_id: payload.user_id,
      ref_id: booking_res[0].id,
      ref_type: payload.invoice_ref_type,
      total_amount: payload.flight_data.fare.payable,
      due: payload.flight_data.fare.payable,
      details: `Invoice has been created for flight booking ref no. - ${booking_ref}`,
      type: INVOICE_TYPES.SALE,
      status: INVOICE_STATUS_TYPES.ISSUED,
    });

    return {
      booking_id: booking_res[0].id,
      booking_ref: booking_ref,
      invoice_id: invoice_res[0].id,
    };
  }

  public async deleteFlightBookingData({
    id,
    source_type,
  }: {
    id: number;
    source_type:
      | typeof SOURCE_AGENT
      | typeof SOURCE_SUB_AGENT
      | typeof SOURCE_AGENT_B2C
      | typeof SOURCE_B2C;
  }) {
    const flightBookingModel = this.Model.FlightBookingModel(this.trx);
    const flightBookingPriceBreakdownModel =
      this.Model.FlightBookingPriceBreakdownModel(this.trx);

    const flightBookingSegmentModel = this.Model.FlightBookingSegmentModel(
      this.trx
    );
    const invoiceModel = this.Model.InvoiceModel(this.trx);

    const flightBookingTravelerModel = this.Model.FlightBookingTravelerModel(
      this.trx
    );

    const flightBookingTrackingModel = this.Model.FlightBookingTrackingModel(
      this.trx
    );

    await flightBookingPriceBreakdownModel.deleteFlightBookingPriceBreakdown(
      id
    );

    await flightBookingTravelerModel.deleteFlightBookingTraveler({
      flight_booking_id: id,
    });

    await flightBookingTrackingModel.deleteFlightBookingTracking({
      flight_booking_id: id,
    });

    await invoiceModel.deleteInvoiceInvoice({
      ref: { id, type: TYPE_FLIGHT },
      source_type: source_type,
    });

    await flightBookingSegmentModel.deleteFlightBookingSegment({
      flight_booking_id: id,
    });

    await flightBookingModel.deleteFlightBooking({ id, source_type });
  }

  public async updateDataAfterBookingCancel(
    payload: IUpdateDataAfterFlightBookingCancelPayload
  ) {
    //update booking
    const flightBookingModel = this.Model.FlightBookingModel(this.trx);
    await flightBookingModel.updateFlightBooking(
      {
        status: FLIGHT_BOOKING_CANCELLED,
        cancelled_at: new Date(),
        cancelled_by_type: payload.cancelled_by_type,
        cancelled_by_user_id: payload.cancelled_by_user_id,
      },
      { id: payload.booking_id, source_type: SOURCE_AGENT }
    );

    const flightBookingTrackingModel = this.Model.FlightBookingTrackingModel(
      this.trx
    );
    const tracking_data: IInsertFlightBookingTrackingPayload[] = [];
    tracking_data.push({
      flight_booking_id: payload.booking_id,
      description: `Booking - ${payload.booking_ref} has been cancelled by ${payload.cancelled_by_type}. API - ${payload.api}`,
    });
    await flightBookingTrackingModel.insertFlightBookingTracking(tracking_data);

    //delete invoice
    const invoiceModel = this.Model.InvoiceModel(this.trx);
    await invoiceModel.updateInvoice(
      {
        status: INVOICE_STATUS_TYPES.CANCELLED,
      },
      payload.booking_id
    );
  }

  public async sendFlightBookingMail(payload: ISendFlightBookingEmailPayload) {
    const flightBookingModel = this.Model.FlightBookingModel(this.trx);
    const bookingTravelerModel = this.Model.FlightBookingTravelerModel(
      this.trx
    );
    const flightPriceBreakdownModel =
      this.Model.FlightBookingPriceBreakdownModel(this.trx);
    const flightSegmentModel = this.Model.FlightBookingSegmentModel(this.trx);
    const booking_data = await flightBookingModel.getSingleFlightBooking({
      id: payload.booking_id,
      booked_by: payload.booked_by,
    });
    const get_travelers = await bookingTravelerModel.getFlightBookingTraveler(
      payload.booking_id
    );
    const price_breakdown =
      await flightPriceBreakdownModel.getFlightBookingPriceBreakdown(
        payload.booking_id
      );

    const segments = await flightSegmentModel.getFlightBookingSegment(
      payload.booking_id
    );

    if (booking_data) {
      let source_logo = payload.agency?.photo
        ? `${FILE_STORAGE_HOST}${payload.agency.photo}`
        : undefined;
      if (payload.agency?.photo && source_logo !== undefined) {
        payload.agency.photo = source_logo;
      }
      const pdfBuffer = await EmailSendLib.generateEmailPdfBuffer(
        flightBookingPdfTemplate({
          booking: booking_data,
          travelers: get_travelers,
          priceBreakdown: price_breakdown,
          segments: segments,
          agency: payload.agency,
        })
      );

      //send email
      await EmailSendLib.sendEmail({
        email: payload.email,
        emailSub: `Flight Booking Confirmation - ${booking_data.booking_ref}`,
        emailBody: flightBookingBodyTemplate({
          booking: booking_data,
          travelers: get_travelers,
          panel_link: payload.panel_link,
          logo: source_logo,
        }),
        attachments: [
          {
            filename: 'flight-booking.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    }
  }

  public async sendTicketIssueMail(
    payload: ISendFlightTicketIssueEmailPayload
  ) {
    const flightBookingModel = this.Model.FlightBookingModel(this.trx);
    const bookingTravelerModel = this.Model.FlightBookingTravelerModel(
      this.trx
    );
    const flightPriceBreakdownModel =
      this.Model.FlightBookingPriceBreakdownModel(this.trx);
    const flightSegmentModel = this.Model.FlightBookingSegmentModel(this.trx);
    const booking_data = await flightBookingModel.getSingleFlightBooking({
      id: payload.booking_id,
      booked_by: payload.booked_by,
    });
    const get_travelers = await bookingTravelerModel.getFlightBookingTraveler(
      payload.booking_id
    );
    const price_breakdown =
      await flightPriceBreakdownModel.getFlightBookingPriceBreakdown(
        payload.booking_id
      );

    const segments = await flightSegmentModel.getFlightBookingSegment(
      payload.booking_id
    );

    if (booking_data) {
      let source_logo = payload.agency?.photo
        ? `${FILE_STORAGE_HOST}${payload.agency.photo}`
        : undefined;
      if (payload.agency?.photo && source_logo !== undefined) {
        payload.agency.photo = source_logo;
      }
      const pdfBuffer = await EmailSendLib.generateEmailPdfBuffer(
        flightTicketIssuePdfTemplate({
          booking: booking_data,
          travelers: get_travelers,
          priceBreakdown: price_breakdown,
          segments: segments,
          agency: payload.agency,
        })
      );

      //send email
      await EmailSendLib.sendEmail({
        email: payload.email,
        emailSub: `Flight Ticket Issue - ${booking_data.booking_ref}`,
        emailBody: flightTicketIssueBodyTemplate({
          booking: booking_data,
          travelers: get_travelers,
          panel_link: payload.panel_link,
          logo: source_logo,
          due: payload.due,
        }),
        attachments: [
          {
            filename: 'flight-ticket.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    }
  }

  public async sendBookingCancelMail(
    payload: ISendFlightBookingCancelEmailPayload
  ) {
    let source_logo = payload.agency?.photo
      ? `${FILE_STORAGE_HOST}${payload.agency.photo}`
      : undefined;
    await EmailSendLib.sendEmail({
      email: payload.email,
      emailSub: `Flight Booking Cancelled - ${payload.booking_data.booking_ref}`,
      emailBody: flightBookingCancelBodyTemplate({
        booking: payload.booking_data,
        panel_link: payload.panel_link,
        logo: source_logo,
      }),
    });
  }
}
