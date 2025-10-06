import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import AgentSubAgentFlightValidator from '../../utils/validators/agentSubAgentValidators/agentSubAgentFlight.validator';
import { AgentSubAgentFlightService } from '../../services/agentSubAgentServices/agentSubAgentFlight.service';

export default class AgentSubAgentFlightController extends AbstractController {
  private validator = new AgentSubAgentFlightValidator();
  private service = new AgentSubAgentFlightService();
  constructor() {
    super();
  }

  public getAllBooking = this.asyncWrapper.wrap(
    { querySchema: this.validator.getFlightListSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllBookingList(req);
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
