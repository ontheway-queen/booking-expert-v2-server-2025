"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubSiteConfigValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AgentB2CSubSiteConfigValidator {
    constructor() {
        this.SiteConfigEmail = joi_1.default.array().min(1).items({
            email: joi_1.default.string().email().lowercase().trim().required(),
        });
        this.SiteConfigPhone = joi_1.default.array().min(1).items({
            number: joi_1.default.string().trim().required(),
        });
        this.SiteConfigAddres = joi_1.default.object({
            title: joi_1.default.string().required().trim(),
            address: joi_1.default.string().required().trim(),
        });
        this.updateSiteConfig = joi_1.default.object({
            hero_quote: joi_1.default.string().trim().optional(),
            hero_sub_quote: joi_1.default.string().trim().optional(),
            site_name: joi_1.default.string().trim().optional(),
            meta_title: joi_1.default.string().trim().optional(),
            meta_description: joi_1.default.string().trim().optional(),
            meta_tags: joi_1.default.string().trim().optional(),
            notice: joi_1.default.string().trim().optional(),
            android_app_link: joi_1.default.string().trim().optional(),
            ios_app_link: joi_1.default.string().trim().optional(),
            emails: joi_1.default.string()
                .custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    const { error } = this.SiteConfigEmail.validate(parsed);
                    if (error) {
                        return helpers.error("any.invalid", {
                            message: error.details.map((d) => d.message).join(", "),
                        });
                    }
                    return parsed;
                }
                catch (err) {
                    return helpers.error("any.invalid", {
                        message: "Invalid JSON in contact field",
                    });
                }
            })
                .optional(),
            numbers: joi_1.default.string()
                .custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    const { error } = this.SiteConfigPhone.validate(parsed);
                    if (error) {
                        return helpers.error("any.invalid", {
                            message: error.details.map((d) => d.message).join(", "),
                        });
                    }
                    return parsed;
                }
                catch (err) {
                    return helpers.error("any.invalid", {
                        message: "Invalid JSON in contact field",
                    });
                }
            })
                .optional(),
            address: joi_1.default.string()
                .custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    const { error } = this.SiteConfigAddres.validate(parsed);
                    if (error) {
                        return helpers.error("any.invalid", {
                            message: error.details.map((d) => d.message).join(", "),
                        });
                    }
                    return parsed;
                }
                catch (err) {
                    return helpers.error("any.invalid", {
                        message: "Invalid JSON in contact field",
                    });
                }
            })
                .optional(),
        });
        this.updateAboutUs = joi_1.default.object({
            content: joi_1.default.string().optional(),
        });
        this.updateContactUs = joi_1.default.object({
            content: joi_1.default.string().optional(),
        });
        this.updatePrivacyPolicy = joi_1.default.object({
            content: joi_1.default.string().optional(),
        });
        this.updateTermsAndConditions = joi_1.default.object({
            content: joi_1.default.string().optional(),
        });
        this.createSocialLinks = joi_1.default.object({
            media: joi_1.default.string().required().trim(),
            link: joi_1.default.string().required().trim(),
        });
        this.updateSocialLinks = joi_1.default.object({
            media: joi_1.default.string().optional().trim(),
            link: joi_1.default.string().optional().trim(),
            status: joi_1.default.boolean().optional(),
            order_number: joi_1.default.number().optional(),
        });
        this.upSertPopUpBanner = joi_1.default.object({
            title: joi_1.default.string().optional().trim(),
            link: joi_1.default.string().optional().trim(),
            status: joi_1.default.boolean().optional(),
            description: joi_1.default.string().optional().trim(),
            pop_up_for: joi_1.default.string().valid("AGENT", "B2C").required(),
        });
    }
}
exports.AgentB2CSubSiteConfigValidator = AgentB2CSubSiteConfigValidator;
