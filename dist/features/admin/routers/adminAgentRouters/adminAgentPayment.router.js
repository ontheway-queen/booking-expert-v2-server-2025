"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const adminAgentPayments_controller_1 = __importDefault(require("../../controllers/adminAgentControllers/adminAgentPayments.controller"));
class AdminAgentPaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminAgentPayments_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/loan').post(this.controller.createLoan);
        this.router.route('/loan/history').get(this.controller.loanHistory);
        this.router.route('/ledger').get(this.controller.getLedger);
    }
}
exports.default = AdminAgentPaymentRouter;
