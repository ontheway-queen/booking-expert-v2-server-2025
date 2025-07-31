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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AgentB2CUmrahService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getUmrahPackages(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CWhiteLabel;
            const umrahModel = this.Model.UmrahPackageModel();
            const data = yield umrahModel.getUmrahPackageList({ limit });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
    getSingleUmrahPackages(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CWhiteLabel;
            const { slug } = req.params;
            const umrahModel = this.Model.UmrahPackageModel();
            const data = yield umrahModel.getSingleUmrahPackageDetails();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
    bookUmrahPackages(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CWhiteLabel;
            const umrahModel = this.Model.UmrahPackageModel();
            const data = yield umrahModel.getSingleUmrahPackageDetails();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
    getUmrahPackagesBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CWhiteLabel;
            const { user_id } = req.agencyB2CUser;
            const UmrahBookingModel = this.Model.UmrahBookingModel();
            const query = req.query;
            const data = yield UmrahBookingModel.getAgentB2CUmarhBookingList(Object.assign({ agency_id,
                user_id }, query), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    getSingleUmrahBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CWhiteLabel;
            const { user_id } = req.agencyB2CUser;
            const { id } = req.params;
            const UmrahBookingModel = this.Model.UmrahBookingModel();
            const data = yield UmrahBookingModel.getSingleAgentB2CUmrahBookingDetails({
                id: parseInt(id),
                source_id: agency_id,
                user_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
}
exports.default = AgentB2CUmrahService;
