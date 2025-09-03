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
const constants_1 = require("../../../../utils/miscellaneous/constants");
const pagesContent_1 = require("../../../../utils/miscellaneous/siteConfig/pagesContent");
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
                    message: 'No markup has been set for B2C',
                    data: {},
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    upsertB2CMarkup(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id, user_id } = req.agencyUser;
            const model = this.Model.AgencyModel();
            const data = yield model.getAgentB2CMarkup(agency_id);
            if (data) {
                yield model.updateAgentB2CMarkup(req.body, agency_id);
            }
            else {
                yield model.createAgentB2CMarkup(Object.assign({ agency_id }, req.body));
            }
            yield this.insertAgentAudit(undefined, {
                agency_id,
                created_by: user_id,
                details: 'Updated/Inserted B2C markup.',
                payload: JSON.stringify(req.body),
                type: 'UPDATE',
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Markup has been updated for B2C',
            };
        });
    }
    getAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const { limit, skip } = req.query;
            const configModel = this.Model.OthersModel();
            const { data, total } = yield configModel.getAccount({
                source_type: constants_1.SOURCE_AGENT,
                source_id: agency_id,
                limit,
                skip,
            }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    updateAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const configModel = this.Model.OthersModel(trx);
                const { id } = req.params;
                const account_id = Number(id);
                const account = yield configModel.checkAccount({
                    source_type: 'AGENT',
                    source_id: agency_id,
                    id: account_id,
                });
                const payload = req.body;
                if (!account || !Object.keys(payload).length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield configModel.updateAccount({ id: account_id, source_type: 'AGENT', source_id: agency_id }, payload);
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: 'Updated Account data.',
                    payload: JSON.stringify(payload),
                    type: 'UPDATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    createAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const OtersModel = this.Model.OthersModel(trx);
                const CommonModel = this.Model.CommonModel(trx);
                const body = req.body;
                console.log({ body });
                const checkBank = yield CommonModel.getBanks({
                    id: body.bank_id,
                    status: true,
                });
                if (!checkBank.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'Bank not found.',
                    };
                }
                const account = yield OtersModel.createAccount(Object.assign(Object.assign({}, body), { source_type: 'AGENT', source_id: agency_id }));
                yield this.insertAgentAudit(undefined, {
                    agency_id,
                    created_by: user_id,
                    details: 'New Account created.',
                    payload: JSON.stringify(Object.assign(Object.assign({}, body), { bank: checkBank.data[0].name })),
                    type: 'CREATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        id: account[0].id,
                    },
                };
            }));
        });
    }
    deleteAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id, user_id } = req.agencyUser;
            const OthersModel = this.Model.OthersModel();
            const { id } = req.params;
            const account_id = Number(id);
            const account = yield OthersModel.checkAccount({
                source_type: 'AGENT',
                source_id: agency_id,
                id: account_id,
            });
            if (!account) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield OthersModel.deleteAccount({
                id: account_id,
                source_type: 'AGENT',
                source_id: agency_id,
            });
            yield this.insertAgentAudit(undefined, {
                agency_id,
                created_by: user_id,
                details: `Account ${account.account_name}(${account.bank_name})[${account.account_number}] is deleted.`,
                type: 'DELETE',
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    getHeroBGContent(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const configModel = this.Model.AgencyB2CConfigModel();
            const { agency_id } = req.agencyUser;
            const { limit, skip } = req.query;
            const { data, total } = yield configModel.getHeroBGContent({
                agency_id,
                limit,
                skip,
            }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    createHeroBGContent(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const { agency_id, user_id } = req.agencyUser;
                const body = req.body;
                const files = req.files || [];
                if (!files.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Content is required',
                    };
                }
                const lastOrderNumber = yield configModel.getHeroBGContentLastNo({
                    agency_id,
                });
                const heroBG = yield configModel.insertHeroBGContent(Object.assign(Object.assign({ agency_id }, body), { content: files[0].filename, order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1 }));
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `New bg content(${body.type}) created for ${body.tab || 'all tab'}(${files[0].filename}).`,
                    payload: JSON.stringify(Object.assign(Object.assign({}, body), { content: files[0].filename, order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1 })),
                    type: 'CREATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        content: files[0].filename,
                        id: heroBG[0].id,
                    },
                };
            }));
        });
    }
    updateHeroBGContent(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                const { agency_id, user_id } = req.agencyUser;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const id = Number(req.params.id);
                const check = yield configModel.checkHeroBGContent({ agency_id, id });
                if (!check.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const files = req.files || [];
                const payload = body;
                if (files.length) {
                    payload.content = files[0].filename;
                }
                if (!Object.keys(payload).length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                yield configModel.updateHeroBGContent(payload, { agency_id, id });
                if (payload.content && check[0].content) {
                    const heroContent = (0, pagesContent_1.heroBG)(agency_id);
                    const found = heroContent.find((item) => item.content === check[0].content);
                    if (!found) {
                        yield this.manageFile.deleteFromCloud([check[0].content]);
                    }
                }
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `BG content(${id}) is updated.`,
                    payload: JSON.stringify(payload),
                    type: 'CREATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { content: payload.content },
                };
            }));
        });
    }
    deleteHeroBGContent(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const id = Number(req.params.id);
                const check = yield configModel.checkHeroBGContent({ agency_id, id });
                if (!check.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield configModel.deleteHeroBGContent({ agency_id, id });
                if (check[0].content) {
                    const heroContent = (0, pagesContent_1.heroBG)(agency_id);
                    const found = heroContent.find((item) => item.content === check[0].content);
                    if (!found) {
                        yield this.manageFile.deleteFromCloud([check[0].content]);
                    }
                }
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `Deleted BG content(${id}).`,
                    type: 'DELETE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    getPopularDestination(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const configModel = this.Model.AgencyB2CConfigModel();
            const { agency_id } = req.agencyUser;
            const { limit, skip } = req.query;
            const { data, total } = yield configModel.getPopularDestination({
                agency_id,
                limit,
                skip,
            }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    createPopularDestination(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const CommonModel = this.Model.CommonModel(trx);
                const { agency_id, user_id } = req.agencyUser;
                const body = req.body;
                const files = req.files || [];
                if (!files.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Thumbnail is required',
                    };
                }
                const checkFromAirport = yield CommonModel.getAirport({
                    id: body.from_airport,
                });
                if (!checkFromAirport.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'From Airport not found.',
                    };
                }
                const toAirport = yield CommonModel.getAirport({
                    id: body.to_airport,
                });
                if (!toAirport.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'To Airport not found.',
                    };
                }
                const lastOrderNumber = yield configModel.getPopularDestinationLastNo({
                    agency_id,
                });
                yield configModel.insertPopularDestination(Object.assign(Object.assign({ agency_id }, body), { thumbnail: files[0].filename, order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1 }));
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `New popular destination is created.`,
                    payload: JSON.stringify(Object.assign(Object.assign({}, body), { thumbnail: files[0].filename, order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1 })),
                    type: 'CREATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { thumbnail: files[0].filename },
                };
            }));
        });
    }
    updatePopularDestination(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                const { agency_id, user_id } = req.agencyUser;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const CommonModel = this.Model.CommonModel(trx);
                const id = Number(req.params.id);
                const check = yield configModel.checkPopularDestination({
                    agency_id,
                    id,
                });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (body.from_airport) {
                    const checkFromAirport = yield CommonModel.getAirport({
                        id: body.from_airport,
                    });
                    if (!checkFromAirport.data.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: 'From Airport not found.',
                        };
                    }
                }
                if (body.to_airport) {
                    const toAirport = yield CommonModel.getAirport({
                        id: body.to_airport,
                    });
                    if (!toAirport.data.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: 'To Airport not found.',
                        };
                    }
                }
                const files = req.files || [];
                const payload = body;
                if (files.length) {
                    payload.thumbnail = files[0].filename;
                }
                if (!Object.keys(payload).length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                yield configModel.updatePopularDestination(payload, { agency_id, id });
                if (payload.thumbnail && check.thumbnail) {
                    const heroContent = (0, pagesContent_1.popularDestination)(agency_id);
                    const found = heroContent.find((item) => item.thumbnail === check.thumbnail);
                    if (!found) {
                        yield this.manageFile.deleteFromCloud([check.thumbnail]);
                    }
                }
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `Popular destination(${id}) is updated.`,
                    payload: JSON.stringify(payload),
                    type: 'UPDATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { content: payload.thumbnail },
                };
            }));
        });
    }
    deletePopularDestination(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const id = Number(req.params.id);
                const check = yield configModel.checkPopularDestination({
                    agency_id,
                    id,
                });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield configModel.deletePopularDestination({ agency_id, id });
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `Deleted Popular destination(${id}).`,
                    type: 'DELETE',
                });
                if (check.thumbnail) {
                    const heroContent = (0, pagesContent_1.popularDestination)(agency_id);
                    const found = heroContent.find((item) => item.thumbnail === check.thumbnail);
                    if (!found) {
                        yield this.manageFile.deleteFromCloud([check.thumbnail]);
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    getPopularPlace(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const configModel = this.Model.AgencyB2CConfigModel();
            const { agency_id } = req.agencyUser;
            const { limit, skip } = req.query;
            const { data, total } = yield configModel.getPopularPlaces({
                agency_id,
                limit,
                skip,
            }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    createPopularPlace(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const CommonModel = this.Model.CommonModel(trx);
                const { agency_id, user_id } = req.agencyUser;
                const body = req.body;
                const files = req.files || [];
                if (!files.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Thumbnail is required',
                    };
                }
                const checkCountry = yield CommonModel.getCountry({
                    id: body.country_id,
                });
                if (!checkCountry.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'Country not found.',
                    };
                }
                const lastOrderNumber = yield configModel.getPopularPlaceLastNo({
                    agency_id,
                });
                yield configModel.insertPopularPlaces(Object.assign(Object.assign({ agency_id }, body), { thumbnail: files[0].filename, order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1 }));
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `New popular place is created.`,
                    payload: JSON.stringify(Object.assign(Object.assign({}, body), { thumbnail: files[0].filename, order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1 })),
                    type: 'CREATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { thumbnail: files[0].filename },
                };
            }));
        });
    }
    updatePopularPlace(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                const { agency_id, user_id } = req.agencyUser;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const CommonModel = this.Model.CommonModel(trx);
                const id = Number(req.params.id);
                const check = yield configModel.checkPopularPlace({
                    agency_id,
                    id,
                });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (body.country_id) {
                    const checkCountry = yield CommonModel.getCountry({
                        id: body.country_id,
                    });
                    if (!checkCountry.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: 'Country not found.',
                        };
                    }
                }
                const files = req.files || [];
                const payload = body;
                if (files.length) {
                    payload.thumbnail = files[0].filename;
                }
                if (!Object.keys(payload).length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                yield configModel.updatePopularPlace(payload, { agency_id, id });
                if (payload.thumbnail && check.thumbnail) {
                    const heroContent = (0, pagesContent_1.popularPlaces)(agency_id);
                    const found = heroContent.find((item) => item.thumbnail === check.thumbnail);
                    if (!found) {
                        yield this.manageFile.deleteFromCloud([check.thumbnail]);
                    }
                }
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `Popular place(${id}) is updated.`,
                    payload: JSON.stringify(payload),
                    type: 'UPDATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { content: payload.thumbnail },
                };
            }));
        });
    }
    deletePopularPlace(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const id = Number(req.params.id);
                const check = yield configModel.checkPopularPlace({
                    agency_id,
                    id,
                });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield configModel.deletePopularPlace({ agency_id, id });
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `Deleted Popular place(${id}).`,
                    type: 'DELETE',
                });
                if (check.thumbnail) {
                    const heroContent = (0, pagesContent_1.popularPlaces)(agency_id);
                    const found = heroContent.find((item) => item.thumbnail === check.thumbnail);
                    if (!found) {
                        yield this.manageFile.deleteFromCloud([check.thumbnail]);
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    getHotDeals(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const configModel = this.Model.AgencyB2CConfigModel();
            const { agency_id } = req.agencyUser;
            const { limit, skip } = req.query;
            const { data, total } = yield configModel.getHotDeals({
                agency_id,
                limit,
                skip,
            }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    createHotDeals(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const { agency_id, user_id } = req.agencyUser;
                const body = req.body;
                const files = req.files || [];
                if (!files.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Thumbnail is required',
                    };
                }
                const lastOrderNumber = yield configModel.getHotDealsLastNo({
                    agency_id,
                });
                yield configModel.insertHotDeals(Object.assign(Object.assign({ agency_id }, body), { thumbnail: files[0].filename, order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1 }));
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `New Hot deals is created.`,
                    payload: JSON.stringify(Object.assign(Object.assign({}, body), { thumbnail: files[0].filename, order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1 })),
                    type: 'CREATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { thumbnail: files[0].filename },
                };
            }));
        });
    }
    updateHotDeals(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                const { agency_id, user_id } = req.agencyUser;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const id = Number(req.params.id);
                const check = yield configModel.checkHotDeals({
                    agency_id,
                    id,
                });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const files = req.files || [];
                const payload = body;
                if (files.length) {
                    payload.thumbnail = files[0].filename;
                }
                if (!Object.keys(payload).length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                yield configModel.updateHotDeals(payload, { agency_id, id });
                if (payload.thumbnail && check.thumbnail) {
                    yield this.manageFile.deleteFromCloud([check.thumbnail]);
                }
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `Hot deals(${id}) is updated.`,
                    payload: JSON.stringify(payload),
                    type: 'UPDATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { content: payload.thumbnail },
                };
            }));
        });
    }
    deleteHotDeals(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const id = Number(req.params.id);
                const check = yield configModel.checkHotDeals({
                    agency_id,
                    id,
                });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield configModel.deleteHotDeals({ agency_id, id });
                if (check.thumbnail) {
                    yield this.manageFile.deleteFromCloud([check.thumbnail]);
                }
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `Deleted Hot deals(${id}).`,
                    type: 'DELETE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    createVisaType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const { name } = req.body;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const existingVisaType = yield configModel.getSingleVisaTypeByName({
                    name: name,
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_AGENT,
                    is_deleted: false,
                });
                if (existingVisaType) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.HTTP_CONFLICT,
                    };
                }
                const payload = {
                    name: name,
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_AGENT,
                };
                const visaType = yield configModel.createVisaType(payload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        id: visaType[0].id,
                    },
                };
            }));
        });
    }
    getAllVisaType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const configModel = this.Model.AgencyB2CConfigModel();
            const visaTypes = yield configModel.getAllVisaType({
                source_id: agency_id,
                source_type: constants_1.SOURCE_AGENT,
                is_deleted: false,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: visaTypes,
            };
        });
    }
    deleteVisaType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const { id } = req.params;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const checkVisaType = yield configModel.getSingleVisaType({
                    id: Number(id),
                });
                if (!checkVisaType) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                // Check if any visa exists with this visa type
                const visaModel = this.Model.VisaModel(trx);
                const checkVisa = yield visaModel.checkVisaExistsByVisaType({
                    visa_type_id: Number(id),
                    is_deleted: false,
                });
                if (checkVisa.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Cannot delete this visa type as it is associated with existing visas.',
                    };
                }
                yield configModel.deleteVisaType({
                    id: Number(id),
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_AGENT,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    createVisaMode(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const { name } = req.body;
            const configModel = this.Model.AgencyB2CConfigModel();
            const existingVisaMode = yield configModel.getSingleVisaModeByName({
                name: name,
                source_id: agency_id,
                source_type: constants_1.SOURCE_AGENT,
                is_deleted: false,
            });
            if (existingVisaMode) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: this.ResMsg.HTTP_CONFLICT,
                };
            }
            const payload = {
                name: name,
                source_id: agency_id,
                source_type: constants_1.SOURCE_AGENT,
            };
            const visaMode = yield configModel.createVisaMode(payload);
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
                data: {
                    id: visaMode[0].id,
                },
            };
        });
    }
    getAllVisaMode(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const configModel = this.Model.AgencyB2CConfigModel();
            const visaModes = yield configModel.getAllVisaMode({
                source_id: agency_id,
                source_type: constants_1.SOURCE_AGENT,
                is_deleted: false,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: visaModes,
            };
        });
    }
    deleteVisaMode(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const { id } = req.params;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const checkVisaMode = yield configModel.getSingleVisaMode({
                    id: Number(id),
                    is_deleted: false,
                });
                if (!checkVisaMode) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                // Check if any visa exists with this visa mode
                const visaModel = this.Model.VisaModel(trx);
                const checkVisa = yield visaModel.checkVisaExistsByVisaMode({
                    visa_mode_id: Number(id),
                    is_deleted: false,
                });
                if (checkVisa.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Cannot delete this visa mode as it is associated with existing visas.',
                    };
                }
                yield configModel.deleteVisaMode({
                    id: Number(id),
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_AGENT,
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
exports.AgentB2CSubConfigService = AgentB2CSubConfigService;
