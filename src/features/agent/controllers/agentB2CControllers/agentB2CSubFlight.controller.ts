import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentB2CSubFlightService } from '../../services/agentB2CServices/agentB2CSubFlight.service';
import AgentB2CSubFlightValidator from '../../utils/validators/agentB2CValidators/agentB2CSubFlight.validator';

export default class AgentB2CSubFlightController extends AbstractController {
  private validator = new AgentB2CSubFlightValidator();
  private service = new AgentB2CSubFlightService();
  constructor() {
    super();
  }

  public getAllBooking = this.asyncWrapper.wrap(
    { querySchema: this.validator.getFlightListSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllBooking(req);
      res.status(code).json(data);
    }
  );

  public getSingleBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleBooking(req);
      res.status(code).json(data);
    }
  );

  public updateBooking = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateFlightBookingSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.updateBooking(req);
      res.status(code).json(rest);
    }
  );
}
