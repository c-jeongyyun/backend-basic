import pg from "pg";
import { PgPool } from "infrastructures/database/pg/pgPool";

export class UserDao {
  private pool: pg.Pool;

  constructor() {
    this.pool = PgPool.getInstance();
  }

  private async selectUserById(args: { userId: string }) {
    const result = await this.pool.query<{
      id: string;
      userId: string;
      password: string;
    }>(`SELECT * FROM "users" WHERE user_id = $1`, [args.userId]);
    console.log("Getting user successfully");
    return result;
  }

  async addUser(params: AddUserParams) {
    try {
      await this.pool.query(
        `INSERT INTO "users" (user_id, password) VALUES ($1, $2)`,
        [params.userId, params.password]
      );
      console.log("User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  }

  async getUserById(params: GetUserByUserIdParams) {
    try {
      const result = await this.selectUserById({ userId: params.userId });

      if (!result || result.rowCount === 0) {
        throw new Error("User not found");
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async findUserById(params: FindUserByUserIdParams) {
    try {
      const result = await this.selectUserById({ userId: params.userId });
      return result.rowCount === 0 ? null : result.rows[0];
    } catch (error) {
      console.error("Error finding user:", error);
      throw error;
    }
  }

  async updateUser(params: UpdateUserParams) {
    try {
      await this.pool.query(
        `UPDATE "users" SET user_id = $2, password = $3 WHERE id = $1`,
        [params.id, params.userId, params.password]
      );
      console.log("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  async deleteUser(params: DeleteUserParams) {
    try {
      await this.pool.query("DELETE FROM users WHERE id = $1", [params.id]);
      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }
}

type AddUserParams = { userId: string; password: string };
type GetUserByUserIdParams = { userId: string };
type FindUserByUserIdParams = { userId: string };
type UpdateUserParams = { id: string; userId: string; password: string };
type DeleteUserParams = { id: string };
