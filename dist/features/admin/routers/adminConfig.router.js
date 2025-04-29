"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminConfig_controller_1 = __importDefault(require("../controllers/adminConfig.controller"));
class AdminConfigRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminConfig_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        //check slug
        this.router.route('/check-slug')
            .get(this.controller.checkSlug);
    }
}
exports.default = AdminConfigRouter;
