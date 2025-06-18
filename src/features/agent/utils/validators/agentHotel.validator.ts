import Joi from 'joi';

export default class AgentHotelValidator {
  public searchValidator = Joi.object({
    currency: Joi.string().optional(),
    client_nationality: Joi.string().required(),
    destination: Joi.string().valid('City', 'Hotel').required(),
    code: Joi.number().required(),
    name: Joi.string().required(),
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

  public getHotelSearchHistoryValidator = Joi.object({
    from_date: Joi.date().optional(),
    to_date: Joi.date().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
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

  public hotelBooking = Joi.object({
    search_id: Joi.string().required(),
    hotel_code: Joi.number().required(),
    group_code: Joi.string().required(),
    city_code: Joi.number().required(),
    checkin: Joi.string().required(),
    checkout: Joi.string().required(),
    booking_comments: Joi.string().optional(),
    booking_items: Joi.string()
      .custom((value, helpers) => {
        try {
          const parsedValue = JSON.parse(value);

          const validator = Joi.array()
            .items(
              Joi.object({
                room_code: Joi.string().required(),
                rate_key: Joi.string().required(),
                rooms: Joi.array()
                  .items(
                    Joi.object({
                      room_reference: Joi.string().required(),
                      paxes: Joi.array()
                        .items(
                          Joi.object({
                            title: Joi.string()
                              .valid('Mr.', 'Ms.', 'Mrs.', 'Mstr.')
                              .required(),
                            name: Joi.string().required(),
                            surname: Joi.string().required(),
                            type: Joi.string().valid('AD', 'CH').required(),
                          })
                        )
                        .min(1)
                        .required(),
                    })
                  )
                  .min(1)
                  .required(),
              })
            )
            .min(1)
            .required();

          const { error } = validator.validate(parsedValue);

          if (error) {
            return helpers.message({ custom: error.message });
          }

          return parsedValue;
        } catch {
          return helpers.message({
            custom: 'Invalid JSON format in booking_items',
          });
        }
      })
      .required(),
    holder: Joi.string().custom((value, helpers) => {
      try {
        const parsedValue = JSON.parse(value);

        const validator = Joi.object({
          title: Joi.string().required(),
          name: Joi.string().required(),
          surname: Joi.string().required(),
          email: Joi.string().email().optional(),
          phone_number: Joi.string().optional(),
          client_nationality: Joi.string().required(),
        }).required();

        const { error } = validator.validate(parsedValue);

        if (error) {
          return helpers.message({ custom: error.message });
        }

        return parsedValue;
      } catch {
        return helpers.message({
          custom: 'Invalid JSON format in holder',
        });
      }
    }),
  });

  public getHotelBooking = Joi.object({
    filter: Joi.string().optional(),
    from_date: Joi.date().optional(),
    to_date: Joi.date().optional(),
    limit: Joi.string().optional(),
    skip: Joi.string().optional(),
  });
}
