import { Router } from 'express';
import ExternalFlightRouter from './routers/externalFlight.router';
import ExternalHotelRouter from './routers/externalHotel.router';

export default class ExternalRootRouter {
  public Router = Router();

  // Router classes
  private flightRouter = new ExternalFlightRouter();
  private hotelRouter = new ExternalHotelRouter();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.Router.use('/flight', this.flightRouter.router);
    this.Router.use('/hotel', this.hotelRouter.router);
  }
}
