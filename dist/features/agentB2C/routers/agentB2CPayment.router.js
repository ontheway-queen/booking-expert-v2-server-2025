"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentB2CPayment_controller_1 = __importDefault(require("../controllers/agentB2CPayment.controller"));
class AgentB2CPaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentB2CPayment_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/deposit')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_DEPOSIT_FILES), this.controller.createDepositRequest)
            .get(this.controller.getDepositRequest)
            .delete(this.controller.cancelCurrentDepositRequest);
        this.router
            .route('/deposit/:id')
            .get(this.controller.getSingleDepositRequest);
        this.router.route('/ledger').get(this.controller.getLedger);
        this.router.route('/invoice').get(this.controller.getInvoices);
        this.router
            .route('/invoice/:id')
            .get(this.controller.getSingleInvoice)
            .post(this.controller.clearDueOfInvoice);
        this.router.route('/gateway-list').get(this.controller.getPaymentGatewayList);
        this.router.route('/top-up').post(this.controller.topUpUsingPaymentGateway);
    }
}
exports.default = AgentB2CPaymentRouter;
