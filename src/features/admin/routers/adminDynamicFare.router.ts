import AbstractRouter from '../../../abstract/abstract.router';
import AdminDynamicFareController from '../controllers/adminDynamicFare.controller';

export class AdminDynamicFareRouter extends AbstractRouter {
  private controller = new AdminDynamicFareController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    this.router
      .route('/supplier')
      .post(this.controller.createSupplier)
      .get(this.controller.getSuppliers);

    this.router
      .route('/supplier/:id')
      .patch(this.controller.updateSupplier)
      .delete(this.controller.deleteSupplier);

    this.router
      .route('/airline-fare')
      .post(this.controller.createSupplierAirlinesFare)
      .get(this.controller.getSupplierAirlinesFares);

    this.router
      .route('/airline-fare/:id')
      .patch(this.controller.updateSupplierAirlinesFare)
      .delete(this.controller.deleteSupplierAirlinesFare);

    this.router
      .route('/fare-tax')
      .post(this.controller.createFareTax)
      .get(this.controller.getFareTaxes);

    this.router
      .route('/fare-tax/:id')
      .patch(this.controller.updateFareTax)
      .delete(this.controller.deleteFareTax);
  }
}
