"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminHotelMarkupSet_controller_1 = __importDefault(require("../controllers/adminHotelMarkupSet.controller"));
class AdminHotelMarkupSetRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminHotelMarkupSet_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/').get(this.controller.getMarkupSet);
        this.router.route('/hotel').post(this.controller.createHotelMarkupSet);
        this.router.route('/:id').delete(this.controller.deleteMarkupSet);
        this.router
            .route('/:id/hotel')
            .get(this.controller.getSingleHotelMarkup)
            .patch(this.controller.updateHotelMarkupSet);
    }
}
exports.default = AdminHotelMarkupSetRouter;
