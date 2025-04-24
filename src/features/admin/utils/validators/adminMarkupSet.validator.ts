import Joi from 'joi';
import {
  MARKUP_SET_TYPE_FLIGHT,
  MARKUP_SET_TYPE_HOTEL,
} from '../../../../utils/miscellaneous/constants';

export default class AdminMarkupSetValidator {
  public createMarkupSetSchema = Joi.object({
    name: Joi.string().required(),
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
    filter: Joi.string().optional(),
    status: Joi.boolean().optional(),
    type: Joi.string()
      .valid(MARKUP_SET_TYPE_FLIGHT, MARKUP_SET_TYPE_HOTEL)
      .required(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
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
          booking_block: Joi.boolean().optional(),
          issue_block: Joi.boolean().optional(),
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
          booking_block: Joi.boolean().optional(),
          issue_block: Joi.boolean().optional(),
        })
      )
      .min(1)
      .optional(),
    remove: Joi.array().items(Joi.number()).min(1).optional(),
  });

  public createHotelMarkup = Joi.object({
    name: Joi.string().trim().required(),
    book: Joi.object({
      markup: Joi.number().required(),
      type: Joi.string().valid('PER', 'FLAT').required(),
      mode: Joi.string().valid('INCREASE', 'DECREASE').required(),
    }),
    cancel: Joi.object({
      markup: Joi.number().required(),
      type: Joi.string().valid('PER', 'FLAT').required(),
      mode: Joi.string().valid('INCREASE', 'DECREASE').required(),
    }),
  });

  public updateHotelMarkup = Joi.object({
    name: Joi.string().optional(),
    status: Joi.boolean().optional(),
    book: Joi.object({
      markup: Joi.number().required(),
      type: Joi.string().valid('PER', 'FLAT').required(),
      mode: Joi.string().valid('INCREASE', 'DECREASE').required(),
    }).optional(),
    cancel: Joi.object({
      markup: Joi.number().required(),
      type: Joi.string().valid('PER', 'FLAT').required(),
      mode: Joi.string().valid('INCREASE', 'DECREASE').required(),
    }).optional(),
  });
}
