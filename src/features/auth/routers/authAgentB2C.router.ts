import AbstractRouter from '../../../abstract/abstract.router';
import AuthAgentB2CController from '../controllers/authAgentB2C.controller';

export default class AuthAgentB2CRouter extends AbstractRouter {
  private controller = new AuthAgentB2CController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/login').post(this.controller.login);
    this.router
      .route('/register')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_FILES, [
          'photo'
        ]),
        this.controller.register
      );
    this.router.route('/reset-password').post(this.controller.resetPassword);
  }
}
