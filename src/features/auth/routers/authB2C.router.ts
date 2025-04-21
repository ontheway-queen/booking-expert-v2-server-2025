import AbstractRouter from '../../../abstract/abstract.router';
import AuthB2CController from '../controllers/authB2C.controller';

export default class AuthB2CRouter extends AbstractRouter {
  private controller = new AuthB2CController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/login').post(this.controller.login);
    this.router.route('/register').post(this.controller.register);
    this.router
      .route('/register/complete')
      .post(this.controller.registerComplete);
    this.router.route('/login/2fa').post(this.controller.login2FA);
    this.router.route('/reset-password').post(this.controller.resetPassword);
  }
}
