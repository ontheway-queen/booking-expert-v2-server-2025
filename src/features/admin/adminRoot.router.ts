import { Router } from 'express';
import AdminB2CRouter from './routers/adminB2C.router';
import AdminAgentRouter from './routers/adminAgent.router';
import AdminAdministrationRouter from './routers/adminAdministration.router';
import AdminConfigRouter from './routers/adminConfig.router';
import AdminGroupFareRouter from './routers/adminGroupFare.router';
import AdminHolidayRouter from './routers/adminHoliday.router';
import AdminMainRouter from './routers/adminMain.router';
import AdminHotelMarkupSetRouter from './routers/adminHotelMarkupSet.router';
import AdminProfileRouter from './routers/adminProfile.router';
import AdminReportRouter from './routers/adminReport.router';
import AdminUmrahRouter from './routers/adminUmrah.router';
import AdminVisaRouter from './routers/adminVisa.router';
import { AdminAirlinesPreferenceRouter } from './routers/adminAirlinesPreference.router';
import { AdminDynamicFareRouter } from './routers/adminDynamicFare.router';
import { AdminDynamicFareSetRouter } from './routers/adminDynamicFareSet.router';
import AdminAccountsRouter from './routers/adminAccounts.router';

export default class AdminRootRouter {
  public Router = Router();

  // Router classes
  private adminAdministrationRouter = new AdminAdministrationRouter();
  private adminConfigRouter = new AdminConfigRouter();
  private adminGroupFareRouter = new AdminGroupFareRouter();
  private adminHolidayRouter = new AdminHolidayRouter();
  private adminMainRouter = new AdminMainRouter();
  private adminHotelMarkupSetRouter = new AdminHotelMarkupSetRouter();
  private adminProfileRouter = new AdminProfileRouter();
  private adminReportRouter = new AdminReportRouter();
  private adminUmrahRouter = new AdminUmrahRouter();
  private adminVisaRouter = new AdminVisaRouter();
  private adminAirlinesPreferenceRouter = new AdminAirlinesPreferenceRouter();
  private adminDynamicFareRouter = new AdminDynamicFareRouter();
  private adminDynamicFareSetRouter = new AdminDynamicFareSetRouter();
  private adminAccountsRouter = new AdminAccountsRouter();

  //Admin Agent ,Admin B2C Sub Root Router Class
  private adminB2CRouter = new AdminB2CRouter();
  private adminAgentRouter = new AdminAgentRouter();
  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.Router.use('/', this.adminMainRouter.router);
    this.Router.use('/profile', this.adminProfileRouter.router);
    this.Router.use('/report', this.adminReportRouter.router);
    this.Router.use('/administration', this.adminAdministrationRouter.router);
    this.Router.use('/config', this.adminConfigRouter.router);
    this.Router.use('/group-fare', this.adminGroupFareRouter.router);
    this.Router.use('/holiday', this.adminHolidayRouter.router);
    this.Router.use('/umrah', this.adminUmrahRouter.router);
    this.Router.use('/visa', this.adminVisaRouter.router);
    this.Router.use(
      '/airlines-preference',
      this.adminAirlinesPreferenceRouter.router
    );
    this.Router.use('/hotel-markup-set', this.adminHotelMarkupSetRouter.router);
    this.Router.use('/dynamic-fare-set', this.adminDynamicFareSetRouter.router);
    this.Router.use('/dynamic-fare', this.adminDynamicFareRouter.router);
    this.Router.use('/accounts', this.adminAccountsRouter.router);

    //Admin Agent, Admin B2C Root Routes
    this.Router.use('/agent', this.adminAgentRouter.router);
    this.Router.use('/b2c', this.adminB2CRouter.router);
  }
}
