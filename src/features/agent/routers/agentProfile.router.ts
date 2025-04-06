import AbstractRouter from '../../../abstract/abstract.router';

export default class AgentProfileRouter extends AbstractRouter {
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    // Profile API
    this.router.route('/');

    // Change Password
    this.router.route('/change-password');
  }
}
