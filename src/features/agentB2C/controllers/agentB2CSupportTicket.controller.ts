import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AgentB2CSupportTicketService } from '../services/agentB2CSupportTicket.service';
import AgentB2CSupportTicketValidator from '../utils/validators/agentB2CSupportTicket.validator';

export class AgentB2CSupportTicketController extends AbstractController {
  private service = new AgentB2CSupportTicketService();
  private validator = new AgentB2CSupportTicketValidator();
  constructor() {
    super();
  }

  public createSupportTicker = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createSupportTicket,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createSupportTicket(req);
      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  public getSupportTicket = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.getSupportTicket,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSupportTicket(req);
      res.status(code).json(rest);
    }
  );

  public getSingleSupportTicket = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } =
        await this.service.getSingleSupportTicketWithMsg(req);
      res.status(code).json(rest);
    }
  );

  public getSupportTicketMsg = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSupportTicketMsg(req);
      res.status(code).json(rest);
    }
  );

  public sendSupportTicketReplay = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.sendMsg,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.sendSupportTicketReplay(req);
      res.status(code).json(rest);
    }
  );

  public closeSupportTicket = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.closeSupportTicket(req);
      res.status(code).json(rest);
    }
  );
}
