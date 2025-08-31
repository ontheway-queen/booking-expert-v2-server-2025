"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminAccounts_controller_1 = __importDefault(require("../controllers/adminAccounts.controller"));
class AdminAccountsRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminAccounts_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .get(this.controller.getAccounts)
            .post(this.controller.createAccounts);
        this.router
            .route('/:id')
            .patch(this.controller.updateAccounts)
            .delete(this.controller.deleteAccounts);
    }
}
exports.default = AdminAccountsRouter;
