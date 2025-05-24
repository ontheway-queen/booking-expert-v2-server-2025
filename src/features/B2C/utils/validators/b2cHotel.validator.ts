import Joi from 'joi';

export class B2CHotelValidator {
  public searchValidator = Joi.object({
    currency: Joi.string().optional(),
    client_nationality: Joi.string().required(),
    destination: Joi.string().valid('City', 'Hotel').required(),
    code: Joi.number().required(),
    rooms: Joi.array()
      .items(
        Joi.object({
          adults: Joi.number().required(),
          no_of_infants: Joi.number().optional(),
          children_ages: Joi.array().items(Joi.number()).optional(),
        })
      )
      .required(),
    checkin: Joi.string().required(),
    checkout: Joi.string().required(),
  });

  public getHotelRoomsValidator = Joi.object({
    hcode: Joi.number().required(),
    search_id: Joi.string().required(),
  });

  public hotelRoomRecheck = Joi.object({
    search_id: Joi.string().required(),
    nights: Joi.number().required(),
    rooms: Joi.array()
      .items({
        rate_key: Joi.string().required(),
        group_code: Joi.string().required(),
      })
      .min(1)
      .required(),
  });
}
