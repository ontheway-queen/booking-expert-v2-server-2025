"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const authChecker_1 = __importDefault(require("../../../middleware/authChecker/authChecker"));
const agentB2CHotel_controller_1 = require("../controllers/agentB2CHotel.controller");
class AgentB2CHotelRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CHotel_controller_1.AgentB2CHotelController();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.post('/search', this.controller.hotelSearch);
        this.router.post('/rooms', this.controller.hotelRooms);
        this.router.post('/room/recheck', this.controller.hotelRoomRecheck);
        this.router
            .route('/booking')
            .post(this.authChecker.agencyB2CUserAuthChecker, this.uploader.cloudUploadRaw(this.fileFolders.AGENT_B2C_HOTEL_BOOKING_FILES), this.controller.hotelBooking)
            .get(this.authChecker.agencyB2CUserAuthChecker, this.controller.getHotelBooking);
        this.router
            .route('/booking/:id')
            .get(this.authChecker.agencyB2CUserAuthChecker, this.controller.getSingleHotelBooking);
    }
}
exports.default = AgentB2CHotelRouter;
