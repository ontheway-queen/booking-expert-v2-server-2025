export interface IAgencyB2CSubUpdateSiteConfigReqBody {
  hero_quote?: string;
  hero_sub_quote?: string;
  site_name?: string;
  emails?: IUpdateSiteConfigEmailReqBody;
  numbers?: IUpdateSiteConfigNumberReqBody;
  addresses?: IUpdateSiteConfigAddressReqBody;
  meta_title?: string;
  meta_description?: string;
  meta_tags?: string;
  notice?: string;
  android_app_link?: string;
  ios_app_link?: string;
}

export interface IUpdateSiteConfigEmailReqBody {
  emails: { email: string }[];
}

export interface IUpdateSiteConfigNumberReqBody {
  numbers: { number: string }[];
}

export interface IUpdateSiteConfigAddressReqBody {
  addresses: { title: string; address: string }[];
}
