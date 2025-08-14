import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import AgentB2CPaymentService from '../services/agentB2CPayment.service';
import AgentB2CPaymentValidator from '../utils/validators/agentB2CPayment.validator';

export default class AgentB2CPaymentController extends AbstractController {
  private service = new AgentB2CPaymentService();
  private validator = new AgentB2CPaymentValidator();
  constructor() {
    super();
  }

  public createDepositRequest = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createDeposit },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createDepositRequest(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  public getSingleDepositRequest = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleDepositReq(req);
      res.status(code).json(rest);
    }
  );

  public cancelCurrentDepositRequest = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.cancelCurrentDepositRequest(
        req
      );
      res.status(code).json(rest);
    }
  );

  public getDepositRequest = this.asyncWrapper.wrap(
    { bodySchema: this.validator.getDeposit },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getDepositRequest(req);
      res.status(code).json(rest);
    }
  );

  public getInvoices = this.asyncWrapper.wrap(
    { bodySchema: this.validator.getInvoicesFilterQuery },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getInvoices(req);
      res.status(code).json(rest);
    }
  );

  public getSingleInvoice = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleInvoice(req);
      res.status(code).json(rest);
    }
  );

  public clearDueOfInvoice = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.clearDueOfInvoice(req);
      res.status(code).json(rest);
    }
  );

  public getLedger = this.asyncWrapper.wrap(
    { bodySchema: this.validator.getLedger },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getLedger(req);
      res.status(code).json(rest);
    }
  );
}
