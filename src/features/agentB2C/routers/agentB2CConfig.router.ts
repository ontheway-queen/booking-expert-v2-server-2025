import AbstractRouter from '../../../abstract/abstract.router';
import AgentB2CConfigController from '../controllers/agentB2CConfig.controller';

export default class AgentB2CConfigRouter extends AbstractRouter {
  private controller = new AgentB2CConfigController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/home').get(this.controller.GetHomePageData);

    this.router.route('/about-us').get(this.controller.GetAboutUsPageData);

    this.router.route('/contact-us').get(this.controller.GetContactUsPageData);

    this.router
      .route('/privacy-policy')
      .get(this.controller.GetPrivacyPolicyPageData);
  }
}
