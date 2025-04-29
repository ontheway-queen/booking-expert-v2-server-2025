"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminHolidayValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const holidayConstants_1 = require("../../../../utils/miscellaneous/holidayConstants");
class AdminHolidayValidator {
    constructor() {
        this.createPricingSchema = joi_1.default.object({
            price_for: joi_1.default.string().valid(holidayConstants_1.HOLIDAY_FOR_AGENT, holidayConstants_1.HOLIDAY_FOR_B2C).required(),
            adult_price: joi_1.default.number().required(),
            child_price: joi_1.default.number().required(),
            markup_price: joi_1.default.number().optional(),
            markup_type: joi_1.default.string().valid(holidayConstants_1.HOLIDAY_PRICE_MARKUP_FLAT, holidayConstants_1.HOLIDAY_PRICE_MARKUP_PER).optional()
        });
        this.createItinerarySchema = joi_1.default.object({
            day_number: joi_1.default.number().required(),
            title: joi_1.default.string().required(),
            details: joi_1.default.string().optional()
        });
        this.createServiceSchema = joi_1.default.object({
            type: joi_1.default.string().valid(holidayConstants_1.HOLIDAY_SERVICE_TYPE_INCLUDE, holidayConstants_1.HOLIDAY_SERVICE_TYPE_EXCLUDE).required(),
            title: joi_1.default.string().required()
        });
        this.createHolidaySchema = joi_1.default.object({
            slug: joi_1.default.string().required().max(1000),
            city_id: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.number()).min(1).required(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    return parsed;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            })).required(),
            title: joi_1.default.string().required().max(1000),
            details: joi_1.default.string().required(),
            holiday_type: joi_1.default.string().valid(holidayConstants_1.HOLIDAY_TYPE_DOMESTIC, holidayConstants_1.HOLIDAY_TYPE_INTERNATIONAL).required(),
            duration: joi_1.default.number().required(),
            valid_till_date: joi_1.default.string().optional().regex(/^\d{4}-\d{2}-\d{2}$/),
            group_size: joi_1.default.number().optional(),
            cancellation_policy: joi_1.default.string().optional(),
            tax_details: joi_1.default.string().optional(),
            general_condition: joi_1.default.string().optional(),
            holiday_for: joi_1.default.string().valid(holidayConstants_1.HOLIDAY_FOR_AGENT, holidayConstants_1.HOLIDAY_FOR_B2C, holidayConstants_1.HOLIDAY_FOR_BOTH).required(),
            pricing: joi_1.default.alternatives()
                .try(joi_1.default.array().items(this.createPricingSchema).required(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    return parsed;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .required()
                .custom((value, helpers) => {
                const holidayFor = helpers.state.ancestors[0].holiday_for;
                const priceForList = value.map((p) => p.price_for);
                if (holidayFor === holidayConstants_1.HOLIDAY_FOR_AGENT) {
                    if (value.length !== 1 || priceForList[0] !== holidayConstants_1.HOLIDAY_FOR_AGENT) {
                        return helpers.error("any.invalid", {
                            message: "Only one 'AGENT' pricing is allowed for holiday_for = 'AGENT'",
                        });
                    }
                }
                if (holidayFor === holidayConstants_1.HOLIDAY_FOR_B2C) {
                    if (value.length !== 1 || priceForList[0] !== holidayConstants_1.HOLIDAY_FOR_B2C) {
                        return helpers.error("any.invalid", {
                            message: "Only one 'B2C' pricing is allowed for holiday_for = 'B2C'",
                        });
                    }
                }
                if (holidayFor === holidayConstants_1.HOLIDAY_FOR_BOTH) {
                    const hasAgent = priceForList.includes(holidayConstants_1.HOLIDAY_FOR_AGENT);
                    const hasB2C = priceForList.includes(holidayConstants_1.HOLIDAY_FOR_B2C);
                    if (!(hasAgent && hasB2C)) {
                        return helpers.error("any.invalid", {
                            message: "'AGENT' and 'B2C' pricing must both be present for holiday_for = 'BOTH'",
                        });
                    }
                    if (value.length > 2) {
                        return helpers.error("any.invalid", {
                            message: "Only two pricing entries allowed for holiday_for = 'BOTH'",
                        });
                    }
                }
                return value;
            }),
            itinerary: joi_1.default.alternatives()
                .try(joi_1.default.array().items(this.createItinerarySchema).required(), joi_1.default.string().custom((value, helpers) => {
                try {
                    return JSON.parse(value);
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .required(),
            services: joi_1.default.alternatives()
                .try(joi_1.default.array().items(this.createServiceSchema).required(), joi_1.default.string().custom((value, helpers) => {
                try {
                    return JSON.parse(value);
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .required(),
        });
        this.getHolidayPackageListSchema = joi_1.default.object({
            city_id: joi_1.default.number().optional(),
            holiday_for: joi_1.default.string().valid(holidayConstants_1.HOLIDAY_FOR_AGENT, holidayConstants_1.HOLIDAY_FOR_B2C, holidayConstants_1.HOLIDAY_FOR_BOTH).optional(),
            date: joi_1.default.string().optional().regex(/^\d{4}-\d{2}-\d{2}$/),
            status: joi_1.default.boolean().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
        });
        this.updateHolidaySchema = joi_1.default.object({
            slug: joi_1.default.string().optional().max(1000),
            city: joi_1.default.alternatives()
                .try(joi_1.default.object({
                add: joi_1.default.array().items(joi_1.default.number()).optional(),
                delete: joi_1.default.array().items(joi_1.default.number()).optional(),
            }).optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    return parsed;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            })).optional(),
            title: joi_1.default.string().optional().max(1000),
            details: joi_1.default.string().optional(),
            holiday_type: joi_1.default.string()
                .valid(holidayConstants_1.HOLIDAY_TYPE_DOMESTIC, holidayConstants_1.HOLIDAY_TYPE_INTERNATIONAL)
                .optional(),
            duration: joi_1.default.number().optional(),
            valid_till_date: joi_1.default.date().iso().optional(),
            group_size: joi_1.default.number().optional(),
            cancellation_policy: joi_1.default.string().optional(),
            tax_details: joi_1.default.string().optional(),
            general_condition: joi_1.default.string().optional(),
            holiday_for: joi_1.default.string()
                .valid(holidayConstants_1.HOLIDAY_FOR_AGENT, holidayConstants_1.HOLIDAY_FOR_B2C, holidayConstants_1.HOLIDAY_FOR_BOTH)
                .optional(),
            status: joi_1.default.boolean().optional(),
            pricing: joi_1.default.alternatives().try(joi_1.default.object({
                add: joi_1.default.array().items(this.createPricingSchema).optional(),
                delete: joi_1.default.array().items(joi_1.default.number()).optional(),
                update: joi_1.default.array().items(joi_1.default.object({
                    id: joi_1.default.number().required(),
                    price_for: joi_1.default.string().valid(holidayConstants_1.HOLIDAY_FOR_AGENT, holidayConstants_1.HOLIDAY_FOR_B2C).optional(),
                    adult_price: joi_1.default.number().optional(),
                    child_price: joi_1.default.number().optional(),
                    markup_price: joi_1.default.number().optional(),
                    markup_type: joi_1.default.string()
                        .valid(holidayConstants_1.HOLIDAY_PRICE_MARKUP_FLAT, holidayConstants_1.HOLIDAY_PRICE_MARKUP_PER)
                        .optional(),
                })).optional(),
            }), joi_1.default.string().custom((value, helpers) => {
                try {
                    return JSON.parse(value);
                }
                catch (_a) {
                    return helpers.error("any.invalid");
                }
            })).optional(),
            itinerary: joi_1.default.alternatives().try(joi_1.default.object({
                add: joi_1.default.array().items(this.createItinerarySchema).optional(),
                delete: joi_1.default.array().items(joi_1.default.number()).optional(),
                update: joi_1.default.array().items(joi_1.default.object({
                    id: joi_1.default.number().required(),
                    day_number: joi_1.default.number().optional(),
                    title: joi_1.default.string().optional(),
                    details: joi_1.default.string().optional(),
                })).optional(),
            }), joi_1.default.string().custom((value, helpers) => {
                try {
                    return JSON.parse(value);
                }
                catch (_a) {
                    return helpers.error("any.invalid");
                }
            })).optional(),
            services: joi_1.default.alternatives().try(joi_1.default.object({
                add: joi_1.default.array().items(this.createServiceSchema).optional(),
                delete: joi_1.default.array().items(joi_1.default.number()).optional(),
                update: joi_1.default.array().items(joi_1.default.object({
                    id: joi_1.default.number().required(),
                    type: joi_1.default.string().valid(holidayConstants_1.HOLIDAY_SERVICE_TYPE_INCLUDE, holidayConstants_1.HOLIDAY_SERVICE_TYPE_EXCLUDE).optional(),
                    title: joi_1.default.string().optional(),
                })).optional(),
            }), joi_1.default.string().custom((value, helpers) => {
                try {
                    return JSON.parse(value);
                }
                catch (_a) {
                    return helpers.error("any.invalid");
                }
            })).optional(),
            delete_images: joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.number()), joi_1.default.string().custom((value, helpers) => {
                try {
                    return JSON.parse(value);
                }
                catch (_a) {
                    return helpers.error("any.invalid");
                }
            })).optional(),
        });
    }
}
exports.AdminHolidayValidator = AdminHolidayValidator;
