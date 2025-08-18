export interface ICreateBlogPayloadReqBody {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  meta_title: string;
  meta_description: string;
}
