"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentB2CHotel_controller_1 = require("../controllers/agentB2CHotel.controller");
class AgentB2CHotelRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CHotel_controller_1.AgentB2CHotelController();
        this.callRouter();
    }
    callRouter() {
        this.router.post('/search', this.controller.hotelSearch);
        this.router.post('/rooms', this.controller.hotelRooms);
        this.router.post('/room/recheck', this.controller.hotelRoomRecheck);
    }
}
exports.default = AgentB2CHotelRouter;
