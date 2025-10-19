"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const agentB2CSubHotel_controller_1 = require("../../controllers/agentB2CControllers/agentB2CSubHotel.controller");
class AgentB2CSubHotelRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CSubHotel_controller_1.AgentB2CSubHotelController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/booking').get(this.controller.getBooking);
        this.router
            .route('/booking/:id')
            .get(this.controller.getSingleBooking)
            .patch(this.controller.updateBooking);
    }
}
exports.default = AgentB2CSubHotelRouter;
