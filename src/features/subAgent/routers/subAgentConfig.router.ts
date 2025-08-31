import AbstractRouter from '../../../abstract/abstract.router';
import SubAgentConfigController from '../controllers/subAgentConfig.controller';

export default class SubAgentConfigRouter extends AbstractRouter {
  private controller = new SubAgentConfigController();

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

    this.router
      .route('/terms-and-conditions')
      .get(this.controller.GetTermsAndConditionsPageData);

    this.router.route('/accounts').get(this.controller.GetAccountsData);
  }
}
