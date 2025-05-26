import Joi from "joi";

export class AgentTravelerValidator {

    public create = Joi.object({
        reference: Joi.string().required().valid("Mr", "Mrs", "Ms", "Miss", "MSTR"),
        first_name: Joi.string()
            .min(2)
            .max(50)
            .pattern(/^[a-zA-Z\s\-']+$/)  // Allows letters, spaces, hyphens, apostrophes
            .pattern(/^(?!.*(.)\1{3})/).required(),   // Blocks >3 repeating chars
        last_name: Joi.string()
            .min(2)
            .max(50)
            .pattern(/^[a-zA-Z\s\-']+$/)  // Allows letters, spaces, hyphens, apostrophes
            .pattern(/^(?!.*(.)\1{3})/).required(),   // Blocks >3 repeating chars
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
    });

    public update = Joi.object({
        reference: Joi.string().optional().valid("Mr", "Mrs", "Ms", "Miss", "MSTR"),
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
        type: Joi.string().optional().valid("ADT", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "INF"),
        date_of_birth: Joi.string().optional().pattern(/^\d{4}-\d{2}-\d{2}$/)
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
        gender: Joi.string().optional().valid("Male", "Female"),
        issuing_country: Joi.number().optional(),
        nationality: Joi.number().optional(),
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
    });
}