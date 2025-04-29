import Joi, { number } from "joi";
import { HOLIDAY_FOR_AGENT, HOLIDAY_FOR_B2C, HOLIDAY_FOR_BOTH, HOLIDAY_PRICE_MARKUP_FLAT, HOLIDAY_PRICE_MARKUP_PER, HOLIDAY_SERVICE_TYPE_EXCLUDE, HOLIDAY_SERVICE_TYPE_INCLUDE, HOLIDAY_TYPE_DOMESTIC, HOLIDAY_TYPE_INTERNATIONAL } from "../../../../utils/miscellaneous/holidayConstants";

export class AdminHolidayValidator {

    private createPricingSchema = Joi.object({
        price_for: Joi.string().valid(HOLIDAY_FOR_AGENT, HOLIDAY_FOR_B2C).required(),
        adult_price: Joi.number().required(),
        child_price: Joi.number().required(),
        markup_price: Joi.number().optional(),
        markup_type: Joi.string().valid(HOLIDAY_PRICE_MARKUP_FLAT, HOLIDAY_PRICE_MARKUP_PER).optional()
    });

    private createItinerarySchema = Joi.object({
        day_number: Joi.number().required(),
        title: Joi.string().required(),
        details: Joi.string().optional()
    });

    private createServiceSchema = Joi.object({
        type: Joi.string().valid(HOLIDAY_SERVICE_TYPE_INCLUDE, HOLIDAY_SERVICE_TYPE_EXCLUDE).required(),
        title: Joi.string().required()
    });

    public createHolidaySchema = Joi.object({
        slug: Joi.string().required().max(1000),
        city_id: Joi.alternatives()
            .try(
                Joi.array().items(Joi.number()).min(1).required(),
                Joi.string().custom((value, helpers) => {
                    try {
                        const parsed = JSON.parse(value);
                        return parsed;
                    } catch (error) {
                        return helpers.error("any.invalid");
                    }
                })
            ).required(),
        title: Joi.string().required().max(1000),
        details: Joi.string().required(),
        holiday_type: Joi.string().valid(HOLIDAY_TYPE_DOMESTIC, HOLIDAY_TYPE_INTERNATIONAL).required(),
        duration: Joi.number().required(),
        valid_till_date: Joi.string().optional().regex(/^\d{4}-\d{2}-\d{2}$/),
        group_size: Joi.number().optional(),
        cancellation_policy: Joi.string().optional(),
        tax_details: Joi.string().optional(),
        general_condition: Joi.string().optional(),
        holiday_for: Joi.string().valid(HOLIDAY_FOR_AGENT, HOLIDAY_FOR_B2C, HOLIDAY_FOR_BOTH).required(),
        pricing: Joi.alternatives()
            .try(
                Joi.array().items(this.createPricingSchema).required(),
                Joi.string().custom((value, helpers) => {
                    try {
                        const parsed = JSON.parse(value);
                        return parsed;
                    } catch (error) {
                        return helpers.error("any.invalid");
                    }
                })
            )
            .required()
            .custom((value, helpers) => {
                const holidayFor = helpers.state.ancestors[0].holiday_for;
                const priceForList = value.map((p: { price_for: any }) => p.price_for);

                if (holidayFor === HOLIDAY_FOR_AGENT) {
                    if (value.length !== 1 || priceForList[0] !== HOLIDAY_FOR_AGENT) {
                        return helpers.error("any.invalid", {
                            message: "Only one 'AGENT' pricing is allowed for holiday_for = 'AGENT'",
                        });
                    }
                }

                if (holidayFor === HOLIDAY_FOR_B2C) {
                    if (value.length !== 1 || priceForList[0] !== HOLIDAY_FOR_B2C) {
                        return helpers.error("any.invalid", {
                            message: "Only one 'B2C' pricing is allowed for holiday_for = 'B2C'",
                        });
                    }
                }

                if (holidayFor === HOLIDAY_FOR_BOTH) {
                    const hasAgent = priceForList.includes(HOLIDAY_FOR_AGENT);
                    const hasB2C = priceForList.includes(HOLIDAY_FOR_B2C);

                    if (!(hasAgent && hasB2C)) {
                        return helpers.error("any.invalid", {
                            message: "'AGENT' and 'B2C' pricing must both be present for holiday_for = 'BOTH'",
                        });
                    }

                    if (value.length > 2) {
                        return helpers.error("any.invalid", {
                            message: "Only two pricing entries allowed for holiday_for = 'BOTH'",
                        });
                    }
                }

                return value;
            }),

        itinerary: Joi.alternatives()
            .try(
                Joi.array().items(this.createItinerarySchema).required(),
                Joi.string().custom((value, helpers) => {
                    try {
                        return JSON.parse(value);
                    } catch (error) {
                        return helpers.error("any.invalid");
                    }
                })
            )
            .required(),

        services: Joi.alternatives()
            .try(
                Joi.array().items(this.createServiceSchema).required(),
                Joi.string().custom((value, helpers) => {
                    try {
                        return JSON.parse(value);
                    } catch (error) {
                        return helpers.error("any.invalid");
                    }
                })
            )
            .required(),
    });


