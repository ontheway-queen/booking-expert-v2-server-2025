import AbstractRouter from '../../../abstract/abstract.router';
import PublicEmailOTPController from '../controllers/publicEmailOTP.controller';

export default class PublicEmailOTPRouter extends AbstractRouter {
  private controller = new PublicEmailOTPController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/send').post(this.controller.sendEmailOTP);
    this.router.route('/match').post(this.controller.matchEmailOTP);
  }
}
