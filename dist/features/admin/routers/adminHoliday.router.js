"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminHoliday_controller_1 = __importDefault(require("../controllers/adminHoliday.controller"));
class AdminHolidayRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminHoliday_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_HOLIDAY_PACKAGE, [
            'images',
        ]), this.controller.createHoliday)
            .get(this.controller.getHolidayPackageList);
        this.router
            .route('/:id')
            .get(this.controller.getSingleHolidayPackage)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_HOLIDAY_PACKAGE, [
            'images',
        ]), this.controller.updateHolidayPackage)
            .delete(this.controller.deleteHolidayPackage);
    }
}
exports.default = AdminHolidayRouter;
