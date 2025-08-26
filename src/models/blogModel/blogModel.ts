import { TDB } from '../../features/public/utils/types/publicCommon.types';
import {
  BLOG_FOR_B2C,
  BLOG_FOR_BOTH,
} from '../../utils/miscellaneous/blogConstants';
import { DATA_LIMIT, SOURCE_AGENT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  GetSingleAgentB2CBlogPayload,
  IAgentB2CBlogListQuery,
  ICreateBlogPayload,
  IGetAgentB2CBlogListPayload,
  IGetBlogListPayloadWithTotal,
  IGetBlogListQuery,
  IGetSingleAgentB2CBlogQuery,
  IGetSingleBlogPayload,
  ISingleBlogPostQuery,
  IUpdateBlogPayload,
} from '../../utils/modelTypes/blogModelTypes/blogModelTypes';

export default class BlogModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createBlog(payload: ICreateBlogPayload) {
    return await this.db('blog')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload);
  }

  public async getSingleBlogPost(
    query: ISingleBlogPostQuery
  ): Promise<IGetSingleBlogPayload | null> {
    const { is_deleted = false } = query;
    return await this.db('blog')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'id',
        'title',
        'content',
        'summary',
        'slug',
        'meta_title',
        'meta_description',
        'cover_image',
        'status'
      )
      .where((qb) => {
        qb.andWhere('source_id', query.source_id);
        qb.andWhere('source_type', query.source_type);
        qb.andWhere('is_deleted', is_deleted);

        if (query.slug) {
          qb.andWhere('slug', query.slug);
        }

        if (query.blog_id) {
          qb.andWhere('id', query.blog_id);
        }
      })
      .first();
  }

  public async getBlogList(
    query: IGetBlogListQuery
  ): Promise<IGetBlogListPayloadWithTotal> {
    const { is_deleted = false } = query;
    const result = await this.db('blog as b')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'b.id',
        'b.title',
        'b.summary',
        'b.cover_image',
        'b.status',
        'b.created_at'
      )
      .where((qb) => {
        qb.andWhere('b.source_id', query.source_id);
        qb.andWhere('b.source_type', query.source_type);
        qb.andWhere('b.is_deleted', is_deleted);

        if (query.status !== undefined) {
          qb.andWhere('b.status', query.status);
        }

        if (query.filter) {
          qb.andWhere('b.title', 'like', `%${query.filter}%`).orWhere(
            'b.summary',
            'like',
            `%${query.filter}%`
          );
        }
      })
      .orderBy('id', 'desc')
      .limit(query.limit || 100)
      .offset(query.skip || 0);

    const total = await this.db('blog as b')
      .withSchema(this.SERVICE_SCHEMA)
      .count('b.id as total')
      .where((qb) => {
        qb.andWhere('b.source_id', query.source_id);
        qb.andWhere('b.source_type', query.source_type);
        qb.andWhere('b.is_deleted', is_deleted);

        if (query.status !== undefined) {
          qb.andWhere('b.status', query.status);
        }

        if (query.filter) {
          qb.andWhere('b.title', 'like', `%${query.filter}%`).orWhere(
            'b.summary',
            'like',
            `%${query.filter}%`
          );
        }
      });

    return { data: result, total: Number(total[0].total) };
  }

  public async updateBlog(payload: IUpdateBlogPayload, blog_id: number) {
    return await this.db('blog')
      .withSchema(this.SERVICE_SCHEMA)
      .update(payload)
      .where('id', blog_id);
  }

  public async getAgentB2CBlogList(
    query: IAgentB2CBlogListQuery
  ): Promise<{ data: IGetAgentB2CBlogListPayload[]; total: number }> {
    const { is_deleted = false } = query;
    const data = await this.db('blog as b')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'b.id',
        'b.title',
        'b.summary',
        'b.cover_image',
        'b.slug',
        'b.created_at as created_date'
      )
      .where((qb) => {
        qb.andWhere('b.source_type', SOURCE_AGENT);
        qb.andWhere('b.source_id', query.source_id);
        qb.andWhere('b.is_deleted', is_deleted);
        if (query.status !== undefined) {
          qb.andWhere('b.status', query.status);
        }
      })
      .limit(Number(query.limit) || DATA_LIMIT)
      .offset(Number(query.skip) || 0);

    const total = await this.db('blog')
      .withSchema(this.SERVICE_SCHEMA)
      .count('id as total')
      .where((qb) => {
        qb.andWhere('source_type', SOURCE_AGENT);
        qb.andWhere('source_id', query.source_id);
        qb.andWhere('is_deleted', is_deleted);
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
      });

    return { data, total: Number(total[0].total) || 0 };
  }

  public async getSingleAgentB2CBlog(
    query: IGetSingleAgentB2CBlogQuery
  ): Promise<GetSingleAgentB2CBlogPayload | null> {
    const { is_deleted = false } = query;
    return await this.db('services.blog as b')
      .select(
        'b.title',
        'b.summary',
        'b.content',
        'b.slug',
        'b.meta_title',
        'b.meta_description',
        'b.cover_image',
        'b.created_at as created_date',
        'au.name as author',
        'au.photo as author_photo'
      )
      .where((qb) => {
        qb.andWhere('b.source_type', SOURCE_AGENT);
        qb.andWhere('b.source_id', query.source_id);
        qb.andWhere('b.is_deleted', is_deleted);

        if (query.status !== undefined) {
          qb.andWhere('b.status', query.status);
        }

        if (query.slug) {
          qb.andWhere('b.slug', query.slug);
        }
      })
      .leftJoin('agent.agency_user as au', 'au.id', 'b.created_by')
      .first();
  }
}
