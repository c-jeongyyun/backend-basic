import pg from "pg";
import { PgPool } from "infrastructures/pg/pgPool";

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
    }>(`SELECT * FROM "user" WHERE user_id = $1`, [args.userId]);
    console.log("Getting user successfully");
    return result;
  }

  async addUser(args: AddUserArgs) {
    try {
      await this.pool.query(
        `INSERT INTO "user" (user_id, password) VALUES ($1, $2)`,
        [args.userId, args.password]
      );
      console.log("User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  }

  async getUserById(args: GetUserByUserIdArgs) {
    try {
      const result = await this.selectUserById({ userId: args.userId });

      if (!result || result.rowCount === 0) {
        throw new Error("User not found");
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async findUserById(args: FindUserByUserIdArgs) {
    try {
      const result = await this.selectUserById({ userId: args.userId });
      return result.rowCount === 0 ? null : result.rows[0];
    } catch (error) {
      console.error("Error finding user:", error);
      throw error;
    }
  }

  async updateUser(args: UpdateUserArgs) {
    try {
      await this.pool.query(
        `UPDATE "user" SET user_id = $2, password = $3 WHERE id = $1`,
        [args.id, args.userId, args.password]
      );
      console.log("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  async deleteUser(args: DeleteUserArgs) {
    try {
      await this.pool.query("DELETE FROM user WHERE id = $1", [args.id]);
      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }
}

type AddUserArgs = { userId: string; password: string };
type GetUserByUserIdArgs = { userId: string };
type FindUserByUserIdArgs = { userId: string };
type UpdateUserArgs = { id: string; userId: string; password: string };
type DeleteUserArgs = { id: string };
