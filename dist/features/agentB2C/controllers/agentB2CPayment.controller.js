"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const agentB2CPayment_service_1 = __importDefault(require("../services/agentB2CPayment.service"));
class AgentB2CPaymentController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new agentB2CPayment_service_1.default();
    }
}
exports.default = AgentB2CPaymentController;
