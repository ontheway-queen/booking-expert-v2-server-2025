import Joi, { LanguageMessages } from 'joi';
import {
  UMRAH_BOOKING_STATUS_CANCELLED,
  UMRAH_BOOKING_STATUS_CONFIRMED,
  UMRAH_BOOKING_STATUS_PENDING,
  UMRAH_BOOKING_STATUS_PROCESSED,
  UMRAH_BOOKING_STATUS_PROCESSING,
} from '../../../../../utils/miscellaneous/constants';

export class AgentB2CSubUmrahValidator {
  public parsedSchema = Joi.array().items(Joi.string());

  public createUmrahSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    short_description: Joi.string().optional(),
    duration: Joi.number().optional().positive(),
    valid_till_date: Joi.string().optional(),
    group_size: Joi.number().optional().positive(),
    adult_price: Joi.number().required().positive(),
    child_price: Joi.number().required().positive(),
    package_details: Joi.string().optional(),
    umrah_for: Joi.string().valid('AGENT', 'B2C', 'BOTH').required(),
    slug: Joi.string().required(),
    meta_title: Joi.string().required(),
    meta_description: Joi.string().required(),
    package_price_details: Joi.string().optional(),
    package_accommodation_details: Joi.string().optional(),
    package_includes: Joi.array().items(Joi.string()).required(),
  });

  public getUmrahListQuerySchema = Joi.object({
    limit: Joi.number().required(),
    skip: Joi.number().required(),
    filter: Joi.string().optional(),
    status: Joi.boolean().optional(),
  });

  public updateUmrahSchema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    short_description: Joi.string().optional(),
    duration: Joi.number().optional().positive(),
    valid_till_date: Joi.string().isoDate().optional(),
    group_size: Joi.number().optional().positive(),
    adult_price: Joi.number().optional().positive(),
    child_price: Joi.number().optional().positive(),
    package_details: Joi.string().optional(),
    umrah_for: Joi.string().valid('AGENT', 'B2C', 'BOTH').optional(),
    slug: Joi.string().optional(),
    status: Joi.boolean().optional(),
    meta_title: Joi.string().optional(),
    meta_description: Joi.string().optional(),
    package_price_details: Joi.string().optional(),
    package_accommodation_details: Joi.string().optional(),
    add_package_include: Joi.array()
      .items(Joi.string().allow(''))
      .optional()
      .optional(),
    remove_package_include: Joi.array()
      .items(Joi.number().allow(''))
      .optional(),
    remove_images: Joi.array().items(Joi.number().allow('')).optional(),
  });

  public getUmrahBooking = Joi.object({
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    user_id: Joi.number().optional(),
    from_date: Joi.date().raw().optional(),
    to_date: Joi.date().raw().optional(),
    filter: Joi.string().optional(),
    status: Joi.string()
      .custom((value, helpers) => {
        const splitArray = value.split(',');
        for (const status of splitArray) {
          if (
            ![
              UMRAH_BOOKING_STATUS_PENDING,
              UMRAH_BOOKING_STATUS_PROCESSING,
              UMRAH_BOOKING_STATUS_PROCESSED,
              UMRAH_BOOKING_STATUS_CONFIRMED,
              UMRAH_BOOKING_STATUS_CANCELLED,
            ].includes(status)
          ) {
            return helpers.message(
              "Status must be one of 'PENDING', 'PROCESSING', 'PROCESSED', 'CONFIRMED', 'CANCELLED'" as unknown as LanguageMessages
            );
          }
        }
        return splitArray;
      })
      .optional(),
  });

  public updateUmrahBookingStatusSchema = Joi.object({
    status: Joi.string()
      .valid(
        UMRAH_BOOKING_STATUS_PENDING,
        UMRAH_BOOKING_STATUS_PROCESSING,
        UMRAH_BOOKING_STATUS_PROCESSED,
        UMRAH_BOOKING_STATUS_CONFIRMED,
        UMRAH_BOOKING_STATUS_CANCELLED
      )
      .required(),
  });
}
