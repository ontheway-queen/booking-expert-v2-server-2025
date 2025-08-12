import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AgentPaymentsService } from '../services/agentPayments.service';
import { AgentPaymentsValidator } from '../utils/validators/agentPayments.validator';

export default class AgentPaymentsController extends AbstractController {
  private service = new AgentPaymentsService();
  private validator = new AgentPaymentsValidator();
  constructor() {
    super();
  }

  public createDepositRequest = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createDeposit },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createDepositRequest(req);
      res.status(code).json(rest);
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

  public getDepositHistory = this.asyncWrapper.wrap(
    { bodySchema: this.validator.getDeposit },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getDepositHistory(req);
      res.status(code).json(rest);
    }
  );

  public getADMList = this.asyncWrapper.wrap(
    { bodySchema: this.validator.getADM },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getADMList(req);
      res.status(code).json(rest);
    }
  );

  public getLoanHistory = this.asyncWrapper.wrap(
    { bodySchema: this.validator.getLoanHistory },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getLoanHistory(req);
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

  public topUpUsingPaymentGateway = this.asyncWrapper.wrap(
    { bodySchema: this.validator.topUpUsingPaymentGateway },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.topUpUsingPaymentGateway(
        req
      );
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

  public getPartialPaymentList = this.asyncWrapper.wrap(
    { bodySchema: this.validator.getPartialPaymentsFilterQuery },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getPartialPaymentList(req);
      res.status(code).json(rest);
    }
  );

  public getAgentBalance = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAgentBalance(req);
      res.status(code).json(rest);
    }
  );

  public getAccounts = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAccounts(req);
      res.status(code).json(rest);
    }
  );
}
