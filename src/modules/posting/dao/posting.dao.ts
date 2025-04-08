import pg from "pg";
import { PgPool } from "infrastructures/database/pg/pgPool";

export class PostingDao {
  private pool: pg.Pool;
  constructor() {
    this.pool = PgPool.getInstance();
  }

  async getById(params: GetByIdParams): Promise<GetByIdResult> {
    const result = await this.pool.query<{
      id: string;
      title: string;
      content: string;
      user_id: string;
      user_user_id: string;
      created_at: Date;
      updated_at: Date;
    }>(
      `SELECT p.id, p.title, p.content, p.created_at, p.updated_at, u.id as user_id, u.user_id as user_user_id
      FROM "postings" as p  
      JOIN "users" as u
      ON p.user_id = u.id   
      WHERE p.id = $1 
      `,
      [params.id]
    );

    console.log("getByIdResult", result.rows);

    if (result.rows.length === 0) {
      throw new Error("No posting found");
    }

    const resultRow = result.rows[0];
    return {
      id: resultRow.id,
      title: resultRow.title,
      content: resultRow.content,
      user: {
        id: resultRow.user_id,
        userId: resultRow.user_user_id,
      },
      createdAt: resultRow.created_at,
      updatedAt: resultRow.updated_at,
    };
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
