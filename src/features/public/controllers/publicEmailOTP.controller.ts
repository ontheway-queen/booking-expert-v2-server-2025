import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import PublicEmailOTPService from '../services/publicEmailOTP.service';
import PublicEmailOTPValidator from '../utils/validators/publicEmailOTP.validator';
import {
  IMatchOTPReqBody,
  ISendEmailOTPReqBody,
} from '../utils/types/publicOTP.types';

export default class PublicEmailOTPController extends AbstractController {
  private service = new PublicEmailOTPService();
  private validator = new PublicEmailOTPValidator();
  constructor() {
    super();
  }

  public sendEmailOTP = this.asyncWrapper.wrap(
    { bodySchema: this.validator.sendOtpInputValidator },
    async (req: Request, res: Response) => {
      const body = req.body as ISendEmailOTPReqBody;
      const { code, ...rest } = await this.service.sendEmailOtp(body);
      res.status(code).json(rest);
    }
  );

  public matchEmailOTP = this.asyncWrapper.wrap(
    { bodySchema: this.validator.matchEmailOtpInputValidator },
    async (req: Request, res: Response) => {
      const body = req.body as IMatchOTPReqBody;
      const { code, ...rest } = await this.service.matchEmailOtpService(body);
      res.status(code).json(rest);
    }
  );
}
