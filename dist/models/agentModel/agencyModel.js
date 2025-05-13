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
                .select('ag.id', 'ag.agent_no', 'ag.agency_logo', 'ag.agency_name', 'ag.email', 'ag.phone', 'ag.status', 'ag.white_label', 'ag.allow_api', this.db.raw(`
          (
            SELECT 
              COALESCE(SUM(CASE WHEN ad.type = 'Credit' THEN amount ELSE 0 END), 0) - 
              COALESCE(SUM(CASE WHEN ad.type = 'Debit' THEN amount ELSE 0 END), 0) 
            AS balance 
            FROM agent.agency_ledger as ad
            WHERE ag.id = ad.agency_id
          ) AS balance
          `))
                .where((qb) => {
                if (query.filter) {
                    qb.where('ag.agency_name', 'like', `%${query.filter}%`)
                        .orWhere('ag.agent_no', query.filter)
                        .orWhere('ag.email', 'like', `%${query.filter}%`);
                }
                if (query.status) {
                    qb.andWhere('ag.status', query.status);
                }
                if (query.ref_id) {
                    qb.andWhere('ag.ref_id', query.ref_id);
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
                            .orWhere('ag.agent_no', query.filter)
                            .orWhere('ag.email', 'like', `%${query.filter}%`);
                    }
                    if (query.status) {
                        qb.andWhere('ag.status', query.status);
                    }
                    if (query.ref_id) {
                        qb.andWhere('ag.ref_id', query.ref_id);
                    }
                });
            }
            return { data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    // check Agency
    checkAgency(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, email, name, agent_no, ref_id }) {
            return yield this.db('agency')
                .withSchema(this.AGENT_SCHEMA)
                .select('id', 'email', 'phone', 'agency_logo', 'agency_name', 'agent_no', 'status', 'white_label', 'allow_api', 'civil_aviation', 'trade_license', 'national_id', 'usable_loan', 'flight_markup_set', 'hotel_markup_set')
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
                if (agent_no) {
                    qb.where('agent_no', agent_no);
                }
                if (ref_id) {
                    qb.andWhere('ref_id', ref_id);
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
                        .orWhere('ag.agent_no', query.search_value)
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
                            .orWhere('ag.agent_no', query.search_value)
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
    getSingleAgency(id, ref_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agency AS ag')
                .withSchema(this.AGENT_SCHEMA)
                .select('ag.id', 'ag.agent_no', 'ag.agency_logo', 'ag.agency_name', 'ag.email', 'ag.phone', 'ag.address', 'ag.status', 'ag.flight_markup_set', 'ag.hotel_markup_set', this.db.raw(`(
  SELECT 
    COALESCE(SUM(CASE WHEN al.type = 'Credit' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN al.type = 'Debit' THEN amount ELSE 0 END), 0) 
  AS balance 
  FROM agent.agency_ledger as al
  WHERE ag.id = al.agency_id
) AS balance
`), 'fm.name AS flight_markup_set_name', 'hm.name AS hotel_markup_set_name', 'ag.usable_loan', 'ag.white_label', 'ag.allow_api', 'ag.civil_aviation', 'ag.trade_license', 'ag.national_id', 'ua.name AS created_by', 'ag.ref_id', 'ar.agency_name AS referred_by')
                .joinRaw('LEFT JOIN dbo.markup_set AS fm ON ag.flight_markup_set = fm.id')
                .joinRaw('LEFT JOIN dbo.markup_set AS hm ON ag.hotel_markup_set = hm.id')
                .joinRaw('LEFT JOIN admin.user_admin AS ua ON ag.created_by = ua.id')
                .joinRaw('LEFT JOIN agent.agency AS ar ON ag.ref_id = ar.id')
                .where('ag.id', id)
                .andWhere((qb) => {
                if (ref_id) {
                    qb.andWhere("ag.ref_id", ref_id);
                }
            })
                .first();
        });
    }
    // create white label permission
    createWhiteLabelPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('white_label_permissions')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload);
        });
    }
    updateWhiteLabelPermission(payload, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('white_label_permissions')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where('agency_id', agency_id);
        });
    }
    // get white label permission
    getWhiteLabelPermission(agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('white_label_permissions')
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
    //create audit
    createAudit(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('audit_trail')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload);
        });
    }
    //get audit
    getAudit(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db('audit_trail as at')
                .withSchema(this.AGENT_SCHEMA)
                .select('at.id', 'ad.name as created_by', 'at.type', 'at.details', 'at.created_at')
                .leftJoin('agent as ad', 'ad.id', 'at.created_by')
                .andWhere((qb) => {
                if (payload.created_by) {
                    qb.andWhere('at.created_by', payload.created_by);
                }
                if (payload.type) {
                    qb.andWhere('at.type', payload.type);
                }
                if (payload.from_date && payload.to_date) {
                    qb.andWhereBetween('at.created_at', [
                        payload.from_date,
                        payload.to_date,
                    ]);
                }
            })
                .limit(payload.limit || 100)
                .offset(payload.skip || 0)
                .orderBy('at.id', 'desc');
            const total = yield this.db('audit_trail as at')
                .count('at.id as total')
                .withSchema(this.AGENT_SCHEMA)
                .andWhere((qb) => {
                if (payload.created_by) {
                    qb.andWhere('at.created_by', payload.created_by);
                }
                if (payload.type) {
                    qb.andWhere('at.type', payload.type);
                }
                if (payload.from_date && payload.to_date) {
                    qb.andWhereBetween('at.created_at', [
                        payload.from_date,
                        payload.to_date,
                    ]);
                }
            });
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
}
exports.default = AgencyModel;
