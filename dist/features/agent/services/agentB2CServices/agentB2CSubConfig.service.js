"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubConfigService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
class AgentB2CSubConfigService extends abstract_service_1.default {
    getB2CMarkup(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const model = this.Model.AgencyModel();
            const data = yield model.getAgentB2CMarkup(agency_id);
            if (!data) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "No markup has been set for B2C",
                    data: {}
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data
            };
        });
    }
    upsertB2CMarkup(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const model = this.Model.AgencyModel();
            const data = yield model.getAgentB2CMarkup(agency_id);
            if (data) {
                yield model.updateAgentB2CMarkup(req.body, agency_id);
            }
            else {
                yield model.createAgentB2CMarkup(Object.assign({ agency_id }, req.body));
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Markup has been updated for B2C"
            };
        });
    }
}
exports.AgentB2CSubConfigService = AgentB2CSubConfigService;
