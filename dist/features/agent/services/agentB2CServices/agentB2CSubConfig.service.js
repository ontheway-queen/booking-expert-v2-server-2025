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
            const configModel = this.Model.OthersModel();
            const accounts = yield configModel.getAccount({
                source_type: 'AGENT',
                source_id: agency_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: accounts,
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
                if (!checkBank.length) {
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
                    payload: JSON.stringify(Object.assign(Object.assign({}, body), { bank: checkBank[0].name })),
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
            const hero_bg_data = yield configModel.getHeroBGContent({
                agency_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: hero_bg_data,
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
                    yield this.manageFile.deleteFromCloud([check[0].content]);
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
                    yield this.manageFile.deleteFromCloud([check[0].content]);
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
            const popular_destinations = yield configModel.getPopularDestination({
                agency_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: popular_destinations,
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
                    yield this.manageFile.deleteFromCloud([check.thumbnail]);
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
                    yield this.manageFile.deleteFromCloud([check.thumbnail]);
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
            const popular_places = yield configModel.getPopularPlaces({
                agency_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: popular_places,
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
                    yield this.manageFile.deleteFromCloud([check.thumbnail]);
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
                    yield this.manageFile.deleteFromCloud([check.thumbnail]);
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
            const hotDeals = yield configModel.getHotDeals({
                agency_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: hotDeals,
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
}
exports.AgentB2CSubConfigService = AgentB2CSubConfigService;
