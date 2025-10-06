"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const agentB2CSubPayment_controller_1 = require("../../controllers/agentB2CControllers/agentB2CSubPayment.controller");
class AgentSubAgentPaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CSubPayment_controller_1.AgentB2CSubPaymentController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/deposit').get(this.controller.getDepositRequestList);
        this.router
            .route('/deposit/:id')
            .get(this.controller.getSingleDepositRequest)
            .patch(this.controller.updateDepositRequest);
        this.router.route('/ledger').get(this.controller.getLedger);
        this.router
            .route('/balance-adjustment')
            .post(this.controller.balanceAdjust);
    }
}
exports.default = AgentSubAgentPaymentRouter;
