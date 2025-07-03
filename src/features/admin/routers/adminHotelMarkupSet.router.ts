import AbstractRouter from '../../../abstract/abstract.router';
import AdminHotelMarkupSetController from '../controllers/adminHotelMarkupSet.controller';

export default class AdminHotelMarkupSetRouter extends AbstractRouter {
  private controller = new AdminHotelMarkupSetController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .get(this.controller.getMarkupSet)
      .post(this.controller.createHotelMarkupSet);

    this.router
      .route('/:id')
      .get(this.controller.getSingleHotelMarkup)
      .delete(this.controller.deleteMarkupSet)
      .patch(this.controller.updateHotelMarkupSet);
  }
}
