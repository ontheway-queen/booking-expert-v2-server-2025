"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AgentHotelValidator {
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
        this.hotelBooking = joi_1.default.object({
            search_id: joi_1.default.string().required(),
            hotel_code: joi_1.default.number().required(),
            group_code: joi_1.default.string().required(),
            city_code: joi_1.default.number().required(),
            checkin: joi_1.default.string().required(),
            checkout: joi_1.default.string().required(),
            booking_comments: joi_1.default.string().optional(),
            booking_items: joi_1.default.string()
                .custom((value, helpers) => {
                try {
                    const parsedValue = JSON.parse(value);
                    const validator = joi_1.default.array()
                        .items(joi_1.default.object({
                        room_code: joi_1.default.string().required(),
                        rate_key: joi_1.default.string().required(),
                        rooms: joi_1.default.array()
                            .items(joi_1.default.object({
                            room_reference: joi_1.default.string().required(),
                            paxes: joi_1.default.array()
                                .items(joi_1.default.object({
                                title: joi_1.default.string().required(),
                                name: joi_1.default.string().required(),
                                surname: joi_1.default.string().required(),
                                type: joi_1.default.string().valid('AD', 'CH').required(),
                            }))
                                .min(1)
                                .required(),
                        }))
                            .min(1)
                            .required(),
                    }))
                        .min(1)
                        .required();
                    const { error } = validator.validate(parsedValue);
                    if (error) {
                        return helpers.message({ custom: error.message });
                    }
                    return parsedValue;
                }
                catch (_a) {
                    return helpers.message({
                        custom: 'Invalid JSON format in booking_items',
                    });
                }
            })
                .required(),
            holder: joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedValue = JSON.parse(value);
                    const validator = joi_1.default.object({
                        title: joi_1.default.string().required(),
                        name: joi_1.default.string().required(),
                        surname: joi_1.default.string().required(),
                        email: joi_1.default.string().email().optional(),
                        phone_number: joi_1.default.string().optional(),
                        client_nationality: joi_1.default.string().required(),
                    }).required();
                    const { error } = validator.validate(parsedValue);
                    if (error) {
                        return helpers.message({ custom: error.message });
                    }
                    return parsedValue;
                }
                catch (_a) {
                    return helpers.message({
                        custom: 'Invalid JSON format in holder',
                    });
                }
            }),
        });
    }
}
exports.default = AgentHotelValidator;
