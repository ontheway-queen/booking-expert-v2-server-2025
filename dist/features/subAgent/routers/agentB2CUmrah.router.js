"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const subAgentUmrah_controller_1 = require("../controllers/subAgentUmrah.controller");
class SubAgentUmrahRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new subAgentUmrah_controller_1.SubAgentUmrahController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/').get(this.controller.getUmrahPackages);
        this.router.route('/booking').get(this.controller.getUmrahBookingList);
        this.router.route('/:id/book').post(this.controller.bookUmrahPackage);
        this.router
            .route('/booking/:id')
            .get(this.controller.getSingleUmrahBooking);
        this.router
            .route('/booking/:id/cancel')
            .post(this.controller.cancelUmrahBooking);
        this.router.route('/:slug').get(this.controller.getSingleUmrahPackages);
    }
}
exports.default = SubAgentUmrahRouter;
