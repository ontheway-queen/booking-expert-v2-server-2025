import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';

export class AgentSubAgentUmrahService extends AbstractServices {
  constructor() {
    super();
  }

  // get umrah booking
  public async getUmrahBooking(req: Request) {
    const { agency_id } = req.agencyUser;
    const query = req.query as {
      limit?: string;
      skip?: string;
      from_date?: string;
      to_date?: string;
      status?: string[];
      user_id?: number;
    };

    const model = this.Model.UmrahBookingModel();

    const data = await model.getAgentB2CUmrahBookingList(
      { agency_id, ...query, source_type: SOURCE_AGENT_B2C },
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

  // get single umrah booking
  public async getSingleUmrahBooking(req: Request) {
    const { agency_id } = req.agencyUser;
    const { id } = req.params;
    const booking_id = Number(id);
    const UmrahBookingModel = this.Model.UmrahBookingModel();

    const data = await UmrahBookingModel.getSingleAgentB2CUmrahBookingDetails({
      id: booking_id,
      source_id: agency_id,
      source_type: SOURCE_AGENT_B2C,
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
        contact,
      },
    };
  }

  //update umrah booking status
  public async updateUmrahBookingStatus(req: Request) {
    const { agency_id } = req.agencyUser;
    const { id } = req.params;
    const { status } = req.body;
    const booking_id = Number(id);
    const UmrahBookingModel = this.Model.UmrahBookingModel();

    const data = await UmrahBookingModel.getSingleAgentB2CUmrahBookingDetails({
      id: booking_id,
      source_id: agency_id,
      source_type: SOURCE_AGENT_B2C,
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    await UmrahBookingModel.updateUmrahBooking({ status }, booking_id);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }
}
