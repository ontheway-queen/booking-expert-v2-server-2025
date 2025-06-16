import AbstractRouter from '../../../abstract/abstract.router';

export default class B2CFlightRouter extends AbstractRouter {
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/search');
    this.router.route('/search/sse');
    this.router.route('/search/fare-rules');
    this.router.route('/revalidate');
    this.router.route('/booking');
    this.router.route('/booking/:id');
    this.router.route('/booking/:id/cancel');
    this.router.route('/booking/:id/payment');
  }
}
