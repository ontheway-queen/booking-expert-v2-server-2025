import Joi from 'joi';
import {
  CONTENT_TYPE_PHOTO,
  CONTENT_TYPE_VIDEO,
  FUNCTION_TYPE_BLOG,
  FUNCTION_TYPE_FLIGHT,
  FUNCTION_TYPE_GROUP,
  FUNCTION_TYPE_HOLIDAY,
  FUNCTION_TYPE_HOTEL,
  FUNCTION_TYPE_UMRAH,
  FUNCTION_TYPE_VISA,
  MARKUP_MODE_DECREASE,
  MARKUP_MODE_INCREASE,
  MARKUP_TYPE_FLAT,
  MARKUP_TYPE_PER,
} from '../../../../../utils/miscellaneous/constants';

export class AgentB2CSubConfigValidator {
  public upsertB2CMarkup = Joi.object({
    flight_markup_type: Joi.string().valid(MARKUP_TYPE_PER, MARKUP_TYPE_FLAT).required(),
    hotel_markup_type: Joi.string().valid(MARKUP_TYPE_PER, MARKUP_TYPE_FLAT).required(),
    flight_markup_mode: Joi.string().valid(MARKUP_MODE_INCREASE, MARKUP_MODE_DECREASE).required(),
    hotel_markup_mode: Joi.string().valid(MARKUP_MODE_INCREASE, MARKUP_MODE_DECREASE).required(),
    flight_markup: Joi.number().required(),
    hotel_markup: Joi.number().required(),
  });

  public updateAccounts = Joi.object({
    account_name: Joi.string().optional().trim(),
    account_number: Joi.string().optional().trim(),
    branch: Joi.string().optional().trim(),
    routing_no: Joi.string().optional().trim(),
    swift_code: Joi.string().optional().trim(),
    status: Joi.boolean().optional(),
  });

  public createAccounts = Joi.object({
    bank_id: Joi.number().required(),
    account_name: Joi.string().required().trim(),
    account_number: Joi.string().required().trim(),
    branch: Joi.string().optional().trim(),
    routing_no: Joi.string().optional().trim(),
    swift_code: Joi.string().optional().trim(),
  });

  public createHeroBGContent = Joi.object({
    type: Joi.string().valid(CONTENT_TYPE_PHOTO, CONTENT_TYPE_VIDEO).required(),
    quote: Joi.string().optional().trim(),
    sub_quote: Joi.string().optional().trim(),
    tab: Joi.string()
      .valid(
        FUNCTION_TYPE_FLIGHT,
        FUNCTION_TYPE_HOTEL,
        FUNCTION_TYPE_HOLIDAY,
        FUNCTION_TYPE_VISA,
        FUNCTION_TYPE_GROUP,
        FUNCTION_TYPE_BLOG,
        FUNCTION_TYPE_UMRAH
      )
      .optional(),
  });

  public updateHeroBGContent = Joi.object({
    type: Joi.string().valid(CONTENT_TYPE_PHOTO, CONTENT_TYPE_VIDEO).optional(),
    quote: Joi.string().optional().trim(),
    sub_quote: Joi.string().optional().trim(),
    status: Joi.boolean().optional(),
    order_number: Joi.number().optional(),
    tab: Joi.string()
      .valid(
        FUNCTION_TYPE_FLIGHT,
        FUNCTION_TYPE_HOTEL,
        FUNCTION_TYPE_HOLIDAY,
        FUNCTION_TYPE_VISA,
        FUNCTION_TYPE_GROUP,
        FUNCTION_TYPE_BLOG,
        FUNCTION_TYPE_UMRAH
      )
      .optional(),
  });

  public createPopularDestination = Joi.object({
    from_airport: Joi.number().required(),
    to_airport: Joi.number().required(),
  });

  public updatePopularDestination = Joi.object({
    from_airport: Joi.number().optional(),
    to_airport: Joi.number().optional(),
    status: Joi.boolean().optional(),
    order_number: Joi.number().optional(),
  });

  public createPopularPlace = Joi.object({
    country_id: Joi.number().required(),
    location_id: Joi.number().required(),
    location_type: Joi.string().required(),
    location_name: Joi.string().required(),
    short_description: Joi.string().required(),
  });

  public updatePopularPlace = Joi.object({
    country_id: Joi.number().optional(),
    location_id: Joi.number().optional(),
    location_type: Joi.string().optional(),
    location_name: Joi.string().optional().trim(),
    short_description: Joi.string().optional().trim(),
    status: Joi.boolean().optional(),
    order_number: Joi.number().optional(),
  });

  public createHotDeals = Joi.object({
    title: Joi.string().required().trim(),
    link: Joi.string().required().trim(),
  });

  public updateHotDeals = Joi.object({
    title: Joi.string().optional().trim(),
    link: Joi.string().optional().trim(),
    status: Joi.boolean().optional(),
    order_number: Joi.number().optional(),
  });

  public createVisaType = Joi.object({
    name: Joi.string().required().trim(),
  });


  public createVisaMode = Joi.object({
    name: Joi.string().required().trim(),
  });
}
