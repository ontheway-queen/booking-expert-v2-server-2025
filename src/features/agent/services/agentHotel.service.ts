import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { CTHotelSupportService } from '../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service';
import {
  IAgencyGetHotelBookingQuery,
  IAgencyGetHotelSearchHistoryReqQuery,
  IAgentHotelBookingReqBody,
  IAgentHotelSearchReqBody,
} from '../utils/types/agentHotel.types';
import { ICTHotelBookingPayload } from '../../../utils/supportTypes/hotelTypes/ctHotelSupport.types';
import CustomError from '../../../utils/lib/customError';
import DateTimeLib from '../../../utils/lib/dateTimeLib';
import BalanceLib from '../../../utils/lib/balanceLib';
import Lib from '../../../utils/lib/lib';
import {
  GENERATE_AUTO_UNIQUE_ID,
  INVOICE_TYPES,
  INVOICE_REF_TYPES,
  SOURCE_AGENT,
} from '../../../utils/miscellaneous/constants';
import {
  IInsertHotelBookingCancellationPayload,
  IInsertHotelBookingTravelerPayload,
} from '../../../utils/modelTypes/hotelModelTypes/hotelBookingModelTypes';

export class AgentHotelService extends AbstractServices {
  constructor() {
    super();
  }

  public async hotelSearch(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const ctHotelSupport = new CTHotelSupportService(trx);
      const agencyModel = this.Model.AgencyModel(trx);
      const OthersModel = this.Model.OthersModel(trx);

      const agent = await agencyModel.checkAgency({
        agency_id,
        status: 'Active',
      });

      if (!agent) {
        return {
          success: false,
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      if (!agent.hotel_markup_set) {
        return {
          success: false,
          message: 'Hotel markup set is not configured for this agency.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      const { name, ...payload } = req.body as IAgentHotelSearchReqBody;

      await OthersModel.insertHotelSearchHistory({
        check_in_date: payload.checkin,
        check_out_date: payload.checkout,
        guest_n_rooms: JSON.stringify(payload.rooms),
        destination_type: payload.destination,
        user_id: user_id,
        nationality: payload.client_nationality,
        user_type: 'Agent',
        agency_id,
        code: payload.code,
        name: name,
      });

      const result = await ctHotelSupport.HotelSearch(
        payload,
        agent.hotel_markup_set
      );

      if (result) {
        return {
          success: true,
          message: this.ResMsg.HTTP_OK,
          code: this.StatusCode.HTTP_OK,
          data: result,
        };
      }

      return {
        success: false,
        message: this.ResMsg.HTTP_NOT_FOUND,
        code: this.StatusCode.HTTP_NOT_FOUND,
      };
    });
  }

  public async hotelSearchHistory(req: Request) {
    const { agency_id } = req.agencyUser;
    const query = req.query as IAgencyGetHotelSearchHistoryReqQuery;
    const OthersModel = this.Model.OthersModel();

    const data = await OthersModel.getHotelSearchHistory({
      agency_id,
      user_type: 'Agent',
      ...query,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  }

  public async getHotelRooms(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const ctHotelSupport = new CTHotelSupportService(trx);
      const agencyModel = this.Model.AgencyModel(trx);

      const agent = await agencyModel.checkAgency({
        agency_id,
        status: 'Active',
      });

      if (!agent) {
        return {
          success: false,
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      if (!agent.hotel_markup_set) {
        return {
          success: false,
          message: 'Hotel markup set is not configured for this agency.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }
      const payload = req.body as { hcode: number; search_id: string };

      const result = await ctHotelSupport.HotelRooms(
        payload,
        agent.hotel_markup_set
      );

      if (result) {
        return {
          success: true,
          message: this.ResMsg.HTTP_OK,
          code: this.StatusCode.HTTP_OK,
          data: result,
        };
      }

      return {
        success: false,
        message: this.ResMsg.HTTP_NOT_FOUND,
        code: this.StatusCode.HTTP_NOT_FOUND,
      };
    });
  }

  public async hotelRoomRecheck(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const ctHotelSupport = new CTHotelSupportService(trx);
      const agencyModel = this.Model.AgencyModel(trx);

      const agent = await agencyModel.checkAgency({
        agency_id,
        status: 'Active',
      });

      if (!agent) {
        return {
          success: false,
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      if (!agent.hotel_markup_set) {
        return {
          success: false,
          message: 'Hotel markup set is not configured for this agency.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      const payload = req.body as {
        search_id: string;
        nights: number;
        rooms: { rate_key: string; group_code: string }[];
      };

      const data = await ctHotelSupport.HotelRecheck(
        payload,
        agent.hotel_markup_set
      );

      if (!data) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }

      const { supplier_fee, supplier_rates, ...restData } = data;

      return {
        success: true,
        message: this.ResMsg.HTTP_OK,
        code: this.StatusCode.HTTP_OK,
        data: restData,
      };
    });
  }

  public async hotelBooking(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const ctHotelSupport = new CTHotelSupportService(trx);
      const agencyModel = this.Model.AgencyModel(trx);
      const hotelBookingModel = this.Model.HotelBookingModel(trx);
      const balanceLib = new BalanceLib(trx);

      // Check agent and markup set
      const agent = await agencyModel.checkAgency({
        agency_id,
        status: 'Active',
      });

      if (!agent) {
        return {
          success: false,
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      if (!agent.hotel_markup_set) {
        return {
          success: false,
          message: 'Hotel markup set is not configured for this agency.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const body = req.body as IAgentHotelBookingReqBody;

      const recheckRoomsPayload = body.booking_items.map((item) => {
        return {
          rate_key: item.rate_key,
          group_code: body.group_code,
        };
      });

      // Calculate nights and recheck Hotel
      const nights = DateTimeLib.nightsCount(body.checkin, body.checkout);

      const recheck = await ctHotelSupport.HotelRecheck(
        {
          search_id: body.search_id,
          rooms: recheckRoomsPayload,
          nights: nights,
        },
        agent.hotel_markup_set
      );

      if (!recheck) {
        return {
          success: false,
          message: 'Booking failed. Please try again with another room.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      // Check Balance availability for book
      const BalanceAvailability =
        await balanceLib.AgencyBalanceAvailabilityCheck({
          agency_id,
          price: recheck.fee.total_price,
        });

      if (!BalanceAvailability.availability) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Insufficient credit. Please add funds to continue.',
        };
      }

      // Hotel Book
      const booking = await ctHotelSupport.HotelBooking(
        body,
        agent.hotel_markup_set
      );

      if (!booking) {
        return {
          success: false,
          message: 'Booking failed. Please try again with another room.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      const payload: ICTHotelBookingPayload = body;

      // Handle room wise paxes files
      if (files.length) {
        let totalPax = 0;

        payload.booking_items.forEach((item) => {
          item.rooms.forEach((room) => {
            totalPax += room.paxes.length;
          });
        });

        if (totalPax < files.length) {
          return {
            success: false,
            message:
              'Number of files does not match the total number of paxes.',
            code: this.StatusCode.HTTP_BAD_REQUEST,
          };
        }

        files.forEach((file) => {
          const splitName = file.fieldname.split('_');

          if (splitName.length !== 4) {
            throw new CustomError(
              'Invalid file field name format.',
              this.StatusCode.HTTP_BAD_REQUEST
            );
          }

          if (
            !payload.booking_items[0]?.rooms[Number(splitName[1]) - 1]?.paxes[
              Number(splitName[3]) - 1
            ]
          ) {
            throw new CustomError(
              `Room no or room pax no(${file.fieldname}) does not match with passport/id filename. Filename example: room_1_pax_1 - room_1(Room Number)_pax_1(Pax number)`,
              this.StatusCode.HTTP_BAD_REQUEST
            );
          }

          payload.booking_items[0].rooms[Number(splitName[1]) - 1].paxes[
            Number(splitName[3]) - 1
          ].id_file = file.filename;
        });
      }

      // Crate Reference no and insert Hotel Booking to database
      const booking_ref = await Lib.generateNo({
        trx,
        type: GENERATE_AUTO_UNIQUE_ID.agent_hotel,
      });

      const hotelBooking = await hotelBookingModel.insertHotelBooking({
        booking_ref,
        checkin_date: payload.checkin,
        checkout_date: payload.checkout,
        hotel_code: payload.hotel_code,
        city_code: payload.city_code,
        city_country_name: 'City',
        created_by: user_id,
        refundable: recheck.rates[0].refundable,
        holder: JSON.stringify(payload.holder),
        supplier: 'CT',
        hotel_name: recheck.name,
        source_id: agency_id,
        supplier_price: JSON.stringify(recheck.supplier_fee),
        sell_price: JSON.stringify(recheck.fee),
        supplier_cancellation_data: JSON.stringify(
          recheck.rates[0].cancellation_policy
        ),
        hotel_data: JSON.stringify({
          name: recheck.name,
          hotel_code: recheck.hotel_code,
          category: recheck.category,
          geolocation: recheck.geolocation,
          contact_details: recheck.contact_details,
          images: recheck.images,
          facilities: recheck.facilities,
        }),
        search_id: payload.search_id,
        hotel_extra_charges: JSON.stringify(recheck.hotel_extra_charges),
        free_cancellation:
          recheck.rates[0].cancellation_policy?.free_cancellation || false,
        source_type: SOURCE_AGENT,
        status: 'Booked',
        free_cancellation_last_date:
          recheck.rates[0].cancellation_policy?.free_cancellation_last_date,
        supplier_ref: booking.booking_id,
        rooms: JSON.stringify(recheck),
      });

      if (recheck.rates[0].cancellation_policy?.details.length) {
        const cancellationPayload: IInsertHotelBookingCancellationPayload[] =
          recheck.rates[0].cancellation_policy.details.map((item) => {
            return {
              booking_id: hotelBooking[0].id,
              fee: item.fee,
              from_date: item.from_date,
            };
          });

        await hotelBookingModel.insertHotelBookingCancellation(
          cancellationPayload
        );
      }

      const travelerPayload: IInsertHotelBookingTravelerPayload[] = [];

      let roomCount = 1;
      for (let room of payload.booking_items[0].rooms) {
        const { paxes } = room;

        for (const pax of paxes) {
          travelerPayload.push({
            booking_id: hotelBooking[0].id,
            title: pax.name,
            surname: pax.surname,
            name: pax.name,
            id_file: pax.id_file,
            type: pax.type,
            room: roomCount,
          });
        }

        roomCount++;
      }

      await hotelBookingModel.insertHotelBookingTraveler(travelerPayload);

      //create invoice
      const invoiceModel = this.Model.InvoiceModel(trx);
      const moneyReceiptModel = this.Model.MoneyReceiptModel(trx);

      const invoice_no = await Lib.generateNo({
        trx: trx,
        type: GENERATE_AUTO_UNIQUE_ID.invoice,
      });

      const invoice_res = await invoiceModel.createInvoice({
        invoice_no,
        source_type: SOURCE_AGENT,
        source_id: agency_id,
        user_id: user_id,
        ref_id: hotelBooking[0].id,
        ref_type: INVOICE_REF_TYPES.agent_hotel_booking,
        total_amount: recheck.fee.total_price,
        due: 0,
        details: `Auto invoice has been created for flight booking ref no. - ${booking_ref}`,
        type: INVOICE_TYPES.SALE,
      });

      // Create money receipt
      await moneyReceiptModel.createMoneyReceipt({
        amount: recheck.fee.total_price,
        invoice_id: invoice_res[0].id,
        mr_no: await Lib.generateNo({
          trx: trx,
          type: GENERATE_AUTO_UNIQUE_ID.money_receipt,
        }),
        user_id,
        details: `Auto money receipt has been created for Invoice no: ${invoice_no}`,
      });

      await balanceLib.AgencyDeductBalance({
        balance: BalanceAvailability.balance,
        agency_id,
        deduct: BalanceAvailability.deduct,
        loan: BalanceAvailability.loan,
        voucher_no: invoice_no,
        remark: `Amount ${recheck.fee.total_price}/- is debited for hotel booking ${booking_ref}.`,
      });

      return {
        success: true,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        data: booking,
      };
    });
  }

  public async getHotelBooking(req: Request) {
    const { agency_id } = req.agencyUser;
    const { filter, from_date, limit, skip, to_date } =
      req.query as IAgencyGetHotelBookingQuery;
    const hotelBookingModel = this.Model.HotelBookingModel();

    const data = await hotelBookingModel.getHotelBooking(
      {
        source_type: 'AGENT',
        filter,
        from_date,
        to_date,
        limit,
        skip,
        source_id: agency_id,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data.data,
      total: data.total,
    };
  }

  public async getSingleBooking(req: Request) {
    const { id } = req.params;

    const hotelBookingModel = this.Model.HotelBookingModel();

    // const data = await hotelBookingModel.getSingleBooking({
    //   booking_id: Number(id),
    //   source_type: 'AGENT',
    // });

    // if (!data) {
    //   return {
    //     success: false,
    //     code: this.StatusCode.HTTP_NOT_FOUND,
    //     message: this.ResMsg.HTTP_NOT_FOUND,
    //   };
    // }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      // data,
    };
  }
}
