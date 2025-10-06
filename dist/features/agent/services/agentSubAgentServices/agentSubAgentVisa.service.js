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
exports.AgentSubAgentVisaService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AgentSubAgentVisaService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getApplicationList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const { filter, from_date, to_date, status, limit, skip } = req.query;
            const visaApplicationModel = this.Model.VisaApplicationModel();
            const { data, total } = yield visaApplicationModel.getAllAgentB2CVisaApplication({
                source_id: agency_id,
                source_type: constants_1.SOURCE_SUB_AGENT,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    getSingleVisaApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { agency_id } = req.agencyUser;
            const visaApplicationModel = this.Model.VisaApplicationModel();
            const data = yield visaApplicationModel.getAgentB2CSingleVisaApplicationForAgent({
                id: Number(id),
                source_id: agency_id,
                source_type: constants_1.SOURCE_SUB_AGENT,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const passengers = yield visaApplicationModel.getAgentB2CSingleVisaApplicationTraveler({
                application_id: data.id,
            });
            const trackings = yield visaApplicationModel.getVisaApplicationTrackingList({
                application_id: data.id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { passengers,
                    trackings }),
            };
        });
    }
    updateVisaApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { status, details } = req.body;
                const { agency_id } = req.agencyUser;
                const { id } = req.params;
                const numberId = Number(id);
                const visaApplicationModel = this.Model.VisaApplicationModel(trx);
                const checkExist = yield visaApplicationModel.getAgentB2CSingleVisaApplicationForAgent({
                    id: numberId,
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_SUB_AGENT,
                });
                if (!checkExist) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                // update status
                yield visaApplicationModel.updateVisaApplication({ status }, numberId);
                //add application tracking
                yield visaApplicationModel.createVisaApplicationTracking({
                    details,
                    application_id: numberId,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.AgentSubAgentVisaService = AgentSubAgentVisaService;
