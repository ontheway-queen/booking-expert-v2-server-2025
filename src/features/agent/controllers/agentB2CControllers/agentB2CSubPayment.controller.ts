import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentB2CSubPaymentService } from '../../services/agentB2CServices/agentB2CSubPayment.service';
import { AgentB2CSubPaymentValidator } from '../../utils/validators/agentB2CValidators/agentB2CSubPayment.validator';

export class AgentB2CSubPaymentController extends AbstractController {
  private validator = new AgentB2CSubPaymentValidator();
  private services = new AgentB2CSubPaymentService();
  constructor() {
    super();
  }

  public getDepositRequestList = this.asyncWrapper.wrap(
    { querySchema: this.validator.getDepositRequest },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getDepositRequestList(req);
      res.status(code).json(rest);
    }
  );

  public getSingleDepositRequest = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getSingleDepositRequest(
        req
      );
      res.status(code).json(rest);
    }
  );

  public updateDepositRequest = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateDepositRequest,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateDepositRequest(req);
      res.status(code).json(rest);
    }
  );
}
