import AbstractRouter from '../../../abstract/abstract.router';
import AuthAdminController from '../controllers/authAdmin.controller';

export default class AuthAdminRouter extends AbstractRouter {
  private controller = new AuthAdminController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/login').post(this.controller.login);
    this.router.route('/login/2fa').post(this.controller.login2FA);
    this.router.route('/reset-password').post(this.controller.resetPassword);
  }
}
