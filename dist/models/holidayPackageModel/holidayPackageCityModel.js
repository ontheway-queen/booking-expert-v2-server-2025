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
const customError_1 = __importDefault(require("../../utils/lib/customError"));
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
const statusCode_1 = __importDefault(require("../../utils/miscellaneous/statusCode"));
class HolidayPackageCityModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createHolidayPackageCity(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db("holiday_package_city")
                    .withSchema(this.SERVICE_SCHEMA)
                    .insert(payload)
                    .returning(["city_id"]);
                return result;
            }
            catch (error) {
                if (error.code === "23505") {
                    throw new customError_1.default("City already exists", statusCode_1.default.HTTP_CONFLICT);
                }
                throw error;
            }
        });
    }
    deleteHolidayPackageCity(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("holiday_package_city")
                .withSchema(this.SERVICE_SCHEMA)
                .whereIn(["holiday_package_id", "city_id"], payload.map(p => [p.holiday_package_id, p.city_id]))
                .delete();
        });
    }
}
exports.default = HolidayPackageCityModel;
