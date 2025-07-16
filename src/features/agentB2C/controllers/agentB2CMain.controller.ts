import AbstractController from '../../../abstract/abstract.controller';
import { Request, Response } from 'express';
import { AgentB2CMainService } from '../services/agentB2CMain.service';
import AgentB2CMainValidator from '../utils/validators/agentB2CMain.validator';
export class AgentB2CMainController extends AbstractController {
  private validator = new AgentB2CMainValidator();
  private service = new AgentB2CMainService();

  public sendEmailOTP = this.asyncWrapper.wrap(
    { bodySchema: this.validator.sendOtpInputValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.sendEmailOtp(req);
      res.status(code).json(rest);
    }
  );

  public matchEmailOTP = this.asyncWrapper.wrap(
    { bodySchema: this.validator.matchEmailOtpInputValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.matchEmailOtpService(req);
      res.status(code).json(rest);
    }
  );
}
