import AbstractController from '../../../abstract/abstract.controller';
import { Request, Response } from 'express';
import { SubAgentMainService } from '../services/subAgentMain.service';
import SubAgentMainValidator from '../utils/validator/subagentMain.validator';
export class SubAgentMainController extends AbstractController {
  private validator = new SubAgentMainValidator();
  private service = new SubAgentMainService();

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
