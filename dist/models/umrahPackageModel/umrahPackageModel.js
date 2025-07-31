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
            return yield this.db('umrah_package as up')
                .withSchema(this.SERVICE_SCHEMA)
                .select('up.*')
                .where((qb) => {
                if (query.slug) {
                    qb.andWhere('up.slug', query.slug);
                }
            })
                .andWhere('up.id', query.umrah_id)
                .first();
        });
    }
    getSingleUmrahPackageImages(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_images as upi')
                .withSchema(this.SERVICE_SCHEMA)
                .select('upi.*')
                .where('upi.umrah_id', query.umrah_id);
        });
    }
    getUmrahPackageList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package as up')
                .withSchema(this.SERVICE_SCHEMA)
                .select('*', this.db.raw(`
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', upi.id,
            'photo', upi.photo
          )) FILTER (WHERE upi.id IS NOT NULL),
          '[]'
        ) as images
      `), this.db.raw(`
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', upinei.id,
            'icon', upinei.icon,
            'title', upinei.title
          )) FILTER (WHERE upinei.id IS NOT NULL),
          '[]'
        ) as includes
      `))
                .leftJoin('umrah_package_images as upi', 'upi.umrah_id', 'up.id')
                .leftJoin('umrah_package_include as upin', 'upin.umrah_id', 'up.id')
                .leftJoin('umrah_package_include_exclude_items as upinei', 'upinei.id', 'upin.include_exclude_id')
                .where((qb) => {
                if (query.status != undefined) {
                    qb.andWhere('up.status', query.status);
                }
                if (query.title) {
                    qb.andWhereILike('up.title', `%${query.title}%`);
                }
            })
                .limit(query.limit)
                .offset(query.skip);
        });
    }
}
exports.default = UmrahPackageModel;
