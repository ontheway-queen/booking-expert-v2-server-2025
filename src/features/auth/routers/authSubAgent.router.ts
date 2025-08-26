import AbstractRouter from '../../../abstract/abstract.router';
import AuthSubAgentController from '../controllers/authSubAgent.controller';

export default class AuthSubAgentRouter extends AbstractRouter {
  private controller = new AuthSubAgentController();
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
          'agency_logo',
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
