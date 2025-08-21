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
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisFlush = exports.deleteRedis = exports.getRedisTTL = exports.getRedis = exports.setRedis = exports.client = void 0;
const redis_1 = require("redis");
const bullmq_1 = require("bullmq");
const redis_url = 'redis://localhost';
exports.client = (0, redis_1.createClient)({ url: redis_url });
exports.client.on('error', (err) => console.log('Redis Client Error', err));
exports.client.connect();
const setRedis = (key_1, value_1, ...args_1) => __awaiter(void 0, [key_1, value_1, ...args_1], void 0, function* (key, value, ex = 900) {
    yield exports.client.setEx(key, ex, JSON.stringify(value));
});
exports.setRedis = setRedis;
const getRedis = (key) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield exports.client.exists(key)) {
        const retrievedData = (yield exports.client.get(key));
        return JSON.parse(retrievedData);
    }
    else {
        return null;
    }
});
exports.getRedis = getRedis;
const getRedisTTL = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const ttl = yield exports.client.ttl(key);
    return ttl;
});
exports.getRedisTTL = getRedisTTL;
const deleteRedis = (key) => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.client.del(key);
});
exports.deleteRedis = deleteRedis;
const redisFlush = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.client.flushAll();
});
exports.redisFlush = redisFlush;
const redisConfig = {
    connection: {
        host: 'localhost',
        port: 6379,
    },
};
const emailQueue = new bullmq_1.Queue('emailQueue', redisConfig);
const worker = new bullmq_1.Worker('emailQueue', (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, subject, text, html } = job.data;
    try {
        // const info = await transporter.sendMail({
        //   from: '"Your Service" <noreply@yourservice.com>',
        //   to,
        //   subject,
        //   text,
        //   html,
        // });
        // console.log('Email sent:', info.messageId);
        // return info;
    }
    catch (error) {
        console.error('Email sending failed:', error);
        throw error; // This will trigger a retry if configured
    }
}), redisConfig);
