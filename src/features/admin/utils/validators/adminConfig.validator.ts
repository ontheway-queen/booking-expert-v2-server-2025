import Joi from 'joi';
import {
  SLUG_TYPE_BLOG,
  SLUG_TYPE_HOLIDAY,
  SLUG_TYPE_UMRAH,
} from '../../../../utils/miscellaneous/constants';

export default class AdminConfigValidator {
  public getAllCity = Joi.object({
    country_id: Joi.number().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    filter: Joi.string().optional(),
  });

  public createCity = Joi.object({
    country_id: Joi.number().required(),
    name: Joi.string().required(),
    code: Joi.string().optional(),
    lat: Joi.string().optional(),
    lng: Joi.string().optional(),
  });

  public updateCity = Joi.object({
    country_id: Joi.number().optional(),
    name: Joi.string().optional(),
    code: Joi.string().optional(),
    lat: Joi.string().optional(),
    lng: Joi.string().optional(),
  });

  public getAllAirport = Joi.object({
    country_id: Joi.number().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    name: Joi.string().optional(),
  });

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

  //check slug
  public checkSlugSchema = Joi.object({
    slug: Joi.string().required().trim().lowercase(),
    type: Joi.string()
      .valid(SLUG_TYPE_HOLIDAY, SLUG_TYPE_UMRAH, SLUG_TYPE_BLOG)
      .valid()
      .required(),
  });

  public getAllAirlines = Joi.object({
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    name: Joi.string().optional(),
  });

  public createAirlines = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
  });

  public updateB2CMarkupSet = Joi.object({
    flight_set_id: Joi.number().optional(),
    hotel_set_id: Joi.number().optional(),
  });

  public getBanks = Joi.object({
    status: Joi.boolean().optional(),
    filter: Joi.string().optional(),
  });

  public updateBank = Joi.object({
    name: Joi.string().optional(),
    type: Joi.string().valid('Bank', 'MFS').optional(),
    status: Joi.boolean().optional(),
  });

  public createBank = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('Bank', 'MFS').required(),
  });
}
