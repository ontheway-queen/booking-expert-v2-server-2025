"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.B2CHotelValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class B2CHotelValidator {
    constructor() {
        this.searchValidator = joi_1.default.object({
            currency: joi_1.default.string().optional(),
            client_nationality: joi_1.default.string().required(),
            destination: joi_1.default.string().valid('City', 'Hotel').required(),
            code: joi_1.default.number().required(),
            rooms: joi_1.default.array()
                .items(joi_1.default.object({
                adults: joi_1.default.number().required(),
                no_of_infants: joi_1.default.number().optional(),
                children_ages: joi_1.default.array().items(joi_1.default.number()).optional(),
            }))
                .required(),
            checkin: joi_1.default.string().required(),
            checkout: joi_1.default.string().required(),
        });
        this.getHotelRoomsValidator = joi_1.default.object({
            hcode: joi_1.default.number().required(),
            search_id: joi_1.default.string().required(),
        });
        this.hotelRoomRecheck = joi_1.default.object({
            search_id: joi_1.default.string().required(),
            nights: joi_1.default.number().required(),
            rooms: joi_1.default.array()
                .items({
                rate_key: joi_1.default.string().required(),
                group_code: joi_1.default.string().required(),
            })
                .min(1)
                .required(),
        });
    }
}
exports.B2CHotelValidator = B2CHotelValidator;
