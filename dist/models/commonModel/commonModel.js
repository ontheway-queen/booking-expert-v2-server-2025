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
const flightConstent_1 = require("../../utils/miscellaneous/flightConstent");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class CommonModel extends schema_1.default {
    constructor(db) {
        super();
        // Aircraft details by code
        this.getAircraft = (code) => __awaiter(this, void 0, void 0, function* () {
            const aircraft = yield this.db
                .select('*')
                .from('aircraft')
                .withSchema(this.DBO_SCHEMA)
                .where('code', code);
            if (aircraft.length) {
                return aircraft[0];
            }
            else {
                return { code: code, name: 'Not available' };
            }
        });
        // AIRLINE DETAILS BY AIRLINE CODE
        this.getAirlineDetails = (airlineCode) => __awaiter(this, void 0, void 0, function* () {
            const [airline] = yield this.db
                .select('name as airline_name', 'logo as airline_logo')
                .withSchema(this.DBO_SCHEMA)
                .from('airlines')
                .where('code', airlineCode);
            if (airline) {
                return airline;
            }
            else {
                return {
                    airline_name: 'Not available',
                    airline_logo: 'Not available',
                };
            }
        });
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
                .andWhere('tried', '<', 3)
                .andWhereRaw(`"create_date" + interval '${constants_1.OTP_DEFAULT_EXPIRY} minutes' > NOW()`);
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
                .where('id', where.id);
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
    getAirlines(airlineCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const [airline] = yield this.db('airlines')
                .withSchema(this.DBO_SCHEMA)
                .select('name', 'logo')
                .where((qb) => {
                if (airlineCode) {
                    qb.andWhere('code', airlineCode);
                }
            });
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
    // get airport
    getAirport(airportCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const [airport] = yield this.db
                .select('*')
                .from('airport')
                .withSchema(this.DBO_SCHEMA)
                .where('iata_code', airportCode);
            if (airport) {
                return airport.name;
            }
            else {
                return 'Not available';
            }
        });
    }
    // get city
    getCity(cityCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const [city] = yield this.db
                .select('name')
                .from('city_view')
                .withSchema(this.DBO_SCHEMA)
                .where('code', cityCode);
            return city === null || city === void 0 ? void 0 : city.name;
        });
    }
    //get all country
    getAllCountry(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('country')
                .withSchema(this.DBO_SCHEMA)
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
    getAllCity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ country_id, city_id, limit, skip, filter, name, }) {
            // console.log({ city_id });
            return yield this.db('city')
                .withSchema(this.DBO_SCHEMA)
                .select('id', 'name')
                .where((qb) => {
                if (country_id) {
                    qb.where({ country_id });
                }
                if (name) {
                    qb.andWhere('name', 'ilike', `%${name}%`);
                }
                if (city_id) {
                    qb.andWhere('id', city_id);
                }
            })
                .orderBy('id', 'asc')
                .limit(limit || 100)
                .offset(skip || 0);
        });
    }
    //insert city
    insertCity(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('city')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //insert airport
    insertAirport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airport')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get all airport
    getAllAirport(params, total) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db('airport as air')
                .withSchema(this.DBO_SCHEMA)
                .select('air.id', 'air.country_id', 'cou.name as country', 'air.name', 'air.iata_code', 'ct.id as city_id', 'ct.name as city_name')
                .join('country as cou', 'cou.id', 'air.country_id')
                .leftJoin('city as ct', 'ct.id', 'air.city')
                .where((qb) => {
                if (params.country_id) {
                    qb.where('air.country_id', params.country_id);
                }
                if (params.name) {
                    qb.orWhere('air.iata_code', params.name.toUpperCase());
                    qb.orWhereILike('air.name', `${params.name}%`);
                    qb.orWhereILike('cou.name', `${params.name}%`);
                    qb.orWhereILike('ct.name', `${params.name}%`);
                }
                if (params.code) {
                    qb.where('air.iata_code', params.code);
                }
            })
                .orderByRaw(`ARRAY_POSITION(ARRAY[${flightConstent_1.PRIORITY_AIRPORTS.map(() => '?').join(', ')}]::TEXT[], air.iata_code) ASC NULLS LAST, air.id ASC`, flightConstent_1.PRIORITY_AIRPORTS)
                .limit(params.limit ? params.limit : 100)
                .offset(params.skip ? params.skip : 0)
                .orderBy('air.id', 'asc');
            let count = [];
            if (total) {
                count = yield this.db('airport as air')
                    .withSchema(this.DBO_SCHEMA)
                    .count('air.id as total')
                    .join('country as cou', 'cou.id', 'air.country_id')
                    .where((qb) => {
                    if (params.country_id) {
                        qb.where('air.country_id', params.country_id);
                    }
                    if (params.name) {
                        qb.orWhere('air.iata_code', params.name.toUpperCase());
                        qb.orWhereILike('air.name', `${params.name}%`);
                        qb.orWhereILike('cou.name', `${params.name}%`);
                    }
                });
            }
            return { data, total: (_a = count[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //update airport
    updateAirport(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airport')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //delete airport
    deleteAirport(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airport')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    //insert airline
    insertAirline(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get all airlines
    getAllAirline(params, total) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db('airlines as air')
                .withSchema(this.DBO_SCHEMA)
                .select('air.id', 'air.code', 'air.name', 'air.logo')
                .where((qb) => {
                if (params.code) {
                    qb.where('air.code', params.code);
                }
                if (params.name) {
                    if (params.name.length === 2) {
                        qb.andWhere('air.code', params.name);
                    }
                    else {
                        qb.andWhere('air.name', 'ilike', `%${params.name}%`);
                    }
                }
            })
                .limit(params.limit ? params.limit : 100)
                .offset(params.skip ? params.skip : 0)
                .orderBy('air.id', 'asc');
            let count = [];
            if (total) {
                count = yield this.db('airlines as air')
                    .withSchema(this.DBO_SCHEMA)
                    .count('air.id as total')
                    .where((qb) => {
                    if (params.code) {
                        qb.where('air.code', params.code);
                    }
                    if (params.name) {
                        qb.andWhere('air.name', 'ilike', `%${params.name}%`);
                        qb.orWhere('air.code', params.name);
                    }
                });
            }
            return { data, total: (_a = count[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //update airlines
    updateAirlines(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //delete airlines
    deleteAirlines(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
}
exports.default = CommonModel;
