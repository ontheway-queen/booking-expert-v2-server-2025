import Joi from 'joi'




export class AgentB2CVisaValidator{
    public getAllVisaListQuerySchema = Joi.object({
        country_id:Joi.number().required(),
        visa_type_id:Joi.number().required()
    })

    public createVisaValidatorSchema = Joi.object({

    })
}