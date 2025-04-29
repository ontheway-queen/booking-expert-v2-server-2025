import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import AdminAgentPaymentsService from '../../services/adminAgentServices/adminAgentPayments.service';
import AdminAgentPaymentsValidator from '../../utils/validators/adminAgentValidators/adminAgentPayments.validator';

export default class AdminAgentPaymentsController extends AbstractController {
  private services = new AdminAgentPaymentsService();
  private validator = new AdminAgentPaymentsValidator();
  constructor() {
    super();
  }

  public createLoan = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createLoan },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.createLoan(req);
      res.status(code).json(rest);
    }
  );

  public loanHistory = this.asyncWrapper.wrap(
    { querySchema: this.validator.getLoanHistory },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.loanHistory(req);
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
}
