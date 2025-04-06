import { Router } from 'express';
import PublicCommonRouter from './routers/publicCommon.router';
import PublicEmailOTPRouter from './routers/publicEmailOTP.router';

export default class PublicRootRouter {
  public Router = Router();

  // Router classes
  private publicCommonRouter = new PublicCommonRouter();
  private publicEmailOtpRouter = new PublicEmailOTPRouter();
  constructor() {
    this.callRouter();
  }

  private callRouter() {
    // Public common Routes
    this.Router.use('/common', this.publicCommonRouter.router);

    // Public email otp Routes
    this.Router.use('/email-otp', this.publicEmailOtpRouter.router);
  }
}
