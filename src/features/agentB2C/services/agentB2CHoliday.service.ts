import AbstractServices from '../../../abstract/abstract.service';
import { Request } from 'express';
import {
  HOLIDAY_BOOKING_STATUS,
  HOLIDAY_CREATED_BY_AGENT,
} from '../../../utils/miscellaneous/holidayConstants';
import {
  GENERATE_AUTO_UNIQUE_ID,
  INVOICE_STATUS_TYPES,
  INVOICE_TYPES,
  SOURCE_AGENT_B2C,
  TYPE_HOLIDAY,
} from '../../../utils/miscellaneous/constants';
import Lib from '../../../utils/lib/lib';
import CustomError from '../../../utils/lib/customError';
import {
  IAgentB2CBookHolidayPackageReqBody,
  IAgentB2CHolidaySearchQuery,
} from '../utils/types/agentB2CHoliday.types';

export class AgentB2CHolidayService extends AbstractServices {
  public async searchHolidayPackage(req: Request) {
    return this.db.transaction(async (trx) => {
      const holidayPackageModel = this.Model.HolidayPackageModel(trx);
      const { agency_id } = req.agencyB2CWhiteLabel;
      const query = req.query as IAgentB2CHolidaySearchQuery;
      const data = await holidayPackageModel.getHolidayPackageList(
        {
          ...query,
          created_by: HOLIDAY_CREATED_BY_AGENT,
          status: true,
          agency_id,
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

  public async getSingleHolidayPackage(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { slug } = req.params;
      const { agency_id } = req.agencyB2CWhiteLabel;
      const holidayPackageModel = this.Model.HolidayPackageModel(trx);

      const get_holiday_data =
        await holidayPackageModel.getSingleHolidayPackage({
          slug,
          created_by: HOLIDAY_CREATED_BY_AGENT,
          holiday_for: SOURCE_AGENT_B2C,
          status: true,
          agency_id,
        });
      if (!get_holiday_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      } else {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          data: get_holiday_data,
        };
      }
    });
  }

  public async bookHolidayPackage(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyB2CUser;
      const body = req.body as IAgentB2CBookHolidayPackageReqBody;
      const holidayPackageModel = this.Model.HolidayPackageModel(trx);
      const holidayPackageBookingModel =
        this.Model.HolidayPackageBookingModel(trx);

      const get_holiday_data =
        await holidayPackageModel.getSingleHolidayPackage({
          id: body.holiday_package_id,
          created_by: HOLIDAY_CREATED_BY_AGENT,
          holiday_for: SOURCE_AGENT_B2C,
        });

      if (!get_holiday_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      //check duplicate booking
      const check_duplicate_booking =
        await holidayPackageBookingModel.getHolidayBookingList({
          holiday_package_id: body.holiday_package_id,
          source_type: SOURCE_AGENT_B2C,
          source_id: agency_id,
          status: [
            HOLIDAY_BOOKING_STATUS.PENDING,
            HOLIDAY_BOOKING_STATUS.CONFIRMED,
            HOLIDAY_BOOKING_STATUS.IN_PROGRESS,
            HOLIDAY_BOOKING_STATUS.COMPLETED,
          ],
        });

      if (check_duplicate_booking.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.HOLIDAY_PACKAGE_ALREADY_BOOKED,
        };
      }

      //calculate the price
      const price_details = get_holiday_data.pricing.find(
        (item) => item.price_for === SOURCE_AGENT_B2C
      );
      if (!price_details) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.PRICE_NOT_FOUND,
        };
      }

      const total_adult_price =
        Number(price_details.adult_price) * body.total_adult;
      const total_child_price =
        Number(price_details.child_price) * body.total_child;
      let total_price = total_adult_price + total_child_price;
      let total_markup = 0;
      if (price_details.markup_type) {
        total_markup =
          price_details.markup_type === 'FLAT'
            ? Number(price_details.markup_price)
            : Number(total_price) * (Number(price_details.markup_price) / 100);
        total_price -= total_markup;
      }

      const booking_ref = await Lib.generateNo({
        trx,
        type: GENERATE_AUTO_UNIQUE_ID.agent_holiday,
      });

      const booking_body = {
        ...body,
        booking_ref,
        source_type: SOURCE_AGENT_B2C,
        source_id: agency_id,
        user_id,
        total_adult_price,
        total_child_price,
        total_markup,
        total_price,
        status: HOLIDAY_BOOKING_STATUS.PENDING,
      };

      const booking_res = await holidayPackageBookingModel.insertHolidayBooking(
        booking_body
      );

      //create invoice
      const invoiceModel = this.Model.InvoiceModel(trx);

      const invoice_no = await Lib.generateNo({
        trx: trx,
        type: GENERATE_AUTO_UNIQUE_ID.invoice,
      });

      await invoiceModel.createInvoice({
        invoice_no,
        source_type: SOURCE_AGENT_B2C,
        source_id: agency_id,
        user_id,
        ref_id: booking_res[0].id,
        ref_type: TYPE_HOLIDAY,
        total_amount: total_price,
        due: total_price,
        details: `Invoice for Holiday booking ref no. - ${booking_ref}.`,
        type: INVOICE_TYPES.SALE,
        status: INVOICE_STATUS_TYPES.ISSUED,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Holiday package has been booked successfully',
        data: {
          id: booking_res[0].id,
          booking_ref,
          total_adult_price,
          total_child_price,
          total_markup,
          total_price,
        },
      };
    });
  }

  public async getHolidayPackageBookingList(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CUser;
      const holidayPackageBookingModel =
        this.Model.HolidayPackageBookingModel(trx);
      const query = req.query;

      const getBookingList =
        await holidayPackageBookingModel.getHolidayBookingList(
          {
            source_type: SOURCE_AGENT_B2C,
            source_id: agency_id,
            ...query,
          },
          true
        );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        total: getBookingList.total,
        data: getBookingList.data,
      };
    });
  }

  public async getSingleHolidayPackageBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CUser;
      const holidayPackageBookingModel =
        this.Model.HolidayPackageBookingModel(trx);
      const { id } = req.params as unknown as { id: number };

      const get_booking =
        await holidayPackageBookingModel.getSingleHolidayBooking({
          id,
          booked_by: SOURCE_AGENT_B2C,
          source_id: agency_id,
        });

      if (!get_booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      } else {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          data: get_booking,
        };
      }
    });
  }

  public async cancelHolidayPackageBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyB2CUser;
      const holidayPackageBookingModel =
        this.Model.HolidayPackageBookingModel(trx);
      const { id } = req.params as unknown as { id: number };

      const get_booking =
        await holidayPackageBookingModel.getSingleHolidayBooking({
          id,
          booked_by: SOURCE_AGENT_B2C,
          source_id: agency_id,
        });

      if (!get_booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (
        [
          HOLIDAY_BOOKING_STATUS.CONFIRMED,
          HOLIDAY_BOOKING_STATUS.CANCELLED,
          HOLIDAY_BOOKING_STATUS.REJECTED,
          HOLIDAY_BOOKING_STATUS.COMPLETED,
          HOLIDAY_BOOKING_STATUS.REFUNDED,
        ].includes(get_booking.status)
      ) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.BOOKING_CANCELLATION_NOT_ALLOWED,
        };
      }

      const cancel_res = await holidayPackageBookingModel.updateHolidayBooking(
        {
          status: HOLIDAY_BOOKING_STATUS.CANCELLED,
          cancelled_by: user_id,
          cancelled_at: new Date(),
        },
        id
      );

      if (cancel_res) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: 'Booking has been cancelled successfully',
        };
      } else {
        throw new CustomError(
          'Something went wrong while cancelling the holiday package booking',
          this.StatusCode.HTTP_INTERNAL_SERVER_ERROR
        );
      }
    });
  }
}
