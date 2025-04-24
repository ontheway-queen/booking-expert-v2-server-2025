import AbstractRouter from '../../../abstract/abstract.router';
import AdminMarkupSetController from '../controllers/adminMarkupSet.controller';

export default class AdminMarkupSetRouter extends AbstractRouter {
  private controller = new AdminMarkupSetController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/').get(this.controller.getMarkupSet);

    this.router.route('/flight').post(this.controller.createFlightMarkupSet);

    this.router.route('/hotel').post(this.controller.createHotelMarkupSet);

    this.router.route('/:id').delete(this.controller.deleteMarkupSet);

    //flight routers
    this.router.route('/flight/api').get(this.controller.getAllFlightApi);

    this.router
      .route('/:id/flight')
      .get(this.controller.getSingleFlightMarkupSet)
      .patch(this.controller.updateFlightMarkupSet);

    this.router
      .route('/:id/hotel')
      .get(this.controller.getSingleHotelMarkup)
      .patch(this.controller.updateHotelMarkupSet);

    this.router
      .route('/:set_id/flight/api/:set_api_id')
      .get(this.controller.getMarkupSetFlightApiDetails)
      .post(this.controller.updateMarkupSetFlightApi);
  }
}
