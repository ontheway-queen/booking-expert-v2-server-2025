import Joi from 'joi';

export default class AgentB2CBlogValidator {
  public getBlog = Joi.object({
    skip: Joi.number().optional(),
    limit: Joi.number().optional(),
  });
}
