"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class B2CFlightValidator {
    constructor() {
        // Cabin Pref Schema
        this.cabinPrefSchema = joi_1.default.object({
            Cabin: joi_1.default.string().valid('1', '2', '3', '4').required(),
            PreferLevel: joi_1.default.string().required(),
        });
        // Passenger Type Schema
        this.passengerTypeSchema = joi_1.default.object({
            Code: joi_1.default.string().length(3).required().messages({
                'any.required': 'Provide valid passenger',
            }),
            Quantity: joi_1.default.number().integer().required().messages({
                'any.required': 'Provide valid quantity',
                'number.integer': 'Quantity must be an integer',
            }),
        });
        // Location schema
        this.locationSchema = joi_1.default.object({
            LocationCode: joi_1.default.string().required().uppercase().messages({
                'any.required': 'Provide valid location',
            }),
        });
        /// TPA Schema
        this.tpaSchema = joi_1.default.object({
            CabinPref: this.cabinPrefSchema.required().messages({
                'any.required': 'CabinPref is required',
            }),
        });
        // Origin Destination Schema
        this.originDestSchema = joi_1.default.object({
            RPH: joi_1.default.string()
                .valid('1', '2', '3', '4', '5', '6', '7', '8', '9')
                .required()
                .messages({
                'any.required': 'Provide valid RPH',
            }),
            DepartureDateTime: joi_1.default.string()
                .pattern(new RegExp(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/))
                .required()
                .messages({
                'any.required': 'Provide valid Departure date time',
                'string.pattern.base': 'Invalid departure timestamp',
                'any.custom': 'Invalid departure timestamp',
            })
                .custom((value, helpers) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const oneYearFromToday = new Date();
                oneYearFromToday.setFullYear(today.getFullYear() + 1);
                const departureDate = new Date(value);
                if (departureDate < today) {
                    return helpers.error('any.custom');
                }
                if (departureDate > oneYearFromToday) {
                    return helpers.error('any.custom');
                }
                return value;
            }),
            OriginLocation: this.locationSchema.required().messages({
                'any.required': 'Provide valid origin location',
            }),
            DestinationLocation: this.locationSchema.required().messages({
                'any.required': 'Provide valid destination location',
            }),
            TPA_Extensions: this.tpaSchema.required().messages({
                'any.required': 'TPA Extensions is required',
            }),
        });
        // Flight search validator
        this.flightSearchSchema = joi_1.default.object({
            JourneyType: joi_1.default.string().valid('1', '2', '3').required(),
            airline_code: joi_1.default.array(),
            OriginDestinationInformation: joi_1.default.array()
                .items(this.originDestSchema.required())
                .required()
                .messages({
                'any.required': 'Provide valid Origin destination data',
            }),
            PassengerTypeQuantity: joi_1.default.array()
                .items(this.passengerTypeSchema.required())
                .required()
                .messages({
                'any.required': 'Provide valid passenger code and quantity data',
            }),
        });
        //flight search sse schema
        this.flightSearchSSESchema = joi_1.default.object({
            JourneyType: joi_1.default.string().valid('1', '2', '3').required(),
            OriginDestinationInformation: joi_1.default.alternatives()
                .try(joi_1.default.array().items(this.originDestSchema.required()).required(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedValue = JSON.parse(value);
                    const validationResult = joi_1.default.array()
                        .items(this.originDestSchema.required())
                        .validate(parsedValue);
                    if (validationResult.error) {
                        return helpers.error('any.invalid');
                    }
                    return parsedValue;
                }
                catch (error) {
                    console.error('Error parsing OriginDestinationInformation:', error);
                    return helpers.error('any.invalid');
                }
            }))
                .required()
                .messages({
                'any.required': 'Provide valid Origin destination data',
                'any.invalid': 'Invalid format for Origin destination data',
            }),
            PassengerTypeQuantity: joi_1.default.alternatives()
                .try(joi_1.default.array().items(this.passengerTypeSchema.required()).required(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedValue = JSON.parse(value);
                    const validationResult = joi_1.default.array()
                        .items(this.passengerTypeSchema.required())
                        .validate(parsedValue);
                    if (validationResult.error) {
                        return helpers.error('any.invalid');
                    }
                    return parsedValue;
                }
                catch (error) {
                    console.error('Error parsing PassengerTypeQuantity:', error);
                    return helpers.error('any.invalid');
                }
            }))
                .required()
                .messages({
                'any.required': 'Provide valid passenger code and quantity data',
                'any.invalid': 'Invalid format for passenger code and quantity data',
            }),
            token: joi_1.default.string().optional(),
            airline_code: joi_1.default.alternatives().try(joi_1.default.array().optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedValue = JSON.parse(value);
                    const validationResult = joi_1.default.array().validate(parsedValue);
                    if (validationResult.error) {
                        return helpers.error('any.invalid');
                    }
                    return parsedValue;
                }
                catch (error) {
                    return helpers.error('any.invalid');
                }
            })),
        });
        //FLIGHT REVALIDATE SCHEMA
        this.flightRevalidateSchema = joi_1.default.object({
            search_id: joi_1.default.string().required(),
            flight_id: joi_1.default.string().required(),
        });
    }
}
exports.default = B2CFlightValidator;
