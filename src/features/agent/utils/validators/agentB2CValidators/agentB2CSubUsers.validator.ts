import Joi from "joi";

export class AgentB2CSubUsersValidator {

    public getB2CUsersFilterQuery = Joi.object({
        filter: Joi.string().trim(),
        status: Joi.boolean(),
        limit: Joi.number(),
        skip: Joi.number()
    });

    public updateB2CUser = Joi.object({
        name: Joi.string().trim(),
        phone_number: Joi.string().min(11),
        gender: Joi.string().valid("Male","Female","Other")
    });
}