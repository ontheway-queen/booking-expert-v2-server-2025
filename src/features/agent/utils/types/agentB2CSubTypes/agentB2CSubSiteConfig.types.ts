export interface IAgencyB2CSubUpdateSiteConfigReqBody {
  hero_quote?: string;
  hero_sub_quote?: string;
  site_name?: string;
  emails?: { email: string }[];
  numbers?: { number: string }[];
  address?: { title: string; address: string }[];
  meta_title?: string;
  meta_description?: string;
  meta_tags?: string;
  notice?: string;
  android_app_link?: string;
  ios_app_link?: string;
  show_developer?: boolean;
  developer_name?: string;
  developer_link?: string;
}
