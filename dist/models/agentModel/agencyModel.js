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
const constants_1 = require("../../utils/miscellaneous/constants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class AgencyModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //create agency
    createAgency(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agency')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // update agency
    updateAgency(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agency')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where('id', id);
        });
    }
    // get agency list
    getAgencyList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, need_total = false) {
            var _a;
            const data = yield this.db('agency AS ag')
                .withSchema(this.AGENT_SCHEMA)
                .select('ag.id', 'ag.agent_no', 'ag.agency_logo', 'ag.agency_name', 'ag.email', 'ag.phone', 'ag.address', 'ag.status', 'ag.white_label', 'ag.allow_api')
                .where((qb) => {
                if (query.filter) {
                    qb.where('ag.agency_name', 'like', `%${query.filter}%`)
                        .orWhere('ag.agency_no', query.filter)
                        .orWhere('ag.email', 'like', `%${query.filter}%`);
                }
                if (query.status) {
                    qb.andWhere('ag.status', query.status);
                }
            })
                .limit(Number(query.limit) || constants_1.DATA_LIMIT)
                .offset(Number(query.skip) || 0)
                .orderBy('ag.agency_name', 'asc');
            let total = [];
            if (need_total) {
                total = yield this.db('agency AS ag')
                    .withSchema(this.AGENT_SCHEMA)
                    .count({ total: 'id' })
                    .where((qb) => {
                    if (query.filter) {
                        qb.where('ag.agency_name', 'like', `%${query.filter}%`)
                            .orWhere('ag.agency_no', query.filter)
                            .orWhere('ag.email', 'like', `%${query.filter}%`);
                    }
                    if (query.status) {
                        qb.andWhere('ag.status', query.status);
                    }
                });
            }
            return { data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    // check Agency
    checkAgency(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, email, name, agency_no, }) {
            return yield this.db('agency')
                .withSchema(this.AGENT_SCHEMA)
                .select('id', 'email', 'phone', 'agency_name', 'agent_no', 'status', 'white_label', 'allow_api', 'usable_loan', 'flight_markup_set', 'hotel_markup_set')
                .where((qb) => {
                if (agency_id) {
                    qb.where('id', agency_id);
                }
                if (email) {
                    qb.where('email', email);
                }
                if (name) {
                    qb.where('agency_name', name);
                }
                if (agency_no) {
                    qb.where('agent_no', agency_no);
                }
            })
                .first();
        });
    }
    // get agency list
    getAgencyListWithBalance(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, need_total = false) {
            var _a;
            const data = yield this.db('agency AS ag')
                .withSchema(this.AGENT_SCHEMA)
                .select('ag.id', 'ag.agent_no', 'ag.agency_logo', 'ag.agency_name', 'ag.email', 'ag.phone', 'ag.address', 'ag.status', this.db.raw(`(
  SELECT 
    COALESCE(SUM(CASE WHEN al.type = 'Credit' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN al.type = 'Debit' THEN amount ELSE 0 END), 0) 
  AS balance 
  FROM agent.agency_ledger as al
  WHERE ag.id = al.agency_id
) AS balance
`), 'fm.name AS flight_markup_set', 'hm.name AS hotel_markup_set', 'ag.usable_loan', 'ag.white_label', 'ag.allow_api')
                .joinRaw('LEFT JOIN dbo.markup_set AS fm ON ag.flight_markup_set = fm.id')
                .joinRaw('LEFT JOIN dbo.markup_set AS hm ON ag.hotel_markup_set = hm.id')
                .where((qb) => {
                if (query.search_value) {
                    qb.where('ag.agency_name', 'like', `%${query.search_value}%`)
                        .orWhere('ag.agency_no', query.search_value)
                        .orWhere('ag.email', 'like', `%${query.search_value}%`);
                }
                if (query.status) {
                    qb.andWhere('ag.status', query.status);
                }
            })
                .limit(Number(query.limit) || constants_1.DATA_LIMIT)
                .offset(Number(query.skip) || 0)
                .orderBy('ag.agency_name', 'asc');
            let total = [];
            if (need_total) {
                total = yield this.db('agency AS ag')
                    .withSchema(this.AGENT_SCHEMA)
                    .count({ total: 'id' })
                    .where((qb) => {
                    if (query.search_value) {
                        qb.where('ag.agency_name', 'like', `%${query.search_value}%`)
                            .orWhere('ag.agency_no', query.search_value)
                            .orWhere('ag.email', 'like', `%${query.search_value}%`);
                    }
                    if (query.status) {
                        qb.andWhere('ag.status', query.status);
                    }
                });
            }
            return { data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    // get agency balance
    getAgencyBalance(agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('agency AS ag')
                .withSchema(this.AGENT_SCHEMA)
                .select(this.db.raw(`(
  SELECT 
    COALESCE(SUM(CASE WHEN al.type = 'Credit' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN al.type = 'Debit' THEN amount ELSE 0 END), 0) 
  AS balance 
  FROM agent.agency_ledger as al
  WHERE ag.id = al.agency_id
) AS balance
`))
                .where('ag.id', agency_id)
                .first();
            return (data === null || data === void 0 ? void 0 : data.balance) || 0;
        });
    }
    // get single agency
    getSingleAgency(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agency AS ag')
                .withSchema(this.AGENT_SCHEMA)
                .select('ag.id', 'ag.agent_no', 'ag.agency_logo', 'ag.agency_name', 'ag.email', 'ag.phone', 'ag.address', 'ag.status', 'ag.flight_markup_set', 'ag.hotel_markup_set', 'fm.name AS flight_markup_set_name', 'hm.name AS hotel_markup_set_name', 'ag.usable_loan', 'ag.white_label', 'ag.allow_api', 'ua.name AS created_by', 'uar.name AS referred_by')
                .joinRaw('LEFT JOIN dbo.markup_set AS fm ON ag.flight_markup_set = fm.id')
                .joinRaw('LEFT JOIN dbo.markup_set AS hm ON ag.hotel_markup_set = hm.id')
                .joinRaw('LEFT JOIN admin.user_admin AS ua ON ag.created_by = ua.id')
                .joinRaw('LEFT JOIN admin.user_admin AS uar ON ag.ref_id = uar.id')
                .where('ag.id', id)
                .first();
        });
    }
    // create white label permission
    createWhiteLabelPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agency_white_label_permission')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // get white label permission
    getWhiteLabelPermission(agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agency_white_label_permission')
                .withSchema(this.AGENT_SCHEMA)
                .select('agency_id', 'token', 'flight', 'hotel', 'visa', 'holiday', 'group_fare', 'umrah', 'blog')
                .where('agency_id', agency_id)
                .first();
        });
    }
    // create api creds
    createAPICreds(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('api_creds')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // get API Credentials
    getAPICreds(agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('api_creds')
                .withSchema(this.AGENT_SCHEMA)
                .select('agency_id', 'api_user', 'api_pass', 'last_access')
                .where('agency_id', agency_id)
                .first();
        });
    }
    // update api creds
    updateAPICreds(payload, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('api_creds')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where('agency_id', agency_id);
        });
    }
}
exports.default = AgencyModel;
