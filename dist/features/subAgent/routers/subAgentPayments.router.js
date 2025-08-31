"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const subAgentPayments_controller_1 = __importDefault(require("../controllers/subAgentPayments.controller"));
class SubAgentPaymentsRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new subAgentPayments_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/deposit')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_DEPOSIT_FILES, [
            'document',
        ]), this.controller.createDepositRequest)
            .delete(this.controller.cancelCurrentDepositRequest)
            .get(this.controller.getDepositHistory);
        this.router
            .route('/deposit/:id')
            .get(this.controller.getSingleDepositRequest);
        // this.router.route('/adm/history').get(this.controller.getADMList);
        this.router.route('/loan/history').get(this.controller.getLoanHistory);
        this.router.route('/ledger').get(this.controller.getLedger);
        // this.router.route('/top-up').post(this.controller.topUpUsingPaymentGateway);
        this.router.route('/invoice').get(this.controller.getInvoices);
        this.router
            .route('/invoice/:id')
            .get(this.controller.getSingleInvoice)
            .post(this.controller.clearDueOfInvoice);
        this.router.route('/partial').get(this.controller.getPartialPaymentList);
        this.router.route('/balance').get(this.controller.getAgentBalance);
        this.router.route('/accounts').get(this.controller.getAccounts);
    }
}
exports.default = SubAgentPaymentsRouter;
