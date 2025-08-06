export interface ICreateBlogPayload {
  title: string;
  summary?: string;
  content: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  cover_image: string;
  source_type: string;
  source_id: string;
  blog_for: string;
}

export interface ISingleBlogPostQuery {
  blog_id?: number;
  slug?: string;
  source_type: string;
  source_id: number;
  is_deleted: boolean;
}

export interface IGetBlogListQuery {
  limit: number;
  skip: number;
  status?: boolean;
  filter?: string;
  source_type?: string;
  source_id?: number;
  is_deleted?: boolean;
}

export interface IGetBlogListPayload{
    id:number,
    title: string,
    summary: string,
    cover_image: string,
    status: boolean,
    created_at: string
}

export interface IGetBlogListPayloadWithTotal{
    data:IGetBlogListPayload[],
    total:number
}


export interface IGetSingleBlogPayload {
  id: number;
  title: string;
  summary: string;
  content: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  cover_image: string;
  blog_for: string;
  status: boolean;
}


export interface IUpdateBlogPayload{
    title?: string;
    summary?: string;
    content?: string;
    slug?: string;
    meta_title?: string;
    meta_description?: string;
    cover_image?: string;
    blog_for?: string;
    status?: boolean;
    is_deleted?: boolean
}