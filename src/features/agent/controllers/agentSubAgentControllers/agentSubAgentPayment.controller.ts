import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentSubAgentPaymentService } from '../../services/agentSubAgentServices/agentSubAgentPayment.service';
import { AgentSubAgentPaymentValidator } from '../../utils/validators/agentSubAgentValidators/agentSubAgentPayment.validator';

export class AgentSubAgentPaymentController extends AbstractController {
  private validator = new AgentSubAgentPaymentValidator();
  private services = new AgentSubAgentPaymentService();
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

  public getLedger = this.asyncWrapper.wrap(
    { querySchema: this.validator.getLedger },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getLedger(req);
      res.status(code).json(rest);
    }
  );

  public balanceAdjust = this.asyncWrapper.wrap(
    { bodySchema: this.validator.balanceAdjust },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.balanceAdjust(req);
      res.status(code).json(rest);
    }
  );
}
