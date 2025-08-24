import AbstractRouter from '../../../abstract/abstract.router';
import { SubAgentMainController } from '../controllers/subAgentMain.controller';

export default class SubAgentMainRouter extends AbstractRouter {
  private controller = new SubAgentMainController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/email-otp/send').post(this.controller.sendEmailOTP);

    this.router.route('/email-otp/match').post(this.controller.matchEmailOTP);
  }
}
