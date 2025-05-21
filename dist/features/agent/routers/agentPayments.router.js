"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentPayments_controller_1 = __importDefault(require("../controllers/agentPayments.controller"));
class AgentPaymentsRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentPayments_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/deposit')
            .post(this.controller.createDepositRequest)
            .get(this.controller.getCurrentDepositRequest)
            .delete(this.controller.cancelCurrentDepositRequest);
        this.router.route('/deposit/history')
            .get(this.controller.getDepositHistory);
        this.router.route('/adm/history')
            .get(this.controller.getADMList);
        this.router.route('/loan/history')
            .get(this.controller.getLoanHistory);
        this.router.route('/ledger')
            .get(this.controller.getLedger);
        this.router.route('/top-up')
            .post(this.controller.topUpUsingPaymentGateway);
    }
}
exports.default = AgentPaymentsRouter;
