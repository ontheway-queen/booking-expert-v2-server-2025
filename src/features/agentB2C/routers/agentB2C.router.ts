import AbstractRouter from '../../../abstract/abstract.router';
import { AgentB2CMainController } from '../controllers/agentB2CMain.controller';

export default class AgentB2CRouter extends AbstractRouter {
  private controller = new AgentB2CMainController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/email-otp/send').post(this.controller.sendEmailOTP);

    this.router.route('/email-otp/match').post(this.controller.matchEmailOTP);

    this.router
      .route('/email-subscriber')
      .post(this.controller.createEmailSubscriber);
  }
}
