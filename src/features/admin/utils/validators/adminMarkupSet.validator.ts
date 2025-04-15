import Joi from 'joi';

export default class AdminMarkupSetValidator {

    public createMarkupSetSchema = Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid('Flight', 'Hotel').required(),
        api: Joi.array()
            .items(
                Joi.object({
                    api_id: Joi.number().required(),
                    airlines: Joi.array()
                        .min(1)
                        .items(Joi.string().length(2).required())
                        .required(),
                    markup_domestic: Joi.number().required(),
                    markup_from_dac: Joi.number().required(),
                    markup_to_dac: Joi.number().required(),
                    markup_soto: Joi.number().required(),
                    markup_type: Joi.string().valid('PER', 'FLAT').required(),
                    markup_mode: Joi.string().valid('INCREASE', 'DECREASE').required(),
                })
            )
            .min(1)
            .optional(),
    });


    public getMarkupSetSchema = Joi.object({
        name: Joi.string().optional(),
        status: Joi.boolean().optional(),
        type: Joi.string().valid('Flight', 'Hotel').required(),
        limit: Joi.number().optional(),
        skip: Joi.number().optional()
    });

    public updateCommissionSetSchema = Joi.object({
        name: Joi.string().optional(),
        add: Joi.array().items(Joi.number().required()).optional(),
        update: Joi.array().items(
            Joi.object({
                id: Joi.number().required(),
                status: Joi.boolean().required(),
            })
        ),
    });

    public updateFlightMarkupsSchema = Joi.object({
        api_status: Joi.boolean(),
        add: Joi.array()
            .items(
                Joi.object({
                    airlines: Joi.array()
                        .min(1)
                        .items(Joi.string().length(2).required())
                        .required(),
                    markup_domestic: Joi.number().required(),
                    markup_from_dac: Joi.number().required(),
                    markup_to_dac: Joi.number().required(),
                    markup_soto: Joi.number().required(),
                    markup_type: Joi.string().valid('PER', 'FLAT').required(),
                    markup_mode: Joi.string().valid('INCREASE', 'DECREASE').required(),
                })
            )
            .min(1)
            .optional(),
        update: Joi.array()
            .items(
                Joi.object({
                    id: Joi.number().required(),
                    airline: Joi.string().length(2),
                    markup_domestic: Joi.number(),
                    markup_from_dac: Joi.number(),
                    markup_to_dac: Joi.number(),
                    markup_soto: Joi.number(),
                    status: Joi.boolean(),
                    markup_type: Joi.string().valid('PER', 'FLAT'),
                    markup_mode: Joi.string().valid('INCREASE', 'DECREASE'),
                })
            )
            .min(1)
            .optional(),
        remove: Joi.array().items(Joi.number()).min(1).optional(),
    });
}
