"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDynamicFareSetRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminDynamicFareSet_controller_1 = __importDefault(require("../controllers/adminDynamicFareSet.controller"));
class AdminDynamicFareSetRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminDynamicFareSet_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.controller.createSet)
            .get(this.controller.getSets);
        this.router.route('/supplier').get(this.controller.getSupplierList);
        this.router
            .route('/:id')
            .patch(this.controller.updateSet)
            .delete(this.controller.deleteSet);
    }
}
exports.AdminDynamicFareSetRouter = AdminDynamicFareSetRouter;
