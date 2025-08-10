import { Request, Response } from 'express';
import AbstractRouter from '../../../abstract/abstract.router';
import PublicCommonController from '../controllers/publicCommon.controller';

export default class PublicCommonRouter extends AbstractRouter {
  private controller = new PublicCommonController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/country').get(this.controller.getCountry);
    this.router.route('/city').get(this.controller.getCity);
    this.router.route('/airport').get(this.controller.getAirport);
    this.router.route('/airlines').get(this.controller.getAirlines);
    this.router.route('/location-hotel').get(this.controller.getLocationHotel);
    this.router.route('/banks').get(this.controller.getBank);
  }
}
