import { SLUG_TYPE_BLOG, SLUG_TYPE_HOLIDAY, SLUG_TYPE_UMRAH } from "../../../../utils/miscellaneous/constants";

export interface ICheckSlug {
    slug: string;
    type: typeof SLUG_TYPE_HOLIDAY | typeof SLUG_TYPE_UMRAH | typeof SLUG_TYPE_BLOG;
}