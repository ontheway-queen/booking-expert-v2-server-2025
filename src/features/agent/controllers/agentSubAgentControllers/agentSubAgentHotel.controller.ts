import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentSubAgentHotelService } from '../../services/agentSubAgentServices/agentSubAgentHotel.service';
import AgentSubAgentHotelValidator from '../../utils/validators/agentSubAgentValidators/agentSubAgentHotel.validator';

export class AgentSubAgentHotelController extends AbstractController {
  private validator = new AgentSubAgentHotelValidator();
  private services = new AgentSubAgentHotelService();
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
