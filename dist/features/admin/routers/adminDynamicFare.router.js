"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDynamicFareRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminDynamicFare_controller_1 = __importDefault(require("../controllers/adminDynamicFare.controller"));
class AdminDynamicFareRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminDynamicFare_controller_1.default();
        this.callRouter();
    }
    callRouter() {
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
exports.AdminDynamicFareRouter = AdminDynamicFareRouter;
