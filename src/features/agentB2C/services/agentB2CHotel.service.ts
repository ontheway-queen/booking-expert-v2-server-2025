import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { CTHotelSupportService } from '../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service';
import {
  IAgentB2CGetHotelBookingQuery,
  IAgentB2CHotelBookingReqBody,
  IAgentB2CHotelSearchReqBody,
} from '../utils/types/agentB2CHotel.types';
import Lib from '../../../utils/lib/lib';
import DateTimeLib from '../../../utils/lib/dateTimeLib';
import BalanceLib from '../../../utils/lib/balanceLib';
import { ICTHotelBookingPayload } from '../../../utils/supportTypes/hotelTypes/ctHotelSupport.types';
import CustomError from '../../../utils/lib/customError';
import {
  GENERATE_AUTO_UNIQUE_ID,
  INVOICE_STATUS_TYPES,
  INVOICE_TYPES,
  SOURCE_AGENT_B2C,
  TYPE_HOTEL,
} from '../../../utils/miscellaneous/constants';
import {
  IInsertHotelBookingCancellationPayload,
  IInsertHotelBookingTravelerPayload,
} from '../../../utils/modelTypes/hotelModelTypes/hotelBookingModelTypes';

export default class AgentB2CHotelService extends AbstractServices {
  constructor() {
    super();
  }

  public async hotelSearch(req: Request) {
    return this.db.transaction(async (trx) => {
      const ctHotelSupport = new CTHotelSupportService(trx);
      const OthersModel = this.Model.OthersModel(trx);
      const { agency_id } = req.agencyB2CWhiteLabel;

      const { name, ...payload } = req.body as IAgentB2CHotelSearchReqBody;

      await OthersModel.insertHotelSearchHistory({
        check_in_date: payload.checkin,
        check_out_date: payload.checkout,
        guest_n_rooms: JSON.stringify(payload.rooms),
        destination_type: payload.destination,
        nationality: payload.client_nationality,
        user_type: 'Agent B2C',
        agency_id: agency_id,
        code: payload.code,
        name: name,
      });

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
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      //get b2c markup
      const markup_amount = await Lib.getAgentB2CTotalMarkup({
        trx,
        type: 'Hotel',
        agency_id,
      });

      if (!markup_amount) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Markup information is empty. Contact with the authority',
        };
      }

      const result = await ctHotelSupport.HotelSearch({
        payload,
        markup_set: agent.hotel_markup_set,
        markup_amount,
      });

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

  public async getHotelRooms(req: Request) {
    return this.db.transaction(async (trx) => {
      const ctHotelSupport = new CTHotelSupportService(trx);
      const agencyModel = this.Model.AgencyModel(trx);
      const { agency_id } = req.agencyB2CWhiteLabel;

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
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      //get b2c markup
      const markup_amount = await Lib.getAgentB2CTotalMarkup({
        trx,
        type: 'Hotel',
        agency_id,
      });

      if (!markup_amount) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Markup information is empty. Contact with the authority',
        };
      }

      const payload = req.body as { hcode: number; search_id: string };

      const result = await ctHotelSupport.HotelRooms({
        payload,
        markup_set: agent.hotel_markup_set,
        markup_amount,
      });

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
      const payload = req.body as {
        search_id: string;
        nights: number;
        rooms: { rate_key: string; group_code: string }[];
      };
      const { agency_id } = req.agencyB2CWhiteLabel;

      const agencyModel = this.Model.AgencyModel(trx);
      const ctHotelSupport = new CTHotelSupportService(trx);

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
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      //get b2c markup
      const markup_amount = await Lib.getAgentB2CTotalMarkup({
        trx,
        type: 'Hotel',
        agency_id,
      });

      if (!markup_amount) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Markup information is empty. Contact with the authority',
        };
      }

      const data = await ctHotelSupport.HotelRecheck({
        payload,
        markup_set: agent.hotel_markup_set,
        markup_amount,
      });

