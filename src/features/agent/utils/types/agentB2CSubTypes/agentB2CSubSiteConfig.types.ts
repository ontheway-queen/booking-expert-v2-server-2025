export interface IAgencyB2CSubUpdateSiteConfigReqBody {
  hero_quote?: string;
  hero_sub_quote?: string;
  site_name?: string;
  emails?: IUpdateSiteConfigEmailReqBody[];
  numbers?: IUpdateSiteConfigNumberReqBody[];
  address?: IUpdateSiteConfigAddressReqBody;
  meta_title?: string;
  meta_description?: string;
  meta_tags?: string;
  notice?: string;
  android_app_link?: string;
  ios_app_link?: string;
}

export interface IUpdateSiteConfigEmailReqBody {
  email: string;
}

export interface IUpdateSiteConfigNumberReqBody {
  number: string;
}

export interface IUpdateSiteConfigAddressReqBody {
  title: string;
  address: string;
}
