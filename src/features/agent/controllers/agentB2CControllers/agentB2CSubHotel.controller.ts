import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentB2CSubHotelService } from '../../services/agentB2CServices/agentB2CSubHotel.service';
import AgentB2CSubHotelValidator from '../../utils/validators/agentB2CValidators/agentB2CSubHotel.validator';

export class AgentB2CSubHotelController extends AbstractController {
  private validator = new AgentB2CSubHotelValidator();
  private services = new AgentB2CSubHotelService();
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
  public updateBooking = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateBooking,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateBooking(req);
      res.status(code).json(rest);
    }
  );
}
