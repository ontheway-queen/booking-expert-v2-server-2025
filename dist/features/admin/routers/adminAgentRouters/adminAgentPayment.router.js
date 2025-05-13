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
        this.router.route('/deposit').get(this.controller.getDepositRequestList);
        this.router.route('/deposit/:id')
            .get(this.controller.getSingleDepositRequest)
            .patch(this.controller.updateDepositRequest);
        this.router.route('/balance').post(this.controller.adjustBalance);
        this.router.route('/adm')
            .post(this.controller.createADM)
            .get(this.controller.getADMList);
        this.router.route('/adm/:id')
            .get(this.controller.getSingleADM)
            .patch(this.controller.updateADM)
            .delete(this.controller.deleteADM);
    }
}
exports.default = AdminAgentPaymentRouter;
