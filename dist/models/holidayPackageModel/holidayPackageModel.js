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
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class HolidayPackageModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertHolidayPackage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("holiday_package")
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getHolidayPackageList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db("holiday_package as tp")
                .withSchema(this.SERVICE_SCHEMA)
                .select("tp.id", "tp.slug", "tp.title", "c.name as city", "cn.name as country", "tp.holiday_type", "tp.holiday_for", "tp.duration", "tp.status", "tp.created_at", this.db.raw(`(
                  SELECT image FROM ?? 
                  WHERE holiday_package_id = tp.id 
                  ORDER BY id ASC 
                  LIMIT 1
                ) as image`, [`${this.SERVICE_SCHEMA}.holiday_package_images`]), this.db.raw(`(
                  SELECT adult_price FROM ?? 
                  WHERE holiday_package_id = tp.id
                  ${query.holiday_for ? "AND price_for = ?" : ""}
                  ORDER BY id ASC 
                  LIMIT 1
                ) as price`, [
                `${this.SERVICE_SCHEMA}.holiday_package_pricing`,
                ...(query.holiday_for ? [query.holiday_for] : [])
            ]))
                .joinRaw(`left join ${this.PUBLIC_SCHEMA}.city as c on c.id = tp.city_id`)
                .joinRaw(`left join ${this.PUBLIC_SCHEMA}.country as cn on cn.id = c.country_id`)
                .where((qb) => {
                if (query.city_id) {
                    qb.andWhere("tp.city_id", query.city_id);
                }
                if (query.status !== undefined) {
                    qb.andWhere("tp.status", query.status);
                }
                if (query.holiday_for) {
                    qb.andWhere("tp.Holiday_for", query.holiday_for);
                }
                if (query.slug) {
                    qb.andWhere("tp.slug", query.slug);
                }
            })
                .andWhere("tp.is_deleted", false)
                .orderBy("tp.id", "desc")
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            let total = [];
            if (is_total) {
                total = yield this.db("holiday_package as tp")
                    .withSchema(this.SERVICE_SCHEMA)
                    .count("tp.id as total")
                    .where((qb) => {
                    if (query.city_id) {
                        qb.andWhere("tp.city_id", query.city_id);
                    }
                    if (query.status !== undefined) {
                        qb.andWhere("tp.status", query.status);
                    }
                    if (query.holiday_for) {
                        qb.andWhere("tp.Holiday_for", query.holiday_for);
                    }
                    if (query.slug) {
                        qb.andWhere("tp.slug", query.slug);
                    }
                })
                    .andWhere("tp.is_deleted", false);
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total
            };
        });
    }
    getSingleHolidayPackage(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("holiday_package as tp")
                .withSchema(this.SERVICE_SCHEMA)
                .select("tp.id", "tp.slug", "tp.city_id", "c.name as city", "cn.name as country", "tp.title", "tp.details", "tp.holiday_type", "tp.duration", "tp.valid_till_date", "tp.group_size", "tp.cancellation_policy", "tp.tax_details", "tp.general_condition", "tp.holiday_for", "tp.status", "tp.created_at", this.db.raw(`COALESCE(json_agg(DISTINCT tpp.*) FILTER (WHERE tpp.id IS NOT NULL), '[]') as pricing`), this.db.raw(`COALESCE(json_agg(DISTINCT tpi.*) FILTER (WHERE tpi.id IS NOT NULL), '[]') as itinerary`), this.db.raw(`COALESCE(json_agg(DISTINCT tps.*) FILTER (WHERE tps.id IS NOT NULL), '[]') as services`), this.db.raw(`COALESCE(json_agg(DISTINCT tpim.*) FILTER (WHERE tpim.id IS NOT NULL), '[]') as images`))
                .joinRaw(`left join ${this.PUBLIC_SCHEMA}.city as c on c.id = tp.city_id`)
                .joinRaw(`left join ${this.PUBLIC_SCHEMA}.country as cn on cn.id = c.country_id`)
                .leftJoin("holiday_package_pricing as tpp", "tp.id", "tpp.holiday_package_id")
                .leftJoin("holiday_package_itinerary as tpi", "tp.id", "tpi.holiday_package_id")
                .leftJoin("holiday_package_service as tps", "tp.id", "tps.holiday_package_id")
                .leftJoin("holiday_package_images as tpim", "tp.id", "tpim.holiday_package_id")
                .where((qb) => {
                if (where.id) {
                    qb.andWhere("tp.id", where.id);
                }
                if (where.slug) {
                    qb.andWhere("tp.slug", where.slug);
                }
                if (where.status !== undefined) {
                    qb.andWhere("tp.status", where.status);
                }
            })
                .andWhere("tp.is_deleted", false)
                .groupBy("tp.id", "tp.slug", "tp.city_id", "c.name", "cn.name", "tp.title", "tp.details", "tp.holiday_type", "tp.duration", "tp.valid_till_date", "tp.group_size", "tp.cancellation_policy", "tp.tax_details", "tp.general_condition", "tp.holiday_for", "tp.status", "tp.created_at")
                .first();
        });
    }
    updateHolidayPackage(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("holiday_package")
                .withSchema(this.SERVICE_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteHolidayPackage(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("holiday_package")
                .withSchema(this.SERVICE_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
}
exports.default = HolidayPackageModel;
