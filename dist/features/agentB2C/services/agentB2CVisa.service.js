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
exports.AgentB2CVisaService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class AgentB2CVisaService extends abstract_service_1.default {
    getAllVisaList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { country_id, visa_type_id } = req.query;
            const { agency_id } = req.agencyB2CWhiteLabel;
            const visaModel = this.Model.VisaModel();
            const visaList = yield visaModel.getAgentB2CVisaList({
                country_id: Number(country_id),
                visa_type_id: Number(visa_type_id),
                is_deleted: false,
                source_id: agency_id,
                status: true,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: visaList,
            };
        });
    }
    getSingleVisa(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { slug } = req.params;
            const { agency_id } = req.agencyB2CWhiteLabel;
            const visaModel = this.Model.VisaModel();
            const singleVisa = yield visaModel.getAgentB2CSingleVisa({
                slug: slug,
                is_deleted: false,
                source_id: agency_id,
                status: true,
            });
            if (!singleVisa) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: singleVisa,
            };
        });
    }
    createVisaApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
                const { user_id, name } = req.agencyB2CUser;
                const { id } = req.params;
                const { from_date, to_date, contact_email, contact_number, whatsapp_number, nationality, residence, passengers, } = req.body;
                const visaModel = this.Model.VisaModel(trx);
                const visaApplicationModel = this.Model.VisaApplicationModel(trx);
                const singleVisa = yield visaModel.getSingleVisa({
                    is_deleted: false,
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_AGENT,
                    id: Number(id),
                    status: true,
                });
                if (!singleVisa) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const application_ref = yield lib_1.default.generateNo({ trx, type: 'Agent_Visa' });
                const total_fee = singleVisa.visa_fee + singleVisa.processing_fee;
                const payable = total_fee * passengers.length;
                const applicationPayload = {
                    user_id,
                    payable,
                    from_date,
                    to_date,
                    contact_email,
                    contact_number,
                    whatsapp_number,
                    nationality,
                    residence,
                    application_ref,
                    traveler: passengers.length,
                    visa_id: singleVisa.id,
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_AGENT_B2C,
                    visa_fee: singleVisa.visa_fee,
                    processing_fee: singleVisa.processing_fee,
                    application_date: new Date(),
                };
                const application = yield visaApplicationModel.createVisaApplication(applicationPayload);
                const applicationTravelerPayload = passengers.map((passenger) => {
                    return {
                        application_id: application[0].id,
                        title: passenger.title,
                        type: passenger.type,
                        first_name: passenger.first_name,
                        last_name: passenger.last_name,
                        date_of_birth: passenger.date_of_birth,
                        passport_number: passenger.passport_number,
                        passport_expiry_date: passenger.passport_expiry_date,
                        passport_type: passenger.passport_type,
                        city: passenger.city,
                        country_id: passenger.country_id,
                        address: passenger.address,
                        required_fields: passenger.required_fields,
                    };
                });
                yield visaApplicationModel.createVisaApplicationTraveler(applicationTravelerPayload);
                yield visaApplicationModel.createVisaApplicationTracking({
                    application_id: application[0].id,
                    details: `${name} has applied for the visa`,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        id: application[0].id,
                    },
                };
            }));
        });
    }
}
exports.AgentB2CVisaService = AgentB2CVisaService;
