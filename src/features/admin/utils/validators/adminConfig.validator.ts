import Joi from 'joi';

export default class AdminConfigValidator {
  //Create airport schema
  public createAirportSchema = Joi.object({
    country_id: Joi.number().required(),
    name: Joi.string().trim().max(500).required(),
    iata_code: Joi.string().trim().max(12).uppercase().required(),
    city: Joi.number().optional(),
  });

  //update airport schema
  public updateAirportSchema = Joi.object({
    country_id: Joi.number().optional(),
    name: Joi.string().trim().max(500).optional(),
    iata_code: Joi.string().trim().max(12).uppercase().optional(),
    city: Joi.number().optional(),
  });

  //insert airlines
  public insertAirlines = Joi.object({
    code: Joi.string().trim().max(12).required().uppercase(),
    name: Joi.string().trim().max(500).required(),
  });

  //update airlines
  public updateAirlines = Joi.object({
    code: Joi.string().max(12).trim().optional().uppercase(),
    name: Joi.string().max(500).trim().optional(),
  });
}
