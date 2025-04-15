"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminMarkupSet_controller_1 = __importDefault(require("../controllers/adminMarkupSet.controller"));
class AdminMarkupSetRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminMarkupSet_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/')
            .post(this.controller.createCommissionSet)
            .get(this.controller.getMarkupSet);
        //flight routers
        this.router.route('/flight/api')
            .get(this.controller.getAllFlightApi);
        this.router.route('/:id/flight')
            .get(this.controller.getSingleFlightMarkupSet)
            .delete(this.controller.deleteFlightMarkupSet)
            .patch(this.controller.updateFlightMarkupSet);
        this.router.route('/:set_id/flight/api/:set_api_id')
            .get(this.controller.getMarkupSetFlightApiDetails)
            .post(this.controller.updateMarkupSetFlightApi);
    }
}
exports.default = AdminMarkupSetRouter;
