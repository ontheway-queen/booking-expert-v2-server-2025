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
const constants_1 = require("../../../utils/miscellaneous/constants");
class AgentB2CTravelerService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createTraveler(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { agency_id, user_id } = req.agencyB2CUser;
                const travelerModel = this.Model.TravelerModel(trx);
                const body = req.body;
                const files = req.files || [];
                if (files === null || files === void 0 ? void 0 : files.length) {
                    files.forEach((file) => {
                        if (file.fieldname === 'visa_file') {
                            body.visa_file = file.filename;
                        }
                        else if (file.fieldname === 'passport_file') {
                            body.passport_file = file.filename;
                        }
                    });
                }
                const res = yield travelerModel.insertTraveler(Object.assign(Object.assign({}, body), { created_by: user_id, source_type: constants_1.SOURCE_AGENT_B2C, source_id: agency_id }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Traveler has been created successfully',
                    data: {
                        id: (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id,
                    },
                };
            }));
        });
    }
    getAllTraveler(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyB2CUser;
                const travelerModel = this.Model.TravelerModel(trx);
                const query = req.query;
                const data = yield travelerModel.getTravelerList(Object.assign({ source_type: constants_1.SOURCE_AGENT_B2C, source_id: agency_id, created_by: user_id }, query), true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    total: data.total,
                    data: data.data,
                };
            }));
        });
    }
    getSingleTraveler(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const travelerModel = this.Model.TravelerModel(trx);
                const { id } = req.params;
                const data = yield travelerModel.getSingleTraveler({
                    source_type: constants_1.SOURCE_AGENT_B2C,
                    source_id: agency_id,
                    created_by: user_id,
                    id: Number(id),
                });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    data,
                };
            }));
        });
    }
    updateTraveler(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const travelerModel = this.Model.TravelerModel(trx);
                const { id } = req.params;
                const data = yield travelerModel.getSingleTraveler({
                    source_type: constants_1.SOURCE_AGENT_B2C,
                    source_id: agency_id,
                    created_by: user_id,
                    id: Number(id),
                });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                const body = req.body;
                const files = req.files || [];
                if (files === null || files === void 0 ? void 0 : files.length) {
                    files.forEach((file) => {
                        if (file.fieldname === 'visa_file') {
                            body.visa_file = file.filename;
                        }
                        else if (file.fieldname === 'passport_file') {
                            body.passport_file = file.filename;
                        }
                    });
                }
                yield travelerModel.updateTraveler(body, Number(id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Traveler has been updated',
                };
            }));
        });
    }
    deleteTraveler(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const travelerModel = this.Model.TravelerModel(trx);
                const { id } = req.params;
                const data = yield travelerModel.getSingleTraveler({
                    source_type: constants_1.SOURCE_AGENT_B2C,
                    source_id: agency_id,
                    created_by: user_id,
                    id: Number(id),
                });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                yield travelerModel.deleteTraveler(Number(id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Traveler has been deleted',
                };
            }));
        });
    }
}
exports.default = AgentB2CTravelerService;
