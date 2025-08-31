import Joi from 'joi';

export class AgentB2CSubSiteConfigValidator {
  private SiteConfigEmail = Joi.array().min(1).items({
    email: Joi.string().email().lowercase().trim().required(),
  });

  private SiteConfigPhone = Joi.array().min(1).items({
    number: Joi.string().trim().required(),
  });

  private SiteConfigAddress = Joi.array().min(1).items({
    title: Joi.string().required().trim(),
    address: Joi.string().required().trim(),
  });

  public updateSiteConfig = Joi.object({
    hero_quote: Joi.string().trim().optional(),
    hero_sub_quote: Joi.string().trim().optional(),
    site_name: Joi.string().trim().optional(),
    meta_title: Joi.string().trim().optional(),
    meta_description: Joi.string().trim().optional(),
    meta_tags: Joi.string().trim().optional(),
    notice: Joi.string().trim().allow('').optional(),
    android_app_link: Joi.string().trim().optional(),
    ios_app_link: Joi.string().trim().optional(),
    show_developer: Joi.boolean().optional(),
    developer_name: Joi.string().trim().optional(),
    developer_link: Joi.string().trim().optional(),
    emails: Joi.string()
      .custom((value, helpers) => {
        try {
          console.log({ value });
          const parsed = JSON.parse(value);
          console.log({ parsed });
          const { error } = this.SiteConfigEmail.validate(parsed);
          if (error) {
            return helpers.error('any.invalid', {
              message: error.details.map((d) => d.message).join(', '),
            });
          }

          return parsed;
        } catch (err) {
          return helpers.error('any.invalid', {
            message: 'Invalid JSON in contact field',
          });
        }
      })
      .optional(),
    numbers: Joi.string()
      .custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);
          const { error } = this.SiteConfigPhone.validate(parsed);
          if (error) {
            return helpers.error('any.invalid', {
              message: error.details.map((d) => d.message).join(', '),
            });
          }

          return parsed;
        } catch (err) {
          return helpers.error('any.invalid', {
            message: 'Invalid JSON in contact field',
          });
        }
      })
      .optional(),
    address: Joi.string()
      .custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);
          const { error } = this.SiteConfigAddress.validate(parsed);
          if (error) {
            return helpers.error('any.invalid', {
              message: error.details.map((d) => d.message).join(', '),
            });
          }

          return parsed;
        } catch (err) {
          return helpers.error('any.invalid', {
            message: 'Invalid JSON in contact field',
          });
        }
      })
      .optional(),
  });

  public updateAboutUs = Joi.object({
    content: Joi.string().optional(),
  });

  public updateContactUs = Joi.object({
    content: Joi.string().optional(),
  });

  public updatePrivacyPolicy = Joi.object({
    content: Joi.string().optional(),
  });

  public updateTermsAndConditions = Joi.object({
    content: Joi.string().optional(),
  });

  public createSocialLinks = Joi.object({
    social_media_id: Joi.number().required(),
    link: Joi.string().required().trim(),
  });

  public updateSocialLinks = Joi.object({
    social_media_id: Joi.number().optional(),
    link: Joi.string().optional().trim(),
    status: Joi.boolean().optional(),
    order_number: Joi.number().optional(),
  });

  public upSertPopUpBanner = Joi.object({
    title: Joi.string().optional().trim(),
    link: Joi.string().optional().trim(),
    status: Joi.boolean().optional(),
    description: Joi.string().optional().trim(),
    pop_up_for: Joi.string().valid('AGENT', 'B2C').required(),
  });
}
