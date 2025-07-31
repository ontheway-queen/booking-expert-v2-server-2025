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
class UmrahPackageModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertUmrahPackage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package').withSchema(this.SERVICE_SCHEMA).insert(payload, 'id');
        });
    }
    insertUmrahPackageImage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_images')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getSingleUmrahPackageDetails(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'title', 'description', 'duration', 'valid_till_date', 'group_fare', 'status', 'adult_price', 'child_price', 'package_details', 'slug', 'meta_tag', 'meta_description', 'package_price_details', 'package_accommodation_details', 'short_description')
                .where((qb) => {
                if (query.slug) {
                    qb.andWhere('slug', query.slug);
                }
            })
                .andWhere('id', query.umrah_id)
                .first();
        });
    }
    getSingleUmrahPackageImages(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_images')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'image')
                .where('umrah_id', query.umrah_id);
        });
    }
}
exports.default = UmrahPackageModel;
