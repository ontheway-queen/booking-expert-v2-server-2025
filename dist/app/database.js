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
exports.db = exports.setUpCorsOrigin = void 0;
const knex_1 = __importDefault(require("knex"));
const config_1 = __importDefault(require("../config/config"));
const constants_1 = require("../utils/miscellaneous/constants");
const redis_1 = require("./redis");
const createDbCon = () => {
    const connection = (0, knex_1.default)({
        client: 'pg',
        connection: {
            host: config_1.default.DB_HOST,
            port: parseInt(config_1.default.DB_PORT),
            user: config_1.default.DB_USER,
            password: config_1.default.DB_PASS,
            database: config_1.default.DB_NAME,
            // ssl: {
            //   rejectUnauthorized: false,
            // },
        },
        pool: {
            min: 0,
            max: 100,
        },
    });
    return connection;
};
const setUpCorsOrigin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const originsDbs = (yield (0, exports.db)('cors_origins')
            .select('id', 'name')
            .where('status', true));
        const origins = originsDbs.map((item) => item.name);
        yield redis_1.client.del(constants_1.cors_origin_name);
        redis_1.client.set(constants_1.cors_origin_name, JSON.stringify(origins));
        console.log('New Cors Set Up Successfully...');
    }
    catch (error) {
        console.log('Error setting up CORS origins:', error);
    }
});
exports.setUpCorsOrigin = setUpCorsOrigin;
exports.db = createDbCon();
