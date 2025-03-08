import pg from "pg";
import "dotenv/config";

export class PgPool {
  private static instance: pg.Pool;

  private constructor() {
    console.log("싱글톤 객체 생성됨");
  }

  static getInstance() {
    if (!PgPool.instance)
      PgPool.instance = new pg.Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: Number(process.env.PGPORT),
      });

    return PgPool.instance;
  }
}
