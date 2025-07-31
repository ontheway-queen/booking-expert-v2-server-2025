import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';

export default class AgentB2CUmrahService extends AbstractServices {
  constructor() {
    super();
  }

  public async getUmrahPackages(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;
    const umrahModel = this.Model.UmrahPackageModel();

    const data = await umrahModel.getUmrahPackageList({ limit });

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

    const data = await umrahModel.getSingleUmrahPackageDetails();

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  }

  public async bookUmrahPackages(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;
    const umrahModel = this.Model.UmrahPackageModel();

    const data = await umrahModel.getSingleUmrahPackageDetails();

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
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
    const UmrahBookingModel = this.Model.UmrahBookingModel();

    const data = await UmrahBookingModel.getSingleAgentB2CUmrahBookingDetails({
      id: parseInt(id),
      source_id: agency_id,
      user_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  }
}
