import pg, { QueryConfigValues } from "pg";
import { CommentEntity } from "modules/comment/entity/comment.entity";
import { PgPool } from "infrastructures/database/pg/pgPool";

export class PostingDao {
  private pool: pg.Pool;
  constructor() {
    this.pool = PgPool.getInstance();
  }

  async getById(params: GetByIdParams) {
    // TODO 작동확인해보고 구현해야할듯.. 잘모르겟어
    const result = await this.pool.query<GetByIdResult>(
      `SELECT id, title, content, user.id as user_id, user.user_id as user_user_id, created_at, updated_at, files, comments,
      
      from "postings" as p 
      WHERE id = $1 
      JOIN "comments" as c 
      ON p.id = c.posting_id
      JOIN "users" as u 
      ON p.user_id = u.id
      `,
      [params.id]
    );

    console.log("getByIdResult", result);

    // return {
    //   id :result.id,
    //   title :result.title,
    //   content :result.content,
    //   user :result.user,
    //   createdAt :result.createdAt,
    //   updatedAt :result.updatedAt,
    //   files :result.files,
    //   comments :result.comments,
    // }
  }

  // TODO 페이지네이션
  async getPage(params: GetPageParams) {}

  async create(params: CreateParams) {
    await this.pool.query(
      `INSERT INTO "postings" (title, content, user_id) VALUES ($1, $2, $3)`,
      [params.title, params.content, params.userId]
    );
  }

  async update(params: UpdateParams) {
    const columnForUpdate: { columnName: string; value: unknown }[] = [];

    if (params.title) {
      columnForUpdate.push({ columnName: "title", value: params.title });
    }

    if (params.content) {
      columnForUpdate.push({ columnName: "content", value: params.content });
    }

    const queryForSet = columnForUpdate.reduce(
      (query, columnInfo, idx) =>
        (query += `"${columnInfo.columnName}"=$${idx + 1}${
          idx === columnForUpdate.length - 1 ? "" : ","
        }`),
      ""
    );

    const values = columnForUpdate.map((columnInfo) => columnInfo.value);

    const updatingColumnLength: number = columnForUpdate.length;

    await this.pool.query(
      `UPDATE "postings" SET ${queryForSet} WHERE id=$${
        updatingColumnLength + 1
      } AND user_id=$${updatingColumnLength + 2}`,
      [...values, params.id, params.userId]
    );
  }

  async delete(params: DeleteParams) {
    await this.pool.query(`DELETE FROM "postings" where id=$1 AND user_id=$2`, [
      params.id,
      params.userId,
    ]);
  }
}

type GetByIdParams = { id: string };

type GetByIdResultComment = CommentEntity;

type GetByIdResultUser = {
  id: string;
  userId: string;
};

type GetByIdResult = {
  id: string;
  title: string;
  content: string;
  user: GetByIdResultUser;
  createdAt: Date;
  updatedAt: Date;
  files: File[];
  comments: GetByIdResultComment[];
};

type GetPageParams = {};
type GetPageResult = {};

type CreateParams = { title: string; content: string; userId: string };
type UpdateParams = {
  id: string;
  userId: string;
  title: string | null | undefined;
  content: string | null | undefined;
};
type DeleteParams = { id: string; userId: string };
