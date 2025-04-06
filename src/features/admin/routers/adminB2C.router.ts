import AbstractRouter from '../../../abstract/abstract.router';
import AdminB2CBlogRouter from './adminB2CRouters/adminB2CBlog.router';
import AdminB2CConfigRouter from './adminB2CRouters/adminB2CConfig.router';
import AdminB2CFlightRouter from './adminB2CRouters/adminB2CFlight.router';
import AdminB2CHolidayRouter from './adminB2CRouters/adminB2CHoliday.router';
import AdminB2CHotelRouter from './adminB2CRouters/adminB2CHotel.router';
import AdminB2CMainRouter from './adminB2CRouters/adminB2CMain.router';
import AdminB2CSupportTicketRouter from './adminB2CRouters/adminB2CSupportTicket.router';
import AdminB2CUmrahRouter from './adminB2CRouters/adminB2CUmrah.router';
import AdminB2CUsersRouter from './adminB2CRouters/adminB2CUsers.router';
import AdminB2CVisaRouter from './adminB2CRouters/adminB2CVisa.router';

export default class AdminB2CRouter extends AbstractRouter {
  // Router classes
  private mainRouter = new AdminB2CMainRouter();
  private blogRouter = new AdminB2CBlogRouter();
  private configRouter = new AdminB2CConfigRouter();
  private flightRouter = new AdminB2CFlightRouter();
  private holidayRouter = new AdminB2CHolidayRouter();
  private hotelRouter = new AdminB2CHotelRouter();
  private supportTicketRouter = new AdminB2CSupportTicketRouter();
  private umrahRouter = new AdminB2CUmrahRouter();
  private usersRouter = new AdminB2CUsersRouter();
  private visaRouter = new AdminB2CVisaRouter();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.use('/', this.mainRouter.router);
    this.router.use('/blog', this.blogRouter.router);
    this.router.use('/config', this.configRouter.router);
    this.router.use('/flight', this.flightRouter.router);
    this.router.use('/holiday', this.holidayRouter.router);
    this.router.use('/hotel', this.hotelRouter.router);
    this.router.use('/support-ticket', this.supportTicketRouter.router);
    this.router.use('/umrah', this.umrahRouter.router);
    this.router.use('/users', this.usersRouter.router);
    this.router.use('/visa', this.visaRouter.router);
  }
}
