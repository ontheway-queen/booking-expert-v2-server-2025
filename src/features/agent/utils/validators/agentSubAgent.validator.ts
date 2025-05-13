import Joi from "joi";

export class AgentSubAgentValidator {

    public createSubAgencySchema = Joi.object({
        email: Joi.string().email().trim().lowercase().required(),
        agency_name: Joi.string().required(),
        user_name: Joi.string().required(),
        address: Joi.string().required(),
        phone: Joi.string().min(11).max(14).required(),
        flight_markup_type: Joi.string().valid("PER","FLAT").required(),
        hotel_markup_type: Joi.string().valid("PER","FLAT").required(),
        flight_markup_mode: Joi.string().valid("INCREASE","DECREASE").required(),
        hotel_markup_mode: Joi.string().valid("INCREASE","DECREASE").required(),
        flight_markup: Joi.number().min(0).required(),
        hotel_markup: Joi.number().min(0).required(),
    });

    public getSubAgencyQuerySchema = Joi.object({
        filter: Joi.string(),
        status: Joi.string().valid('Pending', 'Active', 'Inactive', 'Rejected', 'Incomplete'),
        limit: Joi.number().allow(""),
        skip: Joi.number().allow("")
    });

    public updateSubAgencySchema = Joi.object({
        email: Joi.string().email().trim().lowercase(),
        agency_name: Joi.string(),
        phone: Joi.string().min(11).max(14),
        address: Joi.string(),
        status: Joi.string().valid("Active","Inactive"),
        flight_markup_type: Joi.string().valid("PER","FLAT"),
        hotel_markup_type: Joi.string().valid("PER","FLAT"),
        flight_markup_mode: Joi.string().valid("INCREASE","DECREASE"),
        hotel_markup_mode: Joi.string().valid("INCREASE","DECREASE"),
        flight_markup: Joi.number().min(0),
        hotel_markup: Joi.number().min(0),
    });
}