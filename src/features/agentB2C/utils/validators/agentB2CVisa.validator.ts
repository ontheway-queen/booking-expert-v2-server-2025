import Joi from 'joi'




export class AgentB2CVisaValidator{
    public getAllVisaListQuerySchema = Joi.object({
        country_id:Joi.number().required(),
        visa_type_id:Joi.number().required()
    })

    public createVisaValidatorSchema = Joi.object({
        application_ref: Joi.string().required(),
        source_type:Joi.string().required(),
        source_id:Joi.number().required(),
        user_id:Joi.number().required(),
        visa_is:Joi.number().required(),
        from_date:Joi.date().raw().required(),
        to_date:Joi.date().raw().required(),
        traveler:Joi.number().required(),
        visa_fee:Joi.number().required(),
        processing_fee:Joi.number().required(),
        contact_email:Joi.string().email().trim().required(),
        contact_number:Joi.string().trim().required(),
        whatsapp_number:Joi.string().trim().optional(),
        nationality:Joi.string().trim().optional(),
        residence:Joi.string().trim().optional(),
    })
}