    public getHolidayPackageListSchema = Joi.object({
        city_id: Joi.number().optional(),
        holiday_for: Joi.string().valid(HOLIDAY_FOR_AGENT, HOLIDAY_FOR_B2C, HOLIDAY_FOR_BOTH).optional(),
        date: Joi.string().optional().regex(/^\d{4}-\d{2}-\d{2}$/),
        status: Joi.boolean().optional(),
        limit: Joi.number().optional(),
        skip: Joi.number().optional(),
    });


    public updateHolidaySchema = Joi.object({
        slug: Joi.string().optional().max(1000),
        city: Joi.alternatives()
            .try(
                Joi.object({
                    add: Joi.array().items(Joi.number()).optional(),
                    delete: Joi.array().items(Joi.number()).optional(),
                }).optional(),
                Joi.string().custom((value, helpers) => {
                    try {
                        const parsed = JSON.parse(value);
                        return parsed;
                    } catch (error) {
                        return helpers.error("any.invalid");
                    }
                })
            ).optional(),
        title: Joi.string().optional().max(1000),
        details: Joi.string().optional(),
        holiday_type: Joi.string()
            .valid(HOLIDAY_TYPE_DOMESTIC, HOLIDAY_TYPE_INTERNATIONAL)
            .optional(),
        duration: Joi.number().optional(),
        valid_till_date: Joi.date().iso().optional(),
        group_size: Joi.number().optional(),
        cancellation_policy: Joi.string().optional(),
        tax_details: Joi.string().optional(),
        general_condition: Joi.string().optional(),
        holiday_for: Joi.string()
            .valid(HOLIDAY_FOR_AGENT, HOLIDAY_FOR_B2C, HOLIDAY_FOR_BOTH)
            .optional(),
        status: Joi.boolean().optional(),

        pricing: Joi.alternatives().try(
            Joi.object({
                add: Joi.array().items(this.createPricingSchema).optional(),
                delete: Joi.array().items(Joi.number()).optional(),
                update: Joi.array().items(
                    Joi.object({
                        id: Joi.number().required(),
                        price_for: Joi.string().valid(HOLIDAY_FOR_AGENT, HOLIDAY_FOR_B2C).optional(),
                        adult_price: Joi.number().optional(),
                        child_price: Joi.number().optional(),
                        markup_price: Joi.number().optional(),
                        markup_type: Joi.string()
                            .valid(HOLIDAY_PRICE_MARKUP_FLAT, HOLIDAY_PRICE_MARKUP_PER)
                            .optional(),
                    })
                ).optional(),
            }),
            Joi.string().custom((value, helpers) => {
                try {
                    return JSON.parse(value);
                } catch {
                    return helpers.error("any.invalid");
                }
            })
        ).optional(),

        itinerary: Joi.alternatives().try(
            Joi.object({
                add: Joi.array().items(this.createItinerarySchema).optional(),
                delete: Joi.array().items(Joi.number()).optional(),
                update: Joi.array().items(
                    Joi.object({
                        id: Joi.number().required(),
                        day_number: Joi.number().optional(),
                        title: Joi.string().optional(),
                        details: Joi.string().optional(),
                    })
                ).optional(),
            }),
            Joi.string().custom((value, helpers) => {
                try {
                    return JSON.parse(value);
                } catch {
                    return helpers.error("any.invalid");
                }
            })
        ).optional(),

        services: Joi.alternatives().try(
            Joi.object({
                add: Joi.array().items(this.createServiceSchema).optional(),
                delete: Joi.array().items(Joi.number()).optional(),
                update: Joi.array().items(
                    Joi.object({
                        id: Joi.number().required(),
                        type: Joi.string().valid(HOLIDAY_SERVICE_TYPE_INCLUDE, HOLIDAY_SERVICE_TYPE_EXCLUDE).optional(),
                        title: Joi.string().optional(),
                    })
                ).optional(),
            }),
            Joi.string().custom((value, helpers) => {
                try {
                    return JSON.parse(value);
                } catch {
                    return helpers.error("any.invalid");
                }
            })
        ).optional(),

        delete_images: Joi.alternatives().try(
            Joi.array().items(Joi.number()),
            Joi.string().custom((value, helpers) => {
                try {
                    return JSON.parse(value);
                } catch {
                    return helpers.error("any.invalid");
                }
            })
        ).optional(),
    });



}