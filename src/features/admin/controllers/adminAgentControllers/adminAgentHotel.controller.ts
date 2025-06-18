import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import AdminAgentHotelValidator from '../../utils/validators/adminAgentValidators/adminAgentHotel.validator';
import AdminAgentHotelService from '../../services/adminAgentServices/adminAgentHotel.service';

export class AdminAgentHotelController extends AbstractController {
  private validator = new AdminAgentHotelValidator();
  private services = new AdminAgentHotelService();
  constructor() {
    super();
  }

  public getBooking = this.asyncWrapper.wrap(
    { bodySchema: this.validator.getBooking },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getBooking(req);
      res.status(code).json(rest);
    }
  );

  public getSingleBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getSingleBooking(req);
      res.status(code).json(rest);
    }
  );
}
