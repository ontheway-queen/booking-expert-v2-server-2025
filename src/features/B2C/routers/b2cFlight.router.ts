import AbstractRouter from '../../../abstract/abstract.router';
import { B2CFlightController } from '../controllers/b2cFlight.controller';

export default class B2CFlightRouter extends AbstractRouter {
  private controller = new B2CFlightController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/search').post(this.controller.flightSearch);
    this.router.route('/search/sse').get(this.controller.FlightSearchSSE);
    this.router.route('/search/fare-rules').get(this.controller.getFareRules);
    this.router.route('/revalidate').get(this.controller.flightRevalidate);
    this.router.route('/booking');
    this.router.route('/booking/:id');
    this.router.route('/booking/:id/cancel');
    this.router.route('/booking/:id/payment');
  }
}
