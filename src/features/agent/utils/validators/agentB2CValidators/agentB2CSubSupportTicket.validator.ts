import Joi from 'joi';

export default class AgentB2CSubSupportTicketValidator {
  public createSupportTicket = Joi.object({
    subject: Joi.string().trim().required(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent').required(),
    ref_type: Joi.string()
      .valid(
        'Flight',
        'Visa',
        'Hotel',
        'Holiday',
        'Umrah',
        'Others',
        'Accounts',
        'Payments'
      )
      .required(),
    ref_id: Joi.number().optional(),
    details: Joi.string().required(),
  });

  public getSupportTicket = Joi.object({
    status: Joi.string().valid('Open', 'Closed', 'ReOpen').optional(),
    from_date: Joi.date().strict().optional(),
    to_date: Joi.date().strict().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
  });

  public sendMsg = Joi.object({
    message: Joi.string().trim().required(),
  });
}
