"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const subAgentHotel_controller_1 = __importDefault(require("../controllers/subAgentHotel.controller"));
class SubAgentHotelRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new subAgentHotel_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.post('/search', this.controller.hotelSearch);
        this.router.get('/search/history', this.controller.hotelSearchHistory);
        this.router.post('/rooms', this.controller.hotelRooms);
        this.router.post('/room/recheck', this.controller.hotelRoomRecheck);
        this.router
            .route('/booking')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_HOTEL_BOOKING_FILES), this.controller.hotelBooking)
            .get(this.controller.getHotelBooking);
        this.router
            .route('/booking/:id')
            .get(this.controller.getSingleHotelBooking);
    }
}
exports.default = SubAgentHotelRouter;
