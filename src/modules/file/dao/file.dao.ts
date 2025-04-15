import pg from "pg";
import { PgPool } from "infrastructures/database/pg/pgPool";

export class FileDao {
  private pool: pg.Pool;
  constructor() {
    this.pool = PgPool.getInstance();
  }

  async getById(params: GetByIdParams): Promise<GetByIdResult> {
    const result = await this.pool.query<{
      id: string;
      posting_id: string;
      url: string;
      filename: string;
      mimetype: string;
      file_size: number;
      upload_at: Date;
    }>(
      `SELECT f.id, f.posting_id, f.url, f.filename, f.mimetype, f.file_size, f.upload_at 
      FROM "files" as f
      WHERE f.id = $1
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
      postingId: resultRow.posting_id,
      url: resultRow.url,
      filename: resultRow.filename,
      mimetype: resultRow.mimetype,
      fileSize: resultRow.file_size,
      uploadAt: resultRow.upload_at,
    };
  }

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
    await this.pool.query(
      `DELETE FROM "files"
      USING "postings" AS p
      WHERE "files".posting_id = p.id
        AND "files".id = $1
        AND p.id = $2
        AND p.user_id = $3;`,
      [params.id, params.postingId, params.userId]
    );
  }
}

type GetByIdParams = { id: string };

type GetByIdResult = {
  id: string;
  postingId: string;
  url: string;
  filename: string;
  mimetype: string;
  fileSize: number;
  uploadAt: Date;
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

type DeleteParams = { id: string; postingId: string; userId: string };
