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
        //flight routers
        this.router.post('/flight', this.controller.createCommissionSet);
    }
}
exports.default = AdminMarkupSetRouter;
