import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { IBookAgentB2CUmrahPackageReqBody } from '../utils/types/agentB2CUmrah.types';
import Lib from '../../../utils/lib/lib';
import { SOURCE_AGENT_B2C } from '../../../utils/miscellaneous/constants';

export default class AgentB2CUmrahService extends AbstractServices {
  constructor() {
    super();
  }

  public async getUmrahPackages(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;
    const umrahModel = this.Model.UmrahPackageModel();

    const data = await umrahModel.getAgentB2CUmrahPackageList({
      source_id: agency_id,
      status: true,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  }

  public async getSingleUmrahPackages(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;
    const { slug } = req.params;
    const umrahModel = this.Model.UmrahPackageModel();

    const data = await umrahModel.getSingleAgentB2CUmrahPackageDetails({
      slug,
      source_id: agency_id,
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
        data,
      };
    }

    const photos = await umrahModel.getSingleUmrahPackageImages({
      source_id: agency_id,
      umrah_id: data.id,
    });

    const includes = await umrahModel.getUmrahPackageInclude(data.id);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...data,
        photos,
        includes,
      },
    };
  }

  public async bookUmrahPackages(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;
      const { user_id } = req.agencyB2CUser;
      const { id } = req.params;
      const { traveler_adult, traveler_child, note, ...contact } =
        req.body as IBookAgentB2CUmrahPackageReqBody;

      const umrahBookingModel = this.Model.UmrahBookingModel(trx);
      const umrahModel = this.Model.UmrahPackageModel(trx);

      const check = await umrahModel.getSingleAgentB2CUmrahPackageDetails({
        source_id: agency_id,
        umrah_id: Number(id),
      });

      if (!check) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const booking_ref = await Lib.generateNo({ trx, type: 'Agent_Umrah' });

      const total_adult_price = Number(check.adult_price) * traveler_adult;
      let total_child_price = 0;

      if (traveler_child) {
        total_child_price = Number(check.child_price) * traveler_child;
      }

      const booking = await umrahBookingModel.insertUmrahBooking({
        booking_ref,
        source_id: agency_id,
        user_id,
        umrah_id: check.id,
        note_from_customer: note,
        per_adult_price: Number(check.adult_price),
        per_child_price: Number(check.child_price),
        source_type: SOURCE_AGENT_B2C,
        traveler_adult: traveler_adult,
        traveler_child: traveler_child,
        total_price: total_adult_price + total_adult_price,
      });

      await umrahBookingModel.insertUmrahBookingContact({
        booking_id: booking[0].id,
        ...contact,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: {
          id: booking[0].id,
        },
      };
    });
  }

  public async getUmrahPackagesBooking(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;
    const { user_id } = req.agencyB2CUser;
    const UmrahBookingModel = this.Model.UmrahBookingModel();

    const query = req.query as {
      from_date?: string;
      to_date?: string;
      status?: string;
      limit?: string;
      skip?: string;
    };

    const data = await UmrahBookingModel.getAgentB2CUmarhBookingList(
      {
        agency_id,
        user_id,
        ...query,
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

  public async getSingleUmrahBooking(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;
    const { user_id } = req.agencyB2CUser;
    const { id } = req.params;
    const booking_id = Number(id);
    const UmrahBookingModel = this.Model.UmrahBookingModel();

    const data = await UmrahBookingModel.getSingleAgentB2CUmrahBookingDetails({
      id: booking_id,
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

    const contact = await UmrahBookingModel.getUmrahBookingContacts(booking_id);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...data,
        contact: contact[0],
      },
    };
  }
}
