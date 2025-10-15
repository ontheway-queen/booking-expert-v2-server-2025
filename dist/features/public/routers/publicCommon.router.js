"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const publicCommon_controller_1 = __importDefault(require("../controllers/publicCommon.controller"));
class PublicCommonRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new publicCommon_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/country').get(this.controller.getCountry);
        this.router.route('/city').get(this.controller.getCity);
        this.router.route('/airport').get(this.controller.getAirport);
        this.router.route('/airlines').get(this.controller.getAirlines);
        this.router.route('/location-hotel').get(this.controller.getLocationHotel);
        this.router.route('/banks').get(this.controller.getBank);
        this.router.route('/social-media').get(this.controller.getSocialMedia);
        this.router.route('/visa-type').get(this.controller.getVisaType);
        this.router.get('/get-booking/:pnr_code', this.controller.getSabreBooking);
    }
}
exports.default = PublicCommonRouter;
