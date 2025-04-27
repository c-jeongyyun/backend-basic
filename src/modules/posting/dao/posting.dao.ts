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
      file_id: string;
      filename: string;
      file_size: number;
      upload_at: Date;
      mimetype: string;
    }>(
      `SELECT p.id, p.title, p.content, p.created_at, p.updated_at, u.id as user_id, u.user_id as user_user_id, f.id as file_id, f.filename, f.file_size, f.upload_at, f.mimetype 
      FROM "postings" as p  
      JOIN "users" as u
      ON p.user_id = u.id   
      JOIN "files" as f
      ON p.id = f.posting_id
      WHERE p.id = $1 
      `,
      [params.id]
    );

    console.log("getByIdResult", result.rows);
    const files = result.rows.map((resultRow) => ({
      id: resultRow.file_id,
      postingId: resultRow.id,
      filename: resultRow.filename,
      mimetype: resultRow.mimetype,
      fileSize: resultRow.file_size,
      uploadAt: resultRow.upload_at,
    }));

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
      files,
    };
  }

  async getPage(params: GetPageParams): Promise<GetPageResult> {
    let decodedCursor: {
      // 디코딩된 커서 타입을 명시적으로 정의 (필요에 따라 조정)
      id: string;
      title: string;
      createdAt: Date; // 디코딩 후 Date 객체로 변환할 수 있음
      updatedAt: Date; // 디코딩 후 Date 객체로 변환할 수 있음
    } | null = null;

    // --- 커서 디코딩 시작 ---
    if (params.cursor) {
      try {
        // 1. Base64 문자열을 Buffer로 변환
        const buffer = Buffer.from(params.cursor, "base64");
        // 2. Buffer를 UTF-8 문자열(원래 JSON 문자열)로 변환
        const jsonString = buffer.toString("utf8");
        // 3. JSON 문자열을 객체로 파싱
        const parsedCursor = JSON.parse(jsonString);
        decodedCursor = {
          id: parsedCursor.id,
          title: parsedCursor.title,
          createdAt: new Date(parsedCursor.createdAt), // Date 객체로 변환
          updatedAt: new Date(parsedCursor.updatedAt), // Date 객체로 변환
        };
      } catch (error) {
        console.error("커서 디코딩 실패:", error);
        // 잘못된 커서 처리: 오류를 발생시키거나, 커서가 없는 것으로 간주
        throw new Error("잘못된 커서 형식입니다.");
      }
    }

    console.log("decodedCursor", decodedCursor);

    // 쿼리 생성 -------------
    let query: string = `SELECT p.id, p.title, p.content, p.created_at, p.updated_at, u.id as user_id, u.user_id as user_user_id
    FROM "postings" as p  
    JOIN "users" as u
    ON p.user_id = u.id `;

    let values = [];

    if (params.sortBy.length > 0) {
      query += "WHERE ";

      if (params.keyword) {
        values.push(`%${params.keyword}%`);

        query += `p.title ILIKE $${values.length} `;

        if (decodedCursor) {
          query += `AND `;
        }
      }

      const sortInfos: {
        columnKey: "title" | "created_at" | "updated_at";
        itemKey: "title" | "createdAt" | "updatedAt";
        orderBy: "ASC" | "DESC";
      }[] = params.sortBy.map((sortByItem) => {
        switch (sortByItem.key) {
          case "title":
            return {
              columnKey: "title",
              itemKey: sortByItem.key,
              orderBy: sortByItem.orderBy,
            };
          case "createdAt":
            return {
              columnKey: "created_at",
              itemKey: sortByItem.key,
              orderBy: sortByItem.orderBy,
            };
          case "updatedAt":
            return {
              columnKey: "updated_at",
              itemKey: sortByItem.key,
              orderBy: sortByItem.orderBy,
            };
          default:
            throw new Error("올바른 정렬기준이 아닙니다.");
        }
      });

      console.log("sortInfos", sortInfos);

      sortInfos.forEach((sortInfo, idx) => {
        if (!decodedCursor) return;

        if (idx === 0) {
          query += "(";
        }

        if (idx > 0) {
          query += `AND `;
        }

        if (sortInfo.orderBy === "ASC") {
          values.push(decodedCursor[sortInfo.itemKey]);
          query += `p.${sortInfo.columnKey} > $${values.length} `;
        } else {
          values.push(decodedCursor[sortInfo.itemKey]);
          query += `p.${sortInfo.columnKey} < $${values.length} `;
        }

        if (idx > 0) {
          query += ") ";
        }

        query += `OR `;

        query += `(`;
        for (let i = 0; i <= idx; i++) {
          values.push(decodedCursor[sortInfos[i].itemKey]);
          query += `p.${sortInfos[i].columnKey} = $${values.length} `;
          if (i !== idx) {
            query += `AND `;
          }
        }
        // query += `)`;

        if (idx === sortInfos.length - 1) {
          values.push(decodedCursor.id);

          query += `AND p.id > $${values.length} `;
          query += ")) ";
        }
      });

      let orderByClause = `ORDER BY `;
      sortInfos.forEach((sortInfo, idx) => {
        orderByClause += `p.${sortInfo.columnKey} ${sortInfo.orderBy}`;

        if (idx !== sortInfos.length - 1) {
          orderByClause += ", ";
        }
      });

      orderByClause += ",p.id ASC ";

      query += orderByClause;
    }

    values.push(params.limit);
    query += `LIMIT $${values.length}`;
    // --------------------

    console.log("**query :", query);
    console.log("**values :", values);

    // 쿼리 실행
    const result = await this.pool.query(query, values);

    // 커서 생성
    const resultRows = result.rows;
    console.log("resultRows", resultRows);

    let lastCursor: string | null;

    if (resultRows.length > 0 && resultRows.length === params.limit) {
      const lastRow = resultRows[resultRows.length - 1];

      // 커서 데이터 만들기
      const cursorData = {
        id: lastRow.id,
        title: lastRow.title,
        createdAt: lastRow.created_at,
        updatedAt: lastRow.updated_at,
      };

      // 2. JSON stringify
      const jsonString = JSON.stringify(cursorData);

      // 3. base64 인코딩
      lastCursor = Buffer.from(jsonString, "utf8").toString("base64");
    } else {
      lastCursor = null;
    }

    return {
      postings: resultRows.map((row) => ({
        id: row.id,
        title: row.title,
        content: row.title,
        user: {
          id: row.user_id,
          userId: row.user_user_id,
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      lastCursor,
    };
  }

  async create(params: CreateParams): Promise<void> {
    await this.pool.query(
      `INSERT INTO "postings" (title, content, user_id) VALUES ($1, $2, $3) RETURNING *`,
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
  files: {
    id: string;
    postingId: string;
    filename: string;
    mimetype: string;
    fileSize: number;
    uploadAt: Date;
  }[];
};

type GetPageResultPosting = {
  id: string;
  title: string;
  content: string;
  user: GetByIdResultUser;
  createdAt: Date;
  updatedAt: Date;
};

type GetPageParams = {
  keyword?: string;
  limit: number;
  sortBy: {
    key: "createdAt" | "updatedAt" | "title";
    orderBy: "ASC" | "DESC";
  }[];
  cursor: string | null;
};
type GetPageResult = {
  postings: GetPageResultPosting[];
  lastCursor: string | null;
};

type CreateParams = { title: string; content: string; userId: string };
type UpdateParams = {
  id: string;
  userId: string;
  title: string | null | undefined;
  content: string | null | undefined;
};
type DeleteParams = { id: string; userId: string };
