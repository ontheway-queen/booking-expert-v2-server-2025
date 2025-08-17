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

  public adjustBalance = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.adjustBalance,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.adjustBalance(req);
      res.status(code).json(rest);
    }
  );

  public createADM = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createADM,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.createADM(req);
      res.status(code).json(rest);
    }
  );

  public getADMList = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getADM,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getADMList(req);
      res.status(code).json(rest);
    }
  );

  public getSingleADM = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getSingleADM(req);
      res.status(code).json(rest);
    }
  );

  public updateADM = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateADM,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateADM(req);
      res.status(code).json(rest);
    }
  );

  public deleteADM = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.deleteADM(req);
      res.status(code).json(rest);
    }
  );
}
