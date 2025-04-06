import { Router } from 'express';
import B2CMainRouter from './routers/b2cMain.router';
import B2CHolidayRouter from './routers/b2cHoliday.router';
import B2CHotelRouter from './routers/b2cHotel.router';
import B2CFlightRouter from './routers/b2cFlight.router';
import B2CProfileRouter from './routers/b2cProfile.router';
import B2CSupportTicketRouter from './routers/b2cSupportTicket.router';
import B2CTravelerRouter from './routers/b2cTraveler.router';
import B2CUmrahRouter from './routers/b2cUmrah.router';
import B2CVisaRouter from './routers/b2cVisa.router';

export default class B2CRootRouter {
  public Router = Router();

  // Router classes
  private b2cMainRouter = new B2CMainRouter();
  private b2cHolidayRouter = new B2CHolidayRouter();
  private b2cHotelRouter = new B2CHotelRouter();
  private b2cFlightRouter = new B2CFlightRouter();
  private b2cProfileRouter = new B2CProfileRouter();
  private b2cSupportTicketRouter = new B2CSupportTicketRouter();
  private b2cTravelerRouter = new B2CTravelerRouter();
  private b2cUmrahRouter = new B2CUmrahRouter();
  private b2cVisaRouter = new B2CVisaRouter();

  constructor() {
    this.callRouter();
  }
  private callRouter() {
    this.Router.use('/', this.b2cMainRouter.router);
    this.Router.use('/flight', this.b2cFlightRouter.router);
    this.Router.use('/hotel', this.b2cHotelRouter.router);
    this.Router.use('/visa', this.b2cVisaRouter.router);
    this.Router.use('/holiday', this.b2cHolidayRouter.router);
    this.Router.use('/umrah', this.b2cUmrahRouter.router);
    this.Router.use('/profile', this.b2cProfileRouter.router);
    this.Router.use('/traveler', this.b2cTravelerRouter.router);
    this.Router.use('/support-ticket', this.b2cSupportTicketRouter.router);
  }
}
