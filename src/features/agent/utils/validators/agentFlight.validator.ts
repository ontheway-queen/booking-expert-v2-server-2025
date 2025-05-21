import Joi from "joi";
import { FLIGHT_BOOKING_CANCELLED, FLIGHT_BOOKING_CONFIRMED, FLIGHT_BOOKING_EXPIRED, FLIGHT_BOOKING_IN_PROCESS, FLIGHT_BOOKING_ON_HOLD, FLIGHT_BOOKING_REFUNDED, FLIGHT_BOOKING_REISSUED, FLIGHT_BOOKING_REQUEST, FLIGHT_BOOKING_VOID, FLIGHT_TICKET_IN_PROCESS, FLIGHT_TICKET_ISSUE, PAYMENT_TYPE_FULL, PAYMENT_TYPE_PARTIAL } from "../../../../utils/miscellaneous/flightConstent";

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

  //FLIGHT BOOKING PASSENGERS SCHEMA
  public flightBookingPassengersSchema = Joi.object({
    reference: Joi.string().required().valid("Mr", "Mrs", "Ms", "Miss", "MSTR"),
    first_name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s\-']+$/)  // Allows letters, spaces, hyphens, apostrophes
      .pattern(/^(?!.*(.)\1{3})/),   // Blocks >3 repeating chars
    last_name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s\-']+$/)  // Allows letters, spaces, hyphens, apostrophes
      .pattern(/^(?!.*(.)\1{3})/),   // Blocks >3 repeating chars
    type: Joi.string().required().valid("ADT", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "INF"),
    date_of_birth: Joi.string().required().pattern(/^\d{4}-\d{2}-\d{2}$/)
      .messages({
        'string.pattern.base': 'date_of_birth must be in the format yyyy-mm-dd',
        'any.custom': 'date_of_birth cannot be in the future',
      })
      .custom((value, helpers) => {
        const today = new Date();
        const inputDate = new Date(value);
        if (inputDate > today) {
          return helpers.error('any.custom');
        }
        return value;
      }),
    gender: Joi.string().required().valid("Male", "Female"),
    issuing_country: Joi.number().required(),
    nationality: Joi.number().required(),
    passport_number: Joi.string().optional(),
    passport_expiry_date: Joi.string().optional().pattern(/^\d{4}-\d{2}-\d{2}$/)
      .messages({
        'string.pattern.base': 'passport_expiry_date must be in the format yyyy-mm-dd',
        'any.custom': 'passport_expiry_date must be at least 6 months from the current date',
      })
      .custom((value, helpers) => {
        const today = new Date();
        const sixMonthsFromToday = new Date();
        sixMonthsFromToday.setMonth(today.getMonth() + 6);
        const expiryDate = new Date(value);
        if (expiryDate < sixMonthsFromToday) {
          return helpers.error('any.custom');
        }
        return value;
      }),
    contact_number: Joi.string().optional(),
    contact_email: Joi.string().email().optional(),
    frequent_flyer_airline: Joi.string().optional(),
    frequent_flyer_number: Joi.string().optional(),
    passport_file: Joi.string().optional(),
    visa_file: Joi.string().optional(),
    save_information: Joi.boolean().optional()
  });

  //FLIGHT BOOKING SCHEMA
  public flightBookingSchema = Joi.object({
    search_id: Joi.string().required(),
    flight_id: Joi.string().required(),
    passengers: Joi.string()
      .required()
      .custom((value, helpers) => {
        try {
          const parsedValue = JSON.parse(value);

          if (!Array.isArray(parsedValue)) {
            return helpers.error("passengers.invalidArray");
          }

          for (const passenger of parsedValue) {
            const { error } = this.flightBookingPassengersSchema
              .keys({
                key: Joi.number().required(),
              })
              .validate(passenger);

            if (error) {
              return helpers.error("passengers.invalidPassenger", { message: error.details[0].message });
            }
          }

          return parsedValue;
        } catch (error) {
          console.error("Error parsing passengers field:", error);
          return helpers.error("passengers.invalidJSON");
        }
      }, "Validate Passengers JSON")
      .messages({
        "passengers.invalidArray": "Passengers field must be a valid array.",
        "passengers.invalidPassenger": "{{#message}}",
        "passengers.invalidJSON": "Passengers field must contain valid JSON.",
      }),
  });

  //GET FLIGHT LIST SCHEMA
  public getFlightListSchema = Joi.object({
    status: Joi.string().valid(FLIGHT_BOOKING_REQUEST, FLIGHT_BOOKING_CONFIRMED, FLIGHT_BOOKING_VOID, FLIGHT_BOOKING_IN_PROCESS, FLIGHT_TICKET_IN_PROCESS, FLIGHT_BOOKING_ON_HOLD, FLIGHT_TICKET_ISSUE, FLIGHT_BOOKING_EXPIRED, FLIGHT_BOOKING_CANCELLED, FLIGHT_BOOKING_REFUNDED, FLIGHT_BOOKING_REISSUED),
    from_date: Joi.date(),
    to_date: Joi.date(),
    filter: Joi.string(),
    limit: Joi.number(),
    skip: Joi.number()
  });

  //ISSUE TICKET SCHEMA
  public issueTicketSchema = Joi.object({
    payment_type: Joi.string().valid(PAYMENT_TYPE_FULL, PAYMENT_TYPE_PARTIAL).required(),
  });
}
