import pg from "pg";
import { PgPool } from "infrastructures/database/pg/pgPool";

export class FileDao {
  private pool: pg.Pool;
  constructor() {
    this.pool = PgPool.getInstance();
  }

  // async getById(params: GetByIdParams): Promise<GetByIdResult> {
  //   const result = await this.pool.query<{
  //     id: string;
  //     title: string;
  //     content: string;
  //     user_id: string;
  //     user_user_id: string;
  //     created_at: Date;
  //     updated_at: Date;
  //   }>(
  //     `SELECT p.id, p.title, p.content, p.created_at, p.updated_at, u.id as user_id, u.user_id as user_user_id
  //     FROM "postings" as p
  //     JOIN "users" as u
  //     ON p.user_id = u.id
  //     WHERE p.id = $1
  //     `,
  //     [params.id]
  //   );

  //   console.log("getByIdResult", result.rows);

  //   if (result.rows.length === 0) {
  //     throw new Error("No posting found");
  //   }

  //   const resultRow = result.rows[0];
  //   return {
  //     id: resultRow.id,
  //     title: resultRow.title,
  //     content: resultRow.content,
  //     user: {
  //       id: resultRow.user_id,
  //       userId: resultRow.user_user_id,
  //     },
  //     createdAt: resultRow.created_at,
  //     updatedAt: resultRow.updated_at,
  //   };
  // }

  async create(params: CreateParams) {
    if (params.files.length === 0) {
      return;
    }

    let valuesClause = "";
    let values: (string | number)[] = [];

    params.files.forEach((file, index) => {
      if (index > 0) {
        valuesClause += ",";
      }
      valuesClause += `($${index * 5 + 1}, $${index * 5 + 2}, $${
        index * 5 + 3
      }, $${index * 5 + 4}, $${index * 5 + 5})`;
      values.push(
        params.postingId,
        file.url,
        file.filename,
        file.mimetype,
        file.fileSize
      );
    });

    const query = `INSERT INTO "files" (posting_id, url, filename, mimetype, file_size) VALUES ${valuesClause}`;
    console.log("query", query);
    await this.pool.query(query, values);
  }

  async delete(params: DeleteParams) {
    await this.pool.query(`DELETE FROM "files" where id=$1`, [params.id]);
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

type CreateParams = {
  postingId: string;
  files: {
    url: string;
    filename: string;
    mimetype: string;
    fileSize: number;
  }[];
};

type DeleteParams = { id: string };
