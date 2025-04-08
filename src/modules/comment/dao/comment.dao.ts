import { PgPool } from "infrastructures/database/pg/pgPool";
import pg from "pg";
import { CommentEntity } from "./entities/comment.entity";

export class CommentDao {
  private readonly pool: pg.Pool;
  constructor() {
    this.pool = PgPool.getInstance();
  }

  getByPostingId = async (
    params: GetByPostingIdParams
  ): Promise<GetByPostingIdResult> => {
    const result = await this.pool.query<{
      id: string;
      content: string;
      user_id: string;
      user_user_id: string;
      posting_id: string;
      parent_comment_id: string | undefined;
      created_at: Date;
      updated_at: Date;
    }>(
      `SELECT c.id, c.content, c.created_at, c.updated_at, c.parent_comment_id, u.id as user_id, u.user_id as user_user_id
      FROM "comments" as c  
      JOIN "users" as u
      ON c.user_id = u.id   
      WHERE c.posting_id = $1 AND c.parent_comment_id IS NULL
      `,
      [params.postingId]
    );

    return result.rows.map((resultRow) => ({
      id: resultRow.id,
      content: resultRow.content,
      user: {
        id: resultRow.user_id,
        userId: resultRow.user_user_id,
      },
      createdAt: resultRow.created_at,
      updatedAt: resultRow.updated_at,
      postingId: resultRow.posting_id,
      parentId: resultRow.parent_comment_id,
    }));
  };

  getByParentId = async (
    params: GetByParentIdParams
  ): Promise<GetByParentIdResult> => {
    console.log("params", params);
    const result = await this.pool.query<{
      id: string;
      content: string;
      user_id: string;
      user_user_id: string;
      posting_id: string;
      parent_comment_id: string | undefined;
      created_at: Date;
      updated_at: Date;
    }>(
      `SELECT c.id, c.content, c.created_at, c.updated_at, u.id as user_id, u.user_id as user_user_id
      FROM "comments" as c  
      JOIN "users" as u
      ON c.user_id = u.id   
      WHERE c.parent_comment_id = $1 
      `,
      [params.parentId]
    );

    return result.rows.map((resultRow) => ({
      id: resultRow.id,
      content: resultRow.content,
      user: {
        id: resultRow.user_id,
        userId: resultRow.user_user_id,
      },
      createdAt: resultRow.created_at,
      updatedAt: resultRow.updated_at,
      postingId: resultRow.posting_id,
      parentId: resultRow.parent_comment_id,
    }));
  };

  create = async (params: CreateParams) => {
    await this.pool.query(
      `INSERT INTO "comments" (content, user_id, posting_id, parent_comment_id) VALUES ($1, $2, $3, $4)`,
      [params.content, params.userId, params.postingId, params.parentId]
    );
  };

  update = async (params: UpdateParams) => {
    await this.pool.query(
      `UPDATE "comments" SET content = $1 WHERE id = $2 AND user_id = $3`,
      [params.content, params.id, params.userId]
    );
  };

  delete = async (params: DeleteParams) => {
    await this.pool.query(
      `DELETE FROM "comments" WHERE id = $1 AND user_id = $2`,
      [params.id, params.userId]
    );
  };
}

type GetByPostingIdParams = { postingId: string };
type GetByPostingIdResult = CommentEntity[];

type GetByParentIdParams = { parentId: string };
type GetByParentIdResult = CommentEntity[];

type CreateParams = {
  userId: string;
  content: string;
  postingId: string;
  parentId: string | undefined;
};

type UpdateParams = {
  id: string;
  userId: string;
  content: string;
};

type DeleteParams = {
  id: string;
  userId: string;
};
