export interface ICreateBlogPayload {
  title: string;
  summary?: string;
  content: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  cover_image: string;
  source_type: string;
  source_id?: number;
  created_by: number;
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

export interface IGetBlogListPayload {
  id: number;
  title: string;
  summary: string;
  cover_image: string;
  status: boolean;
  created_at: string;
}

export interface IGetBlogListPayloadWithTotal {
  data: IGetBlogListPayload[];
  total: number;
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

export interface IUpdateBlogPayload {
  title?: string;
  summary?: string;
  content?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  cover_image?: string;
  blog_for?: string;
  status?: boolean;
  is_deleted?: boolean;
}

export interface IAgentB2CBlogListQuery {
  source_id: number;
  is_deleted?: boolean;
  status?: boolean;
}

export interface IGetAgentB2CBlogListPayload {
  id: number;
  title: string;
  summary: string;
  cover_image: string;
  slug: boolean;
  created_date: string;
}

export interface IGetSingleAgentB2CBlogQuery {
  source_id: number;
  status: boolean;
  slug: string;
  is_deleted?: boolean;
}

export interface GetSingleAgentB2CBlogPayload {
  title: string;
  summary: string;
  content: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  cover_image: string;
  created_date: Date;
  author: string;
  author_photo: string;
}
