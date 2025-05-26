import Joi from "joi";

export class AgentB2CSubConfigValidator {

    public upsertB2CMarkup = Joi.object({
       flight_markup_type: Joi.string().valid("PER","FLAT").required(),
       hotel_markup_type : Joi.string().valid("PER","FLAT").required(),
       flight_markup_mode: Joi.string().valid("INCREASE","DECREASE").required(),
       hotel_markup_mode: Joi.string().valid("INCREASE","DECREASE").required(),
       flight_markup: Joi.number().required(),
       hotel_markup: Joi.number().required(),
    });
}