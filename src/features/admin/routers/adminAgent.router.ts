import AbstractRouter from '../../../abstract/abstract.router';
import AdminAgentAgencyRouter from './adminAgentRouters/adminAgentAgency.router';
import AdminAgentFlightRouter from './adminAgentRouters/adminAgentFlight.router';
import AdminAgentGroupFareRouter from './adminAgentRouters/adminAgentGroupFare.router';
import AdminAgentHolidayRouter from './adminAgentRouters/adminAgentHoliday.router';
import AdminAgentHotelRouter from './adminAgentRouters/adminAgentHotel.router';
import AdminAgentPaymentRouter from './adminAgentRouters/adminAgentPayment.router';
import AdminAgentPromotionsRouter from './adminAgentRouters/adminAgentPromotions.router';
import AdminAgentSupportTicketRouter from './adminAgentRouters/adminAgentSupportTicket.router';
import AdminAgentUmrahRouter from './adminAgentRouters/adminAgentUmrah.router';
import AdminAgentVisaRouter from './adminAgentRouters/adminAgentVisa.router';

export default class AdminAgentRouter extends AbstractRouter {
  // Router classes
  private agencyRouter = new AdminAgentAgencyRouter();
  private flightRouter = new AdminAgentFlightRouter();
  private groupFareRouter = new AdminAgentGroupFareRouter();
  private holidayRouter = new AdminAgentHolidayRouter();
  private hotelRouter = new AdminAgentHotelRouter();
  private paymentRouter = new AdminAgentPaymentRouter();
  private promotionsRouter = new AdminAgentPromotionsRouter();
  private supportTicketRouter = new AdminAgentSupportTicketRouter();
  private umrahRouter = new AdminAgentUmrahRouter();
  private visaRouter = new AdminAgentVisaRouter();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.use('/agency', this.agencyRouter.router);
    this.router.use('/flight', this.flightRouter.router);
    this.router.use('/group-fare', this.groupFareRouter.router);
    this.router.use('/holiday', this.holidayRouter.router);
    this.router.use('/hotel', this.hotelRouter.router);
    this.router.use('/payment', this.paymentRouter.router);
    this.router.use('/promotions', this.promotionsRouter.router);
    this.router.use('/support-ticket', this.supportTicketRouter.router);
    this.router.use('/umrah', this.umrahRouter.router);
    this.router.use('/visa', this.visaRouter.router);
  }
}
