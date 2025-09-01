import AbstractRouter from '../../../abstract/abstract.router';

export default class SubAgentDashboardRouter extends AbstractRouter {
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // Dashboard data API
    this.router.route('/dashboard');

    // Search Api
    this.router.route('/search');

    // Notification API
    this.router.route('/notification');

    // Quick Links
    this.router.route('/quick-links');
  }
}
