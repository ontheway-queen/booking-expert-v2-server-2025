"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicPaymentRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const publicPayment_controller_1 = require("../controllers/publicPayment.controller");
class PublicPaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new publicPayment_controller_1.PublicPaymentController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/ssl').post(this.controller.transactionUsingSSL);
    }
}
exports.PublicPaymentRouter = PublicPaymentRouter;
