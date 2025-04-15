import Joi from "joi";

export default class AgentFlightValidator {


  // Cabin Pref Schema
  private cabinPrefSchema = Joi.object({
    Cabin: Joi.string().valid("1", "2", "3", "4").required(),
    PreferLevel: Joi.string().required(),
  });

  // Location schema
  private locationSchema = Joi.object({
    LocationCode: Joi.string().required().uppercase().messages({
      "any.required": "Provide valid location",
    }),
  });

  /// TPA Schema
  private tpaSchema = Joi.object({
    CabinPref: this.cabinPrefSchema.required().messages({
      "any.required": "CabinPref is required",
    }),
  });

  // Origin Destination Schema
  private originDestSchema = Joi.object({
    RPH: Joi.string()
      .valid("1", "2", "3", "4", "5", "6", "7", "8", "9")
      .required()
      .messages({
        "any.required": "Provide valid RPH",
      }),
    DepartureDateTime: Joi.string()
      .pattern(new RegExp(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/))
      .required()
      .messages({
        "any.required": "Provide valid Departure date time",
        "string.pattern.base": "Invalid departure timestamp",
        "any.custom": "Invalid departure timestamp",
      })
      .custom((value, helpers) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const oneYearFromToday = new Date();
        oneYearFromToday.setFullYear(today.getFullYear() + 1);

        const departureDate = new Date(value);
        if (departureDate < today) {
          return helpers.error("any.custom");
        }
        if (departureDate > oneYearFromToday) {
          return helpers.error("any.custom");
        }
        return value;
      }),
    OriginLocation: this.locationSchema.required().messages({
      "any.required": "Provide valid origin location",
    }),
    DestinationLocation: this.locationSchema.required().messages({
      "any.required": "Provide valid destination location",
    }),
    TPA_Extensions: this.tpaSchema.required().messages({
      "any.required": "TPA Extensions is required",
    }),
  });

  // Passenger Type Schema
  private passengerTypeSchema = Joi.object({
    Code: Joi.string().length(3).required().messages({
      "any.required": "Provide valid passenger",
    }),
    Quantity: Joi.number().integer().required().messages({
      "any.required": "Provide valid quantity",
      "number.integer": "Quantity must be an integer",
    }),
  });

  // Flight search validator
  public flightSearchSchema = Joi.object({
    JourneyType: Joi.string().valid("1", "2", "3").required(),
    airline_code: Joi.array(),
    OriginDestinationInformation: Joi.array()
      .items(this.originDestSchema.required())
      .required()
      .messages({
        "any.required": "Provide valid Origin destination data",
      }),
    PassengerTypeQuantity: Joi.array()
      .items(this.passengerTypeSchema.required())
      .required()
      .messages({
        "any.required": "Provide valid passenger code and quantity data",
      }),
  });

  //flight search sse schema
  public flightSearchSSESchema = Joi.object({
    JourneyType: Joi.string().valid('1', '2', '3').required(),
    OriginDestinationInformation: Joi.alternatives().try(
      Joi.array().items(this.originDestSchema.required()).required(),
      Joi.string().custom((value, helpers) => {
        try {
          const parsedValue = JSON.parse(value);
          const validationResult = Joi.array().items(this.originDestSchema.required()).validate(parsedValue);
          if (validationResult.error) {
            return helpers.error("any.invalid");
          }
          return parsedValue;
        } catch (error) {
          console.error("Error parsing OriginDestinationInformation:", error);
          return helpers.error("any.invalid");
        }
      })
    ).required().messages({
      'any.required': 'Provide valid Origin destination data',
      'any.invalid': 'Invalid format for Origin destination data',
    }),
    PassengerTypeQuantity: Joi.alternatives().try(
      Joi.array().items(this.passengerTypeSchema.required()).required(),
      Joi.string().custom((value, helpers) => {
        try {
          const parsedValue = JSON.parse(value);
          const validationResult = Joi.array().items(this.passengerTypeSchema.required()).validate(parsedValue);
          if (validationResult.error) {
            return helpers.error("any.invalid");
          }
          return parsedValue;
        } catch (error) {
          console.error("Error parsing PassengerTypeQuantity:", error);
          return helpers.error("any.invalid");
        }
      })
    ).required().messages({
      'any.required': 'Provide valid passenger code and quantity data',
      'any.invalid': 'Invalid format for passenger code and quantity data',
    }),
    token: Joi.string().optional(),
    airline_code: Joi.alternatives().try(
      Joi.array().optional(),
      Joi.string().custom((value, helpers) => {
        try {
          const parsedValue = JSON.parse(value);
          const validationResult = Joi.array().validate(parsedValue);
          if (validationResult.error) {
            return helpers.error("any.invalid");
          }
          return parsedValue;
        } catch (error) {
          return helpers.error("any.invalid");
        }
      })
    )
  });

  //FLIGHT REVALIDATE SCHEMA
  public flightRevalidateSchema = Joi.object({
    search_id: Joi.string().required(),
    flight_id: Joi.string().required(),
  });

}