      if (!data) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }

      return {
        success: true,
        message: this.ResMsg.HTTP_OK,
        code: this.StatusCode.HTTP_OK,
        data: data,
      };
    });
  }

  public async hotelBook(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;
      const { user_id } = req.agencyB2CUser;
      const ctHotelSupport = new CTHotelSupportService(trx);
      const agencyModel = this.Model.AgencyModel(trx);
      const hotelBookingModel = this.Model.HotelBookingModel(trx);
      const balanceLib = new BalanceLib(trx);

      // Check agent and markup set
      const agent = await agencyModel.checkAgency({
        agency_id: agency_id,
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

      //get b2c markup
      const markup_amount = await Lib.getAgentB2CTotalMarkup({
        trx,
        type: 'Hotel',
        agency_id,
      });

      if (!markup_amount) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Markup information is empty. Contact with the authority',
        };
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const body = req.body as IAgentB2CHotelBookingReqBody;

      const recheckRoomsPayload = body.booking_items.map((item) => {
        return {
          rate_key: item.rate_key,
          group_code: body.group_code,
        };
      });

      // Calculate nights and recheck Hotel
      const nights = DateTimeLib.nightsCount(body.checkin, body.checkout);

      const recheck = await ctHotelSupport.HotelRecheck({
        payload: {
          search_id: body.search_id,
          rooms: recheckRoomsPayload,
          nights: nights,
        },
        markup_set: agent.hotel_markup_set,
        markup_amount,
        with_vendor_price: true,
      });

      if (!recheck) {
        return {
          success: false,
          message: 'Booking failed. Please try again with another room.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      // Check Balance availability for book
      // const BalanceAvailability =
      //   await balanceLib.AgencyBalanceAvailabilityCheck({
      //     agency_id,
      //     price: recheck.fee.total_price,
      //   });

      // if (!BalanceAvailability.availability) {
      //   return {
      //     success: false,
      //     code: this.StatusCode.HTTP_BAD_REQUEST,
      //     message: 'Insufficient Agent credit. Please add funds to continue.',
      //   };
      // }

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
        source_type: SOURCE_AGENT_B2C,
        status: 'PENDING',
        free_cancellation_last_date:
          recheck.rates[0].cancellation_policy?.free_cancellation_last_date,
        rooms: JSON.stringify(recheck.rates[0].rooms),
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

      const invoice_no = await Lib.generateNo({
        trx: trx,
        type: GENERATE_AUTO_UNIQUE_ID.invoice,
      });

      await invoiceModel.createInvoice({
        invoice_no,
        source_type: SOURCE_AGENT_B2C,
        source_id: agency_id,
        user_id,
        ref_id: hotelBooking[0].id,
        ref_type: TYPE_HOTEL,
        total_amount: recheck.fee.total_price,
        due: recheck.fee.total_price,
        details: `Invoice for Hotel booking ref no. - ${booking_ref}. Hotel: ${recheck.name}, City: ${payload.city_code}, Check-in: ${payload.checkin}, Check-out: ${payload.checkout}, with ${travelerPayload.length} traveler(s).`,
        type: INVOICE_TYPES.SALE,
        status: INVOICE_STATUS_TYPES.ISSUED,
      });

      return {
        success: true,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        data: {
          id: hotelBooking[0].id,
          booking_ref,
        },
      };
    });
  }

  public async hotelHotelBookingList(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;
    const { user_id } = req.agencyB2CUser;

    const { filter, from_date, limit, skip, to_date } =
      req.query as IAgentB2CGetHotelBookingQuery;
    const hotelBookingModel = this.Model.HotelBookingModel();

    const data = await hotelBookingModel.getHotelBooking(
      {
        source_type: SOURCE_AGENT_B2C,
        filter,
        from_date,
        to_date,
        limit,
        skip,
        source_id: agency_id,
        user_id,
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

  public async singleHotelBooking(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;
    const { user_id } = req.agencyB2CUser;

    const { id } = req.params;
    const hotelBookingModel = this.Model.HotelBookingModel();

    const data = await hotelBookingModel.getSingleHotelBooking({
      source_type: SOURCE_AGENT_B2C,
      source_id: agency_id,
      user_id,
      booking_id: Number(id),
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const {
      supplier_ref,
      supplier_cancellation_data,
      supplier_price,
      ...restData
    } = data;

    const traveler = await hotelBookingModel.getHotelBookingTraveler(
      Number(id)
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: { ...restData, traveler },
    };
  }

  public async hotelBookingCancel(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;
      const { user_id } = req.agencyB2CUser;

      const { id } = req.params;
      const hotelBookingModel = this.Model.HotelBookingModel(trx);

      const data = await hotelBookingModel.getSingleHotelBooking({
        booking_id: Number(id),
        source_type: SOURCE_AGENT_B2C,
        source_id: agency_id,
        user_id,
      });

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // if(data.s){}

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: data,
      };
    });
  }
}
