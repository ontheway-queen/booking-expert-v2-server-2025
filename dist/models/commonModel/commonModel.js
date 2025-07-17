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
const flightConstant_1 = require("../../utils/miscellaneous/flightConstant");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class CommonModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // get otp
    getOTP(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.db('email_otp')
                .withSchema(this.DBO_SCHEMA)
                .select('id', 'hashed_otp as otp', 'tried')
                .andWhere('email', payload.email)
                .andWhere('type', payload.type)
                .andWhere('matched', 0)
                .andWhereRaw(`"create_date" + interval '${constants_1.OTP_DEFAULT_EXPIRY} minutes' > NOW()`)
                .andWhere((qb) => {
                if (payload.agency_id) {
                    qb.andWhere('agency_id', payload.agency_id);
                }
            });
            return check;
        });
    }
    // insert OTP
    insertOTP(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('email_otp')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    // update otp
    updateOTP(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('email_otp')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where('id', where.id)
                .andWhere((qb) => {
                if (where.agency_id) {
                    qb.andWhere('agency_id', where.agency_id);
                }
            });
        });
    }
    // Get Env Variable
    getEnv(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('variable_env')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where({ key });
            if (data.length) {
                return data[0].value;
            }
            else {
                throw new Error(`Env variable ${key} not found!`);
            }
        });
    }
    // update env variable
    updateEnv(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('variable_env')
                .withSchema(this.DBO_SCHEMA)
                .update({ value })
                .where({ key });
        });
    }
    insertLastNo(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('last_no')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateLastNo(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('last_no')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where('id', id);
        });
    }
    getLastId(_a) {
        return __awaiter(this, arguments, void 0, function* ({ type, }) {
            return yield this.db('last_no')
                .withSchema(this.DBO_SCHEMA)
                .select('id', 'last_id')
                .where('type', type)
                .first();
        });
    }
    // Get airlines
    getAirlineByCode(airlineCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const airline = yield this.db('airlines')
                .withSchema(this.PUBLIC_SCHEMA)
                .select('name', 'logo')
                .where((qb) => {
                if (airlineCode) {
                    qb.andWhere('code', airlineCode);
                }
            })
                .first();
            if (airline) {
                return airline;
            }
            else {
                return {
                    name: 'Not available',
                    logo: 'Not available',
                };
            }
        });
    }
    // Get airlines
    getAirlineById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines')
                .withSchema(this.PUBLIC_SCHEMA)
                .select('id', 'name', 'logo')
                .where('id', id)
                .first();
        });
    }
    // Aircraft details by code
    getAircraft(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const aircraft = yield this.db
                .select('*')
                .from('aircraft')
                .withSchema(this.PUBLIC_SCHEMA)
                .where('code', code);
            if (aircraft.length) {
                return aircraft[0];
            }
            else {
                return { code: code, name: 'Not available' };
            }
        });
    }
    //get all country
    getCountry(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('country')
                .withSchema(this.PUBLIC_SCHEMA)
                .select('id', 'name', 'iso', 'iso3', 'phone_code')
                .where((qb) => {
                if (payload.id) {
                    qb.where('id', payload.id);
                }
                if (payload.name) {
                    qb.andWhereILike('name', `%${payload.name}%`);
                }
            })
                .orderBy('name', 'asc');
        });
    }
    //get all city
    getCity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ country_id, limit, skip, filter, code, }, need_total = false) {
            const data = yield this.db('city AS c')
                .withSchema(this.PUBLIC_SCHEMA)
                .select('c.id', 'c.name', 'c.country_id', 'co.name AS country_name', 'c.code', 'c.lat', 'c.lng')
                .leftJoin('country AS co', 'c.country_id', 'co.id')
                .where((qb) => {
                if (country_id) {
                    qb.andWhere('c.country_id', country_id);
                }
                if (code) {
                    qb.orWhere('c.code', code);
                }
                if (filter) {
                    qb.andWhere((qqb) => {
                        qqb.orWhere('c.name', 'ilike', `%${filter}%`);
                        qqb.orWhere('c.code', filter);
                    });
                }
            })
                .orderBy('c.name', 'asc')
                .limit(limit || 100)
                .offset(skip || 0);
            let total = [];
            if (need_total) {
                total = yield this.db('city AS c')
                    .withSchema(this.PUBLIC_SCHEMA)
                    .count('c.id as total')
                    .leftJoin('country AS co', 'c.country_id', 'co.id')
                    .where((qb) => {
                    if (country_id) {
                        qb.andWhere('c.country_id', country_id);
                    }
                    if (code) {
                        qb.orWhere('c.code', code);
                    }
                    if (filter) {
                        qb.andWhere((qqb) => {
                            qqb.orWhere('c.name', 'ilike', `%${filter}%`);
                            qqb.orWhere('c.code', filter);
                        });
                    }
                });
            }
            return {
                data,
                total: total.length ? total[0].total : 0,
            };
        });
    }
    //insert city
    insertCity(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('city')
                .withSchema(this.PUBLIC_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // update city
    updateCity(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('city')
                .withSchema(this.PUBLIC_SCHEMA)
                .update(payload)
                .where('id', id);
        });
    }
    // delete city
    deleteCity(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('city')
                .withSchema(this.PUBLIC_SCHEMA)
                .delete()
                .where('id', id);
        });
    }
    //insert airport
    insertAirport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airport')
                .withSchema(this.PUBLIC_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get all airport
    getAirport(params_1) {
        return __awaiter(this, arguments, void 0, function* (params, total = false) {
            var _a;
            const data = yield this.db('airport as air')
                .withSchema(this.PUBLIC_SCHEMA)
                .select('air.id', 'air.country_id', 'cou.name as country', 'air.name', 'air.iata_code', 'ct.id as city_id', 'ct.name as city_name')
                .join('country as cou', 'cou.id', 'air.country_id')
                .leftJoin('city as ct', 'ct.id', 'air.city')
                .where((qb) => {
                if (params.country_id) {
                    qb.where('air.country_id', params.country_id);
                }
                if (params.code) {
                    qb.orWhere('air.iata_code', params.code);
                }
                qb.andWhere((qqb) => {
                    if (params.name) {
                        qqb.orWhere('air.iata_code', params.name.toUpperCase());
                        qqb.orWhereILike('air.name', `${params.name}%`);
                        qqb.orWhereILike('cou.name', `${params.name}%`);
                        qqb.orWhereILike('ct.name', `${params.name}%`);
                    }
                });
            })
                .orderByRaw(`ARRAY_POSITION(ARRAY[${flightConstant_1.PRIORITY_AIRPORTS.map(() => '?').join(', ')}]::TEXT[], air.iata_code) ASC NULLS LAST, air.id ASC`, flightConstant_1.PRIORITY_AIRPORTS)
                .limit(params.limit ? params.limit : 100)
                .offset(params.skip ? params.skip : 0)
                .orderBy('air.id', 'asc');
            let count = [];
            if (total) {
                count = yield this.db('airport as air')
                    .withSchema(this.PUBLIC_SCHEMA)
                    .count('air.id as total')
                    .join('country as cou', 'cou.id', 'air.country_id')
                    .where((qb) => {
                    if (params.country_id) {
                        qb.where('air.country_id', params.country_id);
                    }
                    if (params.code) {
                        qb.orWhere('air.iata_code', params.code);
                    }
                    qb.andWhere((qqb) => {
                        if (params.name) {
                            qqb.orWhere('air.iata_code', params.name.toUpperCase());
                            qqb.orWhereILike('air.name', `${params.name}%`);
                            qqb.orWhereILike('cou.name', `${params.name}%`);
                            qqb.orWhereILike('ct.name', `${params.name}%`);
                        }
                    });
                });
            }
            return { data, total: (_a = count[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //update airport
    updateAirport(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airport')
                .withSchema(this.PUBLIC_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //delete airport
    deleteAirport(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airport')
                .withSchema(this.PUBLIC_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    //insert airline
    insertAirline(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines')
                .withSchema(this.PUBLIC_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get all airlines
    getAirlines(params, total) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db('airlines as air')
                .withSchema(this.PUBLIC_SCHEMA)
                .select('air.id', 'air.code', 'air.name', 'air.logo')
                .where((qb) => {
                if (params.code) {
                    qb.where('air.code', params.code);
                }
                qb.andWhere((qqb) => {
                    if (params.name) {
                        if (params.name.length === 2) {
                            qqb.andWhere('air.code', params.name);
                        }
                        else {
                            qqb.andWhere('air.name', 'ilike', `%${params.name}%`);
                        }
                    }
                });
            })
                .limit(params.limit ? params.limit : 100)
                .offset(params.skip ? params.skip : 0)
                .orderBy('air.id', 'asc');
            let count = [];
            if (total) {
                count = yield this.db('airlines as air')
                    .withSchema(this.PUBLIC_SCHEMA)
                    .count('air.id as total')
                    .where((qb) => {
                    if (params.code) {
                        qb.where('air.code', params.code);
                    }
                    qb.andWhere((qqb) => {
                        if (params.name) {
                            if (params.name.length === 2) {
                                qqb.andWhere('air.code', params.name);
                            }
                            else {
                                qqb.andWhere('air.name', 'ilike', `%${params.name}%`);
                            }
                        }
                    });
                });
            }
            return { data, total: (_a = count[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //update airlines
    updateAirlines(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines')
                .withSchema(this.PUBLIC_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //delete airlines
    deleteAirlines(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines')
                .withSchema(this.PUBLIC_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    // Insert email subscriber
    insertEmailSubscriber(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('email_subscriber')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    getEmailSubscriber(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, email, from_date, source_type, to_date, with_total, limit, skip, }) {
            var _b;
            const data = yield this.db('email_subscriber')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                if (agency_id) {
                    qb.andWhere('agency_id', agency_id);
                }
                if (email) {
                    qb.andWhere('email', email);
                }
                if (from_date && to_date) {
                    qb.andWhereBetween('created_at', [from_date, to_date]);
                }
                if (source_type) {
                    qb.andWhere('source_type', source_type);
                }
            })
                .limit(Number(limit) || constants_1.DATA_LIMIT)
                .offset(Number(skip) || 0);
            let total = [];
            if (with_total) {
                total = yield this.db('email_subscriber')
                    .withSchema(this.DBO_SCHEMA)
                    .count('id AS total')
                    .where((qb) => {
                    if (agency_id) {
                        qb.andWhere('agency_id', agency_id);
                    }
                    if (email) {
                        qb.andWhere('email', email);
                    }
                    if (from_date && to_date) {
                        qb.andWhereBetween('created_at', [from_date, to_date]);
                    }
                    if (source_type) {
                        qb.andWhere('source_type', source_type);
                    }
                });
            }
            return { data, total: (_b = total[0]) === null || _b === void 0 ? void 0 : _b.total };
        });
    }
}
exports.default = CommonModel;
