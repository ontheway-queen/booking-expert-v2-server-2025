import AbstractRouter from '../../../abstract/abstract.router';
import AuthAgentController from '../controllers/authAgent.controller';

export default class AuthAgentRouter extends AbstractRouter {
  private controller = new AuthAgentController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/login').post(this.controller.login);
    this.router
      .route('/register')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_FILES, [
          'logo',
          'civil_aviation',
          'trade_license',
          'national_id',
        ]),
        this.controller.register
      );
    this.router
      .route('/register/complete')
      .post(this.controller.registerComplete);
    this.router.route('/login/2fa').post(this.controller.login2FA);
    this.router.route('/reset-password').post(this.controller.resetPassword);
  }
}
