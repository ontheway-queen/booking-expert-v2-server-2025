"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class FitsAirFlightService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
    }
}
exports.default = FitsAirFlightService;
